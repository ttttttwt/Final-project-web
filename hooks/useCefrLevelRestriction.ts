/**
 * CEFR Level Restriction Hook
 * Provides utilities for checking if content is accessible based on user's CEFR level
 * 
 * Features:
 * - Level comparison (A1 < A2 < B1 < B2 < C1 < C2)
 * - Accessibility check based on user's current level
 * - Warning messages for restricted content
 * - Lists of available vs restricted levels
 */

import { useAuthStore } from "@/store/authStore";

// CEFR levels in order from lowest to highest
const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CEFRLevel = (typeof CEFR_ORDER)[number];

/**
 * Get the numeric index of a CEFR level for comparison
 * Returns -1 if level is invalid
 */
export function getCefrIndex(level: string | undefined): number {
  if (!level) return -1;
  return CEFR_ORDER.indexOf(level.toUpperCase() as CEFRLevel);
}

/**
 * Check if a content level is accessible for a user
 * - If user has no level set, all content is accessible
 * - Content at or below user's level is accessible
 * - Content above user's level is restricted (but can be overridden)
 */
export function isLevelAccessible(
  userLevel: string | undefined,
  contentLevel: string
): boolean {
  // If user has no level, allow all content
  if (!userLevel) return true;

  const userIndex = getCefrIndex(userLevel);
  const contentIndex = getCefrIndex(contentLevel);

  // Invalid levels are considered accessible
  if (userIndex === -1 || contentIndex === -1) return true;

  // Content is accessible if it's at or below user's level
  return contentIndex <= userIndex;
}

/**
 * Get a warning message for content above user's level
 * Returns null if content is accessible
 */
export function getLevelWarning(
  userLevel: string | undefined,
  contentLevel: string
): string | null {
  if (isLevelAccessible(userLevel, contentLevel)) {
    return null;
  }

  return `This content is at ${contentLevel} level, which is above your current level (${userLevel}). The vocabulary and grammar may be more challenging.`;
}

/**
 * Get short warning for UI display
 */
export function getShortLevelWarning(
  userLevel: string | undefined,
  contentLevel: string
): string | null {
  if (isLevelAccessible(userLevel, contentLevel)) {
    return null;
  }

  return `Above your level (${userLevel})`;
}

/**
 * Get all levels at or below the user's level
 */
export function getAccessibleLevels(userLevel: string | undefined): CEFRLevel[] {
  if (!userLevel) return [...CEFR_ORDER];

  const userIndex = getCefrIndex(userLevel);
  if (userIndex === -1) return [...CEFR_ORDER];

  return CEFR_ORDER.slice(0, userIndex + 1) as unknown as CEFRLevel[];
}

/**
 * Get all levels above the user's level
 */
export function getRestrictedLevels(userLevel: string | undefined): CEFRLevel[] {
  if (!userLevel) return [];

  const userIndex = getCefrIndex(userLevel);
  if (userIndex === -1) return [];

  return CEFR_ORDER.slice(userIndex + 1) as unknown as CEFRLevel[];
}

/**
 * Hook for CEFR level restrictions in components
 * Uses the current authenticated user's level
 */
export function useCefrLevelRestriction() {
  const user = useAuthStore((state) => state.user);
  const userLevel = user?.currentLevel;

  return {
    /** User's current CEFR level (undefined if not set) */
    userLevel,

    /** Check if a specific content level is accessible */
    isAccessible: (contentLevel: string) =>
      isLevelAccessible(userLevel, contentLevel),

    /** Get warning message for a content level (null if accessible) */
    getWarning: (contentLevel: string) =>
      getLevelWarning(userLevel, contentLevel),

    /** Get short warning for UI badges */
    getShortWarning: (contentLevel: string) =>
      getShortLevelWarning(userLevel, contentLevel),

    /** All levels at or below user's level */
    accessibleLevels: getAccessibleLevels(userLevel),

    /** All levels above user's level */
    restrictedLevels: getRestrictedLevels(userLevel),

    /** All CEFR levels in order */
    allLevels: CEFR_ORDER,

    /** Check if user has taken placement test (has a level set) */
    hasPlacementLevel: !!userLevel,
  };
}

export default useCefrLevelRestriction;
