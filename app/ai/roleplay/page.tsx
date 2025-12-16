"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  RolePlayRequestDTO,
  RolePlayScenarioDTO,
  RolePlayStartConversationDTO,
} from "@/types/ai";
import { aiRolePlayService } from "@/services/ai-roleplay.service";
import { ScenarioCard, ScenarioCardSkeleton } from "@/components/ai/roleplay";
import { ModeToggle, ModeDescription } from "@/components/ai/roleplay";
import { AiPageWrapper, AiErrorCard, RoleplaySkeleton, AiLoadingState } from "@/components/ai/common";
import { RetryButtonWithCountdown } from "@/components/ai/common";
import { useRetryWithBackoff } from "@/hooks/useRetryWithBackoff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Sparkles,
  History,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const DOMAINS = [
  "meetings",
  "negotiations",
  "presentations",
  "interviews",
  "networking",
  "customer-service",
  "emails",
  "phone-calls",
] as const;

/**
 * Role-Play Scenario Selection Page
 * Allows users to generate new scenarios or browse existing ones.
 */
export default function RolePlayPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarting, setIsStarting] = useState<string | null>(null);
  const [generatedScenario, setGeneratedScenario] = useState<RolePlayScenarioDTO | null>(null);
  const [mode, setMode] = useState<"immersive" | "learning">("learning");
  const [error, setError] = useState<string | null>(null);

  // Form state for scenario generation
  const [formData, setFormData] = useState<RolePlayRequestDTO>({
    cefrLevel: "B1",
    domain: "meetings",
    industry: "",
    userContext: "",
  });

  // Generate a new scenario
  const handleGenerateScenario = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedScenario(null);

    try {
      const scenario = await aiRolePlayService.generateScenario(formData);
      setGeneratedScenario(scenario);
      toast.success("Scenario generated!", {
        description: scenario.title,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to generate scenario";
      setError(message);
      toast.error("Generation failed", { description: message });
    } finally {
      setIsGenerating(false);
    }
  };

  // Start a conversation with the selected scenario
  const handleStartConversation = async (scenario: RolePlayScenarioDTO) => {
    setIsStarting(scenario.id);

    try {
      const data: RolePlayStartConversationDTO = {
        scenarioId: scenario.id,
        mode,
      };
      const conversation = await aiRolePlayService.startConversation(data);
      
      // Navigate to the conversation page
      router.push(`/ai/roleplay/${conversation.id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to start conversation";
      toast.error("Error", { description: message });
      setIsStarting(null);
    }
  };

  return (
    <AiPageWrapper
      title="AI Roleplay"
      backHref="/dashboard"
      backLabel="Dashboard"
      feature="roleplay"
      showQuota={true}
      showNetworkStatus={true}
    >
      {/* Page Description */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Practice English conversations in realistic business scenarios with AI.
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Conversation Mode
              </Label>
              <ModeDescription mode={mode} />
            </div>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="generate" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Scenario
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Past Conversations
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Scenario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CEFR Level */}
                <div className="space-y-2">
                  <Label htmlFor="cefrLevel">CEFR Level</Label>
                  <Select
                    value={formData.cefrLevel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        cefrLevel: value as RolePlayRequestDTO["cefrLevel"],
                      }))
                    }
                  >
                    <SelectTrigger id="cefrLevel">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {CEFR_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level} - {getLevelDescription(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <Label htmlFor="domain">Business Domain</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, domain: value }))
                    }
                  >
                    <SelectTrigger id="domain">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {formatDomain(domain)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={formData.industry || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* User Context (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="userContext">Additional Context (Optional)</Label>
                  <Input
                    id="userContext"
                    placeholder="e.g., I want to practice handling objections"
                    value={formData.userContext || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        userContext: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateScenario}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Scenario
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Scenario Preview */}
            <div>
              {isGenerating && (
                <div className="space-y-4">
                  <RoleplaySkeleton />
                  <AiLoadingState 
                    variant="generating" 
                    message="Creating your personalized scenario..."
                  />
                </div>
              )}

              {error && !isGenerating && (
                <AiErrorCard
                  message={error}
                  onRetry={handleGenerateScenario}
                  onReset={() => setError(null)}
                />
              )}

              {generatedScenario && !isGenerating && (
                <ScenarioCard
                  scenario={generatedScenario}
                  onStart={handleStartConversation}
                  isLoading={isStarting === generatedScenario.id}
                />
              )}

              {!generatedScenario && !isGenerating && !error && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-4 py-8">
                      <div className="p-4 bg-muted rounded-full">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">No Scenario Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fill out the form and click &quot;Generate Scenario&quot; to create
                          a custom practice scenario.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <ConversationHistory onResume={(id) => router.push(`/ai/roleplay/${id}`)} />
        </TabsContent>
      </Tabs>
    </AiPageWrapper>
  );
}

// Helper component for conversation history
function ConversationHistory({ onResume }: { onResume: (id: string) => void }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount
  useState(() => {
    loadConversations();
  });

  async function loadConversations() {
    try {
      const response = await aiRolePlayService.getConversations(0, 20);
      setConversations(response.content || []);
    } catch (err) {
      setError("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <ScenarioCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center py-12">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No Conversations Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Start a new conversation to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {conversations.map((conv) => (
        <Card
          key={conv.id}
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onResume(conv.id)}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  conv.status === "in_progress"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {conv.status === "in_progress" ? "In Progress" : "Completed"}
              </span>
              <span className="text-xs text-muted-foreground">
                {conv.mode === "learning" ? "Learning" : "Immersive"}
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-2">
              {conv.messages?.[0]?.content || "No messages yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {conv.messages?.length || 0} messages
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper functions
function getLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Proficient",
  };
  return descriptions[level] || "";
}

function formatDomain(domain: string): string {
  return domain
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
