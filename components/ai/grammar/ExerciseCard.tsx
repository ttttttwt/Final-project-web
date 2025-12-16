"use client";

import { cn } from "@/lib/utils";
import { GrammarExerciseDTO } from "@/types/ai";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface ExerciseCardProps {
  exercise: GrammarExerciseDTO;
  index: number;
  userAnswer?: any;
  onAnswerChange: (answer: any) => void;
  showResult?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Renders a single grammar exercise based on its type.
 * Supports: multiple_choice, fill_blank, transformation, error_correction.
 */
export function ExerciseCard({
  exercise,
  index,
  userAnswer,
  onAnswerChange,
  showResult = false,
  isCorrect,
  disabled = false,
  className,
}: ExerciseCardProps) {
  const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const typeLabels: Record<string, string> = {
    multiple_choice: "Multiple Choice",
    fill_blank: "Fill in the Blank",
    transformation: "Transformation",
    error_correction: "Error Correction",
  };

  const renderResultIcon = () => {
    if (!showResult) return null;
    if (isCorrect) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceExercise
            exercise={exercise}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            showResult={showResult}
            disabled={disabled}
          />
        );
      case "fill_blank":
        return (
          <FillBlankExercise
            exercise={exercise}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            showResult={showResult}
            disabled={disabled}
          />
        );
      case "transformation":
        return (
          <TransformationExercise
            exercise={exercise}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            showResult={showResult}
            disabled={disabled}
          />
        );
      case "error_correction":
        return (
          <ErrorCorrectionExercise
            exercise={exercise}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            showResult={showResult}
            disabled={disabled}
          />
        );
      default:
        return (
          <p className="text-muted-foreground">
            Unknown exercise type: {exercise.type}
          </p>
        );
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        showResult && isCorrect && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
        showResult && !isCorrect && "border-red-500/50 bg-red-50/50 dark:bg-red-950/20",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {index + 1}
            </span>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {typeLabels[exercise.type] || exercise.type}
              </Badge>
              <Badge
                variant="secondary"
                className={cn("text-xs", difficultyColors[exercise.difficulty])}
              >
                {exercise.difficulty}
              </Badge>
            </div>
          </div>
          {renderResultIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instruction */}
        <p className="text-sm text-muted-foreground italic">
          {exercise.instruction}
        </p>

        {/* Question */}
        <div className="space-y-4">
          <p className="font-medium text-base leading-relaxed">
            {exercise.question}
          </p>

          {renderExerciseContent()}
        </div>

        {/* Hint (shown before result) */}
        {!showResult && exercise.hint && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{exercise.hint}</p>
          </div>
        )}

        {/* Explanation (shown after result) */}
        {showResult && (
          <div className={cn(
            "flex items-start gap-2 p-3 rounded-lg",
            isCorrect ? "bg-green-100/50 dark:bg-green-900/20" : "bg-amber-100/50 dark:bg-amber-900/20"
          )}>
            <HelpCircle className={cn(
              "w-4 h-4 mt-0.5 flex-shrink-0",
              isCorrect ? "text-green-600" : "text-amber-600"
            )} />
            <div className="text-sm">
              <p className="font-medium mb-1">
                {isCorrect ? "Correct!" : `Correct answer: ${formatAnswer(exercise.correctAnswer)}`}
              </p>
              <p className="text-muted-foreground">{exercise.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Multiple choice exercise renderer.
 */
function MultipleChoiceExercise({
  exercise,
  userAnswer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  exercise: GrammarExerciseDTO;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
  showResult: boolean;
  disabled: boolean;
}) {
  const options = exercise.options || [];

  return (
    <RadioGroup
      value={userAnswer || ""}
      onValueChange={onAnswerChange}
      disabled={disabled}
      className="space-y-2"
    >
      {options.map((option, idx) => {
        const isSelected = userAnswer === option;
        const isCorrectOption = option === exercise.correctAnswer;
        const showCorrect = showResult && isCorrectOption;
        const showWrong = showResult && isSelected && !isCorrectOption;

        return (
          <div
            key={idx}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
              !showResult && "hover:bg-muted/50",
              !showResult && isSelected && "border-primary bg-primary/5",
              showCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
              showWrong && "border-red-500 bg-red-50 dark:bg-red-950/30",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <RadioGroupItem
              value={option}
              id={`option-${idx}`}
              disabled={disabled}
            />
            <Label
              htmlFor={`option-${idx}`}
              className={cn(
                "flex-1 cursor-pointer",
                disabled && "cursor-not-allowed"
              )}
            >
              {option}
            </Label>
            {showCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            {showWrong && <XCircle className="w-4 h-4 text-red-500" />}
          </div>
        );
      })}
    </RadioGroup>
  );
}

/**
 * Fill in the blank exercise renderer.
 */
function FillBlankExercise({
  exercise,
  userAnswer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  exercise: GrammarExerciseDTO;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
  showResult: boolean;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Input
        value={userAnswer || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer..."
        disabled={disabled}
        className={cn(
          showResult && userAnswer?.toLowerCase() === String(exercise.correctAnswer).toLowerCase() 
            && "border-green-500 focus-visible:ring-green-500",
          showResult && userAnswer?.toLowerCase() !== String(exercise.correctAnswer).toLowerCase() 
            && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
  );
}

/**
 * Transformation exercise renderer.
 */
function TransformationExercise({
  exercise,
  userAnswer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  exercise: GrammarExerciseDTO;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
  showResult: boolean;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Textarea
        value={userAnswer || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Rewrite the sentence..."
        disabled={disabled}
        rows={2}
        className={cn(
          "resize-none",
          showResult && userAnswer?.toLowerCase().trim() === String(exercise.correctAnswer).toLowerCase().trim() 
            && "border-green-500 focus-visible:ring-green-500",
          showResult && userAnswer?.toLowerCase().trim() !== String(exercise.correctAnswer).toLowerCase().trim() 
            && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
  );
}

/**
 * Error correction exercise renderer.
 */
function ErrorCorrectionExercise({
  exercise,
  userAnswer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  exercise: GrammarExerciseDTO;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
  showResult: boolean;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Textarea
        value={userAnswer || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Write the corrected sentence..."
        disabled={disabled}
        rows={2}
        className={cn(
          "resize-none",
          showResult && userAnswer?.toLowerCase().trim() === String(exercise.correctAnswer).toLowerCase().trim() 
            && "border-green-500 focus-visible:ring-green-500",
          showResult && userAnswer?.toLowerCase().trim() !== String(exercise.correctAnswer).toLowerCase().trim() 
            && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
  );
}

/**
 * Format answer for display.
 */
function formatAnswer(answer: any): string {
  if (typeof answer === "string") return answer;
  if (Array.isArray(answer)) return answer.join(", ");
  return String(answer);
}
