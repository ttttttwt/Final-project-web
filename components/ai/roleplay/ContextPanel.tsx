"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RolePlayContextDetailsDTO } from "@/types/ai";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Info,
    Target,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    FileText,
} from "lucide-react";

interface ContextPanelProps {
    contextDetails: RolePlayContextDetailsDTO;
    context?: string;
    className?: string;
}

/**
 * Panel displaying scenario context and background information.
 * Helps users understand the situation before starting the conversation.
 */
export function ContextPanel({
    contextDetails,
    context,
    className,
}: ContextPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasContent =
        contextDetails?.setting ||
        contextDetails?.situation ||
        contextDetails?.keyInfo?.length ||
        contextDetails?.yourGoal ||
        contextDetails?.tips?.length ||
        context;

    if (!hasContent) {
        return null;
    }

    return (
        <div
            className={cn(
                "border-b border-border bg-gradient-to-r from-primary/5 to-transparent",
                className
            )}
        >
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                aria-expanded={isExpanded}
                aria-controls="context-panel-content"
            >
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Scenario Background</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div
                    id="context-panel-content"
                    className="px-4 pb-4 space-y-3 text-sm"
                >
                    {/* Brief Context */}
                    {context && (
                        <p className="text-muted-foreground italic">{context}</p>
                    )}

                    {/* Setting */}
                    {contextDetails?.setting && (
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium text-foreground">Setting: </span>
                                <span className="text-muted-foreground">
                                    {contextDetails.setting}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Situation */}
                    {contextDetails?.situation && (
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium text-foreground">Situation: </span>
                                <span className="text-muted-foreground">
                                    {contextDetails.situation}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Key Info */}
                    {contextDetails?.keyInfo && contextDetails.keyInfo.length > 0 && (
                        <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium text-foreground block mb-1">
                                    Key Information:
                                </span>
                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                    {contextDetails.keyInfo.map((info, index) => (
                                        <li key={index}>{info}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Your Goal */}
                    {contextDetails?.yourGoal && (
                        <div className="flex items-start gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                            <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    Your Goal:{" "}
                                </span>
                                <span className="text-foreground">
                                    {contextDetails.yourGoal}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    {contextDetails?.tips && contextDetails.tips.length > 0 && (
                        <div className="flex items-start gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium text-yellow-600 dark:text-yellow-400 block mb-1">
                                    Tips:
                                </span>
                                <ul className="list-disc list-inside space-y-0.5 text-foreground">
                                    {contextDetails.tips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
