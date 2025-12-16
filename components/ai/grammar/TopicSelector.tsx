"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GrammarTopicDTO } from "@/types/ai";
import { aiGrammarService } from "@/services/ai-grammar.service";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen } from "lucide-react";

interface TopicSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  cefrLevel?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Grammar topic selector with optional CEFR level filtering.
 * Groups topics by category.
 */
export function TopicSelector({
  value,
  onValueChange,
  cefrLevel,
  className,
  disabled = false,
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<GrammarTopicDTO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = cefrLevel
          ? await aiGrammarService.getTopicsByLevel(cefrLevel)
          : await aiGrammarService.getTopics();
        
        setTopics(data.filter(t => t.isActive));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(t => t.category))].sort();
        setCategories(uniqueCategories);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load topics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [cefrLevel]);

  // Group topics by category
  const topicsByCategory = categories.reduce((acc, category) => {
    acc[category] = topics.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, GrammarTopicDTO[]>);

  if (isLoading) {
    return <TopicSelectorSkeleton />;
  }

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-sm", className)}>
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="grammar-topic" className="flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Grammar Topic
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || topics.length === 0}
      >
        <SelectTrigger id="grammar-topic" className="w-full">
          <SelectValue placeholder="Select a grammar topic" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {categories.map((category) => (
            <SelectGroup key={category}>
              <SelectLabel className="font-semibold text-primary">
                {category}
              </SelectLabel>
              {topicsByCategory[category]?.map((topic) => (
                <SelectItem key={topic.id} value={topic.name}>
                  <div className="flex flex-col">
                    <span>{topic.name}</span>
                    {topic.description && (
                      <span className="text-xs text-muted-foreground">
                        {topic.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {topics.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          No topics available for this level.
        </p>
      )}
    </div>
  );
}

/**
 * Skeleton loader for TopicSelector.
 */
export function TopicSelectorSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
