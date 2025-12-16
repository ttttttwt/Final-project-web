import userEvent from "@testing-library/user-event";
import { render, screen } from "@/tests/utils/test-utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const usePathnameMock = usePathname as jest.Mock;

describe("Sidebar", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/dashboard");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation links and marks active route", () => {
    usePathnameMock.mockReturnValue("/courses");

    render(<Sidebar isOpen />);

    expect(
      screen.getByRole("link", { name: /go to dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse courses/i })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /view your progress/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view your profile/i })
    ).toBeInTheDocument();
  });

  it("renders AI features section with all AI tools", () => {
    render(<Sidebar isOpen />);

    // Check AI section heading
    expect(screen.getByText(/ai features/i)).toBeInTheDocument();

    // Check all AI feature links
    expect(
      screen.getByRole("link", { name: /ai flashcards generator/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ai grammar practice/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ai conversation roleplay/i })
    ).toBeInTheDocument();
  });

  it("highlights active AI feature", () => {
    usePathnameMock.mockReturnValue("/ai/grammar");

    render(<Sidebar isOpen />);

    const grammarLink = screen.getByRole("link", {
      name: /ai grammar practice/i,
    });
    expect(grammarLink).toHaveAttribute("aria-current", "page");
  });

  it("calls onToggleCollapse when collapse button is clicked", async () => {
    const onToggleCollapse = jest.fn();

    render(
      <Sidebar isOpen isCollapsed={false} onToggleCollapse={onToggleCollapse} />
    );

    const collapseButton = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    await userEvent.click(collapseButton);

    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it("shows expand state when collapsed", () => {
    const onToggleCollapse = jest.fn();

    render(<Sidebar isOpen isCollapsed onToggleCollapse={onToggleCollapse} />);

    expect(
      screen.getByRole("button", { name: /expand sidebar/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/LEXIA/i)).not.toBeInTheDocument();
  });
});
