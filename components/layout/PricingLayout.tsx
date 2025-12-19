"use client";

import * as React from "react";
import { PricingHeader } from "./PricingHeader";

/**
 * PricingLayout Component
 *
 * Clean, minimal layout for pricing/conversion pages.
 * Features:
 * - Minimal header (logo + auth only)
 * - No sidebar, no navigation distractions
 * - Subtle gradient background
 * - Centered content
 * - Focuses user attention on conversion
 *
 * Use this layout for:
 * - /pricing
 * - /pricing/success
 * - /pricing/cancel
 *
 * @example
 * ```tsx
 * <PricingLayout>
 *   <YourPricingContent />
 * </PricingLayout>
 * ```
 */

interface PricingLayoutProps {
    children: React.ReactNode;
}

export function PricingLayout({ children }: PricingLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#F8F9FA] to-white dark:from-[#121212] dark:via-[#1A1A1A] dark:to-[#121212] text-[#202124] dark:text-[#E8EAED]">
            {/* Minimal Header */}
            <PricingHeader />

            {/* Main Content - Centered with max-width */}
            <main className="flex-1">
                {children}
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-[#E0E0E0] dark:border-[#2E2E2E] py-6 mt-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                        <p>© {new Date().getFullYear()} LEXIA. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="/terms" className="hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors">
                                Terms of Service
                            </a>
                            <a href="/privacy" className="hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors">
                                Privacy Policy
                            </a>
                            <a href="mailto:support@lexia.com" className="hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors">
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
