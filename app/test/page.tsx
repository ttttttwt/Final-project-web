"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";

export default function TestPage() {
  useEffect(() => {
    // Test API connection
    api
      .get("/health")
      .then(() => console.log("✅ API Connected"))
      .catch((err) => console.error("❌ API Error:", err));
  }, []);

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            LEXIA - Setup Complete! 🎉
          </CardTitle>
          <CardDescription>
            Frontend project initialization successful
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Check console for API connection status.
          </p>

          <div className="space-y-2">
            <h3 className="font-semibold">✅ Completed Setup:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Next.js 14+ with TypeScript</li>
              <li>Tailwind CSS + shadcn/ui components</li>
              <li>Zustand state management</li>
              <li>Axios API client with interceptors</li>
              <li>Auth store implementation</li>
              <li>Type definitions</li>
              <li>Folder structure</li>
              <li>Environment variables</li>
            </ul>
          </div>

          <Button>Test Button (shadcn/ui)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
