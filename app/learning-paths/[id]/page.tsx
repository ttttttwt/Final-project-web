"use client";

/**
 * Learning Path Detail Page
 * Shows individual learning path with courses and user progress
 */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    BookOpen,
    Clock,
    Award,
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { LearningPath, UserPathProgress, CEFR_LEVELS } from "@/types/learningPath";
import learningPathService from "@/services/learningPathService";
import { toast } from "sonner";

export default function LearningPathDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pathId = Number(params.id);

    const [path, setPath] = useState<LearningPath | null>(null);
    const [userProgress, setUserProgress] = useState<UserPathProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (pathId) {
            fetchData();
        }
    }, [pathId]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [pathData, progressData] = await Promise.all([
                learningPathService.getPathById(pathId),
                learningPathService.getMyProgress().catch(() => []),
            ]);

            setPath(pathData);

            // Find user's progress for this specific path
            const currentProgress = progressData.find((p) => p.pathId === pathId);
            setUserProgress(currentProgress || null);
        } catch (err: unknown) {
            const error = err as { response?: { status?: number }; message?: string };
            if (error.response?.status === 404) {
                setError("Learning path not found");
            } else {
                setError(error.message || "Failed to load learning path");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartPath = async () => {
        setIsStarting(true);
        try {
            const progress = await learningPathService.startPath(pathId);
            setUserProgress(progress);
            toast.success(`Started ${path?.name}!`, {
                description: "You can now access the courses in this learning path.",
            });
        } catch (err: unknown) {
            const error = err as { response?: { status?: number }; message?: string };
            if (error.response?.status === 409) {
                toast.info("Already enrolled", {
                    description: "You have already started this learning path.",
                });
                // Refresh data to get current progress
                fetchData();
            } else {
                toast.error("Failed to start path", {
                    description: error.message || "Please try again later.",
                });
            }
        } finally {
            setIsStarting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
                <Skeleton className="h-8 w-32 mb-6" />
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-40 w-full" />
                    <div className="grid gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-24" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !path) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/learning-paths")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Learning Paths
                </Button>
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-semibold mb-2">
                            {error === "Learning path not found"
                                ? "Learning Path Not Found"
                                : "Error Loading Path"}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {error || "The learning path could not be loaded."}
                        </p>
                        <Button onClick={() => router.push("/learning-paths")}>
                            View All Learning Paths
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const cefrInfo = CEFR_LEVELS[path.cefrLevel];
    const isEnrolled = !!userProgress;
    const progressPercent = userProgress?.progressPercentage || 0;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.push("/learning-paths")}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learning Paths
            </Button>

            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge className={`${cefrInfo.color} text-white border-0`}>
                        <Award className="h-3 w-3 mr-1" />
                        {path.cefrLevel} - {cefrInfo.label}
                    </Badge>
                    {isEnrolled && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enrolled
                        </Badge>
                    )}
                    {path.isDefault && (
                        <Badge variant="secondary">Default Path</Badge>
                    )}
                </div>

                <h1 className="text-3xl font-bold mb-2">{path.name}</h1>
                <p className="text-muted-foreground text-lg">
                    {path.description || cefrInfo.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        <span>{path.totalCourses} courses</span>
                    </div>
                    {path.estimatedHours && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span>{path.estimatedHours} hours estimated</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Section (for enrolled users) */}
            {isEnrolled && userProgress && (
                <Card className="mb-8 border-primary/30 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Your Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {userProgress.coursesCompleted} of {userProgress.totalCourses} courses completed
                                </span>
                                <span className="font-semibold">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-3" />
                            {userProgress.currentCourseTitle && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Currently on: </span>
                                    <span className="font-medium">{userProgress.currentCourseTitle}</span>
                                </p>
                            )}
                            {userProgress.isCompleted && (
                                <Badge className="bg-green-500 text-white">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed!
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Button (for non-enrolled users) */}
            {!isEnrolled && (
                <div className="mb-8">
                    <Button
                        size="lg"
                        onClick={handleStartPath}
                        disabled={isStarting}
                        className="gap-2"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Start This Learning Path
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Courses List */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Courses in This Path</h2>

                {path.courses.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No courses have been added to this learning path yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {path.courses
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((course, index) => (
                                <Card
                                    key={course.courseId}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Order Number */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                                {index + 1}
                                            </div>

                                            {/* Course Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">{course.courseTitle}</h3>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {course.courseCefrLevel}
                                                    </Badge>
                                                    <span>{course.sectionCount} sections</span>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            {isEnrolled && (
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={`/courses/${course.courseId}`}>
                                                        View
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>

            {/* CTA for non-enrolled */}
            {!isEnrolled && path.courses.length > 0 && (
                <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
                    <p className="text-muted-foreground mb-4">
                        Start this learning path to access all {path.courses.length} courses and track your progress.
                    </p>
                    <Button
                        size="lg"
                        onClick={handleStartPath}
                        disabled={isStarting}
                        className="gap-2"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Start Learning
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
