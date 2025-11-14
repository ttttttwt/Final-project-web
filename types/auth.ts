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

// 🔐 SECURITY: Tokens stored in httpOnly cookies (set by backend)
// Client receives ONLY user data, NO tokens
export interface LoginResponse {
  user: User;
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

// 🔐 SECURITY: Refresh uses httpOnly cookie, no request body needed
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RefreshTokenRequest {
  // Empty - backend reads refreshToken from httpOnly cookie
}

export interface RefreshTokenResponse {
  message: string;
  // No tokens in response - backend sets new cookie via Set-Cookie header
}
