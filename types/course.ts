export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  cefrLevel: string;
  isPublished: boolean;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
  sections?: Section[]; // Included when fetching with sections
  // Legacy fields for backward compatibility
  courseId?: string;
  level?: string;
  durationMinutes?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Section {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  lessonCount: number;
  createdAt: string;
  lessons?: LessonDetail[]; // Populated when fetching lessons for section
}

export interface LessonDetail {
  id: number;
  sectionId: number;
  title: string;
  lessonType: "READING" | "LISTENING" | "QUIZ" | "SPEAKING";
  content: string; // JSONB content as string
  orderIndex: number;
  durationMinutes: number;
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
  id: number;
  courseId: number;
  courseTitle: string;
  thumbnailUrl?: string;
  cefrLevel: string;
  enrolledAt: string;
  progressPercentage: number;
  completedAt?: string | null;
  isCompleted: boolean;
}
