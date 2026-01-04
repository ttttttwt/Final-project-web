"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useCefrLevelRestriction } from "@/hooks/useCefrLevelRestriction";
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
  Trash2,
  Search,
  Filter,
  Lock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useTranslation } from "@/lib/i18n";

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

// LocalStorage key for persisting generated scenario
const GENERATED_SCENARIO_KEY = "lexia_generated_scenario";

/**
 * Role-Play Scenario Selection Page
 * Allows users to generate new scenarios or browse existing ones.
 */
export default function RolePlayPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userLevel, isAccessible, getWarning, allLevels, hasPlacementLevel } = useCefrLevelRestriction();
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarting, setIsStarting] = useState<string | null>(null);
  const [generatedScenario, setGeneratedScenario] = useState<RolePlayScenarioDTO | null>(null);
  const [mode, setMode] = useState<"immersive" | "learning">("learning");
  const [error, setError] = useState<string | null>(null);

  // Form state for scenario generation - default to user's level or A1
  const [formData, setFormData] = useState<RolePlayRequestDTO>(() => ({
    cefrLevel: (userLevel as "A1" | "A2" | "B1" | "B2" | "C1" | "C2") || "A1",
    domain: "meetings",
    industry: "",
    userContext: "",
  }));

  // Update form level when user level loads
  useEffect(() => {
    if (userLevel) {
      setFormData((prev) => ({
        ...prev,
        cefrLevel: userLevel as typeof prev.cefrLevel,
      }));
    }
  }, [userLevel]);

  // Load persisted scenario on mount
  useEffect(() => {
    const loadPersistedScenario = async () => {
      try {
        const savedScenarioId = localStorage.getItem(GENERATED_SCENARIO_KEY);
        if (savedScenarioId && !generatedScenario) {
          const scenario = await aiRolePlayService.getScenario(savedScenarioId);
          if (scenario) {
            setGeneratedScenario(scenario);
          }
        }
      } catch (err) {
        // Scenario might have been deleted or expired, clear localStorage
        localStorage.removeItem(GENERATED_SCENARIO_KEY);
      }
    };
    loadPersistedScenario();
  }, []);

  // Generate a new scenario
  const handleGenerateScenario = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedScenario(null);
    // Clear old scenario from localStorage
    localStorage.removeItem(GENERATED_SCENARIO_KEY);

    try {
      const scenario = await aiRolePlayService.generateScenario(formData);
      setGeneratedScenario(scenario);
      // Save scenario ID to localStorage for persistence
      localStorage.setItem(GENERATED_SCENARIO_KEY, scenario.id);
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

      // Clear persisted scenario after starting conversation
      localStorage.removeItem(GENERATED_SCENARIO_KEY);

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
      title={t("ai.roleplay.title")}
      backHref="/dashboard"
      backLabel={t("ai.common.backToDashboard")}
      feature="roleplay"
      showQuota={true}
      showNetworkStatus={true}
    >
      {/* Page Description */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {t("ai.roleplay.description")}
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t("ai.roleplay.conversationMode")}
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
            {t("ai.roleplay.generateScenario")}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            {t("ai.roleplay.pastConversations")}
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
                  {t("ai.roleplay.createNewScenario")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CEFR Level */}
                <div className="space-y-2">
                  <Label htmlFor="cefrLevel">
                    {t("ai.roleplay.cefrLevel")}
                    {hasPlacementLevel && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({t("ai.roleplay.recommended")}: {userLevel})
                      </span>
                    )}
                  </Label>
                  <Select
                    value={formData.cefrLevel}
                    onValueChange={(value) => {
                      const warning = getWarning(value);
                      if (warning) {
                        toast.warning(t("ai.roleplay.levelAboveProficiency"), {
                          description: warning,
                          duration: 5000,
                        });
                      }
                      setFormData((prev) => ({
                        ...prev,
                        cefrLevel: value as RolePlayRequestDTO["cefrLevel"],
                      }));
                    }}
                  >
                    <SelectTrigger id="cefrLevel">
                      <SelectValue placeholder={t("ai.roleplay.selectLevel")} />
                    </SelectTrigger>
                    <SelectContent>
                      {allLevels.map((level) => {
                        const accessible = isAccessible(level);
                        return (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center gap-2">
                              {accessible ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Lock className="w-3 h-3 text-amber-500" />
                              )}
                              <span className={!accessible ? "text-muted-foreground" : ""}>
                                {level} - {getLevelDescription(level)}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {!hasPlacementLevel && (
                    <p className="text-xs text-amber-600">
                      {t("ai.roleplay.takePlacement")}
                    </p>
                  )}
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <Label htmlFor="domain">{t("ai.roleplay.businessDomain")}</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, domain: value }))
                    }
                  >
                    <SelectTrigger id="domain">
                      <SelectValue placeholder={t("ai.roleplay.selectDomain")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meetings">{t("ai.roleplay.domainMeetings")}</SelectItem>
                      <SelectItem value="negotiations">{t("ai.roleplay.domainNegotiations")}</SelectItem>
                      <SelectItem value="presentations">{t("ai.roleplay.domainPresentations")}</SelectItem>
                      <SelectItem value="interviews">{t("ai.roleplay.domainInterviews")}</SelectItem>
                      <SelectItem value="networking">{t("ai.roleplay.domainNetworking")}</SelectItem>
                      <SelectItem value="customer-service">{t("ai.roleplay.domainCustomerService")}</SelectItem>
                      <SelectItem value="emails">{t("ai.roleplay.domainEmails")}</SelectItem>
                      <SelectItem value="phone-calls">{t("ai.roleplay.domainPhoneCalls")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="industry">{t("ai.roleplay.industryOptional")}</Label>
                  <Input
                    id="industry"
                    placeholder={t("ai.roleplay.industryPlaceholder")}
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
                  <Label htmlFor="userContext">{t("ai.roleplay.additionalContext")}</Label>
                  <Input
                    id="userContext"
                    placeholder={t("ai.roleplay.contextPlaceholder")}
                    value={formData.userContext || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        userContext: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  onClick={handleGenerateScenario}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("ai.common.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("ai.roleplay.generateScenario")}
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
                    message={t("ai.roleplay.creatingScenario")}
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
                        <h3 className="font-semibold text-lg">{t("ai.roleplay.noScenarioYet")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("ai.roleplay.fillFormToGenerate")}
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

// Helper component for conversation history with filters
type StatusFilter = "all" | "in_progress" | "completed";

function ConversationHistory({ onResume }: { onResume: (id: string) => void }) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load conversations on mount and when filter changes
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const response = await aiRolePlayService.getConversations(0, 50);
      setConversations(response.content || []);
    } catch (err) {
      setError("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Delete conversation handler
  const handleDelete = async (e: React.MouseEvent, convId: string, status: string) => {
    e.stopPropagation();

    if (status === "in_progress") {
      toast.error(t("ai.roleplay.cannotDelete"), {
        description: t("ai.roleplay.completeFirst"),
      });
      return;
    }

    if (!confirm(t("ai.roleplay.deleteConfirm"))) {
      return;
    }

    setDeletingId(convId);
    try {
      await aiRolePlayService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      toast.success(t("ai.roleplay.conversationDeleted"));
    } catch (err) {
      toast.error(t("ai.roleplay.failedToDelete"));
    } finally {
      setDeletingId(null);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Status filter
    if (statusFilter !== "all" && conv.status !== statusFilter) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const firstMessage = conv.messages?.[0]?.content?.toLowerCase() || "";
      return firstMessage.includes(query);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <ScenarioCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={loadConversations} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("ai.common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("ai.roleplay.searchConversations")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { value: "all", label: t("ai.roleplay.all") },
            { value: "in_progress", label: t("ai.roleplay.ongoing") },
            { value: "completed", label: t("ai.roleplay.completed") },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as StatusFilter)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                statusFilter === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">
              {conversations.length === 0 ? t("ai.roleplay.noConversationsYet") : t("ai.roleplay.noMatches")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {conversations.length === 0
                ? t("ai.roleplay.startNewConversation")
                : t("ai.roleplay.noMatchFilter")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConversations.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer hover:border-primary/50 transition-colors group relative"
              onClick={() => onResume(conv.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      conv.status === "in_progress"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : conv.status === "completed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {conv.status === "in_progress" ? t("ai.roleplay.ongoing") : conv.status === "completed" ? t("ai.roleplay.completed") : "Ended"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {conv.mode === "learning" ? t("ai.roleplay.learning") : t("ai.roleplay.immersive")}
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-2 pr-8">
                  {conv.messages?.[0]?.content || t("ai.roleplay.noMessagesYet")}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {conv.messages?.length || 0} {t("ai.roleplay.messages")}
                  </p>
                  {conv.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(e, conv.id, conv.status)}
                  disabled={deletingId === conv.id}
                  className={cn(
                    "absolute top-3 right-3 p-1.5 rounded-md transition-all",
                    "opacity-0 group-hover:opacity-100",
                    conv.status === "in_progress"
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  )}
                  title={conv.status === "in_progress" ? "Complete conversation first" : "Delete conversation"}
                >
                  {deletingId === conv.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
