import api from "@/lib/api";
import { Course, Section, LessonDetail } from "@/types/course";

/**
 * Course API Response Types
 */
export interface PaginatedCoursesResponse {
  content: Course[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
}

export interface CourseSearchParams {
  title?: string;
  cefrLevel?: string;
  isPublished?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Course Service
 * API client for course-related operations
 */
export const courseService = {
  /**
   * Get paginated list of published courses
   * @param page - Page number (0-indexed)
   * @param size - Page size (default: 12)
   * @param sort - Sort criteria (default: createdAt,desc)
   * @returns Paginated course list
   */
  getCourses: async (
    page: number = 0,
    size: number = 12,
    sort: string = "createdAt,desc",
    signal?: AbortSignal
  ): Promise<PaginatedCoursesResponse> => {
    const response = await api.get("/courses", {
      params: { page, size, sort },
      signal,
    });
    return response.data;
  },

  /**
   * Get course by ID
   * @param id - Course ID
   * @returns Course details
   */
  getCourseById: async (id: string): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * Get course by ID with sections and lessons
   * @param id - Course ID
   * @returns Course details with sections and lessons
   */
  getCourseWithSections: async (
    id: string,
    signal?: AbortSignal
  ): Promise<Course> => {
    const response = await api.get(`/courses/${id}`, { signal });
    const course = response.data;

    // Fetch lessons for the course
    const lessonsResponse = await api.get(`/lessons/courses/${id}`, { signal });
    const lessons: LessonDetail[] = lessonsResponse.data;

    // Group lessons by section
    const sectionMap = new Map<number, LessonDetail[]>();
    lessons.forEach((lesson) => {
      if (!sectionMap.has(lesson.sectionId)) {
        sectionMap.set(lesson.sectionId, []);
      }
      sectionMap.get(lesson.sectionId)!.push(lesson);
    });

    // Create sections with lessons
    const sections: Section[] = Array.from(sectionMap.entries())
      .map(([sectionId, sectionLessons]) => ({
        id: sectionId,
        courseId: course.id,
        title: `Section ${sectionId}`, // Placeholder
        orderIndex: Math.min(...sectionLessons.map((l) => l.orderIndex)),
        lessonCount: sectionLessons.length,
        createdAt: sectionLessons[0]?.createdAt || "",
        lessons: sectionLessons.sort((a, b) => a.orderIndex - b.orderIndex),
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return {
      ...course,
      sections,
    };
  },

  /**
   * Search courses with filters
   * @param params - Search parameters (title, cefrLevel, etc.)
   * @returns Paginated search results
   */
  searchCourses: async (
    params: CourseSearchParams,
    signal?: AbortSignal
  ): Promise<PaginatedCoursesResponse> => {
    const response = await api.get("/courses/search", {
      params: {
        ...params,
        isPublished: true, // Only show published courses to learners
      },
      signal,
    });
    return response.data;
  },
};
