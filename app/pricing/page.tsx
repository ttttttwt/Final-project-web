"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Home, ChevronRight, Sparkles, Crown, Zap, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { PricingLayout } from "@/components/layout";
import Link from "next/link";
import { pricingService, PricingPlan } from "@/services/pricingService";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  // Fetch pricing plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await pricingService.getPlans();
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch pricing plans:", error);
        toast.error("Failed to load pricing. Please refresh the page.");
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planType: "MONTHLY" | "YEARLY") => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(planType);
    try {
      const response = await api.post<{ url: string }>("/subscription/checkout", { planType });
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Get plans by type
  const monthlyPlan = plans.find((p) => p.planType === "MONTHLY");
  const yearlyPlan = plans.find((p) => p.planType === "YEARLY");

  // Calculate savings for yearly plan
  const savings = monthlyPlan && yearlyPlan
    ? pricingService.calculateYearlySavings(monthlyPlan.price, yearlyPlan.price)
    : null;

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Clean description by removing "Save X%" text (we calculate this dynamically)
  const cleanDescription = (description: string | undefined, fallback: string) => {
    if (!description) return fallback;
    // Remove "Save X%!" or "Save X%" patterns from description
    return description.replace(/\.?\s*Save \d+%!?/gi, "").trim() || fallback;
  };

  return (
    <PricingLayout>
      <div className="container mx-auto py-10 px-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Pricing</span>
        </nav>

        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock unlimited learning and AI features to accelerate your English mastery.
          </p>
        </div>

        {/* Free Plan Comparison */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
            <Zap className="h-4 w-4" />
            Currently on Free Plan? Upgrade now to unlock Pro features!
          </div>
        </div>

        {/* Loading State */}
        {loadingPlans ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading pricing plans...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No pricing plans available at the moment.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        ) : (
          /* Pricing Cards */
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            {monthlyPlan && (
              <Card className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {monthlyPlan.name.replace(" Pro", "")}
                  </CardTitle>
                  <CardDescription>
                    {monthlyPlan.description || "Flexible plan for short-term learning."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-4xl font-bold mb-6">
                    {formatPrice(monthlyPlan.price)}
                    <span className="text-lg font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>50 Daily Usage Limit</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>AI Pronunciation Feedback</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>Priority Support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>Advanced AI Conversations</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    onClick={() => handleSubscribe("MONTHLY")}
                    disabled={loading === "MONTHLY"}
                  >
                    {loading === "MONTHLY" ? "Processing..." : "Subscribe Monthly"}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Yearly Plan */}
            {yearlyPlan && (
              <Card className="border-primary relative overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-shadow">
                {savings && savings.percentSaved > 0 && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-bl-lg">
                    SAVE {savings.percentSaved}%
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {yearlyPlan.name.replace(" Pro", "")}
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  </CardTitle>
                  <CardDescription>
                    {cleanDescription(yearlyPlan.description, "Best value for committed learners.")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-4xl font-bold mb-2">
                    {formatPrice(yearlyPlan.price)}
                    <span className="text-lg font-normal text-muted-foreground">/yr</span>
                  </div>
                  {savings && (
                    <p className="text-sm text-muted-foreground mb-6">
                      That&apos;s only {formatPrice(savings.monthlyEquivalent)}/month – save {formatPrice(savings.amountSaved)}/year!
                    </p>
                  )}
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>Everything in Monthly</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>2 Months Free</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>Early Access to New Features</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>Exclusive Learning Content</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => handleSubscribe("YEARLY")}
                    disabled={loading === "YEARLY"}
                  >
                    <Sparkles className="h-4 w-4" />
                    {loading === "YEARLY" ? "Processing..." : "Subscribe Yearly"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        )}

        {/* FAQ / Additional Info */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Questions?</h3>
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day money-back guarantee. Cancel anytime with no hidden fees.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Secure payment via Stripe
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </PricingLayout>
  );
}
