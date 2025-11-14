"use client";

import { useMemo } from "react";
import type { DailyActivity, StreakData } from "@/types/progress";

interface StreakCalendarProps {
  dailyActivities: DailyActivity[];
  streakData: StreakData | null;
}

/**
 * Streak Calendar Component
 * Displays a GitHub-style heatmap showing daily learning activity
 */
export function StreakCalendar({
  dailyActivities,
  streakData,
}: StreakCalendarProps) {
  // Generate calendar data for the last 365 days
  const calendarData = useMemo(() => {
    const today = new Date();
    const days: Array<{
      date: string;
      lessonsCompleted: number;
      intensity: number;
    }> = [];

    // Create a map of activities by date for quick lookup
    const activityMap = new Map<string, number>();
    dailyActivities.forEach((activity) => {
      activityMap.set(activity.date, activity.lessonsCompleted);
    });

    // Generate data for last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const lessonsCompleted = activityMap.get(dateStr) || 0;

      // Calculate intensity (0-4 scale for color intensity)
      let intensity = 0;
      if (lessonsCompleted > 0) {
        if (lessonsCompleted >= 5) intensity = 4;
        else if (lessonsCompleted >= 3) intensity = 3;
        else if (lessonsCompleted >= 2) intensity = 2;
        else intensity = 1;
      }

      days.push({ date: dateStr, lessonsCompleted, intensity });
    }

    return days;
  }, [dailyActivities]);

  // Group days by week for rendering
  const weeks = useMemo(() => {
    const result: (typeof calendarData)[] = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      result.push(calendarData.slice(i, i + 7));
    }
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

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    let currentMonth = "";

    weeks.forEach((week, index) => {
      if (week[0]) {
        const date = new Date(week[0].date);
        const month = date.toLocaleDateString("en-US", { month: "short" });
        if (month !== currentMonth) {
          currentMonth = month;
          labels.push({ month, weekIndex: index });
        }
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {streakData && (
            <span>
              <span className="font-medium">{streakData.totalActiveDays}</span>{" "}
              active days in the last year
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
          {monthLabels.map((label) => (
            <div
              key={label.month}
              className="text-xs text-gray-600 dark:text-gray-400"
              style={{
                width: "12px",
                marginLeft: label.weekIndex > 0 ? "3px" : "0",
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Weekday Labels + Grid */}
        <div className="flex gap-[3px]">
          {/* Weekday labels */}
          <div className="flex flex-col gap-[3px] text-xs text-gray-600 dark:text-gray-400 pr-2">
            <div className="h-3"></div> {/* Spacer for Mon */}
            <div className="h-3">Mon</div>
            <div className="h-3"></div> {/* Spacer for Wed */}
            <div className="h-3">Wed</div>
            <div className="h-3"></div> {/* Spacer for Fri */}
            <div className="h-3">Fri</div>
            <div className="h-3"></div> {/* Spacer for Sun */}
          </div>

          {/* Calendar squares */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(
                      day.intensity
                    )} hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group relative`}
                    title={`${formatDate(day.date)}: ${
                      day.lessonsCompleted
                    } lessons`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {formatDate(day.date)}
                        <br />
                        {day.lessonsCompleted}{" "}
                        {day.lessonsCompleted === 1 ? "lesson" : "lessons"}
                      </div>
                    </div>
                  </div>
                ))}
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
                className={`ml-2 font-semibold ${
                  streakData.isActiveToday
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
    </div>
  );
}
