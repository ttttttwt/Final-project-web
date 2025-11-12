"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { BookOpen, User, Settings, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Header Component
 *
 * Clean, minimal header inspired by Medium design.
 * Features:
 * - Logo with brand name
 * - Navigation links
 * - Theme toggle (light/dark mode)
 * - User menu with avatar
 * - Responsive design with mobile menu
 * - Version B color scheme
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Check if user is logged in (placeholder - should come from auth store)
  const isLoggedIn = true; // TODO: Replace with actual auth state
  const userInitials = "JD"; // TODO: Get from user data
  const userEmail = "user@example.com"; // TODO: Get from user data

  const navigationLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/courses", label: "Courses" },
    { href: "/progress", label: "Progress" },
  ];

  const isActivePath = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E0E0E0] dark:border-[#2E2E2E] bg-white/95 dark:bg-[#121212]/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#121212]/80">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-[#202124] dark:text-[#E8EAED] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors"
            aria-label="LEXIA Home"
          >
            <BookOpen className="h-6 w-6 text-[#1A73E8] dark:text-[#8AB4F8]" />
            <span className="hidden sm:inline">LEXIA</span>
          </Link>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActivePath(link.href)
                      ? "text-[#1A73E8] dark:text-[#8AB4F8] bg-[#F8F9FA] dark:bg-[#1E1E1E]"
                      : "text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side - Theme Toggle & User Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-[#5F6368] dark:text-[#9AA0A6]"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>

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
                          src="/placeholder-avatar.jpg"
                          alt="User avatar"
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
                      My Account
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
                      onClick={() => {
                        // TODO: Implement logout
                        console.log("Logout");
                      }}
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

        {/* Mobile Navigation Menu */}
        {isLoggedIn && isMenuOpen && (
          <nav
            className="md:hidden border-t border-[#E0E0E0] dark:border-[#2E2E2E] py-4 px-6"
            aria-label="Mobile navigation"
          >
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActivePath(link.href)
                        ? "text-[#1A73E8] dark:text-[#8AB4F8] bg-[#F8F9FA] dark:bg-[#1E1E1E]"
                        : "text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
