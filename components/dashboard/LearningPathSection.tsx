"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import learningPathService from "@/services/learningPathService";
import type { UserPathProgress, LearningPath } from "@/types/learningPath";
import {
    GraduationCap,
    BookOpen,
    ChevronRight,
    Sparkles,
    Target,
    Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LearningPathSection Component
 *
 * Displays the user's current learning path progress on the Dashboard.
 * Shows:
 * - Current enrolled path with progress
 * - Recommended path if no enrollment
 * - Quick actions to continue or start learning
 */

interface LearningPathSectionProps {
    className?: string;
}

export function LearningPathSection({ className }: LearningPathSectionProps) {
    const [userProgress, setUserProgress] = React.useState<UserPathProgress[]>([]);
    const [recommendedPath, setRecommendedPath] = React.useState<LearningPath | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [progress, recommended] = await Promise.all([
                learningPathService.getMyProgress().catch(() => []),
                learningPathService.getRecommended().catch(() => null),
            ]);
            setUserProgress(progress);
            setRecommendedPath(recommended);
        } catch (error) {
            console.error("Failed to fetch learning path data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Find the active (non-completed) path or the most recent one
    const activePath = userProgress.find((p) => !p.isCompleted) || userProgress[0];

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        );
    }

    // User has an active learning path
    if (activePath) {
        return (
            <Card className={cn("overflow-hidden", className)}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Your Learning Path
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            {activePath.pathCefrLevel}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Path Info */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-1">
                            {activePath.pathName}
                        </h4>
                        {activePath.currentCourseTitle && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" />
                                Currently: {activePath.currentCourseTitle}
                            </p>
                        )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-semibold text-primary">
                                {Math.round(activePath.progressPercentage)}%
                            </span>
                        </div>
                        <Progress value={activePath.progressPercentage} className="h-2.5" />
                        <p className="text-xs text-muted-foreground">
                            {activePath.coursesCompleted} of {activePath.totalCourses} courses completed
                        </p>
                    </div>

                    {/* Completed Badge */}
                    {activePath.isCompleted && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                Path Completed! 🎉
                            </span>
                        </div>
                    )}

                    {/* Action Button */}
                    <Button asChild className="w-full">
                        <Link href={`/learning-paths/${activePath.pathId}`}>
                            {activePath.isCompleted ? "View Achievements" : "Continue Learning"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // No active path - show recommendation or CTA
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Start Your Learning Journey
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {recommendedPath ? (
                    <>
                        {/* Recommended Path */}
                        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium text-primary">Recommended for You</span>
                            </div>
                            <h4 className="font-semibold text-foreground mb-1">
                                {recommendedPath.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {recommendedPath.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <Badge variant="outline">{recommendedPath.cefrLevel}</Badge>
                                <span>{recommendedPath.totalCourses} courses</span>
                                <span>{recommendedPath.estimatedHours}h estimated</span>
                            </div>
                        </div>

                        <Button asChild className="w-full">
                            <Link href={`/learning-paths/${recommendedPath.id}`}>
                                Start This Path
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </>
                ) : (
                    <>
                        {/* No recommendation - generic CTA */}
                        <div className="text-center py-4">
                            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground mb-4">
                                Choose a structured learning path to guide your English learning journey.
                            </p>
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/learning-paths">
                                Browse Learning Paths
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
