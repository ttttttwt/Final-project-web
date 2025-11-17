/**
 * Sample test to verify Jest and React Testing Library setup
 * This test ensures the testing infrastructure is working correctly
 */

import { render, screen } from "@/tests/utils/test-utils";

// Simple test component
function HelloWorld() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>Testing infrastructure is working!</p>
    </div>
  );
}

describe("Jest and RTL Setup", () => {
  it("renders a component correctly", () => {
    render(<HelloWorld />);

    // Test that elements are in the document
    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
    expect(
      screen.getByText("Testing infrastructure is working!")
    ).toBeInTheDocument();
  });

  it("supports queries by role", () => {
    render(<HelloWorld />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Hello, World!");
  });

  it("supports custom matchers from jest-dom", () => {
    render(<HelloWorld />);

    const paragraph = screen.getByText("Testing infrastructure is working!");
    expect(paragraph).toBeVisible();
  });
});

describe("Mock utilities", () => {
  it("can mock functions", () => {
    const mockFn = jest.fn();
    mockFn("test");

    expect(mockFn).toHaveBeenCalledWith("test");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("can create mock objects", () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      name: "Test User",
    };

    expect(mockUser).toMatchObject({
      id: "123",
      email: "test@example.com",
    });
  });
});

describe("Async testing", () => {
  it("supports async/await", async () => {
    const promise = Promise.resolve("success");
    const result = await promise;

    expect(result).toBe("success");
  });

  it("can test async operations with findBy queries", async () => {
    const { useState, useEffect } = await import("react");

    function AsyncComponent() {
      const [text, setText] = useState("Loading...");

      useEffect(() => {
        setTimeout(() => {
          setText("Loaded!");
        }, 100);
      }, []);

      return <div>{text}</div>;
    }

    render(<AsyncComponent />);

    // findBy queries wait for elements to appear
    const element = await screen.findByText("Loaded!");
    expect(element).toBeInTheDocument();
  });
});

describe("Coverage test", () => {
  function Calculator() {
    const add = (a: number, b: number) => a + b;
    const subtract = (a: number, b: number) => a - b;

    return (
      <div>
        <p>2 + 2 = {add(2, 2)}</p>
        <p>5 - 3 = {subtract(5, 3)}</p>
      </div>
    );
  }

  it("tests multiple code paths", () => {
    render(<Calculator />);

    expect(screen.getByText("2 + 2 = 4")).toBeInTheDocument();
    expect(screen.getByText("5 - 3 = 2")).toBeInTheDocument();
  });
});
