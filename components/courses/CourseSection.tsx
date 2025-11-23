"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Section } from "@/types/course";
import { cn } from "@/lib/utils";
import { LessonItem } from "@/components/courses";

interface CourseSectionProps {
  section: Section;
  isEnrolled: boolean;
  courseId: number;
  completedLessonIds?: number[];
}

/**
 * Course Section Component
 * Displays a collapsible section with lessons
 *
 * @component
 * @example
 * <CourseSection section={section} isEnrolled={true} courseId={1} completedLessonIds={[1, 2]} />
 */
export function CourseSection({
  section,
  isEnrolled,
  courseId,
  completedLessonIds = [],
}: CourseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-6 py-4 flex items-center justify-between",
          "bg-gray-50 dark:bg-gray-800",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          "transition-colors duration-200"
        )}
        aria-expanded={isExpanded}
        aria-controls={`section-${section.id}-content`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {section.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {section.lessonCount} lesson{section.lessonCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </button>

      {/* Lessons List */}
      {isExpanded && (
        <div
          id={`section-${section.id}-content`}
          className="divide-y divide-gray-200 dark:divide-gray-700"
        >
          {section.lessons?.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={index + 1}
              isEnrolled={isEnrolled}
              courseId={courseId}
              isCompleted={completedLessonIds.includes(lesson.id)}
            />
          ))}
          {(!section.lessons || section.lessons.length === 0) && (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No lessons in this section yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
