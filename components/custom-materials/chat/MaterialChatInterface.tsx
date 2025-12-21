"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import { CustomMaterial } from "@/types/custom-materials";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { EndSessionReport } from "./EndSessionReport";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  ArrowLeft,
  Target,
  Users,
  StopCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface MaterialChatInterfaceProps {
  material: CustomMaterial;
  onBack: () => void;
  className?: string;
}

/**
 * Main chat interface for role-play practice with custom materials.
 */
export function MaterialChatInterface({
  material,
  onBack,
  className,
}: MaterialChatInterfaceProps) {
  const {
    chatMessages,
    chatSessionId,
    isSendingMessage,
    isEndingChat,
    performanceReport,
    sendChatMessage,
    endChatSession,
    resetChatSession,
  } = useCustomMaterialStore();

  const [input, setInput] = useState("");
  // Derive showReport from performanceReport instead of using effect + state
  const showReport = !!performanceReport;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const rolePlay = material.generatedContent?.rolePlay;
  const correctionMode = material.settings?.aiCorrectionMode || "POLITE";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Send message handler
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isSendingMessage) return;

    if (trimmedInput.length > 500) {
      toast.error("Message too long", {
        description: "Please keep your message under 500 characters.",
      });
      return;
    }

    setInput("");
    const result = await sendChatMessage(material.id, trimmedInput);

    if (!result) {
      toast.error("Failed to send message", {
        description: "Please try again.",
      });
    }

    textareaRef.current?.focus();
  }, [input, isSendingMessage, material.id, sendChatMessage]);

  // End session handler
  const handleEndSession = useCallback(async () => {
    if (!chatSessionId) return;

    const result = await endChatSession(material.id);
    if (!result) {
      toast.error("Failed to end session", {
        description: "Please try again.",
      });
    }
  }, [chatSessionId, material.id, endChatSession]);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close report and reset
  const handleCloseReport = () => {
    resetChatSession();
  };

  // Practice again
  const handlePracticeAgain = () => {
    resetChatSession();
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-[#202124] dark:text-[#E8EAED] truncate">
              {rolePlay?.scenario || material.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {rolePlay && (
                <>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {rolePlay.yourRole} ↔ {rolePlay.aiRole}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      correctionMode === "STRICT"
                        ? "border-[#D32F2F] text-[#D32F2F]"
                        : "border-[#4285F4] text-[#4285F4]"
                    )}
                  >
                    {correctionMode === "STRICT" ? "Strict Mode" : "Polite Mode"}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {chatSessionId && (
            <Button
              variant="outline"
              onClick={handleEndSession}
              disabled={isEndingChat}
              className="gap-2"
            >
              {isEndingChat ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <StopCircle className="h-4 w-4" />
              )}
              End Session
            </Button>
          )}
        </div>

        {/* Context panel */}
        {rolePlay && !chatSessionId && (
          <div className="mt-4 p-3 rounded-lg bg-[#E3F2FD] dark:bg-[#4285F4]/10 border border-[#90CAF9] dark:border-[#4285F4]/30">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-[#1565C0] dark:text-[#90CAF9] mt-0.5" />
              <div className="text-sm text-[#1565C0] dark:text-[#90CAF9]">
                <p className="font-medium mb-1">Scenario Context</p>
                <p className="text-[#1976D2] dark:text-[#64B5F6]">
                  {rolePlay.scenario}
                </p>
                {rolePlay.objectives.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Objectives:
                    </p>
                    <ul className="list-disc list-inside text-[#1976D2] dark:text-[#64B5F6]">
                      {rolePlay.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rolePlay.suggestedOpening && (
                  <p className="mt-2 italic">
                    Tip: &ldquo;{rolePlay.suggestedOpening}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA] dark:bg-[#121212]">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="h-12 w-12 text-[#9AA0A6] mb-4" />
            <p className="text-[#5F6368] dark:text-[#9AA0A6] font-medium">
              Start the conversation
            </p>
            <p className="text-sm text-[#9AA0A6] max-w-xs mt-1">
              Type your message below to begin the role-play practice
            </p>
          </div>
        )}

        {chatMessages.map((message, idx) => (
          <ChatMessageBubble
            key={idx}
            message={message}
            showCorrections={correctionMode === "STRICT"}
          />
        ))}

        {/* Typing indicator */}
        {isSendingMessage && (
          <div className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] p-4">
        <div className="flex gap-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={isSendingMessage || isEndingChat}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSendingMessage}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            {isSendingMessage ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-[#9AA0A6] mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Performance Report Modal */}
      {showReport && performanceReport && (
        <EndSessionReport
          report={performanceReport}
          onClose={handleCloseReport}
          onPracticeAgain={handlePracticeAgain}
        />
      )}
    </div>
  );
}
