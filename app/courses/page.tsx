"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CourseCard } from "@/components/courses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { courseService, CourseSearchParams } from "@/services/courseService";
import { Course } from "@/types/course";
import { toast } from "sonner";

/**
 * CEFR Levels for filtering
 */
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Sort options for courses
 */
const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Newest First" },
  { value: "createdAt,asc", label: "Oldest First" },
  { value: "title,asc", label: "Title (A-Z)" },
  { value: "title,desc", label: "Title (Z-A)" },
];

/**
 * Courses Page
 *
 * Browse and search available courses with filters
 */
export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("search") || ""
  );
  const [selectedLevel, setSelectedLevel] = React.useState<string | null>(
    searchParams.get("level") || null
  );
  const [sortBy, setSortBy] = React.useState(
    searchParams.get("sort") || "createdAt,desc"
  );
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(
    parseInt(searchParams.get("page") || "0")
  );
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);

  // Debounced search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch courses from API
   */
  const fetchCourses = React.useCallback(async () => {
    try {
      setIsLoading(true);

      const params: CourseSearchParams = {
        page: currentPage,
        size: 12,
        sort: sortBy,
      };

      // Add search query if exists
      if (searchQuery.trim()) {
        params.title = searchQuery.trim();
      }

      // Add CEFR level filter if selected
      if (selectedLevel) {
        params.cefrLevel = selectedLevel;
      }

      // Use search endpoint if filters applied, otherwise list all
      const response =
        searchQuery.trim() || selectedLevel
          ? await courseService.searchCourses(params)
          : await courseService.getCourses(
              params.page!,
              params.size!,
              params.sort!
            );

      setCourses(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      toast.error(error.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, searchQuery, selectedLevel]);

  /**
   * Update URL query params
   */
  const updateURLParams = React.useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedLevel) params.set("level", selectedLevel);
    if (sortBy !== "createdAt,desc") params.set("sort", sortBy);
    if (currentPage > 0) params.set("page", currentPage.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/courses?${queryString}` : "/courses";
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedLevel, sortBy, currentPage, router]);

  /**
   * Handle search input change with debounce
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(0); // Reset to first page on new search
    }, 300);
  };

  /**
   * Handle CEFR level filter
   */
  const handleLevelFilter = (level: string) => {
    if (selectedLevel === level) {
      setSelectedLevel(null); // Deselect if already selected
    } else {
      setSelectedLevel(level);
    }
    setCurrentPage(0); // Reset to first page
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(0); // Reset to first page
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handle enroll click
   */
  const handleEnroll = (courseId: string) => {
    // TODO: Implement enrollment in next task
    toast.info("Enrollment feature coming soon!");
    router.push(`/courses/${courseId}`);
  };

  // Fetch courses on mount and when filters change
  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Update URL when params change
  React.useEffect(() => {
    updateURLParams();
  }, [updateURLParams]);

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Courses">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#202124] dark:text-[#E8EAED] mb-2">
              Courses
            </h1>
            <p className="text-[#5F6368] dark:text-[#9AA0A6]">
              Browse and enroll in English learning courses
            </p>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5F6368] dark:text-[#9AA0A6]" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* View Mode Toggle */}
            <div className="hidden md:flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA] text-white dark:text-[#121212]"
                    : "bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
                }
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA] text-white dark:text-[#121212]"
                    : "bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
                }
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters (Desktop or Mobile when toggled) */}
          <div
            className={`${showFilters ? "block" : "hidden"} md:block space-y-4`}
          >
            {/* CEFR Level Filter */}
            <div>
              <h3 className="text-sm font-medium text-[#202124] dark:text-[#E8EAED] mb-3">
                CEFR Level
              </h3>
              <div className="flex flex-wrap gap-2">
                {CEFR_LEVELS.map((level) => (
                  <Badge
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedLevel === level
                        ? "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA] text-white dark:text-[#121212]"
                        : "hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E]"
                    }`}
                    onClick={() => handleLevelFilter(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">
                Sort by:
              </span>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      sortBy === option.value
                        ? "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA] text-white dark:text-[#121212]"
                        : "hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E]"
                    }`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <div className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
              {totalElements > 0 ? (
                <>
                  Showing {courses.length} of {totalElements} courses
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedLevel && ` (Level: ${selectedLevel})`}
                </>
              ) : (
                "No courses found"
              )}
            </div>
          )}

          {/* Course Grid/List */}
          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full h-48 bg-[#F8F9FA] dark:bg-[#1E1E1E]" />
                  <Skeleton className="w-3/4 h-6 bg-[#F8F9FA] dark:bg-[#1E1E1E]" />
                  <Skeleton className="w-full h-4 bg-[#F8F9FA] dark:bg-[#1E1E1E]" />
                  <Skeleton className="w-full h-4 bg-[#F8F9FA] dark:bg-[#1E1E1E]" />
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#5F6368] dark:text-[#9AA0A6] text-lg">
                No courses found matching your criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLevel(null);
                  setCurrentPage(0);
                }}
                className="mt-4 bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA] text-white dark:text-[#121212]"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    onClick={() => handlePageChange(i)}
                    className={
                      currentPage === i
                        ? "bg-[#1A73E8] hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:hover:bg-[#A8C7FA] text-white dark:text-[#121212]"
                        : "bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
