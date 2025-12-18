"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  GrammarRequestDTO,
  GrammarExerciseSetDTO,
  GrammarProgressDTO,
  GrammarStatsDTO,
} from "@/types/ai";
import { aiGrammarService } from "@/services/ai-grammar.service";
import {
  saveGeneratedExercise,
  getGeneratedExercise,
  clearGeneratedExercise,
} from "@/lib/grammarStorage";
import {
  TopicSelector,
  ExerciseSetCard,
  ExerciseSetCardSkeleton,
  StatsPanel,
  StatsPanelSkeleton,
} from "@/components/ai/grammar";
import { AiPageWrapper, AiErrorCard, GrammarExerciseSkeleton, AiLoadingState } from "@/components/ai/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Sparkles,
  History,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  GraduationCap,
  ChevronRight,
  Trash2,
  Lock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useCefrLevelRestriction } from "@/hooks/useCefrLevelRestriction";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const THEMES = [
  { value: "workplace", label: "Workplace" },
  { value: "travel", label: "Travel" },
  { value: "daily-life", label: "Daily Life" },
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "academic", label: "Academic" },
];

/**
 * Grammar Practice Main Page
 * Allows users to generate grammar exercises or view their history.
 */
export default function GrammarPage() {
  const router = useRouter();
  const { userLevel, isAccessible, getWarning, allLevels, hasPlacementLevel } = useCefrLevelRestriction();
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated exercise set
  const [generatedSet, setGeneratedSet] = useState<GrammarExerciseSetDTO | null>(null);

  // Form state - default to user's level or A1 if not set
  const [formData, setFormData] = useState<GrammarRequestDTO>(() => ({
    grammarTopic: "",
    cefrLevel: (userLevel as "A1" | "A2" | "B1" | "B2" | "C1" | "C2") || "A1",
    theme: "workplace",
    exerciseCount: 5,
    timeLimitSeconds: 600,
  }));

  // Update form level when user level loads
  useEffect(() => {
    if (userLevel && !formData.grammarTopic) {
      setFormData((prev) => ({
        ...prev,
        cefrLevel: userLevel as typeof prev.cefrLevel,
      }));
    }
  }, [userLevel]);

  // History state
  const [history, setHistory] = useState<GrammarProgressDTO[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  // Stats state
  const [stats, setStats] = useState<GrammarStatsDTO | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load stats on initial render for consistent "Your Progress" display
  useEffect(() => {
    loadStats();
    // Restore saved generated exercise from localStorage
    const savedExercise = getGeneratedExercise();
    if (savedExercise) {
      setGeneratedSet(savedExercise);
      toast.info("Restored your previously generated exercise");
    }
  }, []);

  // Warn before leaving page with generated but not started exercise
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (generatedSet) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [generatedSet]);

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === "history" && history.length === 0) {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async (page = 0) => {
    setIsLoadingHistory(true);
    try {
      const response = await aiGrammarService.getHistory(page, 10);
      if (page === 0) {
        setHistory(response.content);
      } else {
        setHistory((prev) => [...prev, ...response.content]);
      }
      // Check if there are more pages based on totalPages
      setHasMoreHistory(page + 1 < response.totalPages);
      setHistoryPage(page);
    } catch (err: any) {
      toast.error("Failed to load history", {
        description: err.response?.data?.message || "Please try again",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await aiGrammarService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGenerateExercises = async () => {
    if (!formData.grammarTopic) {
      toast.error("Please select a grammar topic");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedSet(null);

    try {
      const exerciseSet = await aiGrammarService.generateExercises(formData);
      setGeneratedSet(exerciseSet);
      // Save to localStorage for persistence
      saveGeneratedExercise(exerciseSet);
      toast.success("Exercises generated!", {
        description: `${exerciseSet.exerciseCount} exercises on ${exerciseSet.grammarPoint}`,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to generate exercises";
      setError(message);
      toast.error("Generation failed", { description: message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartPractice = () => {
    if (generatedSet) {
      // Clear localStorage since user is starting the exercise
      clearGeneratedExercise();
      router.push(`/ai/grammar/${generatedSet.id}`);
    }
  };

  const handleClearGeneratedExercise = () => {
    clearGeneratedExercise();
    setGeneratedSet(null);
    toast.info("Generated exercise cleared");
  };

  return (
    <AiPageWrapper
      title="AI Grammar"
      backHref="/dashboard"
      backLabel="Dashboard"
      feature="grammar"
      showQuota={true}
      showNetworkStatus={true}
    >
      {/* Page Description */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Master English grammar with AI-generated exercises tailored to your level.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="generate" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Exercises
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Form Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Create Your Exercise Set
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CEFR Level */}
                <div className="space-y-2">
                  <Label htmlFor="cefr-level">
                    Your Level
                    {hasPlacementLevel && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Based on Placement Test: {userLevel})
                      </span>
                    )}
                  </Label>
                  <Select
                    value={formData.cefrLevel}
                    onValueChange={(value) => {
                      const warning = getWarning(value);
                      if (warning) {
                        toast.warning("Level above your current proficiency", {
                          description: warning,
                          duration: 5000,
                        });
                      }
                      setFormData((prev) => ({
                        ...prev,
                        cefrLevel: value as typeof prev.cefrLevel,
                        grammarTopic: "", // Reset topic when level changes
                      }));
                    }}
                  >
                    <SelectTrigger id="cefr-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allLevels.map((level) => {
                        const accessible = isAccessible(level);
                        return (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center gap-2">
                              {accessible ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Lock className="w-3 h-3 text-amber-500" />
                              )}
                              <span className={!accessible ? "text-muted-foreground" : ""}>
                                {level} -{" "}
                                {level === "A1"
                                  ? "Beginner"
                                  : level === "A2"
                                    ? "Elementary"
                                    : level === "B1"
                                      ? "Intermediate"
                                      : level === "B2"
                                        ? "Upper Intermediate"
                                        : level === "C1"
                                          ? "Advanced"
                                          : "Proficient"}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {!hasPlacementLevel && (
                    <p className="text-xs text-amber-600">
                      Take the Placement Test to get personalized level recommendations.
                    </p>
                  )}
                </div>

                {/* Grammar Topic */}
                <TopicSelector
                  value={formData.grammarTopic}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, grammarTopic: value }))
                  }
                  cefrLevel={formData.cefrLevel}
                />

                {/* Theme */}
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme (Optional)</Label>
                  <Select
                    value={formData.theme || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, theme: value || undefined }))
                    }
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {THEMES.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose a context for your exercises
                  </p>
                </div>

                {/* Exercise Count & Time */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-count">Number of Exercises</Label>
                    <Select
                      value={String(formData.exerciseCount || 5)}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          exerciseCount: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger id="exercise-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 exercises</SelectItem>
                        <SelectItem value="5">5 exercises</SelectItem>
                        <SelectItem value="10">10 exercises</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit</Label>
                    <Select
                      value={String(formData.timeLimitSeconds || 600)}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          timeLimitSeconds: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger id="time-limit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="600">10 minutes</SelectItem>
                        <SelectItem value="900">15 minutes</SelectItem>
                        <SelectItem value="0">No limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateExercises}
                  disabled={isGenerating || !formData.grammarTopic}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Exercises
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Exercise Preview */}
            <div className="space-y-6">
              {generatedSet ? (
                <Card className="border-2 border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Ready to Practice!</CardTitle>
                      {generatedSet.isFallback && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {generatedSet.grammarPoint}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Level: {generatedSet.cefrLevel}
                        {generatedSet.theme && ` • Theme: ${generatedSet.theme}`}
                      </p>
                    </div>

                    {/* Explanation Preview */}
                    {generatedSet.explanation && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Quick Rule:</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {generatedSet.explanation.rule}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {generatedSet.exerciseCount} exercises
                      </div>
                      {generatedSet.timeLimitSeconds && generatedSet.timeLimitSeconds > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor(generatedSet.timeLimitSeconds / 60)} min
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleStartPractice}
                      className="w-full gap-2"
                      size="lg"
                    >
                      Start Practice
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No Exercise Set Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate exercises to start practicing
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              {isLoadingStats ? (
                <StatsPanelSkeleton />
              ) : stats ? (
                <StatsPanel stats={stats} />
              ) : null}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* History List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Completed Exercises
              </h2>

              {isLoadingHistory && history.length === 0 ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <ExerciseSetCardSkeleton key={i} />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No History Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete some exercises to see your history
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("generate")}
                    >
                      Generate Exercises
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-4">
                    {history.map((progress) => (
                      <ExerciseSetCard
                        key={progress.id}
                        progress={progress}
                        onClick={() =>
                          router.push(`/ai/grammar/${progress.exerciseSetId}`)
                        }
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMoreHistory && (
                    <Button
                      variant="outline"
                      onClick={() => loadHistory(historyPage + 1)}
                      disabled={isLoadingHistory}
                      className="w-full"
                    >
                      {isLoadingHistory ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Stats Sidebar */}
            <div>
              {isLoadingStats ? (
                <StatsPanelSkeleton />
              ) : stats ? (
                <StatsPanel stats={stats} />
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AiPageWrapper>
  );
}
