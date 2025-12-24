"use client";

import { ShadowingScoreResponse, WordScore } from "@/types/custom-materials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Info,
  Trophy,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShadowingScoreCardProps {
  score: ShadowingScoreResponse;
  className?: string;
}

/**
 * Displays the result of a shadowing pronunciation assessment.
 * Features a score gauge, qualitative feedback, and word-level breakdown.
 */
export function ShadowingScoreCard({ score, className }: ShadowingScoreCardProps) {
  const { score: totalScore, feedback, phonemeBreakdown } = score;

  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s >= 85) return "text-green-600 dark:text-green-400";
    if (s >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (s: number) => {
    if (s >= 85) return "bg-green-100 dark:bg-green-900/30";
    if (s >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getScoreIcon = (s: number) => {
    if (s >= 85) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (s >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getProgressColor = (s: number) => {
    if (s >= 85) return "bg-green-500";
    if (s >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className={cn("overflow-hidden border-2", className)}>
      <CardHeader className={cn("pb-4", getScoreBg(totalScore))}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={cn("h-5 w-5", getScoreColor(totalScore))} />
            <CardTitle className="text-lg">Pronunciation Score</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-3xl font-bold", getScoreColor(totalScore))}>
              {totalScore}
            </span>
            <span className="text-muted-foreground font-medium">/ 100</span>
          </div>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full mt-2 overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000 ease-out", getProgressColor(totalScore))}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Feedback Section */}
        <div className="flex gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          <MessageSquare className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold mb-1">AI Feedback</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback}
            </p>
          </div>
        </div>

        {/* Word Breakdown Section */}
        {phonemeBreakdown && Object.keys(phonemeBreakdown).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Word-level Breakdown</h4>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {Object.entries(phonemeBreakdown).map(([key, wordScore]) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium cursor-help transition-colors",
                          wordScore.score >= 85 ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400" :
                          wordScore.score >= 60 ? "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400" :
                          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                        )}
                      >
                        {wordScore.word}
                        <span className="ml-1.5 opacity-60 text-xs">{wordScore.score}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px]">
                      <p className="font-semibold mb-1">{wordScore.word} ({wordScore.score}%)</p>
                      <p className="text-xs">{wordScore.note}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              * Hover over words to see specific pronunciation tips.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
