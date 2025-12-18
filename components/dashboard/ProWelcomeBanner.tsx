"use client";

import * as React from "react";
import { X, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ProWelcomeBanner Component
 * 
 * A dismissible banner for Pro users displayed at the top of the dashboard.
 * Features:
 * - Gold gradient background
 * - Crown icon and welcome message
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
    const [isDismissed, setIsDismissed] = React.useState(true); // Start hidden to prevent flash

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
                // Gold gradient background
                "relative overflow-hidden rounded-lg",
                "bg-gradient-to-r from-[#FFB300] via-[#FFD54F] to-[#FFA000]",
                // Shadow and border
                "shadow-md",
                "p-4",
                className
            )}
            role="banner"
            aria-label="Pro membership welcome message"
        >
            {/* Decorative sparkles */}
            <div className="absolute top-2 right-12 opacity-30">
                <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="absolute bottom-2 left-8 opacity-20">
                <Sparkles className="h-4 w-4 text-white" />
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Crown className="h-5 w-5 text-[#5D4037]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#5D4037]">
                            You are on Pro Plan!
                        </h3>
                        <p className="text-sm text-[#5D4037]/80">
                            Enjoy unlimited AI features – Flashcards, Grammar, and Roleplay
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="shrink-0 text-[#5D4037] hover:bg-white/20 hover:text-[#5D4037]"
                    aria-label="Dismiss banner"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
