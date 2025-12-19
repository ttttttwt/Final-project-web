"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Loader2, ArrowLeft, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PricingLayout } from "@/components/layout";

/**
 * Inner component that validates access
 * Must be wrapped in Suspense boundary
 */
function CancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check for canceled parameter from Stripe or valid referrer
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    // Only allow access if redirected from payment flow (has canceled param) 
    // or if user came from pricing page (check referrer)
    const referrer = document.referrer;
    const isFromPricing = referrer.includes("/pricing") || referrer.includes("checkout.stripe.com");

    if (canceled === "true" || isFromPricing) {
      setIsValid(true);
    } else {
      // Give a brief moment to show loading, then redirect
      const timer = setTimeout(() => {
        router.push("/pricing");
      }, 1500);
      return () => clearTimeout(timer);
    }
    setIsChecking(false);
  }, [canceled, router]);

  if (isChecking && !isValid) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="py-12">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              This page is only accessible after a payment cancellation. Redirecting to Pricing...
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
        <span className="text-foreground font-medium">Payment Canceled</span>
      </nav>

      {/* Back Button */}
      <div className="mb-8">
        <Link href="/pricing" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pricing
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex justify-center">
        <Card className="max-w-md w-full text-center shadow-lg border-red-200 dark:border-red-900/30">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-red-700 dark:text-red-500">
              Payment Canceled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Your payment was canceled and you have not been charged.
            </p>
            <p className="text-sm text-muted-foreground">
              If you encountered an issue during checkout, please try again or contact our support team for assistance.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-6">
            <Link href="/pricing" className="w-full">
              <Button size="lg" className="w-full">
                Try Again
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                Go to Home
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
function CancelLoading() {
  return (
    <div className="container mx-auto py-20 px-4 flex justify-center">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardContent className="py-12">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Cancel Page - Wrapped in Suspense for useSearchParams
 * Protected from direct URL access - requires valid payment flow redirect
 */
export default function CancelPage() {
  return (
    <PricingLayout>
      <Suspense fallback={<CancelLoading />}>
        <CancelContent />
      </Suspense>
    </PricingLayout>
  );
}
