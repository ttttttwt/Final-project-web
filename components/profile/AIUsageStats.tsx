"use client";

import { UserAiQuota, calculateQuotaUsage, QuotaUsage, QUOTA_LIMITS } from "@/types/ai";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Zap, MessageSquare, BookOpen, FileText, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface AIUsageStatsProps {
  quota: UserAiQuota;
  nextBillingDate?: string;
}

export function AIUsageStats({ quota, nextBillingDate }: AIUsageStatsProps) {
  // Use new subscription-based fields if available, fallback to legacy
  const roleplayUsed = quota.roleplaySessionsUsed ?? quota.rolePlayUsedMonth ?? 0;
  const roleplayLimit = quota.roleplaySessionsLimit ?? quota.rolePlayMonthlyLimit ?? QUOTA_LIMITS.FREE.roleplaySessions;

  const flashcardUsed = quota.flashcardDecksUsed ?? quota.flashcardUsedMonth ?? 0;
  const flashcardLimit = quota.flashcardDecksLimit ?? quota.flashcardMonthlyLimit ?? QUOTA_LIMITS.FREE.flashcardDecks;

  const grammarUsed = quota.grammarExercisesUsed ?? quota.grammarUsedMonth ?? 0;
  const grammarLimit = quota.grammarExercisesLimit ?? quota.grammarMonthlyLimit ?? QUOTA_LIMITS.FREE.grammarExercises;

  const totalUsed = quota.totalRequestsUsed ?? quota.monthlyUsed ?? 0;
  const totalLimit = quota.totalRequestsLimit ?? quota.monthlyLimit ?? QUOTA_LIMITS.FREE.totalRequests;

  // Calculate usage stats
  const totalUsage = calculateQuotaUsage(totalUsed, totalLimit);
  const roleplayUsage = calculateQuotaUsage(roleplayUsed, roleplayLimit);
  const flashcardUsage = calculateQuotaUsage(flashcardUsed, flashcardLimit);
  const grammarUsage = calculateQuotaUsage(grammarUsed, grammarLimit);

  // Determine reset date
  const resetDate = quota.quotaResetDate
    ? format(new Date(quota.quotaResetDate), "dd/MM/yyyy")
    : nextBillingDate
      ? format(new Date(nextBillingDate), "dd/MM/yyyy")
      : format(new Date(quota.lastResetMonthly), "dd/MM/yyyy");

  // Check for warnings using new flags or calculated
  const isWarning = quota.quotaWarning || totalUsage.isWarning || roleplayUsage.isWarning || flashcardUsage.isWarning || grammarUsage.isWarning;
  const isCritical = quota.quotaCritical || totalUsage.isCritical || roleplayUsage.isCritical || flashcardUsage.isCritical || grammarUsage.isCritical;
  const isExceeded = totalUsage.isExceeded || roleplayUsage.isExceeded || flashcardUsage.isExceeded || grammarUsage.isExceeded;

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
            {totalUsed} / {totalLimit} ({Math.round(totalUsage.percentage)}%)
          </span>
        </div>
        <Progress
          value={totalUsage.percentage}
          className={`h-2 ${totalUsage.isExceeded ? '[&>div]:bg-red-500' : totalUsage.isCritical ? '[&>div]:bg-orange-500' : totalUsage.isWarning ? '[&>div]:bg-yellow-500' : ''}`}
        />
      </div>

      {/* Feature Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureStat
          label="Role Play"
          icon={<MessageSquare className="h-4 w-4" />}
          usage={roleplayUsage}
        />
        <FeatureStat
          label="Flashcard Decks"
          icon={<BookOpen className="h-4 w-4" />}
          usage={flashcardUsage}
        />
        <FeatureStat
          label="Grammar Exercises"
          icon={<FileText className="h-4 w-4" />}
          usage={grammarUsage}
        />
      </div>

      {/* Warnings */}
      {isExceeded ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quota Limit Reached</AlertTitle>
          <AlertDescription>
            You have used all your AI requests for this billing period. Upgrade your plan or wait until {resetDate}.
          </AlertDescription>
        </Alert>
      ) : isCritical ? (
        <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-orange-800 dark:text-orange-400">Critical Quota Warning</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            You are at 95%+ of your monthly AI usage limit. Consider upgrading to Pro.
          </AlertDescription>
        </Alert>
      ) : isWarning ? (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-500">Quota Warning</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            You are approaching your monthly AI usage limit (80%+).
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

interface FeatureStatProps {
  label: string;
  icon: React.ReactNode;
  usage: QuotaUsage;
}

function FeatureStat({ label, icon, usage }: FeatureStatProps) {
  const getProgressColor = () => {
    if (usage.isExceeded) return '[&>div]:bg-red-500';
    if (usage.isCritical) return '[&>div]:bg-orange-500';
    if (usage.isWarning) return '[&>div]:bg-yellow-500';
    return '';
  };

  return (
    <div className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{usage.used} / {usage.limit}</span>
        <span>{Math.round(usage.percentage)}%</span>
      </div>
      <Progress value={usage.percentage} className={`h-1.5 ${getProgressColor()}`} />
    </div>
  );
}
