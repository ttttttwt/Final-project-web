"use client";

import * as React from "react";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";

/**
 * Profile Page
 *
 * View and edit user profile information
 */
export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Profile">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#202124] dark:text-[#E8EAED] mb-2">
              Profile
            </h1>
            <p className="text-[#5F6368] dark:text-[#9AA0A6]">
              Manage your account information
            </p>
          </div>

          {/* Profile Information */}
          <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]">
            <h2 className="text-xl font-semibold text-[#202124] dark:text-[#E8EAED] mb-4">
              Account Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  Email
                </p>
                <p className="text-[#202124] dark:text-[#E8EAED]">
                  {user?.email}
                </p>
              </div>
              {user?.firstName && (
                <div>
                  <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                    First Name
                  </p>
                  <p className="text-[#202124] dark:text-[#E8EAED]">
                    {user.firstName}
                  </p>
                </div>
              )}
              {user?.lastName && (
                <div>
                  <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                    Last Name
                  </p>
                  <p className="text-[#202124] dark:text-[#E8EAED]">
                    {user.lastName}
                  </p>
                </div>
              )}
              {user?.currentLevel && (
                <div>
                  <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                    Current Level
                  </p>
                  <p className="text-[#202124] dark:text-[#E8EAED]">
                    {user.currentLevel}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
