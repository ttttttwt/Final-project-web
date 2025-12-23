"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time-utils";
import { GrammarProgressDTO } from "@/types/ai";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Trophy,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ExerciseSetCardProps {
  progress: GrammarProgressDTO;
  onClick?: () => void;
  className?: string;
}

/**
 * Card displaying a completed grammar exercise set with score and status.
 */
export function ExerciseSetCard({
  progress,
  onClick,
  className,
}: ExerciseSetCardProps) {
  const cefrColors: Record<string, string> = {
    A1: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    A2: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    B1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    B2: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    C1: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    C2: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };



  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50",
        progress.completedAt ? (progress.passed ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500") : "border-l-4 border-l-blue-500",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-semibold",
                  cefrColors[progress.cefrLevel] || ""
                )}
              >
                {progress.cefrLevel}
              </Badge>
              {!progress.completedAt ? (
                <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Clock className="w-3 h-3 mr-1" />
                  Not Started
                </Badge>
              ) : progress.passed ? (
                <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Passed
                </Badge>
              ) : (
                <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <XCircle className="w-3 h-3 mr-1" />
                  Try Again
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {progress.grammarPoint}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              {!progress.completedAt ? (
                <Sparkles className="w-6 h-6 text-primary" />
              ) : progress.passed ? (
                <Trophy className="w-6 h-6 text-primary" />
              ) : (
                <BookOpen className="w-6 h-6 text-primary" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="text-center">
              <p className={cn("text-2xl font-bold", progress.completedAt ? getScoreColor(progress.percentage) : "text-muted-foreground")}>
                {progress.completedAt ? `${progress.score}/${progress.maxScore}` : `-/${progress.maxScore}`}
              </p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>

            {/* Percentage */}
            <div className="text-center">
              <p className={cn("text-2xl font-bold", progress.completedAt ? getScoreColor(progress.percentage) : "text-muted-foreground")}>
                {progress.completedAt ? `${progress.percentage.toFixed(0)}%` : "0%"}
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>

            {/* Time */}
            {progress.completedAt && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(progress.timeSpentSeconds)}</span>
              </div>
            )}
          </div>

          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground mt-3">
          {progress.completedAt 
            ? `Completed ${formatDistanceToNow(new Date(progress.completedAt), { addSuffix: true })}`
            : `Generated recently`}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for ExerciseSetCard.
 */
export function ExerciseSetCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-muted">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-10 mt-1 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-10 mt-1 mx-auto" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
        <Skeleton className="h-3 w-32 mt-3" />
      </CardContent>
    </Card>
  );
}
