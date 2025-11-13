"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";

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
}

/**
 * Course Card Component
 *
 * Displays course information in a card format with:
 * - Thumbnail image
 * - Title and description (truncated)
 * - CEFR level badge
 * - Duration
 * - Enroll/Continue button
 *
 * @param course - Course data
 * @param onEnroll - Callback when enroll button clicked
 * @param isEnrolled - Whether user is already enrolled
 */
export function CourseCard({
  course,
  onEnroll,
  isEnrolled = false,
}: CourseCardProps) {
  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEnroll) {
      onEnroll(String(course.id));
    }
  };

  // Truncate description to max 120 characters
  const truncatedDescription =
    course.description.length > 120
      ? course.description.substring(0, 120) + "..."
      : course.description;

  // Get image URL (support both thumbnailUrl and imageUrl)
  const imageUrl = course.thumbnailUrl || course.imageUrl;

  // Get CEFR level (support both cefrLevel and level)
  const level = course.cefrLevel || course.level || "A1";

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="group h-full overflow-hidden bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E] transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
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
              className={`${
                CEFR_COLORS[level] || CEFR_COLORS.A1
              } font-semibold shadow-md`}
            >
              {level}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-5 space-y-3">
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
                <span>{course.sectionCount} sections</span>
              </div>
            )}
            {course.durationMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.durationMinutes} min</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="p-5 pt-0">
          <Button
            onClick={handleEnrollClick}
            className={`w-full ${
              isEnrolled
                ? "bg-[#34A853] hover:bg-[#2D9249] dark:bg-[#81C995] dark:hover:bg-[#9DD4A9]"
                : "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA]"
            } text-white dark:text-[#121212] font-medium transition-colors`}
          >
            {isEnrolled ? "Continue Learning" : "Enroll Now"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
