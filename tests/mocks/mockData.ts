import { User, LoginResponse } from "@/types/auth";
import { Course, Section, LessonDetail, Enrollment } from "@/types/course";
import {
  DashboardStats,
  StreakData,
  DailyActivity,
  ProgressSummary,
  LessonProgress,
} from "@/types/progress";

/**
 * Mock user data for testing
 */
export const mockUser: User = {
  userId: "user-123",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  bio: "Passionate learner",
  phoneNumber: "+1234567890",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  timezone: "America/New_York",
  language: "en",
  currentLevel: "B1",
  learningGoal: "Business communication",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T12:30:00.000Z",
};

export const mockUserMinimal: User = {
  userId: "user-456",
  email: "newuser@example.com",
  createdAt: "2024-11-15T00:00:00.000Z",
  updatedAt: "2024-11-15T00:00:00.000Z",
};

/**
 * Mock login response
 */
export const mockLoginResponse: LoginResponse = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  user: mockUser,
  message: "Login successful",
};

/**
 * Mock courses data
 */
export const mockCourses: Course[] = [
  {
    id: 1,
    title: "Business English Basics",
    description:
      "Learn essential business English for professional communication",
    thumbnailUrl: "https://picsum.photos/seed/course1/400/300",
    cefrLevel: "B1",
    isPublished: true,
    sectionCount: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Everyday Conversations",
    description: "Master daily English conversations",
    thumbnailUrl: "https://picsum.photos/seed/course2/400/300",
    cefrLevel: "A2",
    isPublished: true,
    sectionCount: 4,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: 3,
    title: "Advanced Grammar",
    description: "Deep dive into complex English grammar",
    thumbnailUrl: "https://picsum.photos/seed/course3/400/300",
    cefrLevel: "C1",
    isPublished: true,
    sectionCount: 5,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
];

/**
 * Mock sections data
 */
export const mockSections: Section[] = [
  {
    id: 1,
    courseId: 1,
    title: "Introduction to Business English",
    orderIndex: 1,
    lessonCount: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    courseId: 1,
    title: "Email Writing",
    orderIndex: 2,
    lessonCount: 4,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

/**
 * Mock lesson details
 */
export const mockLessons: LessonDetail[] = [
  {
    id: 1,
    sectionId: 1,
    title: "Business Vocabulary",
    lessonType: "READING",
    content: JSON.stringify({
      text: "Introduction to common business terms...",
      questions: [],
    }),
    orderIndex: 1,
    durationMinutes: 15,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    sectionId: 1,
    title: "Formal Greetings",
    lessonType: "SPEAKING",
    content: JSON.stringify({
      prompt: "Practice formal greetings...",
      examples: [],
    }),
    orderIndex: 2,
    durationMinutes: 20,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    sectionId: 1,
    title: "Business Etiquette Quiz",
    lessonType: "QUIZ",
    content: JSON.stringify({
      questions: [
        {
          id: 1,
          text: "What is the correct greeting?",
          options: ["Hi", "Hello", "Good morning"],
          correctAnswer: 2,
        },
      ],
    }),
    orderIndex: 3,
    durationMinutes: 10,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

/**
 * Mock enrollments
 */
export const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    courseId: 1,
    courseTitle: "Business English Basics",
    thumbnailUrl: "https://picsum.photos/seed/course1/400/300",
    cefrLevel: "B1",
    enrolledAt: "2024-11-01T00:00:00.000Z",
    progressPercentage: 45,
    isCompleted: false,
  },
  {
    id: 2,
    courseId: 2,
    courseTitle: "Everyday Conversations",
    thumbnailUrl: "https://picsum.photos/seed/course2/400/300",
    cefrLevel: "A2",
    enrolledAt: "2024-10-15T00:00:00.000Z",
    progressPercentage: 100,
    completedAt: "2024-11-10T00:00:00.000Z",
    isCompleted: true,
  },
];

/**
 * Mock dashboard stats
 */
export const mockDashboardStats: DashboardStats = {
  enrolledCourses: 3,
  completedLessons: 12,
  totalLessons: 25,
  currentStreak: 5,
  longestStreak: 12,
  totalStudyMinutes: 240,
  averageScore: 85,
};

/**
 * Mock streak data
 */
export const mockStreakData: StreakData = {
  currentStreak: 5,
  longestStreak: 12,
  lastActivityDate: "2024-11-15",
  isActiveToday: true,
  totalActiveDays: 45,
};

/**
 * Mock daily activities
 */
export const mockDailyActivities: DailyActivity[] = [
  { date: "2024-11-10", lessonsCompleted: 2, timeSpentMinutes: 45 },
  { date: "2024-11-11", lessonsCompleted: 3, timeSpentMinutes: 60 },
  { date: "2024-11-12", lessonsCompleted: 1, timeSpentMinutes: 20 },
  { date: "2024-11-13", lessonsCompleted: 2, timeSpentMinutes: 40 },
  { date: "2024-11-14", lessonsCompleted: 1, timeSpentMinutes: 25 },
  { date: "2024-11-15", lessonsCompleted: 2, timeSpentMinutes: 50 },
];

/**
 * Mock progress summary
 */
export const mockProgressSummary: ProgressSummary = {
  totalLessonsCompleted: 12,
  totalTimeSpentMinutes: 240,
  averageTimePerLesson: 20,
  activeDays: 6,
  dailyActivities: mockDailyActivities,
};

/**
 * Mock lesson progress
 */
export const mockLessonProgress: LessonProgress = {
  progressId: "progress-123",
  userId: "user-123",
  lessonId: "lesson-1",
  status: "COMPLETED",
  completedAt: "2024-11-15T10:30:00.000Z",
  lastAccessedAt: "2024-11-15T10:30:00.000Z",
  timeSpentMinutes: 20,
  score: 85,
  attempts: 1,
  createdAt: "2024-11-15T10:00:00.000Z",
  updatedAt: "2024-11-15T10:30:00.000Z",
};

/**
 * Mock API error responses
 */
export const mockApiErrors = {
  networkError: {
    code: "ERR_NETWORK",
    message: "Network Error",
  },
  unauthorized: {
    response: {
      status: 401,
      data: { message: "Invalid credentials" },
    },
  },
  forbidden: {
    response: {
      status: 403,
      data: { message: "Access denied" },
    },
  },
  notFound: {
    response: {
      status: 404,
      data: { message: "Resource not found" },
    },
  },
  conflict: {
    response: {
      status: 409,
      data: { message: "Email already registered" },
    },
  },
  validationError: {
    response: {
      status: 422,
      data: {
        message: "Validation failed",
        errors: {
          email: "Invalid email format",
          password: "Password too short",
        },
      },
    },
  },
  serverError: {
    response: {
      status: 500,
      data: { message: "Internal server error" },
    },
  },
  timeout: {
    code: "ECONNABORTED",
    message: "timeout of 30000ms exceeded",
  },
};

/**
 * Helper function to create a mock response
 */
export const createMockResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: "OK",
  headers: {},
  config: {} as Record<string, unknown>,
});

/**
 * Helper function to create a mock error
 */
export const createMockError = (status: number, message: string) => ({
  response: {
    status,
    data: { message },
    statusText: status === 500 ? "Internal Server Error" : "Error",
    headers: {},
    config: {} as Record<string, unknown>,
  },
  isAxiosError: true,
});
