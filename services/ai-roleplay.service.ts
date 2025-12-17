import api from "@/lib/api";
import { PaginatedResponse } from "@/types/common";
import {
  RolePlayRequestDTO,
  RolePlayScenarioDTO,
  RolePlayStartConversationDTO,
  RolePlayConversationDTO,
  RolePlaySendMessageDTO,
  RolePlayMessageDTO,
} from "@/types/ai";

const BASE_URL = "/ai/roleplay";

export const aiRolePlayService = {
  /**
   * Generate a new role-play scenario using AI.
   */
  generateScenario: async (
    data: RolePlayRequestDTO
  ): Promise<RolePlayScenarioDTO> => {
    const response = await api.post<RolePlayScenarioDTO>(
      `${BASE_URL}/scenarios`,
      data
    );
    return response.data;
  },

  /**
   * Start a new conversation based on a scenario.
   */
  startConversation: async (
    data: RolePlayStartConversationDTO
  ): Promise<RolePlayConversationDTO> => {
    const response = await api.post<RolePlayConversationDTO>(
      `${BASE_URL}/conversations`,
      data
    );
    return response.data;
  },

  /**
   * Send a message in a conversation.
   */
  sendMessage: async (
    conversationId: string,
    data: RolePlaySendMessageDTO
  ): Promise<RolePlayMessageDTO> => {
    const response = await api.post<RolePlayMessageDTO>(
      `${BASE_URL}/conversations/${conversationId}/message`,
      data
    );
    return response.data;
  },

  /**
   * Get a list of user's conversations.
   */
  getConversations: async (
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<RolePlayConversationDTO>> => {
    const response = await api.get<PaginatedResponse<RolePlayConversationDTO>>(
      `${BASE_URL}/conversations`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get details of a specific conversation.
   */
  getConversation: async (
    conversationId: string
  ): Promise<RolePlayConversationDTO> => {
    const response = await api.get<RolePlayConversationDTO>(
      `${BASE_URL}/conversations/${conversationId}`
    );
    return response.data;
  },

  /**
   * Get scenario details by ID.
   */
  getScenario: async (scenarioId: string): Promise<RolePlayScenarioDTO> => {
    const response = await api.get<RolePlayScenarioDTO>(
      `${BASE_URL}/scenarios/${scenarioId}`
    );
    return response.data;
  },

  /**
   * End/complete a conversation.
   */
  endConversation: async (conversationId: string): Promise<void> => {
    await api.patch(`${BASE_URL}/conversations/${conversationId}/complete`);
  },

  /**
   * Send a message with mode override (for switching between immersive/learning).
   */
  sendMessageWithMode: async (
    conversationId: string,
    data: RolePlaySendMessageDTO,
    mode: "immersive" | "learning"
  ): Promise<RolePlayMessageDTO> => {
    const endpoint =
      mode === "immersive"
        ? `${BASE_URL}/conversations/${conversationId}/messages/immersive`
        : `${BASE_URL}/conversations/${conversationId}/messages/learning`;
    const response = await api.post<RolePlayMessageDTO>(endpoint, data);
    return response.data;
  },
};
