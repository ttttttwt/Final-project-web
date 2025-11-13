"use client";

import * as React from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import progressService from "@/services/progressService";
import type { DashboardStats } from "@/types/progress";
import { BookOpen, CheckCircle, Flame, TrendingUp } from "lucide-react";
import { toast } from "sonner";

/**
 * Dashboard Page
 *
 * Main dashboard for authenticated users
 * Shows overview of learning progress and stats
 * Features:
 * - Welcome message with user name
 * - Stats cards (enrolled courses, completed lessons, current streak)
 * - Recent activity section
 * - Loading states
 * - Error handling
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch dashboard stats on mount
  React.useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await progressService.getDashboardStats(controller.signal);
        setStats(data);
      } catch (err: unknown) {
        // Ignore cancellation errors
        const code = (err as any)?.code;
        const name = (err as any)?.name;
        if (
          code === "ERR_CANCELED" ||
          name === "CanceledError" ||
          name === "AbortError"
        ) {
          return;
        }
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load dashboard stats";
        setError(errorMessage);
        toast.error("Failed to load dashboard data");
        console.error("Dashboard stats error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    return () => controller.abort();
  }, []);

  // Get user's full name (memoized)
  const fullName = React.useMemo(() => {
    if (!user) return "Learner";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.email.split("@")[0];
  }, [user]);

  // Calculate study hours estimate (placeholder until backend implements)
  const studyHoursEstimate = React.useMemo(
    () => (stats ? Math.round((stats.completedLessons * 30) / 60) : 0),
    [stats]
  );

  const remainingLessons = React.useMemo(
    () =>
      stats ? Math.max(stats.totalLessons - stats.completedLessons, 0) : 0,
    [stats]
  );

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Dashboard">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#202124] dark:text-[#E8EAED] mb-2">
              Welcome back, {fullName}!
            </h1>
            <p className="text-[#5F6368] dark:text-[#9AA0A6]">
              Continue your English learning journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ {error}
              </p>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Enrolled Courses */}
            <StatsCard
              title="Enrolled Courses"
              value={stats?.enrolledCourses || 0}
              icon={BookOpen}
              color="blue"
              subtitle={
                stats?.enrolledCourses === 1
                  ? "Active course"
                  : "Active courses"
              }
              isLoading={isLoading}
            />

            {/* Completed Lessons */}
            <StatsCard
              title="Completed Lessons"
              value={stats?.completedLessons || 0}
              icon={CheckCircle}
              color="green"
              subtitle={
                stats ? `${remainingLessons} remaining` : "Keep learning"
              }
              isLoading={isLoading}
            />

            {/* Study Hours (Estimated) */}
            <StatsCard
              title="Study Hours"
              value={studyHoursEstimate}
              icon={TrendingUp}
              color="yellow"
              subtitle="Total time invested"
              isLoading={isLoading}
            />

            {/* Current Streak */}
            <StatsCard
              title="Current Streak"
              value={`${stats?.currentStreak || 0} days`}
              icon={Flame}
              color="purple"
              subtitle={
                stats?.longestStreak
                  ? `Best: ${stats.longestStreak} days`
                  : "Start your streak"
              }
              isLoading={isLoading}
            />
          </div>

          {/* Recent Activity */}
          <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#202124] dark:text-[#E8EAED]">
                Recent Activity
              </h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ) : stats && stats.enrolledCourses > 0 ? (
              <div className="text-[#5F6368] dark:text-[#9AA0A6]">
                <p className="mb-4">
                  You&apos;re enrolled in {stats.enrolledCourses}{" "}
                  {stats.enrolledCourses === 1 ? "course" : "courses"} with{" "}
                  {stats.completedLessons} lessons completed.
                </p>
                <Button asChild>
                  <Link href="/courses">Continue Learning →</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#5F6368] dark:text-[#9AA0A6] mb-4">
                  No courses yet. Start your learning journey today!
                </p>
                <Button asChild>
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
