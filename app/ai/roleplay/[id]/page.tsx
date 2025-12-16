"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RolePlayConversationDTO,
  RolePlayScenarioDTO,
  RolePlaySendMessageDTO,
  RolePlayMessageDTO,
} from "@/types/ai";
import { aiRolePlayService } from "@/services/ai-roleplay.service";
import { ConversationChat } from "@/components/ai/roleplay";
import { AiHeader } from "@/components/ai/common";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

/**
 * Role-Play Conversation Page
 * Displays the active conversation with chat interface.
 */
export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<RolePlayConversationDTO | null>(null);
  const [scenario, setScenario] = useState<RolePlayScenarioDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversation data
  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const conv = await aiRolePlayService.getConversation(conversationId);
      setConversation(conv);

      // Load scenario if we have a scenarioId
      if (conv.scenarioId) {
        try {
          const scenarioData = await aiRolePlayService.getScenario(conv.scenarioId);
          setScenario(scenarioData);
        } catch {
          // Fallback to minimal scenario object if fetch fails
          setScenario({
            id: conv.scenarioId,
            title: "Role-Play Scenario",
            context: "",
            yourRole: "Participant",
            aiRole: "AI Partner",
            cefrLevel: "B1",
            domain: "general",
            objectives: [],
            keyVocabulary: [],
          });
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load conversation";
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Send a message with mode support
  const handleSendMessage = async (
    data: RolePlaySendMessageDTO,
    mode: "immersive" | "learning"
  ): Promise<RolePlayMessageDTO | null> => {
    if (!conversation) return null;

    try {
      // Optimistically add user message
      const userMessage: RolePlayMessageDTO = {
        role: "user",
        content: data.content,
        timestamp: new Date().toISOString(),
      };

      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, userMessage],
            }
          : null
      );

      // Send to API with mode-specific endpoint
      const aiResponse = await aiRolePlayService.sendMessageWithMode(
        conversationId,
        data,
        mode
      );

      // Update conversation with AI response
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, aiResponse],
            }
          : null
      );

      return aiResponse;
    } catch (err: any) {
      // Rollback optimistic update on error
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.slice(0, -1),
            }
          : null
      );
      throw err;
    }
  };

  // End the conversation
  const handleEndConversation = async () => {
    if (!conversation) return;

    try {
      // Call API to mark conversation as complete
      await aiRolePlayService.endConversation(conversationId);

      // Update local state
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              status: "completed",
            }
          : null
      );
    } catch (err: any) {
      // Even if API fails, update local state
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              status: "completed",
            }
          : null
      );
    }
  };

  // Navigate back
  const handleBack = () => {
    router.push("/ai/roleplay");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <AiHeader
          title="AI Roleplay"
          backHref="/ai/roleplay"
          backLabel="Roleplay"
        />
        {/* Chat area skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-[70%] ${i % 2 === 0 ? "ml-auto flex-row-reverse" : ""}`}
            >
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skeleton className={`h-16 ${i % 2 === 0 ? "w-48" : "w-64"} rounded-2xl`} />
            </div>
          ))}
        </div>
        {/* Input skeleton */}
        <div className="p-4 border-t">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !conversation) {
    return (
      <div className="h-screen flex flex-col">
        <AiHeader
          title="AI Roleplay"
          backHref="/ai/roleplay"
          backLabel="Roleplay"
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-destructive/10 rounded-full">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Conversation Not Found</h2>
                  <p className="text-muted-foreground mt-2">
                    {error || "The conversation you're looking for doesn't exist."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={loadConversation}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <AiHeader
        title={scenario?.title || "AI Roleplay"}
        backHref="/ai/roleplay"
        backLabel="Roleplay"
      />
      <div className="flex-1 overflow-hidden">
        <ConversationChat
          conversation={conversation}
          scenario={scenario}
          onSendMessage={handleSendMessage}
          onEndConversation={handleEndConversation}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
