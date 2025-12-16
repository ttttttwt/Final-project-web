import api from "@/lib/api";
import { PaginatedResponse } from "@/types/common";
import {
  GrammarRequestDTO,
  GrammarExerciseSetDTO,
  GrammarAnswerDTO,
  GrammarResultDTO,
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
   * Submit answers for a grammar exercise set.
   */
  submitAnswers: async (
    data: GrammarAnswerDTO
  ): Promise<GrammarResultDTO> => {
    const response = await api.post<GrammarResultDTO>(
      `${BASE_URL}/submit`,
      data
    );
    return response.data;
  },

  /**
   * Get history of grammar exercises.
   */
  getHistory: async (
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<GrammarResultDTO>> => {
    const response = await api.get<PaginatedResponse<GrammarResultDTO>>(
      `${BASE_URL}/history`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },
};
