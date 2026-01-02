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
import { notificationPreferencesService, type NotificationPreferences } from "@/services/notificationPreferencesService";
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
import { useTranslation } from "@/lib/i18n";
import type { Locale } from "@/messages";

interface UserSettings {
  language: string;
  timezone: string;
  firstName: string;
  lastName: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  remindersEnabled: boolean;
  learningEnabled: boolean;
}

const LANGUAGES = [
  { value: "en", label: "English" },
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
  const { t, setLocale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    language: "en",
    timezone: "UTC",
    firstName: "",
    lastName: "",
  });
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    remindersEnabled: true,
    learningEnabled: true,
  });

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const [profile, notifPrefs] = await Promise.all([
        userService.getProfile(),
        notificationPreferencesService.getPreferences(),
      ]);
      setSettings({
        language: profile.language || "en",
        timezone: profile.timezone || "UTC",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
      });
      setNotifSettings({
        emailEnabled: notifPrefs.emailEnabled ?? true,
        remindersEnabled: notifPrefs.remindersEnabled ?? true,
        learningEnabled: notifPrefs.learningEnabled ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationPreference = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    try {
      // Optimistic update
      setNotifSettings((prev) => ({ ...prev, [key]: value }));

      const updatedPrefs = {
        emailEnabled: notifSettings.emailEnabled,
        remindersEnabled: notifSettings.remindersEnabled,
        learningEnabled: notifSettings.learningEnabled,
        [key]: value, // Override with new value
      };

      await notificationPreferencesService.updatePreferences(updatedPrefs);
      toast.success(t("settings.notificationPrefSaved"));
    } catch (error) {
      console.error("Failed to update preference:", error);
      toast.error(t("settings.failedToUpdatePref"));
      // Revert on error
      setNotifSettings((prev) => ({ ...prev, [key]: !value }));
    }
  };

  const updateProfileSetting = async (
    key: keyof UserSettings,
    value: string
  ) => {
    // Store current values before optimistic update to use in API call
    const currentSettings = { ...settings };

    try {
      // Optimistic update
      setSettings((prev) => ({ ...prev, [key]: value }));

      // If changing language, also update i18n locale
      if (key === "language" && (value === "en" || value === "vi")) {
        setLocale(value as Locale);
      }

      // Build update payload using current settings values
      // Ensure firstName and lastName are never empty strings
      const updatedProfile = {
        language: key === "language" ? value : currentSettings.language,
        timezone: key === "timezone" ? value : currentSettings.timezone,
        firstName: currentSettings.firstName,
        lastName: currentSettings.lastName,
      };

      // Validate required fields before sending
      // Removed validation to allow updating language even if name is missing
      /* if (!updatedProfile.firstName || !updatedProfile.lastName) {
        console.error("firstName or lastName is missing, re-fetching profile");
        await fetchSettings();
        toast.error(t("settings.completeProfileFirst"));
        return;
      } */

      await userService.updateProfile(updatedProfile);
      toast.success(t("common.settingSaved"));
    } catch (error) {
      console.error("Failed to update setting:", error);
      toast.error(t("common.failedToUpdate"));
      // Revert by re-fetching to ensure consistency
      fetchSettings();
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
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
                {t("settings.title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("settings.subtitle")}
              </p>
            </div>
          </div>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>{t("settings.appearance")}</CardTitle>
              </div>
              <CardDescription>
                {t("settings.appearanceDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">{t("settings.theme")}</Label>
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
                      {t("settings.themeLight")}
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
                      {t("settings.themeDark")}
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
                      {t("settings.themeSystem")}
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
                    {t("settings.currentlyUsing")}{" "}
                    <span className="font-medium">{currentTheme}</span> {t("settings.mode")}
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
                <CardTitle>{t("settings.languageRegion")}</CardTitle>
              </div>
              <CardDescription>
                {t("settings.languageRegionDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="space-y-3">
                <Label htmlFor="language" className="text-base font-medium">
                  {t("settings.language")}
                </Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    updateProfileSetting("language", value)
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
                  {t("settings.languageDesc")}
                </p>
              </div>

              {/* Timezone Selector - Hidden as requested
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <Label htmlFor="timezone" className="text-base font-medium">
                    {t("settings.timezone")}
                  </Label>
                </div>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    updateProfileSetting("timezone", value)
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
                  {t("settings.timezoneDesc")}
                </p>
              </div>
              */}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>{t("settings.notifications")}</CardTitle>
              </div>
              <CardDescription>
                {t("settings.notificationsDesc")}
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
                    {t("settings.emailNotifications")}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("settings.emailNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifSettings.emailEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationPreference("emailEnabled", checked)
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
                    {t("settings.lessonReminders")}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("settings.lessonRemindersDesc")}
                  </p>
                </div>
                <Switch
                  id="lesson-reminders"
                  checked={notifSettings.remindersEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationPreference("remindersEnabled", checked)
                  }
                />
              </div>

              <Separator />

              {/* Learning Progress Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="learning-notifications"
                    className="text-base font-medium cursor-pointer"
                  >
                    {t("settings.learningProgress")}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("settings.learningProgressDesc")}
                  </p>
                </div>
                <Switch
                  id="learning-notifications"
                  checked={notifSettings.learningEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationPreference("learningEnabled", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>{t("settings.security")}</CardTitle>
              </div>
              <CardDescription>
                {t("settings.securityDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
