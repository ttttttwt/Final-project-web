export interface User {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  bio?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
  currentLevel?: string;
  learningGoal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

// 🔐 SECURITY: Temporary localStorage token strategy (Sprint 3)
// Client receives tokens in response body and stores them manually
export interface LoginResponse extends AuthTokens {
  refreshToken: string;
  user: User;
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse extends AuthTokens {}

/**
 * Change password request - matches backend ChangePasswordDTO
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Change password response - matches backend LogoutResponseDTO
 */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * Forgot password request - matches backend ForgotPasswordDTO
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request - matches backend ResetPasswordDTO
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Generic API response with message
 */
export interface ApiMessageResponse {
  message: string;
}
