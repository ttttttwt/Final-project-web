"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time-utils";
import { GrammarResultDTO } from "@/types/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Clock,
  RefreshCw,
  Home,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface ResultCardProps {
  result: GrammarResultDTO;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

/**
 * Displays the result of a grammar exercise submission.
 * Shows score, percentage, pass/fail status, and encouragement.
 */
export function ResultCard({
  result,
  onRetry,
  onGoHome,
  className,
}: ResultCardProps) {
  const isPassed = result.passed;
  const percentage = result.percentage;

  const getScoreEmoji = (): string => {
    if (percentage >= 90) return "🎉";
    if (percentage >= 80) return "✨";
    if (percentage >= 70) return "👍";
    if (percentage >= 50) return "💪";
    return "📚";
  };

  const getScoreMessage = (): string => {
    if (percentage >= 90) return "Excellent!";
    if (percentage >= 80) return "Great job!";
    if (percentage >= 70) return "Good work!";
    if (percentage >= 50) return "Keep practicing!";
    return "Don't give up!";
  };



  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header with gradient */}
      <div
        className={cn(
          "p-6 text-white",
          isPassed
            ? "bg-gradient-to-r from-green-500 to-emerald-600"
            : "bg-gradient-to-r from-amber-500 to-orange-600"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPassed ? (
                <Trophy className="w-6 h-6" />
              ) : (
                <Target className="w-6 h-6" />
              )}
              <span className="text-lg font-semibold">
                {isPassed ? "Passed!" : "Try Again"}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{result.grammarPoint}</h2>
            <p className="text-white/80 text-sm mt-1">Level: {result.cefrLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold">{getScoreEmoji()}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-primary">
              {result.score}/{result.maxScore}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Correct</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p
              className={cn(
                "text-3xl font-bold",
                percentage >= 70 ? "text-green-600" : "text-amber-600"
              )}
            >
              {percentage.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Score</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <p className="text-xl font-bold">{formatDuration(result.timeSpentSeconds)}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Time</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Passing threshold: 70%</span>
            <span className={cn(isPassed ? "text-green-600" : "text-amber-600")}>
              {getScoreMessage()}
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn(
              "h-3",
              isPassed
                ? "[&>div]:bg-green-500"
                : "[&>div]:bg-amber-500"
            )}
          />
        </div>

        {/* Encouragement */}
        {result.encouragement && (
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-lg",
            isPassed ? "bg-green-50 dark:bg-green-950/20" : "bg-amber-50 dark:bg-amber-950/20"
          )}>
            <Sparkles className={cn(
              "w-5 h-5 mt-0.5 flex-shrink-0",
              isPassed ? "text-green-600" : "text-amber-600"
            )} />
            <p className="text-sm">{result.encouragement}</p>
          </div>
        )}

        {/* Areas to improve */}
        {result.areasToImprove && result.areasToImprove.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Areas to Improve
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {result.areasToImprove.map((area, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question breakdown summary */}
        <div className="space-y-2">
          <h4 className="font-medium">Question Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {result.feedback.map((fb, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                  fb.correct
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                )}
                title={fb.correct ? "Correct" : "Incorrect"}
              >
                {fb.correct ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRetry && (
            <Button
              variant={isPassed ? "outline" : "default"}
              className="flex-1 gap-2"
              onClick={onRetry}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button
              variant={isPassed ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={onGoHome}
            >
              <Home className="w-4 h-4" />
              Back to Grammar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
