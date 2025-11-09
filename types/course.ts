export interface Course {
  courseId: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  lessonId: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  durationMinutes: number;
  lessonType: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  enrollmentId: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  progressPercentage: number;
}
