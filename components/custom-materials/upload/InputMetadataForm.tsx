"use client";

import { cn } from "@/lib/utils";
import { InputMetadata, CustomMaterialSourceType } from "@/types/custom-materials";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Clock, AlertCircle } from "lucide-react";

interface InputMetadataFormProps {
  sourceType: CustomMaterialSourceType;
  metadata: InputMetadata;
  onChange: (metadata: InputMetadata) => void;
  className?: string;
}

/**
 * Form for specifying input constraints (page range, time range).
 * Shows different fields based on source type.
 */
export function InputMetadataForm({
  sourceType,
  metadata,
  onChange,
  className,
}: InputMetadataFormProps) {
  // Only show for PDF/DOCX (page range) and YouTube (time range)
  if (!["PDF", "DOCX", "YOUTUBE"].includes(sourceType)) {
    return null;
  }

  const isPdf = sourceType === "PDF" || sourceType === "DOCX";
  const isYoutube = sourceType === "YOUTUBE";

  const handlePageChange = (field: "pageStart" | "pageEnd", value: string) => {
    const numValue = parseInt(value, 10);
    onChange({
      ...metadata,
      [field]: isNaN(numValue) ? undefined : Math.max(1, numValue),
    });
  };

  const handleTimeChange = (field: "timeStart" | "timeEnd", value: string) => {
    // Parse time in format MM:SS or M:SS
    const trimmedValue = value.trim();
    
    // If empty, clear the field
    if (!trimmedValue) {
      onChange({
        ...metadata,
        [field]: undefined,
      });
      return;
    }
    
    const parts = trimmedValue.split(":").map((p) => parseInt(p, 10));
    let seconds: number | undefined = undefined;

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1 && !isNaN(parts[0])) {
      seconds = parts[0];
    }

    onChange({
      ...metadata,
      [field]: seconds,
    });
  };

  const formatTime = (seconds?: number): string => {
    if (seconds === undefined || seconds === null) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Validation
  const pageRangeError =
    isPdf &&
    metadata.pageStart &&
    metadata.pageEnd &&
    metadata.pageStart > metadata.pageEnd
      ? "Start page must be before end page"
      : metadata.pageEnd && metadata.pageEnd > 20
      ? "Maximum 20 pages allowed"
      : null;

  const timeRangeError =
    isYoutube &&
    metadata.timeStart !== undefined &&
    metadata.timeEnd !== undefined &&
    metadata.timeStart >= metadata.timeEnd
      ? "Start time must be before end time"
      : metadata.timeEnd && metadata.timeEnd > 900 // 15 minutes
      ? "Maximum 15 minutes allowed"
      : null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        {isPdf ? (
          <FileText className="h-5 w-5 text-[#5F6368] dark:text-[#9AA0A6]" />
        ) : (
          <Clock className="h-5 w-5 text-[#5F6368] dark:text-[#9AA0A6]" />
        )}
        <span className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
          {isPdf
            ? "Specify page range (optional, default: pages 1-20)"
            : "Specify time range (optional, default: 0:00-15:00)"}
        </span>
      </div>

      {/* PDF/DOCX Page Range */}
      {isPdf && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pageStart" className="text-sm">
              Start Page
            </Label>
            <Input
              id="pageStart"
              type="number"
              min={1}
              max={20}
              placeholder="1"
              value={metadata.pageStart || ""}
              onChange={(e) => handlePageChange("pageStart", e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageEnd" className="text-sm">
              End Page
            </Label>
            <Input
              id="pageEnd"
              type="number"
              min={1}
              max={20}
              placeholder="20"
              value={metadata.pageEnd || ""}
              onChange={(e) => handlePageChange("pageEnd", e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      )}

      {/* YouTube Time Range */}
      {isYoutube && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeStart" className="text-sm">
              Start Time (MM:SS)
            </Label>
            <Input
              id="timeStart"
              type="text"
              placeholder="0:00"
              value={formatTime(metadata.timeStart)}
              onChange={(e) => handleTimeChange("timeStart", e.target.value)}
              className="h-10"
              pattern="[0-9]{1,2}:[0-9]{2}"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeEnd" className="text-sm">
              End Time (MM:SS)
            </Label>
            <Input
              id="timeEnd"
              type="text"
              placeholder="15:00"
              value={formatTime(metadata.timeEnd)}
              onChange={(e) => handleTimeChange("timeEnd", e.target.value)}
              className="h-10"
              pattern="[0-9]{1,2}:[0-9]{2}"
            />
          </div>
        </div>
      )}

      {/* Error messages */}
      {(pageRangeError || timeRangeError) && (
        <p className="flex items-center gap-2 text-sm text-[#D32F2F]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {pageRangeError || timeRangeError}
        </p>
      )}
    </div>
  );
}
