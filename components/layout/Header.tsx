"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import {
  BookOpen,
  User,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

/**
 * Header Component
 *
 * Clean, minimal header inspired by Medium design.
 * Features:
 * - Logo with brand name
 * - Navigation links
 * - Theme toggle (light/dark mode)
 * - User menu with avatar
 * - Mobile menu toggle for sidebar
 * - Responsive design
 * - Version B color scheme
 *
 * @example
 * ```tsx
 * <Header onMenuToggle={() => {}} />
 * ```
 */

interface HeaderProps {
  /** Callback to toggle mobile sidebar menu */
  onMenuToggle?: () => void;
  /** Whether sidebar is collapsed (affects spacing) */
  isSidebarCollapsed?: boolean;
  /** Page title to display */
  pageTitle?: string;
}

export function Header({
  onMenuToggle,
  isSidebarCollapsed,
  pageTitle,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notificationCount, setNotificationCount] = React.useState(3); // Placeholder

  // Get user's full name
  const getFullName = () => {
    if (!user) return "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.email.split("@")[0];
  };

  // Get user initials from name
  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  const userInitials = getUserInitials();
  const userEmail = user?.email || "";
  const fullName = getFullName();

  const navigationLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/courses", label: "Courses" },
    { href: "/progress", label: "Progress" },
  ];

  const isActivePath = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      toast.info(`Searching for: ${searchQuery}`);
    }
  };

  const handleNotificationClick = () => {
    // TODO: Implement notifications
    toast.info("Notifications feature coming soon!");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E0E0E0] dark:border-[#2E2E2E] bg-white/95 dark:bg-[#121212]/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-[#121212]/80">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4 px-6 md:px-12">
          {/* Mobile Menu Toggle + Logo + Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Toggle */}
            {onMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0 text-[#5F6368] dark:text-[#9AA0A6]"
                onClick={onMenuToggle}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-[#202124] dark:text-[#E8EAED] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors shrink-0"
              aria-label="LEXIA Home"
            >
              <BookOpen className="h-6 w-6 text-[#1A73E8] dark:text-[#8AB4F8]" />
              <span className="hidden sm:inline">LEXIA</span>
            </Link>

            {/* Page Title (Desktop only) */}
            {pageTitle && (
              <div className="hidden lg:block border-l border-[#E0E0E0] dark:border-[#2E2E2E] pl-4 ml-2">
                <h1 className="text-lg font-semibold text-[#202124] dark:text-[#E8EAED] truncate">
                  {pageTitle}
                </h1>
              </div>
            )}
          </div>

          {/* Center - Search Bar (Desktop only) */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368] dark:text-[#9AA0A6]" />
                  <Input
                    type="search"
                    placeholder="Search courses, lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 bg-[#F8F9FA] dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#2E2E2E] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#5F6368] dark:placeholder:text-[#9AA0A6] focus-visible:ring-[#1A73E8] dark:focus-visible:ring-[#8AB4F8]"
                    aria-label="Search"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right side - Notifications, Theme Toggle & User Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]"
                  onClick={handleNotificationClick}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#EA4335] dark:bg-[#F28B82] text-white dark:text-[#121212]"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Button>
              </>
            )}

            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                      aria-label="User menu"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user?.avatarUrl}
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
                        href="/settings"
                        className="flex items-center gap-2 cursor-pointer text-[#202124] dark:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#2E2E2E]"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
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
              </>
            ) : (
              // Not logged in - show login/register buttons
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
