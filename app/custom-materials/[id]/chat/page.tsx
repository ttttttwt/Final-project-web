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

/**
 * Material Chat Page - Role-play practice interface
 */
export default function MaterialChatPage() {
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

  // Check if material is completed
  if (currentMaterial.status !== "COMPLETED") {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-[#5F6368] mb-4">
                  This material is still processing. Please wait until it&apos;s ready.
                </p>
                <Button asChild>
                  <Link href={`/custom-materials/${materialId}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    View Material
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
  const hasRolePlay = currentMaterial.generatedContent?.rolePlay;
  if (!hasRolePlay) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-[#5F6368] mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] mb-2">
                  Role-Play Not Available
                </h2>
                <p className="text-[#5F6368] dark:text-[#9AA0A6] mb-4">
                  This material doesn&apos;t have role-play practice enabled.
                  <br />
                  Create a new material with Role-Play mode selected.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href={`/custom-materials/${materialId}`}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      View Material
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/custom-materials">
                      Create New Material
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

  const rolePlay = currentMaterial.generatedContent!.rolePlay!;

  // Navigate back handler
  const handleBack = () => {
    router.push(`/custom-materials/${materialId}`);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-100px)]">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Button variant="ghost" asChild size="sm" className="mb-2">
                <Link href={`/custom-materials/${materialId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Material
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">
                {rolePlay.scenario}
              </h1>
              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                Your role: <strong>{rolePlay.yourRole}</strong> | AI role:{" "}
                <strong>{rolePlay.aiRole}</strong>
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="h-[calc(100%-80px)]">
            <MaterialChatInterface material={currentMaterial} onBack={handleBack} />
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
