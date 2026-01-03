"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2, Check } from "lucide-react";
import { translateText } from "@/services/translationService";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { FlashcardCardDTO } from "@/types/ai";

export interface CardTranslation {
    front?: string;
    definition?: string;
    exampleSentence?: string;
    notes?: string[];
}

interface CardTranslateButtonProps {
    card: FlashcardCardDTO;
    className?: string;
    cachedTranslation?: CardTranslation;
    onTranslation?: (translation: CardTranslation) => void;
}

/**
 * Translate button for entire flashcard content
 * Positioned at top-right corner of card
 * Translates front, definition, example, and notes
 */
export function CardTranslateButton({
    card,
    className,
    cachedTranslation,
    onTranslation,
}: CardTranslateButtonProps) {
    const { locale, t } = useTranslation();
    const [translations, setTranslations] = useState<CardTranslation | null>(cachedTranslation || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync with cached translation when card changes or parent provides cached value
    useEffect(() => {
        if (cachedTranslation) {
            setTranslations(cachedTranslation);
        }
    }, [cachedTranslation]);

    const target = locale === "en" ? "vi" : locale;

    const handleTranslate = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card expansion toggle
        if (translations || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const results: CardTranslation = {};

            // Translate front word
            if (card.front) {
                results.front = await translateText(card.front, target, "en");
            }

            // Translate definition
            if (card.back.definition) {
                results.definition = await translateText(card.back.definition, target, "en");
            }

            // Translate example sentence
            if (card.back.exampleSentence) {
                results.exampleSentence = await translateText(card.back.exampleSentence, target, "en");
            }

            // Translate notes
            if (card.back.notes && card.back.notes.length > 0) {
                results.notes = await Promise.all(
                    card.back.notes.map(note => translateText(note, target, "en"))
                );
            }

            setTranslations(results);
            onTranslation?.(results);
        } catch (err) {
            setError(t("ai.flashcards.translationFailed") || "Translation failed");
        } finally {
            setIsLoading(false);
        }
    };

    const isTranslated = translations !== null;

    return (
        <Button
            variant={isTranslated ? "secondary" : "outline"}
            size="sm"
            onClick={handleTranslate}
            disabled={isLoading}
            className={cn(
                "h-8 px-3 gap-1.5 font-medium transition-all",
                isTranslated && "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/30",
                error && "border-destructive/50 text-destructive",
                className
            )}
            title={t("ai.flashcards.translateToVietnamese") || "Translate to Vietnamese"}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">{t("ai.flashcards.translating") || "Translating..."}</span>
                </>
            ) : isTranslated ? (
                <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("ai.flashcards.translated") || "Translated"}</span>
                </>
            ) : (
                <>
                    <Languages className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("ai.flashcards.translate") || "Translate"}</span>
                </>
            )}
        </Button>
    );
}

/**
 * Component to display translated content inline
 */
export function TranslatedContent({
    original,
    translated,
    className,
}: {
    original: string;
    translated?: string;
    className?: string;
}) {
    if (!translated) return null;

    return (
        <div className={cn("mt-1 text-sm text-primary/80 italic flex items-start gap-1", className)}>
            <span className="text-primary/60">🌐</span>
            <span>{translated}</span>
        </div>
    );
}
