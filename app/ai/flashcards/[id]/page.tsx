"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

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

  const loadDeck = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deckData = await aiFlashcardService.getDeck(id);
      setDeck(deckData);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load deck";
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
      toast.success("Deck deleted successfully");
      router.push("/ai/flashcards");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to delete deck";
      toast.error("Error", { description: message });
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
        title="AI Flashcards"
        backHref="/ai/flashcards"
        backLabel="Flashcards"
        maxWidth="7xl"
      >
        <AiLoadingState variant="studying" message="Loading deck..." />
      </AiPageWrapper>
    );
  }

  if (error || !deck) {
    return (
      <AiPageWrapper
        title="AI Flashcards"
        backHref="/ai/flashcards"
        backLabel="Flashcards"
        maxWidth="7xl"
      >
        <AiErrorCard
          title="Failed to load deck"
          message={error || "Deck not found"}
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
      backLabel="Flashcards"
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
                  {SOURCE_LABELS[deck.sourceType]}
                </Badge>
                {hasDueCards && (
                  <Badge
                    variant="default"
                    className="bg-primary/10 text-primary border-primary/30"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {deck.dueCount} due
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
                <p className="text-xs text-muted-foreground">Total Cards</p>
                <p className="text-base font-semibold">{deck.cardCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Due Now</p>
                <p className="text-base font-semibold">{deck.dueCount ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-xs font-medium">
                  {formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {deck.masteryLevel !== undefined && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Mastery</p>
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
            {hasDueCards ? `Study Now (${deck.dueCount} due)` : "Start Study Session"}
          </Button>
        </CardContent>
      </Card>

      {/* Card Preview List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Cards ({deck.cardCount})</h2>
        <div className="space-y-1.5">
          {deck.cards.map((card, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => toggleCardExpand(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground font-mono">
                        #{index + 1}
                      </span>
                      <span className="font-medium truncate">{card.front}</span>
                      {card.back.partOfSpeech && (
                        <Badge variant="outline" className="text-xs">
                          {card.back.partOfSpeech}
                        </Badge>
                      )}
                    </div>
                    {expandedCards.has(index) && (
                      <div className="mt-3 pl-8 space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <strong>Definition:</strong> {card.back.definition}
                        </p>
                        {card.back.pronunciation && (
                          <p className="text-muted-foreground font-mono">
                            {card.back.pronunciation}
                          </p>
                        )}
                        {card.back.exampleSentence && (
                          <p className="text-muted-foreground italic">
                            "{card.back.exampleSentence}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    {expandedCards.has(index) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
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
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deck.title}"? This will remove all{" "}
              {deck.cardCount} cards and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Deck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AiPageWrapper>
  );
}
