"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface AiErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  onReset?: () => void;
  className?: string;
}

interface AiErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * AiErrorBoundary component for catching and handling errors in AI features.
 * Provides retry functionality and user-friendly error messages.
 */
export class AiErrorBoundary extends Component<
  AiErrorBoundaryProps,
  AiErrorBoundaryState
> {
  constructor(props: AiErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AiErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AI Error Boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AiErrorCard
          error={this.state.error}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

interface AiErrorCardProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReset?: () => void;
  className?: string;
}

/**
 * Standalone error card component for displaying AI errors.
 */
export function AiErrorCard({
  error,
  title = "Something went wrong",
  message,
  onRetry,
  onReset,
  className,
}: AiErrorCardProps) {
  const errorMessage =
    message ||
    error?.message ||
    "An unexpected error occurred. Please try again.";

  const isRateLimitError = errorMessage.toLowerCase().includes("rate limit");
  const isNetworkError =
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("fetch");

  return (
    <Card className={cn("border-destructive/50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{errorMessage}</p>
        {isRateLimitError && (
          <p className="text-sm text-muted-foreground mt-2">
            You've reached your AI usage limit. Please wait a moment before
            trying again.
          </p>
        )}
        {isNetworkError && (
          <p className="text-sm text-muted-foreground mt-2">
            Check your internet connection and try again.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {onRetry && (
          <Button variant="default" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <Home className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Inline error message for compact spaces
 */
export function AiErrorInline({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-destructive text-sm",
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-destructive hover:text-destructive"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
