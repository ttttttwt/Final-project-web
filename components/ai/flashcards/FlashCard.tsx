"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FlashcardCardDTO } from "@/types/ai";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, Lightbulb, BookOpen, FileText, ImageIcon, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { CardTranslateButton, TranslatedContent, CardTranslation } from "./CardTranslateButton";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardTranslation, setCardTranslation] = useState<CardTranslation | null>(null);

  const handleClick = useCallback(() => {
    onFlip?.();
  }, [onFlip]);

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onFlip?.();
      }
    },
    [onFlip]
  );
  // ... existing code ...

  const playAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.back.audioUrl) {
      const audio = new Audio(card.back.audioUrl);
      audio.play().catch(err => console.error("Audio playback failed:", err));
    }
  }, [card.back.audioUrl]);

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
        <Card className="flashcard-face flashcard-front flex flex-col items-center justify-center p-8 bg-card border-2 border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
          <div className="text-center space-y-4 w-full">
            <div className="relative w-full">
              <h2 className={cn(
                "text-3xl md:text-4xl font-bold text-foreground break-words transition-all duration-300",
                !isExpanded && "line-clamp-6"
              )}>
                {card.front}
              </h2>
              {card.front.length > 80 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 text-xs text-muted-foreground hover:text-primary"
                  onClick={toggleExpand}
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3 mr-1" /> Show More</>
                  )}
                </Button>
              )}
            </div>
            {card.back.pronunciation && (
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg text-muted-foreground font-mono">
                  {card.back.pronunciation}
                </p>
                {card.back.audioUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    onClick={playAudio}
                    aria-label="Play pronunciation"
                  >
                    <Volume2 className="w-4 h-4 text-primary" />
                  </Button>
                )}
              </div>
            )}
            {card.back.partOfSpeech && (
              <Badge variant="secondary" className="text-sm">
                {card.back.partOfSpeech}
              </Badge>
            )}

            {/* Image preview on front */}
            {(() => {
              const imageUrl = card.back.imageUrl;
              const imageStatus = card.back.imageStatus;
              if ((imageStatus === 'COMPLETED' && imageUrl) || (imageUrl && !imageStatus)) {
                return (
                  <div className="relative w-48 h-48 mx-auto mt-4 rounded-lg overflow-hidden bg-muted/20 border border-border/30">
                    <Image
                      src={imageUrl}
                      alt={card.front}
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  </div>
                );
              }
              return null;
            })()}

            {showHint && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">Tap or press Space to reveal</span>
              </div>
            )}
          </div>
        </Card>

        {/* Back Face */}
        <Card className="flashcard-face flashcard-back flex flex-col p-6 md:p-8 bg-card border-2 border-primary/30 cursor-pointer overflow-y-auto">
          <div className="space-y-5">
            {/* Translate Button - Top Right */}
            <div className="flex justify-end -mt-2 mb-2">
              <CardTranslateButton
                card={card}
                cachedTranslation={cardTranslation || undefined}
                onTranslation={setCardTranslation}
              />
            </div>

            {/* Term and pronunciation */}
            <div className="text-center border-b border-border pb-4">
              <h3 className="text-2xl font-bold text-foreground">{card.front}</h3>
              <TranslatedContent original={card.front} translated={cardTranslation?.front} className="justify-center" />
              <div className="flex items-center justify-center gap-2 mt-2">
                {card.back.pronunciation && (
                  <span className="text-muted-foreground font-mono">
                    {card.back.pronunciation}
                  </span>
                )}
                {card.back.audioUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-primary/10"
                    onClick={playAudio}
                  >
                    <Volume2 className="w-3 h-3 text-primary" />
                  </Button>
                )}
              </div>
              {card.back.partOfSpeech && (
                <Badge variant="outline" className="mt-2">
                  {card.back.partOfSpeech}
                </Badge>
              )}
            </div>

            {/* Image Section */}
            {(() => {
              const imageStatus = card.back.imageStatus;
              const imageUrl = card.back.imageUrl;

              // Show skeleton for PENDING or GENERATING
              if (imageStatus === 'PENDING' || imageStatus === 'GENERATING') {
                return (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted/30 border border-border flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {imageStatus === 'GENERATING' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">
                        {imageStatus === 'GENERATING' ? 'Generating image...' : 'Image pending...'}
                      </span>
                    </div>
                    <Skeleton className="w-3/4 h-24 rounded" />
                  </div>
                );
              }

              // Show image for COMPLETED with valid URL
              if (imageStatus === 'COMPLETED' && imageUrl) {
                return (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted/30 border border-border">
                    <Image
                      src={imageUrl}
                      alt={card.front}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                );
              }

              // Show fallback for FAILED or no imageStatus (legacy cards)
              if (imageStatus === 'FAILED') {
                return (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted/20 border border-dashed border-muted-foreground/30">
                    <Image
                      src="/images/flashcard-default.svg"
                      alt="Default flashcard illustration"
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                );
              }

              // Legacy: show image if URL exists but no status
              if (imageUrl && !imageStatus) {
                return (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted/30 border border-border">
                    <Image
                      src={imageUrl}
                      alt={card.front}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                );
              }

              // No image section if no status and no URL
              return null;
            })()}

            {/* Definition */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Definition
              </h4>
              <p className={cn(
                "text-lg text-foreground leading-relaxed transition-all duration-300",
                !isExpanded && "line-clamp-4"
              )}>
                {card.back.definition}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {card.back.definition.length > 120 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:bg-primary/5 px-2"
                    onClick={toggleExpand}
                  >
                    {isExpanded ? "Show Less" : "Read More..."}
                  </Button>
                )}
              </div>
              <TranslatedContent original={card.back.definition} translated={cardTranslation?.definition} />
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
                <p className={cn(
                  "text-foreground italic transition-all duration-300",
                  !isExpanded && "line-clamp-3"
                )}>
                  "{card.back.exampleSentence}"
                </p>
                <TranslatedContent original={card.back.exampleSentence} translated={cardTranslation?.exampleSentence} />
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

            {/* Notes */}
            {card.back.notes && card.back.notes.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-100 dark:border-yellow-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                    Notes
                  </h4>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {card.back.notes.map((note, index) => (
                    <li key={index} className="text-sm text-foreground/90">
                      {note}
                    </li>
                  ))}
                </ul>
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
