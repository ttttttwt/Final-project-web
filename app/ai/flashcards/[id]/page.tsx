"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FlashcardDeckDTO, FlashcardCardDTO } from "@/types/ai";
import { aiFlashcardService } from "@/services/ai-flashcard.service";
import { FlashCard, MasteryIndicator, MasteryBar } from "@/components/ai/flashcards";
import { AiLoadingState, AiErrorCard, AiPageWrapper } from "@/components/ai/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  PlayCircle,
  Edit,
  Trash2,
  Layers,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

interface DeckDetailPageProps {
  params: Promise<{ id: string }>;
}

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  A2: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  B1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  B2: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  C1: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  C2: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  LESSON: <BookOpen className="w-4 h-4" />,
  AI_GENERATED: <Sparkles className="w-4 h-4" />,
  USER_CREATED: <User className="w-4 h-4" />,
};

const SOURCE_LABELS: Record<string, string> = {
  LESSON: "From Lesson",
  AI_GENERATED: "AI Generated",
  USER_CREATED: "Custom",
};

/**
 * Deck Detail Page
 * Shows deck information, card preview, and study options.
 */
export default function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<FlashcardDeckDTO | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [previewCard, setPreviewCard] = useState<FlashcardCardDTO | null>(null);

  useEffect(() => {
    loadDeck();
  }, [id]);

  // Polling for image generation status
  useEffect(() => {
    if (!deck) return;

    const hasPendingImages = deck.cards?.some(
      card => card.back.imageStatus === 'PENDING' || card.back.imageStatus === 'GENERATING'
    );

    if (!hasPendingImages) return;

    const interval = setInterval(() => {
      loadDeck();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [deck]);

  const loadDeck = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deckData = await aiFlashcardService.getDeck(id);
      setDeck(deckData);
    } catch (err: any) {
      const message = err.response?.data?.message || t("ai.flashcards.failedToLoad");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudy = () => {
    router.push(`/ai/flashcards/${id}/study`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await aiFlashcardService.deleteDeck(id);
      toast.success(t("ai.flashcards.deckDeletedSuccess"));
      router.push("/ai/flashcards");
    } catch (err: any) {
      const message = err.response?.data?.message || t("ai.flashcards.failedToDeleteDeck");
      toast.error(t("common.error"), { description: message });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const toggleCardExpand = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <AiPageWrapper
        title={t("ai.flashcards.title")}
        backHref="/ai/flashcards"
        backLabel={t("ai.flashcards.title")}
        maxWidth="7xl"
      >
        <AiLoadingState variant="studying" message={t("ai.flashcards.loadingDeck")} />
      </AiPageWrapper>
    );
  }

  if (error || !deck) {
    return (
      <AiPageWrapper
        title={t("ai.flashcards.title")}
        backHref="/ai/flashcards"
        backLabel={t("ai.flashcards.title")}
        maxWidth="7xl"
      >
        <AiErrorCard
          title={t("ai.flashcards.failedToLoad")}
          message={error || t("ai.flashcards.deckNotFound")}
          onRetry={loadDeck}
          onReset={() => router.push("/ai/flashcards")}
        />
      </AiPageWrapper>
    );
  }

  const hasDueCards = (deck.dueCount ?? 0) > 0;

  return (
    <AiPageWrapper
      title={deck.title}
      backHref="/ai/flashcards"
      backLabel={t("ai.flashcards.title")}
      maxWidth="7xl"
    >

      {/* Deck Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {deck.cefrLevel && (
                  <Badge
                    variant="secondary"
                    className={cn("font-semibold", CEFR_COLORS[deck.cefrLevel])}
                  >
                    {deck.cefrLevel}
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  {SOURCE_ICONS[deck.sourceType]}
                  {deck.sourceType === "LESSON" ? t("ai.flashcards.fromLesson") :
                    deck.sourceType === "AI_GENERATED" ? t("ai.flashcards.aiGenerated") :
                      t("ai.flashcards.custom")}
                </Badge>
                {hasDueCards && (
                  <Badge
                    variant="default"
                    className="bg-primary/10 text-primary border-primary/30"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {deck.dueCount} {t("ai.flashcards.dueNow")}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <CardTitle className="text-2xl">{deck.title}</CardTitle>

              {/* Description */}
              {deck.description && (
                <p className="text-muted-foreground">{deck.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Edit deck"
                onClick={() => router.push(`/ai/flashcards/${id}/edit`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                aria-label="Delete deck"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t("ai.flashcards.totalCards")}</p>
                <p className="text-base font-semibold">{deck.cardCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t("ai.flashcards.dueNow")}</p>
                <p className="text-base font-semibold">{deck.dueCount ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("ai.flashcards.created")}</p>
                <p className="text-xs font-medium">
                  {formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {deck.masteryLevel !== undefined && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{t("ai.flashcards.mastery")}</p>
                  <MasteryIndicator level={deck.masteryLevel} showLabel size="sm" />
                </div>
              </div>
            )}
          </div>

          {/* Study Button */}
          <Button
            className="w-full"
            onClick={handleStudy}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            {hasDueCards ? t("ai.flashcards.studyNowWithDue", { count: deck.dueCount ?? 0 }) : t("ai.flashcards.startStudySession")}
          </Button>
        </CardContent>
      </Card>

      {/* Card Preview List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t("ai.flashcards.cards")} ({deck.cardCount})</h2>
        <div className="space-y-3">
          {deck.cards.map((card, index) => (
            <Card
              key={index}
              className="group cursor-pointer hover:border-primary/50 transition-all duration-200 overflow-hidden"
              onClick={() => toggleCardExpand(index)}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch min-h-[5rem]">
                  {/* Image Thumbnail - Fixed size with padding */}
                  <div className="w-44 flex-shrink-0 bg-muted/10 border-r border-border/50 flex items-center justify-center p-3 group-hover:bg-muted/20 transition-colors">
                    {(() => {
                      const imageStatus = card.back.imageStatus;
                      const imageUrl = card.back.imageUrl;

                      if (imageStatus === 'PENDING' || imageStatus === 'GENERATING') {
                        return (
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            {imageStatus === 'GENERATING' ? (
                              <>
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t("status.generating")}</span>
                              </>
                            ) : (
                              <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                            )}
                          </div>
                        );
                      }

                      if ((imageStatus === 'COMPLETED' && imageUrl) || (imageUrl && !imageStatus)) {
                        return (
                          <Image
                            src={imageUrl}
                            alt={card.front}
                            width={160}
                            height={160}
                            className="rounded-md object-contain"
                          />
                        );
                      }

                      // Default/Failed - use default SVG image with same size
                      return (
                        <Image
                          src="/images/flashcard-default.svg"
                          alt="Default illustration"
                          width={160}
                          height={160}
                          className="rounded-md object-contain opacity-50"
                        />
                      );
                    })()}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-4 sm:p-5 flex items-center justify-between min-w-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono text-muted-foreground/60 w-6">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-colors">
                          {card.front}
                        </h3>
                        {card.back.partOfSpeech && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal bg-muted text-muted-foreground border-border/50">
                            {card.back.partOfSpeech}
                          </Badge>
                        )}
                      </div>

                      {/* Show definition preview when collapsed, or full details when expanded */}
                      {!expandedCards.has(index) && card.back.definition && (
                        <p className="text-sm text-muted-foreground line-clamp-1 pl-9">
                          {card.back.definition}
                        </p>
                      )}

                      {expandedCards.has(index) && (
                        <div className="mt-4 pl-9 space-y-3 text-sm animate-in slide-in-from-top-2 duration-200">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                              {t("ai.flashcards.definition")}
                            </span>
                            <p className="text-foreground/90 leading-relaxed">
                              {card.back.definition}
                            </p>
                          </div>

                          {card.back.pronunciation && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                IPA:
                              </span>
                              <code className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-xs text-primary">
                                {card.back.pronunciation}
                              </code>
                            </div>
                          )}

                          {card.back.exampleSentence && (
                            <div className="relative pl-3 border-l-2 border-primary/20 italic text-muted-foreground">
                              "{card.back.exampleSentence}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors self-start mt-0.5">
                      {expandedCards.has(index) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.flashcards.deleteDeck")}</DialogTitle>
            <DialogDescription>
              {t("ai.flashcards.deleteConfirmDesc", { title: deck.title, count: deck.cardCount })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("ai.flashcards.deleting") : t("ai.flashcards.deleteDeck")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AiPageWrapper>
  );
}
