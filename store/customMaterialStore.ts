import { create } from "zustand";
import { customMaterialService } from "@/services/customMaterialService";
import {
  CustomMaterial,
  MaterialListItem,
  MaterialStatusResponse,
  QuotaInfo,
  CreateMaterialRequest,
  UpdateContentRequest,
  ChatMessage,
  PerformanceReport,
  CustomMaterialStatus,
  ChatMessageResponse,
  EndChatResponse,
} from "@/types/custom-materials";
import { PaginatedResponse } from "@/types/common";

interface CustomMaterialState {
  // Materials list
  materials: MaterialListItem[];
  totalMaterials: number;
  isLoadingList: boolean;

  // Current material
  currentMaterial: CustomMaterial | null;
  isLoadingMaterial: boolean;

  // Related materials (for sidebar)
  relatedMaterials: MaterialListItem[];
  isLoadingRelated: boolean;

  // Upload/Create state
  isCreating: boolean;
  createError: string | null;

  // Processing status
  processingStatus: MaterialStatusResponse | null;
  isPolling: boolean;

  // Chat session
  chatSessionId: string | null;
  chatMessages: ChatMessage[];
  isSendingMessage: boolean;
  isEndingChat: boolean;
  performanceReport: PerformanceReport | null;
  dynamicPrompts: string[];
  isLoadingPrompts: boolean;

