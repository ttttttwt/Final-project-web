"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    RolePlayScenarioDTO,
    RolePlayVocabularyItemDTO,
    RolePlayContextDetailsDTO,
} from "@/types/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Lightbulb,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Info,
    Target,
    Volume2,
} from "lucide-react";

type TabType = "context" | "prompts" | "vocabulary";

interface RolePlaySidebarProps {
    scenario: RolePlayScenarioDTO | null;
    vocabulary?: RolePlayVocabularyItemDTO[];
    onSelectPrompt?: (prompt: string) => void;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
}

/**
 * Unified sidebar with 3 tabs: Context, Suggested Prompts, Vocabulary.
 * Collapsible to save space during focused conversation.
 */
export function RolePlaySidebar({
    scenario,
    vocabulary = [],
    onSelectPrompt,
    isOpen = true,
    onToggle,
    className,
}: RolePlaySidebarProps) {
    const [activeTab, setActiveTab] = useState<TabType>("context");

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: "context", label: "Context", icon: <FileText className="w-4 h-4" /> },
        { id: "prompts", label: "Prompts", icon: <Lightbulb className="w-4 h-4" /> },
        { id: "vocabulary", label: "Vocab", icon: <BookOpen className="w-4 h-4" /> },
    ];

    // Use scenario vocabulary if no specific vocabulary provided
    const vocabItems = vocabulary.length > 0 ? vocabulary : scenario?.keyVocabulary || [];
    const contextDetails = scenario?.contextDetails;
    const suggestedPrompts = scenario?.suggestedPrompts || [];

    if (!isOpen) {
        return (
            <div
                className={cn(
                    "flex-shrink-0 w-12 border-l border-border",
                    "bg-gradient-to-b from-card to-muted/30",
                    "flex flex-col items-center justify-start pt-4 gap-4",
                    className
                )}
            >
                {/* Expand button */}
                <button
                    onClick={onToggle}
                    className={cn(
                        "w-10 h-10 rounded-lg",
                        "bg-primary/10 hover:bg-primary/20 border border-primary/30",
                        "flex items-center justify-center",
                        "text-primary hover:text-primary transition-all",
                        "shadow-sm hover:shadow-md"
                    )}
                    aria-label="Open sidebar"
                    title="Open sidebar"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Tab icons when collapsed */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        title="Context"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        title="Prompts"
                    >
                        <Lightbulb className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        title="Vocabulary"
                    >
                        <BookOpen className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <aside
            className={cn(
                "flex-shrink-0 w-80 border-l border-border bg-card/50",
                "flex flex-col h-full",
                className
            )}
        >
            {/* Header with tabs */}
            <div className="flex items-center border-b border-border">
                {/* Tabs */}
                <div className="flex-1 flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors",
                                activeTab === tab.id
                                    ? "text-primary border-b-2 border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            aria-selected={activeTab === tab.id}
                            role="tab"
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Collapse button */}
                <button
                    onClick={onToggle}
                    className="p-3 text-muted-foreground hover:text-foreground border-l border-border hover:bg-muted/50 transition-colors"
                    aria-label="Close sidebar"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Context Tab */}
                {activeTab === "context" && (
                    <div className="p-4 space-y-4">
                        {scenario?.context && (
                            <p className="text-sm text-muted-foreground italic">{scenario.context}</p>
                        )}

                        {contextDetails?.setting && (
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <span className="font-medium">Setting: </span>
                                    <span className="text-muted-foreground">{contextDetails.setting}</span>
                                </div>
                            </div>
                        )}

                        {contextDetails?.situation && (
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <span className="font-medium">Situation: </span>
                                    <span className="text-muted-foreground">{contextDetails.situation}</span>
                                </div>
                            </div>
                        )}

                        {contextDetails?.keyInfo && contextDetails.keyInfo.length > 0 && (
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                    Key Information
                                </h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground ml-6 space-y-0.5">
                                    {contextDetails.keyInfo.map((info, i) => (
                                        <li key={i}>{info}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {contextDetails?.yourGoal && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-start gap-2">
                                    <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <span className="font-medium text-green-600 dark:text-green-400">Your Goal: </span>
                                        <span>{contextDetails.yourGoal}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {contextDetails?.tips && contextDetails.tips.length > 0 && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Tips
                                </h4>
                                <ul className="list-disc list-inside text-sm space-y-0.5 ml-2">
                                    {contextDetails.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!scenario?.context && !contextDetails && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No context available for this scenario.
                            </p>
                        )}
                    </div>
                )}

                {/* Prompts Tab */}
                {activeTab === "prompts" && (
                    <div className="p-4 space-y-2">
                        {suggestedPrompts.length > 0 ? (
                            <>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Click to use a suggestion:
                                </p>
                                {suggestedPrompts.map((prompt, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onSelectPrompt?.(prompt)}
                                        className="w-full text-left justify-start h-auto py-2 px-3 text-sm whitespace-normal hover:bg-primary/10 hover:border-primary/50"
                                    >
                                        {prompt}
                                    </Button>
                                ))}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No suggested prompts available.
                            </p>
                        )}
                    </div>
                )}

                {/* Vocabulary Tab */}
                {activeTab === "vocabulary" && (
                    <div className="p-4 space-y-3">
                        {vocabItems.length > 0 ? (
                            vocabItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">{item.term}</span>
                                        {item.ipa && (
                                            <Badge variant="secondary" className="text-xs font-mono">
                                                {item.ipa}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.definition}</p>
                                    {item.example && (
                                        <p className="text-xs text-muted-foreground italic mt-1">
                                            e.g., "{item.example}"
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No vocabulary items available.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
