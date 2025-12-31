"use client";

/**
 * Learning Paths Page
 * Displays all available learning paths with recommended path highlighted
 *
 * Features:
 * - Shows all 6 default CEFR paths (A1-C2)
 * - Highlights recommended path based on user level
 * - Shows started paths with progress
 * - Allows starting new paths
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LearningPathCard } from "@/components/learning-paths";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LearningPath, UserPathProgress } from "@/types/learningPath";
import learningPathService from "@/services/learningPathService";
import { toast } from "sonner";

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [recommendedPath, setRecommendedPath] = useState<LearningPath | null>(
    null
  );
  const [userProgress, setUserProgress] = useState<UserPathProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [allPaths, recommended, progress] = await Promise.all([
        learningPathService.getAllPaths(),
        learningPathService.getRecommended().catch(() => null), // Optional
        learningPathService.getMyProgress().catch(() => []), // Optional
      ]);

      setPaths(allPaths);
      setRecommendedPath(recommended);
      setUserProgress(progress);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to load learning paths", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathStarted = () => {
    // Refresh data after starting a path
    fetchData();
  };

  const isPathStarted = (pathId: number): boolean => {
    return userProgress.some((p) => p.pathId === pathId);
  };

  const getPathProgress = (pathId: number): number => {
    const progress = userProgress.find((p) => p.pathId === pathId);
    return progress?.progressPercentage || 0;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout showSidebar={true} pageTitle="Learning Paths">
          <div className="space-y-4 mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Learning Paths">
        <div className="space-y-8 pb-8">
          {/* Page Header with Back Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-2">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold mb-2">Learning Paths</h1>
              <p className="text-muted-foreground">
                Structured learning journeys aligned with CEFR levels. Start with your
                recommended path or choose any level to begin.
              </p>
            </div>
          </div>

          {/* Recommended Path Section */}
          {recommendedPath && !isPathStarted(recommendedPath.id) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-2xl font-semibold">Recommended for You</h2>
              </div>
              <div className="max-w-md">
                <LearningPathCard
                  path={recommendedPath}
                  isRecommended={true}
                  onStartPath={handlePathStarted}
                />
              </div>
            </div>
          )}

          {/* All Paths Grid */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {userProgress.length > 0 ? "All Learning Paths" : "Choose Your Path"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  isRecommended={recommendedPath?.id === path.id}
                  isStarted={isPathStarted(path.id)}
                  progress={getPathProgress(path.id)}
                  onStartPath={handlePathStarted}
                />
              ))}
            </div>
          </div>

          {/* Empty State */}
          {paths.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No learning paths available at the moment.
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
