"use client";

import { useState, useEffect, useCallback } from "react";
import { aiQuotaService } from "@/services/aiQuotaService";
import { UserAiQuota, QUOTA_LIMITS } from "@/types/ai";

export interface AiQuotaResult {
  /** Number of AI requests used today (legacy) */
  usedToday: number;
  /** Daily limit for AI requests (legacy) */
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
  /** Percentage of monthly quota used (0-100) */
  monthlyPercentage: number;
  /** Whether user is near monthly limit (>=80%) */
  isNearLimit: boolean;
  /** Whether user is at critical monthly limit (>=95%) */
  isCriticalLimit: boolean;
  /** Whether user has reached monthly limit (>=100%) */
  isAtLimit: boolean;
  /** Whether quota is loading */
  isLoading: boolean;
  /** Error message if quota fetch failed */
  error: string | null;
  /** Refresh quota data */
  refetch: () => Promise<void>;
  
  // Feature-specific quotas (subscription-based)
  /** Role play sessions used this month */
  roleplayUsed: number;
  /** Role play sessions limit this month */
  roleplayLimit: number;
  /** Flashcard decks created this month */
  flashcardUsed: number;
  /** Flashcard decks limit this month */
  flashcardLimit: number;
  /** Grammar exercises created this month */
  grammarUsed: number;
  /** Grammar exercises limit this month */
  grammarLimit: number;
  /** Custom materials created this month */
  customMaterialUsed: number;
  /** Custom materials limit this month */
  customMaterialLimit: number;
  /** Total AI requests this month */
  totalUsed: number;
  /** Total AI requests limit this month */
  totalLimit: number;
  /** User's plan type */
  planType: 'FREE' | 'MONTHLY' | 'YEARLY';
  /** Days until quota resets */
  daysUntilReset: number;
  /** Usage for the requested feature (or total if none specified) */
  featureUsed: number;
  /** Limit for the requested feature (or total if none specified) */
  featureLimit: number;
}

/**
 * Hook to fetch and manage AI usage quota.
 * Provides real-time quota information and warnings.
 * Uses subscription-based monthly quotas.
 * 
 * @example
 * ```tsx
 * const { totalUsed, totalLimit, isNearLimit, isAtLimit } = useAiQuota();
 * 
 * if (isAtLimit) return <QuotaExhausted />;
 * if (isNearLimit) return <QuotaWarning used={totalUsed} limit={totalLimit} />;
 * ```
 */
