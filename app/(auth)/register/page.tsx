"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";

// 🔐 Registration form validation schema
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength calculation
interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  percentage: number;
}

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (!password) {
    return { score: 0, label: "Too weak", color: "bg-red-500", percentage: 0 };
  }

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++; // Special characters

  // Map score to strength
  if (score <= 1) {
    return { score: 1, label: "Weak", color: "bg-red-500", percentage: 25 };
  } else if (score === 2) {
    return { score: 2, label: "Fair", color: "bg-orange-500", percentage: 50 };
  } else if (score === 3) {
    return { score: 3, label: "Good", color: "bg-yellow-500", percentage: 75 };
  } else {
    return {
      score: 4,
      label: "Strong",
      color: "bg-green-500",
      percentage: 100,
    };
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Watch password for strength indicator
  const password = form.watch("password");
  const passwordStrength = calculatePasswordStrength(password);

  // Password requirements state
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // 🔐 SECURITY: register() calls API, backend sets httpOnly cookies
      await register({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      // Success: User profile already in authStore (session established)
      toast.success("Account Created!", {
        description: "Welcome to LEXIA. Let's start your learning journey.",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      // Error handling with specific messages
      const apiError = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
        message?: string;
        code?: string;
      };

      if (apiError.code === "NETWORK") {
        toast.error("Connection Failed", {
          description: "Please check your internet connection and try again.",
        });
      } else if (apiError.code === "TIMEOUT") {
        toast.error("Request Timeout", {
          description:
            "The server is taking too long to respond. Please try again.",
        });
      } else if (apiError.response?.status === 409) {
        // Duplicate email
        toast.error("Email Already Registered", {
          description: "This email is already in use. Please login instead.",
        });
        form.setError("email", {
          message: "Email already registered",
        });
      } else if (apiError.response?.status === 422) {
        toast.error("Validation Error", {
          description:
            apiError.response.data?.message || "Please check your input.",
        });
      } else if (apiError.response?.status && apiError.response.status >= 500) {
        toast.error("Server Error", {
          description:
            "Something went wrong on our end. Please try again later.",
        });
      } else {
        toast.error("Registration Failed", {
          description:
            apiError.response?.data?.message ||
            apiError.message ||
            "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212] p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A73E8] dark:bg-[#8AB4F8] text-white dark:text-[#121212] shadow-lg">
              <span className="text-2xl font-bold">L</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED]">
            Join LEXIA
          </CardTitle>
          <CardDescription className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
            Start your AI-powered English learning journey
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

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#202124] dark:text-[#E8EAED]">
                      Password
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

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                            Password strength:
                          </span>
                          <span
                            className={`font-medium ${
                              passwordStrength.score === 1
                                ? "text-[#EA4335] dark:text-[#F28B82]"
                                : passwordStrength.score === 2
                                ? "text-[#FFB300] dark:text-[#FDD663]"
                                : passwordStrength.score === 3
                                ? "text-[#FBBC04] dark:text-[#FDD663]"
                                : "text-[#34A853] dark:text-[#81C995]"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#E0E0E0] dark:bg-[#2E2E2E]">
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
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          {req.met ? (
                            <Check className="h-3 w-3 text-[#34A853] dark:text-[#81C995]" />
                          ) : (
                            <X className="h-3 w-3 text-[#5F6368] dark:text-[#9AA0A6]" />
                          )}
                          <span
                            className={
                              req.met
                                ? "text-[#34A853] dark:text-[#81C995]"
                                : "text-[#5F6368] dark:text-[#9AA0A6]"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <FormMessage className="text-[#EA4335] dark:text-[#F28B82]" />
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

              {/* Terms and Conditions */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                        className="border-[#E0E0E0] dark:border-[#2E2E2E] data-[state=checked]:bg-[#1A73E8] dark:data-[state=checked]:bg-[#8AB4F8]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal text-[#5F6368] dark:text-[#9AA0A6]">
                        I accept the{" "}
                        <Link
                          href="/terms"
                          className="text-[#1A73E8] dark:text-[#8AB4F8] hover:underline"
                          target="_blank"
                          tabIndex={form.formState.isSubmitting ? -1 : 0}
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-[#1A73E8] dark:text-[#8AB4F8] hover:underline"
                          target="_blank"
                          tabIndex={form.formState.isSubmitting ? -1 : 0}
                        >
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage className="text-[#EA4335] dark:text-[#F28B82]" />
                    </div>
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
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E0E0E0] dark:border-[#2E2E2E]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F8F9FA] dark:bg-[#1E1E1E] px-2 text-[#5F6368] dark:text-[#9AA0A6]">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11"
            asChild
            disabled={form.formState.isSubmitting}
          >
            <Link href="/login">Sign in to your account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
