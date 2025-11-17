"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForm, AvatarUpload } from "@/components/profile";
import { userService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Clock,
  Award,
} from "lucide-react";
import type { User } from "@/types/auth";

/**
 * Profile Page
 *
 * View and edit user profile information
 */
export default function ProfilePage() {
  const { user, loadUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<typeof user>(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<User>) => {
    try {
      setIsSaving(true);
      await userService.updateProfile(data);

      // Reload user data in auth store
      await loadUser();

      // Refresh profile data
      await fetchProfile();

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    // Update local state
    setProfileData((prev) =>
      prev ? { ...prev, avatarUrl: newAvatarUrl } : prev
    );

    // Reload user data in auth store to update avatar everywhere
    await loadUser();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !profileData) {
    return (
      <ProtectedRoute>
        <MainLayout showSidebar={true} pageTitle="Profile">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-48" />
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const fullName =
    profileData.fullName ||
    `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
    "User";

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Profile">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Avatar Upload Section */}
                <AvatarUpload
                  currentAvatarUrl={profileData.avatarUrl}
                  userName={fullName}
                  onAvatarUpdate={handleAvatarUpdate}
                />

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                      <Mail className="h-4 w-4" />
                      <span>{profileData.email}</span>
                    </div>
                  </div>

                  {profileData.currentLevel && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Current Level:
                      </span>
                      <Badge variant="secondary">
                        {profileData.currentLevel}
                      </Badge>
                    </div>
                  )}

                  {profileData.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {profileData.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {profileData.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{profileData.phoneNumber}</span>
                      </div>
                    )}
                    {profileData.timezone && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{profileData.timezone}</span>
                      </div>
                    )}
                    {profileData.language && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{profileData.language.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                user={profileData}
                onSubmit={handleSubmit}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>

          {/* Learning Goal Card */}
          {profileData.learningGoal && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {profileData.learningGoal}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
