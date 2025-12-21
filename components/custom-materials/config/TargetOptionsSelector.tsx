"use client";

import { cn } from "@/lib/utils";
import { TargetOption } from "@/types/custom-materials";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  HelpCircle,
  FileText,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";

interface TargetOptionConfig {
  value: TargetOption;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const targetOptions: TargetOptionConfig[] = [
  {
    value: "VOCABULARY",
    label: "Vocabulary List",
    description: "Extract key terms with definitions and examples",
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-[#4285F4]",
  },
  {
    value: "SUMMARY",
    label: "Smart Summary",
    description: "Generate a concise summary of the content",
    icon: <FileText className="h-5 w-5" />,
    color: "text-[#34A853]",
  },
  {
    value: "QUIZ",
    label: "Quiz Questions",
    description: "Create comprehension questions to test understanding",
    icon: <HelpCircle className="h-5 w-5" />,
    color: "text-[#FBBC05]",
  },
  {
    value: "ROLE_PLAY",
    label: "Role-Play Scenario",
    description: "Generate conversation scenarios for practice",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "text-[#EA4335]",
  },
  {
    value: "SHADOWING",
    label: "Shadowing Practice",
    description: "Extract sentences for pronunciation training",
    icon: <Mic className="h-5 w-5" />,
    color: "text-[#9C27B0]",
  },
];

interface TargetOptionsSelectorProps {
  value: TargetOption[];
  onChange: (options: TargetOption[]) => void;
  className?: string;
}

/**
 * Multi-select for choosing what types of content to generate.
 */
export function TargetOptionsSelector({
  value,
  onChange,
  className,
}: TargetOptionsSelectorProps) {
  const toggleOption = (option: TargetOption) => {
    if (value.includes(option)) {
      // Don't allow deselecting the last option
      if (value.length === 1) return;
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const selectAll = () => {
    onChange(targetOptions.map((o) => o.value));
  };

  const isAllSelected = value.length === targetOptions.length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED]">
            What do you want to learn?
          </h3>
          <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
            Select at least one learning mode
          </p>
        </div>
        <button
          type="button"
          onClick={selectAll}
          disabled={isAllSelected}
          className={cn(
            "text-sm font-medium transition-colors",
            isAllSelected
              ? "text-[#9AA0A6] cursor-not-allowed"
              : "text-[#4285F4] hover:text-[#1967D2]"
          )}
        >
          <Sparkles className="h-4 w-4 inline mr-1" />
          Select All
        </button>
      </div>

      <div className="grid gap-3">
        {targetOptions.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                "hover:border-[#4285F4] hover:bg-[#4285F4]/5",
                isSelected
                  ? "border-[#4285F4] bg-[#4285F4]/5 dark:bg-[#4285F4]/10"
                  : "border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleOption(option.value)}
                className="mt-0.5"
                aria-label={option.label}
              />
              <div
                className={cn(
                  "p-2 rounded-lg",
                  isSelected
                    ? "bg-[#4285F4]/20"
                    : "bg-[#F1F3F4] dark:bg-[#2E2E2E]"
                )}
              >
                <span className={isSelected ? "text-[#4285F4]" : option.color}>
                  {option.icon}
                </span>
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    isSelected
                      ? "text-[#4285F4]"
                      : "text-[#202124] dark:text-[#E8EAED]"
                  )}
                >
                  {option.label}
                </p>
                <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export { targetOptions };
export type { TargetOptionConfig };
