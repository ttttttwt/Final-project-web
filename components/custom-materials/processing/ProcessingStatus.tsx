"use client";

import { cn } from "@/lib/utils";
import { CustomMaterialStatus } from "@/types/custom-materials";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface ProcessingStatusProps {
  status: CustomMaterialStatus;
  progress?: number;
  errorMessage?: string;
  onRetry?: () => void;
  onViewResult?: () => void;
  className?: string;
}

const statusConfig: Record<
  CustomMaterialStatus,
  {
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  PENDING: {
    icon: <Clock className="h-8 w-8" />,
    label: "Queued",
    description: "Your material is waiting in the queue...",
    color: "text-[#F57F17]",
    bgColor: "bg-[#FFF8E1] dark:bg-[#F57F17]/10",
  },
  PROCESSING: {
    icon: <Loader2 className="h-8 w-8 animate-spin" />,
    label: "Processing",
    description: "AI is analyzing your content...",
    color: "text-[#4285F4]",
    bgColor: "bg-[#E3F2FD] dark:bg-[#4285F4]/10",
  },
  COMPLETED: {
    icon: <CheckCircle className="h-8 w-8" />,
    label: "Completed",
    description: "Your learning materials are ready!",
    color: "text-[#4CAF50]",
    bgColor: "bg-[#E8F5E9] dark:bg-[#4CAF50]/10",
  },
  FAILED: {
    icon: <XCircle className="h-8 w-8" />,
    label: "Failed",
    description: "Something went wrong during processing.",
    color: "text-[#D32F2F]",
    bgColor: "bg-[#FFEBEE] dark:bg-[#D32F2F]/10",
  },
};

/**
 * Display component for material processing status.
 * Shows progress bar, animated icons, and action buttons.
 */
export function ProcessingStatus({
  status,
  progress,
  errorMessage,
  onRetry,
  onViewResult,
  className,
}: ProcessingStatusProps) {
  const config = statusConfig[status];
  const isProcessing = status === "PENDING" || status === "PROCESSING";
  const displayProgress = progress ?? (status === "PROCESSING" ? 50 : 0);

  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all duration-300",
        config.bgColor,
        "border-[#E0E0E0] dark:border-[#2E2E2E]",
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div
          className={cn(
            "p-4 rounded-full",
            status === "COMPLETED" && "bg-[#4CAF50]/20",
            status === "FAILED" && "bg-[#D32F2F]/20",
            status === "PROCESSING" && "bg-[#4285F4]/20",
            status === "PENDING" && "bg-[#F57F17]/20"
          )}
        >
          <span className={config.color}>{config.icon}</span>
        </div>

        {/* Status text */}
        <div>
          <h3
            className={cn(
              "text-xl font-semibold mb-1",
              config.color
            )}
          >
            {config.label}
          </h3>
          <p className="text-[#5F6368] dark:text-[#9AA0A6]">
            {errorMessage || config.description}
          </p>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={displayProgress} className="h-2" />
            {progress !== undefined && (
              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                {progress}% complete
              </p>
            )}
          </div>
        )}

        {/* Processing tips */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
            <Sparkles className="h-4 w-4" />
            <span>This usually takes 30-60 seconds</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          {status === "COMPLETED" && onViewResult && (
            <Button onClick={onViewResult} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              View Results
            </Button>
          )}

          {status === "FAILED" && onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>

        {/* Processing disclaimer */}
        {isProcessing && (
          <p className="text-xs text-[#9AA0A6] max-w-sm">
            You can close this page. We&apos;ll notify you when it&apos;s ready.
          </p>
        )}
      </div>
    </div>
  );
}
