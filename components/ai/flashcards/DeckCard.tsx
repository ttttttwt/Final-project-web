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
  PlayCircle,
  ChevronRight,
  BookOpen,
  Sparkles,
  User,
  Clock,
  CheckCircle2,
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
        "group h-full flex flex-col xl:flex-row hover:shadow-lg transition-all duration-300 cursor-pointer border-2 overflow-hidden",
        hasDueCards
          ? "border-primary/30 hover:border-primary/60 bg-card"
          : "border-green-200/50 dark:border-green-900/20 bg-green-50/30 dark:bg-green-900/10 hover:border-green-300 dark:hover:border-green-800",
        className
      )}
      onClick={() => onView?.(deck)}>

      {/* Left side: Icon/Image area for XL, Top area for others */}
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center p-4 xl:w-48 xl:bg-muted/30",
        !hasDueCards && "xl:bg-green-50/50 dark:xl:bg-green-900/5"
      )}>
        <div className={cn(
          "w-16 h-16 xl:w-24 xl:h-24 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
          hasDueCards
            ? "bg-primary/10 text-primary group-hover:bg-primary/20"
            : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-900/50"
        )}>
          {hasDueCards ? (
            <Layers className="w-8 h-8 xl:w-12 xl:h-12" />
          ) : (
            <CheckCircle2 className="w-8 h-8 xl:w-12 xl:h-12" />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row min-w-0">
        <div className="flex-1 flex flex-col">
          <CardHeader className="pb-2 pt-4 px-4 xl:pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {deck.cefrLevel && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5",
                        CEFR_COLORS[deck.cefrLevel]
                      )}
                    >
                      {deck.cefrLevel}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] xl:text-xs gap-1 py-0 px-2 h-5 xl:h-6">
                    {SOURCE_ICONS[deck.sourceType]}
                    {SOURCE_LABELS[deck.sourceType]}
                  </Badge>
                  {hasDueCards ? (
                    <Badge
                      variant="default"
                      className="text-[10px] xl:text-xs bg-primary/10 text-primary border-primary/30 h-5 xl:h-6"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {deck.dueCount} due
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] xl:text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 h-5 xl:h-6"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className={cn(
                  "font-bold text-lg xl:text-2xl leading-tight group-hover:text-primary transition-colors line-clamp-1",
                  !hasDueCards && "text-muted-foreground group-hover:text-primary/80"
                )}>
                  {deck.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 xl:line-clamp-1 max-w-2xl">
                  {deck.description || "\u00A0"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-4 px-4 space-y-4 flex-1">
            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 xl:gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{deck.cardCount} cards</span>
              </div>
              {/* Show next review time - more prominent for completed decks */}
              {deck.nextReview && (
                <div className={cn(
                  "flex items-center gap-2",
                  !hasDueCards && "text-green-600 dark:text-green-400 font-medium"
                )}>
                  <Clock className={cn(
                    "w-4 h-4",
                    hasDueCards ? "text-muted-foreground" : "text-green-500"
                  )} />
                  <span className={hasDueCards ? "text-muted-foreground" : ""}>
                    Next review: {formatDistanceToNow(new Date(deck.nextReview), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {/* Mastery progress */}
            {deck.masteryLevel !== undefined && (
              <div className="space-y-2 max-w-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider font-semibold">Mastery Level</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{masteryPercent}%</span>
                    <MasteryIndicator level={deck.masteryLevel} size="sm" />
                  </div>
                </div>
                <Progress value={masteryPercent} className="h-2 rounded-full" />
              </div>
            )}
          </CardContent>
        </div>

        <CardFooter className="p-4 xl:p-6 flex items-center gap-3 mt-auto xl:mt-0 xl:border-l xl:border-dashed xl:bg-muted/5 min-w-[180px]">
          <Button
            variant={hasDueCards ? "default" : "outline"}
            className="flex-1 xl:h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all px-6"
            onClick={(e) => {
              e.stopPropagation();
              onStudy(deck);
            }}
            disabled={isLoading}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Study{hasDueCards ? ` (${deck.dueCount})` : ""}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xl:w-12 xl:h-12 rounded-full border border-border"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(deck);
            }}
            aria-label="View deck details"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

/**
 * Skeleton loader for DeckCard
 */
export function DeckCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse h-full flex flex-col", className)}>
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
