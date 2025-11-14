"use client";

/**
 * Lesson Navigation Component
 * Provides prev/next navigation between lessons with progress indicator
 */

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonNavigationProps {
  courseId: number;
  currentLessonId: number;
  prevLessonId: number | null;
  nextLessonId: number | null;
  currentIndex: number;
  totalLessons: number;
}

export function LessonNavigation({
  courseId,
  prevLessonId,
  nextLessonId,
  currentIndex,
  totalLessons,
}: LessonNavigationProps) {
  const router = useRouter();

  const handlePrevious = () => {
    if (prevLessonId) {
      router.push(`/courses/${courseId}/lessons/${prevLessonId}`);
    }
  };

  const handleNext = () => {
    if (nextLessonId) {
      router.push(`/courses/${courseId}/lessons/${nextLessonId}`);
    }
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={!prevLessonId}
        className="w-full md:w-auto"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous Lesson
      </Button>

      {/* Progress Indicator */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>
            Lesson {currentIndex + 1} of {totalLessons}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToCourse}
          className="text-xs"
        >
          Back to Course Overview
        </Button>
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        onClick={handleNext}
        disabled={!nextLessonId}
        className="w-full md:w-auto"
      >
        Next Lesson
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
