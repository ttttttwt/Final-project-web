"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertTriangle,
    MessageSquare,
    BookOpen,
    FileText,
    Zap,
    Crown,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { aiQuotaService } from "@/services/aiQuotaService";
import { UserAiQuota, calculateQuotaUsage, QuotaUsage } from "@/types/ai";

interface QuotaProgressBarProps {
    label: string;
    icon: React.ReactNode;
    usage: QuotaUsage;
}

function QuotaProgressBar({ label, icon, usage }: QuotaProgressBarProps) {
    const getVariant = () => {
        if (usage.isExceeded) return "destructive";
        if (usage.isCritical) return "destructive";
        if (usage.isWarning) return "warning";
        return "default";
    };

    const getProgressColor = () => {
        if (usage.isExceeded) return "bg-red-500";
        if (usage.isCritical) return "bg-orange-500";
        if (usage.isWarning) return "bg-yellow-500";
        return "bg-primary";
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="tabular-nums">
                        {usage.used}/{usage.limit}
                    </span>
                    {usage.isExceeded && (
                        <Badge variant="destructive" className="text-xs">
                            Đã hết
                        </Badge>
                    )}
                    {usage.isCritical && !usage.isExceeded && (
                        <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Sắp hết
                        </Badge>
                    )}
                    {usage.isWarning && !usage.isCritical && (
                        <Badge variant="outline" className="text-xs text-yellow-600">
                            {Math.round(usage.percentage)}%
                        </Badge>
                    )}
                </div>
            </div>
            <Progress
                value={Math.min(usage.percentage, 100)}
                className={`h-2 ${usage.isExceeded || usage.isCritical ? "[&>div]:bg-red-500" : usage.isWarning ? "[&>div]:bg-yellow-500" : ""}`}
            />
        </div>
    );
}

function UpgradeCTA() {
    return (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Crown className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="font-medium text-sm">Nâng cấp lên Pro</p>
                    <p className="text-xs text-muted-foreground">
                        Nhận quota cao hơn 3-5 lần và nhiều tính năng độc quyền
                    </p>
                </div>
                <Button asChild size="sm">
                    <Link href="/subscription">
                        Nâng cấp
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function QuotaExceededAlert({ featureName }: { featureName: string }) {
    return (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">
                    Bạn đã dùng hết quota <strong>{featureName}</strong> tháng này.{" "}
                    <Link href="/subscription" className="underline font-medium">
                        Nâng cấp Pro
                    </Link>{" "}
                    để tiếp tục!
                </p>
            </div>
        </div>
    );
}

interface AiUsageSectionProps {
    /** If true, display a more compact version suitable for sidebars */
    compact?: boolean;
}

export function AiUsageSection({ compact = false }: AiUsageSectionProps) {
    const [quota, setQuota] = useState<UserAiQuota | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchQuota = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await aiQuotaService.getMyQuota();
            setQuota(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuota();
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error || !quota) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">AI Usage This Month</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Unable to load quota information.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchQuota()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Calculate quota usage for each feature
    const roleplayUsage = calculateQuotaUsage(
        quota.roleplaySessionsUsed ?? 0,
        quota.roleplaySessionsLimit ?? 10
    );
    const flashcardUsage = calculateQuotaUsage(
        quota.flashcardDecksUsed ?? 0,
        quota.flashcardDecksLimit ?? 10
    );
    const grammarUsage = calculateQuotaUsage(
        quota.grammarExercisesUsed ?? 0,
        quota.grammarExercisesLimit ?? 75
    );
    const customMaterialUsage = calculateQuotaUsage(
        quota.customMaterialsUsed ?? 0,
        quota.customMaterialsLimit ?? 10
    );
    const totalUsage = calculateQuotaUsage(
        quota.totalRequestsUsed ?? quota.monthlyUsed ?? 0,
        quota.totalRequestsLimit ?? 100
    );

    const isPro = quota.planType === "MONTHLY" || quota.planType === "YEARLY";
    const hasExceeded = roleplayUsage.isExceeded || flashcardUsage.isExceeded ||
        grammarUsage.isExceeded || customMaterialUsage.isExceeded || totalUsage.isExceeded;

    return (
        <Card className={quota.quotaCritical ? "border-orange-500" : quota.quotaWarning ? "border-yellow-500" : ""}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">AI Usage This Month</CardTitle>
                        {isPro && (
                            <Badge variant="secondary" className="ml-2">
                                <Crown className="h-3 w-3 mr-1" />
                                Pro
                            </Badge>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Resets in <strong>{quota.daysUntilReset ?? 30}</strong> days
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Show exceeded alerts */}
                {roleplayUsage.isExceeded && <QuotaExceededAlert featureName="Role Play" />}
                {flashcardUsage.isExceeded && <QuotaExceededAlert featureName="Flashcards" />}
                {grammarUsage.isExceeded && <QuotaExceededAlert featureName="Grammar Exercises" />}
                {customMaterialUsage.isExceeded && <QuotaExceededAlert featureName="Custom Materials" />}
                {totalUsage.isExceeded && <QuotaExceededAlert featureName="Total AI Requests" />}

                {/* Progress bars */}
                <QuotaProgressBar
                    label="Role Play Sessions"
                    icon={<MessageSquare className="h-4 w-4 text-blue-500" />}
                    usage={roleplayUsage}
                />
                <QuotaProgressBar
                    label="Flashcard Decks"
                    icon={<BookOpen className="h-4 w-4 text-green-500" />}
                    usage={flashcardUsage}
                />
                <QuotaProgressBar
                    label="Grammar Exercises"
                    icon={<FileText className="h-4 w-4 text-purple-500" />}
                    usage={grammarUsage}
                />
                <QuotaProgressBar
                    label="Custom Materials"
                    icon={<FileText className="h-4 w-4 text-indigo-500" />}
                    usage={customMaterialUsage}
                />
                <QuotaProgressBar
                    label="Total AI Requests"
                    icon={<Zap className="h-4 w-4 text-orange-500" />}
                    usage={totalUsage}
                />

                {/* Upgrade CTA for Free users */}
                {!isPro && <UpgradeCTA />}
            </CardContent>
        </Card>
    );
}

export default AiUsageSection;
