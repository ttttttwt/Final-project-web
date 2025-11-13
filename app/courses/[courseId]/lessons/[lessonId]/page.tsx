"use client";

/**
 * Lesson Viewer Page
 * Displays lesson content and allows completion
 * Route: /courses/[courseId]/lessons/[lessonId]
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentRenderer } from "@/components/lessons";
import { toast } from "sonner";
import lessonService from "@/services/lessonService";
import progressService from "@/services/progressService";
import type { Lesson } from "@/types/lesson";
import { parseLessonContent, LESSON_TYPE_INFO } from "@/types/lesson";
import confetti from "canvas-confetti";

interface LessonViewerPageProps {
  params: {
    courseId: string;
    lessonId: string;
  };
}

export default function LessonViewerPage({ params }: LessonViewerPageProps) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const lessonId = parseInt(params.lessonId);
  const courseId = parseInt(params.courseId);

  useEffect(() => {
    fetchLesson();
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

      toast.success("Lesson completed! 🎉", {
        description: "Great job! Your progress has been saved.",
      });

      // Navigate back to course after 2 seconds
      setTimeout(() => {
        router.push(`/courses/${courseId}`);
      }, 2000);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      toast.error("Failed to complete lesson", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="space-y-4 mb-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <Button onClick={() => router.push(`/courses/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      </div>
    );
  }

  const lessonTypeInfo = LESSON_TYPE_INFO[lesson.lessonType];
  let parsedLesson;
  try {
    parsedLesson = parseLessonContent(lesson);
  } catch {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Invalid Lesson Content
        </h1>
        <p className="text-muted-foreground mb-6">
          This lesson&apos;s content could not be loaded. Please contact
          support.
        </p>
        <Button onClick={() => router.push(`/courses/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(`/courses/${courseId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course
      </Button>

      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge className={lessonTypeInfo.color}>{lessonTypeInfo.label}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {lesson.durationMinutes} min
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-muted-foreground">{lessonTypeInfo.description}</p>
      </div>

      {/* Lesson Content */}
      <div className="mb-8">
        <ContentRenderer
          lessonType={lesson.lessonType}
          parsedContent={parsedLesson.parsedContent}
        />
      </div>

      {/* Complete Lesson Button */}
      <div className="flex justify-center pt-8 border-t">
        <Button
          size="lg"
          onClick={handleCompleteLesson}
          disabled={isCompleting || isCompleted}
          className="min-w-[200px]"
        >
          {isCompleting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Completing...
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Completed!
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Complete Lesson
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
