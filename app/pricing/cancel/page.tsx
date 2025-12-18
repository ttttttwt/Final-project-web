"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";

export default function CancelPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-20 px-4 flex justify-center">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-red-700 dark:text-red-500">Payment Canceled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              You have not been charged. If you encountered an issue, please try again or contact support.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">Try Again</Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">Back to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
