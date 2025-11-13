"use client";

import * as React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

/**
 * MainLayout Component
 *
 * Medium-inspired layout wrapper with:
 * - Clean header
 * - Collapsible sidebar navigation
 * - Content area with proper spacing
 * - Max-width containers
 * - Responsive padding
 * - Version B color scheme
 *
 * @example
 * ```tsx
 * <MainLayout>
 *   <YourPageContent />
 * </MainLayout>
 * ```
 */
interface MainLayoutProps {
  children: React.ReactNode;
  /** Use narrow content width (680px) for article-like pages */
  narrow?: boolean;
  /** Additional className for main content area */
  className?: string;
  /** Show sidebar navigation (default: true for authenticated pages) */
  showSidebar?: boolean;
  /** Page title to display in header */
  pageTitle?: string;
}

export function MainLayout({
  children,
  narrow = false,
  className = "",
  showSidebar = true,
  pageTitle,
}: MainLayoutProps) {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Touch gesture state for swipe-right to open sidebar
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger open
  const minSwipeDistance = 50;
  // Maximum distance from left edge to start swipe (in px)
  const edgeSwipeZone = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    // Only detect swipes from left edge on mobile when sidebar is closed
    if (!showSidebar || isSidebarOpen) return;
    const startX = e.targetTouches[0].clientX;
    if (startX <= edgeSwipeZone) {
      setTouchEnd(null);
      setTouchStart(startX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;

    // Open sidebar on right swipe from left edge (mobile only)
    if (isRightSwipe && !isSidebarOpen && showSidebar) {
      setIsSidebarOpen(true);
    }

    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header with menu toggle for mobile */}
      <Header
        onMenuToggle={
          showSidebar ? () => setIsSidebarOpen(!isSidebarOpen) : undefined
        }
        isSidebarCollapsed={isSidebarCollapsed}
        pageTitle={pageTitle}
      />

      <div className="flex">
        {/* Sidebar Navigation */}
        {showSidebar && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            showSidebar && !isSidebarCollapsed ? "md:ml-0" : ""
          } ${
            narrow ? "content-container" : "page-container"
          } px-6 md:px-12 py-8 md:py-12 ${className}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
