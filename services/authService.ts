import api from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from "@/types/auth";

// 🔐 SECURITY: All auth operations use httpOnly cookies
// NO manual token handling in client code
export const authService = {
  /**
   * Login user - backend sets httpOnly cookies
   * @param credentials - email and password
   * @returns User data (NO tokens)
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Register new user - backend sets httpOnly cookies
   * @param data - registration form data
   * @returns User data (NO tokens)
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  /**
   * Refresh access token - uses httpOnly cookie
   * Backend reads refreshToken from cookie, returns new accessToken in cookie
   * @returns Success message
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await api.post("/auth/refresh", data);
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
    const response = await api.get("/users/profile");
    return response.data;
  },
};
