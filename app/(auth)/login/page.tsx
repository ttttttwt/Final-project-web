"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useAuthStore } from "@/store/authStore";

// 🔐 Login form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 🔐 SECURITY: login() calls API, backend sets httpOnly cookies
      await login({
        email: data.email,
        password: data.password,
      });

      // Success: User profile fetched and stored in authStore
      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
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
      } else if (apiError.response?.status === 401) {
        toast.error("Invalid Credentials", {
          description: "Email or password is incorrect. Please try again.",
        });
        form.setError("password", {
          message: "Invalid email or password",
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
        toast.error("Login Failed", {
          description:
            apiError.response?.data?.message ||
            apiError.message ||
            "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A73E8] dark:bg-[#8AB4F8] text-white dark:text-[#121212] shadow-lg">
              <span className="text-2xl font-bold">L</span>
            </div>
          </div>
          <CardTitle
            className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED]"
            suppressHydrationWarning
          >
            Welcome back
          </CardTitle>
          <CardDescription className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
            Sign in to continue your learning journey
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
                          placeholder="Enter your password"
                          autoComplete="current-password"
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
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          id="rememberMe"
                          title="Remember me"
                          aria-label="Remember me"
                          className="h-4 w-4 rounded border-[#E0E0E0] dark:border-[#2E2E2E] text-[#1A73E8] dark:text-[#8AB4F8] focus:ring-[#1A73E8] dark:focus:ring-[#8AB4F8]"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="rememberMe"
                        className="text-sm font-normal cursor-pointer text-[#5F6368] dark:text-[#9AA0A6]"
                      >
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Link
                  href="/forgot-password"
                  className="text-sm text-[#1A73E8] dark:text-[#8AB4F8] hover:underline"
                  tabIndex={form.formState.isSubmitting ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 mt-6"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
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
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11"
            asChild
            disabled={form.formState.isSubmitting}
          >
            <Link href="/register">Create an account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
