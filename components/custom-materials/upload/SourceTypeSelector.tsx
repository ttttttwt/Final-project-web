"use client";

import { cn } from "@/lib/utils";
import { CustomMaterialSourceType } from "@/types/custom-materials";
import {
  FileText,
  FileType,
  Image,
  Youtube,
  Globe,
  Type,
  Check,
} from "lucide-react";

interface SourceTypeOption {
  type: CustomMaterialSourceType;
  label: string;
  description: string;
  icon: React.ReactNode;
  accept?: string;
  maxSize?: string;
}

const sourceTypes: SourceTypeOption[] = [
  {
    type: "PDF",
    label: "PDF Document",
    description: "Upload PDF files (max 10MB, 20 pages)",
    icon: <FileText className="h-6 w-6" />,
    accept: ".pdf",
    maxSize: "10MB",
  },
  {
    type: "DOCX",
    label: "Word Document",
    description: "Upload DOCX files (max 10MB)",
    icon: <FileType className="h-6 w-6" />,
    accept: ".docx",
    maxSize: "10MB",
  },
  {
    type: "IMAGE",
    label: "Image with Text",
    description: "Upload images containing text (max 10MB)",
    icon: <Image className="h-6 w-6" />,
    accept: "image/*",
    maxSize: "10MB",
  },
  {
    type: "YOUTUBE",
    label: "YouTube Video",
    description: "Paste YouTube URL (max 15 minutes)",
    icon: <Youtube className="h-6 w-6" />,
  },
  {
    type: "WEBSITE",
    label: "Website Article",
    description: "Paste article or blog URL",
    icon: <Globe className="h-6 w-6" />,
  },
  {
    type: "TEXT",
    label: "Raw Text",
    description: "Paste text directly (max 5,000 characters)",
    icon: <Type className="h-6 w-6" />,
  },
];

interface SourceTypeSelectorProps {
  value: CustomMaterialSourceType | null;
  onChange: (type: CustomMaterialSourceType) => void;
  className?: string;
}

/**
 * Source type selector for custom materials upload.
 * Displays 6 input types as selectable cards.
 */
export function SourceTypeSelector({
  value,
  onChange,
  className,
}: SourceTypeSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED]">
          Choose Your Source
        </h3>
        <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-1">
          Select the type of content you want to learn from
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sourceTypes.map((source) => {
          const isSelected = value === source.type;
          return (
            <button
              key={source.type}
              type="button"
              onClick={() => onChange(source.type)}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
                "hover:border-[#4285F4] hover:bg-[#4285F4]/5 cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2",
                isSelected
                  ? "border-[#4285F4] bg-[#4285F4]/10 dark:bg-[#4285F4]/20"
                  : "border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-5 w-5 rounded-full bg-[#4285F4] flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "p-3 rounded-full mb-2",
                  isSelected
                    ? "bg-[#4285F4]/20 text-[#4285F4]"
                    : "bg-[#F1F3F4] dark:bg-[#2E2E2E] text-[#5F6368] dark:text-[#9AA0A6]"
                )}
              >
                {source.icon}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "font-medium text-sm",
                  isSelected
                    ? "text-[#4285F4]"
                    : "text-[#202124] dark:text-[#E8EAED]"
                )}
              >
                {source.label}
              </span>

              {/* Description */}
              <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] text-center mt-1 line-clamp-2">
                {source.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { sourceTypes };
export type { SourceTypeOption };
