"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { CustomMaterialSourceType } from "@/types/custom-materials";
import { Upload, X, FileText, FileType, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const acceptMap: Record<string, string> = {
  PDF: ".pdf,application/pdf",
  DOCX: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  IMAGE: "image/*",
};

const iconMap: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-8 w-8" />,
  DOCX: <FileType className="h-8 w-8" />,
  IMAGE: <Image className="h-8 w-8" />,
};

interface FileDropzoneProps {
  sourceType: CustomMaterialSourceType;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
  className?: string;
}

/**
 * Drag and drop file upload zone for PDF, DOCX, and Image files.
 */
export function FileDropzone({
  sourceType,
  file,
  onFileSelect,
  error,
  className,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
      }

      // Check file type
      const accept = acceptMap[sourceType];
      if (accept) {
        const acceptedTypes = accept.split(",");
        const isValid = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.includes("*")) {
            const [mainType] = type.split("/");
            return file.type.startsWith(mainType);
          }
          return file.type === type;
        });

        if (!isValid) {
          return `Invalid file type. Please upload a ${sourceType} file.`;
        }
      }

      return null;
    },
    [sourceType]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        onFileSelect(null);
      } else {
        setLocalError(null);
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    setLocalError(null);
  }, [onFileSelect]);

  const displayError = error || localError;

  // File selected state
  if (file) {
    return (
      <div className={cn("space-y-2", className)}>
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border",
            "bg-[#E8F5E9] border-[#4CAF50] dark:bg-[#1B5E20]/20 dark:border-[#4CAF50]"
          )}
        >
          <div className="p-2 rounded-lg bg-[#4CAF50]/20 text-[#4CAF50]">
            {iconMap[sourceType]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#202124] dark:text-[#E8EAED] truncate">
              {file.name}
            </p>
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-[#5F6368] hover:text-[#D32F2F] hover:bg-[#D32F2F]/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Dropzone state
  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all duration-200",
          "cursor-pointer hover:border-[#4285F4] hover:bg-[#4285F4]/5",
          isDragOver
            ? "border-[#4285F4] bg-[#4285F4]/10"
            : displayError
            ? "border-[#D32F2F] bg-[#D32F2F]/5"
            : "border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]"
        )}
      >
        <input
          type="file"
          accept={acceptMap[sourceType]}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`Upload ${sourceType} file`}
        />

        <div
          className={cn(
            "p-4 rounded-full mb-4",
            isDragOver
              ? "bg-[#4285F4]/20 text-[#4285F4]"
              : "bg-[#F1F3F4] dark:bg-[#2E2E2E] text-[#5F6368] dark:text-[#9AA0A6]"
          )}
        >
          <Upload className="h-8 w-8" />
        </div>

        <p className="text-[#202124] dark:text-[#E8EAED] font-medium mb-1">
          {isDragOver ? "Drop your file here" : "Drag & drop your file here"}
        </p>
        <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] mb-2">
          or click to browse
        </p>
        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
          {sourceType === "PDF" && "PDF files up to 10MB, max 20 pages"}
          {sourceType === "DOCX" && "Word documents up to 10MB"}
          {sourceType === "IMAGE" && "JPG, PNG, or WebP up to 10MB"}
        </p>
      </div>

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-2 text-[#D32F2F] text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
