"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import {
  SourceTypeSelector,
  FileDropzone,
  UrlInput,
  RawTextInput,
  InputMetadataForm,
  TargetOptionsSelector,
  SettingsPanel,
  ProcessingStatus,
  QuotaDisplay,
} from "@/components/custom-materials";
import {
  CustomMaterialSourceType,
  InputMetadata,
  TargetOption,
  AiCorrectionMode,
  CreateMaterialRequest,
} from "@/types/custom-materials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Sparkles,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

type Step = "source" | "input" | "config" | "processing";

/**
 * Custom Materials Upload Page
 * Multi-step wizard for creating new learning materials
 */
export default function NewCustomMaterialPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPro, isLoading: isLoadingSubscription } = useSubscriptionStore();
  const {
    quota,
    isLoadingQuota,
    isCreating,
    createError,
    processingStatus,
    fetchQuota,
    createMaterial,
    startPolling,
    stopPolling,
    clearError,
  } = useCustomMaterialStore();

  // Wizard state
  const [step, setStep] = useState<Step>("source");
  const [sourceType, setSourceType] = useState<CustomMaterialSourceType | null>(
    null
  );
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [inputMetadata, setInputMetadata] = useState<InputMetadata>({});
  const [title, setTitle] = useState("");
  const [targetOptions, setTargetOptions] = useState<TargetOption[]>([
    "VOCABULARY",
    "SUMMARY",
    "QUIZ",
  ]);
  const [aiCorrectionMode, setAiCorrectionMode] =
    useState<AiCorrectionMode>("POLITE");
  const [styleLearnMode, setStyleLearnMode] = useState(true);
  const [syncVocabToSrs, setSyncVocabToSrs] = useState(false);
  const [generateFlashcardImages, setGenerateFlashcardImages] = useState(false);

  // Created material ID for tracking
  const [createdMaterialId, setCreatedMaterialId] = useState<string | null>(
    null
  );

  // Fetch quota on mount
  useEffect(() => {
    if (isPro) {
      fetchQuota();
    }
  }, [isPro, fetchQuota]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Determine if input is valid for current source type
  const isInputValid = useCallback(() => {
    if (!sourceType) return false;

    switch (sourceType) {
      case "PDF":
      case "DOCX":
      case "IMAGE":
        return file !== null;
      case "YOUTUBE":
      case "WEBSITE":
        return sourceUrl.trim().length > 0;
      case "TEXT":
        return rawText.trim().length > 0 && rawText.length <= 5000;
      default:
        return false;
    }
  }, [sourceType, file, sourceUrl, rawText]);

  // Handle source type selection
  const handleSourceTypeSelect = (type: CustomMaterialSourceType) => {
    setSourceType(type);
    // Reset input state when changing source type
    setFile(null);
    setSourceUrl("");
    setRawText("");
    setInputMetadata({});
    setStep("input");
  };

  // Handle next step
  const handleNext = () => {
    if (step === "input" && isInputValid()) {
      // Auto-generate title from filename or URL if empty
      if (!title) {
        if (file) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        } else if (sourceUrl) {
          try {
            const url = new URL(sourceUrl);
            setTitle(url.hostname.replace("www.", ""));
          } catch {
            setTitle("My Material");
          }
        } else {
          setTitle("My Material");
        }
      }
      setStep("config");
    }
  };

  // Handle back
  const handleBack = () => {
    if (step === "source") {
      router.push("/custom-materials");
    } else if (step === "input") {
      setStep("source");
    } else if (step === "config") {
      setStep("input");
    } else if (step === "processing") {
      // Reset and start over
      setStep("source");
      setSourceType(null);
      setFile(null);
      setSourceUrl("");
      setRawText("");
      setTitle("");
      setCreatedMaterialId(null);
    }
  };

  // Handle create material
  const handleCreate = async () => {
    if (!sourceType) return;

    clearError();

    const request: CreateMaterialRequest = {
      title: title || "Untitled Material",
      sourceType,
      targetOptions,
      settings: {
        aiCorrectionMode,
        styleLearnMode,
        syncVocabToSrs,
        generateFlashcardImages,
      },
    };

    // Add source-specific fields
    if (sourceType === "YOUTUBE" || sourceType === "WEBSITE") {
      request.sourceUrl = sourceUrl;
    } else if (sourceType === "TEXT") {
      request.rawText = rawText;
    }

    // Add metadata if present
    if (Object.keys(inputMetadata).length > 0) {
      request.inputMetadata = inputMetadata;
    }

    const materialId = await createMaterial(request, file || undefined);

    if (materialId) {
      setCreatedMaterialId(materialId);
      setStep("processing");
      toast.success(t("customMaterials.processingStarted"));
      // Start polling for status updates
      startPolling(materialId, () => {
        toast.success(t("customMaterials.materialReady"));
      });
    } else {
      toast.error(t("customMaterials.failedToCreate"), {
        description: createError || t("common.tryAgain"),
      });
    }
  };

  // Handle view result
  const handleViewResult = () => {
    if (createdMaterialId) {
      router.push(`/custom-materials/${createdMaterialId}`);
    }
  };

  // Render premium gate for non-pro users
  if (!isLoadingSubscription && !isPro) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA000] flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{t("subscription.premiumFeature")}</CardTitle>
                <CardDescription className="text-base">
                  {t("customMaterials.premiumDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#4285F4]" />
                    <span>Upload any document or video</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#4285F4]" />
                    <span>AI generates vocabulary & quizzes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#4285F4]" />
                    <span>Practice with role-play scenarios</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/custom-materials">{t("customMaterials.backToLibrary")}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/pricing">{t("ai.common.upgrade")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                {t("customMaterials.createTitle")}
              </h1>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                {t("customMaterials.createDesc")}
              </p>
            </div>
          </div>

          {/* Quota display */}
          <QuotaDisplay
            quota={quota}
            isLoading={isLoadingQuota}
            className="mb-6"
          />

          {/* Step indicator */}
          {step !== "processing" && (
            <div className="flex items-center gap-2 mb-8">
              {["source", "input", "config"].map((s, idx) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s
                      ? "bg-[#4285F4] text-white"
                      : idx <
                        ["source", "input", "config"].indexOf(step as string)
                        ? "bg-[#4CAF50] text-white"
                        : "bg-[#E0E0E0] dark:bg-[#2E2E2E] text-[#9AA0A6]"
                      }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`w-12 h-0.5 ${idx <
                        ["source", "input", "config"].indexOf(step as string)
                        ? "bg-[#4CAF50]"
                        : "bg-[#E0E0E0] dark:bg-[#2E2E2E]"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Source Type Selection */}
          {step === "source" && (
            <Card>
              <CardContent className="pt-6">
                <SourceTypeSelector
                  value={sourceType}
                  onChange={handleSourceTypeSelect}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Input Content */}
          {step === "input" && sourceType && (
            <Card>
              <CardHeader>
                <CardTitle>{t("customMaterials.addContent")}</CardTitle>
                <CardDescription>
                  {sourceType === "PDF" && t("customMaterials.uploadPdf")}
                  {sourceType === "DOCX" && t("customMaterials.uploadDocx")}
                  {sourceType === "IMAGE" && t("customMaterials.uploadImage")}
                  {sourceType === "YOUTUBE" && t("customMaterials.pasteYoutube")}
                  {sourceType === "WEBSITE" && t("customMaterials.pasteWebsite")}
                  {sourceType === "TEXT" && t("customMaterials.pasteText")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File upload */}
                {(sourceType === "PDF" ||
                  sourceType === "DOCX" ||
                  sourceType === "IMAGE") && (
                    <FileDropzone
                      sourceType={sourceType}
                      file={file}
                      onFileSelect={setFile}
                    />
                  )}

                {/* URL input */}
                {(sourceType === "YOUTUBE" || sourceType === "WEBSITE") && (
                  <UrlInput
                    sourceType={sourceType}
                    value={sourceUrl}
                    onChange={setSourceUrl}
                  />
                )}

                {/* Raw text */}
                {sourceType === "TEXT" && (
                  <RawTextInput value={rawText} onChange={setRawText} />
                )}

                {/* Metadata form */}
                <InputMetadataForm
                  sourceType={sourceType}
                  metadata={inputMetadata}
                  onChange={setInputMetadata}
                />

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("common.back")}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isInputValid()}
                    className="flex-1"
                  >
                    {t("common.continue")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Configuration */}
          {step === "config" && (
            <div className="space-y-6">
              {/* Title input */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("customMaterials.nameMaterial")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("common.title")}</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("customMaterials.titlePlaceholder")}
                      maxLength={255}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Target options */}
              <Card>
                <CardContent className="pt-6">
                  <TargetOptionsSelector
                    value={targetOptions}
                    onChange={setTargetOptions}
                  />
                </CardContent>
              </Card>

              {/* Settings */}
              <SettingsPanel
                aiCorrectionMode={aiCorrectionMode}
                styleLearnMode={styleLearnMode}
                syncVocabToSrs={syncVocabToSrs}
                generateFlashcardImages={generateFlashcardImages}
                onAiCorrectionModeChange={setAiCorrectionMode}
                onStyleLearnModeChange={setStyleLearnMode}
                onSyncVocabToSrsChange={setSyncVocabToSrs}
                onGenerateFlashcardImagesChange={setGenerateFlashcardImages}
              />

              {/* Navigation */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("common.back")}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || targetOptions.length === 0}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>{t("customMaterials.generating")}</>)
                    : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t("customMaterials.generateContent")}
                      </>
                    )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === "processing" && processingStatus && (
            <ProcessingStatus
              status={processingStatus.status}
              progress={processingStatus.progress}
              errorMessage={processingStatus.errorMessage}
              onRetry={handleBack}
              onViewResult={handleViewResult}
            />
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
