"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { DailyActivity } from "@/types/progress";

interface ProgressChartProps {
  data: DailyActivity[];
}

interface ChartDataPoint {
  date: string;
  lessons: number;
  time: number;
}

// Custom tooltip component (must be outside main component)
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {data.date}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          Lessons: {data.lessons}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Time: {data.time}m
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Progress Chart Component
 * Displays a line chart showing daily lesson completion over time
 */
export function ProgressChart({ data }: ProgressChartProps) {
  // Transform data for recharts
  const chartData = data.map((activity) => ({
    date: formatDate(activity.date),
    lessons: activity.lessonsCompleted,
    time: Math.round(activity.timeSpentMinutes),
  }));

  // Format date for display (e.g., "Nov 1")
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        <p>No activity data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] min-h-[300px]">
      <ResponsiveContainer width="100%" height={300} minHeight={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            tickLine={{ stroke: "#E5E7EB" }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 12 }}
            tickLine={{ stroke: "#E5E7EB" }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="lessons"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#colorLessons)"
            activeDot={{ r: 6, fill: "#3B82F6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
