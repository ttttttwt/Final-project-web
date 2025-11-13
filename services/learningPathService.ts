/**
 * Learning Path Service
 * API client for learning path operations
 *
 * Endpoints:
 * - GET /api/v1/learning-paths - Get all paths
 * - GET /api/v1/learning-paths/{id} - Get path by ID
 * - GET /api/v1/learning-paths/recommend - Get recommended path
 * - POST /api/v1/learning-paths/{id}/start - Start a path
 * - GET /api/v1/learning-paths/my-progress - Get user progress
 */

import api from "@/lib/api";
import { LearningPath, UserPathProgress } from "@/types/learningPath";

/**
 * Get all available learning paths
 * @returns List of all learning paths with courses
 */
export async function getAllPaths(): Promise<LearningPath[]> {
  const response = await api.get<LearningPath[]>("/learning-paths");
  return response.data;
}

/**
 * Get a specific learning path by ID
 * @param id Learning path ID
 * @returns Learning path details with courses
 */
export async function getPathById(id: number): Promise<LearningPath> {
  const response = await api.get<LearningPath>(`/learning-paths/${id}`);
  return response.data;
}

/**
 * Get recommended learning path for current user
 * Based on user's CEFR level, defaults to A1 if not set
 * @returns Recommended learning path
 */
export async function getRecommended(): Promise<LearningPath> {
  const response = await api.get<LearningPath>("/learning-paths/recommend");
  return response.data;
}

/**
 * Start a learning path (enroll user)
 * @param pathId Learning path ID to start
 * @returns User's progress in the newly started path
 * @throws 409 if user has already started this path
 */
export async function startPath(pathId: number): Promise<UserPathProgress> {
  const response = await api.post<UserPathProgress>(
    `/learning-paths/${pathId}/start`
  );
  return response.data;
}

/**
 * Get current user's learning path progress
 * Returns all paths the user has started
 * @returns List of user's path enrollments with progress
 */
export async function getMyProgress(): Promise<UserPathProgress[]> {
  const response = await api.get<UserPathProgress[]>(
    "/learning-paths/my-progress"
  );
  return response.data;
}

/**
 * Check if user has started a specific learning path
 * @param pathId Learning path ID to check
 * @returns True if user has started this path
 */
export async function hasStartedPath(pathId: number): Promise<boolean> {
  try {
    const progress = await getMyProgress();
    return progress.some((p) => p.pathId === pathId);
  } catch (error) {
    console.error("Error checking path enrollment:", error);
    return false;
  }
}

const learningPathService = {
  getAllPaths,
  getPathById,
  getRecommended,
  startPath,
  getMyProgress,
  hasStartedPath,
};

export default learningPathService;
