import api from "@/lib/api";

export interface NotificationPreferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  learningEnabled: boolean;
  achievementsEnabled: boolean;
  remindersEnabled: boolean;
  systemEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  quietHoursTimezone: string;
}

/**
 * Service for managing user notification preferences
 */
export const notificationPreferencesService = {
  /**
   * Get current user's notification preferences
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get<NotificationPreferences>("/notifications/preferences");
    return response.data;
  },

  /**
   * Update current user's notification preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const response = await api.put<NotificationPreferences>(
      "/notifications/preferences",
      preferences
    );
    return response.data;
  },
};

export default notificationPreferencesService;
