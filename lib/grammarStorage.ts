/**
 * Grammar Exercise Local Storage Utilities
 * Provides persistence for generated exercises and user answers.
 * Used to prevent data loss on page reload or tab switch.
 */

import { GrammarExerciseSetDTO } from "@/types/ai";

// Storage keys
const STORAGE_KEYS = {
  GENERATED_EXERCISE: "lexia.grammar.generatedExercise",
  USER_ANSWERS: "lexia.grammar.userAnswers",
  CURRENT_QUESTION_INDEX: "lexia.grammar.currentQuestionIndex",
  TIME_SPENT: "lexia.grammar.timeSpent",
} as const;

// Type for stored user answers
interface StoredAnswers {
  exerciseSetId: string;
  answers: Record<number, string>;
  currentQuestionIndex: number;
  timeSpent: number;
  savedAt: number;
}

// Check if we're in browser
const isBrowser = typeof window !== "undefined";

/**
 * Safely get item from localStorage
 */
function safeGetItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("Unable to read localStorage key", key, error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
function safeSetItem(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Unable to write localStorage key", key, error);
  }
}

/**
 * Safely remove item from localStorage
 */
function safeRemoveItem(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Unable to remove localStorage key", key, error);
  }
}

// ============= Generated Exercise Storage =============

/**
 * Save a generated exercise set to localStorage
 */
export function saveGeneratedExercise(exerciseSet: GrammarExerciseSetDTO): void {
  const data = JSON.stringify({
    ...exerciseSet,
    savedAt: Date.now(),
  });
  safeSetItem(STORAGE_KEYS.GENERATED_EXERCISE, data);
}

/**
 * Get saved generated exercise from localStorage
 * Returns null if not found or expired (24 hours)
 */
export function getGeneratedExercise(): GrammarExerciseSetDTO | null {
  const data = safeGetItem(STORAGE_KEYS.GENERATED_EXERCISE);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    // Check if expired (24 hours)
    const savedAt = parsed.savedAt || 0;
    const isExpired = Date.now() - savedAt > 24 * 60 * 60 * 1000;
    if (isExpired) {
      clearGeneratedExercise();
      return null;
    }
    // Remove savedAt from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedAt: _, ...exerciseSet } = parsed;
    return exerciseSet as GrammarExerciseSetDTO;
  } catch (error) {
    console.warn("Failed to parse saved exercise:", error);
    clearGeneratedExercise();
    return null;
  }
}

/**
 * Clear saved generated exercise
 */
export function clearGeneratedExercise(): void {
  safeRemoveItem(STORAGE_KEYS.GENERATED_EXERCISE);
}

// ============= User Answers Storage =============

/**
 * Save user answers for an exercise set
 */
export function saveUserAnswers(
  exerciseSetId: string,
  answers: Record<number, string>,
  currentQuestionIndex: number,
  timeSpent: number
): void {
  const data: StoredAnswers = {
    exerciseSetId,
    answers,
    currentQuestionIndex,
    timeSpent,
    savedAt: Date.now(),
  };
  safeSetItem(STORAGE_KEYS.USER_ANSWERS, JSON.stringify(data));
}

/**
 * Get saved user answers for an exercise set
 * Returns null if not found, expired (4 hours), or different exercise
 */
export function getUserAnswers(exerciseSetId: string): StoredAnswers | null {
  const data = safeGetItem(STORAGE_KEYS.USER_ANSWERS);
  if (!data) return null;

  try {
    const parsed: StoredAnswers = JSON.parse(data);
    
    // Check if same exercise
    if (parsed.exerciseSetId !== exerciseSetId) {
      return null;
    }

    // Check if expired (4 hours)
    const isExpired = Date.now() - parsed.savedAt > 4 * 60 * 60 * 1000;
    if (isExpired) {
      clearUserAnswers();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to parse saved answers:", error);
    clearUserAnswers();
    return null;
  }
}

/**
 * Clear saved user answers
 */
export function clearUserAnswers(): void {
  safeRemoveItem(STORAGE_KEYS.USER_ANSWERS);
}

// ============= Clear All =============

/**
 * Clear all grammar-related localStorage data
 */
export function clearAllGrammarData(): void {
  clearGeneratedExercise();
  clearUserAnswers();
}

/**
 * Check if there are unsaved user answers
 */
export function hasUnsavedAnswers(exerciseSetId: string): boolean {
  const saved = getUserAnswers(exerciseSetId);
  if (!saved) return false;
  return Object.keys(saved.answers).length > 0;
}
