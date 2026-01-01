"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User } from "@/types/auth";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Ho_Chi_Minh",
  "Australia/Sydney",
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
];

const profileSchema = z.object({
  firstName: z
    .string()
    .max(100, "First name must be less than 100 characters")
    .optional(),
  lastName: z
    .string()
    .max(100, "Last name must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phoneNumber: z
    .string()
    .regex(/^[+]?[0-9]{10,20}$/, {
      message: "Phone must be 10-20 digits, optionally starting with +",
    })
    .optional()
    .or(z.literal("")),
  timezone: z.string().optional(),
  language: z
    .string()
    .length(2, "Language code must be 2 characters")
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

// --------------------------------------------------------------------------
// ProfileForm
// --------------------------------------------------------------------------


export function ProfileForm({
  user,
  onSubmit,
  isLoading = false,
}: ProfileFormProps) {
  const { t } = useTranslation();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      phoneNumber: user.phoneNumber || "",
      timezone: user.timezone || "UTC",
      language: user.language || "en",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.firstName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.placeholderFirstName")} {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.lastName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.placeholderLastName")} {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.bio")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("profile.placeholderBio")}
                  className="resize-none"
                  rows={4}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                {t("profile.bioDesc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.phone")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("profile.placeholderPhone")}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                {t("profile.phoneDesc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.timezone")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("profile.selectTimezone")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.language")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("profile.selectLanguage")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("profile.saving")}
              </>
            ) : (
              t("profile.saveChanges")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
