"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

/**
 * Global Error Page (500 Internal Server Error)
 *
 * Catches unhandled errors in the app and displays a user-friendly error page.
 * Provides options to retry or return to the dashboard.
 *
 * @param error - Error object
 * @param reset - Function to reset the error boundary and retry
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (future: send to monitoring service)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212] p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 dark:bg-red-400/20 blur-3xl rounded-full" />
            <div className="relative bg-red-50 dark:bg-red-900/20 p-6 rounded-full">
              <AlertTriangle className="h-20 w-20 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Oops!
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            We encountered an unexpected error while processing your request.
            Please try again or return to the dashboard.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            <a href="/dashboard">
              <Home className="h-5 w-5" />
              Go to Dashboard
            </a>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If this problem persists,{" "}
            <a
              href="/support"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
