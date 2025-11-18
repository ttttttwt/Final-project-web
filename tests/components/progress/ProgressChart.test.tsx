import React from "react";

import { render, screen } from "@/tests/utils/test-utils";
import { ProgressChart } from "@/components/progress/ProgressChart";
import type { DailyActivity } from "@/types/progress";

type SizeFn = (size: { width: number; height: number }) => React.ReactNode;

type ResponsiveContainerMockProps = {
  children?: React.ReactNode | SizeFn;
};

type AreaChartMockProps = {
  data: unknown;
  children?: React.ReactNode;
};

type AxisMockProps = {
  dataKey?: string;
};

type TooltipMockProps = {
  content?: React.ReactNode;
};

jest.mock("recharts", () => {
  const actual = jest.requireActual("recharts");

  const sanitizeChildren = (children?: React.ReactNode) =>
    React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      const tag = typeof child.type === "string" ? child.type : "";
      if (["defs", "linearGradient", "stop"].includes(tag)) {
        return null;
      }

      return child;
    });

  return {
    ...actual,
    ResponsiveContainer: ({ children }: ResponsiveContainerMockProps) => (
      <div data-testid="responsive-container">
        {typeof children === "function"
          ? (children as SizeFn)({ width: 800, height: 300 })
          : children}
      </div>
    ),
    AreaChart: ({ children, data }: AreaChartMockProps) => (
      <div data-testid="area-chart" data-chart={JSON.stringify(data)}>
        {sanitizeChildren(children)}
      </div>
    ),
    Area: ({ dataKey }: AxisMockProps) => (
      <div data-testid={`area-${dataKey ?? "lessons"}`} />
    ),
    XAxis: ({ dataKey }: AxisMockProps) => (
      <div data-testid="x-axis" data-key={dataKey ?? ""} />
    ),
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: ({ content }: TooltipMockProps) => (
      <div data-testid="tooltip">{content}</div>
    ),
  };
});

describe("ProgressChart", () => {
  it("renders empty state when no data is provided", () => {
    render(<ProgressChart data={[]} />);

    expect(screen.getByText(/No activity data/i)).toBeInTheDocument();
    expect(screen.queryByTestId("area-chart")).toBeNull();
  });

  it("formats activity data for the chart", () => {
    const activities: DailyActivity[] = [
      {
        date: "2024-11-01T00:00:00.000Z",
        lessonsCompleted: 3,
        timeSpentMinutes: 45,
      },
      {
        date: "2024-11-02T00:00:00.000Z",
        lessonsCompleted: 2,
        timeSpentMinutes: 30,
      },
    ];

    render(<ProgressChart data={activities} />);

    const areaChart = screen.getByTestId("area-chart");
    const chartData = JSON.parse(areaChart.getAttribute("data-chart") ?? "[]");

    expect(chartData).toEqual([
      { date: "Nov 1", lessons: 3, time: 45 },
      { date: "Nov 2", lessons: 2, time: 30 },
    ]);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });
});
