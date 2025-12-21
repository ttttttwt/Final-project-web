"use client";

import { cn } from "@/lib/utils";
import { CustomMaterialStatus } from "@/types/custom-materials";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Loader2, Filter } from "lucide-react";

interface FilterOption {
  value: CustomMaterialStatus | "ALL";
  label: string;
  icon: React.ReactNode;
}

const filterOptions: FilterOption[] = [
  {
    value: "ALL",
    label: "All",
    icon: <Filter className="h-4 w-4" />,
  },
  {
    value: "COMPLETED",
    label: "Ready",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    value: "PROCESSING",
    label: "Processing",
    icon: <Loader2 className="h-4 w-4" />,
  },
  {
    value: "PENDING",
    label: "Queued",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: "FAILED",
    label: "Failed",
    icon: <XCircle className="h-4 w-4" />,
  },
];

interface MaterialFiltersProps {
  value: CustomMaterialStatus | "ALL";
  onChange: (status: CustomMaterialStatus | "ALL") => void;
  counts?: Record<CustomMaterialStatus | "ALL", number>;
  className?: string;
}

/**
 * Filter buttons for material library.
 */
export function MaterialFilters({
  value,
  onChange,
  counts,
  className,
}: MaterialFiltersProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filterOptions.map((option) => {
        const isSelected = value === option.value;
        const count = counts?.[option.value];

        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              "gap-2",
              !isSelected &&
                "text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]"
            )}
          >
            {option.icon}
            {option.label}
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-xs rounded-full",
                  isSelected
                    ? "bg-white/20"
                    : "bg-[#F1F3F4] dark:bg-[#2E2E2E]"
                )}
              >
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
