"use client";

import { cn } from "@/lib/utils";
import { RolePlayVocabularyItemDTO } from "@/types/ai";
import { BookOpen, Volume2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface VocabularyPanelProps {
  vocabulary: RolePlayVocabularyItemDTO[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Vocabulary hints sidebar for role-play conversations.
 * Displays key vocabulary with definitions and examples.
 */
export function VocabularyPanel({
  vocabulary,
  isOpen = true,
  onClose,
  className,
}: VocabularyPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!isOpen || vocabulary.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "bg-card border-l border-border flex flex-col",
        "w-full max-w-[320px] h-full",
        className
      )}
      aria-label="Vocabulary hints"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Key Vocabulary</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {vocabulary.length}
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close vocabulary panel"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Vocabulary List */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-2">
          {vocabulary.map((item, index) => (
            <VocabularyItem
              key={index}
              item={item}
              isExpanded={expandedItems.has(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer tip */}
      <div className="px-4 py-3 border-t border-border bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          💡 Use these words in your conversation to practice!
        </p>
      </div>
    </aside>
  );
}

interface VocabularyItemProps {
  item: RolePlayVocabularyItemDTO;
  isExpanded: boolean;
  onToggle: () => void;
}

function VocabularyItem({ item, isExpanded, onToggle }: VocabularyItemProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background transition-all duration-200",
        isExpanded ? "shadow-sm" : ""
      )}
    >
      <div className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors rounded-lg">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left cursor-pointer"
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isExpanded ? "rotate-90" : ""
            )}
          />
          <span className="font-medium text-sm">{item.term}</span>
        </button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  // Text-to-speech functionality
                  if ("speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(item.term);
                    utterance.lang = "en-US";
                    speechSynthesis.speak(utterance);
                  }
                }}
                aria-label={`Pronounce ${item.term}`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Listen to pronunciation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
          <div className="pl-6 space-y-2">
            {/* Definition */}
            <p className="text-sm text-muted-foreground">{item.definition}</p>

            {/* Example */}
            {item.example && (
              <div className="p-2 bg-muted/50 rounded-md border-l-2 border-primary">
                <p className="text-xs text-muted-foreground mb-1">Example:</p>
                <p className="text-sm italic">&ldquo;{item.example}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
