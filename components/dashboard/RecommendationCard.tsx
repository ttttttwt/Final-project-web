import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recommendation } from "@/types/progress";
import { Sparkles, ArrowRight, Lightbulb, Zap } from "lucide-react";
import Link from "next/link";

interface RecommendationCardProps {
    recommendations: Recommendation[];
    isLoading?: boolean;
}

export function RecommendationCard({ recommendations, isLoading = false }: RecommendationCardProps) {
    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-900">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        Recommended for You
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
                        <div className="h-10 bg-indigo-200/50 rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (recommendations.length === 0) return null;

    // Just show the first recommendation for now to keep it clean
    const topRec = recommendations[0];

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-24 w-24" />
            </div>

            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    Recommended for You
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                            {topRec.type}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            {topRec.reason}
                        </span>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{topRec.title}</h3>
                    <p className="text-sm text-muted-foreground">{topRec.description}</p>
                </div>

                {topRec.link && (
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link href={topRec.link}>
                            Start Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
