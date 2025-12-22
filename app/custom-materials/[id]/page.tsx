"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import {
  ProcessingStatus,
  useStatusPoller,
  ContentNavigationSidebar,
} from "@/components/custom-materials";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  FileText,
  MessageSquare,
  Mic,
  Volume2,
  FileCode,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/**
 * Material Detail Page - View generated content
 */
export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = params.id as string;

  const {
    currentMaterial,
    isLoadingMaterial,
    error,
    fetchMaterial,
    clearCurrentMaterial,
  } = useCustomMaterialStore();

  const [activeTab, setActiveTab] = useState("vocabulary");

  // Determine available tabs
  const availableTabs = useMemo(() => {
    if (!currentMaterial) return [];
    const content = currentMaterial.generatedContent;
    const tabs = [];

    // Check Original Source (TEXT materials can have this as a view)
    const metadata = currentMaterial.inputMetadata as Record<string, unknown> | undefined;
    const sourceUrl = metadata?.sourceUrl && typeof metadata.sourceUrl === "string" ? metadata.sourceUrl : null;
    const hasOriginalSource = !!(currentMaterial.originalFileUrl || sourceUrl || currentMaterial.contentText);
    if (hasOriginalSource) tabs.push("source");

    if (content?.vocabulary && content.vocabulary.length > 0) tabs.push("vocabulary");
    if (content?.quiz && content.quiz.length > 0) tabs.push("quiz");
    if (content?.summary) tabs.push("summary");
    if (content?.rolePlay) tabs.push("roleplay");
    if (content?.shadowing && content.shadowing.length > 0) tabs.push("shadowing");

    return tabs;
  }, [currentMaterial]);

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");

    if (tabFromUrl && availableTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (availableTabs.length > 0 && !tabFromUrl) {
      // Default to vocabulary if available, otherwise first available
      const defaultTab = availableTabs.includes("vocabulary") ? "vocabulary" : availableTabs[0];
      setActiveTab(defaultTab);
    }
  }, [availableTabs, searchParams]);

  // Handle tab change with URL update
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Update URL without full reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  };

  // Audio states for shadowing
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordings, setRecordings] = useState<Map<number, Blob>>(new Map());
  const [playingRecording, setPlayingRecording] = useState<number | null>(null);

  // Text-to-speech function
  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Text-to-speech handler for shadowing
  const handlePlayAudio = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (playingIndex === index) {
      // If already playing this one, stop it
      setPlayingIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Slightly slower for shadowing practice
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setPlayingIndex(index);
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => {
      setPlayingIndex(null);
      alert('Error playing audio');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Voice recording handler
  const handleToggleRecording = async (index: number) => {
    if (recordingIndex === index && mediaRecorder) {
      // Stop recording
      mediaRecorder.stop();
      setRecordingIndex(null);
      setRecordingTime(0);
      return;
    }

    if (recordingIndex !== null) {
      // Already recording another sentence
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });

        // Store recording for this index
        setRecordings(prev => new Map(prev).set(index, blob));

        // Auto-play the recorded audio
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setMediaRecorder(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingIndex(index);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  // Play recorded audio
  const handlePlayRecording = (index: number) => {
    const blob = recordings.get(index);
    if (!blob) return;

    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    audio.onplay = () => setPlayingRecording(index);
    audio.onended = () => setPlayingRecording(null);
    audio.onerror = () => setPlayingRecording(null);

    audio.play();
  };

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingIndex !== null) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingIndex]);

  // Fetch material on mount
  useEffect(() => {
    if (materialId) {
      fetchMaterial(materialId);
    }
    return () => {
      clearCurrentMaterial();
    };
  }, [materialId, fetchMaterial, clearCurrentMaterial]);

  // Poll status if not completed
  const shouldPoll =
    currentMaterial?.status === "PENDING" ||
    currentMaterial?.status === "PROCESSING";

  useStatusPoller({
    materialId,
    enabled: shouldPoll,
    onComplete: (status) => {
      if (status.status === "COMPLETED") {
        fetchMaterial(materialId);
        toast.success("Material is ready!");
      }
    },
  });

  // Loading state
  if (isLoadingMaterial) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-96" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error || !currentMaterial) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-[#D32F2F] mb-4">
                  {error || "Material not found"}
                </p>
                <Button asChild>
                  <Link href="/custom-materials/library">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Library
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Processing state
  if (shouldPoll) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link href="/custom-materials/library">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Link>
              </Button>
            </div>
            <ProcessingStatus
              status={currentMaterial.status}
              onRetry={() => router.push("/custom-materials")}
            />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Failed state
  if (currentMaterial.status === "FAILED") {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link href="/custom-materials/library">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Link>
              </Button>
            </div>
            <ProcessingStatus
              status="FAILED"
              errorMessage={currentMaterial.errorMessage}
              onRetry={() => router.push("/custom-materials")}
            />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const content = currentMaterial.generatedContent;
  const hasVocabulary = content?.vocabulary && content.vocabulary.length > 0;
  const hasQuiz = content?.quiz && content.quiz.length > 0;
  const hasSummary = content?.summary;
  const hasRolePlay = content?.rolePlay;
  const hasShadowing = content?.shadowing && content.shadowing.length > 0;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/custom-materials/library">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Link>
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                  {currentMaterial.title}
                </h1>
                <p className="text-[#5F6368] dark:text-[#9AA0A6] mt-1">
                  {currentMaterial.sourceType} •{" "}
                  {new Date(currentMaterial.createdAt).toLocaleDateString()}
                </p>
              </div>

              {hasRolePlay && (
                <Button asChild>
                  <Link href={`/custom-materials/${materialId}/chat`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Practice Role-Play
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Two-column layout: Content + Right Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Content display controlled by sidebar */}
              <div>
                {/* Original Source View */}
                {activeTab === "source" && currentMaterial.contentText && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-[#34A853]" />
                        <h3 className="text-lg font-semibold">Original Source</h3>
                      </div>
                      <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                        {currentMaterial.sourceType}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{currentMaterial.contentText}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Vocabulary */}
                {activeTab === "vocabulary" && hasVocabulary && (
                  <div className="space-y-4">
                    {content.vocabulary?.map((item, index) => {
                      const wordText = item.word || item.term || "";
                      return (
                        <Card key={item.id || `vocab-${index}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg text-[#202124] dark:text-[#E8EAED]">
                                    {wordText}
                                  </h3>
                                  {item.partOfSpeech && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.partOfSpeech}
                                    </Badge>
                                  )}
                                  {item.ipa && (
                                    <span className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                                      /{item.ipa}/
                                    </span>
                                  )}
                                </div>
                                <p className="text-[#202124] dark:text-[#E8EAED] mb-2">
                                  {item.definition}
                                </p>
                                {item.example && (
                                  <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] italic">
                                    &ldquo;{item.example}&rdquo;
                                  </p>
                                )}
                                {(item.context || item.contextNote) && (
                                  <p className="text-xs text-[#4285F4] mt-2">
                                    💡 {item.context || item.contextNote}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => speak(wordText)}
                                title={`Speak: ${wordText}`}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && hasQuiz && (
                  <div className="space-y-4">
                    {content.quiz?.map((question, idx) => {
                      // Handle both 'answer' (AI) and 'correctAnswer' (legacy) fields
                      const correctAnswerValue = question.answer || question.correctAnswer;

                      return (
                        <Card key={question.id || `quiz-${idx}`}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              Question {idx + 1}
                            </CardTitle>
                            <CardDescription>{question.question}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {/* Show options if available (multiple choice) */}
                            {question.options && question.options.length > 0 && (
                              <div className="space-y-2">
                                {question.options.map((option, optIdx) => {
                                  // Check if this option is the correct answer
                                  const isCorrect = typeof correctAnswerValue === 'string'
                                    ? option === correctAnswerValue
                                    : optIdx === correctAnswerValue;

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-3 rounded-lg border ${isCorrect
                                        ? "border-[#4CAF50] bg-[#E8F5E9] dark:bg-[#4CAF50]/10"
                                        : "border-[#E0E0E0] dark:border-[#2E2E2E]"
                                        }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isCorrect ? (
                                          <Check className="h-4 w-4 text-[#4CAF50]" />
                                        ) : (
                                          <X className="h-4 w-4 text-[#9AA0A6]" />
                                        )}
                                        <span>{option}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {question.explanation && (
                              <div className="mt-4 p-3 rounded-lg bg-[#E3F2FD] dark:bg-[#4285F4]/10">
                                <p className="text-sm text-[#1565C0] dark:text-[#90CAF9]">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === "summary" && hasSummary && (
                  <div>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-[#202124] dark:text-[#E8EAED] whitespace-pre-wrap">
                            {content.summary}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Shadowing */}
                {activeTab === "shadowing" && hasShadowing && (
                  <div className="space-y-4">
                    {content.shadowing?.map((sentence, index) => {
                      // Handle both string format (new AI response) and object format (legacy)
                      const text = typeof sentence === "string" ? sentence : sentence.text;
                      const ipa = typeof sentence === "object" ? sentence.ipa : undefined;
                      const translation = typeof sentence === "object" ? sentence.translation : undefined;
                      const id = typeof sentence === "object" ? sentence.id : undefined;

                      return (
                        <Card key={id || `shadowing-${index}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-lg text-[#202124] dark:text-[#E8EAED] mb-2">
                                  {text}
                                </p>
                                {ipa && (
                                  <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                                    /{ipa}/
                                  </p>
                                )}
                                {translation && (
                                  <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] italic mt-1">
                                    {translation}
                                  </p>
                                )}

                                {/* Recording timer */}
                                {recordingIndex === index && (
                                  <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium">
                                      Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePlayAudio(text, index)}
                                    disabled={recordingIndex !== null}
                                    className={playingIndex === index ? "bg-blue-100 dark:bg-blue-900" : ""}
                                    title="Play sentence"
                                  >
                                    <Volume2 className={`h-4 w-4 ${playingIndex === index ? "text-blue-600 animate-pulse" : ""}`} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleToggleRecording(index)}
                                    disabled={playingIndex !== null}
                                    className={recordingIndex === index ? "bg-red-100 dark:bg-red-900" : ""}
                                    title={recordingIndex === index ? "Stop recording" : "Start recording"}
                                  >
                                    <Mic className={`h-4 w-4 ${recordingIndex === index ? "text-red-600 animate-pulse" : ""}`} />
                                  </Button>
                                </div>

                                {/* Replay button - only show if there's a recording */}
                                {recordings.has(index) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePlayRecording(index)}
                                    disabled={recordingIndex !== null || playingIndex !== null}
                                    className={`w-full ${playingRecording === index ? "bg-green-100 dark:bg-green-900" : ""}`}
                                    title="Replay your recording"
                                  >
                                    <Volume2 className={`h-3 w-3 mr-1 ${playingRecording === index ? "text-green-600 animate-pulse" : ""}`} />
                                    <span className="text-xs">Replay</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Content Navigation */}
            <div className="w-full lg:w-80 lg:sticky lg:top-24 lg:self-start">
              <ContentNavigationSidebar
                currentMaterial={currentMaterial}
                isLoading={isLoadingMaterial}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
