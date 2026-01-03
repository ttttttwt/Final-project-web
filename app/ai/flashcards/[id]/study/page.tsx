"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FlashcardDeckDTO,
  FlashcardStudySessionDTO,
  FlashcardProgressDTO,
  CardReviewDTO,
} from "@/types/ai";
import { aiFlashcardService } from "@/services/ai-flashcard.service";
import {
  FlashCard,
  SwipeableCard,
  StudyProgress,
  MasteryIndicator,
  TranslateButton,
} from "@/components/ai/flashcards";
import { AiLoadingState, AiErrorCard, AiPageWrapper } from "@/components/ai/common";
import {
  useFlashcardKeyboard,
  KeyboardShortcutsHelp,
} from "@/hooks/useFlashcardKeyboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  X,
  Check,
  RotateCcw,
  Keyboard,
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Undo,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

interface ReviewAction {
  cardIndex: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  timestamp: number;
}

// Queue item for study session
interface StudyQueueItem {
  cardIndex: number;
  progress: FlashcardProgressDTO;
  repetitionCount: number; // How many times this card has been shown in this session
}

/**
 * Flashcard Study Session Page
 * Interactive study experience with swipe gestures and keyboard shortcuts.
 */
export default function StudyPage({ params }: StudyPageProps) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionStartRef = useRef<Date>(new Date());

  // Detect practice mode from URL query param
  const isPracticeMode = searchParams.get("mode") === "practice";

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<FlashcardDeckDTO | null>(null);
  const [session, setSession] = useState<FlashcardStudySessionDTO | null>(null);
  const [studyQueue, setStudyQueue] = useState<StudyQueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviews, setReviews] = useState<CardReviewDTO[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewAction[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [initialCardCount, setInitialCardCount] = useState(0);

  // Get current card from dynamic queue
  const currentQueueItem = studyQueue[currentQueueIndex];
  const currentProgress = currentQueueItem?.progress;
  const currentCard = currentQueueItem && deck?.cards[currentQueueItem.cardIndex];
  const isComplete = currentQueueIndex >= studyQueue.length;

  // Load session on mount or when mode changes
  useEffect(() => {
    loadSession();
  }, [id, isPracticeMode]);

  const loadSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [deckData, sessionData] = await Promise.all([
        aiFlashcardService.getDeck(id),
        aiFlashcardService.getStudySession(id, isPracticeMode ? "practice" : "normal"),
      ]);
      setDeck(deckData);
      setSession(sessionData);

      // Initialize study queue from session cards
      const initialQueue: StudyQueueItem[] = (sessionData.cardsToStudy || []).map(progress => ({
        cardIndex: progress.cardIndex,
        progress,
        repetitionCount: 0,
      }));
      setStudyQueue(initialQueue);
      setInitialCardCount(initialQueue.length);
      setCurrentQueueIndex(0);

      sessionStartRef.current = new Date();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to load study session";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card review
  const handleReview = useCallback(
    (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
      if (!currentQueueItem || !currentProgress || isComplete) return;

      const review: CardReviewDTO = {
        cardIndex: currentQueueItem.cardIndex,
        quality,
        timeTakenMs: Date.now() - sessionStartRef.current.getTime(),
      };

      setReviews((prev) => [...prev, review]);
      setReviewHistory((prev) => [
        ...prev,
        {
          cardIndex: currentQueueItem.cardIndex,
          quality,
          timestamp: Date.now(),
        },
      ]);

      // Update counts
      if (quality >= 3) {
        setCorrectCount((c) => c + 1);
      } else {
        setIncorrectCount((c) => c + 1);

        // Always re-queue failed cards (Anki-like behavior)
        // Cards will keep appearing until user marks them as "Know"
        setStudyQueue((prev) => [
          ...prev,
          {
            cardIndex: currentQueueItem.cardIndex,
            progress: currentQueueItem.progress,
            repetitionCount: currentQueueItem.repetitionCount + 1,
          },
        ]);
      }

      // Move to next card
      setCurrentQueueIndex((prev) => prev + 1);
      setIsFlipped(false);
    },
    [currentQueueItem, currentProgress, currentQueueIndex, studyQueue.length, isComplete]
  );

  // Watch for session completion
  useEffect(() => {
    if (isComplete && studyQueue.length > 0 && !showCompletionDialog) {
      setShowCompletionDialog(true);
    }
  }, [isComplete, studyQueue.length, showCompletionDialog]);

  // Swipe handlers
  const handleSwipeLeft = useCallback(() => {
    handleReview(1); // Don't know
  }, [handleReview]);

  const handleSwipeRight = useCallback(() => {
    handleReview(4); // Know well
  }, [handleReview]);

  // Flip handler
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Undo last action
  const handleUndo = useCallback(() => {
    if (reviewHistory.length === 0 || currentQueueIndex === 0) return;

    const lastReview = reviewHistory[reviewHistory.length - 1];
    setReviewHistory((prev) => prev.slice(0, -1));
    setReviews((prev) => prev.slice(0, -1));
    setCurrentQueueIndex((prev) => prev - 1);
    setIsFlipped(false);

    // If last review was incorrect, we need to remove the re-queued card
    if (lastReview.quality < 3) {
      setStudyQueue((prev) => {
        // Remove the last added item if it matches the undone card
        const lastItem = prev[prev.length - 1];
        if (lastItem && lastItem.cardIndex === lastReview.cardIndex && lastItem.repetitionCount > 0) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }

    // Update counts
    if (lastReview.quality >= 3) {
      setCorrectCount((c) => Math.max(0, c - 1));
    } else {
      setIncorrectCount((c) => Math.max(0, c - 1));
    }

    toast.success(t("ai.flashcards.undone"), { description: t("ai.flashcards.revertedReview") });
  }, [reviewHistory, currentQueueIndex, t]);

  // Exit handler
  const handleExit = useCallback(() => {
    if (reviews.length > 0) {
      setShowExitDialog(true);
    } else {
      router.push(`/ai/flashcards/${id}`);
    }
  }, [reviews.length, router, id]);

  // Submit reviews
  const submitReviews = async (navigateAfter = true) => {
    if (reviews.length === 0) {
      if (navigateAfter) {
        router.push(`/ai/flashcards/${id}`);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // In practice mode, don't save progress to backend
      if (!isPracticeMode) {
        await aiFlashcardService.submitReview(id, {
          reviews,
          sessionTimeMs: Date.now() - sessionStartRef.current.getTime(),
        });
        toast.success(t("ai.flashcards.progressSaved"), {
          description: t("ai.flashcards.cardsReviewed", { count: reviews.length }),
        });
      } else {
        toast.success(t("ai.flashcards.practiceComplete") || "Practice session complete!", {
          description: t("ai.flashcards.progressNotSaved") || "Progress was not saved (practice mode).",
        });
      }
      if (navigateAfter) {
        router.push(`/ai/flashcards/${id}`);
      }
    } catch (err: any) {
      toast.error(t("ai.flashcards.failedToSaveProgress"), {
        description: t("ai.flashcards.progressMayNotSave"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcuts
  useFlashcardKeyboard({
    onFlip: handleFlip,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onEscape: handleExit,
    onUndo: handleUndo,
    disabled: isComplete || isLoading,
  });

  // Loading state
  if (isLoading) {
    return (
      <AiPageWrapper
        title={t("ai.flashcards.studySession")}
        backHref={`/ai/flashcards/${id}`}
        backLabel={t("ai.flashcards.backToDeck")}
      >
        <div className="flex items-center justify-center py-12">
          <AiLoadingState
            variant="studying"
            message={t("ai.flashcards.preparingSession")}
          />
        </div>
      </AiPageWrapper>
    );
  }

  // Error state
  if (error || !deck || !session) {
    return (
      <AiPageWrapper
        title={t("ai.flashcards.studySession")}
        backHref="/ai/flashcards"
        backLabel={t("ai.flashcards.title")}
      >
        <AiErrorCard
          title={t("ai.flashcards.failedToLoadSession")}
          message={error || t("ai.flashcards.sessionNotFound")}
          onRetry={loadSession}
          onReset={() => router.push(`/ai/flashcards/${id}`)}
        />
      </AiPageWrapper>
    );
  }

  // Empty session state
  if (initialCardCount === 0) {
    return (
      <AiPageWrapper
        title={t("ai.flashcards.studySession")}
        backHref={`/ai/flashcards/${id}`}
        backLabel={t("ai.flashcards.backToDeck")}
      >
        <Card className="p-8">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("ai.flashcards.allCaughtUpNoDue")}</h3>
            <p className="text-muted-foreground mb-6">
              {t("ai.flashcards.noCardsDueNow")}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push(`/ai/flashcards/${id}`)}>
                {t("ai.flashcards.backToDeck")}
              </Button>
              <Button onClick={() => router.push(`/ai/flashcards/${id}/study?mode=practice`)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("ai.flashcards.practiceAnyway") || "Practice Anyway"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AiPageWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleExit}>
              <X className="w-4 h-4 mr-2" />
              {t("ai.flashcards.exit")}
            </Button>

            <div className="flex-1 mx-4">
              <StudyProgress
                current={currentQueueIndex}
                total={studyQueue.length}
                correctCount={correctCount}
                incorrectCount={incorrectCount}
                stats={session.stats}
                startedAt={sessionStartRef.current}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={reviewHistory.length === 0}
                aria-label="Undo last review"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("ai.flashcards.keyboardShortcuts")}>
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t("ai.flashcards.keyboardShortcuts")}</SheetTitle>
                    <SheetDescription>
                      {t("ai.flashcards.shortcutsDesc")}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <KeyboardShortcutsHelp />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Study Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        {isComplete ? (
          // Session Complete Summary
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>{t("ai.flashcards.sessionCompleteTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold text-green-600">
                    {correctCount}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("ai.flashcards.correct")}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold text-destructive">
                    {incorrectCount}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("ai.flashcards.needReview")}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("ai.flashcards.accuracy")}</span>
                  <span className="font-medium">
                    {initialCardCount > 0
                      ? Math.round((correctCount / initialCardCount) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={initialCardCount > 0 ? (correctCount / initialCardCount) * 100 : 0}
                  className="h-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/ai/flashcards/${id}`)}
                  disabled={isSubmitting}
                >
                  {t("ai.flashcards.backToDeck")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => submitReviews(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("ai.flashcards.saving") : t("ai.flashcards.saveAndExit")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Active Study Card
          <div className="w-full max-w-2xl">
            {/* Card Stack */}
            <div className="flashcard-stack aspect-[3/4] sm:aspect-[4/3] mb-8">
              {currentCard && (
                <SwipeableCard
                  card={currentCard}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onFlip={setIsFlipped}
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="flex-1 max-w-[140px] border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleSwipeLeft}
              >
                <X className="w-5 h-5 mr-2" />
                {t("ai.flashcards.dontKnow")}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full"
                onClick={handleFlip}
                aria-label="Flip card"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 max-w-[140px] border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                onClick={handleSwipeRight}
              >
                <Check className="w-5 h-5 mr-2" />
                {t("ai.flashcards.know")}
              </Button>
            </div>

            {/* Current card info */}
            {currentProgress && currentQueueItem && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <MasteryIndicator level={currentProgress.masteryLevel} size="sm" />
                <span>•</span>
                <span>
                  {t("ai.flashcards.reviewed")} {currentProgress.reviewCount} {t("ai.flashcards.times")}
                </span>
                {currentQueueItem.repetitionCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-500 font-medium">
                      Seen {currentQueueItem.repetitionCount + 1}x this session
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.flashcards.exitStudySession")}</DialogTitle>
            <DialogDescription>
              {t("ai.flashcards.exitConfirmDesc", { count: reviews.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => router.push(`/ai/flashcards/${id}`)}
            >
              {t("ai.flashcards.exitWithoutSaving")}
            </Button>
            <Button
              onClick={() => {
                setShowExitDialog(false);
                submitReviews(true);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("ai.flashcards.saving") : t("ai.flashcards.saveAndExit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("ai.flashcards.greatJob")}
            </DialogTitle>
            <DialogDescription>
              {t("ai.flashcards.completedSessionDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <div className="text-xl font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-muted-foreground">{t("ai.flashcards.correct")}</div>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <div className="text-xl font-bold text-destructive">{incorrectCount}</div>
                <div className="text-xs text-muted-foreground">{t("ai.flashcards.needReview")}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowCompletionDialog(false);
                submitReviews(true);
              }}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? t("ai.flashcards.saving") : t("ai.flashcards.saveAndContinue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
