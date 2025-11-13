"use client";

import * as React from "react";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";

/**
 * Progress Page
 *
 * View learning progress and statistics
 */
export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Progress">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#202124] dark:text-[#E8EAED] mb-2">
              Progress
            </h1>
            <p className="text-[#5F6368] dark:text-[#9AA0A6]">
              Track your learning journey and achievements
            </p>
          </div>

          {/* Placeholder Content */}
          <Card className="p-8 bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E] text-center">
            <p className="text-[#5F6368] dark:text-[#9AA0A6]">
              Progress tracking coming soon...
            </p>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
