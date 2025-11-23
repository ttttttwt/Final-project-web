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
  totalStudyMinutes: number;
  averageScore: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  isCompleted: boolean;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  link: string;
  score: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "COURSE" | "LESSON" | "TIP" | "CHALLENGE";
  link?: string;
  reason: string;
  imageUrl?: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  weeklyGoals: Goal[];
  recentActivities: Activity[];
  recommendations: Recommendation[];
}

export interface DailyActivity {
  date: string;
  lessonsCompleted: number;
  timeSpentMinutes: number;
}

export interface ProgressSummary {
  totalLessonsCompleted: number;
  totalTimeSpentMinutes: number;
  averageTimePerLesson: number;
  activeDays: number;
  dailyActivities: DailyActivity[];
}
