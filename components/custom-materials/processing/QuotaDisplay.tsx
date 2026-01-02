"use client";

import { cn } from "@/lib/utils";
import { QuotaInfo } from "@/types/custom-materials";
import { AlertTriangle, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";

interface QuotaDisplayProps {
  quota: QuotaInfo | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * Display daily quota usage for custom materials.
 */
export function QuotaDisplay({
  quota,
  isLoading,
  className,
}: QuotaDisplayProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#2E2E2E] animate-pulse",
          className
        )}
      >
        <div className="h-5 w-5 rounded-full bg-[#E0E0E0] dark:bg-[#404040]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-[#E0E0E0] dark:bg-[#404040]" />
          <div className="h-2 w-full rounded bg-[#E0E0E0] dark:bg-[#404040]" />
        </div>
      </div>
    );
  }

  if (!quota) return null;

  const percentage = (quota.used / quota.limit) * 100;
  const isLow = quota.remaining <= 2;
  const isExhausted = quota.remaining === 0;

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        isExhausted
          ? "bg-[#FFEBEE] dark:bg-[#D32F2F]/10 border-[#FFCDD2] dark:border-[#D32F2F]/30"
          : isLow
            ? "bg-[#FFF8E1] dark:bg-[#F57F17]/10 border-[#FFE082] dark:border-[#F57F17]/30"
            : "bg-[#F5F5F5] dark:bg-[#2E2E2E] border-[#E0E0E0] dark:border-[#2E2E2E]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isExhausted || isLow ? (
          <AlertTriangle
            className={cn(
              "h-5 w-5 flex-shrink-0",
              isExhausted ? "text-[#D32F2F]" : "text-[#F57F17]"
            )}
          />
        ) : (
          <Zap className="h-5 w-5 text-[#4285F4] flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">
              {t("customMaterials.monthlyQuota")}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                isExhausted
                  ? "text-[#D32F2F]"
                  : isLow
                    ? "text-[#F57F17]"
                    : "text-[#5F6368] dark:text-[#9AA0A6]"
              )}
            >
              {quota.remaining} / {quota.limit} {t("customMaterials.remaining")}
            </span>
          </div>

          <Progress
            value={percentage}
            className={cn(
              "h-2",
              isExhausted && "[&>div]:bg-[#D32F2F]",
              isLow && !isExhausted && "[&>div]:bg-[#F57F17]"
            )}
          />

          {isExhausted && (
            <p className="mt-2 text-xs text-[#D32F2F]">
              {t("customMaterials.quotaExhausted")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
