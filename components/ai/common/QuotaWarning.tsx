"use client";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock } from "lucide-react";

interface QuotaWarningProps {
  used: number;
  limit: number;
  feature?: string;
  resetTime?: Date;
  className?: string;
}

/**
 * QuotaWarning component for displaying AI usage quota warnings.
 * Shows when user is approaching or has reached their daily limit.
 */
export function QuotaWarning({
  used,
  limit,
  feature = "AI",
  resetTime,
  className,
}: QuotaWarningProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  if (percentage < 70) {
    return null; // Don't show warning if under 70%
  }

  const formatResetTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Alert
      variant={isAtLimit ? "destructive" : "default"}
      className={cn(
        isNearLimit && !isAtLimit && "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10",
        className
      )}
    >
      <AlertTriangle className={cn(
        "h-4 w-4",
        isAtLimit ? "text-destructive" : "text-yellow-600 dark:text-yellow-500"
      )} />
      <AlertTitle className={cn(
        isAtLimit ? "" : "text-yellow-800 dark:text-yellow-400"
      )}>
        {isAtLimit ? `${feature} Limit Reached` : `${feature} Usage Warning`}
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-2 mt-2">
          <p className={cn(
            "text-sm",
            isAtLimit ? "" : "text-yellow-700 dark:text-yellow-300"
          )}>
            {isAtLimit
              ? `You've used all ${limit} ${feature} requests for today.`
              : `You've used ${used} of ${limit} ${feature} requests today (${Math.round(percentage)}%).`}
          </p>
          
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              isAtLimit ? "bg-destructive/20" : "bg-yellow-200 dark:bg-yellow-900/30"
            )}
          />
          
          {resetTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Resets in {formatResetTime(resetTime)}</span>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Compact quota indicator for headers/navigation
 */
export function QuotaIndicator({
  used,
  limit,
  className,
}: Pick<QuotaWarningProps, "used" | "limit" | "className">) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        isAtLimit && "text-destructive",
        isNearLimit && !isAtLimit && "text-yellow-600 dark:text-yellow-500",
        className
      )}
      role="status"
      aria-label={`AI quota: ${used} of ${limit} used`}
    >
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isAtLimit && "bg-destructive",
            isNearLimit && !isAtLimit && "bg-yellow-500",
            !isNearLimit && "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {used}/{limit}
      </span>
    </div>
  );
}
