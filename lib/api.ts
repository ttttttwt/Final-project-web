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
    // 🌐 Check offline status before making request
    if (typeof window !== "undefined" && !navigator.onLine) {
      console.warn("📴 Device is offline, request will fail");
      return Promise.reject({
        code: "OFFLINE",
        message: "You are offline. Please check your internet connection.",
      });
    }

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
      // Mark request as already attempted refresh
      originalRequest._retry = true;

      // 🔒 Promise Lock Pattern: Prevent concurrent refresh requests
      if (isRefreshing && refreshPromise) {
        // Wait for ongoing refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then(() => {
            // Refresh succeeded, retry original request
            return api(originalRequest);
          })
          .catch((err) => {
            // Refresh failed, propagate error
            return Promise.reject(err);
          });
      }

      // Start refresh process
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          console.log("🔐 Token expired, refreshing session...");

          // 🔐 Call refresh endpoint (backend reads httpOnly refresh cookie)
          // Backend returns new access token in httpOnly cookie
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { withCredentials: true, timeout: 10000 }
          );

          console.log("✅ Token refresh successful");

          // Refresh successful, process queued requests
          processQueue();

          // Reset refresh state
          isRefreshing = false;
          refreshPromise = null;

          // Retry original request with new token (in cookie)
          return api(originalRequest);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);

          // Refresh failed, reject all queued requests
          processQueue(
            refreshError instanceof Error
              ? refreshError
              : new Error("Token refresh failed")
          );

          // Reset refresh state
          isRefreshing = false;
          refreshPromise = null;

          // 🚪 Auto-logout: Redirect to login (avoid loops on auth pages)
          if (typeof window !== "undefined") {
            const { pathname, search } = window.location;
            const onAuthPage = ["/login", "/register", "/forgot-password"].some(
              (p) => pathname.startsWith(p)
            );

            // If we're already on an auth page, don't redirect again
            // This prevents infinite /login?returnUrl=... nesting
            if (onAuthPage) {
              // Best-effort cleanup: drop nested returnUrl if present
              try {
                if (pathname === "/login" && search.includes("returnUrl=")) {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("returnUrl");
                  window.history.replaceState(null, "", url.toString());
                }
              } catch {
                // no-op if URL parsing fails
              }
            } else {
              console.log("🚪 Session expired, redirecting to login...");
              const currentUrl = pathname + search;
              // Guard: never set returnUrl to another /login URL
              const shouldAttachReturn =
                currentUrl !== "/" && !currentUrl.startsWith("/login");
              const loginUrl = shouldAttachReturn
                ? `/login?returnUrl=${encodeURIComponent(currentUrl)}`
                : "/login";
              // Use replace to avoid stacking history entries
              window.location.replace(loginUrl);
            }
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
