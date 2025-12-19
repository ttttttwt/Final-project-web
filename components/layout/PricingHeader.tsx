"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { BookOpen, User, LogOut } from "lucide-react";
import { getFileUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

/**
 * PricingHeader Component
 *
 * Minimal header for pricing/conversion pages.
 * Features:
 * - Logo with brand name (links to home)
 * - Theme toggle
 * - If authenticated: simplified avatar dropdown
 * - If not authenticated: Sign In button
 * - No navigation links, no search bar, no notifications
 *
 * @example
 * ```tsx
 * <PricingHeader />
 * ```
 */

export function PricingHeader() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();

    // Memoize user's full name
    const fullName = React.useMemo(() => {
        if (!user) return "";
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        return `${firstName} ${lastName}`.trim() || user.email.split("@")[0];
    }, [user?.firstName, user?.lastName, user?.email]);

    // Memoize user initials
    const userInitials = React.useMemo(() => {
        if (!user) return "U";
        if (user.firstName && user.lastName) {
            return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
        }
        if (user.firstName) return user.firstName.charAt(0).toUpperCase();
        return user.email.charAt(0).toUpperCase();
    }, [user?.firstName, user?.lastName, user?.email]);

    // Memoize avatar URL
    const avatarUrl = React.useMemo(() => {
        if (!user?.avatarUrl) return null;
        return getFileUrl(user.avatarUrl);
    }, [user?.avatarUrl]);

    const userEmail = user?.email || "";

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to logout");
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-[#121212]/80">
            <div className="max-w-7xl mx-auto">
                <div className="flex h-16 items-center justify-between gap-4 px-6 md:px-12">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xl font-bold text-[#202124] dark:text-[#E8EAED] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors"
                        aria-label="LEXIA Home"
                    >
                        <BookOpen className="h-6 w-6 text-[#1A73E8] dark:text-[#8AB4F8]" />
                        <span>LEXIA</span>
                    </Link>

                    {/* Right side - Theme Toggle & Auth */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full"
                                        aria-label="User menu"
                                    >
                                        <Avatar key={user?.userId || 'guest'} className="h-9 w-9">
                                            <AvatarImage
                                                src={avatarUrl || undefined}
                                                alt={`${fullName || "User"} avatar`}
                                            />
                                            <AvatarFallback className="bg-[#1A73E8] dark:bg-[#8AB4F8] text-white dark:text-[#121212]">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E]"
                                >
                                    <DropdownMenuLabel className="text-[#202124] dark:text-[#E8EAED]">
                                        {fullName || "My Account"}
                                    </DropdownMenuLabel>
                                    <p className="px-2 pb-2 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                                        {userEmail}
                                    </p>
                                    <DropdownMenuSeparator className="bg-[#E0E0E0] dark:bg-[#2E2E2E]" />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 cursor-pointer text-[#202124] dark:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#2E2E2E]"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 cursor-pointer text-[#202124] dark:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#2E2E2E]"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#E0E0E0] dark:bg-[#2E2E2E]" />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 cursor-pointer text-[#EA4335] dark:text-[#F28B82] hover:bg-[#FCE8E6] dark:hover:bg-[#2E2E2E]"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
