import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StatsCard Component
 *
 * Displays a statistic with an icon and optional trend indicator.
 * Features:
 * - Clean, card-based design
 * - Icon with color accent
 * - Loading skeleton state
 * - Hover effects
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Enrolled Courses"
 *   value={5}
 *   icon={BookOpen}
 *   color="blue"
 * />
 * ```
 */

export interface StatsCardProps {
  /** Card title/label */
  title: string;
  /** Numeric value to display */
  value: number | string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Color theme for icon */
  color?: "blue" | "green" | "yellow" | "purple";
  /** Optional subtitle/description */
  subtitle?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional className */
  className?: string;
}

const colorClasses = {
  blue: {
    icon: "text-[#1A73E8] dark:text-[#8AB4F8]",
    bg: "bg-[#E8F0FE] dark:bg-[#1E1E1E]",
  },
  green: {
    icon: "text-[#1E8E3E] dark:text-[#81C995]",
    bg: "bg-[#E6F4EA] dark:bg-[#1E1E1E]",
  },
  yellow: {
    icon: "text-[#F9AB00] dark:text-[#FDD663]",
    bg: "bg-[#FEF7E0] dark:bg-[#1E1E1E]",
  },
  purple: {
    icon: "text-[#9334E6] dark:text-[#C58AF9]",
    bg: "bg-[#F3E8FF] dark:bg-[#1E1E1E]",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
  isLoading = false,
  className,
}: StatsCardProps) {
  const colors = colorClasses[color];

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            {subtitle && <Skeleton className="h-3 w-32" />}
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-default",
        "bg-white dark:bg-[#121212] border-[#E0E0E0] dark:border-[#2E2E2E]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Left: Text content */}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6]">
            {title}
          </p>
          <p className="text-3xl font-bold text-[#202124] dark:text-[#E8EAED]">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Icon */}
        <div
          className={cn(
            "flex items-center justify-center h-12 w-12 rounded-lg shrink-0",
            colors.bg
          )}
        >
          <Icon className={cn("h-6 w-6", colors.icon)} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
