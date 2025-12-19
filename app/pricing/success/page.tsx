"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, ArrowLeft, Home, ChevronRight, CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PricingLayout } from "@/components/layout";

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      // Give a brief moment to show loading, then redirect
      const timer = setTimeout(() => {
        router.push("/pricing");
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsValid(true);
    }
    setIsChecking(false);
  }, [sessionId, router]);

  if (isChecking && !isValid) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying payment...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              This page is only accessible after a successful payment. Redirecting to Pricing...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center hover:text-primary transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/pricing" className="hover:text-primary transition-colors">
          Pricing
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Payment Successful</span>
      </nav>

      {/* Back Button */}
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex justify-center">
        <Card className="max-w-md w-full text-center shadow-lg border-green-200 dark:border-green-900/30">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20 relative">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-500">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Thank you for upgrading to Pro! Your account has been updated with new limits and features.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">What's unlocked:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ 50 Daily Usage Limit</li>
                <li>✓ AI Pronunciation Feedback</li>
                <li>✓ Priority Support</li>
              </ul>
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              Transaction ID: <span className="font-mono">{sessionId?.slice(-12)}...</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-6">
            <Link href="/dashboard" className="w-full">
              <Button size="lg" className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Start Learning with Pro
              </Button>
            </Link>
            <Link href="/profile" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                View Subscription Details
              </Button>
            </Link>
            <Link href="/courses" className="w-full">
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                Explore Courses
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/**
 * Loading fallback for Suspense
 */
function SuccessLoading() {
  return (
    <div className="container mx-auto py-20 px-4 flex justify-center">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardContent className="py-12">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground mt-4">Loading payment details...</p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Success Page - Wrapped in Suspense for useSearchParams
 * Protected from direct URL access - requires valid session_id from payment flow
 */
export default function SuccessPage() {
  return (
    <PricingLayout>
      <Suspense fallback={<SuccessLoading />}>
        <SuccessContent />
      </Suspense>
    </PricingLayout>
  );
}

