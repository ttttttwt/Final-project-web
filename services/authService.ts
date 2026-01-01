import api from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiMessageResponse,
} from "@/types/auth";

// 🔐 SECURITY: Temporary localStorage token strategy (Sprint 3)
// Client receives tokens in response body and stores them manually
export const authService = {
  /**
   * Login user - backend returns JWT tokens + user data
   * @param credentials - email and password
   * @returns Login response with access + refresh tokens and user data
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  /**
   * Register new user
   * @param data - registration form data
   * @returns User profile data
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>("/auth/register", data);
    return response.data;
  },

  /**
   * Refresh access token using refresh token from client storage
   * @returns New access token + optional rotated refresh token
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>(
      "/auth/refresh",
      data
    );
    return response.data;
  },

  /**
   * Logout user - clears httpOnly cookies on backend
   * @returns void
   */
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  /**
   * Get current user profile
   * Backend validates httpOnly cookie and returns user data
   * @returns User data if authenticated
   * @throws 401 if not authenticated or token expired
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/users/profile");
    return response.data;
  },

  /**
   * Change password for authenticated user
   * @param data - current password, new password, and confirmation
   * @returns Success message
   * @throws 400 if current password is incorrect or validation fails
   */
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    const response = await api.post<ChangePasswordResponse>(
      "/auth/change-password",
      data
    );
    return response.data;
  },

  /**
   * Request password reset - sends email with reset link
   * @param data - email address
   * @returns Success message (always succeeds for security)
   */
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ApiMessageResponse> => {
    const response = await api.post<ApiMessageResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  },

  /**
   * Reset password with token from email
   * @param data - token, new password, and confirmation
   * @returns Success message
   * @throws 400 if token is invalid/expired or passwords don't match
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ApiMessageResponse> => {
    const response = await api.post<ApiMessageResponse>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },
};
