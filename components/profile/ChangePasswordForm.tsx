"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Check, X, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/lib/i18n";

// 🔐 Change password validation schema
const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password must be less than 100 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmNewPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords don't match",
        path: ["confirmNewPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Password strength calculation
interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    percentage: number;
}

function calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;

    if (!password) {
        return { score: 0, label: "Too weak", color: "bg-red-500", percentage: 0 };
    }

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
        return { score: 1, label: "Weak", color: "bg-red-500", percentage: 25 };
    } else if (score === 2) {
        return { score: 2, label: "Fair", color: "bg-orange-500", percentage: 50 };
    } else if (score === 3) {
        return { score: 3, label: "Good", color: "bg-yellow-500", percentage: 75 };
    } else {
        return { score: 4, label: "Strong", color: "bg-green-500", percentage: 100 };
    }
}

interface ChangePasswordFormProps {
    onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
    const { logout } = useAuthStore();
    const { t } = useTranslation();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    // Watch password for strength indicator
    const newPassword = form.watch("newPassword");
    const passwordStrength = calculatePasswordStrength(newPassword);

    // Password requirements state
    const passwordRequirements = [
        { label: t("passwordChange.atLeast8Chars"), met: newPassword.length >= 8 },
        { label: t("passwordChange.oneUppercase"), met: /[A-Z]/.test(newPassword) },
        { label: t("passwordChange.oneLowercase"), met: /[a-z]/.test(newPassword) },
        { label: t("passwordChange.oneNumber"), met: /[0-9]/.test(newPassword) },
    ];

    const onSubmit = async (data: ChangePasswordFormData) => {
        try {
            await authService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword,
            });

            toast.success(t("passwordChange.passwordChanged"), {
                description: t("passwordChange.passwordChangedDesc"),
            });

            // Reset form
            form.reset();

            // Call success callback if provided
            onSuccess?.();

            // Logout user after short delay to show toast
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (error) {
            const apiError = error as {
                response?: {
                    status?: number;
                    data?: { message?: string };
                };
                message?: string;
            };

            if (apiError.response?.status === 400) {
                const message = apiError.response.data?.message || "Invalid request";
                if (message.toLowerCase().includes("current password")) {
                    form.setError("currentPassword", { message: t("passwordChange.incorrectPassword") });
                    toast.error(t("passwordChange.incorrectPassword"), {
                        description: t("passwordChange.incorrectPasswordDesc"),
                    });
                } else {
                    toast.error(t("common.error"), { description: message });
                }
            } else if (apiError.response?.status === 401) {
                toast.error(t("passwordChange.sessionExpired"), {
                    description: t("passwordChange.sessionExpiredDesc"),
                });
            } else {
                toast.error(t("passwordChange.failedToChange"), {
                    description: apiError.message || t("common.error"),
                });
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Current Password Field */}
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("passwordChange.currentPassword")}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder={t("passwordChange.currentPasswordPlaceholder")}
                                        autoComplete="current-password"
                                        disabled={form.formState.isSubmitting}
                                        className="pl-10 pr-10"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        disabled={form.formState.isSubmitting}
                                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* New Password Field */}
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("passwordChange.newPassword")}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder={t("passwordChange.newPasswordPlaceholder")}
                                        autoComplete="new-password"
                                        disabled={form.formState.isSubmitting}
                                        className="pl-10 pr-10"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        disabled={form.formState.isSubmitting}
                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>

                            {/* Password Strength Indicator */}
                            {newPassword && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">{t("passwordChange.passwordStrength")}</span>
                                        <span
                                            className={`font-medium ${passwordStrength.score === 1
                                                ? "text-red-500"
                                                : passwordStrength.score === 2
                                                    ? "text-orange-500"
                                                    : passwordStrength.score === 3
                                                        ? "text-yellow-500"
                                                        : "text-green-500"
                                                }`}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${passwordStrength.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password Requirements */}
                            <div className="mt-2 space-y-1">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        {req.met ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <X className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        <span className={req.met ? "text-green-500" : "text-muted-foreground"}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Confirm New Password Field */}
                <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("passwordChange.confirmNewPassword")}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder={t("passwordChange.confirmPasswordPlaceholder")}
                                        autoComplete="new-password"
                                        disabled={form.formState.isSubmitting}
                                        className="pl-10 pr-10"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={form.formState.isSubmitting}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="min-w-[140px]"
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("passwordChange.changing")}
                            </>
                        ) : (
                            t("passwordChange.changePassword")
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
