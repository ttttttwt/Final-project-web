"use client";

import { cn } from "@/lib/utils";
import { RolePlayScenarioDTO } from "@/types/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  MessageSquare,
  Clock,
  Target,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface ScenarioCardProps {
  scenario: RolePlayScenarioDTO;
  onStart: (scenario: RolePlayScenarioDTO) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Card component displaying a role-play scenario.
 * Shows title, context, roles, objectives, and a start button.
 */
export function ScenarioCard({
  scenario,
  onStart,
  isLoading = false,
  className,
}: ScenarioCardProps) {
  const cefrColors: Record<string, string> = {
    A1: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    A2: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    B1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    B2: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    C1: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    C2: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50",
        className
      )}
      onClick={() => !isLoading && onStart(scenario)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-semibold",
                  cefrColors[scenario.cefrLevel] || ""
                )}
              >
                {scenario.cefrLevel}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {scenario.domain}
              </Badge>
              {scenario.isFallback && (
                <Badge variant="secondary" className="text-xs bg-muted">
                  Featured
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {scenario.title}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-4">
        {/* Context */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {scenario.context}
        </p>

        {/* Roles */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">You:</span>
            <span className="font-medium">{scenario.yourRole}</span>
          </div>
        </div>

        {/* Objectives */}
        {scenario.objectives && scenario.objectives.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Learning Objectives:</span>
            </div>
            <ul className="pl-6 space-y-1">
              {scenario.objectives.slice(0, 3).map((objective, idx) => (
                <li
                  key={idx}
                  className="text-xs text-muted-foreground list-disc"
                >
                  {objective}
                </li>
              ))}
              {scenario.objectives.length > 3 && (
                <li className="text-xs text-muted-foreground italic">
                  +{scenario.objectives.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Duration */}
        {scenario.suggestedDuration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>~{scenario.suggestedDuration} minutes</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full group/btn"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            onStart(scenario);
          }}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Start Conversation
          <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Skeleton loader for ScenarioCard.
 */
export function ScenarioCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="h-5 w-12 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
            <div className="h-6 w-3/4 bg-muted rounded" />
          </div>
          <div className="w-10 h-10 bg-muted rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
        <div className="h-4 w-1/2 bg-muted rounded" />
      </CardContent>
      <CardFooter className="pt-0">
        <div className="h-10 w-full bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}
