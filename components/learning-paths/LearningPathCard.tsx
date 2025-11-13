"use client";

/**
 * Learning Path Card Component
 * Displays a learning path with CEFR badge, course count, estimated hours, and start button
 */

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Award, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LearningPath } from "@/types/learningPath";
import { CEFR_LEVELS } from "@/types/learningPath";
import { toast } from "sonner";
import learningPathService from "@/services/learningPathService";

interface LearningPathCardProps {
  path: LearningPath;
  isRecommended?: boolean;
  isStarted?: boolean;
  progress?: number;
  onStartPath?: (pathId: number) => void;
}

export default function LearningPathCard({
  path,
  isRecommended = false,
  isStarted = false,
  progress = 0,
  onStartPath,
}: LearningPathCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const cefrInfo = CEFR_LEVELS[path.cefrLevel];

  const handleStartPath = async () => {
    setIsLoading(true);
    try {
      await learningPathService.startPath(path.id);
      toast.success(`Started ${path.name}!`, {
        description: "You can now access the courses in this learning path.",
      });
      onStartPath?.(path.id);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err.response?.status === 409) {
        toast.info("Already started", {
          description: "You have already started this learning path.",
        });
      } else {
        toast.error("Failed to start path", {
          description: err.message || "Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative flex flex-col h-full hover:shadow-lg transition-shadow">
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 -right-3 z-10">
          <Badge className="bg-linear-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      <CardHeader>
        {/* CEFR Level Badge */}
        <div className="flex items-center gap-2 mb-2">
          <Badge className={`${cefrInfo.color} text-white border-0`}>
            <Award className="h-3 w-3 mr-1" />
            {path.cefrLevel} - {cefrInfo.label}
          </Badge>
          {isStarted && (
            <Badge
              variant="outline"
              className="border-green-500 text-green-700"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Started
            </Badge>
          )}
        </div>

        <CardTitle className="text-xl">{path.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {path.description || cefrInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{path.totalCourses} courses</span>
          </div>
          {path.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{path.estimatedHours}h</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isStarted && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isStarted ? (
          <Button asChild className="w-full">
            <Link href={`/learning-paths/${path.id}`}>View Progress</Link>
          </Button>
        ) : (
          <Button
            onClick={handleStartPath}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Starting..." : "Start Learning Path"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
