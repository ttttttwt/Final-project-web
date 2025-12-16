"use client";

import { cn } from "@/lib/utils";
import { Loader2, Brain, BookOpen, Sparkles } from "lucide-react";

interface AiLoadingStateProps {
  message?: string;
  variant?: "default" | "generating" | "studying";
  className?: string;
}

const VARIANTS = {
  default: {
    icon: Loader2,
    defaultMessage: "Loading...",
  },
  generating: {
    icon: Sparkles,
    defaultMessage: "AI is generating content...",
  },
  studying: {
    icon: Brain,
    defaultMessage: "Preparing your study session...",
  },
};

/**
 * AiLoadingState component for showing loading states during AI operations.
 * Provides visual feedback with contextual icons and messages.
 */
export function AiLoadingState({
  message,
  variant = "default",
  className,
}: AiLoadingStateProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 space-y-4",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon
            className={cn(
              "w-8 h-8 text-primary",
              variant === "default" && "animate-spin"
            )}
          />
        </div>
        {variant !== "default" && (
          <div className="absolute -bottom-1 -right-1">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-center">{displayMessage}</p>
    </div>
  );
}

/**
 * Inline loading indicator for buttons or compact spaces
 */
export function AiLoadingInline({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-2 text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

/**
 * Skeleton card for loading states
 */
export function AiCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-card p-6",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}
