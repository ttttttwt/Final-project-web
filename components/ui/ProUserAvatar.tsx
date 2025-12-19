"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProBadge } from "@/components/ui/ProBadge";
import { cn } from "@/lib/utils";

/**
 * ProUserAvatar Component
 * 
 * A premium avatar component for Pro users with animated gold ring effect.
 * Features:
 * - Animated gradient ring around avatar
 * - Pulse glow effect on hover
 * - Crown badge position customization
 * - Multiple sizes
 * 
 * @example
 * ```tsx
 * <ProUserAvatar 
 *   src="/avatar.jpg" 
 *   fallback="JD" 
 *   size="md"
 * />
 * ```
 */

interface ProUserAvatarProps {
    /** Avatar image source URL */
    src?: string;
    /** Fallback text when image fails to load */
    fallback: string;
    /** Alt text for the avatar image */
    alt?: string;
    /** Size variant */
    size?: "sm" | "md" | "lg" | "xl";
    /** Show the Pro badge */
    showBadge?: boolean;
    /** Enable pulse glow animation */
    pulse?: boolean;
    /** Additional className for the wrapper */
    className?: string;
    /** Image loading error handler */
    onImageError?: () => void;
}

const SIZE_CLASSES = {
    sm: {
        wrapper: "h-8 w-8",
        avatar: "h-8 w-8",
        ring: "ring-[2px]",
        badge: "-top-0.5 -right-0.5",
        badgeSize: "sm" as const,
    },
    md: {
        wrapper: "h-10 w-10",
        avatar: "h-10 w-10",
        ring: "ring-2",
        badge: "-top-1 -right-1",
        badgeSize: "sm" as const,
    },
    lg: {
        wrapper: "h-14 w-14",
        avatar: "h-14 w-14",
        ring: "ring-[3px]",
        badge: "-top-1 -right-1",
        badgeSize: "md" as const,
    },
    xl: {
        wrapper: "h-20 w-20",
        avatar: "h-20 w-20",
        ring: "ring-[3px]",
        badge: "-top-1 -right-0",
        badgeSize: "md" as const,
    },
};

export function ProUserAvatar({
    src,
    fallback,
    alt = "User avatar",
    size = "md",
    showBadge = true,
    pulse = false,
    className,
    onImageError,
}: ProUserAvatarProps) {
    const sizeConfig = SIZE_CLASSES[size];

    return (
        <div
            className={cn(
                "relative inline-block",
                sizeConfig.wrapper,
                className
            )}
        >
            {/* Animated ring container */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full",
                    "bg-gradient-to-r from-[#FFB300] via-[#FFD54F] to-[#FFA000]",
                    "animate-[pro-gradient-rotate_4s_ease_infinite]",
                    "bg-[length:200%_200%]",
                    pulse && "pro-glow-pulse",
                )}
                style={{ padding: '3px' }}
            >
                <div className="w-full h-full rounded-full bg-background" />
            </div>

            {/* Avatar */}
            <Avatar
                className={cn(
                    sizeConfig.avatar,
                    "relative z-10",
                    "ring-2 ring-background ring-offset-0",
                    "transition-transform duration-200 hover:scale-105",
                )}
            >
                <AvatarImage
                    src={src}
                    alt={alt}
                    onLoadingStatusChange={(status) => {
                        if (status === 'error' && onImageError) {
                            onImageError();
                        }
                    }}
                />
                <AvatarFallback
                    className="bg-gradient-to-br from-[#FFB300] to-[#FFA000] text-[#5D4037] font-semibold"
                >
                    {fallback}
                </AvatarFallback>
            </Avatar>

            {/* Pro Badge */}
            {showBadge && (
                <div className={cn("absolute z-20", sizeConfig.badge)}>
                    <ProBadge
                        size={sizeConfig.badgeSize}
                        showLabel={false}
                    />
                </div>
            )}
        </div>
    );
}
