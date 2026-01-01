"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
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

// 🔐 Forgot password validation schema
const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await authService.forgotPassword({ email: data.email });
            setSubmittedEmail(data.email);
            setIsSubmitted(true);
            toast.success("Email sent!", {
                description: "Check your inbox for the password reset link.",
            });
        } catch (error) {
            // Even on error, show success for security (don't reveal if email exists)
            setSubmittedEmail(data.email);
            setIsSubmitted(true);
        }
    };

    // Success state - email sent
    if (isSubmitted) {
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
                            Check Your Email
                        </CardTitle>
                        <CardDescription className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
                            We&apos;ve sent a password reset link to
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                            <p className="font-medium text-[#202124] dark:text-[#E8EAED]">
                                {submittedEmail}
                            </p>
                        </div>

                        <div className="space-y-3 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                            <p>
                                📧 The email should arrive within a few minutes. If you
                                don&apos;t see it, check your spam folder.
                            </p>
                            <p>⏰ The reset link will expire in 1 hour for security.</p>
                        </div>

                        <div className="pt-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    form.reset();
                                }}
                            >
                                Try a different email
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-center">
                        <Link
                            href="/login"
                            className="text-sm text-[#1A73E8] dark:text-[#8AB4F8] hover:underline flex items-center gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>
                    </CardFooter>
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
                            <Mail className="h-7 w-7" />
                        </div>
                    </div>
                    <CardTitle
                        className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED]"
                        suppressHydrationWarning
                    >
                        Forgot Password?
                    </CardTitle>
                    <CardDescription className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
                        No worries! Enter your email and we&apos;ll send you a reset link.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#202124] dark:text-[#E8EAED]">
                                            Email address
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="your.email@example.com"
                                                autoComplete="email"
                                                disabled={form.formState.isSubmitting}
                                                className="h-11 border-[#E0E0E0] dark:border-[#2E2E2E] focus:border-[#1A73E8] dark:focus:border-[#8AB4F8]"
                                                {...field}
                                            />
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
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Link
                        href="/login"
                        className="text-sm text-[#1A73E8] dark:text-[#8AB4F8] hover:underline flex items-center gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
