/**
 * Tests for AiErrorBoundary and error components
 * Covers error categorization, error cards, and network banners
 */

import { render, screen, fireEvent } from "@/tests/utils/test-utils";
import {
  AiErrorBoundary,
  AiErrorCard,
  AiErrorInline,
  NetworkOfflineBanner,
  NetworkReconnectedBanner,
  TimeoutWarning,
  categorizeError,
  getErrorDetails,
} from "@/components/ai/common/AiErrorBoundary";

describe("categorizeError", () => {
  it("categorizes network errors", () => {
    expect(categorizeError(new Error("Network error"))).toBe("network");
    expect(categorizeError(new Error("Failed to fetch"))).toBe("network");
    expect(categorizeError(new Error("CORS issue"))).toBe("network");
  });

  it("categorizes timeout errors", () => {
    expect(categorizeError(new Error("Request timed out"))).toBe("timeout");
    expect(categorizeError(new Error("Timeout exceeded"))).toBe("timeout");
    expect(categorizeError(new Error("Request aborted"))).toBe("timeout");
  });

  it("categorizes rate limit errors", () => {
    expect(categorizeError(new Error("Rate limit exceeded"))).toBe("rate_limit");
    expect(categorizeError(new Error("Too many requests"))).toBe("rate_limit");
    expect(categorizeError(new Error("Error 429"))).toBe("rate_limit");
  });

  it("categorizes quota errors", () => {
    expect(categorizeError(new Error("Quota exceeded"))).toBe("quota");
    expect(categorizeError(new Error("Daily limit reached"))).toBe("quota");
  });

  it("categorizes auth errors", () => {
    expect(categorizeError(new Error("Unauthorized"))).toBe("auth");
    expect(categorizeError(new Error("Error 401"))).toBe("auth");
    expect(categorizeError(new Error("Error 403"))).toBe("auth");
  });

  it("categorizes server errors", () => {
    expect(categorizeError(new Error("Server error 500"))).toBe("server");
    expect(categorizeError(new Error("Internal error"))).toBe("server");
    expect(categorizeError(new Error("Error 502"))).toBe("server");
  });

  it("returns unknown for unrecognized errors", () => {
    expect(categorizeError(new Error("Some random error"))).toBe("unknown");
    expect(categorizeError(null)).toBe("unknown");
    expect(categorizeError(undefined)).toBe("unknown");
  });
});

describe("getErrorDetails", () => {
  it("returns correct details for network errors", () => {
    const details = getErrorDetails("network");
    
    expect(details.title).toBe("Connection Lost");
    expect(details.canRetry).toBe(true);
  });

  it("returns correct details for timeout errors", () => {
    const details = getErrorDetails("timeout");
    
    expect(details.title).toBe("Request Timed Out");
    expect(details.canRetry).toBe(true);
  });

  it("returns correct details for quota errors", () => {
    const details = getErrorDetails("quota");
    
    expect(details.title).toBe("Daily Limit Reached");
    expect(details.canRetry).toBe(false);
  });

  it("returns correct details for auth errors", () => {
    const details = getErrorDetails("auth");
    
    expect(details.title).toBe("Authentication Required");
    expect(details.canRetry).toBe(false);
  });
});

describe("AiErrorCard", () => {
  it("renders error card with default title", () => {
    render(<AiErrorCard />);
    
    expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
  });

  it("renders error card with custom title and message", () => {
    render(
      <AiErrorCard 
        title="Custom Error" 
        message="Something bad happened" 
      />
    );
    
    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("Something bad happened")).toBeInTheDocument();
  });

  it("categorizes error from Error object", () => {
    render(<AiErrorCard error={new Error("Network error")} />);
    
    expect(screen.getByText("Connection Lost")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = jest.fn();
    render(<AiErrorCard onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("calls onReset when go back button is clicked", () => {
    const onReset = jest.fn();
    render(<AiErrorCard onReset={onReset} />);
    
    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("disables retry button during countdown", () => {
    render(<AiErrorCard onRetry={() => {}} retryCountdown={5} />);
    
    // Button text is "Try Again" but disabled during countdown
    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeDisabled();
    // Countdown message is shown separately
    expect(screen.getByText(/retrying in 5s/i)).toBeInTheDocument();
  });

  it("shows attempt count", () => {
    render(
      <AiErrorCard 
        onRetry={() => {}} 
        attemptNumber={2} 
        maxRetries={3} 
      />
    );
    
    expect(screen.getByText(/attempt 2 of 3/i)).toBeInTheDocument();
  });

  it("shows contact support when exhausted", () => {
    render(
      <AiErrorCard 
        onRetry={() => {}} 
        isExhausted={true}
        attemptNumber={3}
        maxRetries={3}
      />
    );
    
    expect(screen.getByText(/maximum retry attempts reached/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact support/i })).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<AiErrorCard />);
    
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});

describe("AiErrorInline", () => {
  it("renders inline error message", () => {
    render(<AiErrorInline message="Something went wrong" />);
    
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows retry button when onRetry provided", () => {
    const onRetry = jest.fn();
    render(<AiErrorInline message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole("button");
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("NetworkOfflineBanner", () => {
  it("renders offline banner", () => {
    render(<NetworkOfflineBanner />);
    
    expect(screen.getByText("You're offline")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows retry button when onRetry provided", () => {
    const onRetry = jest.fn();
    render(<NetworkOfflineBanner onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("NetworkReconnectedBanner", () => {
  it("renders reconnected banner", () => {
    render(<NetworkReconnectedBanner />);
    
    expect(screen.getByText("Back online")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("TimeoutWarning", () => {
  it("renders timeout warning with default seconds", () => {
    render(<TimeoutWarning />);
    
    expect(screen.getByText(/taking longer than expected/i)).toBeInTheDocument();
  });

  it("renders timeout warning with custom seconds", () => {
    render(<TimeoutWarning seconds={60} />);
    
    expect(screen.getByText(/60s/)).toBeInTheDocument();
  });

  it("shows cancel button when onCancel provided", () => {
    const onCancel = jest.fn();
    render(<TimeoutWarning onCancel={onCancel} />);
    
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("AiErrorBoundary", () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  const ThrowError = () => {
    throw new Error("Test error");
  };

  it("renders children when no error", () => {
    render(
      <AiErrorBoundary>
        <div>Child content</div>
      </AiErrorBoundary>
    );
    
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders error card when error occurs", () => {
    render(
      <AiErrorBoundary>
        <ThrowError />
      </AiErrorBoundary>
    );
    
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <AiErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError />
      </AiErrorBoundary>
    );
    
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });
});
