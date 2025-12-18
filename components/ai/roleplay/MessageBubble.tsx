"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RolePlayMessageDTO } from "@/types/ai";
import { User, Bot, AlertCircle, Lightbulb, BookOpen, Languages, Volume2, VolumeX, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TranslationPopover } from "./TranslationPopover";

interface MessageBubbleProps {
  message: RolePlayMessageDTO;
  isLearningMode?: boolean;
  className?: string;
}

/**
 * Chat message bubble component for role-play conversations.
 * Displays user/AI messages with different styling and optional feedback.
 * Supports text selection translation for AI messages.
 */
export function MessageBubble({
  message,
  isLearningMode = false,
  className,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasFeedback = isLearningMode && message.feedback && !isUser;
  const messageRef = useRef<HTMLDivElement>(null);

  // Translation state
  const [selectedText, setSelectedText] = useState<string>("");
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [showFullTranslation, setShowFullTranslation] = useState(false);

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), "HH:mm")
    : "";

  // Text-to-Speech handler
  const handleSpeak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      // Stop speaking
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  }, [message.content, isSpeaking]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  // Handle text selection for translation
  const handleMouseUp = useCallback(() => {
    if (isUser) return; // Only allow translation for AI messages

    const selection = window.getSelection();
    const text = selection?.toString()?.trim();

    if (text && text.length > 0 && text.length <= 500) {
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setPopoverPosition({
          x: rect.left + rect.width / 2 - 140, // Center popover
          y: rect.bottom,
        });
      }
    }
  }, [isUser]);

  // Close translation popover
  const handleClosePopover = useCallback(() => {
    setSelectedText("");
    setPopoverPosition(null);
    setShowFullTranslation(false);
    // Clear selection
    window.getSelection()?.removeAllRanges();
  }, []);

  // Translate full message
  const handleTranslateFullMessage = useCallback(() => {
    if (messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      setSelectedText(message.content);
      setPopoverPosition({
        x: rect.left,
        y: rect.bottom,
      });
      setShowFullTranslation(true);
    }
  }, [message.content]);

  return (
    <>
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
            ref={messageRef}
            onMouseUp={handleMouseUp}
            className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed relative",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md cursor-text select-text"
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>

            {/* Action buttons for AI messages */}
            {!isUser && (
              <div className="absolute -right-2 -bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Speak button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6 bg-background shadow-sm border",
                          isSpeaking && "text-primary bg-primary/10"
                        )}
                        onClick={handleSpeak}
                        aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isSpeaking ? "Stop" : "Read aloud"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Translate button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-background shadow-sm border"
                        onClick={handleTranslateFullMessage}
                        aria-label="Translate message"
                      >
                        <Languages className="w-3.5 h-3.5 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Translate</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          {/* Hint for text selection */}
          {!isUser && (
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-70 transition-opacity">
              💡 Select text to translate
            </span>
          )}

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

      {/* Translation Popover */}
      {selectedText && popoverPosition && (
        <TranslationPopover
          text={selectedText}
          position={popoverPosition}
          onClose={handleClosePopover}
        />
      )}
    </>
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
