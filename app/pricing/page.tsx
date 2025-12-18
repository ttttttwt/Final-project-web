"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { MainLayout } from "@/components/layout";
import Link from "next/link";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();

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

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade to Pro</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock unlimited learning and AI features to accelerate your English mastery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Monthly</CardTitle>
              <CardDescription>Flexible plan for short-term learning.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="mr-2 h-5 w-5 text-primary" /> 50 Daily Usage Limit</li>
                <li className="flex items-center"><Check className="mr-2 h-5 w-5 text-primary" /> AI Pronunciation Feedback</li>
                <li className="flex items-center"><Check className="mr-2 h-5 w-5 text-primary" /> Priority Support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => handleSubscribe("MONTHLY")} disabled={loading === "MONTHLY"}>
                {loading === "MONTHLY" ? "Processing..." : "Subscribe Monthly"}
              </Button>
            </CardFooter>
          </Card>

          {/* Yearly Plan */}
          <Card className="border-primary relative overflow-hidden flex flex-col shadow-lg">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
              SAVE 20%
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Yearly</CardTitle>
              <CardDescription>Best value for committed learners.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold mb-6">$95.99<span className="text-lg font-normal text-muted-foreground">/yr</span></div>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="mr-2 h-5 w-5 text-primary" /> Everything in Monthly</li>
                <li className="flex items-center"><Check className="mr-2 h-5 w-5 text-primary" /> 2 Months Free</li>
                <li className="flex items-center"><Check className="mr-2 h-5 w-5 text-primary" /> Early Access to New Features</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={() => handleSubscribe("YEARLY")} disabled={loading === "YEARLY"}>
                {loading === "YEARLY" ? "Processing..." : "Subscribe Yearly"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
