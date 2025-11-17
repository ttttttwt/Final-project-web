"use client";

import { FileQuestion, Home, ArrowLeft } from "lucide-react";

/**
 * 404 Not Found Page
 *
 * Displayed when a user navigates to a non-existent route.
 * Provides helpful navigation options to return to the app.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212] p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 blur-3xl rounded-full" />
            <div className="relative bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full">
              <FileQuestion className="h-20 w-20 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div>
          <h1 className="text-8xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="w-full h-12 text-base gap-2 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </a>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="w-full h-12 text-base gap-2 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{" "}
            <a
              href="/support"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
