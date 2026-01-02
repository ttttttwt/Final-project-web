"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import {
  MaterialsGrid,
  MaterialFilters,
  QuotaDisplay,
} from "@/components/custom-materials";
import { CustomMaterialStatus } from "@/types/custom-materials";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

/**
 * Custom Materials Library Page - View and manage all custom materials
 */
export default function CustomMaterialsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    materials,
    totalMaterials,
    isLoadingList,
    quota,
    isLoadingQuota,
    error,
    fetchMaterials,
    fetchQuota,
    deleteMaterial,
    clearError,
  } = useCustomMaterialStore();

  const [statusFilter, setStatusFilter] = useState<
    CustomMaterialStatus | "ALL"
  >("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch materials on mount and when filter changes
  useEffect(() => {
    const params: { status?: CustomMaterialStatus } = {};
    if (statusFilter !== "ALL") {
      params.status = statusFilter;
    }
    fetchMaterials(params);
  }, [statusFilter, fetchMaterials]);

  // Fetch quota on mount
  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // Handle view material
  const handleView = useCallback(
    (id: string) => {
      router.push(`/custom-materials/${id}`);
    },
    [router]
  );

  // Handle chat with material
  const handleChat = useCallback(
    (id: string) => {
      router.push(`/custom-materials/${id}/chat`);
    },
    [router]
  );

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteMaterial(deleteId);
      toast.success(t("customMaterials.materialDeleted"));
      // Refresh the list
      const params: { status?: CustomMaterialStatus } = {};
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      fetchMaterials(params);
    } catch {
      toast.error(t("customMaterials.failedToDelete"));
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Handle create new
  const handleCreateNew = () => {
    router.push("/custom-materials/new");
  };

  // Calculate status counts
  const statusCounts = materials.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      acc.ALL = (acc.ALL || 0) + 1;
      return acc;
    },
    {} as Record<CustomMaterialStatus | "ALL", number>
  );

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                {t("customMaterials.title")}
              </h1>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                {t("customMaterials.materialsCreated", { count: totalMaterials })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchMaterials()}
                disabled={isLoadingList}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingList ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/custom-materials/style-transform")}
                className="gap-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-900/20"
              >
                <Sparkles className="h-4 w-4 text-blue-600" />
                {t("customMaterials.styleTransformer")}
              </Button>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("customMaterials.newMaterial")}
              </Button>
            </div>
          </div>

          {/* Quota display */}
          <QuotaDisplay
            quota={quota}
            isLoading={isLoadingQuota}
            className="mb-6"
          />

          {/* Filters */}
          <MaterialFilters
            value={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
            className="mb-6"
          />

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#FFEBEE] dark:bg-[#D32F2F]/10 border border-[#FFCDD2] dark:border-[#D32F2F]/30">
              <p className="text-[#D32F2F]">{error}</p>
              <Button
                variant="link"
                onClick={clearError}
                className="text-[#D32F2F] p-0 h-auto mt-2"
              >
                {t("customMaterials.dismiss")}
              </Button>
            </div>
          )}

          {/* Materials grid */}
          <MaterialsGrid
            materials={materials}
            isLoading={isLoadingList}
            onView={handleView}
            onChat={handleChat}
            onDelete={setDeleteId}
            onCreateNew={handleCreateNew}
            emptyMessage={
              statusFilter === "ALL"
                ? t("customMaterials.noMaterialsYet")
                : t("customMaterials.noStatusMaterials", { status: statusFilter.toLowerCase() })
            }
          />

          {/* Delete confirmation dialog */}
          <AlertDialog
            open={!!deleteId}
            onOpenChange={(open) => !open && setDeleteId(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("customMaterials.deleteMaterial")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("customMaterials.deleteConfirmDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {t("common.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C]"
                >
                  {isDeleting ? t("customMaterials.deleting") : t("customMaterials.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
