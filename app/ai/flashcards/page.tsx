"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlashcardDeckDTO } from "@/types/ai";
import { aiFlashcardService } from "@/services/ai-flashcard.service";
import { DeckCard, DeckCardSkeleton } from "@/components/ai/flashcards";
import { AiErrorCard, AiPageWrapper, FlashcardDeckSkeleton, AiLoadingState } from "@/components/ai/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Plus,
  Search,
  Sparkles,
  Clock,
  TrendingUp,
  RefreshCw,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

/**
 * Flashcard Decks List Page
 * Shows all user's flashcard decks with study options.
 */
export default function FlashcardsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decks, setDecks] = useState<FlashcardDeckDTO[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch decks on mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [decksResponse, dueResponse] = await Promise.all([
        aiFlashcardService.getDecks(0, 100),
        aiFlashcardService.getTotalDueCount(),
      ]);
      setDecks(decksResponse.content || []);
      setTotalDue(dueResponse.totalDueCards || 0);
    } catch (err: any) {
      const message = err.response?.data?.message || t("ai.flashcards.failedToLoad");
      setError(message);
      toast.error(t("common.error"), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudy = (deck: FlashcardDeckDTO) => {
    router.push(`/ai/flashcards/${deck.id}/study`);
  };

  const handleView = (deck: FlashcardDeckDTO) => {
    router.push(`/ai/flashcards/${deck.id}`);
  };

  const handleCreateDeck = () => {
    router.push("/ai/flashcards/create");
  };

  // Filter decks based on search and tab
  const filteredDecks = decks.filter((deck) => {
    const matchesSearch =
      searchQuery === "" ||
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "due") {
      return matchesSearch && (deck.dueCount ?? 0) > 0;
    }
    return matchesSearch;
  });

  const dueDecks = decks.filter((d) => (d.dueCount ?? 0) > 0);

  // Header actions
  const headerActions = (
    <div className="flex items-center gap-3">
      {totalDue > 0 && (
        <Badge variant="default" className="text-sm py-1 px-3 hidden sm:flex">
          <Clock className="w-4 h-4 mr-1" />
          {totalDue} {t("ai.flashcards.cardsDue")}
        </Badge>
      )}
      <Button onClick={handleCreateDeck} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{t("ai.flashcards.createDeck")}</span>
        <span className="sm:hidden">{t("ai.flashcards.create")}</span>
      </Button>
    </div>
  );

  return (
    <AiPageWrapper
      title={t("ai.flashcards.title")}
      backHref="/dashboard"
      backLabel={t("ai.common.backToDashboard")}
      headerActions={headerActions}
      feature="flashcards"
      showQuota={true}
      showNetworkStatus={true}
      maxWidth="7xl"
    >
      {/* Page Description */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          {t("ai.flashcards.description")}
        </p>
      </div>

      {/* Quick Study Card */}
      {totalDue > 0 && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{t("ai.flashcards.readyToStudy")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("ai.flashcards.cardsDueAcross", { count: totalDue, decks: dueDecks.length })}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (dueDecks.length === 0) {
                  toast.error(t("ai.flashcards.noCardsDue"), { description: t("ai.flashcards.allDecksUpToDate") });
                  return;
                }
                // Start with the deck that has the most due cards
                const deckWithMostDue = dueDecks.reduce((prev, current) =>
                  (current.dueCount ?? 0) > (prev.dueCount ?? 0) ? current : prev
                );
                if (deckWithMostDue) {
                  handleStudy(deckWithMostDue);
                }
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("ai.flashcards.startStudySession")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Tabs */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("ai.flashcards.searchDecks")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadDecks}
            disabled={isLoading}
            aria-label="Refresh decks"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t("ai.flashcards.allDecks")} ({decks.length})
            </TabsTrigger>
            <TabsTrigger value="due">
              {t("ai.flashcards.dueForReview")} ({dueDecks.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Error State */}
      {error && (
        <AiErrorCard
          title={t("ai.flashcards.failedToLoad")}
          message={error}
          onRetry={loadDecks}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <AiLoadingState variant="studying" message={t("ai.flashcards.loadingDecks")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4 auto-rows-fr">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <FlashcardDeckSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredDecks.length === 0 && (
        <Card className="p-8">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery
                ? t("ai.flashcards.noMatchingDecks")
                : activeTab === "due"
                  ? t("ai.flashcards.noCardsDueReview")
                  : t("ai.flashcards.noDecksYet")}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchQuery
                ? t("ai.flashcards.tryDifferentSearch")
                : activeTab === "due"
                  ? t("ai.flashcards.allCaughtUp")
                  : t("ai.flashcards.createFirstDeck")}
            </p>
            {!searchQuery && activeTab === "all" && (
              <div className="flex gap-3">
                <Button onClick={handleCreateDeck}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("ai.flashcards.createDeck")}
                </Button>
                <Button variant="outline" onClick={() => router.push("/courses")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("ai.flashcards.browseLessons")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deck Grid - Grouped */}
      {!isLoading && !error && filteredDecks.length > 0 && (
        <div className="space-y-6">
          {Object.entries(
            filteredDecks.reduce((acc, deck) => {
              const courseTitle = deck.courseTitle || t("ai.flashcards.otherDecks");
              const lessonTitle = deck.lessonTitle || t("ai.flashcards.general");

              if (!acc[courseTitle]) {
                acc[courseTitle] = {};
              }
              if (!acc[courseTitle][lessonTitle]) {
                acc[courseTitle][lessonTitle] = [];
              }
              acc[courseTitle][lessonTitle].push(deck);
              return acc;
            }, {} as Record<string, Record<string, FlashcardDeckDTO[]>>)
          ).map(([courseTitle, lessons]) => (
            <div key={courseTitle} className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
                <Layers className="w-5 h-5" />
                {courseTitle}
              </h2>

              <div className="pl-3 border-l-2 border-muted space-y-4">
                {Object.entries(lessons).map(([lessonTitle, decks]) => (
                  <div key={lessonTitle} className="space-y-2">
                    {lessonTitle !== t("ai.flashcards.general") && (
                      <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {lessonTitle}
                      </h3>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4 auto-rows-fr">
                      {decks.map((deck) => (
                        <DeckCard
                          key={deck.id}
                          deck={deck}
                          onStudy={handleStudy}
                          onView={handleView}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AiPageWrapper>
  );
}
