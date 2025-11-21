"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import progressService from "@/services/progressService";
import type { ProgressSummary, StreakData } from "@/types/progress";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  Flame,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { StreakCalendar } from "@/components/progress/StreakCalendar";

/**
 * Progress Dashboard Page
 * Displays user's learning progress, streak, and activity charts
 */
export default function ProgressPage() {
  const [progressSummary, setProgressSummary] =
    useState<ProgressSummary | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProgressData = async () => {
      try {
        setLoading(true);

        // Fetch both progress summary and streak data
        const [summary, streak] = await Promise.all([
          progressService.getProgressSummary(30, controller.signal),
          progressService.getStreak(controller.signal),
        ]);

        setProgressSummary(summary);
        setStreakData(streak);
      } catch (error: any) {
        if (error.name !== "AbortError" && !axios.isCancel(error)) {
          console.error("Failed to fetch progress data:", error);
          toast.error("Failed to load progress data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();

    return () => {
      controller.abort();
    };
  }, []);

  // Format time spent as hours and minutes
  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Progress">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Learning Progress
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your learning journey and achievements
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Lessons Completed */}
            <Card className="p-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Lessons Completed
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {progressSummary?.totalLessonsCompleted ?? 0}
                  </p>
                </>
              )}
            </Card>

            {/* Total Time Spent */}
            <Card className="p-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Time Spent</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {formatTimeSpent(
                      progressSummary?.totalTimeSpentMinutes ?? 0
                    )}
                  </p>
                </>
              )}
            </Card>

            {/* Current Streak */}
            <Card className="p-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-medium">Current Streak</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {streakData?.currentStreak ?? 0}
                    </p>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      days
                    </span>
                  </div>
                  {streakData?.isActiveToday && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      ✓ Active today
                    </p>
                  )}
                </>
              )}
            </Card>

            {/* Longest Streak */}
            <Card className="p-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">Longest Streak</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {streakData?.longestStreak ?? 0}
                    </p>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      days
                    </span>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Progress Chart Section */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Learning Activity
              </h2>
            </div>

            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ProgressChart data={progressSummary?.dailyActivities ?? []} />
            )}
          </Card>

          {/* Streak Calendar Section */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Activity Calendar
              </h2>
            </div>

            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <StreakCalendar
                dailyActivities={progressSummary?.dailyActivities ?? []}
                streakData={streakData}
              />
            )}
          </Card>

          {/* Additional Stats */}
          {!loading && progressSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Days (Last 30)
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {progressSummary.activeDays}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {Math.round((progressSummary.activeDays / 30) * 100)}% of days
                </p>
              </Card>

              <Card className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Time Per Lesson
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTimeSpent(progressSummary.averageTimePerLesson)}
                </p>
              </Card>

              <Card className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Active Days
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {streakData?.totalActiveDays ?? 0}
                </p>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
