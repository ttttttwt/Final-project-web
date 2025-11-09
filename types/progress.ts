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
