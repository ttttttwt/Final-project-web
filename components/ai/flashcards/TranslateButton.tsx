"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { translateText } from "@/services/translationService";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface TranslateButtonProps {
    text: string;
    className?: string;
    targetLang?: string;
    size?: "sm" | "default" | "lg" | "icon";
}

/**
 * Reusable translate button component
 * Translates text to target language using MyMemory API
 */
export function TranslateButton({
    text,
    className,
    targetLang,
    size = "sm",
}: TranslateButtonProps) {
    const { locale, t } = useTranslation();
    const [translation, setTranslation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use user's locale or provided targetLang (default Vietnamese)
    const target = targetLang || (locale === "en" ? "vi" : locale);

    const handleTranslate = async () => {
        if (translation || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await translateText(text, target, "en");
            setTranslation(result);
        } catch (err) {
            setError(t("ai.flashcards.translationFailed") || "Translation failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (translation) {
        return (
            <div className={cn("text-sm text-muted-foreground italic mt-1", className)}>
                <span className="text-xs text-muted-foreground/60 mr-1">🌐</span>
                {translation}
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            size={size}
            onClick={handleTranslate}
            disabled={isLoading}
            className={cn(
                "h-6 px-2 text-xs text-muted-foreground hover:text-foreground",
                className
            )}
            title={t("ai.flashcards.translateToVietnamese") || "Translate"}
        >
            {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <>
                    <Languages className="w-3 h-3 mr-1" />
                    {t("ai.flashcards.translate") || "Translate"}
                </>
            )}
            {error && <span className="text-destructive ml-1">{error}</span>}
        </Button>
    );
}
