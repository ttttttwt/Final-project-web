"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  GrammarExerciseSetDTO,
  GrammarAnswerDTO,
  GrammarAnswerItem,
  GrammarResultDTO,
} from "@/types/ai";
import { aiGrammarService } from "@/services/ai-grammar.service";
import {
  saveUserAnswers,
  getUserAnswers,
  clearUserAnswers,
} from "@/lib/grammarStorage";
import { ExerciseCard, ResultCard, PracticeTimer } from "@/components/ai/grammar";
import { AiPageWrapper } from "@/components/ai/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Info,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

type PageState = "loading" | "practice" | "submitting" | "results" | "error";

/**
 * Grammar Exercise Practice Page
 * Displays exercises and allows users to submit answers.
 */
export default function GrammarPracticePage() {
  const router = useRouter();
  const params = useParams();
  const exerciseSetId = params.id as string;

  // Page state
  const [pageState, setPageState] = useState<PageState>("loading");
  const [error, setError] = useState<string | null>(null);

  // Exercise data
  const [exerciseSet, setExerciseSet] = useState<GrammarExerciseSetDTO | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<GrammarResultDTO | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Timer - use ref to avoid re-renders
  const timeSpentRef = useRef(0);
  const startTimeRef = useRef<number>(Date.now());

  // Navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [showRetryConfirmDialog, setShowRetryConfirmDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load exercise set
  useEffect(() => {
    const loadExerciseSet = async () => {
      try {
        setPageState("loading");

        // Check if already submitted
        const submitted = await aiGrammarService.hasSubmitted(exerciseSetId);
        if (submitted) {
          setHasSubmitted(true);
          // Load the previous result
          const progress = await aiGrammarService.getProgress(exerciseSetId);
          if (progress) {
            // We don't have full result data, so just show a message
            toast.info("You have already completed this exercise set");
          }
          // Clear any saved answers since already submitted
          clearUserAnswers();
        }

        const data = await aiGrammarService.getExerciseSet(exerciseSetId);
        setExerciseSet(data);

        // Restore saved answers if not submitted
        if (!submitted) {
          const savedData = getUserAnswers(exerciseSetId);
          if (savedData) {
            setUserAnswers(savedData.answers);
            setCurrentQuestionIndex(savedData.currentQuestionIndex);
            timeSpentRef.current = savedData.timeSpent;
            toast.info("Restored your previous progress");
          }
        }

        setPageState(submitted ? "results" : "practice");
        startTimeRef.current = Date.now();
      } catch (err: any) {
        const message = err.response?.data?.message || "Failed to load exercises";
        setError(message);
        setPageState("error");
      }
    };

    loadExerciseSet();
  }, [exerciseSetId]);

  // Auto-save answers to localStorage
  useEffect(() => {
    if (pageState === "practice" && Object.keys(userAnswers).length > 0) {
      saveUserAnswers(
        exerciseSetId,
        userAnswers,
        currentQuestionIndex,
        timeSpentRef.current
      );
    }
  }, [userAnswers, currentQuestionIndex, exerciseSetId, pageState]);

  // Warn before leaving page with unsaved answers
  useEffect(() => {
    const hasAnswers = Object.values(userAnswers).some(a => a !== undefined && a !== "");

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pageState === "practice" && hasAnswers) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [userAnswers, pageState]);

  // Handle timer time up
  const handleTimeUp = useCallback(() => {
    handleSubmitInternal(true);
  }, []);

  // Track elapsed time from timer component
  const handleTimeChange = useCallback((elapsed: number) => {
    timeSpentRef.current = elapsed;
  }, []);

  const handleAnswerChange = useCallback((questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  }, []);

  const handleSubmitInternal = async (autoSubmit = false) => {
    if (!exerciseSet) return;

    // Check for unanswered questions
    const unansweredCount = exerciseSet.exercises.filter(
      (_, idx) => userAnswers[idx] === undefined || userAnswers[idx] === ""
    ).length;

    if (!autoSubmit && unansweredCount > 0) {
      setShowSubmitDialog(true);
      return;
    }

    setShowSubmitDialog(false);
    setPageState("submitting");

    try {
      // Calculate time spent
      const totalTimeSpent = timeSpentRef.current || Math.round((Date.now() - startTimeRef.current) / 1000);

      // Build answer submission
      const answers: GrammarAnswerItem[] = exerciseSet.exercises.map((_, idx) => ({
        questionIndex: idx,
        answer: userAnswers[idx] ?? "",
        timeMs: Math.round((Date.now() - startTimeRef.current) / exerciseSet.exercises.length),
      }));

      const submission: GrammarAnswerDTO = {
        exerciseSetId,
        answers,
        totalTimeSeconds: totalTimeSpent,
      };

      const resultData = await aiGrammarService.submitAnswers(exerciseSetId, submission);

      // Clear saved answers on successful submit
      clearUserAnswers();

      setResult(resultData);
      setPageState("results");

      if (resultData.passed) {
        toast.success("Great job!", {
          description: `You scored ${resultData.percentage.toFixed(0)}%`,
        });
      } else {
        toast.info("Keep practicing!", {
          description: `You scored ${resultData.percentage.toFixed(0)}%. Try again to improve!`,
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to submit answers";
      toast.error("Submission failed", { description: message });
      setPageState("practice");
    }
  };


  // Wrapper to handle submit from UI (force = true to skip confirmation)
  const handleSubmit = useCallback((force: boolean = false) => {
    handleSubmitInternal(force);
  }, [exerciseSet, userAnswers]);

  const getAnsweredCount = (): number => {
    return Object.values(userAnswers).filter((a) => a !== undefined && a !== "").length;
  };

  // Handle retry - reset progress and reload
  const handleRetry = async () => {
    setIsResetting(true);
    try {
      await aiGrammarService.resetProgress(exerciseSetId);
      // Clear saved local data
      clearUserAnswers();
      toast.success("Progress reset successfully!", {
        description: "You can now retry this exercise.",
      });
      // Reload the page to start fresh
      window.location.reload();
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to reset progress";
      toast.error("Reset failed", { description: message });
    } finally {
      setIsResetting(false);
      setShowRetryDialog(false);
    }
  };

  // Handle retry during practice - check for unsaved answers first
  const handleRetryDuringPractice = () => {
    const hasAnswers = Object.values(userAnswers).some(a => a !== undefined && a !== "");
    if (hasAnswers) {
      setShowRetryConfirmDialog(true);
    } else {
      // No answers, just reset
      clearUserAnswers();
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      timeSpentRef.current = 0;
      startTimeRef.current = Date.now();
      toast.info("Exercise reset");
    }
  };

  // Confirm retry during practice - clears answers and restarts
  const confirmRetryDuringPractice = () => {
    clearUserAnswers();
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    timeSpentRef.current = 0;
    startTimeRef.current = Date.now();
    setShowRetryConfirmDialog(false);
    toast.success("Exercise reset!", {
      description: "You can start fresh now.",
    });
  };

  const navigateQuestion = (direction: "prev" | "next") => {
    if (!exerciseSet) return;

    if (direction === "prev" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (direction === "next" && currentQuestionIndex < exerciseSet.exercises.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Loading state
  if (pageState === "loading") {
    return (
      <AiPageWrapper
        title="AI Grammar"
        backHref="/ai/grammar"
        backLabel="Grammar"
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </AiPageWrapper>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <AiPageWrapper
        title="AI Grammar"
        backHref="/ai/grammar"
        backLabel="Grammar"
      >
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load Exercises</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </AiPageWrapper>
    );
  }

  // Results state (after submission or already submitted)
  if (pageState === "results" && (result || hasSubmitted)) {
    if (result) {
      return (
        <AiPageWrapper
          title="AI Grammar - Results"
          backHref="/ai/grammar"
          backLabel="Grammar"
        >
          {/* Result Card */}
          <ResultCard
            result={result}
            onRetry={() => window.location.reload()}
            onGoHome={() => router.push("/ai/grammar")}
          />

          {/* Detailed Feedback */}
          {exerciseSet && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold">Review Your Answers</h2>
              {exerciseSet.exercises.map((exercise, idx) => {
                const feedback = result.feedback.find((f) => f.questionIndex === idx);
                return (
                  <ExerciseCard
                    key={idx}
                    exercise={exercise}
                    index={idx}
                    userAnswer={feedback?.userAnswer}
                    onAnswerChange={() => { }}
                    showResult={true}
                    isCorrect={feedback?.correct}
                    disabled={true}
                  />
                );
              })}
            </div>
          )}
        </AiPageWrapper>
      );
    }

    // Already submitted but no result loaded
    return (
      <AiPageWrapper
        title="AI Grammar"
        backHref="/ai/grammar"
        backLabel="Grammar"
      >
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Already Completed</h2>
            <p className="text-muted-foreground mb-6">
              You have already submitted answers for this exercise set.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/ai/grammar")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Grammar
              </Button>
              <Button onClick={() => setShowRetryDialog(true)} disabled={isResetting}>
                <RefreshCw className={cn("w-4 h-4 mr-2", isResetting && "animate-spin")} />
                Retry Exercise
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Retry Confirmation Dialog */}
        <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Retry this exercise?</AlertDialogTitle>
              <AlertDialogDescription>
                Your previous progress for this exercise will be deleted. You will start fresh
                and can submit a new result. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRetry} disabled={isResetting}>
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset & Retry"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AiPageWrapper>
    );
  }

  // Practice state
  return (
    <AiPageWrapper
      title={exerciseSet?.grammarPoint || "AI Grammar Practice"}
      backHref="/ai/grammar"
      backLabel="Grammar"
      showBackButton={true}
    >
      {/* Timer - isolated component to prevent re-renders */}
      <div className="mb-6">
        <PracticeTimer
          initialTimeSeconds={exerciseSet?.timeLimitSeconds ?? null}
          onTimeUp={handleTimeUp}
          onTimeChange={handleTimeChange}
          isActive={pageState === "practice"}
        />
      </div>

      {/* Exercise Info */}
      {exerciseSet && (
        <>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{exerciseSet.grammarPoint}</h1>
              <p className="text-muted-foreground">
                Level: {exerciseSet.cefrLevel}
                {exerciseSet.theme && ` • Theme: ${exerciseSet.theme}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryDuringPractice}
              className="flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm lại
            </Button>
          </div>


          {/* Explanation */}
          {exerciseSet.explanation && (
            <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Grammar Rule
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {exerciseSet.explanation.rule}
                    </p>
                    {exerciseSet.explanation.examples && exerciseSet.explanation.examples.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                          Examples:
                        </p>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          {exerciseSet.explanation.examples.slice(0, 2).map((ex, idx) => (
                            <li key={idx} className="italic">"{ex}"</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {exerciseSet.exercises.length}
              </span>
              <span className="text-muted-foreground">
                {getAnsweredCount()} / {exerciseSet.exercises.length} answered
              </span>
            </div>
            <Progress
              value={((currentQuestionIndex + 1) / exerciseSet.exercises.length) * 100}
              className="h-2"
            />

            {/* Question indicators */}
            <div className="flex flex-wrap gap-2 mt-3">
              {exerciseSet.exercises.map((_, idx) => {
                const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== "";
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={cn(
                      "w-8 h-8 rounded-full text-sm font-medium transition-all",
                      isCurrent && "ring-2 ring-primary ring-offset-2",
                      isAnswered
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Exercise */}
          <ExerciseCard
            exercise={exerciseSet.exercises[currentQuestionIndex]}
            index={currentQuestionIndex}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestionIndex, answer)}
            disabled={pageState === "submitting"}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => navigateQuestion("prev")}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === exerciseSet.exercises.length - 1 ? (
              <Button
                onClick={() => handleSubmit()}
                disabled={pageState === "submitting"}
                className="gap-2"
              >
                {pageState === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Answers
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={() => navigateQuestion("next")}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </>
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit with unanswered questions?</AlertDialogTitle>
            <AlertDialogDescription>
              You have{" "}
              {exerciseSet
                ? exerciseSet.exercises.length - getAnsweredCount()
                : 0}{" "}
              unanswered question(s). Unanswered questions will be marked as incorrect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit(true)}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Retry During Practice Confirmation Dialog */}
      <AlertDialog open={showRetryConfirmDialog} onOpenChange={setShowRetryConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc muốn làm lại bài tập?</AlertDialogTitle>
            <AlertDialogDescription>
              Kết quả hiện tại sẽ bị xóa và không thể khôi phục. Bạn có {getAnsweredCount()} câu trả lời chưa được lưu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRetryDuringPractice} className="bg-destructive hover:bg-destructive/90">
              Làm lại từ đầu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AiPageWrapper>
  );
}
