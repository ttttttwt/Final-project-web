"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentRenderer, LessonNavigation } from "@/components/lessons";
import { LessonSidebar } from "@/components/lessons/LessonSidebar";
import { toast } from "sonner";
import lessonService from "@/services/lessonService";
import progressService from "@/services/progressService";
import { useLessonNavigation } from "@/hooks/useLessonNavigation";
import type { Lesson } from "@/types/lesson";
import { parseLessonContent, LESSON_TYPE_INFO } from "@/types/lesson";
import confetti from "canvas-confetti";

interface LessonViewerClientProps {
    courseId: string;
    lessonId: string;
}

export default function LessonViewerClient({
    courseId: courseIdParam,
    lessonId: lessonIdParam,
}: LessonViewerClientProps) {
    const router = useRouter();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const lessonId = parseInt(lessonIdParam);
    const courseId = parseInt(courseIdParam);

    // Lesson navigation data
    const {
        prevLessonId,
        nextLessonId,
        currentIndex,
        totalLessons,
        allLessons,
        isLoading: isNavLoading,
    } = useLessonNavigation(courseId, lessonId);

    useEffect(() => {
        fetchLesson();
        fetchProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonId]);

    const fetchLesson = async () => {
        setIsLoading(true);
        try {
            const data = await lessonService.getLessonById(lessonId);
            setLesson(data);
        } catch (error: unknown) {
            const err = error as { response?: { status?: number }; message?: string };
            if (err.response?.status === 404) {
                toast.error("Lesson not found");
                router.push(`/courses/${courseId}`);
            } else {
                toast.error("Failed to load lesson", {
                    description: err.message || "Please try again later.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const progress = await progressService.getCourseProgress(courseId);
            const completed = progress.lessonProgress
                .filter((l) => l.status === "COMPLETED")
                .map((l) => l.lessonId);
            setCompletedLessonIds(completed);

            // Check if current lesson is completed
            if (completed.includes(lessonId)) {
                setIsCompleted(true);
            }
        } catch (error) {
            console.error("Failed to fetch progress:", error);
        }
    };

    const handleCompleteLesson = async () => {
        setIsCompleting(true);
        try {
            await progressService.completeLesson(lessonId);

            // Trigger confetti animation
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#22c55e", "#10b981", "#34d399", "#6ee7b7"],
            });

            setIsCompleted(true);
            setCompletedLessonIds((prev) => [...prev, lessonId]);
        } catch (error: unknown) {
            const err = error as { response?: { status?: number }; message?: string };
            toast.error("Failed to complete lesson", {
                description: err.message || "Please try again later.",
            });
        } finally {
            setIsCompleting(false);
        }
    };

    if (isLoading || isNavLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!lesson) return null;

    const parsedLesson = parseLessonContent(lesson);
    const typeInfo = LESSON_TYPE_INFO[lesson.lessonType];

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar - Desktop */}
            <div className="hidden md:block w-80 h-full border-r">
                <LessonSidebar
                    courseId={courseId}
                    currentLessonId={lessonId}
                    lessons={allLessons || []}
                    completedLessonIds={completedLessonIds}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
                    <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-background border-r shadow-lg">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="font-semibold">Course Content</h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowMobileSidebar(false)}>
                                Close
                            </Button>
                        </div>
                        <div className="h-full overflow-y-auto pb-20">
                            <LessonSidebar
                                courseId={courseId}
                                currentLessonId={lessonId}
                                lessons={allLessons || []}
                                completedLessonIds={completedLessonIds}
                                className="border-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => router.push(`/courses/${courseId}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Course
                        </Button>
                        <div className="h-6 w-px bg-border hidden md:block" />
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className={`${typeInfo.color} border-0`}
                            >
                                {typeInfo.label}
                            </Badge>
                            <h1 className="text-lg font-semibold truncate max-w-[300px] md:max-w-md">
                                {lesson.title}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.durationMinutes} min</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-8 pb-20">
                        <ContentRenderer
                            lessonType={lesson.lessonType}
                            parsedContent={parsedLesson.parsedContent}
                        />

                        <LessonNavigation
                            courseId={courseId}
                            currentLessonId={lessonId}
                            prevLessonId={prevLessonId}
                            nextLessonId={nextLessonId}
                            currentIndex={currentIndex}
                            totalLessons={totalLessons}
                        />

                        <div className="flex justify-center pt-8">
                            {isCompleted ? (
                                nextLessonId ? (
                                    <Button
                                        size="lg"
                                        onClick={() => router.push(`/courses/${courseId}/lessons/${nextLessonId}`)}
                                        className="min-w-[200px]"
                                    >
                                        Next Lesson
                                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => router.push(`/courses/${courseId}`)}
                                        className="min-w-[200px]"
                                    >
                                        Back to Course
                                    </Button>
                                )
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={handleCompleteLesson}
                                    disabled={isCompleting}
                                    className="min-w-[200px]"
                                >
                                    {isCompleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Completing...
                                        </>
                                    ) : (
                                        "Complete Lesson"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
