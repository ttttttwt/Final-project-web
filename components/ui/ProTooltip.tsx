"use client";

import * as React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

/**
 * ProTooltip Component
 * 
 * A tooltip wrapper that shows Pro membership status on hover.
 * Used to wrap elements like avatars to indicate Pro status.
 * 
 * @example
 * ```tsx
 * <ProTooltip>
 *   <Avatar />
 * </ProTooltip>
 * ```
 */

interface ProTooltipProps {
    /** Content to wrap with tooltip */
    children: React.ReactNode;
    /** Custom tooltip message */
    message?: string;
    /** Additional className for tooltip content */
    className?: string;
}

export function ProTooltip({
    children,
    message = "Pro Member – Unlimited AI access",
    className,
}: ProTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    className={cn(
                        // Gold accent styling
                        "bg-gradient-to-r from-[#5D4037] to-[#4E342E]",
                        "text-[#FFD54F] font-medium",
                        "border border-[#FFB300]/30",
                        "shadow-lg",
                        className
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Crown className="h-3.5 w-3.5" />
                        <span>{message}</span>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
