"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
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

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

interface ReviewAction {
  cardIndex: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  timestamp: number;
}

/**
 * Flashcard Study Session Page
 * Interactive study experience with swipe gestures and keyboard shortcuts.
 */
export default function StudyPage({ params }: StudyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const sessionStartRef = useRef<Date>(new Date());

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<FlashcardDeckDTO | null>(null);
  const [session, setSession] = useState<FlashcardStudySessionDTO | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviews, setReviews] = useState<CardReviewDTO[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewAction[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Get current card
  const cardsToStudy = session?.cardsToStudy ?? [];
  const totalCards = cardsToStudy.length;
  const currentProgress = cardsToStudy[currentIndex];
  const currentCard = currentProgress && deck?.cards[currentProgress.cardIndex];
  const isComplete = currentIndex >= totalCards;

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [deckData, sessionData] = await Promise.all([
        aiFlashcardService.getDeck(id),
        aiFlashcardService.getStudySession(id),
      ]);
      setDeck(deckData);
      setSession(sessionData);
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
      if (!currentProgress || isComplete) return;

      const review: CardReviewDTO = {
        cardIndex: currentProgress.cardIndex,
        quality,
        timeTakenMs: Date.now() - sessionStartRef.current.getTime(),
      };

      setReviews((prev) => [...prev, review]);
      setReviewHistory((prev) => [
        ...prev,
        {
          cardIndex: currentProgress.cardIndex,
          quality,
          timestamp: Date.now(),
        },
      ]);

      // Update counts
      if (quality >= 3) {
        setCorrectCount((c) => c + 1);
      } else {
        setIncorrectCount((c) => c + 1);
      }

      // Move to next card
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);

      // Check if session complete
      if (currentIndex + 1 >= totalCards) {
        setShowCompletionDialog(true);
      }
    },
    [currentProgress, currentIndex, totalCards, isComplete]
  );

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
    if (reviewHistory.length === 0 || currentIndex === 0) return;

    const lastReview = reviewHistory[reviewHistory.length - 1];
    setReviewHistory((prev) => prev.slice(0, -1));
    setReviews((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev - 1);
    setIsFlipped(false);

    // Update counts
    if (lastReview.quality >= 3) {
      setCorrectCount((c) => Math.max(0, c - 1));
    } else {
      setIncorrectCount((c) => Math.max(0, c - 1));
    }

    toast.success("Undone", { description: "Reverted last card review" });
  }, [reviewHistory, currentIndex]);

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
      await aiFlashcardService.submitReview(id, {
        reviews,
        sessionTimeMs: Date.now() - sessionStartRef.current.getTime(),
      });
      toast.success("Progress saved!", {
        description: `${reviews.length} cards reviewed`,
      });
      if (navigateAfter) {
        router.push(`/ai/flashcards/${id}`);
      }
    } catch (err: any) {
      toast.error("Failed to save progress", {
        description: "Your progress may not be saved.",
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
        title="Study Session"
        backHref={`/ai/flashcards/${id}`}
        backLabel="Deck"
      >
        <div className="flex items-center justify-center py-12">
          <AiLoadingState
            variant="studying"
            message="Preparing your study session..."
          />
        </div>
      </AiPageWrapper>
    );
  }

  // Error state
  if (error || !deck || !session) {
    return (
      <AiPageWrapper
        title="Study Session"
        backHref="/ai/flashcards"
        backLabel="Flashcards"
      >
        <AiErrorCard
          title="Failed to load study session"
          message={error || "Session not found"}
          onRetry={loadSession}
          onReset={() => router.push(`/ai/flashcards/${id}`)}
        />
      </AiPageWrapper>
    );
  }

  // Empty session state
  if (totalCards === 0) {
    return (
      <AiPageWrapper
        title="Study Session"
        backHref={`/ai/flashcards/${id}`}
        backLabel="Deck"
      >
        <Card className="p-8">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground mb-4">
              No cards are due for review right now. Check back later!
            </p>
            <Button onClick={() => router.push(`/ai/flashcards/${id}`)}>
              Back to Deck
            </Button>
          </CardContent>
        </Card>
      </AiPageWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleExit}>
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>

            <div className="flex-1 mx-4">
              <StudyProgress
                current={currentIndex}
                total={totalCards}
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
                  <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts">
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Keyboard Shortcuts</SheetTitle>
                    <SheetDescription>
                      Use these shortcuts for faster studying
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
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {isComplete ? (
          // Session Complete Summary
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Session Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold text-green-600">
                    {correctCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold text-destructive">
                    {incorrectCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Need Review</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-medium">
                    {totalCards > 0
                      ? Math.round((correctCount / totalCards) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={(correctCount / totalCards) * 100}
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
                  Back to Deck
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => submitReviews(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save & Exit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Active Study Card
          <div className="w-full max-w-lg">
            {/* Card Stack */}
            <div className="flashcard-stack aspect-[3/4] sm:aspect-[4/3] mb-16">
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
                size="lg"
                className="flex-1 max-w-[140px] border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleSwipeLeft}
              >
                <X className="w-5 h-5 mr-2" />
                Don't Know
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={handleFlip}
                aria-label="Flip card"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 max-w-[140px] border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                onClick={handleSwipeRight}
              >
                <Check className="w-5 h-5 mr-2" />
                Know
              </Button>
            </div>

            {/* Current card info */}
            {currentProgress && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <MasteryIndicator level={currentProgress.masteryLevel} size="sm" />
                <span>•</span>
                <span>
                  Reviewed {currentProgress.reviewCount} time
                  {currentProgress.reviewCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Study Session?</DialogTitle>
            <DialogDescription>
              You've reviewed {reviews.length} card{reviews.length !== 1 ? "s" : ""}.
              Would you like to save your progress before exiting?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => router.push(`/ai/flashcards/${id}`)}
            >
              Exit Without Saving
            </Button>
            <Button
              onClick={() => {
                setShowExitDialog(false);
                submitReviews(true);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save & Exit"}
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
              Great job!
            </DialogTitle>
            <DialogDescription>
              You've completed this study session. Your progress will be saved
              automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <div className="text-xl font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <div className="text-xl font-bold text-destructive">{incorrectCount}</div>
                <div className="text-xs text-muted-foreground">Need Review</div>
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
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
