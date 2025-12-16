import api from "@/lib/api";
import { PaginatedResponse } from "@/types/common";
import {
  GrammarRequestDTO,
  GrammarExerciseSetDTO,
  GrammarAnswerDTO,
  GrammarResultDTO,
  GrammarTopicDTO,
  GrammarProgressDTO,
  GrammarStatsDTO,
} from "@/types/ai";

const BASE_URL = "/ai/grammar";

export const aiGrammarService = {
  /**
   * Generate grammar exercises using AI.
   */
  generateExercises: async (
    data: GrammarRequestDTO
  ): Promise<GrammarExerciseSetDTO> => {
    const response = await api.post<GrammarExerciseSetDTO>(
      `${BASE_URL}/generate`,
      data
    );
    return response.data;
  },

  /**
   * Get an exercise set by ID.
   */
  getExerciseSet: async (id: string): Promise<GrammarExerciseSetDTO> => {
    const response = await api.get<GrammarExerciseSetDTO>(
      `${BASE_URL}/exercises/${id}`
    );
    return response.data;
  },

  /**
   * Get all grammar topics.
   */
  getTopics: async (): Promise<GrammarTopicDTO[]> => {
    const response = await api.get<GrammarTopicDTO[]>(`${BASE_URL}/topics`);
    return response.data;
  },

  /**
   * Get grammar topics by CEFR level.
   */
  getTopicsByLevel: async (level: string): Promise<GrammarTopicDTO[]> => {
    const response = await api.get<GrammarTopicDTO[]>(
      `${BASE_URL}/topics/level/${level}`
    );
    return response.data;
  },

  /**
   * Get grammar topics by category.
   */
  getTopicsByCategory: async (category: string): Promise<GrammarTopicDTO[]> => {
    const response = await api.get<GrammarTopicDTO[]>(
      `${BASE_URL}/topics/category/${category}`
    );
    return response.data;
  },

  /**
   * Get all topic categories.
   */
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>(`${BASE_URL}/categories`);
    return response.data;
  },

  /**
   * Submit answers for a grammar exercise set.
   */
  submitAnswers: async (
    exerciseSetId: string,
    data: GrammarAnswerDTO
  ): Promise<GrammarResultDTO> => {
    const response = await api.post<GrammarResultDTO>(
      `${BASE_URL}/exercises/${exerciseSetId}/submit`,
      data
    );
    return response.data;
  },

  /**
   * Check if user has already submitted for an exercise set.
   */
  hasSubmitted: async (exerciseSetId: string): Promise<boolean> => {
    const response = await api.get<boolean>(
      `${BASE_URL}/exercises/${exerciseSetId}/submitted`
    );
    return response.data;
  },

  /**
   * Get progress for a specific exercise set.
   */
  getProgress: async (exerciseSetId: string): Promise<GrammarProgressDTO | null> => {
    try {
      const response = await api.get<GrammarProgressDTO>(
        `${BASE_URL}/exercises/${exerciseSetId}/progress`
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Get history of grammar exercises.
   */
  getHistory: async (
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<GrammarProgressDTO>> => {
    const response = await api.get<PaginatedResponse<GrammarProgressDTO>>(
      `${BASE_URL}/history`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get user grammar statistics.
   */
  getStats: async (): Promise<GrammarStatsDTO> => {
    const response = await api.get<GrammarStatsDTO>(`${BASE_URL}/stats`);
    return response.data;
  },

  /**
   * Get fallback exercises for a topic and level.
   */
  getFallbackExercises: async (
    topic: string,
    level: string
  ): Promise<GrammarExerciseSetDTO | null> => {
    try {
      const response = await api.get<GrammarExerciseSetDTO>(
        `${BASE_URL}/fallback`,
        {
          params: { topic, level },
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },
};
