"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FlashcardCardDTO } from "@/types/ai";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, Lightbulb, BookOpen } from "lucide-react";

interface FlashCardProps {
  card: FlashcardCardDTO;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
  showHint?: boolean;
}

/**
 * FlashCard component with 3D flip animation.
 * Shows front (term) and back (definition, examples, pronunciation).
 * Supports keyboard navigation and screen readers.
 * Memoized to prevent unnecessary re-renders during parent state changes.
 */
export const FlashCard = memo(function FlashCard({
  card,
  isFlipped = false,
  onFlip,
  className,
  showHint = false,
}: FlashCardProps) {
  const handleClick = useCallback(() => {
    onFlip?.();
  }, [onFlip]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onFlip?.();
      }
    },
    [onFlip]
  );

  return (
    <div
      className={cn("flashcard-container w-full h-full", className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard: ${card.front}. ${isFlipped ? "Showing back" : "Showing front"}. Press space to flip.`}
      aria-pressed={isFlipped}
    >
      <div className={cn("flashcard-inner", isFlipped && "flipped")}>
        {/* Front Face */}
        <Card className="flashcard-face flashcard-front flex flex-col items-center justify-center p-8 bg-card border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {card.front}
            </h2>
            {card.back.pronunciation && (
              <p className="text-lg text-muted-foreground font-mono">
                {card.back.pronunciation}
              </p>
            )}
            {card.back.partOfSpeech && (
              <Badge variant="secondary" className="text-sm">
                {card.back.partOfSpeech}
              </Badge>
            )}
            {showHint && (
              <div className="flex items-center gap-2 text-muted-foreground mt-4">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">Tap or press Space to reveal</span>
              </div>
            )}
          </div>
        </Card>

        {/* Back Face */}
        <Card className="flashcard-face flashcard-back flex flex-col p-6 md:p-8 bg-card border-2 border-primary/30 cursor-pointer overflow-y-auto">
          <div className="space-y-5">
            {/* Term and pronunciation */}
            <div className="text-center border-b border-border pb-4">
              <h3 className="text-2xl font-bold text-foreground">{card.front}</h3>
              {card.back.pronunciation && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-mono">
                    {card.back.pronunciation}
                  </span>
                </div>
              )}
              {card.back.partOfSpeech && (
                <Badge variant="outline" className="mt-2">
                  {card.back.partOfSpeech}
                </Badge>
              )}
            </div>

            {/* Definition */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Definition
              </h4>
              <p className="text-lg text-foreground leading-relaxed">
                {card.back.definition}
              </p>
            </div>

            {/* Example sentence */}
            {card.back.exampleSentence && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Example
                  </h4>
                </div>
                <p className="text-foreground italic">
                  "{card.back.exampleSentence}"
                </p>
              </div>
            )}

            {/* Synonyms */}
            {card.back.synonyms && card.back.synonyms.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Synonyms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {card.back.synonyms.map((synonym, index) => (
                    <Badge key={index} variant="secondary">
                      {synonym}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Collocations */}
            {card.back.collocations && card.back.collocations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Common Collocations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {card.back.collocations.map((collocation, index) => (
                    <Badge key={index} variant="outline">
                      {collocation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
});

/**
 * Skeleton loader for FlashCard
 */
export function FlashCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-8 animate-pulse", className)}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-6 bg-muted rounded w-24" />
        <div className="h-5 bg-muted rounded w-16" />
      </div>
    </Card>
  );
}
