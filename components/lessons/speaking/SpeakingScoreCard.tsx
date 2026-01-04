"use client";

import { SpeakingAssessmentResponse } from "@/types/speaking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Trophy, MessageSquare, Info, BookOpen, AlertTriangle, MicOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SpeakingScoreCardProps {
    assessment: SpeakingAssessmentResponse;
    className?: string;
}

export function SpeakingScoreCard({ assessment, className }: SpeakingScoreCardProps) {
    const {
        noSpeechDetected,
        transcription,
        overallScore,
        pronunciationScore,
        pronunciationFeedback,
        wordBreakdown,
        grammarFeedback,
        vocabularyFeedback
    } = assessment;

    // If no speech was detected, show a warning card
    if (noSpeechDetected || (transcription === "" && overallScore === 0)) {
        return (
            <Card className={cn("overflow-hidden border-2 border-amber-400", className)}>
                <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/40">
                            <MicOff className="h-8 w-8 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-amber-700 dark:text-amber-400">
                                No Speech Detected
                            </CardTitle>
                            <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                                We couldn&apos;t hear any speech in your recording
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <Alert variant="default" className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-700 dark:text-amber-400">Tips to improve</AlertTitle>
                        <AlertDescription className="text-amber-600 dark:text-amber-500">
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Make sure your microphone is working properly</li>
                                <li>Speak clearly and loudly enough</li>
                                <li>Check that the microphone isn&apos;t muted</li>
                                <li>Try moving closer to the microphone</li>
                                <li>Reduce background noise if possible</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                    
                    <div className="text-center py-4">
                        <p className="text-muted-foreground">
                            Please try recording again and speak clearly into your microphone.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Helpers for colors
    const getScoreColor = (s: number) => {
        if (s >= 80) return "text-green-600 dark:text-green-400";
        if (s >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreBg = (s: number) => {
        if (s >= 80) return "bg-green-100 dark:bg-green-900/30";
        if (s >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
        return "bg-red-100 dark:bg-red-900/30";
    };

    const getProgressColor = (s: number) => {
        if (s >= 80) return "bg-green-500";
        if (s >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card className={cn("overflow-hidden border-2", className)}>
            {/* Header - Overall Score */}
            <CardHeader className={cn("pb-4", getScoreBg(overallScore))}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className={cn("h-6 w-6", getScoreColor(overallScore))} />
                        <CardTitle className="text-xl">Speaking Score</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={cn("text-4xl font-bold", getScoreColor(overallScore))}>
                            {overallScore}
                        </span>
                        <span className="text-muted-foreground font-medium">/ 100</span>
                    </div>
                </div>

                {/* Simple Progress Bar */}
                <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-1000 ease-out", getProgressColor(overallScore))}
                        style={{ width: `${overallScore}%` }}
                    />
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-8">

                {/* 1. Pronunciation Section */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            Pronunciation
                        </h3>
                        <span className={cn("font-bold", getScoreColor(pronunciationScore))}>
                            {pronunciationScore}%
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        {pronunciationFeedback}
                    </p>

                    {/* Word Breakdown */}
                    {wordBreakdown && Object.keys(wordBreakdown).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            <TooltipProvider>
                                {Object.values(wordBreakdown).map((ws, idx) => (
                                    <Tooltip key={idx}>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "cursor-help transition-colors",
                                                    ws.score >= 80 ? "border-green-200 bg-green-50 text-green-700" :
                                                        ws.score >= 60 ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                                                            "border-red-200 bg-red-50 text-red-700"
                                                )}
                                            >
                                                {ws.word}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-semibold">{ws.word}: {ws.score}</p>
                                            {ws.note && <p className="text-xs text-muted-foreground">{ws.note}</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>
                    )}
                </section>

                {/* 2. Grammar Section */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-purple-500" />
                            Grammar
                        </h3>
                        <span className={cn("font-bold", getScoreColor(grammarFeedback.score))}>
                            {grammarFeedback.score}%
                        </span>
                    </div>

                    {grammarFeedback.suggestion && (
                        <p className="text-sm text-muted-foreground italic mb-2">
                            "{grammarFeedback.suggestion}"
                        </p>
                    )}

                    {grammarFeedback.issues.length > 0 ? (
                        <div className="space-y-2">
                            {grammarFeedback.issues.map((issue, idx) => (
                                <div key={idx} className="text-sm border-l-2 border-red-400 pl-3 py-1">
                                    <div className="flex items-center gap-2 text-red-600 font-medium">
                                        <span className="line-through opacity-70">{issue.originalText}</span>
                                        <span>→</span>
                                        <span>{issue.correction}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{issue.explanation}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-green-600 flex items-center gap-2">
                            <Info className="h-4 w-4" /> No target grammar issues found!
                        </div>
                    )}
                </section>

                {/* 3. Vocabulary Section */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-500" />
                            Vocabulary
                        </h3>
                        <span className={cn("font-bold", getScoreColor(vocabularyFeedback.score))}>
                            {vocabularyFeedback.score}%
                        </span>
                    </div>

                    {vocabularyFeedback.suggestion && (
                        <p className="text-sm text-muted-foreground italic mb-2">
                            "{vocabularyFeedback.suggestion}"
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {vocabularyFeedback.usedTargetWords.map((word, i) => (
                            <Badge key={i} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                                ✓ {word}
                            </Badge>
                        ))}
                        {vocabularyFeedback.missedWords.map((word, i) => (
                            <Badge key={i} variant="outline" className="text-muted-foreground border-dashed">
                                ○ {word}
                            </Badge>
                        ))}
                    </div>
                </section>

            </CardContent>
        </Card>
    );
}
