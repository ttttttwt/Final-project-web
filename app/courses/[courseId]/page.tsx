"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import progressService from "@/services/progressService";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseSection } from "@/components/courses/CourseSection";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  A2: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  B1: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  B2: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  C1: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  C2: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

/**
 * Course Detail Page
 * Displays course information, curriculum, and enrollment options
 */
export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setNotFound(false);

        // Fetch course with sections and lessons
        const courseData = await courseService.getCourseWithSections(courseId);
        setCourse(courseData);

        // Check if user is enrolled
        const enrolled = await enrollmentService.isEnrolled(courseData.id);
        setIsEnrolled(enrolled);

        if (enrolled) {
          try {
            const progress = await progressService.getCourseProgress(
              courseData.id
            );
            const completed = progress.lessonProgress
              .filter((l) => l.status === "COMPLETED")
              .map((l) => l.lessonId);
            setCompletedLessonIds(completed);
          } catch (error) {
            console.error("Failed to fetch progress:", error);
          }
        }
      } catch (error: unknown) {
        console.error("Error fetching course:", error);
        if (
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          setNotFound(true);
        } else {
          toast.error("Failed to load course. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;

    try {
      setIsEnrolling(true);
      await enrollmentService.enroll(course.id);

      setIsEnrolled(true);
      toast.success("Successfully enrolled in course!", {
        description: "You can now access all lessons.",
        duration: 4000,
      });

      // Fetch progress after enrollment (will be empty but good to initialize)
      try {
        const progress = await progressService.getCourseProgress(course.id);
        const completed = progress.lessonProgress
          .filter((l) => l.status === "COMPLETED")
          .map((l) => l.lessonId);
        setCompletedLessonIds(completed);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    } catch (error: unknown) {
      console.error("Error enrolling in course:", error);
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status === 409) {
        toast.info("You are already enrolled in this course");
        setIsEnrolled(true);
      } else if (status === 404) {
        toast.error("Course not found");
      } else {
        toast.error("Failed to enroll. Please try again.");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <div className="p-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 404 Not Found
  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Course Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The course you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.push("/courses")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const totalLessons =
    course.sections?.reduce(
      (sum, section) => sum + (section.lessons?.length || 0),
      0
    ) || 0;

  const totalDuration =
    course.sections?.reduce(
      (sum, section) =>
        sum +
        (section.lessons?.reduce(
          (sectionSum, lesson) => sectionSum + lesson.durationMinutes,
          0
        ) || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/courses")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          {/* Course Thumbnail */}
          {course.thumbnailUrl && (
            <div className="relative w-full h-64 md:h-80 bg-gray-200 dark:bg-gray-700">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Course Info */}
          <div className="p-6 md:p-8">
            {/* CEFR Badge */}
            <Badge
              variant="secondary"
              className={cn(
                "mb-4 text-sm font-semibold",
                CEFR_COLORS[course.cefrLevel]
              )}
            >
              {course.cefrLevel} Level
            </Badge>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen className="h-5 w-5" />
                <span>
                  {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-5 w-5" />
                <span>{Math.ceil(totalDuration / 60)} hours total</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5" />
                <span>{course.sectionCount} sections</span>
              </div>
            </div>

            {/* Enroll Button */}
            {isEnrolled ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">
                  You&apos;re enrolled in this course
                </span>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="min-w-[200px]"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  "Enroll Now"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Course Curriculum */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Course Curriculum
          </h2>

          {course.sections && course.sections.length > 0 ? (
            <div className="space-y-4">
              {course.sections.map((section) => (
                <CourseSection
                  key={section.id}
                  section={section}
                  isEnrolled={isEnrolled}
                  courseId={course.id}
                  completedLessonIds={completedLessonIds}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No curriculum available yet. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
