/**
 * Notification Settings Page
 *
 * Manage notification preferences and channels.
 */

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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notificationService } from "@/services/notificationService";
import { NotificationPreferences } from "@/types/notification";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  Smartphone,
  GraduationCap,
  Trophy,
  Clock,
  Megaphone,
  Save,
  Loader2,
  Moon,
} from "lucide-react";

// Timezone options
const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh City (ICT)" },
];

// Time options for quiet hours
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    inAppEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    learningEnabled: true,
    achievementsEnabled: true,
    remindersEnabled: true,
    systemEnabled: true,
    quietHoursStart: null,
    quietHoursEnd: null,
    quietHoursTimezone: "UTC",
  });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getPreferences();
      setPreferences(data);
      setQuietHoursEnabled(!!data.quietHoursStart && !!data.quietHoursEnd);
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
      toast.error("Failed to load notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const dataToSave = {
        ...preferences,
        quietHoursStart: quietHoursEnabled ? preferences.quietHoursStart : null,
        quietHoursEnd: quietHoursEnabled ? preferences.quietHoursEnd : null,
      };
      await notificationService.updatePreferences(dataToSave);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      toast.error("Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (
    key: keyof NotificationPreferences,
    value: boolean | string | null
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout showSidebar={true} pageTitle="Notification Settings">
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
      <MainLayout showSidebar={true} pageTitle="Notification Settings">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Notification Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage how and when you receive notifications
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Notification Channels */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle>Notification Channels</CardTitle>
                </div>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="inApp" className="font-medium">
                        In-App Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications in the app
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="inApp"
                    checked={preferences.inAppEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference("inAppEnabled", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email"
                    checked={preferences.emailEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference("emailEnabled", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <Smartphone className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <Label htmlFor="push" className="font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on mobile
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="push"
                    checked={preferences.pushEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference("pushEnabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Categories */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle>Notification Categories</CardTitle>
                </div>
                <CardDescription>
                  Select which types of notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-indigo-500/10">
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div>
                      <Label htmlFor="learning" className="font-medium">
                        Learning Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        New courses, lessons, and enrollments
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="learning"
                    checked={preferences.learningEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference("learningEnabled", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/10">
                      <Trophy className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <Label htmlFor="achievements" className="font-medium">
                        Achievements & Progress
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Badges, streaks, and level ups
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="achievements"
                    checked={preferences.achievementsEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference("achievementsEnabled", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-orange-500/10">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <Label htmlFor="reminders" className="font-medium">
                        Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Daily practice and streak reminders
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="reminders"
                    checked={preferences.remindersEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference("remindersEnabled", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-500/10">
                      <Megaphone className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <Label htmlFor="system" className="font-medium">
                        System Announcements
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Important updates and maintenance notices
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="system"
                    checked={preferences.systemEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference("systemEnabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle>Quiet Hours</CardTitle>
                </div>
                <CardDescription>
                  Pause notifications during specific hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="quietHours" className="font-medium">
                      Enable Quiet Hours
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mute notifications during specified times
                    </p>
                  </div>
                  <Switch
                    id="quietHours"
                    checked={quietHoursEnabled}
                    onCheckedChange={setQuietHoursEnabled}
                  />
                </div>

                {quietHoursEnabled && (
                  <>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Select
                          value={preferences.quietHoursStart || "22:00"}
                          onValueChange={(value) =>
                            updatePreference("quietHoursStart", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Select
                          value={preferences.quietHoursEnd || "07:00"}
                          onValueChange={(value) =>
                            updatePreference("quietHoursEnd", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select
                          value={preferences.quietHoursTimezone}
                          onValueChange={(value) =>
                            updatePreference("quietHoursTimezone", value)
                          }
                        >
                          <SelectTrigger>
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
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[140px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
