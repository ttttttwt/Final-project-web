import api from "@/lib/api";
import { PaginatedResponse } from "@/types/common";
import {
  CustomMaterial,
  MaterialListItem,
  MaterialStatusResponse,
  QuotaInfo,
  CreateMaterialRequest,
  UpdateContentRequest,
  ChatMessageRequest,
  ChatMessageResponse,
  EndChatResponse,
  StyleTransformRequest,
  StyleTransformResponse,
  ShadowingScoreResponse,
  CustomMaterialStatus,
} from "@/types/custom-materials";

const BASE_URL = "/custom-materials";

export const customMaterialService = {
  /**
   * Upload a new custom material for AI processing.
   * Supports file upload (PDF, DOCX, Image) or URL/text input.
   */
  createMaterial: async (
    data: CreateMaterialRequest,
    file?: File
  ): Promise<{ id: string; status: CustomMaterialStatus; message: string }> => {
    const formData = new FormData();
    
    // Add file if present
    if (file) {
      formData.append("file", file);
    }
    
    // Add request JSON
    formData.append("request", JSON.stringify(data));

    const response = await api.post(`${BASE_URL}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * List user's custom materials with pagination and filters.
   */
  listMaterials: async (params?: {
    page?: number;
    size?: number;
    status?: CustomMaterialStatus;
    sort?: string;
  }): Promise<PaginatedResponse<MaterialListItem>> => {
    const response = await api.get<PaginatedResponse<MaterialListItem>>(
      BASE_URL,
      { params }
    );
    return response.data;
  },

  /**
   * Get detailed information about a specific material.
   */
  getMaterial: async (id: string): Promise<CustomMaterial> => {
    const response = await api.get<CustomMaterial>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Poll the processing status of a material.
   */
  getStatus: async (id: string): Promise<MaterialStatusResponse> => {
    const response = await api.get<MaterialStatusResponse>(
      `${BASE_URL}/${id}/status`
    );
    return response.data;
  },

  /**
   * Update the generated content (edit/delete vocabulary, quiz items).
   */
  updateContent: async (
    id: string,
    data: UpdateContentRequest
  ): Promise<CustomMaterial> => {
    const response = await api.patch<CustomMaterial>(
      `${BASE_URL}/${id}/content`,
      data
    );
    return response.data;
  },

  /**
   * Delete a custom material.
   */
  deleteMaterial: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Get current usage quota for the day.
   */
  getQuota: async (): Promise<QuotaInfo> => {
    const response = await api.get<QuotaInfo>(`${BASE_URL}/quota`);
    return response.data;
  },

  /**
   * Send a message in a role-play chat session.
   * Creates a new session if sessionId is null.
   */
  sendChatMessage: async (
    materialId: string,
    data: ChatMessageRequest
  ): Promise<ChatMessageResponse> => {
    const response = await api.post<ChatMessageResponse>(
      `${BASE_URL}/${materialId}/chat`,
      data
    );
    return response.data;
  },

  /**
   * End a chat session and get the performance report.
   */
  endChatSession: async (
    materialId: string,
    sessionId: string
  ): Promise<EndChatResponse> => {
    const response = await api.post<EndChatResponse>(
      `${BASE_URL}/${materialId}/chat/${sessionId}/end`
    );
    return response.data;
  },

  /**
   * Transform text to a different writing style.
   */
  transformStyle: async (
    data: StyleTransformRequest
  ): Promise<StyleTransformResponse> => {
    const response = await api.post<StyleTransformResponse>(
      `${BASE_URL}/transform-style`,
      data
    );
    return response.data;
  },

  /**
   * Score a shadowing attempt (pronunciation practice).
   */
  scoreShadowing: async (
    materialId: string,
    sentenceId: string,
    audio: Blob
  ): Promise<ShadowingScoreResponse> => {
    const formData = new FormData();
    formData.append("audio", audio, "recording.webm");

    const response = await api.post<ShadowingScoreResponse>(
      `${BASE_URL}/${materialId}/shadowing/${sentenceId}/score`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default customMaterialService;
