import api from "@/lib/api";
import type {
  DashboardStats,
  StreakData,
  DailyActivity,
  ProgressSummary,
  DashboardOverview,
} from "@/types/progress";

/**
 * Lesson completion request
 */
export interface CompleteLessonRequest {
  resultDetailsJson?: string; // Optional JSONB string with quiz results, etc.
}

/**
 * Lesson progress response from backend
 */
export interface LessonProgressDTO {
  id: number;
  lessonId: number;
  userId: number;
  isCompleted: boolean;
  score?: number;
  completedAt: string;
  resultDetails?: string;
}

export interface LessonProgressSummary {
  lessonId: number;
  lessonTitle: string;
  lessonType: string;
  sectionTitle: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  score?: number;
  attempts: number;
}

export interface CourseProgressDTO {
  courseId: number;
  courseTitle: string;
  cefrLevel: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessonProgress: LessonProgressSummary[];
}

/**
 * Progress Service
 *
 * Handles progress tracking, streak data, and dashboard statistics
 */
const progressService = {
  /**
   * Get user's learning streak information
   */
  async getStreak(signal?: AbortSignal): Promise<StreakData> {
    const response = await api.get<StreakData>("/progress/streak", { signal });
    return response.data;
  },

  /**
   * Mark a lesson as completed
   * @param lessonId Lesson ID to complete
   * @param resultDetailsJson Optional JSON string with results (quiz scores, etc.)
   * @returns Lesson progress details
   */
  async completeLesson(
    lessonId: number,
    resultDetailsJson?: string
  ): Promise<LessonProgressDTO> {
    const response = await api.post<LessonProgressDTO>(
      `/progress/lessons/${lessonId}/complete`,
      { resultDetailsJson: resultDetailsJson || "{}" }
    );
    return response.data;
  },

  /**
   * Get course progress for the authenticated user
   * @param courseId Course ID
   * @returns Course progress details
   */
  async getCourseProgress(
    courseId: number,
    signal?: AbortSignal
  ): Promise<CourseProgressDTO> {
    const response = await api.get<CourseProgressDTO>(
      `/progress/courses/${courseId}/lessons`,
      { signal }
    );
    return response.data;
  },

  /**
   * Get dashboard statistics for the authenticated user
   * Aggregates data from enrollments and progress
   */
  /**
   * Get dashboard overview for the authenticated user
   * Fetches aggregated data from backend
   */
  async getDashboardOverview(signal?: AbortSignal): Promise<DashboardOverview> {
    const response = await api.get<DashboardOverview>("/progress/dashboard", { signal });
    return response.data;
  },

  /**
   * @deprecated Use getDashboardOverview instead
   */
  async getDashboardStats(signal?: AbortSignal): Promise<DashboardStats> {
    const overview = await this.getDashboardOverview(signal);
    return overview.stats;
  },

  /**
   * Get progress summary for last N days
   * Generates mock data for now since backend doesn't have historical data endpoint
   * @param days Number of days to fetch (default: 30)
   */
  async getProgressSummary(
    days: number = 30,
    signal?: AbortSignal
  ): Promise<ProgressSummary> {
    const response = await api.get<ProgressSummary>("/progress/summary", {
      params: { days },
      signal,
    });
    return response.data;
  },
};

export default progressService;
