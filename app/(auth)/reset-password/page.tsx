"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
    Loader2,
    Eye,
    EyeOff,
    KeyRound,
    CheckCircle2,
    XCircle,
    Check,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

// 🔐 Reset password validation schema
const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

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
        return { score: 0, label: "", color: "bg-gray-200", percentage: 0 };
    }

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengths: Record<number, PasswordStrength> = {
        0: { score: 0, label: "Too weak", color: "bg-red-500", percentage: 10 },
        1: { score: 1, label: "Weak", color: "bg-red-500", percentage: 25 },
        2: { score: 2, label: "Fair", color: "bg-yellow-500", percentage: 50 },
        3: { score: 3, label: "Good", color: "bg-blue-500", percentage: 75 },
        4: { score: 4, label: "Strong", color: "bg-green-500", percentage: 90 },
        5: { score: 5, label: "Very Strong", color: "bg-green-600", percentage: 100 },
    };

    return strengths[Math.min(score, 5)];
}

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isInvalidToken, setIsInvalidToken] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const password = form.watch("newPassword");
    const passwordStrength = calculatePasswordStrength(password);

    const passwordRequirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One lowercase letter", met: /[a-z]/.test(password) },
        { label: "One number", met: /[0-9]/.test(password) },
    ];

    // Check if token exists
    useEffect(() => {
        if (!token) {
            setIsInvalidToken(true);
            setErrorMessage("Invalid reset link. Please request a new one.");
        }
    }, [token]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            setIsInvalidToken(true);
            return;
        }

        try {
            await authService.resetPassword({
                token,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });

            setIsSuccess(true);
            toast.success("Password reset successful!", {
                description: "You can now login with your new password.",
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error) {
            const apiError = error as {
                response?: { data?: { message?: string }; status?: number };
            };

            const message =
                apiError.response?.data?.message ||
                "Failed to reset password. The link may have expired.";

            if (
                apiError.response?.status === 400 ||
                apiError.response?.status === 401
            ) {
                setIsInvalidToken(true);
                setErrorMessage(message);
            } else {
                toast.error("Error", { description: message });
            }
        }
    };

    // Invalid/expired token state
    if (isInvalidToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212] p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-3 text-center">
                        <div className="mb-2 flex justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <XCircle className="h-7 w-7" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-serif text-[#202124] dark:text-[#E8EAED]">
                            Invalid Reset Link
                        </CardTitle>
                        <CardDescription className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
                            {errorMessage || "This password reset link is invalid or has expired."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                Password reset links expire after 1 hour for security. Please
                                request a new link if needed.
                            </p>
                        </div>

                        <Button asChild className="w-full h-11">
                            <Link href="/forgot-password">Request New Link</Link>
                        </Button>
                    </CardContent>

                    <CardFooter className="flex justify-center">
                        <Link
                            href="/login"
                            className="text-sm text-[#1A73E8] dark:text-[#8AB4F8] hover:underline"
                        >
                            Back to login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212] p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-3 text-center">
                        <div className="mb-2 flex justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-serif text-[#202124] dark:text-[#E8EAED]">
                            Password Reset Complete!
                        </CardTitle>
                        <CardDescription className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
                            Your password has been successfully changed.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                            <p className="text-sm text-green-800 dark:text-green-300">
                                🔐 You can now login with your new password.
                            </p>
                        </div>

                        <Button asChild className="w-full h-11">
                            <Link href="/login">Go to Login</Link>
                        </Button>

                        <p className="text-center text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                            Redirecting to login in 3 seconds...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Form state
    return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212] p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-3 text-center">
                    <div className="mb-2 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A73E8] dark:bg-[#8AB4F8] text-white dark:text-[#121212] shadow-lg">
                            <KeyRound className="h-7 w-7" />
                        </div>
                    </div>
                    <CardTitle
                        className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED]"
                        suppressHydrationWarning
                    >
                        Create New Password
                    </CardTitle>
                    <CardDescription className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
                        Enter your new password below. Make it strong and unique!
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* New Password Field */}
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#202124] dark:text-[#E8EAED]">
                                            New Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a strong password"
                                                    autoComplete="new-password"
                                                    disabled={form.formState.isSubmitting}
                                                    className="h-11 border-[#E0E0E0] dark:border-[#2E2E2E] focus:border-[#1A73E8] dark:focus:border-[#8AB4F8] pr-10"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[#5F6368] dark:text-[#9AA0A6]"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={form.formState.isSubmitting}
                                                    aria-label={
                                                        showPassword ? "Hide password" : "Show password"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[#EA4335] dark:text-[#F28B82]" />

                                        {/* Password Strength Indicator */}
                                        {password && (
                                            <div className="space-y-2 mt-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                                                        Password strength:
                                                    </span>
                                                    <span
                                                        className={`font-medium ${passwordStrength.score === 1
                                                                ? "text-red-500"
                                                                : passwordStrength.score === 2
                                                                    ? "text-yellow-500"
                                                                    : passwordStrength.score === 3
                                                                        ? "text-blue-500"
                                                                        : "text-green-500"
                                                            }`}
                                                    >
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                        style={{ width: `${passwordStrength.percentage}%` }}
                                                    />
                                                </div>

                                                {/* Password Requirements */}
                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    {passwordRequirements.map((req, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center gap-1.5 text-xs ${req.met
                                                                    ? "text-green-600 dark:text-green-400"
                                                                    : "text-[#5F6368] dark:text-[#9AA0A6]"
                                                                }`}
                                                        >
                                                            {req.met ? (
                                                                <Check className="h-3 w-3" />
                                                            ) : (
                                                                <X className="h-3 w-3" />
                                                            )}
                                                            {req.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password Field */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#202124] dark:text-[#E8EAED]">
                                            Confirm Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Re-enter your password"
                                                    autoComplete="new-password"
                                                    disabled={form.formState.isSubmitting}
                                                    className="h-11 border-[#E0E0E0] dark:border-[#2E2E2E] focus:border-[#1A73E8] dark:focus:border-[#8AB4F8] pr-10"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[#5F6368] dark:text-[#9AA0A6]"
                                                    onClick={() =>
                                                        setShowConfirmPassword(!showConfirmPassword)
                                                    }
                                                    disabled={form.formState.isSubmitting}
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[#EA4335] dark:text-[#F28B82]" />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 mt-6"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Link
                        href="/login"
                        className="text-sm text-[#1A73E8] dark:text-[#8AB4F8] hover:underline"
                    >
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1A73E8]" />
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
