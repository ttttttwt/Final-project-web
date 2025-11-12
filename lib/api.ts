import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// 🔐 SECURITY: httpOnly cookies for JWT tokens
// - withCredentials: true -> Cookies sent automatically
// - NO manual Authorization header needed
// - Backend sets/reads cookies via Set-Cookie header
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"),
  withCredentials: true, // ✅ CRITICAL: Enable cookie support
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Promise lock to prevent concurrent refresh requests
let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;

// Queue for failed requests during token refresh
interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
  config: InternalAxiosRequestConfig;
}
let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor - NO manual token handling
api.interceptors.request.use(
  (config) => {
    // ❌ NO manual Authorization header
    // Cookies sent automatically by browser when withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - comprehensive error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // 🔐 Handle 401 - Token expired, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Use Promise lock to prevent concurrent refresh calls
      if (isRefreshing) {
        // Wait for ongoing refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          // 🔐 Call refresh endpoint (backend reads httpOnly cookie)
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          // Refresh successful, process queued requests
          processQueue();
          isRefreshing = false;
          refreshPromise = null;

          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          processQueue(
            refreshError instanceof Error
              ? refreshError
              : new Error("Token refresh failed")
          );
          isRefreshing = false;
          refreshPromise = null;

          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      })();

      return refreshPromise;
    }

    // 🌐 Network errors - No internet connection
    if (error.code === "ERR_NETWORK") {
      console.error("Network error: No internet connection");
      return Promise.reject({
        code: "NETWORK",
        message: "No internet connection. Please check your network.",
      });
    }

    // ⏱️ Timeout errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");

      // Smart retry: ONLY for idempotent methods
      if (isIdempotentMethod(originalRequest.method)) {
        return retryRequest(originalRequest, error);
      }

      return Promise.reject({
        code: "TIMEOUT",
        message: "Request timeout. Please try again.",
      });
    }

    // 🔴 Server errors (500, 502, 503, 504) - Retry with backoff
    if (error.response?.status && error.response.status >= 500) {
      console.error(`Server error: ${error.response.status}`);

      // Smart retry: ONLY for idempotent methods
      if (isIdempotentMethod(originalRequest.method)) {
        return retryRequest(originalRequest, error);
      }

      return Promise.reject({
        code: "SERVER_ERROR",
        message: "Server error. Please try again later.",
        status: error.response.status,
      });
    }

    // Other errors (400, 403, 404, 422, etc.)
    return Promise.reject(error);
  }
);

/**
 * Check if HTTP method is idempotent (safe to retry)
 * @param method - HTTP method
 * @returns true if GET, HEAD, or OPTIONS
 */
function isIdempotentMethod(method?: string): boolean {
  if (!method) return false;
  return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

/**
 * Retry request with exponential backoff
 * @param config - Axios request config
 * @param error - Original error
 * @returns Retried request or rejected promise
 */
async function retryRequest(
  config: InternalAxiosRequestConfig & { _retryCount?: number },
  error: AxiosError
): Promise<unknown> {
  config._retryCount = config._retryCount || 0;

  // Max 3 retry attempts
  if (config._retryCount >= 3) {
    return Promise.reject(error);
  }

  config._retryCount += 1;

  // Exponential backoff: 300ms -> 600ms -> 1200ms
  const delay = Math.min(300 * Math.pow(2, config._retryCount - 1), 1200);

  // Add jitter (±50ms) to prevent thundering herd
  const jitter = Math.random() * 100 - 50;
  const totalDelay = delay + jitter;

  console.log(
    `Retrying request (attempt ${
      config._retryCount
    }/3) after ${totalDelay.toFixed(0)}ms...`
  );

  await new Promise((resolve) => setTimeout(resolve, totalDelay));

  return api(config);
}

export default api;
