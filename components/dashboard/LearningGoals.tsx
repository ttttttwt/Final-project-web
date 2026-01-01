import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/progress";
import { Target, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface LearningGoalsProps {
    goals: Goal[];
    isLoading?: boolean;
}

export function LearningGoals({ goals, isLoading = false }: LearningGoalsProps) {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {t("dashboard.weeklyGoals")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-2 animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-2 bg-muted rounded w-full"></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {t("dashboard.weeklyGoals")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {goals.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("dashboard.noActiveGoals")}</p>
                ) : (
                    goals.map((goal) => (
                        <div key={goal.id} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-foreground">{goal.title}</span>
                                <span className="text-muted-foreground">
                                    {goal.currentProgress} / {goal.targetProgress} {goal.unit}
                                </span>
                            </div>
                            <div className="relative">
                                <Progress
                                    value={(goal.currentProgress / goal.targetProgress) * 100}
                                    className="h-2"
                                />
                                {goal.isCompleted && (
                                    <CheckCircle2 className="absolute -right-1 -top-3 h-4 w-4 text-green-500 bg-background rounded-full" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{goal.description}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
