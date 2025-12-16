"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface AiQuota {
  /** Number of AI requests used today */
  usedToday: number;
  /** Daily limit for AI requests */
  dailyLimit: number;
  /** Number of AI requests used this month */
  usedMonth: number;
  /** Monthly limit for AI requests */
  monthlyLimit: number;
  /** When the daily quota resets */
  dailyResetTime: Date | null;
  /** When the monthly quota resets */
  monthlyResetTime: Date | null;
  /** Percentage of daily quota used (0-100) */
  dailyPercentage: number;
  /** Whether user is near daily limit (>=80%) */
  isNearLimit: boolean;
  /** Whether user has reached daily limit (100%) */
  isAtLimit: boolean;
  /** Whether quota is loading */
  isLoading: boolean;
  /** Error message if quota fetch failed */
  error: string | null;
  /** Refresh quota data */
  refetch: () => Promise<void>;
}

export interface AiQuotaResponse {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  dailyResetAt: string;
  monthlyResetAt: string;
}

/**
 * Hook to fetch and manage AI usage quota.
 * Provides real-time quota information and warnings.
 * 
 * @example
 * ```tsx
 * const { usedToday, dailyLimit, isNearLimit, isAtLimit } = useAiQuota();
 * 
 * if (isAtLimit) return <QuotaExhausted />;
 * if (isNearLimit) return <QuotaWarning used={usedToday} limit={dailyLimit} />;
 * ```
 */
export function useAiQuota(feature?: string): AiQuota {
  const [quota, setQuota] = useState<{
    usedToday: number;
    dailyLimit: number;
    usedMonth: number;
    monthlyLimit: number;
    dailyResetTime: Date | null;
    monthlyResetTime: Date | null;
  }>({
    usedToday: 0,
    dailyLimit: 50, // Default limit
    usedMonth: 0,
    monthlyLimit: 500, // Default limit
    dailyResetTime: null,
    monthlyResetTime: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = feature 
        ? `/api/v1/ai/quota?feature=${feature}`
        : "/api/v1/ai/quota";

      const response = await api.get<AiQuotaResponse>(endpoint);
      const data = response.data;

      setQuota({
        usedToday: data.dailyUsed,
        dailyLimit: data.dailyLimit,
        usedMonth: data.monthlyUsed,
        monthlyLimit: data.monthlyLimit,
        dailyResetTime: data.dailyResetAt ? new Date(data.dailyResetAt) : null,
        monthlyResetTime: data.monthlyResetAt ? new Date(data.monthlyResetAt) : null,
      });
    } catch (err: any) {
      // If quota endpoint doesn't exist yet, use defaults silently
      if (err.response?.status === 404) {
        setError(null); // Don't show error for missing endpoint
      } else {
        setError(err.response?.data?.message || "Failed to load quota");
      }
    } finally {
      setIsLoading(false);
    }
  }, [feature]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const dailyPercentage = Math.min(
    (quota.usedToday / quota.dailyLimit) * 100,
    100
  );

  return {
    usedToday: quota.usedToday,
    dailyLimit: quota.dailyLimit,
    usedMonth: quota.usedMonth,
    monthlyLimit: quota.monthlyLimit,
    dailyResetTime: quota.dailyResetTime,
    monthlyResetTime: quota.monthlyResetTime,
    dailyPercentage,
    isNearLimit: dailyPercentage >= 80,
    isAtLimit: dailyPercentage >= 100,
    isLoading,
    error,
    refetch: fetchQuota,
  };
}

/**
 * Check if a specific AI feature is available based on quota.
 */
export function useCanUseAiFeature(feature: string): {
  canUse: boolean;
  reason: string | null;
  quota: AiQuota;
} {
  const quota = useAiQuota(feature);

  if (quota.isAtLimit) {
    return {
      canUse: false,
      reason: `You've reached your daily limit of ${quota.dailyLimit} ${feature} requests.`,
      quota,
    };
  }

  return {
    canUse: true,
    reason: null,
    quota,
  };
}
