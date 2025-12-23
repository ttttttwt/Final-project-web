"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import { CustomMaterial, RolePlayContext } from "@/types/custom-materials";
import { RolePlayScenarioDTO } from "@/types/ai";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { EndSessionReport } from "./EndSessionReport";
import { RolePlaySidebar } from "@/components/ai/roleplay/RolePlaySidebar";
import { ModeToggle, ModeDescription } from "@/components/ai/roleplay/ModeToggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  ArrowLeft,
  Users,
  Bot,
  StopCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface MaterialChatInterfaceProps {
  material: CustomMaterial;
  onBack: () => void;
  className?: string;
}

/**
 * Converts Custom Material roleplay data to RolePlayScenarioDTO format
 * for compatibility with RolePlaySidebar component.
 */
function convertToScenario(
  rolePlay: RolePlayContext,
  material: CustomMaterial
): RolePlayScenarioDTO {
  // keyVocabulary in RolePlayContext can be string[] or VocabularyItem[], convert to RolePlayVocabularyItemDTO format
  const vocabulary = (rolePlay.keyVocabulary || []).map((v) => {
    if (typeof v === 'string') {
      return {
        term: v,
        definition: "",
      };
    }
    return {
      term: v.word || v.term || "",
      definition: v.definition || "",
      example: v.example,
      ipa: v.ipa,
    };
  });

  return {
    id: material.id,
    title: rolePlay.title || (typeof rolePlay.scenario === 'string' ? rolePlay.scenario : 'Role-Play Scenario'),
    context: rolePlay.description || (typeof rolePlay.scenario === 'string' ? rolePlay.scenario : ''),
    yourRole: rolePlay.yourRole || "Participant",
    aiRole: rolePlay.aiRole || "AI Partner",
    objectives: rolePlay.objectives || [],
    keyVocabulary: vocabulary,
    suggestedPrompts: rolePlay.suggestedPrompts || [],
    openingLine: rolePlay.openingLine || rolePlay.suggestedOpening,
    cefrLevel: "B1", // Default level, CustomMaterial doesn't have cefrLevel
    domain: "custom",
    contextDetails: rolePlay.contextDetails || {
      setting: rolePlay.description || '',
      situation: typeof rolePlay.scenario === 'string' ? rolePlay.scenario : '',
      keyInfo: rolePlay.objectives || [],
      yourGoal: `Practice as ${rolePlay.yourRole}`,
      tips: rolePlay.suggestedPrompts || [],
    },
  };
}

