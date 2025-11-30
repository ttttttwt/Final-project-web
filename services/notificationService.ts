/**
 * Notification Service
 *
 * REST API client for notification endpoints.
 * @see NOTIFICATION-SPECIFICATION.md Section 4
 */

import api from "@/lib/api";
import {
  Notification,
  NotificationsPage,
  UnreadCountResponse,
  NotificationPreferences,
} from "@/types/notification";

/**
 * Notification Service
 * API client for notification-related operations
 */
export const notificationService = {
  /**
   * Get paginated list of notifications for current user
   * @param page - Page number (0-indexed)
   * @param size - Page size (default: 20)
   * @returns Paginated notification list
   */
  getNotifications: async (
    page: number = 0,
    size: number = 20,
    signal?: AbortSignal
  ): Promise<NotificationsPage> => {
    const response = await api.get("/notifications", {
      params: { page, size },
      signal,
    });
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns Unread count with high priority breakdown
   */
  getUnreadCount: async (
    signal?: AbortSignal
  ): Promise<UnreadCountResponse> => {
    const response = await api.get("/notifications/unread-count", { signal });
    return response.data;
  },

  /**
   * Get notification by ID
   * @param id - Notification ID
   * @returns Notification details
   */
  getNotificationById: async (
    id: string,
    signal?: AbortSignal
  ): Promise<Notification> => {
    const response = await api.get(`/notifications/${id}`, { signal });
    return response.data;
  },

  /**
   * Mark a single notification as read
   * @param id - Notification ID
   */
  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.put("/notifications/read-all");
  },

  /**
   * Delete a single notification
   * @param id - Notification ID
   */
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<void> => {
    await api.delete("/notifications");
  },

  /**
   * Get notification preferences for current user
   * @returns User's notification preferences
   */
  getPreferences: async (
    signal?: AbortSignal
  ): Promise<NotificationPreferences> => {
    const response = await api.get("/notifications/preferences", { signal });
    return response.data;
  },

  /**
   * Update notification preferences for current user
   * @param preferences - Updated preferences
   * @returns Updated preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const response = await api.put("/notifications/preferences", preferences);
    return response.data;
  },
};
