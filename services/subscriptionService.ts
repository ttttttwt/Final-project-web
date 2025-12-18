import api from "@/lib/api";

export interface Subscription {
  id: string;
  planType: "FREE" | "MONTHLY" | "YEARLY";
  status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "INCOMPLETE" | "TRIALING";
  currentPeriodEnd: string | null;
}

export const subscriptionService = {
  async getStatus(): Promise<Subscription> {
    const response = await api.get<Subscription>("/subscription/status");
    return response.data;
  },

  async createPortalSession(): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>("/subscription/portal");
    return response.data;
  },
};