export function useAiQuota(feature?: string): AiQuotaResult {
  const [quota, setQuota] = useState<UserAiQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await aiQuotaService.getMyQuota();
      setQuota(data);
    } catch (err: any) {
      // If quota endpoint doesn't exist yet, use defaults silently
      if (err.response?.status === 404) {
        setError(null);
      } else {
        setError(err.response?.data?.message || "Failed to load quota");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // Default values if quota not loaded
  const defaults = {
    roleplayUsed: 0,
    roleplayLimit: QUOTA_LIMITS.FREE.roleplaySessions,
    flashcardUsed: 0,
    flashcardLimit: QUOTA_LIMITS.FREE.flashcardDecks,
    grammarUsed: 0,
    grammarLimit: QUOTA_LIMITS.FREE.grammarExercises,
    customMaterialUsed: 0,
    customMaterialLimit: QUOTA_LIMITS.FREE.customMaterials,
    totalUsed: 0,
    totalLimit: QUOTA_LIMITS.FREE.totalRequests,
    planType: 'FREE' as const,
    daysUntilReset: 30,
  };

  // Extract values from quota, using new fields with fallback to legacy
  const roleplayUsed = quota?.roleplaySessionsUsed ?? quota?.rolePlayUsedMonth ?? defaults.roleplayUsed;
  const roleplayLimit = quota?.roleplaySessionsLimit ?? quota?.rolePlayMonthlyLimit ?? defaults.roleplayLimit;
  const flashcardUsed = quota?.flashcardDecksUsed ?? quota?.flashcardUsedMonth ?? defaults.flashcardUsed;
  const flashcardLimit = quota?.flashcardDecksLimit ?? quota?.flashcardMonthlyLimit ?? defaults.flashcardLimit;
  const grammarUsed = quota?.grammarExercisesUsed ?? quota?.grammarUsedMonth ?? defaults.grammarUsed;
  const grammarLimit = quota?.grammarExercisesLimit ?? quota?.grammarMonthlyLimit ?? defaults.grammarLimit;  const customMaterialUsed = quota?.customMaterialsUsed ?? defaults.customMaterialUsed;
  const customMaterialLimit = quota?.customMaterialsLimit ?? defaults.customMaterialLimit;  const totalUsed = quota?.totalRequestsUsed ?? quota?.monthlyUsed ?? defaults.totalUsed;
  const totalLimit = quota?.totalRequestsLimit ?? quota?.monthlyLimit ?? defaults.totalLimit;
  const planType = quota?.planType ?? defaults.planType;
  const daysUntilReset = quota?.daysUntilReset ?? defaults.daysUntilReset;

  // Calculate feature-specific usage if feature is specified
  let featureUsed = totalUsed;
  let featureLimit = totalLimit;
  
  if (feature === 'roleplay') {
    featureUsed = roleplayUsed;
    featureLimit = roleplayLimit;
  } else if (feature === 'flashcard' || feature === 'flashcards') {
    featureUsed = flashcardUsed;
    featureLimit = flashcardLimit;
  } else if (feature === 'grammar') {
    featureUsed = grammarUsed;
    featureLimit = grammarLimit;
  } else if (feature === 'custom_materials' || feature === 'custom-materials') {
    featureUsed = customMaterialUsed;
    featureLimit = customMaterialLimit;
  }

  // Legacy daily values for backwards compatibility
  const usedToday = quota?.dailyUsed ?? 0;
  const dailyLimit = quota?.dailyLimit ?? 50;
  const dailyResetTime = quota?.lastResetDaily ? new Date(quota.lastResetDaily) : null;
  const monthlyResetTime = quota?.quotaResetDate 
    ? new Date(quota.quotaResetDate) 
    : quota?.lastResetMonthly 
      ? new Date(quota.lastResetMonthly) 
      : null;

  const monthlyPercentage = Math.min((featureUsed / featureLimit) * 100, 100);
  const dailyPercentage = Math.min((usedToday / dailyLimit) * 100, 100);
  const isNearLimit = monthlyPercentage >= 80;
  const isCriticalLimit = monthlyPercentage >= 95;
  const isAtLimit = monthlyPercentage >= 100;

  return {
    // Legacy fields
    usedToday,
    dailyLimit,
    usedMonth: totalUsed,
    monthlyLimit: totalLimit,
    dailyResetTime,
    monthlyResetTime,
    
    // New subscription-based fields
    dailyPercentage,
    monthlyPercentage,
    isNearLimit,
    isCriticalLimit,
    isAtLimit,
    isLoading,
    error,
    refetch: fetchQuota,
    
    // Feature-specific quotas
    roleplayUsed,
    roleplayLimit,
    flashcardUsed,
    flashcardLimit,
    grammarUsed,
    grammarLimit,
    customMaterialUsed,
    customMaterialLimit,
    featureUsed,
    featureLimit,
    totalUsed,
    totalLimit,
    planType,
    daysUntilReset,
  };
}

/**
 * Check if a specific AI feature is available based on quota.
 */
export function useCanUseAiFeature(feature: string): {
  canUse: boolean;
  reason: string | null;
  quota: AiQuotaResult;
} {
  const quota = useAiQuota(feature);

  let featureUsed: number;
  let featureLimit: number;
  let featureName: string;

  switch (feature) {
    case 'roleplay':
      featureUsed = quota.roleplayUsed;
      featureLimit = quota.roleplayLimit;
      featureName = 'roleplay sessions';
      break;
    case 'flashcard':
    case 'flashcards':
      featureUsed = quota.flashcardUsed;
      featureLimit = quota.flashcardLimit;
      featureName = 'flashcard decks';
      break;
    case 'grammar':
      featureUsed = quota.grammarUsed;
      featureLimit = quota.grammarLimit;
      featureName = 'grammar exercises';
      break;
    case 'custom_materials':
    case 'custom-materials':
      featureUsed = quota.customMaterialUsed;
      featureLimit = quota.customMaterialLimit;
      featureName = 'custom materials';
      break;
    default:
      featureUsed = quota.totalUsed;
      featureLimit = quota.totalLimit;
      featureName = 'AI requests';
  }

  const isAtLimit = featureUsed >= featureLimit;

  if (isAtLimit) {
    return {
      canUse: false,
      reason: `You've reached your monthly limit of ${featureLimit} ${featureName}. ${
        quota.planType === 'FREE' 
          ? 'Upgrade to Pro for higher limits!' 
          : `Resets in ${quota.daysUntilReset} days.`
      }`,
      quota,
    };
  }

  return {
    canUse: true,
    reason: null,
    quota,
  };
}
