"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, CheckCircle2, Star } from "lucide-react";
import { StudyTimer } from "./StudyTimer";

interface StudyStats {
  newCount: number;
  learningCount: number;
  reviewCount: number;
  masteredCount: number;
}

interface StudyProgressProps {
  current: number;
  total: number;
  correctCount: number;
  incorrectCount: number;
  stats?: StudyStats;
  startedAt: Date;
  className?: string;
}

/**
 * StudyProgress component showing progress bar, session stats, and time elapsed.
 */
export function StudyProgress({
  current,
  total,
  correctCount,
  incorrectCount,
  stats,
  startedAt,
  className,
}: StudyProgressProps) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;
  const accuracy =
    correctCount + incorrectCount > 0
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
      : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Card {Math.min(current + 1, total)} of {total}
          </span>
          <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time elapsed - isolated timer component for performance */}
        <StudyTimer startedAt={startedAt} />

        {/* Accuracy */}
        {(correctCount > 0 || incorrectCount > 0) && (
          <Badge
            variant={accuracy >= 70 ? "default" : "secondary"}
            className={cn(
              accuracy >= 70
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : ""
            )}
          >
            {accuracy}% accuracy
          </Badge>
        )}

        {/* Correct/Incorrect counts */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{correctCount}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-destructive">
            <span className="font-medium">✕</span>
            <span>{incorrectCount}</span>
          </div>
        </div>
      </div>

      {/* Card type breakdown */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          {stats.newCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />
              {stats.newCount} new
            </Badge>
          )}
          {stats.learningCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1 text-blue-500" />
              {stats.learningCount} learning
            </Badge>
          )}
          {stats.reviewCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Brain className="w-3 h-3 mr-1 text-purple-500" />
              {stats.reviewCount} review
            </Badge>
          )}
          {stats.masteredCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
              {stats.masteredCount} mastered
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for mobile or sidebar display
 */
export function StudyProgressCompact({
  current,
  total,
  className,
}: Pick<StudyProgressProps, "current" | "total" | "className">) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Progress value={progressPercent} className="h-1.5 flex-1" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {current}/{total}
      </span>
    </div>
  );
}
