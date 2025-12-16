/**
 * Tests for QuotaWarning components
 * Covers quota warnings and indicators
 */

import { render, screen } from "@/tests/utils/test-utils";
import {
  QuotaWarning,
  QuotaIndicator,
} from "@/components/ai/common/QuotaWarning";

describe("QuotaWarning", () => {
  it("does not render when under 70% usage", () => {
    const { container } = render(
      <QuotaWarning used={30} limit={100} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it("renders warning when near limit (>=70%)", () => {
    render(<QuotaWarning used={75} limit={100} />);
    
    expect(screen.getByText(/usage warning/i)).toBeInTheDocument();
    expect(screen.getByText(/75 of 100/i)).toBeInTheDocument();
  });

  it("renders warning when approaching limit (>=80%)", () => {
    render(<QuotaWarning used={85} limit={100} />);
    
    expect(screen.getByText(/85 of 100/i)).toBeInTheDocument();
    // Percentage is shown in parentheses
    expect(screen.getByText(/\(85%\)/)).toBeInTheDocument();
  });

  it("renders limit reached when at 100%", () => {
    render(<QuotaWarning used={100} limit={100} />);
    
    expect(screen.getByText(/limit reached/i)).toBeInTheDocument();
    expect(screen.getByText(/all 100/i)).toBeInTheDocument();
  });

  it("displays custom feature name", () => {
    render(<QuotaWarning used={80} limit={100} feature="Grammar" />);
    
    expect(screen.getByText(/grammar usage warning/i)).toBeInTheDocument();
  });

  it("displays reset time when provided", () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    render(
      <QuotaWarning 
        used={80} 
        limit={100} 
        resetTime={futureDate} 
      />
    );
    
    expect(screen.getByText(/resets in/i)).toBeInTheDocument();
  });

  it("caps percentage at 100%", () => {
    render(<QuotaWarning used={150} limit={100} />);
    
    // Should show 100%, not 150%
    expect(screen.getByText(/limit reached/i)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <QuotaWarning used={80} limit={100} className="custom-warning" />
    );
    
    expect(container.firstChild).toHaveClass("custom-warning");
  });
});

describe("QuotaIndicator", () => {
  it("renders quota indicator", () => {
    render(<QuotaIndicator used={25} limit={100} />);
    
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("25/100")).toBeInTheDocument();
  });

  it("has proper accessibility label", () => {
    render(<QuotaIndicator used={25} limit={100} />);
    
    const indicator = screen.getByRole("status");
    expect(indicator).toHaveAttribute("aria-label", "AI quota: 25 of 100 used");
  });

  it("shows normal color under 80%", () => {
    const { container } = render(<QuotaIndicator used={50} limit={100} />);
    
    // Progress bar should have primary color (not yellow or red)
    const progressBar = container.querySelector('[class*="bg-primary"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("shows warning color at 80%+", () => {
    const { container } = render(<QuotaIndicator used={85} limit={100} />);
    
    // Should have yellow warning styling
    const progressBar = container.querySelector('[class*="yellow"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("shows destructive color at 100%", () => {
    const { container } = render(<QuotaIndicator used={100} limit={100} />);
    
    // Should have destructive styling
    const progressBar = container.querySelector('[class*="destructive"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<QuotaIndicator used={50} limit={100} className="custom-indicator" />);
    
    expect(screen.getByRole("status")).toHaveClass("custom-indicator");
  });
});
