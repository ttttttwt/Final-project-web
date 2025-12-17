"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { translateText } from "@/services/translationService";
import { Button } from "@/components/ui/button";
import { Languages, Loader2, X, Volume2 } from "lucide-react";

interface TranslationPopoverProps {
    text: string;
    position: { x: number; y: number };
    onClose: () => void;
    className?: string;
}

/**
 * Translation popover component that displays translated text.
 * Appears near the selected text position.
 */
export function TranslationPopover({
    text,
    position,
    onClose,
    className,
}: TranslationPopoverProps) {
    const [translation, setTranslation] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        // Close on Escape key
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    // Translate text on mount
    useEffect(() => {
        let cancelled = false;

        const doTranslate = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await translateText(text, "vi", "en");
                if (!cancelled) {
                    setTranslation(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "Translation failed"
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        doTranslate();

        return () => {
            cancelled = true;
        };
    }, [text]);

    // Speak the original text
    const handleSpeak = useCallback(() => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            speechSynthesis.speak(utterance);
        }
    }, [text]);

    // Calculate popover position to stay within viewport
    const getPopoverStyle = () => {
        const padding = 10;
        const popoverWidth = 280;
        const popoverHeight = 120;

        let x = position.x;
        let y = position.y + 10; // Below the selection

        // Ensure popover stays within viewport
        if (typeof window !== "undefined") {
            if (x + popoverWidth > window.innerWidth - padding) {
                x = window.innerWidth - popoverWidth - padding;
            }
            if (x < padding) {
                x = padding;
            }
            if (y + popoverHeight > window.innerHeight - padding) {
                y = position.y - popoverHeight - 10; // Above the selection
            }
        }

        return {
            left: `${x}px`,
            top: `${y}px`,
        };
    };

    return (
        <div
            ref={popoverRef}
            className={cn(
                "fixed z-[9999] w-[280px] rounded-lg border border-border bg-card shadow-lg",
                "animate-in fade-in-0 zoom-in-95 duration-200",
                className
            )}
            style={getPopoverStyle()}
            role="dialog"
            aria-label="Translation"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Languages className="w-4 h-4 text-primary" />
                    <span>Translate to Vietnamese</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onClose}
                    aria-label="Close translation"
                >
                    <X className="w-3.5 h-3.5" />
                </Button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* Original text */}
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {text.length > 100 ? `${text.slice(0, 100)}...` : text}
                    </p>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={handleSpeak}
                        aria-label="Listen to pronunciation"
                    >
                        <Volume2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {/* Translation result */}
                <div className="p-2 bg-primary/5 rounded-md border-l-2 border-primary">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Translating...</span>
                        </div>
                    ) : error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : (
                        <p className="text-sm font-medium">{translation}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
