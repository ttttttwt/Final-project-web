"use client";

import { useEffect, useCallback } from "react";

interface FlashcardKeyboardOptions {
  onFlip?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onEscape?: () => void;
  onUndo?: () => void;
  disabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts in flashcard study sessions.
 *
 * Keyboard shortcuts:
 * - Space / Enter: Flip card
 * - ArrowLeft: Don't know (swipe left)
 * - ArrowRight: Know (swipe right)
 * - Escape: Exit session
 * - Ctrl+Z / Cmd+Z: Undo last action
 * - 1-5: Rate card directly (quality 1-5)
 */
export function useFlashcardKeyboard({
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  onEscape,
  onUndo,
  disabled = false,
}: FlashcardKeyboardOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case " ":
        case "Enter":
          event.preventDefault();
          onFlip?.();
          break;

        case "ArrowLeft":
          event.preventDefault();
          onSwipeLeft?.();
          break;

        case "ArrowRight":
          event.preventDefault();
          onSwipeRight?.();
          break;

        case "Escape":
          event.preventDefault();
          onEscape?.();
          break;

        case "z":
        case "Z":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onUndo?.();
          }
          break;

        default:
          break;
      }
    },
    [disabled, onFlip, onSwipeLeft, onSwipeRight, onEscape, onUndo]
  );

  useEffect(() => {
    if (disabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, disabled]);
}

/**
 * Hook for numeric rating shortcuts (1-5)
 */
export function useRatingKeyboard(
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void,
  disabled = false
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Don't trigger if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Number keys 1-5 for direct rating
      const num = parseInt(event.key, 10);
      if (num >= 1 && num <= 5) {
        event.preventDefault();
        onRate(num as 1 | 2 | 3 | 4 | 5);
      }

      // 0 key for "complete blackout"
      if (event.key === "0") {
        event.preventDefault();
        onRate(0);
      }
    },
    [disabled, onRate]
  );

  useEffect(() => {
    if (disabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, disabled]);
}

/**
 * Keyboard shortcuts help text for display in UI
 */
export const FLASHCARD_SHORTCUTS = [
  { key: "Space / Enter", action: "Flip card" },
  { key: "← Arrow Left", action: "Don't know" },
  { key: "→ Arrow Right", action: "Know" },
  { key: "Esc", action: "Exit session" },
  { key: "Ctrl/Cmd + Z", action: "Undo" },
];

/**
 * Component to display keyboard shortcuts
 */
export function KeyboardShortcutsHelp({ className }: { className?: string }) {
  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {FLASHCARD_SHORTCUTS.map(({ key, action }) => (
          <li key={key} className="flex items-center justify-between">
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
              {key}
            </kbd>
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
