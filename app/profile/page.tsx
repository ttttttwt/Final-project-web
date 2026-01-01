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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProBadge } from "@/components/ui/ProBadge";
import { ProfileForm, AvatarUpload, AIUsageStats } from "@/components/profile";
import { userService } from "@/services/userService";
import { subscriptionService, Subscription } from "@/services/subscriptionService";
import { aiQuotaService } from "@/services/aiQuotaService";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Clock,
  Award,
  RotateCcw,
  CreditCard,
  Crown,
  Check,
  Sparkles,
} from "lucide-react";
import type { User } from "@/types/auth";
import type { UserAiQuota } from "@/types/ai";

/**
 * Profile Page
 *
 * View and edit user profile information
 */
export default function ProfilePage() {
  const { user, loadUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<typeof user>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [aiQuota, setAiQuota] = useState<UserAiQuota | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchSubscription();
    fetchAiQuota();
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

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionService.getStatus();
      setSubscription(data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  };

  const fetchAiQuota = async () => {
    try {
      const data = await aiQuotaService.getMyQuota();
      setAiQuota(data);
    } catch (error) {
      console.error("Failed to fetch AI quota:", error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsPortalLoading(true);
      const { url } = await subscriptionService.createPortalSession();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to open billing portal");
    } finally {
      setIsPortalLoading(false);
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs ml-2"
                        onClick={() => router.push("/placement-test")}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Retake Test
                      </Button>
                    </div>
                  )}

                  {!profileData.currentLevel && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/placement-test")}
                      >
                        <Award className="w-4 h-4 mr-2" /> Take Placement Test
                      </Button>
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

          {/* Subscription Card */}
          <Card className={subscription?.planType !== "FREE" && subscription?.status === "ACTIVE"
            ? "relative overflow-hidden border-2 border-[#FFB300] bg-gradient-to-br from-[#FFF8E1]/60 to-white dark:from-[#2E2E2E] dark:to-[#1E1E1E] shadow-lg pro-shimmer-enhanced"
            : ""
          }>
            {/* Decorative elements for Pro users */}
            {subscription?.planType !== "FREE" && subscription?.status === "ACTIVE" && (
              <>
                <div className="absolute top-3 right-3 opacity-20">
                  <Sparkles className="h-8 w-8 text-[#FFB300] pro-float" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-15">
                  <Sparkles className="h-5 w-5 text-[#FFD54F]" />
                </div>
              </>
            )}
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2">
                <CardTitle>Subscription Plan</CardTitle>
                {subscription?.planType !== "FREE" && subscription?.status === "ACTIVE" && (
                  <ProBadge size="md" pulse />
                )}
              </div>
              <CardDescription>Manage your billing and subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {subscription?.planType !== "FREE" ? (
                      <Crown className="h-5 w-5 text-[#FFB300]" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-semibold text-lg">
                      {subscription?.planType === "FREE" ? "Free Plan" : "Pro Plan"}
                    </span>
                    {subscription?.status === "ACTIVE" && subscription.planType !== "FREE" && (
                      <Badge className="bg-[#FFB300] text-[#5D4037] hover:bg-[#FFA000]">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.planType === "FREE"
                      ? "Upgrade to unlock unlimited usage and AI features."
                      : `Your plan renews on ${subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "..."}`
                    }
                  </p>
                </div>

                {subscription?.planType === "FREE" ? (
                  <Button onClick={() => router.push("/pricing")} className="bg-[#FFB300] text-[#5D4037] hover:bg-[#FFA000]">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleManageSubscription} disabled={isPortalLoading}>
                    {isPortalLoading ? "Loading..." : "Manage Subscription"}
                  </Button>
                )}
              </div>

              {/* Premium Features List - Only for Pro users */}
              {subscription?.planType !== "FREE" && subscription?.status === "ACTIVE" && (
                <div className="border-t border-[#FFB300]/30 pt-4">
                  <h4 className="text-sm font-semibold text-[#5D4037] dark:text-[#FFD54F] mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Premium Features Unlocked
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiQuota && [
                      `${aiQuota.roleplaySessionsLimit} AI Role Play Sessions/month`,
                      `${aiQuota.flashcardDecksLimit} AI Flashcard Decks/month`,
                      `${aiQuota.grammarExercisesLimit} AI Grammar Exercises/month`,
                      "Priority Support",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-[#FFB300]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiQuota && (
                <AIUsageStats
                  quota={aiQuota}
                  nextBillingDate={subscription?.currentPeriodEnd ?? undefined}
                />
              )}
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
