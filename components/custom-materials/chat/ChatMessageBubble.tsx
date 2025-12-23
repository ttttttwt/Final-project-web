"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage, GrammarError } from "@/types/custom-materials";
import {
  User,
  Bot,
  AlertCircle,
  Languages,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TranslationPopover } from "@/components/ai/roleplay/TranslationPopover";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  corrections?: GrammarError[];
  showCorrections?: boolean;
  className?: string;
}

/**
 * Chat message bubble for role-play conversations.
 * Supports user and AI messages with optional grammar corrections.
 * Includes translation and text-to-speech features.
 */
export function ChatMessageBubble({
  message,
  corrections,
  showCorrections = true,
  className,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const messageRef = useRef<HTMLDivElement>(null);

  // Translation state
  const [selectedText, setSelectedText] = useState<string>("");
  const [popoverPosition, setPopoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-Speech handler
  const handleSpeak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
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
    if (isUser) return;

    const selection = window.getSelection();
    const text = selection?.toString()?.trim();

    if (text && text.length > 0 && text.length <= 500) {
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setPopoverPosition({
          x: rect.left + rect.width / 2 - 140,
          y: rect.bottom,
        });
      }
    }
  }, [isUser]);

  // Close translation popover
  const handleClosePopover = useCallback(() => {
    setSelectedText("");
    setPopoverPosition(null);
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
            isUser
              ? "bg-[#4285F4] text-white"
              : "bg-[#F1F3F4] dark:bg-[#2E2E2E] text-[#5F6368] dark:text-[#9AA0A6]"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Message content */}
        <div className="flex flex-col gap-1">
          <div
            ref={messageRef}
            onMouseUp={handleMouseUp}
            className={cn(
              "rounded-2xl px-4 py-2 relative",
              isUser
                ? "bg-[#4285F4] text-white rounded-br-md"
                : "bg-[#F1F3F4] dark:bg-[#2E2E2E] text-[#202124] dark:text-[#E8EAED] rounded-bl-md cursor-text select-text"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

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
            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-70 transition-opacity ml-1">
              💡 Select text to translate
            </span>
          )}

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
