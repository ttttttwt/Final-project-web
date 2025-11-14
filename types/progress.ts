export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
  totalActiveDays: number;
}

export interface DashboardStats {
  enrolledCourses: number;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Daily progress activity data for charts
 */
export interface DailyActivity {
  date: string; // YYYY-MM-DD
  lessonsCompleted: number;
  timeSpentMinutes: number;
}

/**
 * Progress summary for a time period
 */
export interface ProgressSummary {
  totalLessonsCompleted: number;
  totalTimeSpentMinutes: number;
  averageTimePerLesson: number;
  activeDays: number;
  dailyActivities: DailyActivity[];
}
export interface LessonProgress {
  progressId: string;
  userId: string;
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt?: string;
  lastAccessedAt: string;
  timeSpentMinutes: number;
  score?: number;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpentMinutes: number;
  averageScore?: number;
  progressPercentage: number;
}

export interface LearningPath {
  pathId: string;
  name: string;
  description: string;
  level: string;
  orderIndex: number;
  isActive: boolean;
  courses: string[]; // courseIds
  createdAt: string;
  updatedAt: string;
}
