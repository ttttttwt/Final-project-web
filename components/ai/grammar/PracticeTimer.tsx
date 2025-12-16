"use client";

import { useEffect, useState, useCallback, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { formatTimeDisplay } from "@/lib/time-utils";
import { Clock } from "lucide-react";

interface PracticeTimerProps {
  /** Initial time in seconds (null for count-up timer) */
  initialTimeSeconds: number | null;
  /** Callback when countdown reaches zero */
  onTimeUp?: () => void;
  /** Whether the timer is active */
  isActive: boolean;
  /** Callback to report elapsed time */
  onTimeChange?: (elapsedSeconds: number) => void;
  className?: string;
}

/**
 * Timer component for grammar practice sessions.
 * Supports both countdown (with time limit) and count-up (no limit) modes.
 * Isolated to prevent parent re-renders every second.
 */
export const PracticeTimer = memo(function PracticeTimer({
  initialTimeSeconds,
  onTimeUp,
  isActive,
  onTimeChange,
  className,
}: PracticeTimerProps) {
  // For countdown mode: remaining time
  // For count-up mode: elapsed time
  const [displayTime, setDisplayTime] = useState(initialTimeSeconds ?? 0);
  const isCountdown = initialTimeSeconds !== null && initialTimeSeconds > 0;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const onTimeChangeRef = useRef(onTimeChange);

  // Keep refs updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeUp, onTimeChange]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplayTime((prev) => {
        if (isCountdown) {
          // Countdown mode
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onTimeUpRef.current?.();
            return 0;
          }
          return prev - 1;
        } else {
          // Count-up mode
          const newTime = prev + 1;
          onTimeChangeRef.current?.(newTime);
          return newTime;
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isCountdown]);

  // Reset when initial time changes
  useEffect(() => {
    setDisplayTime(initialTimeSeconds ?? 0);
  }, [initialTimeSeconds]);

  const isLowTime = isCountdown && displayTime <= 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
        isLowTime
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-pulse"
          : "bg-muted",
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={isCountdown ? "Time remaining" : "Time elapsed"}
    >
      <Clock className="w-5 h-5" />
      <span>{formatTimeDisplay(displayTime)}</span>
    </div>
  );
});
