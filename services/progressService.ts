import api from "@/lib/api";
import type {
  DashboardStats,
  StreakData,
  DailyActivity,
  ProgressSummary,
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

  /**
   * Get progress summary for last N days
   * Generates mock data for now since backend doesn't have historical data endpoint
   * @param days Number of days to fetch (default: 30)
   */
  async getProgressSummary(
    days: number = 30,
    signal?: AbortSignal
  ): Promise<ProgressSummary> {
    // TODO: Replace with actual backend endpoint when available
    // For now, generate mock data based on streak information
    const streakData = await this.getStreak(signal);

    // Generate mock daily activities for the chart
    const dailyActivities: DailyActivity[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Generate realistic mock data
      // More activity on recent days if streak is active
      const isRecentDay = i < 7;
      const lessonsCompleted =
        streakData.isActiveToday && isRecentDay
          ? Math.floor(Math.random() * 3) + 1
          : Math.random() > 0.7
          ? Math.floor(Math.random() * 2) + 1
          : 0;

      const timeSpentMinutes =
        lessonsCompleted > 0 ? lessonsCompleted * (15 + Math.random() * 30) : 0;

      dailyActivities.push({
        date: dateStr,
        lessonsCompleted,
        timeSpentMinutes: Math.round(timeSpentMinutes),
      });
    }

    const totalLessonsCompleted = dailyActivities.reduce(
      (sum, day) => sum + day.lessonsCompleted,
      0
    );
    const totalTimeSpentMinutes = dailyActivities.reduce(
      (sum, day) => sum + day.timeSpentMinutes,
      0
    );
    const activeDays = dailyActivities.filter(
      (day) => day.lessonsCompleted > 0
    ).length;

    return {
      totalLessonsCompleted,
      totalTimeSpentMinutes,
      averageTimePerLesson:
        totalLessonsCompleted > 0
          ? Math.round(totalTimeSpentMinutes / totalLessonsCompleted)
          : 0,
      activeDays,
      dailyActivities,
    };
  },
};

export default progressService;
