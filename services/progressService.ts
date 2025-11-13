import api from "@/lib/api";
import type { DashboardStats, StreakData } from "@/types/progress";

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
   * Get dashboard statistics for the authenticated user
   * Aggregates data from enrollments and progress
   */
  async getDashboardStats(signal?: AbortSignal): Promise<DashboardStats> {
    // This endpoint doesn't exist yet in backend, so we'll aggregate from available APIs
    const [enrollmentsResponse, streakResponse] = await Promise.all([
      api.get("/enrollments", { signal }),
      api.get<StreakData>("/progress/streak", { signal }),
    ]);

    const enrollments = enrollmentsResponse.data as Array<{
      progressPercentage: number;
      isCompleted: boolean;
    }>;

    // Calculate stats from enrollments
    const enrolledCourses = enrollments.length;
    const completedLessons = enrollments.reduce((total, enrollment) => {
      // Estimate completed lessons (we don't have exact data without fetching each course progress)
      // For now, use a rough estimate based on progress percentage
      // Average course has ~18 lessons (from backend data)
      const estimatedLessons = Math.round(
        (enrollment.progressPercentage / 100) * 18
      );
      return total + estimatedLessons;
    }, 0);

    // Estimate total lessons (18 lessons per course average)
    const totalLessons = enrolledCourses * 18;

    return {
      enrolledCourses,
      completedLessons,
      totalLessons,
      currentStreak: streakResponse.data.currentStreak,
      longestStreak: streakResponse.data.longestStreak,
    };
  },
};

export default progressService;
