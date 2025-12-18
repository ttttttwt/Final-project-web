"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";

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
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-muted-foreground text-lg">Unlock unlimited learning and AI features.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>Flexible plan for short-term learning.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">$9.99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 50 Daily Usage Limit</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> AI Pronunciation Feedback</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe("MONTHLY")} disabled={loading === "MONTHLY"}>
              {loading === "MONTHLY" ? "Processing..." : "Subscribe Monthly"}
            </Button>
          </CardFooter>
        </Card>

        {/* Yearly Plan */}
        <Card className="border-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
            SAVE 20%
          </div>
          <CardHeader>
            <CardTitle>Yearly</CardTitle>
            <CardDescription>Best value for committed learners.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">$95.99<span className="text-lg font-normal text-muted-foreground">/yr</span></div>
            <ul className="space-y-2">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Everything in Monthly</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 2 Months Free</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Early Access to New Features</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="default" onClick={() => handleSubscribe("YEARLY")} disabled={loading === "YEARLY"}>
              {loading === "YEARLY" ? "Processing..." : "Subscribe Yearly"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
