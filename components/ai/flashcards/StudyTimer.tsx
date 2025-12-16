"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface StudyTimerProps {
  startedAt: Date;
  className?: string;
}

/**
 * Isolated timer component to prevent full page re-renders.
 * Updates every second but only re-renders itself.
 */
export function StudyTimer({ startedAt, className }: StudyTimerProps) {
  const [elapsed, setElapsed] = useState("0:00");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setElapsed(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>{elapsed}</span>
      </div>
    </div>
  );
}
