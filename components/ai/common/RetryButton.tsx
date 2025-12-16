"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

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
