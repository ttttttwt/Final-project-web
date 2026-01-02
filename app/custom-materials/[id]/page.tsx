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
  FilePreviewDialog,
  ShadowingScoreCard,
  InteractiveQuiz,
} from "@/components/custom-materials";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Download,
  ExternalLink,
  Eye,
  File,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

/**
 * Material Detail Page - View generated content
 */
export default function MaterialDetailPage() {
  const { t } = useTranslation();
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
    scoreShadowing,
    shadowingScores,
    isScoring,
    clearShadowingScore,
    isEditMode,
    setEditMode,
    updateContent,
  } = useCustomMaterialStore();

  const [activeTab, setActiveTab] = useState("vocabulary");
  const [localContent, setLocalContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isQuizPracticeMode, setIsQuizPracticeMode] = useState(false);

  // Initialize local content when material is loaded
  useEffect(() => {
    if (currentMaterial?.generatedContent) {
      setLocalContent(JSON.parse(JSON.stringify(currentMaterial.generatedContent)));
    }
  }, [currentMaterial]);

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
    if (content?.rolePlay || content?.roleplay) tabs.push("roleplay");
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

  // File preview dialog state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
  const handleToggleRecording = async (index: number, sentenceId: string) => {
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

    // Clear existing score when starting a new recording
    clearShadowingScore(sentenceId);

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

  // Handle shadowing scoring
  const handleScoreShadowing = async (index: number, sentenceId: string) => {
    const audioBlob = recordings.get(index);
    if (!audioBlob) {
      toast.error("Please record your voice first");
      return;
    }

    try {
      await scoreShadowing(materialId, sentenceId, audioBlob);
      toast.success(t("customMaterials.pronunciationAssessed"));
    } catch (err) {
      toast.error(t("customMaterials.assessmentFailed"));
    }
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
        toast.success(t("customMaterials.materialReady"));
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
                  {error || t("customMaterials.materialNotFound")}
                </p>
                <Button asChild>
                  <Link href="/custom-materials">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("customMaterials.backToLibrary")}
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
                <Link href="/custom-materials">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("customMaterials.backToLibrary")}
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
                <Link href="/custom-materials">
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
  const hasRolePlay = content?.rolePlay || content?.roleplay;
  const hasShadowing = content?.shadowing && content.shadowing.length > 0;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/custom-materials">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("customMaterials.backToLibrary")}
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

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-full border border-border/50">
                  <Switch
                    id="edit-mode"
                    checked={isEditMode}
                    onCheckedChange={setEditMode}
                  />
                  <Label htmlFor="edit-mode" className="text-sm font-medium cursor-pointer">
                    {t("customMaterials.manageContent")}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column layout: Content + Right Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Content display controlled by sidebar */}
              <div>
                {/* Original Source View */}
                {activeTab === "source" && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {currentMaterial.sourceType === "PDF" && <FileText className="h-5 w-5 text-[#EA4335]" />}
                          {currentMaterial.sourceType === "DOCX" && <File className="h-5 w-5 text-[#4285F4]" />}
                          {currentMaterial.sourceType === "IMAGE" && <ImageIcon className="h-5 w-5 text-[#34A853]" />}
                          {currentMaterial.sourceType === "TEXT" && <FileCode className="h-5 w-5 text-[#5F6368]" />}
                          {(currentMaterial.sourceType === "YOUTUBE" || currentMaterial.sourceType === "WEBSITE") && (
                            <ExternalLink className="h-5 w-5 text-[#9334EA]" />
                          )}
                          <h3 className="text-lg font-semibold">{t("customMaterials.originalSource")}</h3>
                        </div>
                        <Badge variant="outline">{currentMaterial.sourceType}</Badge>
                      </div>
                      <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                        {currentMaterial.sourceType === "TEXT"
                          ? t("customMaterials.viewOriginalText")
                          : currentMaterial.sourceType === "PDF"
                            ? t("customMaterials.pdfPreview")
                            : currentMaterial.sourceType === "DOCX"
                              ? t("customMaterials.wordDownload")
                              : currentMaterial.sourceType === "IMAGE"
                                ? t("customMaterials.imagePreview")
                                : t("customMaterials.externalLink")
                        }
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* TEXT content - show directly */}
                      {currentMaterial.sourceType === "TEXT" && currentMaterial.contentText && (
                        <div className="prose dark:prose-invert max-w-none">
                          <div className="p-4 bg-muted/30 rounded-lg border max-h-[500px] overflow-auto">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentMaterial.contentText}</p>
                          </div>
                        </div>
                      )}

                      {/* FILE types (PDF, DOCX, IMAGE) - show preview card with button */}
                      {(currentMaterial.sourceType === "PDF" ||
                        currentMaterial.sourceType === "DOCX" ||
                        currentMaterial.sourceType === "IMAGE") && (
                          <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/20 rounded-lg border-2 border-dashed">
                            <div className={`p-4 rounded-full mb-4 ${currentMaterial.sourceType === "PDF"
                              ? "bg-red-100 dark:bg-red-900/20"
                              : currentMaterial.sourceType === "DOCX"
                                ? "bg-blue-100 dark:bg-blue-900/20"
                                : "bg-green-100 dark:bg-green-900/20"
                              }`}>
                              {currentMaterial.sourceType === "PDF" && <FileText className="h-8 w-8 text-red-500" />}
                              {currentMaterial.sourceType === "DOCX" && <File className="h-8 w-8 text-blue-500" />}
                              {currentMaterial.sourceType === "IMAGE" && <ImageIcon className="h-8 w-8 text-green-500" />}
                            </div>
                            <h4 className="font-medium text-lg mb-1">
                              {currentMaterial.sourceType === "PDF" && t("customMaterials.pdfDocument")}
                              {currentMaterial.sourceType === "DOCX" && t("customMaterials.wordDocument")}
                              {currentMaterial.sourceType === "IMAGE" && t("customMaterials.imageFile")}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                              {currentMaterial.sourceType === "PDF"
                                ? t("customMaterials.clickToPreviewPdf")
                                : currentMaterial.sourceType === "DOCX"
                                  ? t("customMaterials.docxCannotPreview")
                                  : t("customMaterials.clickToViewImage")
                              }
                            </p>
                            <div className="flex gap-2">
                              <Button onClick={() => setIsPreviewOpen(true)} className="gap-2">
                                <Eye className="h-4 w-4" />
                                {currentMaterial.sourceType === "DOCX" ? t("customMaterials.downloadView") : t("customMaterials.preview")}
                              </Button>
                            </div>
                          </div>
                        )}

                      {/* YOUTUBE or WEBSITE - show link */}
                      {(currentMaterial.sourceType === "YOUTUBE" || currentMaterial.sourceType === "WEBSITE") && (
                        <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/20 rounded-lg border-2 border-dashed">
                          <div className="p-4 rounded-full mb-4 bg-purple-100 dark:bg-purple-900/20">
                            <ExternalLink className="h-8 w-8 text-purple-500" />
                          </div>
                          <h4 className="font-medium text-lg mb-1">
                            {currentMaterial.sourceType === "YOUTUBE" ? t("customMaterials.youtubeVideo") : t("customMaterials.website")}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md break-all">
                            {(() => {
                              const metadata = currentMaterial.inputMetadata as Record<string, unknown> | undefined;
                              return metadata?.sourceUrl as string || currentMaterial.originalFileUrl || t("customMaterials.noUrlAvailable");
                            })()}
                          </p>
                          <Button
                            onClick={() => {
                              const metadata = currentMaterial.inputMetadata as Record<string, unknown> | undefined;
                              const url = (metadata?.sourceUrl as string) || currentMaterial.originalFileUrl;
                              if (url) window.open(url, "_blank", "noopener,noreferrer");
                            }}
                            className="gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t("customMaterials.openInNewTab")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Vocabulary */}
                {activeTab === "vocabulary" && (localContent?.vocabulary || content?.vocabulary) && (
                  <div className="space-y-4">
                    {(localContent?.vocabulary || content?.vocabulary)?.map((item: any, index: number) => {
                      const wordText = item.word || item.term || "";

                      if (isEditMode) {
                        return (
                          <Card key={item.id || `vocab-edit-${index}`} className="border-primary/20">
                            <CardContent className="pt-6 space-y-4">
                              <div className="flex items-start gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.word")}</Label>
                                    <Input
                                      value={wordText}
                                      onChange={(e) => {
                                        const newVocab = [...localContent.vocabulary];
                                        newVocab[index] = { ...newVocab[index], word: e.target.value };
                                        setLocalContent({ ...localContent, vocabulary: newVocab });
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.partOfSpeech")}</Label>
                                    <Input
                                      value={item.partOfSpeech || ""}
                                      onChange={(e) => {
                                        const newVocab = [...localContent.vocabulary];
                                        newVocab[index] = { ...newVocab[index], partOfSpeech: e.target.value };
                                        setLocalContent({ ...localContent, vocabulary: newVocab });
                                      }}
                                      placeholder={t("customMaterials.posPlaceholder")}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.ipa")}</Label>
                                    <Input
                                      value={item.ipa || ""}
                                      onChange={(e) => {
                                        const newVocab = [...localContent.vocabulary];
                                        newVocab[index] = { ...newVocab[index], ipa: e.target.value };
                                        setLocalContent({ ...localContent, vocabulary: newVocab });
                                      }}
                                      placeholder={t("customMaterials.ipaPlaceholder")}
                                    />
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                                  onClick={() => {
                                    const newVocab = localContent.vocabulary.filter((_: any, i: number) => i !== index);
                                    setLocalContent({ ...localContent, vocabulary: newVocab });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.definition")}</Label>
                                <Textarea
                                  value={item.definition || ""}
                                  onChange={(e) => {
                                    const newVocab = [...localContent.vocabulary];
                                    newVocab[index] = { ...newVocab[index], definition: e.target.value };
                                    setLocalContent({ ...localContent, vocabulary: newVocab });
                                  }}
                                  rows={2}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.exampleSentence")}</Label>
                                <Textarea
                                  value={item.example || ""}
                                  onChange={(e) => {
                                    const newVocab = [...localContent.vocabulary];
                                    newVocab[index] = { ...newVocab[index], example: e.target.value };
                                    setLocalContent({ ...localContent, vocabulary: newVocab });
                                  }}
                                  rows={2}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }

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

                    {isEditMode && (
                      <Button
                        variant="outline"
                        className="w-full border-dashed py-8 flex flex-col gap-2"
                        onClick={() => {
                          const newVocab = [...(localContent?.vocabulary || [])];
                          newVocab.push({
                            id: `new-${Date.now()}`,
                            word: "",
                            definition: "",
                            example: "",
                            partOfSpeech: "",
                            ipa: ""
                          });
                          setLocalContent({ ...localContent, vocabulary: newVocab });
                        }}
                      >
                        <Plus className="h-5 w-5" />
                        {t("customMaterials.addVocabularyItem")}
                      </Button>
                    )}
                  </div>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && (localContent?.quiz || content?.quiz) && (
                  <div className="space-y-4">
                    {/* Quiz Mode Header */}
                    {!isEditMode && (
                      <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full transition-colors",
                            isQuizPracticeMode ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">
                              {isQuizPracticeMode ? t("customMaterials.practiceMode") : t("customMaterials.reviewMode")}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {isQuizPracticeMode
                                ? t("customMaterials.hideAnswersTest")
                                : t("customMaterials.viewDirectly")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="quiz-practice-mode" className="text-xs font-medium cursor-pointer">
                            {t("customMaterials.practice")}
                          </Label>
                          <Switch
                            id="quiz-practice-mode"
                            checked={isQuizPracticeMode}
                            onCheckedChange={setIsQuizPracticeMode}
                          />
                        </div>
                      </div>
                    )}

                    {isQuizPracticeMode && !isEditMode ? (
                      <InteractiveQuiz questions={localContent?.quiz || content?.quiz} />
                    ) : (
                      (localContent?.quiz || content?.quiz)?.map((question: any, idx: number) => {
                        const correctAnswerValue = question.answer || question.correctAnswer;

                        if (isEditMode) {
                          return (
                            <Card key={question.id || `quiz-edit-${idx}`} className="border-primary/20">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{t("customMaterials.question")} {idx + 1}</CardTitle>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      const newQuiz = localContent.quiz.filter((_: any, i: number) => i !== idx);
                                      setLocalContent({ ...localContent, quiz: newQuiz });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.questionText")}</Label>
                                  <Textarea
                                    value={question.question || ""}
                                    onChange={(e) => {
                                      const newQuiz = [...localContent.quiz];
                                      newQuiz[idx] = { ...newQuiz[idx], question: e.target.value };
                                      setLocalContent({ ...localContent, quiz: newQuiz });
                                    }}
                                    rows={2}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.options")}</Label>
                                  <div className="space-y-2">
                                    {question.options?.map((option: string, optIdx: number) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${(typeof correctAnswerValue === 'string' ? option === correctAnswerValue : optIdx === correctAnswerValue)
                                            ? "bg-green-500 text-white"
                                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                                            }`}
                                          onClick={() => {
                                            const newQuiz = [...localContent.quiz];
                                            newQuiz[idx] = { ...newQuiz[idx], answer: option };
                                            setLocalContent({ ...localContent, quiz: newQuiz });
                                          }}
                                          title={t("customMaterials.markAsCorrect")}
                                        >
                                          {optIdx + 1}
                                        </div>
                                        <Input
                                          value={option}
                                          onChange={(e) => {
                                            const newQuiz = [...localContent.quiz];
                                            const newOptions = [...newQuiz[idx].options];
                                            newOptions[optIdx] = e.target.value;
                                            newQuiz[idx] = { ...newQuiz[idx], options: newOptions };
                                            setLocalContent({ ...localContent, quiz: newQuiz });
                                          }}
                                          className="flex-1"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                          onClick={() => {
                                            const newQuiz = [...localContent.quiz];
                                            const newOptions = newQuiz[idx].options.filter((_: any, i: number) => i !== optIdx);
                                            newQuiz[idx] = { ...newQuiz[idx], options: newOptions };
                                            setLocalContent({ ...localContent, quiz: newQuiz });
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full border-dashed text-xs h-8"
                                      onClick={() => {
                                        const newQuiz = [...localContent.quiz];
                                        const newOptions = [...(newQuiz[idx].options || [])];
                                        newOptions.push("");
                                        newQuiz[idx] = { ...newQuiz[idx], options: newOptions };
                                        setLocalContent({ ...localContent, quiz: newQuiz });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      {t("customMaterials.addOption")}
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.explanation")}</Label>
                                  <Textarea
                                    value={question.explanation || ""}
                                    onChange={(e) => {
                                      const newQuiz = [...localContent.quiz];
                                      newQuiz[idx] = { ...newQuiz[idx], explanation: e.target.value };
                                      setLocalContent({ ...localContent, quiz: newQuiz });
                                    }}
                                    rows={2}
                                    placeholder={t("customMaterials.explanationPlaceholder")}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }

                        return (
                          <Card key={question.id || `quiz-${idx}`}>
                            <CardHeader>
                              <CardTitle className="text-base">
                                {t("customMaterials.question")} {idx + 1}
                              </CardTitle>
                              <CardDescription>{question.question}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {/* Show options if available (multiple choice) */}
                              {question.options && question.options.length > 0 && (
                                <div className="space-y-2">
                                  {question.options.map((option: string, optIdx: number) => {
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
                                    <strong>{t("customMaterials.explanation")}:</strong> {question.explanation}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}

                    {isEditMode && (
                      <Button
                        variant="outline"
                        className="w-full border-dashed py-8 flex flex-col gap-2"
                        onClick={() => {
                          const newQuiz = [...(localContent?.quiz || [])];
                          newQuiz.push({
                            id: `new-quiz-${Date.now()}`,
                            question: "",
                            options: ["", ""],
                            answer: "",
                            explanation: ""
                          });
                          setLocalContent({ ...localContent, quiz: newQuiz });
                        }}
                      >
                        <Plus className="h-5 w-5" />
                        {t("customMaterials.addQuizQuestion")}
                      </Button>
                    )}
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === "summary" && (localContent?.summary || content?.summary) && (
                  <div>
                    <Card>
                      <CardContent className="pt-6">
                        {isEditMode ? (
                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.summaryContent")}</Label>
                            <Textarea
                              value={localContent.summary || ""}
                              onChange={(e) => setLocalContent({ ...localContent, summary: e.target.value })}
                              rows={10}
                              className="resize-none"
                            />
                          </div>
                        ) : (
                          <div className="prose dark:prose-invert max-w-none">
                            <p className="text-[#202124] dark:text-[#E8EAED] whitespace-pre-wrap">
                              {content?.summary}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Role-Play Tab */}
                {activeTab === "roleplay" && (localContent?.roleplay || content?.roleplay || localContent?.rolePlay || content?.rolePlay) && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-[#4285F4]" />
                          <h3 className="text-lg font-semibold">{t("customMaterials.roleplayScenario")}</h3>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isEditMode ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.scenario")}</Label>
                            <Textarea
                              value={localContent.roleplay?.scenario || localContent.rolePlay?.scenario || ""}
                              onChange={(e) => {
                                const key = localContent.roleplay ? 'roleplay' : 'rolePlay';
                                setLocalContent({
                                  ...localContent,
                                  [key]: { ...localContent[key], scenario: e.target.value }
                                });
                              }}
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.yourRole")}</Label>
                              <Input
                                value={localContent.roleplay?.yourRole || localContent.rolePlay?.yourRole || ""}
                                onChange={(e) => {
                                  const key = localContent.roleplay ? 'roleplay' : 'rolePlay';
                                  setLocalContent({
                                    ...localContent,
                                    [key]: { ...localContent[key], yourRole: e.target.value }
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.aiRole")}</Label>
                              <Input
                                value={localContent.roleplay?.aiRole || localContent.rolePlay?.aiRole || ""}
                                onChange={(e) => {
                                  const key = localContent.roleplay ? 'roleplay' : 'rolePlay';
                                  setLocalContent({
                                    ...localContent,
                                    [key]: { ...localContent[key], aiRole: e.target.value }
                                  });
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">{t("customMaterials.objectives")}</Label>
                            <div className="space-y-2">
                              {(localContent.roleplay?.objectives || localContent.rolePlay?.objectives || [])?.map((obj: string, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                  <Input
                                    value={obj}
                                    onChange={(e) => {
                                      const key = localContent.roleplay ? 'roleplay' : 'rolePlay';
                                      const newObjs = [...(localContent[key].objectives || [])];
                                      newObjs[i] = e.target.value;
                                      setLocalContent({
                                        ...localContent,
                                        [key]: { ...localContent[key], objectives: newObjs }
                                      });
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => {
                                      const key = localContent.roleplay ? 'roleplay' : 'rolePlay';
                                      const newObjs = localContent[key].objectives.filter((_: any, idx: number) => idx !== i);
                                      setLocalContent({
                                        ...localContent,
                                        [key]: { ...localContent[key], objectives: newObjs }
                                      });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed"
                                onClick={() => {
                                  const key = localContent.roleplay ? 'roleplay' : 'rolePlay';
                                  const newObjs = [...(localContent[key]?.objectives || [])];
                                  newObjs.push("");
                                  setLocalContent({
                                    ...localContent,
                                    [key]: { ...localContent[key], objectives: newObjs }
                                  });
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                {t("customMaterials.addObjective")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <h4 className="font-medium text-[#202124] dark:text-[#E8EAED]">{t("customMaterials.scenario")}</h4>
                            <p className="text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                              {content?.roleplay?.scenario || content?.rolePlay?.scenario}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("customMaterials.yourRole")}</span>
                              <p className="font-semibold text-lg mt-1">{content?.roleplay?.yourRole || content?.rolePlay?.yourRole}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("customMaterials.aiRole")}</span>
                              <p className="font-semibold text-lg mt-1">{content?.roleplay?.aiRole || content?.rolePlay?.aiRole}</p>
                            </div>
                          </div>

                          {((content?.roleplay?.objectives && content.roleplay.objectives.length > 0) ||
                            (content?.rolePlay?.objectives && content.rolePlay.objectives.length > 0)) && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-[#202124] dark:text-[#E8EAED]">{t("customMaterials.objectives")}</h4>
                                <ul className="list-disc list-inside space-y-1 text-[#5F6368] dark:text-[#9AA0A6]">
                                  {(content?.roleplay?.objectives || content?.rolePlay?.objectives)?.map((obj: string, i: number) => (
                                    <li key={i}>{obj}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          <Button asChild className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20">
                            <Link href={`/custom-materials/${materialId}/chat`}>
                              <MessageSquare className="h-5 w-5 mr-2" />
                              {t("customMaterials.startPracticeSession")}
                            </Link>
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Shadowing */}
                {activeTab === "shadowing" && (localContent?.shadowing || content?.shadowing) && (
                  <div className="space-y-4">
                    {(localContent?.shadowing || content?.shadowing)?.map((sentence: any, index: number) => {
                      // Handle both string format (new AI response) and object format (legacy)
                      const text = typeof sentence === "string" ? sentence : (sentence.sentence || sentence.text);
                      const phonetic = typeof sentence === "object" ? (sentence.phonetic || sentence.ipa) : undefined;
                      const notes = typeof sentence === "object" ? sentence.notes : undefined;
                      const translation = typeof sentence === "object" ? sentence.translation : undefined;
                      const sentenceId = (typeof sentence === "object" && sentence.id) ? sentence.id : `s-${index}`;

                      const score = shadowingScores[sentenceId];
                      const scoring = isScoring[sentenceId];

                      if (isEditMode) {
                        return (
                          <Card key={`shadow-edit-${index}`} className="border-primary/20">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Sentence {index + 1}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    const newShadowing = localContent.shadowing.filter((_: any, i: number) => i !== index);
                                    setLocalContent({ ...localContent, shadowing: newShadowing });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Sentence Text</Label>
                                <Textarea
                                  value={text || ""}
                                  onChange={(e) => {
                                    const newShadowing = [...localContent.shadowing];
                                    if (typeof newShadowing[index] === 'string') {
                                      newShadowing[index] = e.target.value;
                                    } else {
                                      newShadowing[index] = { ...newShadowing[index], sentence: e.target.value };
                                    }
                                    setLocalContent({ ...localContent, shadowing: newShadowing });
                                  }}
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase font-bold text-muted-foreground">Phonetic (IPA)</Label>
                                  <Input
                                    value={phonetic || ""}
                                    onChange={(e) => {
                                      const newShadowing = [...localContent.shadowing];
                                      if (typeof newShadowing[index] === 'string') {
                                        newShadowing[index] = { sentence: newShadowing[index], phonetic: e.target.value };
                                      } else {
                                        newShadowing[index] = { ...newShadowing[index], phonetic: e.target.value };
                                      }
                                      setLocalContent({ ...localContent, shadowing: newShadowing });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase font-bold text-muted-foreground">Translation</Label>
                                  <Input
                                    value={translation || ""}
                                    onChange={(e) => {
                                      const newShadowing = [...localContent.shadowing];
                                      if (typeof newShadowing[index] === 'string') {
                                        newShadowing[index] = { sentence: newShadowing[index], translation: e.target.value };
                                      } else {
                                        newShadowing[index] = { ...newShadowing[index], translation: e.target.value };
                                      }
                                      setLocalContent({ ...localContent, shadowing: newShadowing });
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Notes</Label>
                                <Input
                                  value={notes || ""}
                                  onChange={(e) => {
                                    const newShadowing = [...localContent.shadowing];
                                    if (typeof newShadowing[index] === 'string') {
                                      newShadowing[index] = { sentence: newShadowing[index], notes: e.target.value };
                                    } else {
                                      newShadowing[index] = { ...newShadowing[index], notes: e.target.value };
                                    }
                                    setLocalContent({ ...localContent, shadowing: newShadowing });
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }

                      return (
                        <div key={sentenceId} className="space-y-3">
                          <Card>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-lg text-[#202124] dark:text-[#E8EAED] mb-2">
                                    {text}
                                  </p>
                                  {phonetic && (
                                    <p className="text-sm font-mono text-[#5F6368] dark:text-[#9AA0A6] bg-muted/50 px-2 py-1 rounded inline-block">
                                      {phonetic}
                                    </p>
                                  )}
                                  {notes && (
                                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-2 italic">
                                      <strong>Note:</strong> {notes}
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
                                      onClick={() => handleToggleRecording(index, sentenceId)}
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

                              {/* Score Button */}
                              {recordings.has(index) && !score && (
                                <div className="mt-4 pt-4 border-t border-dashed">
                                  <Button
                                    onClick={() => handleScoreShadowing(index, sentenceId)}
                                    disabled={scoring}
                                    className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                                  >
                                    {scoring ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing Pronunciation...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-4 w-4" />
                                        Score My Pronunciation
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Score Result */}
                          {score && (
                            <ShadowingScoreCard score={score} className="animate-in fade-in slide-in-from-top-2 duration-500" />
                          )}
                        </div>
                      );
                    })}

                    {isEditMode && (
                      <Button
                        variant="outline"
                        className="w-full border-dashed py-8 flex flex-col gap-2"
                        onClick={() => {
                          const newShadowing = [...(localContent?.shadowing || [])];
                          newShadowing.push({
                            id: `new-shadow-${Date.now()}`,
                            sentence: "",
                            phonetic: "",
                            translation: "",
                            notes: ""
                          });
                          setLocalContent({ ...localContent, shadowing: newShadowing });
                        }}
                      >
                        <Plus className="h-5 w-5" />
                        Add Shadowing Sentence
                      </Button>
                    )}
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

          {/* File Preview Dialog */}
          <FilePreviewDialog
            open={isPreviewOpen}
            onOpenChange={setIsPreviewOpen}
            fileUrl={currentMaterial.originalFileUrl || null}
            sourceType={currentMaterial.sourceType}
            title={currentMaterial.title}
            contentText={currentMaterial.contentText}
          />
        </div>

        {/* Floating Save Bar */}
        {isEditMode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
            <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="py-3 px-6 flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Editing Mode</span>
                  <span className="text-xs text-muted-foreground">You have unsaved changes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(false);
                      setLocalContent(JSON.parse(JSON.stringify(currentMaterial?.generatedContent)));
                    }}
                    disabled={isSaving}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!materialId || !localContent) return;
                      setIsSaving(true);
                      try {
                        await updateContent(materialId, { generatedContent: localContent });
                        toast.success("Content updated successfully");
                        setEditMode(false);
                      } catch (err) {
                        toast.error("Failed to update content");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </MainLayout>
    </ProtectedRoute>
  );
}
