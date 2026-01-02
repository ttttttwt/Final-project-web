"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  RefreshCw,
  Home,
  WifiOff,
  Clock,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

/**
 * Error types for categorization
 */
export type AiErrorType =
  | "network"
  | "timeout"
  | "rate_limit"
  | "server"
  | "auth"
  | "quota"
  | "unknown";

/**
 * Categorize an error based on its message and properties
 */
export function categorizeError(error: Error | null | undefined): AiErrorType {
  if (!error) return "unknown";

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch") ||
    message.includes("cors") ||
    name.includes("networkerror") ||
    !navigator.onLine
  ) {
    return "network";
  }

  // Timeout errors
  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("aborted") ||
    name.includes("aborterror")
  ) {
    return "timeout";
  }

  // Rate limit errors
  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  ) {
    return "rate_limit";
  }

  // Quota errors
  if (
    message.includes("quota") ||
    message.includes("limit reached") ||
    message.includes("daily limit")
  ) {
    return "quota";
  }

  // Auth errors
  if (
    message.includes("unauthorized") ||
    message.includes("authentication") ||
    message.includes("401") ||
    message.includes("403")
  ) {
    return "auth";
  }

  // Server errors
  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("server error") ||
    message.includes("internal error")
  ) {
    return "server";
  }

  return "unknown";
}

/**
 * Get user-friendly error details based on error type
 */
export function getErrorDetails(errorType: AiErrorType): {
  title: string;
  message: string;
  icon: typeof AlertCircle;
  canRetry: boolean;
  helpText?: string;
} {
  switch (errorType) {
    case "network":
      return {
        title: "Connection Lost",
        message: "Unable to connect to the server. Please check your internet connection.",
        icon: WifiOff,
        canRetry: true,
        helpText: "Make sure you're connected to the internet and try again.",
      };
    case "timeout":
      return {
        title: "Request Timed Out",
        message: "The AI is taking longer than expected. This may be due to high demand.",
        icon: Clock,
        canRetry: true,
        helpText: "Please wait a moment and try again. If the problem persists, try a simpler request.",
      };
    case "rate_limit":
      return {
        title: "Too Many Requests",
        message: "You've made too many requests in a short time. Please wait before trying again.",
        icon: ShieldAlert,
        canRetry: true,
        helpText: "Wait a few seconds before making another request.",
      };
    case "quota":
      return {
        title: "Daily Limit Reached",
        message: "You've reached your daily AI usage limit.",
        icon: AlertCircle,
        canRetry: false,
        helpText: "Your limit will reset at midnight. Consider upgrading for more AI requests.",
      };
    case "auth":
      return {
        title: "Authentication Required",
        message: "Your session has expired. Please log in again.",
        icon: ShieldAlert,
        canRetry: false,
        helpText: "You'll be redirected to the login page.",
      };
    case "server":
      return {
        title: "Server Error",
        message: "Our servers are having trouble. Our team has been notified.",
        icon: AlertCircle,
        canRetry: true,
        helpText: "This is usually temporary. Please try again in a few moments.",
      };
    default:
      return {
        title: "Something Went Wrong",
        message: "An unexpected error occurred. Please try again.",
        icon: AlertCircle,
        canRetry: true,
      };
  }
}

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
  errorType?: AiErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReset?: () => void;
  retryCountdown?: number;
  attemptNumber?: number;
  maxRetries?: number;
  isRetrying?: boolean;
  className?: string;
}

/**
 * Standalone error card component for displaying AI errors.
 * Supports error categorization and retry countdown.
 */
