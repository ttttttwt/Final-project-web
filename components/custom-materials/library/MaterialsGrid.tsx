"use client";

import { cn } from "@/lib/utils";
import { MaterialListItem } from "@/types/custom-materials";
import { MaterialCard } from "./MaterialCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaterialsGridProps {
  materials: MaterialListItem[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onChat?: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateNew?: () => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Grid layout for displaying material cards.
 */
export function MaterialsGrid({
  materials,
  isLoading,
  onView,
  onChat,
  onDelete,
  onCreateNew,
  emptyMessage = "No materials found",
  className,
}: MaterialsGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-[#E0E0E0] dark:border-[#2E2E2E] p-4 space-y-3"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (materials.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-4 text-center",
          "rounded-lg border-2 border-dashed border-[#E0E0E0] dark:border-[#2E2E2E]",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-[#F1F3F4] dark:bg-[#2E2E2E] flex items-center justify-center mb-4">
          <FolderOpen className="h-8 w-8 text-[#9AA0A6]" />
        </div>
        <p className="text-[#5F6368] dark:text-[#9AA0A6] font-medium mb-2">
          {emptyMessage}
        </p>
        <p className="text-sm text-[#9AA0A6] max-w-sm mb-4">
          Upload documents, videos, or paste text to create personalized learning materials.
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Material
          </Button>
        )}
      </div>
    );
  }

  // Grid with materials
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          onView={onView}
          onChat={onChat}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
