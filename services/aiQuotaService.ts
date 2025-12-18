import api from "@/lib/api";
import { UserAiQuota } from "@/types/ai";

export const aiQuotaService = {
  getMyQuota: async (): Promise<UserAiQuota> => {
    const response = await api.get("/ai/quota/me");
    return response.data;
  },
};
