/**
 * Tests for AiLoadingState components
 * Covers loading states, skeletons, and streaming indicators
 */

import { render, screen } from "@/tests/utils/test-utils";
import {
  AiLoadingState,
  AiLoadingInline,
  AiCardSkeleton,
  StreamingIndicator,
  TypingIndicator,
  RoleplaySkeleton,
  GrammarExerciseSkeleton,
  FlashcardDeckSkeleton,
  FlashcardStudySkeleton,
  ChatMessageSkeleton,
  AiPageLoadingState,
} from "@/components/ai/common/AiLoadingState";

describe("AiLoadingState", () => {
  it("renders default loading state", () => {
    render(<AiLoadingState />);
    
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders generating variant", () => {
    render(<AiLoadingState variant="generating" />);
    
    expect(screen.getByText("AI is generating content...")).toBeInTheDocument();
  });

  it("renders studying variant", () => {
    render(<AiLoadingState variant="studying" />);
    
    expect(screen.getByText("Preparing your study session...")).toBeInTheDocument();
  });

  it("renders streaming variant", () => {
    render(<AiLoadingState variant="streaming" />);
    
    expect(screen.getByText("AI is responding...")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<AiLoadingState message="Custom loading message" />);
    
    expect(screen.getByText("Custom loading message")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<AiLoadingState className="custom-class" />);
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has proper accessibility attributes", () => {
    render(<AiLoadingState />);
    
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });
});

describe("AiLoadingInline", () => {
  it("renders inline loading without message", () => {
    render(<AiLoadingInline />);
    
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders inline loading with message", () => {
    render(<AiLoadingInline message="Loading data..." />);
    
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });
});

describe("StreamingIndicator", () => {
  it("renders streaming indicator with default message", () => {
    render(<StreamingIndicator />);
    
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("AI is thinking")).toBeInTheDocument();
  });

  it("renders streaming indicator with custom message", () => {
    render(<StreamingIndicator message="Generating response..." />);
    
    expect(screen.getByText("Generating response...")).toBeInTheDocument();
  });

  it("has proper accessibility label", () => {
    render(<StreamingIndicator message="Test message" />);
    
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Test message");
  });
});

describe("TypingIndicator", () => {
  it("renders typing indicator", () => {
    render(<TypingIndicator />);
    
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-label", "AI is typing");
  });
});

describe("Skeleton Components", () => {
  it("renders AiCardSkeleton", () => {
    const { container } = render(<AiCardSkeleton />);
    
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("renders RoleplaySkeleton with accessibility", () => {
    render(<RoleplaySkeleton />);
    
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-label", "Loading roleplay scenario");
  });

  it("renders GrammarExerciseSkeleton with accessibility", () => {
    render(<GrammarExerciseSkeleton />);
    
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-label", "Loading grammar exercise");
  });

  it("renders FlashcardDeckSkeleton with accessibility", () => {
    render(<FlashcardDeckSkeleton />);
    
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-label", "Loading flashcard deck");
  });

  it("renders FlashcardStudySkeleton with accessibility", () => {
    render(<FlashcardStudySkeleton />);
    
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-label", "Loading flashcard");
  });

  it("renders ChatMessageSkeleton for user", () => {
    render(<ChatMessageSkeleton isUser={true} />);
    
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading message");
  });

  it("renders ChatMessageSkeleton for AI", () => {
    render(<ChatMessageSkeleton isUser={false} />);
    
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("AiPageLoadingState", () => {
  it("renders full page loading state with defaults", () => {
    render(<AiPageLoadingState />);
    
    expect(screen.getByText("Loading AI Feature")).toBeInTheDocument();
    expect(screen.getByText("Please wait while we prepare your content...")).toBeInTheDocument();
  });

  it("renders full page loading state with custom title and message", () => {
    render(
      <AiPageLoadingState 
        title="Loading Flashcards" 
        message="Preparing your study session..." 
      />
    );
    
    expect(screen.getByText("Loading Flashcards")).toBeInTheDocument();
    expect(screen.getByText("Preparing your study session...")).toBeInTheDocument();
  });

  it("has proper accessibility", () => {
    render(<AiPageLoadingState />);
    
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });
});
