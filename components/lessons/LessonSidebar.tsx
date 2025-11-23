"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Circle,
    PlayCircle,
    BookOpen,
    Headphones,
    MessageSquare,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LessonDetail } from "@/types/course";
import { LESSON_TYPE_INFO } from "@/types/lesson";

interface LessonSidebarProps {
    courseId: number;
    currentLessonId: number;
    lessons: LessonDetail[];
    completedLessonIds: number[];
    className?: string;
}

export function LessonSidebar({
    courseId,
    currentLessonId,
    lessons,
    completedLessonIds,
    className,
}: LessonSidebarProps) {
    const router = useRouter();

    const getLessonIcon = (type: string) => {
        switch (type) {
            case "READING":
                return BookOpen;
            case "LISTENING":
                return Headphones;
            case "SPEAKING":
                return MessageSquare;
            case "QUIZ":
                return HelpCircle;
            default:
                return Circle;
        }
    };

    return (
        <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
            <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Course Content</h3>
                <p className="text-sm text-muted-foreground">
                    {completedLessonIds.length} / {lessons.length} completed
                </p>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {lessons.map((lesson, index) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        const isCurrent = lesson.id === currentLessonId;
                        const Icon = getLessonIcon(lesson.lessonType);
                        const typeInfo = LESSON_TYPE_INFO[lesson.lessonType];

                        return (
                            <div
                                key={lesson.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border",
                                    isCurrent
                                        ? "bg-primary/10 border-primary"
                                        : "hover:bg-accent border-transparent",
                                    isCompleted && !isCurrent && "opacity-75"
                                )}
                                onClick={() =>
                                    router.push(`/courses/${courseId}/lessons/${lesson.id}`)
                                }
                            >
                                <div className="mt-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : isCurrent ? (
                                        <PlayCircle className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                "text-sm font-medium leading-none",
                                                isCurrent && "text-primary"
                                            )}
                                        >
                                            {index + 1}. {lesson.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className={cn("text-[10px] px-1 py-0", typeInfo.color)}
                                        >
                                            {typeInfo.label}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {lesson.durationMinutes} min
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
