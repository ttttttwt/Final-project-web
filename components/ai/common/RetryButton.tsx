"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, ExternalLink, AlertCircle } from "lucide-react";

interface RetryButtonProps {
  onRetry: () => void;
  isRetrying?: boolean;
  retryText?: string;
  retryingText?: string;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | "accent";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
}

/**
 * RetryButton component with loading state.
 * Shows spinning icon while retrying.
 */
export function RetryButton({
  onRetry,
  isRetrying = false,
  retryText = "Try Again",
  retryingText = "Retrying...",
  disabled,
  className,
  variant = "outline",
  size = "sm",
}: RetryButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onRetry}
      disabled={disabled || isRetrying}
      className={cn(className)}
    >
      {isRetrying ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {retryingText}
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </>
      )}
    </Button>
  );
}

interface RetryButtonWithCountdownProps extends RetryButtonProps {
  /** Countdown seconds until next retry */
  countdown?: number;
  /** Current attempt number */
  attemptNumber?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Whether max retries exhausted */
  isExhausted?: boolean;
  /** Show attempt count badge */
  showAttemptCount?: boolean;
}

/**
 * RetryButton with countdown timer and attempt tracking.
 * Used with useRetryWithBackoff hook for exponential backoff.
 * 
 * @example
 * ```tsx
 * const { retry, isRetrying, countdown, attemptNumber, isExhausted } = useRetryWithBackoff(fn);
 * 
 * <RetryButtonWithCountdown
 *   onRetry={retry}
 *   isRetrying={isRetrying}
 *   countdown={countdown}
 *   attemptNumber={attemptNumber}
 *   isExhausted={isExhausted}
 * />
 * ```
 */
export function RetryButtonWithCountdown({
  onRetry,
  isRetrying = false,
  countdown = 0,
  attemptNumber = 0,
  maxRetries = 3,
  isExhausted = false,
  showAttemptCount = true,
  retryText = "Try Again",
  retryingText = "Retrying...",
  disabled,
  className,
  variant = "default",
  size = "sm",
}: RetryButtonWithCountdownProps) {
  // If exhausted, show contact support
  if (isExhausted) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>Maximum retries reached</span>
        </div>
        <Button 
          variant="outline" 
          size={size} 
          asChild
        >
          <a 
            href="mailto:support@lexia.app" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </Button>
      </div>
    );
  }

  // During countdown
  if (countdown > 0) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled
        className={cn("cursor-not-allowed", className)}
      >
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        Retry in {countdown}s
        {showAttemptCount && attemptNumber > 0 && (
          <span className="ml-2 text-xs opacity-70">
            ({attemptNumber}/{maxRetries})
          </span>
        )}
      </Button>
    );
  }

  // Normal retry button
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onRetry}
      disabled={disabled || isRetrying}
      className={cn(className)}
    >
      {isRetrying ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {retryingText}
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
          {showAttemptCount && attemptNumber > 0 && (
            <span className="ml-2 text-xs opacity-70">
              ({attemptNumber}/{maxRetries})
            </span>
          )}
        </>
      )}
    </Button>
  );
}

/**
 * Compact inline retry link
 */
export function RetryLink({
  onRetry,
  isRetrying = false,
  text = "Try again",
  className,
}: {
  onRetry: () => void;
  isRetrying?: boolean;
  text?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={isRetrying}
      className={cn(
        "inline-flex items-center gap-1 text-primary hover:text-primary/80 underline-offset-4 hover:underline text-sm transition-colors",
        isRetrying && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isRetrying ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Retrying...</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3 h-3" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
