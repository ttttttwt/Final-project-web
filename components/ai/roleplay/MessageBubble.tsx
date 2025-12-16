"use client";

import { cn } from "@/lib/utils";
import { RolePlayMessageDTO } from "@/types/ai";
import { User, Bot, AlertCircle, Lightbulb, BookOpen } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageBubbleProps {
  message: RolePlayMessageDTO;
  isLearningMode?: boolean;
  className?: string;
}

/**
 * Chat message bubble component for role-play conversations.
 * Displays user/AI messages with different styling and optional feedback.
 */
export function MessageBubble({
  message,
  isLearningMode = false,
  className,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasFeedback = isLearningMode && message.feedback && !isUser;

  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), "HH:mm")
    : "";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%] group",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formattedTime}
        </span>

        {/* Learning Mode Feedback */}
        {hasFeedback && <FeedbackSection feedback={message.feedback!} />}
      </div>
    </div>
  );
}

interface FeedbackSectionProps {
  feedback: Record<string, any>;
}

/**
 * Displays grammar and vocabulary feedback for learning mode messages.
 */
function FeedbackSection({ feedback }: FeedbackSectionProps) {
  const hasGrammar = feedback.grammarCorrections?.length > 0;
  const hasVocabulary = feedback.vocabularySuggestions?.length > 0;
  const hasTips = feedback.tips?.length > 0;

  if (!hasGrammar && !hasVocabulary && !hasTips) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Grammar Corrections */}
      {hasGrammar && (
        <TooltipProvider>
          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Grammar feedback</p>
              </TooltipContent>
            </Tooltip>
            <div className="space-y-1">
              {feedback.grammarCorrections.map((correction: any, idx: number) => (
                <p key={idx} className="text-amber-800 dark:text-amber-200">
                  <span className="line-through text-amber-600 dark:text-amber-400">
                    {correction.original}
                  </span>
                  {" → "}
                  <span className="font-medium">{correction.corrected}</span>
                </p>
              ))}
            </div>
          </div>
        </TooltipProvider>
      )}

      {/* Vocabulary Suggestions */}
      {hasVocabulary && (
        <TooltipProvider>
          <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Tooltip>
              <TooltipTrigger asChild>
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Vocabulary suggestions</p>
              </TooltipContent>
            </Tooltip>
            <div className="space-y-1">
              {feedback.vocabularySuggestions.map((suggestion: string, idx: number) => (
                <p key={idx} className="text-blue-800 dark:text-blue-200">
                  {suggestion}
                </p>
              ))}
            </div>
          </div>
        </TooltipProvider>
      )}

      {/* Tips */}
      {hasTips && (
        <TooltipProvider>
          <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <Tooltip>
              <TooltipTrigger asChild>
                <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Learning tips</p>
              </TooltipContent>
            </Tooltip>
            <div className="space-y-1">
              {feedback.tips.map((tip: string, idx: number) => (
                <p key={idx} className="text-green-800 dark:text-green-200">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
