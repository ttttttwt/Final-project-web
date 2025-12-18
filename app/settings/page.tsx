"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Globe,
  Clock,
  Bell,
  Palette,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { ChangePasswordForm } from "@/components/profile";

interface UserSettings {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  lessonReminders: boolean;
  weeklyReports: boolean;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
  { value: "vi", label: "Tiếng Việt" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh City (ICT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
];

/**
 * Settings Page
 *
 * Manage application preferences and notifications
 */
export default function SettingsPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    language: "en",
    timezone: "UTC",
    emailNotifications: true,
    lessonReminders: true,
    weeklyReports: false,
  });

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const profile = await userService.getProfile();
      setSettings({
        language: profile.language || "en",
        timezone: profile.timezone || "UTC",
        emailNotifications: true, // Placeholder
        lessonReminders: true, // Placeholder
        weeklyReports: false, // Placeholder
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Update language and timezone via profile API
      await userService.updateProfile({
        language: settings.language,
        timezone: settings.timezone,
      });

      // TODO: Update notification preferences when backend API is ready
      // await userService.updateNotificationSettings({
      //   emailNotifications: settings.emailNotifications,
      //   lessonReminders: settings.lessonReminders,
      //   weeklyReports: settings.weeklyReports,
      // });

      toast.success("Settings saved successfully!", {
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings", {
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`, {
      description: "Your theme preference has been saved.",
    });
  };

  const currentTheme = theme === "system" ? systemTheme : theme;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout showSidebar={true} pageTitle="Settings">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-48" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout showSidebar={true} pageTitle="Settings">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your preferences and notifications
              </p>
            </div>
          </div>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize how LEXIA looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Theme</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Light Theme */}
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`
                      relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                      ${theme === "light"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <div className="w-full h-20 rounded bg-white border border-gray-200 flex items-center justify-center">
                      <div className="text-gray-900 text-sm font-medium">
                        Aa
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Light
                    </span>
                    {theme === "light" && mounted && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Dark Theme */}
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`
                      relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                      ${theme === "dark"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <div className="w-full h-20 rounded bg-gray-900 border border-gray-700 flex items-center justify-center">
                      <div className="text-white text-sm font-medium">Aa</div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Dark
                    </span>
                    {theme === "dark" && mounted && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* System Theme */}
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`
                      relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                      ${theme === "system"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <div className="w-full h-20 rounded bg-gradient-to-r from-white via-gray-400 to-gray-900 border border-gray-300 flex items-center justify-center">
                      <div className="text-gray-700 text-sm font-medium">
                        Aa
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      System
                    </span>
                    {theme === "system" && mounted && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
                {mounted && theme === "system" && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently using:{" "}
                    <span className="font-medium">{currentTheme}</span> mode
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Language & Region Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Language & Region</CardTitle>
              </div>
              <CardDescription>
                Set your preferred language and timezone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="space-y-3">
                <Label htmlFor="language" className="text-base font-medium">
                  Language
                </Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will be used for course content and interface text
                </p>
              </div>

              <Separator />

              {/* Timezone Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <Label htmlFor="timezone" className="text-base font-medium">
                    Timezone
                  </Label>
                </div>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger id="timezone" className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Used for scheduling lessons and reminders
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive updates from LEXIA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="email-notifications"
                    className="text-base font-medium cursor-pointer"
                  >
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      emailNotifications: checked,
                    }))
                  }
                />
              </div>

              <Separator />

              {/* Lesson Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="lesson-reminders"
                    className="text-base font-medium cursor-pointer"
                  >
                    Lesson Reminders
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get reminders to complete your daily lessons
                  </p>
                </div>
                <Switch
                  id="lesson-reminders"
                  checked={settings.lessonReminders}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      lessonReminders: checked,
                    }))
                  }
                />
              </div>

              <Separator />

              {/* Weekly Reports */}
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="weekly-reports"
                    className="text-base font-medium cursor-pointer"
                  >
                    Weekly Progress Reports
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive a summary of your weekly learning progress
                  </p>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, weeklyReports: checked }))
                  }
                />
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> Notification preferences are currently
                  placeholders. Backend API integration required for full
                  functionality.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pb-8">
            <Button
              variant="outline"
              onClick={fetchSettings}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
