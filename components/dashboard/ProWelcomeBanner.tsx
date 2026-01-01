"use client";

import * as React from "react";
import { X, Crown, Sparkles, Zap, MessageSquare, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

/**
 * ProWelcomeBanner Component
 * 
 * A premium dismissible banner for Pro users displayed at the top of the dashboard.
 * Features:
 * - Animated gold gradient background
 * - Floating sparkle effects
 * - Crown icon and welcome message
 * - Premium feature highlights
 * - Dismiss button that persists to localStorage
 * 
 * @example
 * ```tsx
 * <ProWelcomeBanner />
 * ```
 */

const BANNER_DISMISSED_KEY = "lexia_pro_banner_dismissed";

interface ProWelcomeBannerProps {
    /** Additional className */
    className?: string;
}

export function ProWelcomeBanner({ className }: ProWelcomeBannerProps) {
    const { t } = useTranslation();
    const [isDismissed, setIsDismissed] = React.useState(true); // Start hidden to prevent flash

    // Premium features with translated labels
    const premiumFeatures = [
        { icon: MessageSquare, label: t("dashboard.rolePlaySessions", { count: 50 }) },
        { icon: BookOpen, label: t("dashboard.flashcardDecks", { count: 30 }) },
        { icon: FileText, label: t("dashboard.grammarExercises", { count: 300 }) },
        { icon: Zap, label: t("dashboard.prioritySupport") },
    ];

    // Check localStorage on mount
    React.useEffect(() => {
        const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
        setIsDismissed(dismissed === "true");
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    };

    if (isDismissed) {
        return null;
    }

    return (
        <div
            className={cn(
                // Base styling
                "relative overflow-hidden rounded-xl",
                // Enhanced gradient with animation-ready background
                "bg-gradient-to-r from-[#FFB300] via-[#FFD54F] to-[#FFA000]",
                // Premium shadow
                "shadow-lg shadow-[#FFB300]/20",
                // Border for depth
                "border border-[#FFD54F]/50",
                // Padding
                "p-5 md:p-6",
                // Shimmer effect
                "pro-shimmer-enhanced",
                className
            )}
            role="banner"
            aria-label="Pro membership welcome message"
        >
            {/* Animated sparkle elements */}
            <div className="pro-sparkle-container pointer-events-none">
                <div className="pro-sparkle" style={{ top: '15%', left: '8%' }} />
                <div className="pro-sparkle" style={{ top: '25%', right: '12%', animationDelay: '0.5s' }} />
                <div className="pro-sparkle" style={{ bottom: '20%', left: '15%', animationDelay: '1s' }} />
                <div className="pro-sparkle" style={{ bottom: '30%', right: '8%', animationDelay: '1.5s' }} />
            </div>

            {/* Decorative sparkles - static */}
            <div className="absolute top-3 right-16 opacity-40">
                <Sparkles className="h-6 w-6 text-white pro-float" />
            </div>
            <div className="absolute bottom-3 left-10 opacity-25">
                <Sparkles className="h-4 w-4 text-white" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute top-1/2 right-1/4 opacity-20">
                <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Crown + Message */}
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm shadow-inner">
                        <Crown className="h-7 w-7 text-[#5D4037] drop-shadow-sm" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-[#5D4037] flex items-center gap-2">
                            {t("dashboard.welcomeToPro")}
                            <span className="text-sm font-normal opacity-80">🎉</span>
                        </h3>
                        <p className="text-sm text-[#5D4037]/80 max-w-md">
                            {t("dashboard.proWelcomeMessage")}
                        </p>
                    </div>
                </div>

                {/* Right: Features + Dismiss */}
                <div className="flex items-center gap-4">
                    {/* Premium features - hidden on mobile */}
                    <div className="hidden lg:flex items-center gap-3">
                        {premiumFeatures.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 text-sm text-[#5D4037]/90 bg-white/20 rounded-full px-3 py-1.5"
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{label}</span>
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="shrink-0 text-[#5D4037] hover:bg-white/30 hover:text-[#5D4037] rounded-full transition-all duration-200"
                        aria-label="Dismiss banner"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex lg:hidden flex-wrap gap-2 mt-4">
                {premiumFeatures.map(({ icon: Icon, label }) => (
                    <div
                        key={label}
                        className="flex items-center gap-2 text-sm text-[#5D4037]/90 bg-white/20 rounded-full px-3 py-1.5"
                    >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