export function AiErrorCard({
  error,
  errorType,
  title,
  message,
  onRetry,
  onReset,
  retryCountdown = 0,
  attemptNumber = 0,
  maxRetries = 3,
  isRetrying = false,
  className,
}: AiErrorCardProps) {
  const { t } = useTranslation();

  // Determine error type and details
  const type = errorType || categorizeError(error);

  // Get translated error details
  const getTranslatedDetails = () => {
    switch (type) {
      case "network":
        return {
          title: t("ai.common.connectionLost"),
          message: t("ai.common.connectionLostDesc"),
          icon: WifiOff,
          canRetry: true,
          helpText: t("ai.common.connectionLostHelp"),
        };
      case "timeout":
        return {
          title: t("ai.common.requestTimedOut"),
          message: t("ai.common.requestTimedOutDesc"),
          icon: Clock,
          canRetry: true,
          helpText: t("ai.common.requestTimedOutHelp"),
        };
      case "rate_limit":
        return {
          title: t("ai.common.tooManyRequests"),
          message: t("ai.common.tooManyRequestsDesc"),
          icon: ShieldAlert,
          canRetry: true,
          helpText: t("ai.common.tooManyRequestsHelp"),
        };
      case "quota":
        return {
          title: t("ai.common.dailyLimitReached"),
          message: t("ai.common.dailyLimitReachedDesc"),
          icon: AlertCircle,
          canRetry: false,
          helpText: t("ai.common.dailyLimitReachedHelp"),
        };
      case "auth":
        return {
          title: t("ai.common.authRequired"),
          message: t("ai.common.authRequiredDesc"),
          icon: ShieldAlert,
          canRetry: false,
          helpText: t("ai.common.authRequiredHelp"),
        };
      case "server":
        return {
          title: t("ai.common.serverError"),
          message: t("ai.common.serverErrorDesc"),
          icon: AlertCircle,
          canRetry: true,
          helpText: t("ai.common.serverErrorHelp"),
        };
      default:
        return {
          title: t("ai.common.somethingWentWrong"),
          message: t("ai.common.somethingWentWrongDesc"),
          icon: AlertCircle,
          canRetry: true,
        };
    }
  };

  const details = getTranslatedDetails();

  const displayTitle = title || details.title;
  const displayMessage = message || error?.message || details.message;
  const Icon = details.icon;
  const showRetry = details.canRetry && onRetry;
  const isExhausted = attemptNumber >= maxRetries;

  return (
    <Card
      className={cn("border-destructive/50", className)}
      role="alert"
      aria-live="assertive"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Icon className="w-5 h-5" />
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground">{displayMessage}</p>

        {details.helpText && (
          <p className="text-sm text-muted-foreground/80 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {details.helpText}
          </p>
        )}

        {/* Retry countdown */}
        {retryCountdown > 0 && !isExhausted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t("ai.common.retryingIn", { seconds: retryCountdown })}</span>
          </div>
        )}

        {/* Retry attempts indicator */}
        {attemptNumber > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("ai.common.attemptOf", { current: attemptNumber, total: maxRetries })}
          </p>
        )}

        {/* Exhausted state */}
        {isExhausted && (
          <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
            <p className="font-medium">{t("ai.common.maxRetriesReached")}</p>
            <p className="text-xs mt-1">{t("ai.common.maxRetriesReachedDesc")}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {showRetry && !isExhausted && (
          <Button
            variant="default"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying || retryCountdown > 0}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t("ai.common.retrying")}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("ai.common.tryAgain")}
              </>
            )}
          </Button>
        )}
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <Home className="w-4 h-4 mr-2" />
            {t("ai.common.goBack")}
          </Button>
        )}
        {isExhausted && (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="mailto:support@lexia.app" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("ai.common.contactSupport")}
            </a>
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

/**
 * Network offline banner - shows when user loses connection
 */
export function NetworkOfflineBanner({
  className,
  onRetry,
}: {
  className?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-3 z-50",
        "flex items-center justify-center gap-3 animate-in slide-in-from-bottom duration-300",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="w-5 h-5" />
      <span className="font-medium">{t("ai.common.youreOffline")}</span>
      <span className="text-sm opacity-90">{t("ai.common.checkConnection")}</span>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="ml-2"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          {t("ai.common.retry")}
        </Button>
      )}
    </div>
  );
}

/**
 * Network reconnected banner - shows briefly when connection is restored
 */
export function NetworkReconnectedBanner({
  className,
}: {
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-green-600 text-white px-4 py-3 z-50",
        "flex items-center justify-center gap-3 animate-in slide-in-from-bottom duration-300",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <WifiOff className="w-5 h-5" />
      <span className="font-medium">{t("ai.common.backOnline")}</span>
      <span className="text-sm opacity-90">{t("ai.common.connectionRestored")}</span>
    </div>
  );
}

/**
 * Timeout warning component
 */
export function TimeoutWarning({
  seconds = 30,
  className,
  onCancel,
}: {
  seconds?: number;
  className?: string;
  onCancel?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-sm bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2",
        className
      )}
      role="alert"
    >
      <Clock className="w-4 h-4 flex-shrink-0" />
      <span>
        This is taking longer than expected ({seconds}s+). The AI may be experiencing high demand.
      </span>
      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
