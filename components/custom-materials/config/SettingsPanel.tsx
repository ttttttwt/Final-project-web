"use client";

import { cn } from "@/lib/utils";
import { AiCorrectionMode } from "@/types/custom-materials";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings,
  GraduationCap,
  Smile,
  RefreshCw,
  BookMarked,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface SettingsPanelProps {
  aiCorrectionMode: AiCorrectionMode;
  styleLearnMode: boolean;
  syncVocabToSrs: boolean;
  generateFlashcardImages: boolean;
  onAiCorrectionModeChange: (mode: AiCorrectionMode) => void;
  onStyleLearnModeChange: (enabled: boolean) => void;
  onSyncVocabToSrsChange: (enabled: boolean) => void;
  onGenerateFlashcardImagesChange: (enabled: boolean) => void;
  className?: string;
}

/**
 * Settings panel for configuring learning preferences.
 */
export function SettingsPanel({
  aiCorrectionMode,
  styleLearnMode,
  syncVocabToSrs,
  generateFlashcardImages,
  onAiCorrectionModeChange,
  onStyleLearnModeChange,
  onSyncVocabToSrsChange,
  onGenerateFlashcardImagesChange,
  className,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-lg border border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]",
        className
      )}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-[#F5F5F5] dark:hover:bg-[#2E2E2E] transition-colors rounded-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-[#5F6368] dark:text-[#9AA0A6]" />
          <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
            Learning Preferences
          </span>
          <span className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
            (Optional)
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-[#5F6368] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-4 space-y-6">
        {/* AI Correction Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">
            AI Correction Style
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onAiCorrectionModeChange("POLITE")}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                aiCorrectionMode === "POLITE"
                  ? "border-[#4285F4] bg-[#4285F4]/5"
                  : "border-[#E0E0E0] dark:border-[#2E2E2E] hover:border-[#4285F4]"
              )}
            >
              <Smile
                className={cn(
                  "h-5 w-5",
                  aiCorrectionMode === "POLITE"
                    ? "text-[#4285F4]"
                    : "text-[#5F6368]"
                )}
              />
              <div className="text-left">
                <p
                  className={cn(
                    "font-medium text-sm",
                    aiCorrectionMode === "POLITE"
                      ? "text-[#4285F4]"
                      : "text-[#202124] dark:text-[#E8EAED]"
                  )}
                >
                  Polite Coach
                </p>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  Feedback at the end
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onAiCorrectionModeChange("STRICT")}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                aiCorrectionMode === "STRICT"
                  ? "border-[#4285F4] bg-[#4285F4]/5"
                  : "border-[#E0E0E0] dark:border-[#2E2E2E] hover:border-[#4285F4]"
              )}
            >
              <GraduationCap
                className={cn(
                  "h-5 w-5",
                  aiCorrectionMode === "STRICT"
                    ? "text-[#4285F4]"
                    : "text-[#5F6368]"
                )}
              />
              <div className="text-left">
                <p
                  className={cn(
                    "font-medium text-sm",
                    aiCorrectionMode === "STRICT"
                      ? "text-[#4285F4]"
                      : "text-[#202124] dark:text-[#E8EAED]"
                  )}
                >
                  Strict Teacher
                </p>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  Correct immediately
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Style Learn Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#2E2E2E]">
          <div className="flex items-center gap-3">
            <BookMarked className="h-5 w-5 text-[#5F6368] dark:text-[#9AA0A6]" />
            <div>
              <p className="font-medium text-sm text-[#202124] dark:text-[#E8EAED]">
                Show Explanations
              </p>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                Include detailed explanations in Style Transform
              </p>
            </div>
          </div>
          <Switch
            checked={styleLearnMode}
            onCheckedChange={onStyleLearnModeChange}
            aria-label="Toggle explanations"
          />
        </div>

        {/* Sync to SRS Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#2E2E2E]">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-[#5F6368] dark:text-[#9AA0A6]" />
            <div>
              <p className="font-medium text-sm text-[#202124] dark:text-[#E8EAED]">
                Sync Vocabulary to Daily Review
              </p>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                Add extracted words to your spaced repetition queue
              </p>
            </div>
          </div>
          <Switch
            checked={syncVocabToSrs}
            onCheckedChange={onSyncVocabToSrsChange}
            aria-label="Toggle vocabulary sync"
          />
        </div>

        {/* Generate Flashcard Images Toggle - Only visible when sync is enabled */}
        {syncVocabToSrs && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#2E2E2E] ml-6 border-l-2 border-[#4285F4]">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#4285F4]" />
              <div>
                <p className="font-medium text-sm text-[#202124] dark:text-[#E8EAED]">
                  Generate Flashcard Images
                </p>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  Use AI to create images for each vocabulary card
                </p>
              </div>
            </div>
            <Switch
              checked={generateFlashcardImages}
              onCheckedChange={onGenerateFlashcardImagesChange}
              aria-label="Toggle flashcard image generation"
            />
          </div>
        )}

        {/* Info box */}
        <div className="p-3 rounded-lg bg-[#E8F5E9] dark:bg-[#1B5E20]/20 border border-[#A5D6A7] dark:border-[#1B5E20]/30">
          <p className="text-sm text-[#2E7D32] dark:text-[#A5D6A7]">
            <strong>Tip:</strong> Default settings are optimized for most users.
            You can always change these later.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
