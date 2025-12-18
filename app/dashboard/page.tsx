"use client";

import * as React from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LearningGoals } from "@/components/dashboard/LearningGoals";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { ProWelcomeBanner } from "@/components/dashboard/ProWelcomeBanner";
import { LearningPathSection } from "@/components/dashboard/LearningPathSection";
import progressService from "@/services/progressService";
import type { DashboardOverview } from "@/types/progress";
import { BookOpen, CheckCircle, Flame, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";

/**
 * Dashboard Page
 *
 * Main dashboard for authenticated users
 * Shows overview of learning progress and stats
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isPro, fetchSubscription } = useSubscriptionStore();
  const [data, setData] = React.useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch subscription status on mount
  React.useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Fetch dashboard stats on mount
  React.useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const overview = await progressService.getDashboardOverview(controller.signal);
        setData(overview);
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
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(errorMessage);
        toast.error("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  // Get user's full name (memoized)
  const fullName = React.useMemo(() => {
    if (!user) return "Learner";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.email.split("@")[0];
  }, [user]);

  const stats = data?.stats;

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Dashboard">
        <div className="space-y-8 pb-8">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#202124] dark:text-[#E8EAED] mb-2">
                Welcome back, {fullName}!
              </h1>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>

          {/* Pro Welcome Banner */}
          {isPro && <ProWelcomeBanner />}

          {/* Error Message */}
          {error && (
            <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ {error}
              </p>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <StatsCard
              title="Completed Lessons"
              value={stats?.completedLessons || 0}
              icon={CheckCircle}
              color="green"
              subtitle={`${stats?.totalLessons ? stats.totalLessons - stats.completedLessons : 0} remaining`}
              isLoading={isLoading}
            />

            <StatsCard
              title="Study Time"
              value={`${Math.round((stats?.totalStudyMinutes || 0) / 60)}h ${(stats?.totalStudyMinutes || 0) % 60}m`}
              icon={Clock}
              color="blue"
              subtitle="Total time invested"
              isLoading={isLoading}
            />

            <StatsCard
              title="Average Score"
              value={`${stats?.averageScore || 0}%`}
              icon={Trophy}
              color="yellow"
              subtitle="Across all quizzes"
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recommendations */}
              <RecommendationCard
                recommendations={data?.recommendations || []}
                isLoading={isLoading}
              />

              {/* Recent Activity */}
              <ActivityList
                activities={data?.recentActivities || []}
                isLoading={isLoading}
              />
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-8">
              {/* Learning Path Section */}
              <LearningPathSection />

              {/* Weekly Goals */}
              <LearningGoals
                goals={data?.weeklyGoals || []}
                isLoading={isLoading}
              />

              {/* Quick Actions / Enrolled Courses Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                  My Courses
                </h3>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                ) : stats && stats.enrolledCourses > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You are enrolled in <span className="font-medium text-foreground">{stats.enrolledCourses}</span> courses.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/courses">Go to My Courses</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      No active courses.
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/courses">Explore Catalog</Link>
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
