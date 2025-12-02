import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/tests/utils/test-utils";
import RegisterPage from "@/app/(auth)/register/page";
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

describe("RegisterPage", () => {
  const registerMock = jest.fn();
  const useAuthStoreMock = useAuthStore as unknown as jest.Mock;
  const toastSuccessMock = toast.success as unknown as jest.Mock;
  const toastErrorMock = toast.error as unknown as jest.Mock;
  const useRouterMock = useRouter as unknown as jest.Mock;

  const acceptTerms = async () => {
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
  };

  const fillValidRegistration = async () => {
    // Fill fullName field (required)
    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Test User");
    await userEvent.type(
      screen.getByPlaceholderText("your.email@example.com"),
      "new.user@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Create a strong password"),
      "Password1!"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Re-enter your password"),
      "Password1!"
    );
    await acceptTerms();
  };

  beforeEach(() => {
    registerMock.mockReset();
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
      register: registerMock,
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<RegisterPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/please confirm your password/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/you must accept the terms and conditions/i)
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("displays mismatch error when passwords do not match", async () => {
    render(<RegisterPage />);

    await userEvent.type(
      screen.getByPlaceholderText("your.email@example.com"),
      "new.user@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Create a strong password"),
      "Password1!"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Re-enter your password"),
      "Password2!"
    );
    await acceptTerms();

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(await screen.findByText(/passwords don't match/i)).toBeVisible();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("registers new users and redirects to dashboard", async () => {
    registerMock.mockResolvedValueOnce(undefined);

    render(<RegisterPage />);

    await fillValidRegistration();

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    expect(registerMock).toHaveBeenCalledWith({
      email: "new.user@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      fullName: "Test User",
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Account Created!",
      expect.objectContaining({
        description: expect.stringContaining("Welcome to LEXIA"),
      })
    );
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("provides inline feedback when email already exists", async () => {
    registerMock.mockRejectedValueOnce({
      response: { status: 409 },
    });

    render(<RegisterPage />);

    await fillValidRegistration();

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Email Already Registered",
      expect.objectContaining({
        description: expect.stringContaining("already in use"),
      })
    );
    expect(
      await screen.findByText(/email already registered/i)
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
