"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, RefreshCw, HelpCircle, Trophy, RotateCcw } from "lucide-react";
import { QuizQuestion } from "@/types/custom-materials";
import { cn } from "@/lib/utils";

interface InteractiveQuizProps {
  questions: QuizQuestion[];
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (qIdx: number, option: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const correctAnswer = q.answer || q.correctAnswer;
      if (userAnswers[idx] === correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const allAnswered = Object.keys(userAnswers).length === questions.length;

  return (
    <div className="space-y-6">
      {/* Quiz Header & Stats */}
      {isSubmitted && (
        <Card className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="py-6 flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-1">Practice Completed!</h3>
            <p className="text-muted-foreground mb-4">
              You scored <span className="text-primary font-bold">{score}</span> out of <span className="font-bold">{questions.length}</span>
            </p>
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, qIdx) => {
          const userAnswer = userAnswers[qIdx];
          const correctAnswer = question.answer || question.correctAnswer;
          const isCorrect = userAnswer === correctAnswer;
          const showFeedback = isSubmitted;

          return (
            <Card key={question.id || `interactive-quiz-${qIdx}`} className={cn(
              "transition-all duration-300 overflow-hidden",
              showFeedback && isCorrect && "border-green-500/50 bg-green-500/10 dark:bg-green-500/5 shadow-md shadow-green-500/10",
              showFeedback && !isCorrect && userAnswer && "border-red-500/50 bg-red-500/10 dark:bg-red-500/5 shadow-md shadow-red-500/10"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Question {qIdx + 1}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0 h-4 bg-primary/10 text-primary border-none">
                        {question.type?.replace('_', ' ') || 'multiple choice'}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold leading-snug">
                      {question.question}
                    </CardTitle>
                  </div>
                  {showFeedback && (
                    <div className={cn(
                      "p-1.5 rounded-full",
                      isCorrect ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                    )}>
                      {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {question.options?.map((option, optIdx) => {
                    const isSelected = userAnswer === option;
                    const isOptionCorrect = option === correctAnswer;

                    let variant: "outline" | "default" | "secondary" = "outline";
                    let className = "justify-start h-auto py-4 px-4 text-left whitespace-normal font-medium transition-all border-2";

                    if (isSelected && !showFeedback) {
                      variant = "default";
                    }

                    if (showFeedback) {
                      if (isOptionCorrect) {
                        className += " border-green-500 text-green-700 bg-green-50 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500";
                      } else if (isSelected && !isCorrect) {
                        className += " border-red-500 text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500";
                      } else {
                        className += " opacity-50";
                      }
                    }

                    return (
                      <Button
                        key={optIdx}
                        variant={variant}
                        className={className}
                        onClick={() => handleSelectOption(qIdx, option)}
                        disabled={isSubmitted}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold shrink-0 transition-colors",
                            isSelected && !showFeedback ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-muted-foreground/30",
                            showFeedback && isOptionCorrect && "bg-green-500 text-white border-green-500",
                            showFeedback && isSelected && !isCorrect && "bg-red-500 text-white border-red-500"
                          )}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 text-base">{option}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {showFeedback && question.explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Explanation</span>
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Actions */}
      {!isSubmitted && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-sm text-muted-foreground">
            {allAnswered
              ? "All questions answered! Ready to check?"
              : `${Object.keys(userAnswers).length} of ${questions.length} answered`}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length === 0}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            Check Answers
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
