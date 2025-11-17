import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LEXIA - AI English Learning Platform",
  description:
    "Professional English learning platform powered by AI for working professionals",
  keywords: [
    "English learning",
    "AI",
    "professional development",
    "language learning",
    "business English",
  ],
  authors: [{ name: "LEXIA Team" }],
  openGraph: {
    title: "LEXIA - AI English Learning Platform",
    description:
      "Professional English learning platform powered by AI for working professionals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>{children}</AuthProvider>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
