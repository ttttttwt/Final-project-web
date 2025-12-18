"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

/**
 * ProBadge Component
 * 
 * A premium badge indicator for Pro users with gold styling.
 * Features:
 * - Gold/amber color scheme
 * - Crown icon
 * - Multiple sizes (sm, md, lg)
 * - Subtle shimmer animation
 * 
 * @example
 * ```tsx
 * <ProBadge size="sm" />
 * <ProBadge size="md" showLabel />
 * ```
 */

interface ProBadgeProps {
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Show "PRO" label text */
    showLabel?: boolean;
    /** Additional className */
    className?: string;
}

export function ProBadge({ size = "md", showLabel = true, className }: ProBadgeProps) {
    const sizeClasses = {
        sm: "h-4 px-1 text-[10px] gap-0.5",
        md: "h-5 px-1.5 text-xs gap-1",
        lg: "h-6 px-2 text-sm gap-1.5",
    };

    const iconSizes = {
        sm: "h-2.5 w-2.5",
        md: "h-3 w-3",
        lg: "h-3.5 w-3.5",
    };

    return (
        <span
            className={cn(
                // Base styles
                "inline-flex items-center justify-center font-bold rounded-full",
                // Gold gradient background
                "bg-gradient-to-r from-[#FFB300] via-[#FFD54F] to-[#FFB300]",
                // Text color
                "text-[#5D4037]",
                // Subtle shadow for depth
                "shadow-sm",
                // Shimmer animation
                "relative overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
                "before:translate-x-[-100%] before:animate-[shimmer_2s_infinite]",
                // Size classes
                sizeClasses[size],
                className
            )}
            aria-label="Pro member"
        >
            <Crown className={cn(iconSizes[size], "shrink-0")} />
            {showLabel && <span>PRO</span>}
        </span>
    );
}
