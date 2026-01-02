"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Crown, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface QuotaWarningProps {
  used: number;
  limit: number;
  feature?: string;
  resetTime?: Date;
  daysUntilReset?: number;
  planType?: 'FREE' | 'MONTHLY' | 'YEARLY';
  className?: string;
}

/**
 * QuotaWarning component for displaying AI usage quota warnings.
 * Shows when user is approaching or has reached their monthly limit.
 */
export function QuotaWarning({
  used,
  limit,
  feature = "AI",
  resetTime,
  daysUntilReset,
  planType = 'FREE',
  className,
}: QuotaWarningProps) {
  const { t } = useTranslation();
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isCritical = percentage >= 95;
  const isAtLimit = percentage >= 100;

  if (percentage < 70) {
    return null; // Don't show warning if under 70%
  }

  const formatResetTime = () => {
    if (daysUntilReset !== undefined) {
      if (daysUntilReset <= 1) return t("ai.common.tomorrow");
      return t("ai.common.inDays", { count: daysUntilReset });
    }

    if (resetTime) {
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) return t("ai.common.inDays", { count: days });
      if (hours > 0) return t("ai.common.inHours", { count: hours });
      return t("ai.common.soon");
    }

    return "";
  };

  const isPro = planType !== 'FREE';
  const resetText = formatResetTime();

  return (
    <Alert
      variant={isAtLimit ? "destructive" : "default"}
      className={cn(
        isCritical && !isAtLimit && "border-orange-500 bg-orange-50 dark:bg-orange-900/10",
        isNearLimit && !isCritical && "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10",
        className
      )}
    >
      <AlertTriangle className={cn(
        "h-4 w-4",
        isAtLimit ? "text-destructive" :
          isCritical ? "text-orange-600 dark:text-orange-500" :
            "text-yellow-600 dark:text-yellow-500"
      )} />
      <AlertTitle className={cn(
        isAtLimit ? "" :
          isCritical ? "text-orange-800 dark:text-orange-400" :
            "text-yellow-800 dark:text-yellow-400"
      )}>
        {isAtLimit
          ? t("ai.common.quotaExhausted", { feature })
          : isCritical
            ? t("ai.common.quotaCritical", { feature })
            : t("ai.common.quotaWarning", { feature })}
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-3 mt-2">
          <p className={cn(
            "text-sm",
            isAtLimit ? "" :
              isCritical ? "text-orange-700 dark:text-orange-300" :
                "text-yellow-700 dark:text-yellow-300"
          )}>
            {isAtLimit
              ? t("ai.common.quotaUsedAll", { limit, feature })
              : t("ai.common.quotaUsedProgress", { used, limit, feature, percentage: Math.round(percentage) })}
          </p>

          <Progress
            value={percentage}
            className={cn(
              "h-2",
              isAtLimit ? "bg-destructive/20" :
                isCritical ? "bg-orange-200 dark:bg-orange-900/30" :
                  "bg-yellow-200 dark:bg-yellow-900/30"
            )}
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            {resetText && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{t("ai.common.resetsIn", { time: resetText })}</span>
              </div>
            )}

            {!isPro && (
              <Button asChild size="sm" variant="outline" className="gap-2 border-[#FFB300] text-[#5D4037] hover:bg-[#FFF8E1]">
                <Link href="/subscription">
                  <Crown className="h-3.5 w-3.5" />
                  {t("ai.common.upgrade")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface QuotaIndicatorProps {
  used: number;
  limit: number;
  planType?: 'FREE' | 'MONTHLY' | 'YEARLY';
  className?: string;
}

/**
 * Compact quota indicator for headers/navigation
 */
export function QuotaIndicator({
  used,
  limit,
  planType = 'FREE',
  className,
}: QuotaIndicatorProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isCritical = percentage >= 95;
  const isAtLimit = percentage >= 100;
  const isPro = planType !== 'FREE';

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        isAtLimit && "text-destructive",
        isCritical && !isAtLimit && "text-orange-600 dark:text-orange-500",
        isNearLimit && !isCritical && "text-yellow-600 dark:text-yellow-500",
        className
      )}
      role="status"
      aria-label={`AI quota: ${used} of ${limit} used`}
    >
      {isPro && <Crown className="h-3.5 w-3.5 text-[#FFB300]" />}
      {!isPro && <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />}

      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isAtLimit && "bg-destructive",
            isCritical && !isAtLimit && "bg-orange-500",
            isNearLimit && !isCritical && "bg-yellow-500",
            !isNearLimit && "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {used}/{limit}
      </span>
    </div>
  );
}
