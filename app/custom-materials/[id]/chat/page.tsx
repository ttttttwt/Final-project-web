"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import { MaterialChatInterface } from "@/components/custom-materials";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

/**
 * Material Chat Page - Role-play practice interface
 * Uses full-screen layout to match the existing Role Play feature.
 */
export default function MaterialChatPage() {
  const { t } = useTranslation();
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

  // Fetch material on mount
  useEffect(() => {
    if (materialId) {
      fetchMaterial(materialId);
    }
    return () => {
      clearCurrentMaterial();
    };
  }, [materialId, fetchMaterial, clearCurrentMaterial]);

  // Navigate back handler
  const handleBack = () => {
    router.push(`/custom-materials/${materialId}`);
  };

  // Loading state
  if (isLoadingMaterial) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-[600px] w-full" />
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

  // Check if material is completed
  if (currentMaterial.status !== "COMPLETED") {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-[#5F6368] mb-4">
                  {t("customMaterials.stillProcessing")}
                </p>
                <Button asChild>
                  <Link href={`/custom-materials/${materialId}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("customMaterials.viewMaterial")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Check if role-play is available
  const hasRolePlay = currentMaterial.generatedContent?.rolePlay
    || currentMaterial.generatedContent?.roleplay;
  if (!hasRolePlay) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-[#5F6368] mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] mb-2">
                  {t("customMaterials.roleplayNotAvailable")}
                </h2>
                <p className="text-[#5F6368] dark:text-[#9AA0A6] mb-4">
                  {t("customMaterials.roleplayNotAvailableDesc")}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href={`/custom-materials/${materialId}`}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t("customMaterials.viewMaterial")}
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/custom-materials/new">
                      {t("customMaterials.createNewMaterial")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // MaterialChatInterface now handles its own header and layout
  // Full-height layout without MainLayout wrapper for immersive chat experience
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-background">
        <MaterialChatInterface material={currentMaterial} onBack={handleBack} />
      </div>
    </ProtectedRoute>
  );
}
