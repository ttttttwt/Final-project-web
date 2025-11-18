import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/tests/utils/test-utils";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

jest.mock("@/components/layout/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

jest.mock("@/store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const useAuthStoreMock = useAuthStore as jest.Mock;
const useRouterMock = useRouter as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;
const toastSuccessMock = toast.success as unknown as jest.Mock;

const pushMock = jest.fn();
const logoutMock = jest.fn();

describe("Header", () => {
  beforeEach(() => {
    pushMock.mockReset();
    logoutMock.mockReset();
    toastSuccessMock.mockReset();

    useRouterMock.mockReturnValue({
      push: pushMock,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });

    usePathnameMock.mockReturnValue("/dashboard");

    useAuthStoreMock.mockReturnValue({
      user: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
        avatarUrl: null,
      },
      isAuthenticated: true,
      logout: logoutMock.mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("opens the user dropdown with account links", async () => {
    render(<Header />);

    const trigger = screen.getByRole("button", { name: /user menu/i });
    await userEvent.click(trigger);

    expect(await screen.findByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it("logs the user out and redirects to login", async () => {
    logoutMock.mockResolvedValueOnce(undefined);

    render(<Header />);

    const trigger = screen.getByRole("button", { name: /user menu/i });
    await userEvent.click(trigger);

    const logoutItem = await screen.findByRole("menuitem", {
      name: /log out/i,
    });
    await userEvent.click(logoutItem);

    await waitFor(() => expect(logoutMock).toHaveBeenCalledTimes(1));
    expect(toastSuccessMock).toHaveBeenCalledWith("Logged out successfully");
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
