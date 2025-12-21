"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Type, AlertCircle } from "lucide-react";

const MAX_CHARS = 5000;

interface RawTextInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string | null;
  className?: string;
}

/**
 * Raw text input for pasting emails, paragraphs, or other text content.
 * Includes character counter and validation.
 */
export function RawTextInput({
  value,
  onChange,
  error,
  className,
}: RawTextInputProps) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const remainingChars = MAX_CHARS - charCount;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
        <Type className="h-5 w-5" />
        <span className="text-sm">
          Paste your text content (email, article, meeting notes, etc.)
        </span>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder="Paste your text here...

Example:
- Email conversations
- Meeting notes
- Article content
- Work documents
- Study materials"
          className={cn(
            "min-h-[200px] text-base resize-y",
            isOverLimit && "border-[#D32F2F] focus-visible:ring-[#D32F2F]",
            error && "border-[#D32F2F] focus-visible:ring-[#D32F2F]"
          )}
          aria-describedby="text-counter"
          aria-invalid={isOverLimit || !!error}
        />
      </div>

      {/* Character counter */}
      <div className="flex items-center justify-between">
        <div>
          {(error || isOverLimit) && (
            <p className="flex items-center gap-2 text-sm text-[#D32F2F]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error || `Text exceeds ${MAX_CHARS.toLocaleString()} character limit`}
            </p>
          )}
        </div>
        <p
          id="text-counter"
          className={cn(
            "text-sm",
            isOverLimit
              ? "text-[#D32F2F] font-medium"
              : remainingChars < 500
              ? "text-[#F57F17]"
              : "text-[#5F6368] dark:text-[#9AA0A6]"
          )}
        >
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          {remainingChars > 0 && remainingChars < 500 && (
            <span className="ml-2">({remainingChars} remaining)</span>
          )}
        </p>
      </div>

      {/* Tips */}
      {!value && (
        <div className="p-3 rounded-lg bg-[#E3F2FD] dark:bg-[#1565C0]/10 border border-[#90CAF9] dark:border-[#1565C0]/30">
          <p className="text-sm text-[#1565C0] dark:text-[#90CAF9]">
            <strong>Pro tip:</strong> For best results, paste clean text without
            excessive formatting. AI works best with 200-2000 words.
          </p>
        </div>
      )}
    </div>
  );
}
