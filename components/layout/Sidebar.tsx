"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Home,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  CreditCard,
  MessageSquare,
  BookText,
} from "lucide-react";

/**
 * Sidebar Component
 *
 * Medium-inspired sidebar navigation with:
 * - Clean navigation menu
 * - Active route highlighting
 * - Collapsible for desktop
 * - Slide-in/out for mobile
 * - LEXIA branding
 * - Responsive design
 * - Version B color scheme
 *
 * @example
 * ```tsx
 * <Sidebar isOpen={true} onClose={() => {}} isCollapsed={false} onToggleCollapse={() => {}} />
 * ```
 */

interface SidebarProps {
  /** Whether sidebar is open (mobile) */
  isOpen?: boolean;
  /** Callback when sidebar should close (mobile) */
  onClose?: () => void;
  /** Whether sidebar is collapsed (desktop) */
  isCollapsed?: boolean;
  /** Callback to toggle collapse state (desktop) */
  onToggleCollapse?: () => void;
  /** Additional className */
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    ariaLabel: "Go to Dashboard",
  },
  {
    href: "/courses",
    label: "Courses",
    icon: BookOpen,
    ariaLabel: "Browse Courses",
  },
  {
    href: "/progress",
    label: "Progress",
    icon: TrendingUp,
    ariaLabel: "View Your Progress",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    ariaLabel: "View Your Profile",
  },
];

const aiFeatures: NavItem[] = [
  {
    href: "/ai/flashcards",
    label: "AI Flashcards",
    icon: CreditCard,
    ariaLabel: "AI Flashcards Generator",
  },
  {
    href: "/ai/grammar",
    label: "AI Grammar",
    icon: BookText,
    ariaLabel: "AI Grammar Practice",
  },
  {
    href: "/ai/roleplay",
    label: "AI Roleplay",
    icon: MessageSquare,
    ariaLabel: "AI Conversation Roleplay",
  },
];

export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger close
  const minSwipeDistance = 50;

  const isActivePath = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    // Close sidebar on left swipe (only on mobile when open)
    if (isLeftSwipe && isOpen && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          "fixed top-0 left-0 z-50 h-full bg-white dark:bg-[#121212] border-r border-[#E0E0E0] dark:border-[#2E2E2E] transition-all duration-300 ease-in-out",
          // Mobile: slide in/out
          "md:relative md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop: collapsible width
          isCollapsed ? "md:w-20" : "md:w-64",
          className
        )}
        aria-label="Main navigation sidebar"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#E0E0E0] dark:border-[#2E2E2E]">
            {!isCollapsed && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xl font-bold text-[#202124] dark:text-[#E8EAED] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors"
                aria-label="LEXIA Home"
              >
                <BookOpen className="h-6 w-6 text-[#1A73E8] dark:text-[#8AB4F8]" />
                <span>LEXIA</span>
              </Link>
            )}

            {isCollapsed && (
              <div className="w-full flex justify-center">
                <BookOpen className="h-6 w-6 text-[#1A73E8] dark:text-[#8AB4F8]" />
              </div>
            )}

            {/* Close button (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#5F6368] dark:text-[#9AA0A6]"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav
            className="flex-1 px-3 py-4 overflow-y-auto"
            aria-label="Main navigation"
          >
            {/* Main Navigation */}
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "text-[#1A73E8] dark:text-[#8AB4F8] bg-[#E8F0FE] dark:bg-[#1E1E1E]"
                          : "text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E]"
                      )}
                      aria-label={item.ariaLabel}
                      aria-current={isActive ? "page" : undefined}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isCollapsed && "mx-auto"
                        )}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* AI Features Section */}
            <div className="mt-6">
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Features</span>
                  </div>
                </div>
              )}
              
              {isCollapsed && (
                <div className="w-full flex justify-center mb-2">
                  <Sparkles className="h-4 w-4 text-[#FFB300] dark:text-[#FDD663]" />
                </div>
              )}

              <ul className="space-y-1">
                {aiFeatures.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "text-[#FFB300] dark:text-[#FDD663] bg-[#FFF8E1] dark:bg-[#1E1E1E]"
                            : "text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E]"
                        )}
                        aria-label={item.ariaLabel}
                        aria-current={isActive ? "page" : undefined}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isCollapsed && "mx-auto"
                          )}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Collapse Toggle (Desktop only) */}
          {onToggleCollapse && (
            <div className="hidden md:block p-3 border-t border-[#E0E0E0] dark:border-[#2E2E2E]">
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "sm"}
                onClick={onToggleCollapse}
                className={cn(
                  "w-full text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]",
                  isCollapsed && "flex justify-center"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <>
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    <span>Collapse</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