  // Quota
  quota: QuotaInfo | null;
  isLoadingQuota: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchMaterials: (params?: {
    page?: number;
    size?: number;
    status?: CustomMaterialStatus;
  }) => Promise<void>;
  fetchMaterial: (id: string) => Promise<void>;
  createMaterial: (
    data: CreateMaterialRequest,
    file?: File
  ) => Promise<string | null>;
  updateContent: (id: string, data: UpdateContentRequest) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  pollStatus: (id: string) => Promise<MaterialStatusResponse>;
  startPolling: (id: string, onComplete?: () => void) => void;
  stopPolling: () => void;
  startChatSession: (materialId: string) => Promise<void>;
  sendChatMessage: (
    materialId: string,
    message: string
  ) => Promise<ChatMessageResponse | null>;
  fetchDynamicPrompts: (materialId: string) => Promise<void>;
  endChatSession: (
    materialId: string
  ) => Promise<EndChatResponse | null>;
  resetChatSession: () => void;
  fetchQuota: () => Promise<void>;
  fetchRelatedMaterials: (materialId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentMaterial: () => void;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const useCustomMaterialStore = create<CustomMaterialState>(
  (set, get) => ({
    // Initial state
    materials: [],
    totalMaterials: 0,
    isLoadingList: false,
    currentMaterial: null,
    isLoadingMaterial: false,
    isCreating: false,
    createError: null,
    processingStatus: null,
    isPolling: false,
    chatSessionId: null,
    chatMessages: [],
    isSendingMessage: false,
    isEndingChat: false,
    performanceReport: null,
    dynamicPrompts: [],
    isLoadingPrompts: false,
    quota: null,
    isLoadingQuota: false,
    relatedMaterials: [],
    isLoadingRelated: false,
    error: null,

    // Fetch materials list
    fetchMaterials: async (params) => {
      set({ isLoadingList: true, error: null });
      try {
        const response = await customMaterialService.listMaterials(params);
        set({
          materials: response.content,
          totalMaterials: response.totalElements,
          isLoadingList: false,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch materials";
        set({ error: message, isLoadingList: false });
      }
    },

    // Fetch single material details
    fetchMaterial: async (id) => {
      set({ isLoadingMaterial: true, error: null });
      try {
        const material = await customMaterialService.getMaterial(id);
        set({ currentMaterial: material, isLoadingMaterial: false });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch material";
        set({ error: message, isLoadingMaterial: false });
      }
    },

    // Create new material
    createMaterial: async (data, file) => {
      set({ isCreating: true, createError: null });
      try {
        const response = await customMaterialService.createMaterial(data, file);
        set({ isCreating: false });
        // Refresh materials list
        get().fetchMaterials();
        return response.id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create material";
        const apiError = err as { response?: { data?: { message?: string } } };
        set({
          createError: apiError.response?.data?.message || message,
          isCreating: false,
        });
        return null;
      }
    },

    // Update generated content
    updateContent: async (id, data) => {
      try {
        const updated = await customMaterialService.updateContent(id, data);
        set({ currentMaterial: updated });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update content";
        set({ error: message });
        throw err;
      }
    },

    // Delete material
    deleteMaterial: async (id) => {
      try {
        await customMaterialService.deleteMaterial(id);
        // Remove from local state
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
          totalMaterials: state.totalMaterials - 1,
          currentMaterial:
            state.currentMaterial?.id === id ? null : state.currentMaterial,
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete material";
        set({ error: message });
        throw err;
      }
    },

    // Poll processing status
    pollStatus: async (id) => {
      const status = await customMaterialService.getStatus(id);
      set({ processingStatus: status });
      return status;
    },

    // Start polling for status updates
    startPolling: (id, onComplete) => {
      get().stopPolling(); // Clear any existing polling
      set({ isPolling: true });

      const poll = async () => {
        try {
          const status = await get().pollStatus(id);
          if (status.status === "COMPLETED" || status.status === "FAILED") {
            get().stopPolling();
            if (onComplete) onComplete();
            // Refresh the material if completed
            if (status.status === "COMPLETED") {
              get().fetchMaterial(id);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      };

      // Poll immediately, then every 3 seconds
      poll();
      pollingInterval = setInterval(poll, 3000);
    },

    // Stop polling
    stopPolling: () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      set({ isPolling: false });
    },

    // Start a new chat session (AI starts)
    startChatSession: async (materialId) => {
      set({ isSendingMessage: true, chatMessages: [], chatSessionId: null });
      try {
        const response = await customMaterialService.startChat(materialId);
        
        const aiMessage: ChatMessage = {
          role: "ai",
          content: response.aiResponse,
          timestamp: new Date().toISOString(),
        };

        set({
          chatSessionId: response.sessionId,
          chatMessages: [aiMessage],
          isSendingMessage: false,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start chat";
        set({ error: message, isSendingMessage: false });
      }
    },

    // Send chat message
    sendChatMessage: async (materialId, message) => {
      const { chatSessionId } = get();
      set({ isSendingMessage: true });

      try {
        // Add user message to local state immediately
        const userMessage: ChatMessage = {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, userMessage],
        }));

        const response = await customMaterialService.sendChatMessage(
          materialId,
          {
            message,
            sessionId: chatSessionId,
          }
        );

        // Update session ID if new session
        if (!chatSessionId) {
          set({ chatSessionId: response.sessionId });
        }

        // Add AI response to messages
        const aiMessage: ChatMessage = {
          role: "ai",
          content: response.aiResponse,
          timestamp: new Date().toISOString(),
          corrections: response.corrections,
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, aiMessage],
          isSendingMessage: false,
        }));

        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send message";
        set({ error: message, isSendingMessage: false });
        // Remove the user message on error
        set((state) => ({
          chatMessages: state.chatMessages.slice(0, -1),
        }));
        return null;
      }
    },

    // Fetch dynamic prompts
    fetchDynamicPrompts: async (materialId) => {
      const { chatSessionId } = get();
      if (!chatSessionId) return;

      set({ isLoadingPrompts: true });
      try {
        const prompts = await customMaterialService.getDynamicPrompts(
          materialId,
          chatSessionId
        );
        set({ dynamicPrompts: prompts, isLoadingPrompts: false });
      } catch (err) {
        console.error("Failed to fetch dynamic prompts:", err);
        set({ isLoadingPrompts: false });
      }
    },

    // End chat session
    endChatSession: async (materialId) => {
      const { chatSessionId } = get();
      if (!chatSessionId) return null;

      set({ isEndingChat: true });
      try {
        const response = await customMaterialService.endChatSession(
          materialId,
          chatSessionId
        );
        set({
          performanceReport: response.performanceReport,
          isEndingChat: false,
        });
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to end chat session";
        set({ error: message, isEndingChat: false });
        return null;
      }
    },

    // Reset chat session state
    resetChatSession: () => {
      set({
        chatSessionId: null,
        chatMessages: [],
        performanceReport: null,
        dynamicPrompts: [],
        isSendingMessage: false,
        isEndingChat: false,
      });
    },

    // Fetch quota
    fetchQuota: async () => {
      set({ isLoadingQuota: true });
      try {
        const quota = await customMaterialService.getQuota();
        set({ quota, isLoadingQuota: false });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch quota";
        set({ error: message, isLoadingQuota: false });
      }
    },

    // Fetch related materials
    fetchRelatedMaterials: async (materialId) => {
      set({ isLoadingRelated: true });
      try {
        const materials = await customMaterialService.getRelatedMaterials(materialId);
        set({ relatedMaterials: materials, isLoadingRelated: false });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch related materials";
        set({ error: message, isLoadingRelated: false, relatedMaterials: [] });
      }
    },

    // Clear error
    clearError: () => set({ error: null, createError: null }),

    // Clear current material
    clearCurrentMaterial: () =>
      set({
        currentMaterial: null,
        processingStatus: null,
        chatSessionId: null,
        chatMessages: [],
        performanceReport: null,
        dynamicPrompts: [],
        relatedMaterials: [],
      }),
  })
);

export default useCustomMaterialStore;
