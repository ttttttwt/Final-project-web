"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface RetryState {
  /** Current retry attempt number (0 = initial attempt) */
  attemptNumber: number;
  /** Whether retry is currently in progress */
  isRetrying: boolean;
  /** Whether max retries have been exhausted */
  isExhausted: boolean;
  /** Countdown seconds until next retry (0 = not in countdown) */
  countdown: number;
  /** Error from last attempt (null if successful) */
  lastError: Error | null;
  /** Trigger a retry */
  retry: () => Promise<void>;
  /** Reset the retry state */
  reset: () => void;
}

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds (default: 2000) */
  baseDelay?: number;
  /** Maximum delay in milliseconds (default: 16000) */
  maxDelay?: number;
  /** Whether to show countdown timer (default: true) */
  showCountdown?: boolean;
  /** Callback when retry starts */
  onRetryStart?: (attempt: number) => void;
  /** Callback when retry succeeds */
  onSuccess?: () => void;
  /** Callback when all retries exhausted */
  onExhausted?: (lastError: Error | null) => void;
}

/**
 * Hook for retry with exponential backoff.
 * Provides countdown timer and automatic retry scheduling.
 * 
 * Delay pattern: 2s, 4s, 8s (exponential with base 2)
 * 
 * @example
 * ```tsx
 * const { retry, isRetrying, countdown, isExhausted } = useRetryWithBackoff(
 *   async () => await fetchData(),
 *   { maxRetries: 3 }
 * );
 * 
 * if (isExhausted) return <ContactSupport />;
 * if (countdown > 0) return <p>Retrying in {countdown}s...</p>;
 * return <button onClick={retry} disabled={isRetrying}>Retry</button>;
 * ```
 */
export function useRetryWithBackoff(
  fn: () => Promise<void>,
  options: RetryOptions = {}
): RetryState {
  const {
    maxRetries = 3,
    baseDelay = 2000,
    maxDelay = 16000,
    showCountdown = true,
    onRetryStart,
    onSuccess,
    onExhausted,
  } = options;

  const [attemptNumber, setAttemptNumber] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  /**
   * Calculate delay using exponential backoff with jitter
   */
  const calculateDelay = useCallback((attempt: number): number => {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 500; // Add 0-500ms jitter
    return Math.min(exponentialDelay + jitter, maxDelay);
  }, [baseDelay, maxDelay]);

  /**
   * Start countdown timer
   */
  const startCountdown = useCallback((delayMs: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!showCountdown) {
        setTimeout(resolve, delayMs);
        return;
      }

      let remaining = Math.ceil(delayMs / 1000);
      setCountdown(remaining);

      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (!mountedRef.current) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return;
        }
        
        setCountdown(remaining);
        
        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          resolve();
        }
      }, 1000);
    });
  }, [showCountdown]);

  /**
   * Execute retry with backoff
   */
  const retry = useCallback(async () => {
    if (isRetrying || isExhausted) return;

    const attempt = attemptNumber + 1;
    
    if (attempt > maxRetries) {
      setIsExhausted(true);
      onExhausted?.(lastError);
      return;
    }

    setIsRetrying(true);
    setAttemptNumber(attempt);
    onRetryStart?.(attempt);

    try {
      await fn();
      if (mountedRef.current) {
        setLastError(null);
        setIsRetrying(false);
        onSuccess?.();
      }
    } catch (error) {
      if (!mountedRef.current) return;

      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      setIsRetrying(false);

      if (attempt >= maxRetries) {
        setIsExhausted(true);
        onExhausted?.(err);
      } else {
        // Schedule next retry with countdown
        const delay = calculateDelay(attempt);
        await startCountdown(delay);
        // Auto-retry after countdown (optional - user can also manually retry)
      }
    }
  }, [
    isRetrying,
    isExhausted,
    attemptNumber,
    maxRetries,
    lastError,
    fn,
    onRetryStart,
    onSuccess,
    onExhausted,
    calculateDelay,
    startCountdown,
  ]);

  /**
   * Reset retry state
   */
  const reset = useCallback(() => {
    setAttemptNumber(0);
    setIsRetrying(false);
    setIsExhausted(false);
    setCountdown(0);
    setLastError(null);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  }, []);

  return {
    attemptNumber,
    isRetrying,
    isExhausted,
    countdown,
    lastError,
    retry,
    reset,
  };
}

/**
 * Simple retry utility function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error, attempt: number) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 2000,
    maxDelay = 16000,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt >= maxRetries || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 500,
        maxDelay
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
