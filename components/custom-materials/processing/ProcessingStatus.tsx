"use client";

import { cn } from "@/lib/utils";
import { CustomMaterialStatus } from "@/types/custom-materials";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Sparkles,
  Check,
  Circle,
  Lightbulb,
} from "lucide-react";

interface ProcessingStatusProps {
  status: CustomMaterialStatus;
  progress?: number;
  errorMessage?: string;
  onRetry?: () => void;
  onViewResult?: () => void;
  className?: string;
}

const TIPS = [
  "Did you know? Learning 1,000 common words covers 75% of daily usage.",
  "Tip: Try shadowing - repeating what you hear immediately to improve fluency.",
  "Fun fact: The word 'set' has the most definitions in the English language!",
  "Pro tip: Review vocabulary right before sleep to improve retention.",
  "Consistency is key! Even 10 minutes a day makes a huge difference.",
  "Did you know? English is the official language of 67 different countries.",
];

const PROCESSING_STEPS = [
  { id: "extract", label: "Extracting & Analyzing Source", threshold: 0 },
  { id: "vocab", label: "Identifying Key Vocabulary", threshold: 25 },
  { id: "exercises", label: "Generating Interactive Exercises", threshold: 50 },
  { id: "roleplay", label: "Building Role-play Scenario", threshold: 75 },
  { id: "final", label: "Finalizing Materials", threshold: 90 },
];

const statusConfig: Record<
  CustomMaterialStatus,
  {
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  PENDING: {
    icon: <Clock className="h-10 w-10" />,
    label: "Queued",
    description: "Preparing the magic workspace...",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/40",
  },
  PROCESSING: {
    icon: <Sparkles className="h-10 w-10 animate-pulse text-blue-500" />,
    label: "Generating Content",
    description: "Our AI is crafting your personalized lessons",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900/40",
  },
  COMPLETED: {
    icon: <CheckCircle className="h-10 w-10 border-green-500" />,
    label: "Success!",
    description: "Your materials are ready for practice.",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-900/40",
  },
  FAILED: {
    icon: <XCircle className="h-10 w-10" />,
    label: "Generation Failed",
    description: "We hit a snag while processing your content.",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-900/40",
  },
};

export function ProcessingStatus({
  status,
  progress,
  errorMessage,
  onRetry,
  onViewResult,
  className,
}: ProcessingStatusProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const config = statusConfig[status];
  const isProcessing = status === "PENDING" || status === "PROCESSING";
  const displayProgress = progress ?? (status === "PROCESSING" ? 10 : 0);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-8 transition-all duration-500 shadow-xl overflow-hidden relative",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Subtle Animated Background - Only for processing */}
      {isProcessing && (
        <div className="absolute top-0 right-0 -m-8 opacity-10 pointer-events-none">
          <RefreshCw className="h-48 w-48 animate-[spin_10s_linear_infinite]" />
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-6 relative z-10">
        {/* Status Badge */}
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2",
          status === "PENDING" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          status === "PROCESSING" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          status === "COMPLETED" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          status === "FAILED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        )}>
          {status}
        </div>

        {/* Dynamic Icon with Animation Overlay */}
        <div className="relative">
          <div className={cn(
            "p-5 rounded-full bg-background/80 backdrop-blur-sm border-2 shadow-inner",
            config.borderColor
          )}>
            <div className={config.color}>{config.icon}</div>
          </div>
          {isProcessing && (
            <div className="absolute -top-1 -right-1">
              <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="max-w-md">
          <h3 className={cn("text-2xl font-bold mb-2", config.color)}>
            {config.label}
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {errorMessage || config.description}
          </p>
        </div>

        {/* Progress Section */}
        {isProcessing && (
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Current Progress</span>
                <span className={config.color}>{displayProgress}%</span>
              </div>
              <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full transition-all duration-700 ease-out rounded-full",
                    "bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  )}
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
            </div>

            {/* Processing Steps Checklist */}
            <div className="text-left bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-2">Processing Steps</h4>
              {PROCESSING_STEPS.map((step) => {
                const isDone = displayProgress > step.threshold + 10;
                const isActive = displayProgress >= step.threshold && displayProgress <= step.threshold + 20;

                return (
                  <div key={step.id} className="flex items-center gap-3">
                    {isDone ? (
                      <div className="bg-green-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/30" />
                    )}
                    <span className={cn(
                      "text-sm transition-colors duration-300",
                      isDone ? "text-muted-foreground line-through opacity-70" :
                        isActive ? "text-primary font-bold" : "text-muted-foreground/50"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Engagement Tip */}
        {isProcessing && (
          <div className="max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 text-left items-start">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm italic text-foreground/80 leading-snug">
                {TIPS[tipIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full justify-center">
          {status === "COMPLETED" && onViewResult && (
            <Button onClick={onViewResult} className="gap-2 h-12 px-8 text-base shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 transition-all hover:scale-105">
              <CheckCircle className="h-5 w-5" />
              Access Materials
            </Button>
          )}

          {status === "FAILED" && onRetry && (
            <Button onClick={onRetry} variant="destructive" className="gap-2 h-12 px-8 shadow-lg shadow-red-500/20 transition-all hover:scale-105">
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
          )}
        </div>

        {/* Processing disclaimer */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground animate-pulse">
              Generation usually takes about 30 seconds...
            </p>
            <p className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-tighter">
              Feel free to leave this page • We&apos;ll notify you
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
