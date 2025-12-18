"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="container mx-auto py-20 px-4 flex justify-center">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Payment Canceled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You have not been charged. If you encountered an issue, please try again or contact support.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/pricing">
            <Button variant="outline">Try Again</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
