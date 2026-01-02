"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  ChevronDown,
  Sparkles,
  CreditCard,
  BookText,
  MessageSquare,
  Home,
  WifiOff,
} from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useAiQuota } from "@/hooks/useAiQuota";
import { QuotaIndicator, QuotaWarning } from "./QuotaWarning";
import { NetworkOfflineBanner, NetworkReconnectedBanner } from "./AiErrorBoundary";
import { useTranslation } from "@/lib/i18n";

/**
 * AI Header Component
 *
 * Header for AI feature pages with:
 * - Back navigation button
 * - Page title
 * - AI Features dropdown menu
 *
 * @example
 * ```tsx
 * <AiHeader title="AI Flashcards" backHref="/dashboard" />
 * ```
 */

interface AiFeatureItem {
  href: string;
  labelKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const aiFeatureKeys: AiFeatureItem[] = [
  {
    href: "/ai/flashcards",
    labelKey: "ai.common.aiFlashcards",
    descKey: "ai.common.aiFlashcardsDesc",
    icon: CreditCard,
  },
  {
    href: "/ai/grammar",
    labelKey: "ai.common.aiGrammar",
    descKey: "ai.common.aiGrammarDesc",
    icon: BookText,
  },
  {
    href: "/ai/roleplay",
    labelKey: "ai.common.aiRoleplay",
    descKey: "ai.common.aiRoleplayDesc",
    icon: MessageSquare,
  },
];

interface AiHeaderProps {
  /** Page title to display */
  title?: string;
  /** Custom back navigation URL (defaults to /dashboard) */
  backHref?: string;
  /** Custom back button label */
  backLabel?: string;
  /** Show back button */
  showBackButton?: boolean;
  /** Additional className */
  className?: string;
  /** Right side actions */
  actions?: React.ReactNode;
}

export function AiHeader({
  title,
  backHref,
  backLabel,
  showBackButton = true,
  className,
  actions,
}: AiHeaderProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  // Translate feature items
  const aiFeatures = React.useMemo(() =>
    aiFeatureKeys.map(f => ({
      ...f,
      label: t(f.labelKey),
      description: t(f.descKey),
    })),
    [t]);

  // Determine the back URL based on current path
  const getBackUrl = () => {
    if (backHref) return backHref;

    // If we're in a nested AI route, go back to the parent
    const pathParts = pathname?.split("/").filter(Boolean) || [];

    if (pathParts.length > 2) {
      // e.g., /ai/flashcards/123 -> /ai/flashcards
      return `/${pathParts.slice(0, -1).join("/")}`;
    }

    // Default to dashboard
    return "/dashboard";
  };

  // Get current feature from path
  const getCurrentFeature = () => {
    const feature = aiFeatures.find(
      (f) => pathname?.startsWith(f.href)
    );
    return feature;
  };

  const currentFeature = getCurrentFeature();
  const displayTitle = title || currentFeature?.label || t("ai.common.aiFeatures");
  const displayBackLabel = backLabel || t("common.back");

  const handleBack = () => {
    router.push(getBackUrl());
  };

  const isActiveFeature = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm",
        "border-b border-[#E0E0E0] dark:border-[#2E2E2E]",
        "px-4 py-3 sm:px-6",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Section - Back Button & Title */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] -ml-2"
              aria-label={`${t("common.goBackTo")} ${displayBackLabel}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{displayBackLabel}</span>
            </Button>
          )}

          <div className="h-6 w-px bg-[#E0E0E0] dark:bg-[#2E2E2E] hidden sm:block" />

          {/* Page Title with AI Badge */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FFB300] dark:text-[#FDD663]" />
            <h1 className="text-lg sm:text-xl font-semibold text-[#202124] dark:text-[#E8EAED]">
              {displayTitle}
            </h1>
          </div>
        </div>

        {/* Right Section - AI Features Dropdown & Actions */}
        <div className="flex items-center gap-3">
          {/* AI Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-[#E0E0E0] dark:border-[#2E2E2E]",
                  "text-[#5F6368] dark:text-[#9AA0A6]",
                  "hover:text-[#202124] dark:hover:text-[#E8EAED]",
                  "hover:border-[#FFB300] dark:hover:border-[#FDD663]",
                  "data-[state=open]:border-[#FFB300] dark:data-[state=open]:border-[#FDD663]"
                )}
              >
                <Sparkles className="h-4 w-4 text-[#FFB300] dark:text-[#FDD663]" />
                <span className="hidden sm:inline">{t("ai.common.aiFeatures")}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FFB300] dark:text-[#FDD663]" />
                {t("ai.common.aiFeatures")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {aiFeatures.map((feature) => {
                const Icon = feature.icon;
                const isActive = isActiveFeature(feature.href);

                return (
                  <DropdownMenuItem
                    key={feature.href}
                    asChild
                    className={cn(
                      "cursor-pointer",
                      isActive && "bg-[#FFF8E1] dark:bg-[#1E1E1E]"
                    )}
                  >
                    <Link href={feature.href} className="flex items-start gap-3 py-2">
                      <Icon
                        className={cn(
                          "h-5 w-5 mt-0.5 shrink-0",
                          isActive
                            ? "text-[#FFB300] dark:text-[#FDD663]"
                            : "text-[#5F6368] dark:text-[#9AA0A6]"
                        )}
                      />
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            "font-medium",
                            isActive
                              ? "text-[#FFB300] dark:text-[#FDD663]"
                              : "text-[#202124] dark:text-[#E8EAED]"
                          )}
                        >
                          {feature.label}
                        </span>
                        <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                          {feature.description}
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-[#5F6368] dark:text-[#9AA0A6]" />
                  <span>{t("ai.common.backToDashboardFull")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Custom Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}

/**
 * AI Page Wrapper Component
 *
 * Wraps AI pages with the header for consistent navigation.
 * Includes network status monitoring and quota warnings.
 */
interface AiPageWrapperProps {
  /** Page title */
  title?: string;
  /** Back navigation URL */
  backHref?: string;
  /** Back button label */
  backLabel?: string;
  /** Show back button */
  showBackButton?: boolean;
  /** Header actions */
  headerActions?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
  /** Container className */
  className?: string;
  /** Content max width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl" | "full";
  /** Show quota indicator in header */
  showQuota?: boolean;
  /** Show network status banner */
  showNetworkStatus?: boolean;
  /** Feature name for quota tracking */
  feature?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function AiPageWrapper({
  title,
  backHref,
  backLabel,
  showBackButton = true,
  headerActions,
  children,
  className,
  maxWidth = "6xl",
  showQuota = true,
  showNetworkStatus = true,
  feature,
}: AiPageWrapperProps) {
  const { isOnline, wasOffline, checkConnectivity } = useNetworkStatus();
  const quota = useAiQuota(feature);

  // Build header actions with quota indicator
  const combinedActions = (
    <>
      {showQuota && !quota.isLoading && (
        <QuotaIndicator
          used={quota.featureUsed}
          limit={quota.featureLimit}
          planType={quota.planType}
          className="hidden sm:flex"
        />
      )}
      {headerActions}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <AiHeader
        title={title}
        backHref={backHref}
        backLabel={backLabel}
        showBackButton={showBackButton}
        actions={combinedActions}
      />

      {/* Quota Warning Banner */}
      {showQuota && quota.isNearLimit && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <QuotaWarning
            used={quota.featureUsed}
            limit={quota.featureLimit}
            feature={feature || "AI"}
            resetTime={quota.monthlyResetTime || undefined}
            daysUntilReset={quota.daysUntilReset}
            planType={quota.planType}
          />
        </div>
      )}

      <main
        className={cn(
          "flex-1 container mx-auto py-4 px-4 sm:px-6 lg:px-8",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {children}
      </main>

      {/* Network Status Banners */}
      {showNetworkStatus && !isOnline && (
        <NetworkOfflineBanner onRetry={checkConnectivity} />
      )}
      {showNetworkStatus && wasOffline && isOnline && (
        <NetworkReconnectedBanner />
      )}
    </div>
  );
}
