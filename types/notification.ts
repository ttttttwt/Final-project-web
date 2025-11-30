/**
 * Notification Types for LEXIA
 *
 * TypeScript type definitions matching backend DTOs for the notification system.
 * @see NOTIFICATION-SPECIFICATION.md
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Notification type categories
 */
export type NotificationType =
  | "COURSE_PUBLISHED"
  | "LESSON_ADDED"
  | "ENROLLMENT_CONFIRMED"
  | "LESSON_COMPLETED"
  | "COURSE_COMPLETED"
  | "ACHIEVEMENT_UNLOCKED"
  | "STREAK_REMINDER"
  | "STREAK_LOST"
  | "STREAK_MILESTONE"
  | "LEVEL_UP"
  | "SYSTEM_ANNOUNCEMENT"
  | "MAINTENANCE_NOTICE";

/**
 * Notification priority levels
 */
export type NotificationPriority = "HIGH" | "NORMAL" | "LOW";

/**
 * Notification category for grouping
 */
export type NotificationCategory =
  | "LEARNING"
  | "ACHIEVEMENT"
  | "ENGAGEMENT"
  | "SYSTEM";

// ============================================================================
// Data Payload Types (for notification.data JSONB field)
// ============================================================================

/**
 * Payload for COURSE_PUBLISHED, ENROLLMENT_CONFIRMED
 */
export interface CourseNotificationData {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  cefrLevel?: string;
}

/**
 * Payload for LESSON_ADDED, LESSON_COMPLETED
 */
export interface LessonNotificationData {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  sectionTitle?: string;
}

/**
 * Payload for COURSE_COMPLETED
 */
export interface CourseCompletedData {
  courseId: string;
  courseTitle: string;
  completionTime: number;
  certificateUrl?: string;
}

/**
 * Payload for ACHIEVEMENT_UNLOCKED
 */
export interface AchievementNotificationData {
  achievementId: string;
  achievementName: string;
  achievementIcon: string;
  description: string;
}

/**
 * Payload for STREAK_MILESTONE, STREAK_LOST
 */
export interface StreakNotificationData {
  streakDays: number;
  milestone?: string;
  reward?: string;
}

/**
 * Payload for LEVEL_UP
 */
export interface LevelUpNotificationData {
  previousLevel: string;
  newLevel: string;
}

/**
 * Union type for all notification data payloads
 */
export type NotificationData =
  | CourseNotificationData
  | LessonNotificationData
  | CourseCompletedData
  | AchievementNotificationData
  | StreakNotificationData
  | LevelUpNotificationData
  | Record<string, unknown>;

// ============================================================================
// Main Notification Types
// ============================================================================

/**
 * Notification DTO - matches backend NotificationDTO
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

/**
 * Unread count response - matches backend UnreadCountDTO
 */
export interface UnreadCountResponse {
  unreadCount: number;
  highPriorityCount: number;
}

/**
 * Notification preferences - matches backend NotificationPreferencesDTO
 */
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

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Paginated notifications response
 */
export type NotificationsPage = Page<Notification>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get category from notification type
 */
export function getNotificationCategory(
  type: NotificationType
): NotificationCategory {
  switch (type) {
    case "COURSE_PUBLISHED":
    case "LESSON_ADDED":
    case "ENROLLMENT_CONFIRMED":
      return "LEARNING";
    case "LESSON_COMPLETED":
    case "COURSE_COMPLETED":
    case "ACHIEVEMENT_UNLOCKED":
    case "STREAK_MILESTONE":
    case "LEVEL_UP":
      return "ACHIEVEMENT";
    case "STREAK_REMINDER":
    case "STREAK_LOST":
      return "ENGAGEMENT";
    case "SYSTEM_ANNOUNCEMENT":
    case "MAINTENANCE_NOTICE":
      return "SYSTEM";
    default:
      return "SYSTEM";
  }
}

/**
 * Get icon for notification type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "COURSE_PUBLISHED":
      return "📚";
    case "LESSON_ADDED":
      return "📝";
    case "ENROLLMENT_CONFIRMED":
      return "✅";
    case "LESSON_COMPLETED":
      return "✔️";
    case "COURSE_COMPLETED":
      return "🎉";
    case "ACHIEVEMENT_UNLOCKED":
      return "🏆";
    case "STREAK_REMINDER":
      return "🔥";
    case "STREAK_LOST":
      return "💔";
    case "STREAK_MILESTONE":
      return "⭐";
    case "LEVEL_UP":
      return "📈";
    case "SYSTEM_ANNOUNCEMENT":
      return "📢";
    case "MAINTENANCE_NOTICE":
      return "🔧";
    default:
      return "🔔";
  }
}

/**
 * Check if notification is high priority
 */
export function isHighPriority(notification: Notification): boolean {
  return notification.priority === "HIGH";
}

/**
 * Format notification time relative to now
 */
export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return created.toLocaleDateString();
}
