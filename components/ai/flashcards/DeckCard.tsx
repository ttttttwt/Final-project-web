"use client";

import { cn } from "@/lib/utils";
import { FlashcardDeckDTO } from "@/types/ai";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MasteryIndicator, MasteryBar } from "./MasteryIndicator";
import {
  Layers,
  Calendar,
  PlayCircle,
  ChevronRight,
  BookOpen,
  Sparkles,
  User,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DeckCardProps {
  deck: FlashcardDeckDTO;
  onStudy: (deck: FlashcardDeckDTO) => void;
  onView?: (deck: FlashcardDeckDTO) => void;
  isLoading?: boolean;
  className?: string;
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
  LESSON: <BookOpen className="w-3 h-3" />,
  AI_GENERATED: <Sparkles className="w-3 h-3" />,
  USER_CREATED: <User className="w-3 h-3" />,
};

const SOURCE_LABELS: Record<string, string> = {
  LESSON: "From Lesson",
  AI_GENERATED: "AI Generated",
  USER_CREATED: "Custom",
};

/**
 * DeckCard component for displaying flashcard deck in a list.
 * Shows title, CEFR level, card count, due count, and mastery progress.
 */
export function DeckCard({
  deck,
  onStudy,
  onView,
  isLoading = false,
  className,
}: DeckCardProps) {
  const hasDueCards = (deck.dueCount ?? 0) > 0;
  const masteryPercent = deck.masteryLevel
    ? Math.round((deck.masteryLevel / 5) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer border-2",
        hasDueCards
          ? "border-primary/30 hover:border-primary/60"
          : "hover:border-primary/50",
        className
      )}
      onClick={() => onView?.(deck)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {deck.cefrLevel && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-semibold",
                    CEFR_COLORS[deck.cefrLevel]
                  )}
                >
                  {deck.cefrLevel}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs gap-1">
                {SOURCE_ICONS[deck.sourceType]}
                {SOURCE_LABELS[deck.sourceType]}
              </Badge>
              {hasDueCards && (
                <Badge
                  variant="default"
                  className="text-xs bg-primary/10 text-primary border-primary/30"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {deck.dueCount} due
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {deck.title}
            </h3>

            {/* Description */}
            {deck.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {deck.description}
              </p>
            )}
          </div>

          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Layers className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{deck.cardCount} cards</span>
          </div>
          {deck.nextReview && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Next: {formatDistanceToNow(new Date(deck.nextReview), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Mastery progress */}
        {deck.masteryLevel !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mastery</span>
              <MasteryIndicator level={deck.masteryLevel} size="sm" />
            </div>
            <Progress value={masteryPercent} className="h-1.5" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex gap-2">
        <Button
          variant={hasDueCards ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onStudy(deck);
          }}
          disabled={isLoading}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Study{hasDueCards ? ` (${deck.dueCount})` : ""}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(deck);
          }}
          aria-label="View deck details"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Skeleton loader for DeckCard
 */
export function DeckCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="h-5 w-10 bg-muted rounded" />
              <div className="h-5 w-20 bg-muted rounded" />
            </div>
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
          <div className="w-10 h-10 rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="flex gap-4">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
        <div className="h-1.5 bg-muted rounded w-full" />
      </CardContent>
      <CardFooter className="pt-3">
        <div className="h-9 bg-muted rounded w-full" />
      </CardFooter>
    </Card>
  );
}
