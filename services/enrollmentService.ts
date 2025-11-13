import api from "@/lib/api";
import { Enrollment } from "@/types/course";

/**
 * Enrollment Service
 * API client for enrollment-related operations
 */
export const enrollmentService = {
  /**
   * Enroll in a course
   * @param courseId - Course ID to enroll in
   * @returns Enrollment details
   * @throws 409 if already enrolled
   * @throws 404 if course not found
   */
  enroll: async (courseId: number): Promise<Enrollment> => {
    const response = await api.post("/enrollments", null, {
      params: { courseId },
    });
    return response.data;
  },

  /**
   * Get all enrollments for the authenticated user
   * @returns List of enrollments
   */
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get("/enrollments");
    return response.data;
  },

  /**
   * Check if user is enrolled in a course
   * @param courseId - Course ID
   * @returns true if enrolled, false otherwise
   */
  isEnrolled: async (courseId: number): Promise<boolean> => {
    try {
      const enrollments = await enrollmentService.getMyEnrollments();
      return enrollments.some((e) => e.courseId === courseId);
    } catch (error) {
      return false;
    }
  },
};
