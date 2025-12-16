/**
 * Tests for RetryButton components
 * Covers retry button, countdown, and contact support states
 */

import { render, screen, fireEvent } from "@/tests/utils/test-utils";
import {
  RetryButton,
  RetryButtonWithCountdown,
  RetryLink,
} from "@/components/ai/common/RetryButton";

describe("RetryButton", () => {
  it("renders retry button with default text", () => {
    render(<RetryButton onRetry={() => {}} />);
    
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders retry button with custom text", () => {
    render(<RetryButton onRetry={() => {}} retryText="Reload" />);
    
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
  });

  it("calls onRetry when clicked", () => {
    const onRetry = jest.fn();
    render(<RetryButton onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows retrying state", () => {
    render(<RetryButton onRetry={() => {}} isRetrying={true} />);
    
    expect(screen.getByRole("button", { name: /retrying/i })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables button when disabled prop is true", () => {
    render(<RetryButton onRetry={() => {}} disabled={true} />);
    
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<RetryButton onRetry={() => {}} className="custom-class" />);
    
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});

describe("RetryButtonWithCountdown", () => {
  it("renders normal retry button when not in countdown", () => {
    render(<RetryButtonWithCountdown onRetry={() => {}} />);
    
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("shows countdown when countdown > 0", () => {
    render(
      <RetryButtonWithCountdown 
        onRetry={() => {}} 
        countdown={5} 
      />
    );
    
    expect(screen.getByRole("button", { name: /retry in 5s/i })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows attempt count when attemptNumber > 0", () => {
    render(
      <RetryButtonWithCountdown 
        onRetry={() => {}} 
        attemptNumber={2}
        maxRetries={3}
      />
    );
    
    expect(screen.getByText("(2/3)")).toBeInTheDocument();
  });

  it("hides attempt count when showAttemptCount is false", () => {
    render(
      <RetryButtonWithCountdown 
        onRetry={() => {}} 
        attemptNumber={2}
        maxRetries={3}
        showAttemptCount={false}
      />
    );
    
    expect(screen.queryByText("(2/3)")).not.toBeInTheDocument();
  });

  it("shows contact support when exhausted", () => {
    render(
      <RetryButtonWithCountdown 
        onRetry={() => {}} 
        isExhausted={true}
      />
    );
    
    expect(screen.getByText(/maximum retries reached/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact support/i })).toBeInTheDocument();
  });

  it("contact support link has correct href", () => {
    render(
      <RetryButtonWithCountdown 
        onRetry={() => {}} 
        isExhausted={true}
      />
    );
    
    const link = screen.getByRole("link", { name: /contact support/i });
    expect(link).toHaveAttribute("href", "mailto:support@lexia.app");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows retrying state during retry", () => {
    render(
      <RetryButtonWithCountdown 
        onRetry={() => {}} 
        isRetrying={true}
      />
    );
    
    expect(screen.getByRole("button", { name: /retrying/i })).toBeDisabled();
  });

  it("calls onRetry when button is clicked", () => {
    const onRetry = jest.fn();
    render(<RetryButtonWithCountdown onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("RetryLink", () => {
  it("renders retry link with default text", () => {
    render(<RetryLink onRetry={() => {}} />);
    
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders retry link with custom text", () => {
    render(<RetryLink onRetry={() => {}} text="Reload data" />);
    
    expect(screen.getByRole("button", { name: /reload data/i })).toBeInTheDocument();
  });

  it("calls onRetry when clicked", () => {
    const onRetry = jest.fn();
    render(<RetryLink onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows retrying state", () => {
    render(<RetryLink onRetry={() => {}} isRetrying={true} />);
    
    expect(screen.getByRole("button", { name: /retrying/i })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<RetryLink onRetry={() => {}} className="custom-link" />);
    
    expect(screen.getByRole("button")).toHaveClass("custom-link");
  });
});
