/**
 * Subscription Features Configuration
 * 
 * Central configuration for Pro subscription features and their limits.
 * This ensures consistency across the application and makes updates easier.
 */

export interface SubscriptionFeature {
  key: string;
  label: string;
  limit: number;
  unit: 'month' | 'day';
  icon?: string;
}

/**
 * Pro subscription features with their limits
 * These values should match the backend quota configuration
 */
export const PRO_FEATURES: SubscriptionFeature[] = [
  {
    key: 'roleplay',
    label: 'AI Role Play Sessions',
    limit: 50,
    unit: 'month',
  },
  {
    key: 'flashcards',
    label: 'AI Flashcard Decks',
    limit: 30,
    unit: 'month',
  },
  {
    key: 'grammar',
    label: 'AI Grammar Exercises',
    limit: 300,
    unit: 'month',
  },
  {
    key: 'customMaterials',
    label: 'Custom AI Materials',
    limit: 10,
    unit: 'day',
  },
];

/**
 * Free tier features (limited)
 */
export const FREE_FEATURES: SubscriptionFeature[] = [
  {
    key: 'roleplay',
    label: 'AI Role Play Sessions',
    limit: 3,
    unit: 'month',
  },
  {
    key: 'flashcards',
    label: 'AI Flashcard Decks',
    limit: 3,
    unit: 'month',
  },
  {
    key: 'grammar',
    label: 'AI Grammar Exercises',
    limit: 10,
    unit: 'month',
  },
  {
    key: 'customMaterials',
    label: 'Custom AI Materials',
    limit: 2,
    unit: 'day',
  },
];

/**
 * Additional Pro benefits (non-quota based)
 */
export const PRO_BENEFITS = [
  'Priority Support',
  'Early Access to New Features',
  'Advanced Analytics',
  'No Ads',
];

/**
 * Format feature for display
 */
export function formatFeatureLimit(feature: SubscriptionFeature): string {
  return `${feature.limit} ${feature.label}/${feature.unit}`;
}

/**
 * Get all Pro features formatted for display
 */
export function getProFeaturesList(): string[] {
  const quotaFeatures = PRO_FEATURES.map(formatFeatureLimit);
  return [...quotaFeatures, ...PRO_BENEFITS];
}
