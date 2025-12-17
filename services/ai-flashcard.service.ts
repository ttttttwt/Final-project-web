import api from "@/lib/api";
import { PaginatedResponse } from "@/types/common";
import {
  GenerateFlashcardsDTO,
  GenerateFlashcardsByTopicDTO,
  FlashcardDeckDTO,
  CreateFlashcardDeckDTO,
  UpdateFlashcardDeckDTO,
  FlashcardStudySessionDTO,
  FlashcardReviewResultDTO,
  DueCountResponse,
  LessonDeckCheckResponse,
} from "@/types/ai";

const BASE_URL = "/ai/flashcards";

export const aiFlashcardService = {
  /**
   * Generate flashcards from lesson content using AI.
   */
  generateFlashcards: async (
    data: GenerateFlashcardsDTO
  ): Promise<FlashcardDeckDTO> => {
    const response = await api.post<FlashcardDeckDTO>(
      `${BASE_URL}/generate`,
      data
    );
    return response.data;
  },

  /**
   * Generate flashcards from a topic using AI.
   */
  generateFlashcardsByTopic: async (
    data: GenerateFlashcardsByTopicDTO
  ): Promise<FlashcardDeckDTO> => {
    const response = await api.post<FlashcardDeckDTO>(
      `${BASE_URL}/generate-by-topic`,
      data
    );
    return response.data;
  },

  /**
   * Create a new flashcard deck manually.
   */
  createDeck: async (
    data: CreateFlashcardDeckDTO
  ): Promise<FlashcardDeckDTO> => {
    const response = await api.post<FlashcardDeckDTO>(
      `${BASE_URL}/decks`,
      data
    );
    return response.data;
  },

  /**
   * Get a list of user's flashcard decks.
   */
  getDecks: async (
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<FlashcardDeckDTO>> => {
    const response = await api.get<PaginatedResponse<FlashcardDeckDTO>>(
      `${BASE_URL}/decks`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get details of a specific flashcard deck.
   */
  getDeck: async (id: string): Promise<FlashcardDeckDTO> => {
    const response = await api.get<FlashcardDeckDTO>(
      `${BASE_URL}/decks/${id}`
    );
    return response.data;
  },

  /**
   * Update an existing flashcard deck.
   */
  updateDeck: async (
    id: string,
    data: UpdateFlashcardDeckDTO
  ): Promise<FlashcardDeckDTO> => {
    const response = await api.put<FlashcardDeckDTO>(
      `${BASE_URL}/decks/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a flashcard deck.
   */
  deleteDeck: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/decks/${id}`);
  },

  /**
   * Get a study session for a deck (cards due for review).
   */
  getStudySession: async (
    deckId: string
  ): Promise<FlashcardStudySessionDTO> => {
    const response = await api.get<FlashcardStudySessionDTO>(
      `${BASE_URL}/decks/${deckId}/study`
    );
    return response.data;
  },

  /**
   * Submit review results for a study session.
   */
  submitReview: async (
    deckId: string,
    data: FlashcardReviewResultDTO
  ): Promise<FlashcardStudySessionDTO> => {
    const response = await api.post<FlashcardStudySessionDTO>(
      `${BASE_URL}/decks/${deckId}/review`,
      data
    );
    return response.data;
  },

  /**
   * Get total count of cards due for review across all decks.
   */
  getTotalDueCount: async (): Promise<DueCountResponse> => {
    const response = await api.get<DueCountResponse>(
      `${BASE_URL}/due-count`
    );
    return response.data;
  },

  /**
   * Check if a deck exists for a specific lesson.
   */
  checkLessonDeck: async (
    lessonId: number
  ): Promise<LessonDeckCheckResponse> => {
    const response = await api.get<LessonDeckCheckResponse>(
      `${BASE_URL}/lessons/${lessonId}/deck`
    );
    return response.data;
  },
};
