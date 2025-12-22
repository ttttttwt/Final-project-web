"use client";

import { CustomMaterial } from "@/types/custom-materials";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen,
    HelpCircle,
    FileText,
    Mic,
    MessageSquare,
    FileCode,
    ExternalLink,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentNavigationSidebarProps {
    currentMaterial: CustomMaterial;
    isLoading?: boolean;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

type ContentSection = {
    id: string;
    label: string;
    icon: React.ReactNode;
    available: boolean;
    description?: string;
};

/**
 * Sidebar showing different content types within the current material
 * with "Pro Max" glassmorphism aesthetics
 */
export function ContentNavigationSidebar({
    currentMaterial,
    isLoading = false,
    activeTab,
    onTabChange,
}: ContentNavigationSidebarProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    const content = currentMaterial.generatedContent;
    const hasVocabulary = content?.vocabulary && content.vocabulary.length > 0;
    const hasQuiz = content?.quiz && content.quiz.length > 0;
    const hasSummary = content?.summary;
    const hasRolePlay = content?.rolePlay;
    const hasShadowing = content?.shadowing && content.shadowing.length > 0;

    // Get source URL or text content
    const metadata = currentMaterial.inputMetadata as Record<string, unknown> | undefined;
    const sourceUrl = metadata?.sourceUrl && typeof metadata.sourceUrl === "string" ? metadata.sourceUrl : null;
    const contentText = currentMaterial.contentText; // Original text for TEXT type materials
    const hasOriginalSource = !!(currentMaterial.originalFileUrl || sourceUrl || contentText);

    // Debug logging
    console.log("DEBUG Original Source:", {
        sourceType: currentMaterial.sourceType,
        hasFileUrl: !!currentMaterial.originalFileUrl,
        hasSourceUrl: !!sourceUrl,
        hasContentText: !!contentText,
        contentTextLength: contentText?.length,
        hasOriginalSource,
    });

    // Build content sections - Original Source always shown first if available
    const contentSections: ContentSection[] = [
        ...(hasOriginalSource
            ? [{
                id: "source" as const,
                label: "Original Source",
                icon: <FileCode className="h-4 w-4" />,
                available: true,
                description: currentMaterial.sourceType,
            }]
            : []),
        {
            id: "vocabulary",
            label: "Vocabulary",
            icon: <BookOpen className="h-4 w-4" />,
            available: !!hasVocabulary,
            description: hasVocabulary ? `${content.vocabulary?.length} words` : undefined,
        },
        {
            id: "quiz",
            label: "Quiz",
            icon: <HelpCircle className="h-4 w-4" />,
            available: !!hasQuiz,
            description: hasQuiz ? `${content.quiz?.length} questions` : undefined,
        },
        {
            id: "summary",
            label: "Summary",
            icon: <FileText className="h-4 w-4" />,
            available: !!hasSummary,
        },
        {
            id: "roleplay",
            label: "Role-Play",
            icon: <MessageSquare className="h-4 w-4" />,
            available: !!hasRolePlay,
        },
        {
            id: "shadowing",
            label: "Shadowing",
            icon: <Mic className="h-4 w-4" />,
            available: !!hasShadowing,
            description: hasShadowing ? `${content.shadowing?.length} sentences` : undefined,
        },
    ].filter((section) => section.available);

    const handleSectionClick = (sectionId: string) => {
        if (sectionId === "source") {
            // For file/URL materials, open in new tab
            const url = currentMaterial.originalFileUrl || sourceUrl;
            if (url) {
                window.open(url, "_blank", "noopener,noreferrer");
            } else {
                // For TEXT materials, switch to a "source" view
                onTabChange("source");
            }
        } else {
            // Change active tab
            onTabChange(sectionId);
        }
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-[#4285F4] to-[#34A853] rounded-full" />
                <h3 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
                    Content
                </h3>
            </div>

            {/* Content Sections */}
            {contentSections.map((section, index) => {
                const isActive = section.id === activeTab || (section.id === "source" && activeTab === "source");
                const isSourceLink = section.id === "source";

                return (
                    <Card
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className={cn(
                            "group relative overflow-hidden border transition-all duration-200 cursor-pointer",
                            isActive
                                ? "bg-gradient-to-br from-[#E8F5E9]/90 to-[#E3F2FD]/90 dark:from-[#1E3A2E]/90 dark:to-[#1E2A3A]/90 backdrop-blur-sm"
                                : "bg-white/80 dark:bg-[#1F1F1F]/80 backdrop-blur-sm",
                            isActive
                                ? "border-[#4285F4] dark:border-[#8AB4F8] shadow-md shadow-[#4285F4]/20"
                                : "border-[#E0E0E0] dark:border-[#3C4043]",
                            !isActive && "hover:border-[#4285F4] dark:hover:border-[#8AB4F8] hover:shadow-lg hover:shadow-[#4285F4]/10 hover:translate-x-1"
                        )}
                        style={{
                            animationDelay: `${index * 50}ms`,
                        }}
                    >
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "p-2 rounded-lg transition-all duration-200",
                                        isActive
                                            ? "bg-[#4285F4] dark:bg-[#8AB4F8]"
                                            : isSourceLink
                                                ? "bg-[#E8F5E9] dark:bg-[#1E3A2E]"
                                                : "bg-[#F1F3F4] dark:bg-[#2E2E2E]",
                                        !isActive && "group-hover:scale-110"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            isActive
                                                ? "text-white"
                                                : isSourceLink
                                                    ? "text-[#34A853]"
                                                    : "text-[#5F6368] dark:text-[#9AA0A6]"
                                        )}
                                    >
                                        {section.icon}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4
                                            className={cn(
                                                "text-sm font-medium truncate",
                                                isActive
                                                    ? "text-[#1565C0] dark:text-[#90CAF9]"
                                                    : "text-[#202124] dark:text-[#E8EAED]"
                                            )}
                                        >
                                            {section.label}
                                        </h4>
                                        {isActive && (
                                            <CheckCircle2 className="h-4 w-4 text-[#4285F4] dark:text-[#8AB4F8] flex-shrink-0" />
                                        )}
                                        {isSourceLink && !isActive && (
                                            <ExternalLink className="h-3 w-3 text-[#5F6368] dark:text-[#9AA0A6] flex-shrink-0" />
                                        )}
                                    </div>
                                    {section.description && (
                                        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                                            {section.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
