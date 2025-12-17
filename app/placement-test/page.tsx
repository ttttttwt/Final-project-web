"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { placementTestService } from "@/services/placementTestService";
import { PlacementQuestion, PlacementResult } from "@/types/placement-test";
import { Loader2, CheckCircle2, ArrowRight, Trophy, BookOpen } from "lucide-react";
import { toast } from "sonner";

type TestState = "welcome" | "loading" | "test" | "submitting" | "result";

export default function PlacementTestPage() {
  const router = useRouter();
  const [state, setState] = useState<TestState>("welcome");
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);

  const fetchQuestions = async () => {
    try {
      setState("loading");
      const data = await placementTestService.getQuestions();
      setQuestions(data);
      setState("test");
    } catch (error) {
      toast.error("Failed to load questions. Please try again.");
      setState("welcome");
    }
  };

  const handleAnswer = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    try {
      setState("submitting");
      const submission = {
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      };
      const data = await placementTestService.submitTest(submission);
      setResult(data);
      setState("result");
    } catch (error) {
      toast.error("Failed to submit test. Please try again.");
      setState("test");
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (state === "welcome") {
    return (
      <div className="container max-w-2xl mx-auto py-20 px-4">
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Check Your English Level</CardTitle>
            <CardDescription className="text-lg">
              Take our quick 5-minute placement test to find your current level and get a personalized learning path.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">15 Questions</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">~5 Minutes</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">Instant Results</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">Personalized Path</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-8">
            <Button size="lg" className="w-full text-lg h-12" onClick={fetchQuestions}>
              Start Test Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (state === "loading" || state === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">
          {state === "loading" ? "Preparing your test..." : "Analyzing your results..."}
        </p>
      </div>
    );
  }

  if (state === "result" && result) {
    return (
      <div className="container max-w-2xl mx-auto py-20 px-4">
        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
          <div className="bg-primary/5 p-8 text-center border-b border-primary/10">
            <div className="mx-auto w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl font-bold">{result.assignedLevel}</span>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Excellent Job!</CardTitle>
            <CardDescription className="text-lg">
              You have been placed at level <span className="font-bold text-primary">{result.assignedLevel}</span>
            </CardDescription>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Score</p>
                <p className="text-2xl font-bold">{result.score}/{result.totalQuestions}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                <p className="text-2xl font-bold">{Math.round((result.score / result.totalQuestions) * 100)}%</p>
              </div>
            </div>

            {result.assignedLearningPathName && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                  <BookOpen className="w-5 h-5" /> Recommended Path
                </h3>
                <p className="text-lg font-medium mb-4">{result.assignedLearningPathName}</p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push(`/learning-paths/${result.assignedLearningPathId}`)}
                >
                  View Learning Path
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30 p-6 flex gap-4">
            <Button variant="ghost" className="flex-1" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button className="flex-1" onClick={() => router.push("/learning-paths")}>
              Explore All Paths
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
              {currentQuestion.category}
            </span>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.content.split("_____").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block w-24 border-b-2 border-primary/30 mx-1"></span>
                )}
              </span>
            ))}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {[
              { value: "A", label: currentQuestion.optionA },
              { value: "B", label: currentQuestion.optionB },
              { value: "C", label: currentQuestion.optionC },
              { value: "D", label: currentQuestion.optionD },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`option-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="flex-1 p-4 rounded-lg border-2 border-muted cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs font-medium peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary">
                      {option.value}
                    </div>
                    <span className="text-base">{option.label}</span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="border-t p-6 flex justify-between items-center bg-muted/10">
          <Button
            variant="ghost"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="min-w-[120px]"
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish Test" : "Next Question"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
