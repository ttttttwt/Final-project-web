"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModeToggleProps {
  mode: "immersive" | "learning";
  onChange: (mode: "immersive" | "learning") => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Mode toggle button for switching between Immersive and Learning modes.
 * - Immersive: Fast chat-only for fluency practice (<1s response)
 * - Learning: Chat with grammar/vocabulary feedback (<3s response)
 */
export function ModeToggle({
  mode,
  onChange,
  disabled = false,
  className,
}: ModeToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 bg-muted rounded-lg",
        disabled && "opacity-50",
        className
      )}
      role="radiogroup"
      aria-label="Conversation mode"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("immersive")}
        disabled={disabled}
        className={cn(
          "relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
          mode === "immersive"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        role="radio"
        aria-checked={mode === "immersive"}
      >
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {mode === "immersive" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                mode === "immersive" ? "bg-green-500" : "bg-muted-foreground/40"
              )}
            />
          </span>
          Immersive
        </span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("learning")}
        disabled={disabled}
        className={cn(
          "relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
          mode === "learning"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        role="radio"
        aria-checked={mode === "learning"}
      >
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {mode === "learning" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                mode === "learning" ? "bg-blue-500" : "bg-muted-foreground/40"
              )}
            />
          </span>
          Learning
        </span>
      </Button>
    </div>
  );
}

/**
 * Mode description component for explaining the current mode.
 */
interface ModeDescriptionProps {
  mode: "immersive" | "learning";
  className?: string;
}

export function ModeDescription({ mode, className }: ModeDescriptionProps) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {mode === "immersive" ? (
        <>
          <span className="font-medium text-green-600 dark:text-green-400">
            Immersive Mode
          </span>
          : Fast responses for fluency practice. Focus on natural conversation flow.
        </>
      ) : (
        <>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            Learning Mode
          </span>
          : Get grammar and vocabulary feedback on your messages.
        </>
      )}
    </p>
  );
}
