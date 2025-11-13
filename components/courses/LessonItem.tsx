"use client";

import Link from "next/link";
import {
  BookOpen,
  Headphones,
  FileCheck,
  Mic,
  Clock,
  Lock,
} from "lucide-react";
import { LessonDetail } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LessonItemProps {
  lesson: LessonDetail;
  index: number;
  isEnrolled: boolean;
  courseId: number;
}

const LESSON_TYPE_CONFIG = {
  READING: {
    icon: BookOpen,
    label: "Reading",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  LISTENING: {
    icon: Headphones,
    label: "Listening",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  QUIZ: {
    icon: FileCheck,
    label: "Quiz",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  SPEAKING: {
    icon: Mic,
    label: "Speaking",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
} as const;

/**
 * Lesson Item Component
 * Displays a single lesson in a section
 *
 * @component
 * @example
 * <LessonItem lesson={lesson} index={1} isEnrolled={true} courseId={1} />
 */
export function LessonItem({
  lesson,
  index,
  isEnrolled,
  courseId,
}: LessonItemProps) {
  const config =
    LESSON_TYPE_CONFIG[lesson.lessonType] || LESSON_TYPE_CONFIG.READING;
  const Icon = config.icon;

  const lessonUrl = isEnrolled
    ? `/courses/${courseId}/lessons/${lesson.id}`
    : "#";

  const content = (
    <div
      className={cn(
        "px-6 py-4 flex items-center gap-4",
        "transition-colors duration-200",
        isEnrolled
          ? "hover:bg-gray-50 dark:hover:bg-gray-800"
          : "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Lesson Number */}
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          "text-sm font-semibold",
          isEnrolled
            ? "bg-primary/10 text-primary"
            : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        )}
      >
        {index}
      </div>

      {/* Lesson Icon */}
      <div className="shrink-0">
        <div className={cn("p-2 rounded-lg", config.color)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {lesson.title}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="secondary" className={cn("text-xs", config.color)}>
            {config.label}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{lesson.durationMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Lock Icon for Unenrolled */}
      {!isEnrolled && (
        <div className="shrink-0">
          <Lock
            className="h-5 w-5 text-gray-400 dark:text-gray-500"
            aria-label="Locked"
          />
        </div>
      )}
    </div>
  );

  if (!isEnrolled) {
    return <div>{content}</div>;
  }

  return (
    <Link href={lessonUrl} className="block">
      {content}
    </Link>
  );
}
