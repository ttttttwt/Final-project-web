"use client";

import { useState } from "react";
import { Lesson } from "@/types/lesson";
import { SpeakingAssessmentResponse } from "@/types/speaking";
import { AudioRecorder } from "./AudioRecorder";
import { SpeakingScoreCard } from "./SpeakingScoreCard";
import lessonService from "@/services/lessonService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ChevronRight, Mic } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

import { SpeakingContent } from "@/types/lesson";

interface SpeakingLessonRendererProps {
    content: SpeakingContent;
    lessonId: number;
    onComplete?: () => void;
}

export function SpeakingLessonRenderer({ content, lessonId, onComplete }: SpeakingLessonRendererProps) {
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [assessment, setAssessment] = useState<SpeakingAssessmentResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const prompts = content.prompts || [];
    const currentPrompt = prompts[currentPromptIndex];

    const handleRecordingComplete = async (audioBlob: Blob) => {
        if (!currentPrompt) return;

        setIsProcessing(true);
        setError(null);
        setAssessment(null);

        try {
            // Use prompt text or ID if available. 
            // The backend expects an ID. If prompt object doesn't have ID, we might need to use index or add generated ID.
            // Assuming prompt has ID or we use index as fallback if backend supports it.
            // Actually backend controller uses promptId string. 
            // Let's assume we pass the index as ID if explicit ID is missing, or change backend to support index.
            // For now, let's pass index as string if no ID.
            const promptIdToSend = (currentPrompt as any).id || currentPromptIndex.toString();

            const result = await lessonService.assessSpeaking(
                lessonId,
                promptIdToSend,
                audioBlob
            );
            setAssessment(result);

            // If score is good enough (e.g. > 60), mark as possible to continue
            // But for now we just show results
            if (result.overallScore < 50) {
                toast.warning("Keep practicing! Try to speak clearly and use target vocabulary.");
            } else {
                toast.success("Great job! Assessment complete.");
            }

        } catch (err: unknown) {
            console.error("Assessment failed:", err);
            let msg = "Failed to assess speaking. Please try again.";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            }
            setError(msg);
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNextPrompt = () => {
        setAssessment(null);
        setError(null);
        if (currentPromptIndex < prompts.length - 1) {
            setCurrentPromptIndex(prev => prev + 1);
        } else {
            if (onComplete) onComplete();
        }
    };

    const isLastPrompt = currentPromptIndex === prompts.length - 1;

    if (!currentPrompt) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Content Error</h3>
                <p className="text-muted-foreground">
                    No speaking prompts found for this lesson.
                </p>
                <Button onClick={() => onComplete && onComplete()} className="mt-6">
                    Return to Course
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Prompt Card */}
            <Card className="border-l-4 border-l-blue-500 shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-2">Speaking Challenge {currentPromptIndex + 1}/{prompts.length}</CardTitle>
                            <CardDescription className="text-lg">
                                Read the prompt and record your answer.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed">
                        <h3 className="text-xl font-medium leading-relaxed text-gray-800 dark:text-gray-100">
                            {currentPrompt.prompt}
                        </h3>
                        {currentPrompt.context && (
                            <p className="mt-3 text-sm text-muted-foreground italic">
                                Context: {currentPrompt.context}
                            </p>
                        )}
                    </div>

                    {/* Target Requirements Hint */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {currentPrompt.targetVocabulary && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-orange-600">Target Usage:</span>
                                Use vocabulary related to the topic.
                            </div>
                        )}
                        {currentPrompt.targetGrammar && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-purple-600">Grammar Focus:</span>
                                Pay attention to sentence structure.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recording Area or Results */}
            {assessment ? (
                <div className="space-y-6">
                    <SpeakingScoreCard assessment={assessment} />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setAssessment(null)}>
                            Try Again
                        </Button>
                        <Button onClick={handleNextPrompt} className="gap-2">
                            {isLastPrompt ? "Finish Lesson" : "Next Topic"}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                    <div className="mb-8 text-center space-y-2">
                        <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
                            <Mic className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold">Your Turn</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Tap the microphone when you're ready to speak. Try to speak clearly and continuously.
                        </p>
                    </div>

                    <AudioRecorder
                        onRecordingComplete={handleRecordingComplete}
                        isProcessing={isProcessing}
                    />

                    {isProcessing && (
                        <p className="mt-6 text-sm text-muted-foreground animate-pulse">
                            Analyzing your speech with AI used to take a few seconds...
                        </p>
                    )}

                    {error && (
                        <Alert variant="destructive" className="mt-6 max-w-md">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

        </div>
    );
}
