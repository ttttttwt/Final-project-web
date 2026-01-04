"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";
import { getFileUrl } from "@/lib/utils";

/**
 * CEFR Level Color Mapping
 */
const CEFR_COLORS: Record<string, string> = {
  A1: "bg-[#34A853] text-white", // Green - Beginner
  A2: "bg-[#81C995] text-[#121212]", // Light Green
  B1: "bg-[#1A73E8] text-white", // Blue - Intermediate
  B2: "bg-[#8AB4F8] text-[#121212]", // Light Blue
  C1: "bg-[#9334E9] text-white", // Purple - Advanced
  C2: "bg-[#C084FC] text-[#121212]", // Light Purple
};

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
  progressPercentage?: number; // Progress percentage (0-100)
  isCompleted?: boolean; // Whether course is completed
  viewMode?: "grid" | "list";
}

/**
 * Course Card Component
 *
 * Displays course information in a card format with:
 * - Thumbnail image
 * - Title and description (truncated)
 * - CEFR level badge
 * - Duration
 * - Progress bar (if enrolled)
 * - Enroll/Continue button
 *
 * @param course - Course data
 * @param onEnroll - Callback when enroll button clicked
 * @param isEnrolled - Whether user is already enrolled
 * @param progressPercentage - Course progress (0-100)
 * @param isCompleted - Whether course is completed
 * @param viewMode - Display mode (grid or list)
 */
export function CourseCard({
  course,
  onEnroll,
  isEnrolled = false,
  progressPercentage = 0,
  isCompleted = false,
  viewMode = "grid",
}: CourseCardProps) {
  const { t } = useTranslation();
  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEnroll) {
      onEnroll(String(course.id));
    }
  };

  // Truncate description to max 120 characters
  const description = course.description || "";
  const truncatedDescription =
    description.length > 120
      ? description.substring(0, 120) + "..."
      : description;

  // Get image URL (support both thumbnailUrl and imageUrl)
  // Use getFileUrl to convert relative paths (e.g., /api/v1/files/{id}/download) to absolute URLs
  const imageUrl = getFileUrl(course.thumbnailUrl) || getFileUrl(course.imageUrl);

  // Get CEFR level (support both cefrLevel and level)
  const level = course.cefrLevel || course.level || "A1";

  if (viewMode === "list") {
    return (
      <Link href={`/courses/${course.id}`}>
        <Card className="group overflow-hidden bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E] transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer flex flex-col md:flex-row min-h-[12rem] h-auto">
          {/* Thumbnail Image */}
          <div className="relative w-full md:w-64 h-48 md:h-auto md:min-h-full flex-shrink-0 overflow-hidden bg-[#F8F9FA] dark:bg-[#121212]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-12 h-12 text-[#5F6368] dark:text-[#9AA0A6]" />
              </div>
            )}

            {/* CEFR Level Badge */}
            <div className="absolute top-3 right-3">
              <Badge
                className={`${CEFR_COLORS[level] || CEFR_COLORS.A1
                  } font-semibold shadow-md`}
              >
                {level}
              </Badge>
            </div>

            {/* Completion Badge */}
            {isCompleted && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-[#34A853] text-white font-semibold shadow-md flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t("common.completed", { defaultValue: "Completed" })}</span>
                </Badge>
              </div>
            )}
          </div>

          {/* Card Content */}
          <CardContent className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] group-hover:text-[#1A73E8] dark:group-hover:text-[#8AB4F8] transition-colors">
                  {course.title}
                </h3>
                {course.durationMinutes && (
                  <div className="flex items-center gap-1 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                    <Clock className="w-4 h-4" />
                    <span>{course.durationMinutes} {t("courses.mins")}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] line-clamp-2">
                {course.description}
              </p>

              {course.sectionCount !== undefined && (
                <div className="flex items-center gap-2 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.sectionCount} {t("courses.sections")}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              {/* Progress Bar */}
              {isEnrolled ? (
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                    <span className="font-medium">{t("common.progress", { defaultValue: "Progress" })}</span>
                    <span className="font-semibold">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              ) : (
                <div className="flex-1"></div>
              )}

              <Button
                onClick={handleEnrollClick}
                className={`${isEnrolled
                  ? "bg-[#34A853] hover:bg-[#2D9249] dark:bg-[#81C995] dark:hover:bg-[#9DD4A9]"
                  : "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA]"
                  } text-white dark:text-[#121212] font-medium transition-colors min-w-[140px]`}
              >
                {isEnrolled ? t("courses.continue") : t("courses.viewDetail")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="group h-full overflow-hidden bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E] transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer flex flex-col">
        {/* Thumbnail Image */}
        <div className="relative w-full h-48 overflow-hidden bg-[#F8F9FA] dark:bg-[#121212]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="w-16 h-16 text-[#5F6368] dark:text-[#9AA0A6]" />
            </div>
          )}

          {/* CEFR Level Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              className={`${CEFR_COLORS[level] || CEFR_COLORS.A1
                } font-semibold shadow-md`}
            >
              {level}
            </Badge>
          </div>

          {/* Completion Badge */}
          {isCompleted && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#34A853] text-white font-semibold shadow-md flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>{t("common.completed", { defaultValue: "Completed" })}</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-5 space-y-3 flex-1">
          {/* Title */}
          <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] line-clamp-2 min-h-14 group-hover:text-[#1A73E8] dark:group-hover:text-[#8AB4F8] transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] line-clamp-3 min-h-18">
            {truncatedDescription}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
            {course.sectionCount !== undefined && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{course.sectionCount} {t("courses.sections")}</span>
              </div>
            )}
            {course.durationMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.durationMinutes} {t("courses.mins")}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                <span className="font-medium">{t("common.progress", { defaultValue: "Progress" })}</span>
                <span className="font-semibold">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="p-5 pt-0 mt-auto">
          <Button
            onClick={handleEnrollClick}
            className={`w-full ${isEnrolled
              ? "bg-[#34A853] hover:bg-[#2D9249] dark:bg-[#81C995] dark:hover:bg-[#9DD4A9]"
              : "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA]"
              } text-white dark:text-[#121212] font-medium transition-colors`}
          >
            {isEnrolled ? t("courses.continueLearning") : t("courses.viewDetail")}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
