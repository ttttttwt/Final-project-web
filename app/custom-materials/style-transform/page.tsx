"use client";

import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { StyleTransformer } from "@/components/custom-materials/style-transform";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StyleTransformPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Library
          </Button>

          <StyleTransformer />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
