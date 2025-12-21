"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CustomMaterialSourceType } from "@/types/custom-materials";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, Globe, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

// URL validation patterns
const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/i;
const WEBSITE_REGEX = /^https?:\/\/[\w.-]+\.[a-z]{2,}(\/.*)?$/i;

interface UrlInputProps {
  sourceType: "YOUTUBE" | "WEBSITE";
  value: string;
  onChange: (url: string) => void;
  error?: string | null;
  className?: string;
}

/**
 * URL input field for YouTube and Website sources.
 * Includes real-time validation and visual feedback.
 */
export function UrlInput({
  sourceType,
  value,
  onChange,
  error,
  className,
}: UrlInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const validateUrl = useCallback(
    (url: string) => {
      if (!url.trim()) {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);

      // Simulate brief validation delay for UX
      setTimeout(() => {
        if (sourceType === "YOUTUBE") {
          const isValid = YOUTUBE_REGEX.test(url);
          setValidationResult({
            isValid,
            message: isValid
              ? "Valid YouTube URL"
              : "Please enter a valid YouTube URL",
          });
        } else {
          const isValid = WEBSITE_REGEX.test(url);
          setValidationResult({
            isValid,
            message: isValid
              ? "Valid website URL"
              : "Please enter a valid website URL (https://...)",
          });
        }
        setIsValidating(false);
      }, 300);
    },
    [sourceType]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateUrl(newValue);
  };

  const Icon = sourceType === "YOUTUBE" ? Youtube : Globe;
  const placeholder =
    sourceType === "YOUTUBE"
      ? "https://www.youtube.com/watch?v=..."
      : "https://example.com/article";
  const description =
    sourceType === "YOUTUBE"
      ? "Paste a YouTube video URL (max 15 minutes)"
      : "Paste a website URL (article, blog, etc.)";

  const displayError = error || (validationResult && !validationResult.isValid ? validationResult.message : null);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
        <Icon className="h-5 w-5" />
        <span className="text-sm">{description}</span>
      </div>

      <div className="relative">
        <Input
          type="url"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "pr-10 h-12 text-base",
            displayError && "border-[#D32F2F] focus-visible:ring-[#D32F2F]",
            validationResult?.isValid && "border-[#4CAF50] focus-visible:ring-[#4CAF50]"
          )}
          aria-describedby={displayError ? "url-error" : undefined}
          aria-invalid={!!displayError}
        />

        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValidating && (
            <Loader2 className="h-5 w-5 text-[#5F6368] animate-spin" />
          )}
          {!isValidating && validationResult?.isValid && (
            <CheckCircle className="h-5 w-5 text-[#4CAF50]" />
          )}
          {!isValidating && validationResult && !validationResult.isValid && (
            <AlertCircle className="h-5 w-5 text-[#D32F2F]" />
          )}
        </div>
      </div>

      {/* Error/Success message */}
      {displayError && (
        <p
          id="url-error"
          className="flex items-center gap-2 text-sm text-[#D32F2F]"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {displayError}
        </p>
      )}

      {/* YouTube specific info */}
      {sourceType === "YOUTUBE" && !displayError && (
        <div className="p-3 rounded-lg bg-[#FFF8E1] dark:bg-[#F57F17]/10 border border-[#FFE082] dark:border-[#F57F17]/30">
          <p className="text-sm text-[#5D4037] dark:text-[#FFE082]">
            <strong>Tip:</strong> Videos longer than 15 minutes will be trimmed.
            You can specify a time range in the next step.
          </p>
        </div>
      )}
    </div>
  );
}
