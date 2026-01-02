"use client";

import { cn } from "@/lib/utils";
import { Loader2, Brain, BookOpen, Sparkles, MessageSquare, CreditCard } from "lucide-react";

interface AiLoadingStateProps {
  message?: string;
  variant?: "default" | "generating" | "studying" | "streaming";
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
  streaming: {
    icon: MessageSquare,
    defaultMessage: "AI is responding...",
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

/**
 * Streaming indicator for AI responses - pulsing dots animation
 */
export function StreamingIndicator({
  message = "AI is thinking",
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
      aria-label={message}
    >
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-sm">{message}</span>
    </div>
  );
}

/**
 * Typing indicator for chat bubbles
 */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-3 bg-muted rounded-lg w-fit",
        className
      )}
      role="status"
      aria-label="AI is typing"
    >
      <span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"
        style={{ animationDelay: "200ms" }}
      />
      <span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
}

/**
 * Skeleton for roleplay scenario cards
 */
export function RoleplaySkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-card p-6",
        className
      )}
      role="status"
      aria-label="Loading roleplay scenario"
    >
      <div className="space-y-4">
        {/* Header with icon */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>

        {/* Context text */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>

        {/* Roles section */}
        <div className="flex gap-4 pt-2">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>

        {/* Vocabulary pills */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-muted rounded-full w-16" />
          <div className="h-6 bg-muted rounded-full w-20" />
          <div className="h-6 bg-muted rounded-full w-14" />
        </div>

        {/* Action button */}
        <div className="h-10 bg-muted rounded w-full mt-4" />
      </div>
    </div>
  );
}

/**
 * Skeleton for grammar exercise cards
 */
export function GrammarExerciseSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-card p-6",
        className
      )}
      role="status"
      aria-label="Loading grammar exercise"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-5 bg-muted rounded-full w-16" />
        </div>

        {/* Question */}
        <div className="space-y-2 py-4">
          <div className="h-5 bg-muted rounded w-full" />
          <div className="h-5 bg-muted rounded w-4/5" />
        </div>

        {/* Options */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 bg-muted rounded-lg w-full"
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="pt-4">
          <div className="h-2 bg-muted rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for flashcard deck cards
 */
export function FlashcardDeckSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-card p-0 flex flex-col xl:flex-row overflow-hidden",
        className
      )}
      role="status"
      aria-label="Loading flashcard deck"
    >
      {/* Left icon area skeleton */}
      <div className="flex-shrink-0 flex items-center justify-center p-4 xl:w-48 xl:bg-muted/20">
        <div className="w-16 h-16 xl:w-24 xl:h-24 rounded-2xl bg-muted" />
      </div>

      <div className="flex-1 flex flex-col xl:flex-row">
        <div className="flex-1 p-4 xl:p-6 space-y-4">
          {/* Header area skeleton */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded w-12" />
              <div className="h-5 bg-muted rounded w-24" />
            </div>
            <div className="h-7 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full xl:w-2/3" />
          </div>

          {/* Stats area skeleton */}
          <div className="flex gap-6 pt-2">
            <div className="h-4 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>

          {/* Mastery progress skeleton */}
          <div className="space-y-2 max-w-sm">
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-3 bg-muted rounded w-10" />
            </div>
            <div className="h-2 bg-muted rounded-full w-full" />
          </div>
        </div>

        {/* Action area skeleton */}
        <div className="p-4 xl:p-6 flex items-center gap-3 min-w-[180px] xl:border-l xl:border-dashed">
          <div className="h-10 xl:h-12 bg-muted rounded flex-1" />
          <div className="w-10 h-10 xl:w-12 xl:h-12 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for flashcard study card (flip card)
 */
export function FlashcardStudySkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border-2 border-border bg-card p-8 aspect-[3/2] max-w-lg mx-auto",
        className
      )}
      role="status"
      aria-label="Loading flashcard"
    >
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-6 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for chat message bubble
 */
export function ChatMessageSkeleton({
  isUser = false,
  className,
}: {
  isUser?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
      role="status"
      aria-label="Loading message"
    >
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      <div
        className={cn(
          "animate-pulse rounded-lg p-4 max-w-[70%] space-y-2",
          isUser ? "bg-primary/20" : "bg-muted"
        )}
      >
        <div className="h-4 bg-muted-foreground/20 rounded w-48" />
        <div className="h-4 bg-muted-foreground/20 rounded w-36" />
      </div>
    </div>
  );
}

/**
 * Full page loading state for AI features
 */
export function AiPageLoadingState({
  title = "Loading AI Feature",
  message = "Please wait while we prepare your content...",
  className,
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-6",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

