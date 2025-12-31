"use client";

import { create } from "zustand";
import { subscriptionService, Subscription } from "@/services/subscriptionService";

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed helpers
  isPro: boolean;
  planType: "FREE" | "MONTHLY" | "YEARLY" | null;
  
  // Actions
  fetchSubscription: (force?: boolean) => Promise<void>;
  clearSubscription: () => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,
  isPro: false,
  planType: null,

  fetchSubscription: async (force?: boolean) => {
    // Avoid refetching if already loaded (unless forced)
    if (!force && get().subscription && !get().error) {
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const data = await subscriptionService.getStatus();
      const isPro = data.planType !== "FREE" && data.status === "ACTIVE";
      set({
        subscription: data,
        isPro,
        planType: data.planType,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      set({
        error: "Failed to fetch subscription",
        isLoading: false,
        isPro: false,
        planType: null,
      });
    }
  },

  clearSubscription: () => {
    set({
      subscription: null,
      isLoading: false,
      error: null,
      isPro: false,
      planType: null,
    });
  },

  // Alias for logout - reset store to initial state
  reset: () => {
    set({
      subscription: null,
      isLoading: false,
      error: null,
      isPro: false,
      planType: null,
    });
  },
}));
