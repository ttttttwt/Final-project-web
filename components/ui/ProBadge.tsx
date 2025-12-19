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
 * - Enhanced shimmer animation
 * - Optional glow pulse effect
 * - Hover glow enhancement
 * 
 * @example
 * ```tsx
 * <ProBadge size="sm" />
 * <ProBadge size="md" showLabel />
 * <ProBadge size="lg" pulse />
 * ```
 */

interface ProBadgeProps {
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Show "PRO" label text */
    showLabel?: boolean;
    /** Enable pulse glow animation */
    pulse?: boolean;
    /** Additional className */
    className?: string;
}

export function ProBadge({
    size = "md",
    showLabel = true,
    pulse = false,
    className
}: ProBadgeProps) {
    const sizeClasses = {
        sm: "h-4 px-1.5 text-[10px] gap-0.5",
        md: "h-5 px-2 text-xs gap-1",
        lg: "h-6 px-2.5 text-sm gap-1.5",
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
                "cursor-default select-none",
                // Gold gradient background
                "bg-gradient-to-r from-[#FFB300] via-[#FFD54F] to-[#FFB300]",
                // Text color
                "text-[#5D4037]",
                // Enhanced shadow
                "shadow-sm hover:shadow-md",
                // Using new shimmer class
                "pro-shimmer-enhanced",
                // Pulse glow if enabled
                pulse && "pro-glow-pulse",
                // Hover glow
                "transition-all duration-300",
                "hover:ring-2 hover:ring-[#FFB300]/50 hover:ring-offset-1 hover:ring-offset-background",
                // Size classes
                sizeClasses[size],
                className
            )}
            aria-label="Pro member"
        >
            <Crown className={cn(iconSizes[size], "shrink-0 drop-shadow-sm")} />
            {showLabel && <span className="drop-shadow-sm">PRO</span>}
        </span>
    );
}
