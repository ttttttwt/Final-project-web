"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

/**
 * Animated typing indicator for AI responses.
 * Shows three bouncing dots to indicate the AI is "thinking".
 */
export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-4 py-3 bg-muted rounded-2xl rounded-bl-md w-fit",
        className
      )}
      role="status"
      aria-label="AI is typing"
    >
      <span className="sr-only">AI is typing...</span>
      <span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
        style={{ animationDelay: "0ms", animationDuration: "600ms" }}
      />
      <span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
        style={{ animationDelay: "150ms", animationDuration: "600ms" }}
      />
      <span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
        style={{ animationDelay: "300ms", animationDuration: "600ms" }}
      />
    </div>
  );
}