/**
 * Main chat interface for role-play practice with custom materials.
 * Mirrors the layout of ConversationChat from /ai/roleplay feature.
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
    dynamicPrompts,
    isLoadingPrompts,
    sendChatMessage,
    endChatSession,
    resetChatSession,
    startChatSession,
    fetchDynamicPrompts,
  } = useCustomMaterialStore();

  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [mode, setMode] = useState<"immersive" | "learning">("learning");

  const showReport = !!performanceReport;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat session if not already started
  useEffect(() => {
    const initChat = async () => {
      if (!chatSessionId && !performanceReport) {
        await startChatSession(material.id);
        // Fetch initial dynamic prompts after AI opening
        fetchDynamicPrompts(material.id);
      }
    };
    initChat();
  }, [chatSessionId, material.id, startChatSession, performanceReport, fetchDynamicPrompts]);

  // Get roleplay data (support both formats)
  const rolePlay = material.generatedContent?.rolePlay || material.generatedContent?.roleplay;
  const correctionMode = material.settings?.aiCorrectionMode || "POLITE";

  // Convert to scenario format for sidebar
  const scenario = useMemo(() => {
    if (!rolePlay) return null;
    return convertToScenario(rolePlay, material);
  }, [rolePlay, material]);

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
    } else {
      // Fetch new dynamic prompts after AI response
      fetchDynamicPrompts(material.id);
    }

    textareaRef.current?.focus();
  }, [input, isSendingMessage, material.id, sendChatMessage, fetchDynamicPrompts]);

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

  // Select prompt from sidebar
  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const isConversationEnded = showReport;

  return (
    <div className={cn("flex h-full overflow-hidden", className)}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header - matches ConversationChat style */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="min-w-0">
              <h2 className="font-semibold text-sm truncate">
                {rolePlay?.title || (typeof rolePlay?.scenario === 'string' ? rolePlay.scenario : material.title)}
              </h2>
              {rolePlay && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>You: {rolePlay.yourRole}</span>
                  <ChevronRight className="w-3 h-3" />
                  <Bot className="w-3 h-3" />
                  <span>{rolePlay.aiRole}</span>
                  {rolePlay.userCharacter && (
                    <>
                      <span className="text-primary">
                        (as {rolePlay.userCharacter})
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <ModeToggle
              mode={mode}
              onChange={setMode}
              disabled={isConversationEnded}
            />

            {/* Correction Mode Badge */}
            <Badge
              variant="outline"
              className={cn(
                "text-xs hidden sm:flex",
                correctionMode === "STRICT"
                  ? "border-destructive text-destructive"
                  : "border-primary text-primary"
              )}
            >
              {correctionMode === "STRICT" ? "Strict" : "Polite"}
            </Badge>

            {/* Sidebar Toggle (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden"
              aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
            >
              <BookOpen
                className={cn("w-5 h-5", showSidebar && "text-primary")}
              />
            </Button>

            {/* End Session */}
            {chatSessionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndSession}
                disabled={isEndingChat}
                className="text-destructive hover:text-destructive"
              >
                {isEndingChat ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <StopCircle className="w-4 h-4 mr-2" />
                )}
                End
              </Button>
            )}
          </div>
        </header>

        {/* Mode Description */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-muted/30">
          <ModeDescription mode={mode} />
        </div>

        {/* Messages - Scrollable Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Empty state */}
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-foreground font-medium">
                  Start the conversation
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  Type your message below to begin the role-play practice
                </p>
                {(rolePlay?.openingLine || rolePlay?.suggestedOpening) && (
                  <p className="text-sm text-primary mt-3 italic">
                    Tip: &ldquo;{rolePlay?.openingLine || rolePlay?.suggestedOpening}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Message List */}
            {chatMessages.map((message, idx) => (
              <ChatMessageBubble
                key={idx}
                message={message}
                corrections={message.corrections}
                showCorrections={mode === "learning" || correctionMode === "STRICT"}
              />
            ))}

            {/* Typing indicator */}
            {isSendingMessage && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input Area */}
        {!isConversationEnded && (
          <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isSendingMessage || isEndingChat}
                    className="min-h-[48px] max-h-32 pr-12 resize-none"
                    rows={1}
                    aria-label="Message input"
                  />
                  <span
                    className={cn(
                      "absolute right-3 bottom-2 text-xs",
                      input.length > 450 ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {input.length}/500
                  </span>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isSendingMessage}
                  size="icon"
                  className="h-12 w-12 flex-shrink-0"
                  aria-label="Send message"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Unified Sidebar (Desktop) - Using RolePlaySidebar */}
      <div className="hidden lg:block">
        <RolePlaySidebar
          scenario={scenario}
          vocabulary={scenario?.keyVocabulary}
          suggestedPrompts={dynamicPrompts.length > 0 ? dynamicPrompts : rolePlay?.suggestedPrompts}
          isLoadingPrompts={isLoadingPrompts}
          onSelectPrompt={handleSelectPrompt}
          isOpen={showSidebar}
          onToggle={() => setShowSidebar(!showSidebar)}
        />
      </div>

      {/* Sidebar (Mobile - Sheet/Drawer) */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Role play sidebar"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
            aria-hidden="true"
          />
          {/* Panel - slides in from right */}
          <div className="absolute right-0 top-0 h-full w-[min(320px,85vw)] bg-card shadow-xl animate-in slide-in-from-right duration-300">
            <RolePlaySidebar
              scenario={scenario}
              vocabulary={scenario?.keyVocabulary}
              suggestedPrompts={dynamicPrompts.length > 0 ? dynamicPrompts : rolePlay?.suggestedPrompts}
              isLoadingPrompts={isLoadingPrompts}
              onSelectPrompt={handleSelectPrompt}
              isOpen={true}
              onToggle={() => setShowSidebar(false)}
            />
          </div>
        </div>
      )}

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
