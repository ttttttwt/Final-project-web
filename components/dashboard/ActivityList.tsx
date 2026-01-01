import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types/progress";
import { History, BookOpen, Trophy, PlayCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "@/lib/i18n";

interface ActivityListProps {
    activities: Activity[];
    isLoading?: boolean;
}

export function ActivityList({ activities, isLoading = false }: ActivityListProps) {
    const { t } = useTranslation();
    const getActivityIcon = (type: string) => {
        switch (type) {
            case "LESSON_COMPLETED":
                return <BookOpen className="h-4 w-4 text-blue-500" />;
            case "QUIZ_PASSED":
                return <Trophy className="h-4 w-4 text-yellow-500" />;
            default:
                return <PlayCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        {t("dashboard.recentActivity")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="h-8 w-8 bg-muted rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    {t("dashboard.recentActivity")}
                </CardTitle>
                <Link href="/progress" className="text-xs text-primary hover:underline">
                    {t("dashboard.viewAll")}
                </Link>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                        {t("dashboard.noRecentActivity")}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex gap-3 items-start">
                                <div className="mt-1 p-2 bg-muted/50 rounded-full">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {activity.link ? (
                                            <Link href={activity.link} className="hover:underline">
                                                {activity.description}
                                            </Link>
                                        ) : (
                                            activity.description
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        {activity.score > 0 && ` • ${t("dashboard.score")}: ${activity.score}%`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
