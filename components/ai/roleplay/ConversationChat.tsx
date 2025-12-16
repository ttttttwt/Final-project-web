"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  RolePlayConversationDTO,
  RolePlayMessageDTO,
  RolePlayScenarioDTO,
  RolePlaySendMessageDTO,
} from "@/types/ai";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { VocabularyPanel } from "./VocabularyPanel";
import { ModeToggle, ModeDescription } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  BookOpen,
  XCircle,
  Loader2,
  Users,
  Bot,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface ConversationChatProps {
  conversation: RolePlayConversationDTO;
  scenario: RolePlayScenarioDTO | null;
  onSendMessage: (message: RolePlaySendMessageDTO, mode: "immersive" | "learning") => Promise<RolePlayMessageDTO | null>;
  onEndConversation: () => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Main chat interface for role-play conversations.
 * Includes message history, input, vocabulary panel, and mode toggle.
 */
export function ConversationChat({
  conversation,
  scenario,
  onSendMessage,
  onEndConversation,
  onBack,
  isLoading = false,
  className,
}: ConversationChatProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(true);
  const [mode, setMode] = useState<"immersive" | "learning">(conversation.mode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, scrollToBottom]);

  // Handle send message
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isSending) return;

    // Validate input length
    if (trimmedInput.length > 500) {
      toast.error("Message too long", {
        description: "Please keep your message under 500 characters.",
      });
      return;
    }

    setIsSending(true);
    setInput("");

    try {
      // Pass current mode to the send handler
      const response = await onSendMessage({ content: trimmedInput }, mode);
      if (!response) {
        toast.error("Failed to send message", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error sending message", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle end conversation
  const handleEndConversation = async () => {
    setIsEnding(true);
    try {
      await onEndConversation();
      toast.success("Conversation ended", {
        description: "Great practice session!",
      });
    } catch (error) {
      toast.error("Failed to end conversation");
    } finally {
      setIsEnding(false);
    }
  };

  const isConversationEnded = conversation.status !== "in_progress";

  return (
    <div className={cn("flex h-full", className)}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
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
                {scenario?.title || "Role-Play Conversation"}
              </h2>
              {scenario && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>You: {scenario.yourRole}</span>
                  <ChevronRight className="w-3 h-3" />
                  <Bot className="w-3 h-3" />
                  <span>{scenario.aiRole}</span>
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

            {/* Vocabulary Toggle (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVocabulary(!showVocabulary)}
              className="lg:hidden"
              aria-label={showVocabulary ? "Hide vocabulary" : "Show vocabulary"}
            >
              <BookOpen
                className={cn("w-5 h-5", showVocabulary && "text-primary")}
              />
            </Button>

            {/* End Conversation */}
            {!isConversationEnded && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndConversation}
                disabled={isEnding}
                className="text-destructive hover:text-destructive"
              >
                {isEnding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                End
              </Button>
            )}
          </div>
        </header>

        {/* Mode Description */}
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <ModeDescription mode={mode} />
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Opening Line from Scenario */}
            {scenario?.openingLine && conversation.messages.length === 0 && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted text-foreground text-sm">
                  <p>{scenario.openingLine}</p>
                </div>
              </div>
            )}

            {/* Message List */}
            {conversation.messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isLearningMode={mode === "learning"}
              />
            ))}

            {/* Typing Indicator */}
            {isSending && <TypingIndicator />}

            {/* Conversation Ended Badge */}
            {isConversationEnded && (
              <div className="flex justify-center py-4">
                <Badge variant="secondary" className="text-sm">
                  Conversation {conversation.status === "completed" ? "completed" : "ended"}
                </Badge>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

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
                    disabled={isSending || isLoading}
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
                  disabled={!input.trim() || isSending || isLoading}
                  size="icon"
                  className="h-12 w-12 flex-shrink-0"
                  aria-label="Send message"
                >
                  {isSending ? (
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

      {/* Vocabulary Panel (Desktop) */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300",
          showVocabulary ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        {scenario?.keyVocabulary && (
          <VocabularyPanel
            vocabulary={scenario.keyVocabulary}
            isOpen={showVocabulary}
            onClose={() => setShowVocabulary(false)}
          />
        )}
      </div>

      {/* Vocabulary Panel (Mobile - Sheet/Drawer) */}
      {showVocabulary && scenario?.keyVocabulary && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Vocabulary panel"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowVocabulary(false)}
            aria-hidden="true"
          />
          {/* Panel - slides in from right */}
          <div className="absolute right-0 top-0 h-full w-[min(320px,85vw)] bg-card shadow-xl animate-in slide-in-from-right duration-300">
            <VocabularyPanel
              vocabulary={scenario.keyVocabulary}
              isOpen={true}
              onClose={() => setShowVocabulary(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
