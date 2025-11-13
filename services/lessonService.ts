/**
 * Lesson Service
 * API client for lesson operations
 *
 * Endpoints:
 * - GET /api/v1/lessons/{id} - Get lesson by ID
 * - GET /api/v1/lessons/sections/{sectionId} - Get lessons by section
 * - GET /api/v1/lessons/courses/{courseId} - Get lessons by course
 */

import api from "@/lib/api";
import { Lesson } from "@/types/lesson";

/**
 * Get lesson by ID with JSONB content
 * @param id Lesson ID
 * @returns Lesson details with JSONB content string
 */
export async function getLessonById(id: number): Promise<Lesson> {
  const response = await api.get<Lesson>(`/lessons/${id}`);
  return response.data;
}

/**
 * Get all lessons for a specific section
 * @param sectionId Section ID
 * @returns List of lessons in the section
 */
export async function getLessonsBySectionId(
  sectionId: number
): Promise<Lesson[]> {
  const response = await api.get<Lesson[]>(`/lessons/sections/${sectionId}`);
  return response.data;
}

/**
 * Get all lessons for a specific course (across all sections)
 * @param courseId Course ID
 * @returns List of all lessons in the course
 */
export async function getLessonsByCourseId(
  courseId: number
): Promise<Lesson[]> {
  const response = await api.get<Lesson[]>(`/lessons/courses/${courseId}`);
  return response.data;
}

const lessonService = {
  getLessonById,
  getLessonsBySectionId,
  getLessonsByCourseId,
};

export default lessonService;
