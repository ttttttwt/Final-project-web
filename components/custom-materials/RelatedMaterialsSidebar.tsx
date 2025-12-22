"use client";

import { MaterialListItem, CustomMaterial } from "@/types/custom-materials";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RelatedMaterialsSidebarProps {
    materials: MaterialListItem[];
    currentMaterial: CustomMaterial;
    isLoading?: boolean;
}

/**
 * Sidebar showing related materials from the same source
 * with "Pro Max" glassmorphism aesthetics
 */
export function RelatedMaterialsSidebar({
    materials,
    currentMaterial,
    isLoading = false,
}: RelatedMaterialsSidebarProps) {
    // Get icon based on dominant content type
    const getContentIcon = (material: MaterialListItem) => {
        if (material.vocabularyCount && material.vocabularyCount > 0) {
            return <BookOpen className="h-4 w-4" />;
        }
        if (material.quizCount && material.quizCount > 0) {
            return <HelpCircle className="h-4 w-4" />;
        }
        if (material.hasShadowing) {
            return <Mic className="h-4 w-4" />;
        }
        if (material.hasRolePlay) {
            return <MessageSquare className="h-4 w-4" />;
        }
        return <FileText className="h-4 w-4" />;
    };

    // Get short description of content types
    const getContentDescription = (material: MaterialListItem) => {
        const parts: string[] = [];
        if (material.vocabularyCount && material.vocabularyCount > 0) {
            parts.push(`${material.vocabularyCount} words`);
        }
        if (material.quizCount && material.quizCount > 0) {
            parts.push(`${material.quizCount} questions`);
        }
        if (material.hasShadowing) {
            parts.push("Shadowing");
        }
        if (material.hasRolePlay) {
            parts.push("Role-play");
        }
        return parts.join(" • ") || "Summary";
    };

    const isCurrentMaterial = (materialId: string) => {
        return materialId === currentMaterial.id;
    };

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

    // Always show "Original Source" as the first item
    const metadata = currentMaterial.inputMetadata as Record<string, unknown> | undefined;
    const sourceUrl = metadata?.sourceUrl && typeof metadata.sourceUrl === "string" ? metadata.sourceUrl : null;
    const hasOriginalSource = !!(currentMaterial.originalFileUrl || sourceUrl);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-[#4285F4] to-[#34A853] rounded-full" />
                <h3 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
                    Related Materials
                </h3>
            </div>

            {/* Original Source Card */}
            {hasOriginalSource && (
                <Card
                    className={cn(
                        "group relative overflow-hidden border transition-all duration-200",
                        "bg-white/80 dark:bg-[#1F1F1F]/80 backdrop-blur-sm",
                        "border-[#E0E0E0] dark:border-[#3C4043]",
                        "hover:border-[#4285F4] dark:hover:border-[#8AB4F8]",
                        "hover:shadow-lg hover:shadow-[#4285F4]/10",
                        "cursor-pointer"
                    )}
                >
                    <Link
                        href={currentMaterial.originalFileUrl || sourceUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#E8F5E9] dark:bg-[#1E3A2E] transition-transform duration-200 group-hover:scale-110">
                                <FileCode className="h-4 w-4 text-[#34A853]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-[#202124] dark:text-[#E8EAED] truncate">
                                        Original Source
                                    </h4>
                                    <ExternalLink className="h-3 w-3 text-[#5F6368] dark:text-[#9AA0A6] flex-shrink-0" />
                                </div>
                                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                                    {currentMaterial.sourceType}
                                </p>
                            </div>
                        </div>
                    </Link>
                </Card>
            )}

            {/* Related Materials List */}
            {materials.map((material, index) => {
                const isCurrent = isCurrentMaterial(material.id);

                return (
                    <Card
                        key={material.id}
                        className={cn(
                            "group relative overflow-hidden border transition-all duration-200",
                            isCurrent
                                ? "bg-gradient-to-br from-[#E8F5E9]/90 to-[#E3F2FD]/90 dark:from-[#1E3A2E]/90 dark:to-[#1E2A3A]/90 backdrop-blur-sm"
                                : "bg-white/80 dark:bg-[#1F1F1F]/80 backdrop-blur-sm",
                            isCurrent
                                ? "border-[#4285F4] dark:border-[#8AB4F8] shadow-md shadow-[#4285F4]/20"
                                : "border-[#E0E0E0] dark:border-[#3C4043]",
                            !isCurrent &&
                            "hover:border-[#4285F4] dark:hover:border-[#8AB4F8] hover:shadow-lg hover:shadow-[#4285F4]/10 hover:translate-x-1",
                            !isCurrent && "cursor-pointer"
                        )}
                        style={{
                            animationDelay: `${index * 50}ms`,
                        }}
                    >
                        <Link
                            href={`/custom-materials/${material.id}`}
                            className={cn(
                                "block p-4",
                                isCurrent && "cursor-default pointer-events-none"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "p-2 rounded-lg transition-all duration-200",
                                        isCurrent
                                            ? "bg-[#4285F4] dark:bg-[#8AB4F8]"
                                            : "bg-[#F1F3F4] dark:bg-[#2E2E2E] group-hover:bg-[#E8F5E9] dark:group-hover:bg-[#1E3A2E]",
                                        !isCurrent && "group-hover:scale-110"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            isCurrent
                                                ? "text-white"
                                                : "text-[#5F6368] dark:text-[#9AA0A6] group-hover:text-[#34A853]"
                                        )}
                                    >
                                        {getContentIcon(material)}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4
                                            className={cn(
                                                "text-sm font-medium truncate",
                                                isCurrent
                                                    ? "text-[#1565C0] dark:text-[#90CAF9]"
                                                    : "text-[#202124] dark:text-[#E8EAED]"
                                            )}
                                        >
                                            {material.title}
                                        </h4>
                                        {isCurrent && (
                                            <CheckCircle2 className="h-4 w-4 text-[#4285F4] dark:text-[#8AB4F8] flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                                        {getContentDescription(material)}
                                    </p>
                                    {isCurrent && (
                                        <Badge
                                            variant="secondary"
                                            className="mt-2 text-xs bg-[#4285F4]/10 text-[#1565C0] dark:bg-[#8AB4F8]/10 dark:text-[#90CAF9] border-0"
                                        >
                                            Active
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </Card>
                );
            })}

            {/* Empty state */}
            {materials.length === 0 && (
                <Card className="p-6 text-center bg-white/60 dark:bg-[#1F1F1F]/60 backdrop-blur-sm border-dashed border-[#E0E0E0] dark:border-[#3C4043]">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-[#9AA0A6]" />
                    <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                        No related materials yet
                    </p>
                    <p className="text-xs text-[#9AA0A6] mt-1">
                        Create more content from this source
                    </p>
                </Card>
            )}
        </div>
    );
}
