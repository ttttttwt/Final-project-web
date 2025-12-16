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
} from "lucide-react";
import { toast } from "sonner";

/**
 * Flashcard Decks List Page
 * Shows all user's flashcard decks with study options.
 */
export default function FlashcardsPage() {
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
      const message = err.response?.data?.message || "Failed to load flashcard decks";
      setError(message);
      toast.error("Error", { description: message });
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
          {totalDue} cards due
        </Badge>
      )}
      <Button onClick={handleCreateDeck} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Create Deck</span>
        <span className="sm:hidden">Create</span>
      </Button>
    </div>
  );

  return (
    <AiPageWrapper
      title="AI Flashcards"
      backHref="/dashboard"
      backLabel="Dashboard"
      headerActions={headerActions}
      feature="flashcards"
      showQuota={true}
      showNetworkStatus={true}
    >
      {/* Page Description */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Study vocabulary with spaced repetition
        </p>
      </div>

      {/* Quick Study Card */}
      {totalDue > 0 && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ready to study?</h3>
                <p className="text-muted-foreground">
                  You have <strong>{totalDue}</strong> cards due across{" "}
                  <strong>{dueDecks.length}</strong> deck
                  {dueDecks.length !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => {
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
              Start Study Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Tabs */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search decks..."
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
              All Decks ({decks.length})
            </TabsTrigger>
            <TabsTrigger value="due">
              Due for Review ({dueDecks.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Error State */}
      {error && (
        <AiErrorCard
          title="Failed to load decks"
          message={error}
          onRetry={loadDecks}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <AiLoadingState variant="studying" message="Loading your flashcard decks..." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
                ? "No matching decks found"
                : activeTab === "due"
                ? "No cards due for review"
                : "No flashcard decks yet"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchQuery
                ? "Try a different search term."
                : activeTab === "due"
                ? "Great job! You're all caught up. Check back later."
                : "Create your first deck or generate flashcards from a lesson to get started."}
            </p>
            {!searchQuery && activeTab === "all" && (
              <div className="flex gap-3">
                <Button onClick={handleCreateDeck}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deck
                </Button>
                <Button variant="outline" onClick={() => router.push("/courses")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Lessons
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deck Grid */}
      {!isLoading && !error && filteredDecks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onStudy={handleStudy}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </AiPageWrapper>
  );
}
