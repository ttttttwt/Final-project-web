"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { aiQuotaService } from "@/services/aiQuotaService";
import { UserAiQuota, QUOTA_LIMITS } from "@/types/ai";

interface RemainingQuotaBadgeProps {
    /** Feature type: 'roleplay' | 'flashcard' | 'grammar' | 'total' */
    featureType: 'roleplay' | 'flashcard' | 'grammar' | 'total';
    /** Show compact version (only badge, no label) */
    compact?: boolean;
    /** Optional class name */
    className?: string;
}

/**
 * Displays remaining quota for a specific AI feature.
 * Shows warning colors when approaching limits.
 */
export function RemainingQuotaBadge({ featureType, compact = false, className = "" }: RemainingQuotaBadgeProps) {
    const [quota, setQuota] = useState<UserAiQuota | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuota = async () => {
            try {
                setIsLoading(true);
                const data = await aiQuotaService.getMyQuota();
                setQuota(data);
            } catch (error) {
                console.error("Failed to fetch quota:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuota();
    }, []);

    if (isLoading) {
        return <Skeleton className="h-6 w-20" />;
    }

    if (!quota) {
        return null;
    }

    // Get usage and limit based on feature type
    let used: number;
    let limit: number;
    let label: string;

    switch (featureType) {
        case 'roleplay':
            used = quota.roleplaySessionsUsed ?? quota.rolePlayUsedMonth ?? 0;
            limit = quota.roleplaySessionsLimit ?? QUOTA_LIMITS.FREE.roleplaySessions;
            label = "Role Play";
            break;
        case 'flashcard':
            used = quota.flashcardDecksUsed ?? quota.flashcardUsedMonth ?? 0;
            limit = quota.flashcardDecksLimit ?? QUOTA_LIMITS.FREE.flashcardDecks;
            label = "Flashcard Decks";
            break;
        case 'grammar':
            used = quota.grammarExercisesUsed ?? quota.grammarUsedMonth ?? 0;
            limit = quota.grammarExercisesLimit ?? QUOTA_LIMITS.FREE.grammarExercises;
            label = "Exercises";
            break;
        case 'total':
        default:
            used = quota.totalRequestsUsed ?? quota.monthlyUsed ?? 0;
            limit = quota.totalRequestsLimit ?? QUOTA_LIMITS.FREE.totalRequests;
            label = "AI Requests";
    }

    const remaining = Math.max(0, limit - used);
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const isWarning = percentage >= 80;
    const isCritical = percentage >= 95;
    const isExceeded = percentage >= 100;

    // Determine badge variant and color
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let bgColor = "";
    let textColor = "";

    if (isExceeded) {
        variant = "destructive";
    } else if (isCritical) {
        bgColor = "bg-orange-100 dark:bg-orange-900/30";
        textColor = "text-orange-700 dark:text-orange-300";
    } else if (isWarning) {
        bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
        textColor = "text-yellow-700 dark:text-yellow-300";
    }

    const badgeContent = (
        <Badge
            variant={variant}
            className={`${bgColor} ${textColor} ${className}`}
        >
            {isExceeded && <AlertTriangle className="h-3 w-3 mr-1" />}
            {!isExceeded && <Zap className="h-3 w-3 mr-1" />}
            {remaining} / {limit}
        </Badge>
    );

    const tooltipContent = (
        <div className="text-center">
            <p className="font-medium">{label} Quota</p>
            <p className="text-xs text-muted-foreground">
                {remaining} remaining this month
            </p>
            {isExceeded && (
                <Link href="/subscription" className="text-xs text-primary underline">
                    Upgrade to continue
                </Link>
            )}
        </div>
    );

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {badgeContent}
                    </TooltipTrigger>
                    <TooltipContent>
                        {tooltipContent}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`flex items-center gap-2 ${className}`}>
                        <span className="text-sm text-muted-foreground">{label}:</span>
                        {badgeContent}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    {tooltipContent}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
