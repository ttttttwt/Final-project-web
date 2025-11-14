"use client";

/**
 * useLessonNavigation Hook
 * Calculates prev/next lesson IDs and progress from course structure
 */

import { useState, useEffect } from "react";
import { courseService } from "@/services/courseService";
import type { LessonDetail } from "@/types/course";

interface LessonNavigationData {
  prevLessonId: number | null;
  nextLessonId: number | null;
  currentIndex: number;
  totalLessons: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage lesson navigation
 * @param courseId - Course ID
 * @param currentLessonId - Current lesson ID
 * @returns Navigation data (prev/next IDs, current index, total)
 */
export function useLessonNavigation(
  courseId: number,
  currentLessonId: number
): LessonNavigationData {
  const [navData, setNavData] = useState<LessonNavigationData>({
    prevLessonId: null,
    nextLessonId: null,
    currentIndex: 0,
    totalLessons: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchCourseStructure = async () => {
      try {
        setNavData((prev) => ({ ...prev, isLoading: true, error: null }));

        // Fetch course with sections and lessons
        const course = await courseService.getCourseWithSections(
          courseId.toString()
        );

        // Flatten all lessons from all sections into a single ordered array
        const allLessons: LessonDetail[] = [];
        if (course.sections) {
          course.sections
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .forEach((section) => {
              if (section.lessons) {
                const sortedLessons = [...section.lessons].sort(
                  (a, b) => a.orderIndex - b.orderIndex
                );
                allLessons.push(...sortedLessons);
              }
            });
        }

        // Find current lesson index
        const currentIndex = allLessons.findIndex(
          (lesson) => lesson.id === currentLessonId
        );

        if (currentIndex === -1) {
          setNavData({
            prevLessonId: null,
            nextLessonId: null,
            currentIndex: 0,
            totalLessons: allLessons.length,
            isLoading: false,
            error: "Current lesson not found in course structure",
          });
          return;
        }

        // Calculate prev/next lesson IDs
        const prevLessonId =
          currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
        const nextLessonId =
          currentIndex < allLessons.length - 1
            ? allLessons[currentIndex + 1].id
            : null;

        setNavData({
          prevLessonId,
          nextLessonId,
          currentIndex,
          totalLessons: allLessons.length,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Failed to fetch course structure:", error);
        setNavData((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load navigation data",
        }));
      }
    };

    fetchCourseStructure();
  }, [courseId, currentLessonId]);

  return navData;
}
