"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * Note: Error boundaries only catch errors in:
 * - Rendering
 * - Lifecycle methods
 * - Constructors of child components
 *
 * They do NOT catch errors in:
 * - Event handlers (use try/catch)
 * - Async code (use try/catch)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console (future: send to monitoring service like Sentry)
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error component stack:", errorInfo.componentStack);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to monitoring service
    // Example with Sentry:
    // Sentry.captureException(error, {
    //   contexts: { react: { componentStack: errorInfo.componentStack } },
    // });
  }

  handleReset = (): void => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback UI
 *
 * User-friendly error message displayed when ErrorBoundary catches an error.
 */
interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
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
            We encountered an unexpected error. This has been logged and
            we&apos;ll look into it. Please try refreshing the page or return to
            the dashboard.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left max-h-40 overflow-auto">
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  Stack trace
                </summary>
                <pre className="text-xs text-gray-500 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onReset}
            className="w-full h-12 text-base gap-2 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>

          <a
            href="/dashboard"
            className="w-full h-12 text-base gap-2 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </a>
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
