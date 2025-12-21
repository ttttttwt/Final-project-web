"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FlashcardCardDTO } from "@/types/ai";
import { FlashCard } from "./FlashCard";
import { X, Check, RotateCcw } from "lucide-react";

interface SwipeableCardProps {
  card: FlashcardCardDTO;
  onSwipeLeft: () => void; // Don't know (quality 0-2)
  onSwipeRight: () => void; // Know (quality 3-5)
  onFlip?: (isFlipped: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.1;

/**
 * SwipeableCard component with touch/mouse swipe gestures.
 * Swipe left = "Don't know" (quality 0-2)
 * Swipe right = "Know" (quality 3-5)
 */
export function SwipeableCard({
  card,
  onSwipeLeft,
  onSwipeRight,
  onFlip,
  disabled = false,
  className,
}: SwipeableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    currentX: 0,
  });
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const deltaX = dragState.currentX - dragState.startX;
  const rotation = deltaX * ROTATION_FACTOR;
  const isSwipingLeft = deltaX < -50;
  const isSwipingRight = deltaX > 50;
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus the card container for keyboard support
  useEffect(() => {
    if (!disabled && containerRef.current) {
      containerRef.current.focus();
    }
  }, [card, disabled]);

  const handleFlip = useCallback(() => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  }, [isFlipped, onFlip]);

  // Keyboard handler for direct card interaction
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onSwipeLeft();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onSwipeRight();
      }
    },
    [disabled, handleFlip, onSwipeLeft, onSwipeRight]
  );

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (disabled) return;
      setDragState({
        isDragging: true,
        startX: clientX,
        currentX: clientX,
      });
    },
    [disabled]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!dragState.isDragging || disabled) return;
      setDragState((prev) => ({
        ...prev,
        currentX: clientX,
      }));
    },
    [dragState.isDragging, disabled]
  );

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging || disabled) return;

    const delta = dragState.currentX - dragState.startX;

    if (delta < -SWIPE_THRESHOLD) {
      setSwipeDirection("left");
      setTimeout(() => {
        onSwipeLeft();
        setSwipeDirection(null);
        setIsFlipped(false);
      }, 400);
    } else if (delta > SWIPE_THRESHOLD) {
      setSwipeDirection("right");
      setTimeout(() => {
        onSwipeRight();
        setSwipeDirection(null);
        setIsFlipped(false);
      }, 400);
    }

    setDragState({
      isDragging: false,
      startX: 0,
      currentX: 0,
    });
  }, [dragState, disabled, onSwipeLeft, onSwipeRight]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleDragMove(e.clientX);
    },
    [handleDragMove]
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleMouseLeave = useCallback(() => {
    if (dragState.isDragging) {
      handleDragEnd();
    }
  }, [dragState.isDragging, handleDragEnd]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX);
    },
    [handleDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientX);
    },
    [handleDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Note: Keyboard handling is also done by useFlashcardKeyboard hook in the parent component
  // This component provides direct keyboard handling for better focus management

  return (
    <div
      ref={containerRef}
      className={cn("relative outline-none", className)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Swipe indicators */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-between px-4">
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 transition-opacity duration-200",
            isSwipingLeft || swipeDirection === "left"
              ? "opacity-100"
              : "opacity-0"
          )}
        >
          <X className="w-8 h-8 text-destructive" />
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 transition-opacity duration-200",
            isSwipingRight || swipeDirection === "right"
              ? "opacity-100"
              : "opacity-0"
          )}
        >
          <Check className="w-8 h-8 text-green-500" />
        </div>
      </div>

      {/* Card with drag */}
      <div
        ref={cardRef}
        className={cn(
          "relative touch-none w-full h-full",
          dragState.isDragging && "flashcard-dragging",
          isSwipingLeft && "flashcard-drag-hint-left",
          isSwipingRight && "flashcard-drag-hint-right",
          swipeDirection === "left" && "animate-swipe-left",
          swipeDirection === "right" && "animate-swipe-right"
        )}
        style={{
          transform:
            dragState.isDragging && !swipeDirection
              ? `translateX(${deltaX}px) rotate(${rotation}deg)`
              : undefined,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <FlashCard
          card={card}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          showHint={!isFlipped}
        />
      </div>

      {/* Flip reminder */}
      {!isFlipped && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-muted-foreground text-sm">
          <RotateCcw className="w-4 h-4" />
          <span>Tap card or press Space to flip</span>
        </div>
      )}
    </div>
  );
}
