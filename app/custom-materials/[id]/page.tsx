"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import {
  ProcessingStatus,
  useStatusPoller,
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
  const materialId = params.id as string;

  const {
    currentMaterial,
    isLoadingMaterial,
    error,
    fetchMaterial,
    clearCurrentMaterial,
  } = useCustomMaterialStore();

  const [activeTab, setActiveTab] = useState("vocabulary");

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

          {/* Content tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              {hasVocabulary && (
                <TabsTrigger value="vocabulary" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Vocabulary ({content.vocabulary?.length})
                </TabsTrigger>
              )}
              {hasQuiz && (
                <TabsTrigger value="quiz" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Quiz ({content.quiz?.length})
                </TabsTrigger>
              )}
              {hasSummary && (
                <TabsTrigger value="summary" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Summary
                </TabsTrigger>
              )}
              {hasShadowing && (
                <TabsTrigger value="shadowing" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Shadowing ({content.shadowing?.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Vocabulary Tab */}
            {hasVocabulary && (
              <TabsContent value="vocabulary" className="space-y-4">
                {content.vocabulary?.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-[#202124] dark:text-[#E8EAED]">
                              {item.term}
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
                          {item.contextNote && (
                            <p className="text-xs text-[#4285F4] mt-2">
                              💡 {item.contextNote}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}

            {/* Quiz Tab */}
            {hasQuiz && (
              <TabsContent value="quiz" className="space-y-4">
                {content.quiz?.map((question, idx) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Question {idx + 1}
                      </CardTitle>
                      <CardDescription>{question.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {question.type === "multiple_choice" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg border ${
                                optIdx === question.correctAnswer
                                  ? "border-[#4CAF50] bg-[#E8F5E9] dark:bg-[#4CAF50]/10"
                                  : "border-[#E0E0E0] dark:border-[#2E2E2E]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {optIdx === question.correctAnswer ? (
                                  <Check className="h-4 w-4 text-[#4CAF50]" />
                                ) : (
                                  <X className="h-4 w-4 text-[#9AA0A6]" />
                                )}
                                <span>{option}</span>
                              </div>
                            </div>
                          ))}
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
                ))}
              </TabsContent>
            )}

            {/* Summary Tab */}
            {hasSummary && (
              <TabsContent value="summary">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-[#202124] dark:text-[#E8EAED] whitespace-pre-wrap">
                        {content.summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Shadowing Tab */}
            {hasShadowing && (
              <TabsContent value="shadowing" className="space-y-4">
                {content.shadowing?.map((sentence) => (
                  <Card key={sentence.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-lg text-[#202124] dark:text-[#E8EAED] mb-2">
                            {sentence.text}
                          </p>
                          {sentence.ipa && (
                            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                              /{sentence.ipa}/
                            </p>
                          )}
                          {sentence.translation && (
                            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] italic mt-1">
                              {sentence.translation}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
