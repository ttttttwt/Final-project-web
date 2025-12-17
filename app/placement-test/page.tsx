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
import { Loader2, CheckCircle2, ArrowRight, Trophy, BookOpen, X, Sparkles, Target, Clock, Brain } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

type TestState = "welcome" | "loading" | "test" | "submitting" | "result";

export default function PlacementTestPage() {
  const router = useRouter();
  const [state, setState] = useState<TestState>("welcome");
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);

  useEffect(() => {
    if (state === "result") {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const random = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [state]);

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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4"
          onClick={() => router.push("/dashboard")}
        >
          <X className="w-6 h-6" />
        </Button>
        
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Discover Your Potential</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Check Your <span className="text-primary">English Level</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Take our quick 5-minute placement test to find your current level and get a personalized learning path tailored just for you.
            </p>
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={fetchQuestions}>
              Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <Card className="border-2 border-primary/5 shadow-2xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 grid gap-4">
              {[
                { icon: Target, title: "Accurate Assessment", desc: "15 questions covering grammar & vocabulary" },
                { icon: Clock, title: "Quick & Easy", desc: "Takes only about 5 minutes to complete" },
                { icon: Brain, title: "Smart Analysis", desc: "Instant results with detailed breakdown" },
                { icon: Trophy, title: "Personalized Path", desc: "Get a custom learning roadmap" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background border hover:border-primary/20 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (state === "loading" || state === "submitting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
        </div>
        <h2 className="mt-8 text-2xl font-semibold animate-pulse">
          {state === "loading" ? "Preparing your assessment..." : "Analyzing your results..."}
        </h2>
        <p className="text-muted-foreground mt-2">This will just take a moment</p>
      </div>
    );
  }

  if (state === "result" && result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="bg-primary text-primary-foreground p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/80" />
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-8">Assessment Complete!</h2>
                <div className="w-32 h-32 mx-auto bg-white text-primary rounded-full flex items-center justify-center text-5xl font-bold shadow-xl mb-6 ring-8 ring-white/20">
                  {result.assignedLevel}
                </div>
                <p className="text-xl font-medium opacity-90">
                  You have been placed at level <span className="font-bold bg-white/20 px-2 py-1 rounded">{result.assignedLevel}</span>
                </p>
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-muted/50 text-center border hover:border-primary/20 transition-colors">
                  <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-medium">Your Score</p>
                  <p className="text-4xl font-bold text-primary">{result.score}<span className="text-xl text-muted-foreground">/{result.totalQuestions}</span></p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/50 text-center border hover:border-primary/20 transition-colors">
                  <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-medium">Accuracy</p>
                  <p className="text-4xl font-bold text-primary">{Math.round((result.score / result.totalQuestions) * 100)}%</p>
                </div>
              </div>

              {result.assignedLearningPathName && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-8">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BookOpen className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Recommended Learning Path
                    </h3>
                    <p className="text-2xl font-bold mb-6">{result.assignedLearningPathName}</p>
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto shadow-lg shadow-primary/20"
                      onClick={() => router.push(`/learning-paths/${result.assignedLearningPathId}`)}
                    >
                      Start Learning Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="bg-muted/30 p-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button variant="ghost" onClick={() => router.push("/learning-paths")}>
                Browse All Paths
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-muted/10 py-8 px-4">
      <div className="container max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Placement Test</h2>
            <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                router.push("/dashboard");
              }
            }}
          >
            Exit Test <X className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-3 rounded-full" />
        </div>

        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8 pt-8 border-b border-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-background border shadow-sm text-xs font-semibold uppercase tracking-wider text-primary">
                {currentQuestion.category}
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl leading-relaxed font-medium">
              {currentQuestion.content.split("_____").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block min-w-[100px] border-b-2 border-primary/30 mx-2 relative top-1"></span>
                  )}
                </span>
              ))}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={handleAnswer}
              className="grid gap-4 md:grid-cols-2"
            >
              {[
                { value: "A", label: currentQuestion.optionA },
                { value: "B", label: currentQuestion.optionB },
                { value: "C", label: currentQuestion.optionC },
                { value: "D", label: currentQuestion.optionD },
              ].map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={`option-${option.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`option-${option.value}`}
                    className={cn(
                      "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-muted/50",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md",
                      "border-muted"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold mr-4 transition-colors",
                      answers[currentQuestion.id] === option.value 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {option.value}
                    </div>
                    <span className="text-lg font-medium">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          
          <CardFooter className="bg-muted/30 p-6 flex justify-between items-center border-t">
            <Button
              variant="ghost"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="text-muted-foreground"
            >
              Previous
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="min-w-[140px] shadow-lg shadow-primary/20"
            >
              {currentQuestionIndex === questions.length - 1 ? "Finish Test" : "Next Question"}
              {currentQuestionIndex !== questions.length - 1 && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
