"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { DailyActivity, StreakData } from "@/types/progress";

interface StreakCalendarProps {
  dailyActivities: DailyActivity[];
  streakData: StreakData | null;
  year?: number;
}

/**
 * Streak Calendar Component
 * Displays a GitHub-style heatmap showing daily learning activity
 */
export function StreakCalendar({
  dailyActivities,
  streakData,
  year = new Date().getFullYear(),
}: StreakCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    lessonsCompleted: number;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate calendar data for the specified year
  const calendarData = useMemo(() => {
    const days: Array<{
      date: string;
      dayOfWeek: number;
      lessonsCompleted: number;
      intensity: number;
    }> = [];

    // Create a map of activities by date for quick lookup
    const activityMap = new Map<string, number>();
    dailyActivities.forEach((activity) => {
      activityMap.set(activity.date, activity.lessonsCompleted);
    });

    // Start from Jan 1st of the target year
    const startDate = new Date(year, 0, 1);
    // End at Dec 31st of the target year
    const endDate = new Date(year, 11, 31);

    // Adjust start date to the beginning of the week (Sunday)
    // This ensures the grid starts correctly aligned
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek; // 0 = Sunday
    const gridStartDate = new Date(startDate);
    gridStartDate.setDate(startDate.getDate() - daysToSubtract);

    // Generate data from gridStartDate until endDate
    const currentDate = new Date(gridStartDate);

    // We continue until we pass the end date AND finish the current week
    while (currentDate <= endDate || currentDate.getDay() !== 0) {
      const dateStr = currentDate.toISOString().split("T")[0];

      // Only show data for the target year, but we need to generate days 
      // for the grid structure even if they are outside the year (padding)
      const isTargetYear = currentDate.getFullYear() === year;
      const lessonsCompleted = isTargetYear ? (activityMap.get(dateStr) || 0) : 0;

      // Calculate intensity (0-4 scale for color intensity)
      let intensity = 0;
      if (lessonsCompleted > 0) {
        if (lessonsCompleted >= 5) intensity = 4;
        else if (lessonsCompleted >= 3) intensity = 3;
        else if (lessonsCompleted >= 2) intensity = 2;
        else intensity = 1;
      }

      days.push({
        date: dateStr,
        dayOfWeek: currentDate.getDay(), // 0 = Sunday, 1 = Monday, etc.
        lessonsCompleted,
        intensity: isTargetYear ? intensity : 0, // No intensity for padding days
      });

      currentDate.setDate(currentDate.getDate() + 1);

      // Safety break to prevent infinite loops if logic is wrong
      if (days.length > 400) break;
    }

    return days;
  }, [dailyActivities, year]);

  // Group days by week for rendering (each week = column)
  const weeks = useMemo(() => {
    const result: (typeof calendarData)[] = [];
    let currentWeek: typeof calendarData = [];

    calendarData.forEach((day, index) => {
      currentWeek.push(day);

      // End of week (Saturday) or last day
      if (day.dayOfWeek === 6 || index === calendarData.length - 1) {
        result.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return result;
  }, [calendarData]);

  // Get color for intensity level
  const getIntensityColor = (intensity: number): string => {
    const colors = {
      0: "bg-gray-100 dark:bg-gray-800",
      1: "bg-green-200 dark:bg-green-900",
      2: "bg-green-400 dark:bg-green-700",
      3: "bg-green-500 dark:bg-green-600",
      4: "bg-green-600 dark:bg-green-500",
    };
    return colors[intensity as keyof typeof colors] || colors[0];
  };

  // Format date for tooltip
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };



  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {streakData && (
            <span>
              <span className="font-medium">{streakData.totalActiveDays}</span>{" "}
              active days in {year}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative overflow-x-auto">
        {/* Month Labels */}
        <div className="flex gap-[3px] mb-2 ml-8">
          {weeks.map((week, index) => {
            if (!week[0]) return <div key={index} className="w-3" />;

            const date = new Date(week[0].date);
            const month = date.toLocaleDateString("en-US", { month: "short" });

            let showLabel = false;
            if (index === 0) {
              showLabel = true;
            } else {
              const prevWeek = weeks[index - 1];
              if (prevWeek && prevWeek[0]) {
                const prevDate = new Date(prevWeek[0].date);
                const prevMonth = prevDate.toLocaleDateString("en-US", {
                  month: "short",
                });
                if (month !== prevMonth) {
                  showLabel = true;
                }
              }
            }

            // Prevent label overlap: if the next week starts a new month,
            // it means the current month has only one week in this column view.
            // We hide the label to avoid overlapping with the next month's label.
            if (showLabel && index < weeks.length - 1) {
              const nextWeek = weeks[index + 1];
              if (nextWeek && nextWeek[0]) {
                const nextDate = new Date(nextWeek[0].date);
                const nextMonth = nextDate.toLocaleDateString("en-US", {
                  month: "short",
                });
                if (month !== nextMonth) {
                  showLabel = false;
                }
              }
            }

            return (
              <div
                key={index}
                className="text-xs text-gray-600 dark:text-gray-400 w-3 overflow-visible whitespace-nowrap"
              >
                {showLabel ? month : ""}
              </div>
            );
          })}
        </div>

        {/* Weekday Labels + Grid */}
        <div className="flex gap-[3px]">
          {/* Weekday labels */}
          <div className="flex flex-col gap-[3px] text-xs text-gray-600 dark:text-gray-400 pr-2 pt-px">
            <div className="h-3 leading-3">Sun</div>
            <div className="h-3 leading-3">Mon</div>
            <div className="h-3 leading-3">Tue</div>
            <div className="h-3 leading-3">Wed</div>
            <div className="h-3 leading-3">Thu</div>
            <div className="h-3 leading-3">Fri</div>
            <div className="h-3 leading-3">Sat</div>
          </div>

          {/* Calendar squares */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {/* Render all 7 days, fill with empty cells if week is incomplete */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const day = week.find((d) => d.dayOfWeek === dayIndex);

                  if (!day) {
                    // Empty cell for days that don't exist yet
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className="w-3 h-3"
                      />
                    );
                  }

                  return (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(
                        day.intensity
                      )} hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer relative`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                        setHoveredDay({
                          date: day.date,
                          lessonsCompleted: day.lessonsCompleted,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {streakData && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Current Streak:
              </span>
              <span className="ml-2 font-semibold text-orange-600 dark:text-orange-400">
                {streakData.currentStreak} days
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Longest Streak:
              </span>
              <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                {streakData.longestStreak} days
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Last Active:
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {streakData.lastActivityDate
                  ? formatDate(streakData.lastActivityDate)
                  : "Never"}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`ml-2 font-semibold ${streakData.isActiveToday
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                {streakData.isActiveToday ? "✓ Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Portal Tooltip */}
      {hoveredDay &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, -100%) translateY(-8px)",
            }}
          >
            <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
              <div className="font-medium">{formatDate(hoveredDay.date)}</div>
              <div>
                {hoveredDay.lessonsCompleted}{" "}
                {hoveredDay.lessonsCompleted === 1 ? "lesson" : "lessons"}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 dark:border-t-gray-700" />
          </div>,
          document.body
        )}
    </div>
  );
}
