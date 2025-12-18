"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      // Redirect if accessed directly without session_id
      router.push("/pricing");
    } else {
      setIsValid(true);
    }
  }, [sessionId, router]);

  if (!isValid) {
    return null; // Or a loading spinner
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-20 px-4 flex justify-center">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-500">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Thank you for upgrading to Pro. Your account has been updated with new limits and features.
            </p>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              Transaction ID: <span className="font-mono">{sessionId?.slice(-8)}...</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/profile" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">View Subscription Details</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
