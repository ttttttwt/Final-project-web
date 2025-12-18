"use client";

import { UserAiQuota } from "@/types/ai";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Zap } from "lucide-react";
import { format } from "date-fns";

interface AIUsageStatsProps {
  quota: UserAiQuota;
  nextBillingDate?: string;
}

export function AIUsageStats({ quota, nextBillingDate }: AIUsageStatsProps) {
  const calculatePercentage = (used: number, limit: number) => {
    if (limit === 0) return 100;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const totalPercentage = calculatePercentage(quota.monthlyUsed, quota.monthlyLimit);
  const isNearLimit = totalPercentage >= 80;
  const isLimitReached = totalPercentage >= 100;

  const resetDate = nextBillingDate 
    ? format(new Date(nextBillingDate), "dd/MM/yyyy")
    : format(new Date(quota.lastResetMonthly), "dd/MM/yyyy"); // Fallback

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          AI Features Quota
        </h3>
        <span className="text-sm text-muted-foreground">
          Resets on {resetDate}
        </span>
      </div>

      {/* Total Usage */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Total AI Requests</span>
          <span className="text-muted-foreground">
            {quota.monthlyUsed} / {quota.monthlyLimit} ({totalPercentage}%)
          </span>
        </div>
        <Progress value={totalPercentage} className="h-2" />
      </div>

      {/* Feature Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureStat
          label="Role Play"
          used={quota.rolePlayUsedMonth}
          limit={quota.rolePlayMonthlyLimit}
        />
        <FeatureStat
          label="Generate Flashcards"
          used={quota.flashcardUsedMonth}
          limit={quota.flashcardMonthlyLimit}
        />
        <FeatureStat
          label="Generate Exercises"
          used={quota.grammarUsedMonth}
          limit={quota.grammarMonthlyLimit}
        />
      </div>

      {/* Warnings */}
      {isLimitReached ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quota Limit Reached</AlertTitle>
          <AlertDescription>
            You have used all your AI requests for this month. Upgrade your plan or wait until the next cycle.
          </AlertDescription>
        </Alert>
      ) : isNearLimit ? (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-500">Quota Warning</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            You are approaching your monthly AI usage limit.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function FeatureStat({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  
  return (
    <div className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="text-sm font-medium mb-2">{label}</div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{used} / {limit}</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}
