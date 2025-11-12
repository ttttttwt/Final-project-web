import * as React from "react";
import { Header } from "./Header";

/**
 * MainLayout Component
 *
 * Medium-inspired layout wrapper with:
 * - Clean header
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
}

export function MainLayout({
  children,
  narrow = false,
  className = "",
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED]">
      <Header />
      <main
        className={`${
          narrow ? "content-container" : "page-container"
        } px-6 md:px-12 py-8 md:py-12 ${className}`}
      >
        {children}
      </main>
    </div>
  );
}
