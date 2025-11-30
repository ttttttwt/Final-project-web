/**
 * Notification Store
 *
 * Zustand store for managing notification state and WebSocket connection.
 * @see NOTIFICATION-SPECIFICATION.md Section 7.1
 */

import { create } from "zustand";
import { Notification, UnreadCountResponse } from "@/types/notification";
import { notificationService } from "@/services/notificationService";
import { wsClient } from "@/lib/websocket";
import { toast } from "sonner";

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  highPriorityCount: number;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;

  // Actions
  fetchNotifications: (page?: number, append?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  setConnected: (connected: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  highPriorityCount: 0,
  isLoading: false,
  isConnected: false,
  error: null,
  hasMore: true,
  currentPage: 0,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...initialState,

  /**
   * Fetch notifications from API
   * @param page - Page number (default: 0)
   * @param append - Whether to append to existing list (for infinite scroll)
   */
  fetchNotifications: async (page = 0, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationService.getNotifications(page, 20);
      set({
        notifications: append
          ? [...get().notifications, ...response.content]
          : response.content,
        hasMore: !response.last,
        currentPage: response.pageable.pageNumber,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications";
      set({ error: message, isLoading: false });
    }
  },

  /**
   * Fetch unread notification count
   */
  fetchUnreadCount: async () => {
    try {
      const response: UnreadCountResponse =
        await notificationService.getUnreadCount();
      set({
        unreadCount: response.unreadCount,
        highPriorityCount: response.highPriorityCount,
      });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to mark as read";
      set({ error: message });
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
        highPriorityCount: 0,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to mark all as read";
      set({ error: message });
    }
  },

  /**
   * Delete a single notification
   */
  deleteNotification: async (id: string) => {
    const notification = get().notifications.find((n) => n.id === id);
    try {
      await notificationService.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount:
          notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete notification";
      set({ error: message });
    }
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async () => {
    try {
      await notificationService.deleteAllRead();
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.isRead),
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete read notifications";
      set({ error: message });
    }
  },

  /**
   * Add a new notification (from WebSocket)
   */
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      highPriorityCount:
        notification.priority === "HIGH"
          ? state.highPriorityCount + 1
          : state.highPriorityCount,
    }));

    // Show toast for high priority notifications
    if (notification.priority === "HIGH") {
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    }
  },

  /**
   * Connect to WebSocket for real-time notifications
   */
  connectWebSocket: async () => {
    try {
      wsClient.configure({
        onNotification: (notification) => {
          get().addNotification(notification);
        },
        onAnnouncement: (announcement) => {
          get().addNotification(announcement);
        },
        onConnect: () => {
          set({ isConnected: true });
          console.log("[NotificationStore] WebSocket connected");
        },
        onDisconnect: () => {
          set({ isConnected: false });
          console.log("[NotificationStore] WebSocket disconnected");
        },
        onError: (error) => {
          set({ isConnected: false });
          console.error("[NotificationStore] WebSocket error:", error);
        },
      });

      await wsClient.connect();
    } catch (error) {
      console.error("[NotificationStore] Failed to connect WebSocket:", error);
      set({ isConnected: false });
    }
  },

  /**
   * Disconnect from WebSocket
   */
  disconnectWebSocket: () => {
    wsClient.disconnect();
    set({ isConnected: false });
  },

  /**
   * Set connection status
   */
  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    wsClient.disconnect();
    set(initialState);
  },
}));
