"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    RolePlayScenarioDTO,
    RolePlayVocabularyItemDTO,
    RolePlayContextDetailsDTO,
} from "@/types/ai";
import { translateText } from "@/services/translationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
    Languages,
    Loader2,
    X,
} from "lucide-react";

type TabType = "context" | "prompts" | "vocabulary";

// Context section keys for per-section translation
type ContextSectionKey = "overview" | "setting" | "situation" | "keyInfo" | "yourGoal" | "tips";

interface RolePlaySidebarProps {
    scenario: RolePlayScenarioDTO | null;
    vocabulary?: RolePlayVocabularyItemDTO[];
    suggestedPrompts?: string[];
    isLoadingPrompts?: boolean;
    onSelectPrompt?: (prompt: string) => void;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
}

/**
 * Unified sidebar with 3 tabs: Context, Suggested Prompts, Vocabulary.
 * Includes per-section translation support to maintain structure.
 */
export function RolePlaySidebar({
    scenario,
    vocabulary = [],
    suggestedPrompts: dynamicPrompts,
    isLoadingPrompts = false,
    onSelectPrompt,
    isOpen = true,
    onToggle,
    className,
}: RolePlaySidebarProps) {
    const [activeTab, setActiveTab] = useState<TabType>("context");

    // Per-section context translations (preserves structure)
    const [contextTranslations, setContextTranslations] = useState<Record<ContextSectionKey, string | null>>({
        overview: null,
        setting: null,
        situation: null,
        keyInfo: null,
        yourGoal: null,
        tips: null,
    });
    const [translatingSection, setTranslatingSection] = useState<ContextSectionKey | null>(null);
    const [showAllTranslations, setShowAllTranslations] = useState(false);
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);

    const [promptTranslations, setPromptTranslations] = useState<Record<number, string>>({});
    const [translatingPromptIndex, setTranslatingPromptIndex] = useState<number | null>(null);

    const [vocabTranslations, setVocabTranslations] = useState<Record<number, string>>({});
    const [translatingVocabIndex, setTranslatingVocabIndex] = useState<number | null>(null);

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: "context", label: "Context", icon: <FileText className="w-4 h-4" /> },
        { id: "prompts", label: "Prompts", icon: <Lightbulb className="w-4 h-4" /> },
        { id: "vocabulary", label: "Vocab", icon: <BookOpen className="w-4 h-4" /> },
    ];

    // Use dynamic prompts if provided, otherwise fall back to scenario prompts
    const suggestedPrompts = dynamicPrompts?.length ? dynamicPrompts : scenario?.suggestedPrompts || [];
    const vocabItems = vocabulary.length > 0 ? vocabulary : scenario?.keyVocabulary || [];
    const contextDetails = scenario?.contextDetails;

    // Translate a single context section
    const translateSection = useCallback(async (section: ContextSectionKey, text: string) => {
        if (contextTranslations[section]) {
            // Toggle off if already translated
            setContextTranslations(prev => ({ ...prev, [section]: null }));
            return;
        }

        setTranslatingSection(section);
        try {
            const result = await translateText(text, "vi", "en");
            setContextTranslations(prev => ({ ...prev, [section]: result }));
        } catch (err) {
            setContextTranslations(prev => ({ ...prev, [section]: "Lỗi dịch" }));
        } finally {
            setTranslatingSection(null);
        }
    }, [contextTranslations]);

    // Translate ALL context sections at once
    const handleTranslateAllContext = useCallback(async () => {
        if (showAllTranslations) {
            setShowAllTranslations(false);
            setContextTranslations({
                overview: null, setting: null, situation: null,
                keyInfo: null, yourGoal: null, tips: null,
            });
            return;
        }

        setIsTranslatingAll(true);
        const translations: Partial<Record<ContextSectionKey, string>> = {};

        try {
            // Translate each section separately to maintain structure
            if (scenario?.context) {
                translations.overview = await translateText(scenario.context, "vi", "en");
            }
            if (contextDetails?.setting) {
                translations.setting = await translateText(contextDetails.setting, "vi", "en");
            }
            if (contextDetails?.situation) {
                translations.situation = await translateText(contextDetails.situation, "vi", "en");
            }
            if (contextDetails?.keyInfo && contextDetails.keyInfo.length > 0) {
                const keyInfoText = contextDetails.keyInfo.join("\n• ");
                translations.keyInfo = await translateText("• " + keyInfoText, "vi", "en");
            }
            if (contextDetails?.yourGoal) {
                translations.yourGoal = await translateText(contextDetails.yourGoal, "vi", "en");
            }
            if (contextDetails?.tips && contextDetails.tips.length > 0) {
                const tipsText = contextDetails.tips.join("\n• ");
                translations.tips = await translateText("• " + tipsText, "vi", "en");
            }

            setContextTranslations(prev => ({
                ...prev,
                ...translations,
            }));
            setShowAllTranslations(true);
        } catch (err) {
            console.error("Translation error:", err);
        } finally {
            setIsTranslatingAll(false);
        }
    }, [scenario?.context, contextDetails, showAllTranslations]);

    // Translate prompt handler
    const handleTranslatePrompt = useCallback(async (index: number, text: string) => {
        if (promptTranslations[index]) {
            setPromptTranslations(prev => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
            });
            return;
        }

        setTranslatingPromptIndex(index);
        try {
            const result = await translateText(text, "vi", "en");
            setPromptTranslations(prev => ({ ...prev, [index]: result }));
        } catch (err) {
            setPromptTranslations(prev => ({ ...prev, [index]: "Lỗi dịch" }));
        } finally {
            setTranslatingPromptIndex(null);
        }
    }, [promptTranslations]);

    // Translate vocabulary handler
    const handleTranslateVocab = useCallback(async (index: number, term: string, definition: string) => {
        if (vocabTranslations[index]) {
            setVocabTranslations(prev => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
            });
            return;
        }

        setTranslatingVocabIndex(index);
        try {
            const result = await translateText(`${term}: ${definition}`, "vi", "en");
            setVocabTranslations(prev => ({ ...prev, [index]: result }));
        } catch (err) {
            setVocabTranslations(prev => ({ ...prev, [index]: "Lỗi dịch" }));
        } finally {
            setTranslatingVocabIndex(null);
        }
    }, [vocabTranslations]);

    // Pronounce text
    const handlePronounce = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            speechSynthesis.speak(utterance);
        }
    };

    // Helper component for inline translation display
    const TranslationBox = ({ text, className: boxClassName }: { text: string | null; className?: string }) => {
        if (!text) return null;
        return (
            <div className={cn("mt-1 py-1.5 px-2 bg-primary/5 border-l-2 border-primary rounded-r text-xs", boxClassName)}>
                <span className="text-primary font-medium">🇻🇳</span>{" "}
                <span className="text-foreground/80">{text}</span>
            </div>
        );
    };

    // Helper component for section translate button
    const SectionTranslateBtn = ({
        section,
        text,
        size = "sm"
    }: {
        section: ContextSectionKey;
        text: string;
        size?: "sm" | "xs";
    }) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => translateSection(section, text)}
                        disabled={translatingSection === section}
                        className={cn(
                            "p-1 rounded transition-colors",
                            "hover:bg-primary/10 text-muted-foreground hover:text-primary",
                            contextTranslations[section] && "text-primary bg-primary/5"
                        )}
                    >
                        {translatingSection === section ? (
                            <Loader2 className={size === "xs" ? "w-3 h-3 animate-spin" : "w-3.5 h-3.5 animate-spin"} />
                        ) : (
                            <Languages className={size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5"} />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{contextTranslations[section] ? "Ẩn dịch" : "Dịch"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    if (!isOpen) {
        return (
            <div
                className={cn(
                    "flex-shrink-0 w-14 h-full border-l border-border",
                    "bg-gradient-to-b from-card to-muted/30",
                    "flex flex-col items-center justify-start py-4 gap-3",
                    className
                )}
            >
                {/* Main expand button - more prominent */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={onToggle}
                                className={cn(
                                    "w-11 h-11 rounded-xl",
                                    "bg-primary/10 hover:bg-primary/20 border border-primary/30",
                                    "flex items-center justify-center",
                                    "text-primary hover:text-primary transition-all",
                                    "shadow-sm hover:shadow-md hover:scale-105"
                                )}
                                aria-label="Open sidebar"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Open Tools Panel</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Separator */}
                <div className="w-8 h-px bg-border" />

                {/* Tab icons with tooltips */}
                <div className="flex flex-col gap-2">
                    {tabs.map((tab) => (
                        <TooltipProvider key={tab.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            onToggle?.();
                                        }}
                                        className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                                            "hover:bg-muted border border-transparent hover:border-border",
                                            activeTab === tab.id
                                                ? "text-primary bg-primary/5 border-primary/20"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {tab.icon}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{tab.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>

                {/* Tools label */}
                <div className="mt-auto">
                    <span
                        className="text-xs text-muted-foreground font-medium"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                        Tools
                    </span>
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
                {/* Context Tab - With per-section translation */}
                {activeTab === "context" && (
                    <div className="p-4 space-y-4">
                        {/* Translate All Button */}
                        {(scenario?.context || contextDetails) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTranslateAllContext}
                                disabled={isTranslatingAll}
                                className="w-full gap-2"
                            >
                                {isTranslatingAll ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Languages className="w-4 h-4" />
                                )}
                                {showAllTranslations ? "Ẩn tất cả bản dịch" : "Dịch toàn bộ Context"}
                            </Button>
                        )}

                        {/* Overview/Context */}
                        {scenario?.context && (
                            <div className="space-y-1">
                                <div className="flex items-start gap-2">
                                    <p className="text-sm text-muted-foreground italic flex-1">{scenario.context}</p>
                                    {!showAllTranslations && (
                                        <SectionTranslateBtn section="overview" text={scenario.context} />
                                    )}
                                </div>
                                {(showAllTranslations || contextTranslations.overview) && (
                                    <TranslationBox text={contextTranslations.overview} />
                                )}
                            </div>
                        )}

                        {/* Setting */}
                        {contextDetails?.setting && (
                            <div className="space-y-1">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm flex-1">
                                        <span className="font-medium">Setting: </span>
                                        <span className="text-muted-foreground">{contextDetails.setting}</span>
                                    </div>
                                    {!showAllTranslations && (
                                        <SectionTranslateBtn section="setting" text={contextDetails.setting} />
                                    )}
                                </div>
                                {(showAllTranslations || contextTranslations.setting) && (
                                    <TranslationBox text={contextTranslations.setting} className="ml-6" />
                                )}
                            </div>
                        )}

                        {/* Situation */}
                        {contextDetails?.situation && (
                            <div className="space-y-1">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm flex-1">
                                        <span className="font-medium">Situation: </span>
                                        <span className="text-muted-foreground">{contextDetails.situation}</span>
                                    </div>
                                    {!showAllTranslations && (
                                        <SectionTranslateBtn section="situation" text={contextDetails.situation} />
                                    )}
                                </div>
                                {(showAllTranslations || contextTranslations.situation) && (
                                    <TranslationBox text={contextTranslations.situation} className="ml-6" />
                                )}
                            </div>
                        )}

                        {/* Key Information */}
                        {contextDetails?.keyInfo && contextDetails.keyInfo.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                    <h4 className="text-sm font-medium flex-1">Key Information</h4>
                                    {!showAllTranslations && (
                                        <SectionTranslateBtn
                                            section="keyInfo"
                                            text={contextDetails.keyInfo.join(". ")}
                                        />
                                    )}
                                </div>
                                <ul className="list-disc list-inside text-sm text-muted-foreground ml-6 space-y-0.5">
                                    {contextDetails.keyInfo.map((info, i) => (
                                        <li key={i}>{info}</li>
                                    ))}
                                </ul>
                                {(showAllTranslations || contextTranslations.keyInfo) && (
                                    <TranslationBox text={contextTranslations.keyInfo} className="ml-6" />
                                )}
                            </div>
                        )}

                        {/* Your Goal */}
                        {contextDetails?.yourGoal && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 space-y-1">
                                <div className="flex items-start gap-2">
                                    <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm flex-1">
                                        <span className="font-medium text-green-600 dark:text-green-400">Your Goal: </span>
                                        <span>{contextDetails.yourGoal}</span>
                                    </div>
                                    {!showAllTranslations && (
                                        <SectionTranslateBtn section="yourGoal" text={contextDetails.yourGoal} />
                                    )}
                                </div>
                                {(showAllTranslations || contextTranslations.yourGoal) && (
                                    <TranslationBox text={contextTranslations.yourGoal} />
                                )}
                            </div>
                        )}

                        {/* Tips */}
                        {contextDetails?.tips && contextDetails.tips.length > 0 && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                                    <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 flex-1">
                                        Tips
                                    </h4>
                                    {!showAllTranslations && (
                                        <SectionTranslateBtn
                                            section="tips"
                                            text={contextDetails.tips.join(". ")}
                                        />
                                    )}
                                </div>
                                <ul className="list-disc list-inside text-sm space-y-0.5 ml-2">
                                    {contextDetails.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                                {(showAllTranslations || contextTranslations.tips) && (
                                    <TranslationBox text={contextTranslations.tips} />
                                )}
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
                        {/* Loading state */}
                        {isLoadingPrompts ? (
                            <div className="space-y-3 py-4">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <p className="text-sm">Generating suggestions...</p>
                                </div>
                                {/* Skeleton prompts */}
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : suggestedPrompts.length > 0 ? (
                            <>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Click to use a suggestion, or translate:
                                </p>
                                {suggestedPrompts.map((prompt, index) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onSelectPrompt?.(prompt)}
                                                className="flex-1 text-left justify-start h-auto py-2 px-3 text-sm whitespace-normal hover:bg-primary/10 hover:border-primary/50"
                                            >
                                                {prompt}
                                            </Button>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-auto w-8 flex-shrink-0"
                                                            onClick={() => handleTranslatePrompt(index, prompt)}
                                                            disabled={translatingPromptIndex === index}
                                                        >
                                                            {translatingPromptIndex === index ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Languages className={cn(
                                                                    "w-3.5 h-3.5",
                                                                    promptTranslations[index] && "text-primary"
                                                                )} />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{promptTranslations[index] ? "Ẩn dịch" : "Dịch"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        {promptTranslations[index] && (
                                            <TranslationBox text={promptTranslations[index]} className="ml-2" />
                                        )}
                                    </div>
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
                                        <div className="flex items-center gap-1">
                                            {item.ipa && (
                                                <Badge variant="secondary" className="text-xs font-mono">
                                                    {item.ipa}
                                                </Badge>
                                            )}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => handleTranslateVocab(index, item.term, item.definition)}
                                                            disabled={translatingVocabIndex === index}
                                                        >
                                                            {translatingVocabIndex === index ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Languages className={cn(
                                                                    "w-3.5 h-3.5",
                                                                    vocabTranslations[index] && "text-primary"
                                                                )} />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{vocabTranslations[index] ? "Ẩn" : "Dịch"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => handlePronounce(item.term)}
                                                        >
                                                            <Volume2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Phát âm</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    {/* Vocabulary Translation */}
                                    {vocabTranslations[index] && (
                                        <TranslationBox text={vocabTranslations[index]} className="mb-2" />
                                    )}

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
