"use client";

import { cn } from "@/lib/utils";
import { formatHoursDuration } from "@/lib/time-utils";
import { GrammarStatsDTO } from "@/types/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Target,
  Clock,
  Flame,
  TrendingUp,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface StatsPanelProps {
  stats: GrammarStatsDTO;
  className?: string;
}

/**
 * Panel displaying user's grammar exercise statistics.
 */
export function StatsPanel({ stats, className }: StatsPanelProps) {
  const passRate = stats.totalCompleted > 0 
    ? (stats.totalPassed / stats.totalCompleted) * 100 
    : 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Completed */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          {/* Total Passed */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalPassed}
              </p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
          </div>

          {/* Average Score */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.averageScore.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </div>

          {/* Time Spent */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatHoursDuration(stats.totalTimeSpentSeconds)}
              </p>
              <p className="text-xs text-muted-foreground">Time Spent</p>
            </div>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pass Rate</span>
            <span className="font-medium">{passRate.toFixed(0)}%</span>
          </div>
          <Progress value={passRate} className="h-2" />
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium">Current Streak</p>
              <p className="text-xs text-muted-foreground">
                Best: {stats.longestStreak} days
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats.currentStreak}
            </p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        </div>

        {/* Achievement badge if streak is good */}
        {stats.currentStreak >= 7 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {stats.currentStreak >= 30
                ? "🏆 Grammar Master!"
                : stats.currentStreak >= 14
                ? "⭐ Grammar Pro!"
                : "🔥 On Fire!"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for StatsPanel.
 */
export function StatsPanelSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
