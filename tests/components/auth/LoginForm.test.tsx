import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/tests/utils/test-utils";
import LoginPage from "@/app/(auth)/login/page";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

jest.mock("@/store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
}));

describe("LoginPage", () => {
  const loginMock = jest.fn();
  const useAuthStoreMock = useAuthStore as unknown as jest.Mock;
  const toastSuccessMock = toast.success as unknown as jest.Mock;
  const toastErrorMock = toast.error as unknown as jest.Mock;
  const useRouterMock = useRouter as unknown as jest.Mock;

  beforeEach(() => {
    loginMock.mockReset();
    pushMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    useRouterMock.mockReturnValue({
      push: pushMock,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });
    useAuthStoreMock.mockReturnValue({
      login: loginMock,
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("prevents submission when password is too short", async () => {
    render(<LoginPage />);

    await userEvent.type(
      screen.getByPlaceholderText("your.email@example.com"),
      "user@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "short"
    );

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("calls login and navigates to dashboard on success", async () => {
    loginMock.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    await userEvent.type(
      screen.getByPlaceholderText("your.email@example.com"),
      "user@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password1"
    );

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledTimes(1));
    expect(loginMock).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "Password1",
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Welcome back!",
      expect.objectContaining({
        description: "You have successfully logged in.",
      })
    );
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows API error feedback when credentials are invalid", async () => {
    loginMock.mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(<LoginPage />);

    await userEvent.type(
      screen.getByPlaceholderText("your.email@example.com"),
      "wrong@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password1"
    );

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledTimes(1));

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Invalid Credentials",
      expect.objectContaining({
        description: expect.stringContaining("Email or password"),
      })
    );
    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
