"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lightbulb, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface SuggestedPromptsProps {
    prompts: string[];
    onSelect: (prompt: string) => void;
    isLeader?: boolean;
    className?: string;
}

/**
 * Panel showing suggested prompts/phrases for the user.
 * Helps users know what to say next, especially when leading conversations.
 */
export function SuggestedPrompts({
    prompts,
    onSelect,
    isLeader = false,
    className,
}: SuggestedPromptsProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!prompts || prompts.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                "border-t border-border bg-muted/30 transition-all duration-200",
                className
            )}
        >
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                aria-expanded={isExpanded}
                aria-controls="suggested-prompts-list"
            >
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span>
                        {isLeader ? "Suggested ways to lead" : "Things you can say"}
                    </span>
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                ) : (
                    <ChevronDown className="w-4 h-4" />
                )}
            </button>

            {/* Prompts List */}
            {isExpanded && (
                <div
                    id="suggested-prompts-list"
                    className="px-4 pb-3 flex flex-wrap gap-2"
                    role="list"
                    aria-label="Suggested prompts"
                >
                    {prompts.slice(0, 5).map((prompt, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => onSelect(prompt)}
                            className="text-xs h-auto py-1.5 px-3 whitespace-normal text-left max-w-[280px] hover:bg-primary/10 hover:border-primary/50 transition-colors"
                            role="listitem"
                        >
                            <span className="line-clamp-2">{prompt}</span>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
