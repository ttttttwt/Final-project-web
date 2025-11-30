/**
 * WebSocket Client for LEXIA Notifications
 *
 * Singleton STOMP client for real-time notification delivery.
 * @see NOTIFICATION-SPECIFICATION.md Section 5
 */

import { Client, IFrame, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "./tokenStorage";
import { Notification } from "@/types/notification";

// WebSocket endpoint (use environment variable or fallback)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8088";

// Reconnection settings with exponential backoff
const INITIAL_RECONNECT_DELAY = 1000; // 1 second initial delay
const MAX_RECONNECT_DELAY = 30000; // 30 seconds max delay
const HEARTBEAT_INCOMING = 4000;
const HEARTBEAT_OUTGOING = 4000;

/**
 * Calculate reconnect delay with exponential backoff and jitter.
 * This prevents the "thundering herd" problem when server restarts.
 *
 * @param attempt - Current reconnection attempt number
 * @returns Delay in milliseconds with random jitter (±10%)
 */
function calculateReconnectDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped)
  const baseDelay = Math.min(
    INITIAL_RECONNECT_DELAY * Math.pow(2, attempt),
    MAX_RECONNECT_DELAY
  );

  // Add jitter (±10%) to prevent synchronized reconnections
  const jitter = baseDelay * 0.1 * (Math.random() * 2 - 1);
  return Math.round(baseDelay + jitter);
}

/**
 * Callback types for WebSocket events
 */
export type NotificationCallback = (notification: Notification) => void;
export type AnnouncementCallback = (notification: Notification) => void;
export type ConnectionCallback = () => void;
export type ErrorCallback = (error: IFrame) => void;

/**
 * WebSocket client configuration
 */
export interface WebSocketConfig {
  onNotification?: NotificationCallback;
  onAnnouncement?: AnnouncementCallback;
  onConnect?: ConnectionCallback;
  onDisconnect?: ConnectionCallback;
  onError?: ErrorCallback;
}

/**
 * WebSocket Client Class
 *
 * Manages STOMP connection and subscriptions for real-time notifications.
 * Uses exponential backoff with jitter for reconnection to prevent thundering herd.
 */
class WebSocketClient {
  private client: Client | null = null;
  private config: WebSocketConfig = {};
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnecting = false;
  private reconnectAttempt = 0;

  /**
   * Configure the WebSocket client with callbacks
   */
  configure(config: WebSocketConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Prevent multiple simultaneous connection attempts
      if (this.isConnecting) {
        resolve();
        return;
      }

      // Already connected
      if (this.client?.connected) {
        resolve();
        return;
      }

      const token = getAccessToken();
      if (!token) {
        reject(new Error("No access token available for WebSocket connection"));
        return;
      }

      this.isConnecting = true;

      // Calculate reconnect delay with jitter for this attempt
      const reconnectDelay = calculateReconnectDelay(this.reconnectAttempt);

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: reconnectDelay,
        heartbeatIncoming: HEARTBEAT_INCOMING,
        heartbeatOutgoing: HEARTBEAT_OUTGOING,

        onConnect: () => {
          this.isConnecting = false;
          this.reconnectAttempt = 0; // Reset on successful connection
          console.log("[WebSocket] Connected to notification server");

          // Subscribe to personal notifications queue
          this.subscribeToPersonalQueue();

          // Subscribe to broadcast announcements
          this.subscribeToAnnouncements();

          // Call user callback
          this.config.onConnect?.();
          resolve();
        },

        onDisconnect: () => {
          this.isConnecting = false;
          this.reconnectAttempt++; // Increment for next reconnection
          console.log(
            `[WebSocket] Disconnected. Next reconnect in ~${calculateReconnectDelay(
              this.reconnectAttempt
            )}ms`
          );
          this.config.onDisconnect?.();
        },

        onStompError: (frame: IFrame) => {
          this.isConnecting = false;
          this.reconnectAttempt++;
          console.error("[WebSocket] STOMP error:", frame.headers["message"]);
          this.config.onError?.(frame);
          reject(
            new Error(frame.headers["message"] || "WebSocket connection error")
          );
        },

        onWebSocketError: (event) => {
          this.isConnecting = false;
          this.reconnectAttempt++;
          console.error("[WebSocket] Connection error:", event);
        },
      });

      this.client.activate();
    });
  }

  /**
   * Subscribe to personal notifications queue
   * @private
   */
  private subscribeToPersonalQueue(): void {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe(
      "/user/queue/notifications",
      (message: IMessage) => {
        try {
          const notification: Notification = JSON.parse(message.body);
          console.log("[WebSocket] Received notification:", notification.type);
          this.config.onNotification?.(notification);
        } catch (error) {
          console.error("[WebSocket] Failed to parse notification:", error);
        }
      }
    );

    this.subscriptions.set("personal", subscription);
  }

  /**
   * Subscribe to broadcast announcements topic
   * @private
   */
  private subscribeToAnnouncements(): void {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe(
      "/topic/announcements",
      (message: IMessage) => {
        try {
          const announcement: Notification = JSON.parse(message.body);
          console.log("[WebSocket] Received announcement:", announcement.type);
          this.config.onAnnouncement?.(announcement);
        } catch (error) {
          console.error("[WebSocket] Failed to parse announcement:", error);
        }
      }
    );

    this.subscriptions.set("announcements", subscription);
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    // Unsubscribe from all topics
    this.subscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn("[WebSocket] Error unsubscribing:", error);
      }
    });
    this.subscriptions.clear();

    // Deactivate the client
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.isConnecting = false;
    this.reconnectAttempt = 0; // Reset reconnect counter on manual disconnect
    console.log("[WebSocket] Client disconnected");
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * Reconnect with new token (after token refresh)
   * Resets reconnect counter for immediate connection
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    this.reconnectAttempt = 0; // Reset for immediate reconnection
    await this.connect();
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();

// Export class for testing purposes
export { WebSocketClient };
