import { render, screen } from "@/tests/utils/test-utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BookOpen, TrendingUp } from "lucide-react";

describe("StatsCard", () => {
  it("renders title, value, subtitle, and icon by default", () => {
    const { container } = render(
      <StatsCard
        title="Enrolled Courses"
        value={5}
        subtitle="Since last week"
        icon={BookOpen}
      />
    );

    expect(screen.getByText("Enrolled Courses")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Since last week")).toBeInTheDocument();

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveClass("text-[#1A73E8]");
  });

  it("respects color variants", () => {
    const { container } = render(
      <StatsCard
        title="Active Days"
        value="12"
        icon={TrendingUp}
        color="green"
      />
    );

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveClass("text-[#1E8E3E]");
  });

  it("shows skeletons while loading", () => {
    const { container } = render(
      <StatsCard
        title="Study Hours"
        value={18}
        subtitle="Compared to last month"
        icon={BookOpen}
        isLoading
      />
    );

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("Study Hours")).toBeNull();
    expect(screen.queryByText("18")).toBeNull();
  });
});
