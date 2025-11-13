/**
 * Learning Path Type Definitions
 * Matches backend DTOs from LearningPathDTO.java and UserPathProgressDTO.java
 */

/**
 * CEFR levels supported by the platform
 */
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/**
 * Course information within a learning path
 */
export interface LearningPathCourse {
  courseId: number;
  courseTitle: string;
  courseThumbnailUrl?: string;
  courseCefrLevel: CEFRLevel;
  orderIndex: number;
  sectionCount: number;
}

/**
 * Learning path with associated courses
 */
export interface LearningPath {
  id: number;
  name: string;
  description?: string;
  cefrLevel: CEFRLevel;
  isDefault: boolean;
  courses: LearningPathCourse[];
  totalCourses: number;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * User's progress in a learning path
 */
export interface UserPathProgress {
  enrollmentId: number;
  pathId: number;
  pathName: string;
  pathCefrLevel: CEFRLevel;
  currentCourseId?: number;
  currentCourseTitle?: string;
  coursesCompleted: number;
  totalCourses: number;
  progressPercentage: number;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

/**
 * CEFR level metadata for UI display
 */
export interface CEFRLevelInfo {
  level: CEFRLevel;
  label: string;
  description: string;
  color: string;
}

/**
 * CEFR level configuration for badges and display
 */
export const CEFR_LEVELS: Record<CEFRLevel, CEFRLevelInfo> = {
  A1: {
    level: "A1",
    label: "Beginner",
    description: "Basic English fundamentals",
    color: "bg-green-500",
  },
  A2: {
    level: "A2",
    label: "Elementary",
    description: "Simple everyday conversations",
    color: "bg-blue-500",
  },
  B1: {
    level: "B1",
    label: "Intermediate",
    description: "Professional workplace English",
    color: "bg-yellow-500",
  },
  B2: {
    level: "B2",
    label: "Upper Intermediate",
    description: "Complex professional discussions",
    color: "bg-orange-500",
  },
  C1: {
    level: "C1",
    label: "Advanced",
    description: "Fluent professional communication",
    color: "bg-purple-500",
  },
  C2: {
    level: "C2",
    label: "Proficiency",
    description: "Native-like mastery",
    color: "bg-red-500",
  },
};
