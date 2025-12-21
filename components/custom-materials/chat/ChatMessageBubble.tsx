"use client";

import { cn } from "@/lib/utils";
import { ChatMessage, GrammarError } from "@/types/custom-materials";
import { User, Bot, AlertCircle } from "lucide-react";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  corrections?: GrammarError[];
  showCorrections?: boolean;
  className?: string;
}

/**
 * Chat message bubble for role-play conversations.
 * Supports user and AI messages with optional grammar corrections.
 */
export function ChatMessageBubble({
  message,
  corrections,
  showCorrections = true,
  className,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-[#4285F4] text-white"
            : "bg-[#F1F3F4] dark:bg-[#2E2E2E] text-[#5F6368] dark:text-[#9AA0A6]"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isUser
              ? "bg-[#4285F4] text-white rounded-br-md"
              : "bg-[#F1F3F4] dark:bg-[#2E2E2E] text-[#202124] dark:text-[#E8EAED] rounded-bl-md"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "text-xs text-[#9AA0A6]",
            isUser ? "text-right" : "text-left"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        {/* Grammar corrections (for STRICT mode) */}
        {showCorrections && corrections && corrections.length > 0 && (
          <div className="mt-2 p-3 rounded-lg bg-[#FFF8E1] dark:bg-[#F57F17]/10 border border-[#FFE082] dark:border-[#F57F17]/30">
            <div className="flex items-center gap-2 text-[#F57F17] mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Grammar Feedback</span>
            </div>
            {corrections.map((correction, idx) => (
              <div
                key={idx}
                className="text-xs text-[#5D4037] dark:text-[#FFE082] space-y-1"
              >
                <p>
                  <span className="line-through text-[#D32F2F]">
                    {correction.original}
                  </span>
                  {" → "}
                  <span className="text-[#4CAF50] font-medium">
                    {correction.corrected}
                  </span>
                </p>
                <p className="text-[#795548] dark:text-[#FFCC80]">
                  {correction.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
