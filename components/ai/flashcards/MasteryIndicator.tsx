"use client";

import { cn } from "@/lib/utils";
import { Star, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MasteryIndicatorProps {
  level: number; // 0-5
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MASTERY_LABELS: Record<number, { label: string; color: string; description: string }> = {
  0: {
    label: "New",
    color: "text-muted-foreground",
    description: "Not yet reviewed",
  },
  1: {
    label: "Learning",
    color: "text-red-500",
    description: "Just started learning",
  },
  2: {
    label: "Familiar",
    color: "text-orange-500",
    description: "Getting familiar",
  },
  3: {
    label: "Good",
    color: "text-yellow-500",
    description: "Good recall",
  },
  4: {
    label: "Strong",
    color: "text-green-500",
    description: "Strong retention",
  },
  5: {
    label: "Mastered",
    color: "text-primary",
    description: "Fully mastered",
  },
};

const SIZES = {
  sm: { icon: "w-3 h-3", gap: "gap-0.5" },
  md: { icon: "w-4 h-4", gap: "gap-1" },
  lg: { icon: "w-5 h-5", gap: "gap-1.5" },
};

/**
 * MasteryIndicator component showing mastery level as stars (0-5).
 * Uses color coding for quick visual feedback.
 */
export function MasteryIndicator({
  level,
  showLabel = false,
  size = "md",
  className,
}: MasteryIndicatorProps) {
  // Ensure level is a valid number, default to 0
  const safeLevel = typeof level === "number" && !isNaN(level) ? level : 0;
  // Round to nearest integer for looking up the label/color
  const roundedLevel = Math.round(Math.min(Math.max(safeLevel, 0), 5));
  const mastery = MASTERY_LABELS[roundedLevel];
  const sizeStyles = SIZES[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center",
              sizeStyles.gap,
              className
            )}
            role="img"
            aria-label={`Mastery level: ${mastery.label} (${level} out of 5)`}
          >
            {/* Stars */}
            <div className={cn("flex items-center", sizeStyles.gap)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    sizeStyles.icon,
                    "transition-colors",
                    star <= level
                      ? mastery.color
                      : "text-muted-foreground/30"
                  )}
                  fill={star <= level ? "currentColor" : "none"}
                />
              ))}
            </div>

            {/* Label */}
            {showLabel && (
              <span
                className={cn(
                  "text-sm font-medium",
                  mastery.color
                )}
              >
                {mastery.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            <strong>{mastery.label}</strong> ({level}/5)
          </p>
          <p className="text-xs text-muted-foreground">
            {mastery.description}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Progress bar style mastery indicator (alternative to stars)
 */
export function MasteryBar({
  level,
  showLabel = false,
  className,
}: MasteryIndicatorProps) {
  // Ensure level is a valid number, default to 0
  const safeLevel = typeof level === "number" && !isNaN(level) ? level : 0;
  // Round to nearest integer for looking up the label/color
  const roundedLevel = Math.round(Math.min(Math.max(safeLevel, 0), 5));
  const mastery = MASTERY_LABELS[roundedLevel];
  const progressPercent = (level / 5) * 100;

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-medium", mastery.color)}>
            {mastery.label}
          </span>
          <span className="text-muted-foreground">{level}/5</span>
        </div>
      )}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            level === 0 && "bg-muted-foreground/30",
            level === 1 && "bg-red-500",
            level === 2 && "bg-orange-500",
            level === 3 && "bg-yellow-500",
            level === 4 && "bg-green-500",
            level === 5 && "bg-primary"
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Dot-style mastery indicator for compact spaces
 */
export function MasteryDots({
  level,
  className,
}: Omit<MasteryIndicatorProps, "showLabel" | "size">) {
  // Ensure level is a valid number, default to 0
  const safeLevel = typeof level === "number" && !isNaN(level) ? level : 0;
  // Round to nearest integer for looking up the label/color
  const roundedLevel = Math.round(Math.min(Math.max(safeLevel, 0), 5));
  const mastery = MASTERY_LABELS[roundedLevel];

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`Mastery level: ${mastery.label} (${level} out of 5)`}
    >
      {[1, 2, 3, 4, 5].map((dot) => (
        <Circle
          key={dot}
          className={cn(
            "w-2 h-2 transition-colors",
            dot <= level ? mastery.color : "text-muted-foreground/30"
          )}
          fill={dot <= level ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
