const ACCESS_TOKEN_KEY = "lexia.accessToken";
const REFRESH_TOKEN_KEY = "lexia.refreshToken";
const TOKEN_TYPE_KEY = "lexia.tokenType";
const ACCESS_TOKEN_EXPIRES_KEY = "lexia.accessTokenExpiresAt";

interface TokenPayload {
  accessToken: string;
  refreshToken?: string | null;
  tokenType?: string | null;
  expiresIn?: number;
}

const isBrowser = typeof window !== "undefined";

function safeGetItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("Unable to read localStorage key", key, error);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Unable to write localStorage key", key, error);
  }
}

function safeRemoveItem(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Unable to remove localStorage key", key, error);
  }
}

export function saveTokens(tokens: TokenPayload): void {
  if (!tokens.accessToken) return;
  safeSetItem(ACCESS_TOKEN_KEY, tokens.accessToken);

  if (tokens.refreshToken) {
    safeSetItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  if (tokens.tokenType) {
    safeSetItem(TOKEN_TYPE_KEY, tokens.tokenType);
  }

  if (typeof tokens.expiresIn === "number" && tokens.expiresIn > 0) {
    const expiresAt = Date.now() + tokens.expiresIn;
    safeSetItem(ACCESS_TOKEN_EXPIRES_KEY, expiresAt.toString());
  }
}

export function getAccessToken(): string | null {
  return safeGetItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return safeGetItem(REFRESH_TOKEN_KEY);
}

export function getTokenType(): string | null {
  return safeGetItem(TOKEN_TYPE_KEY);
}

export function hasValidAccessToken(): boolean {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  const expiresAt = safeGetItem(ACCESS_TOKEN_EXPIRES_KEY);
  if (!expiresAt) {
    return true;
  }

  const expiresAtNumber = Number(expiresAt);
  if (Number.isNaN(expiresAtNumber)) {
    return true;
  }

  return expiresAtNumber > Date.now();
}

export function clearTokens(): void {
  safeRemoveItem(ACCESS_TOKEN_KEY);
  safeRemoveItem(REFRESH_TOKEN_KEY);
  safeRemoveItem(TOKEN_TYPE_KEY);
  safeRemoveItem(ACCESS_TOKEN_EXPIRES_KEY);
}

export function getStoredTokens(): TokenPayload | null {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken: getRefreshToken(),
    tokenType: getTokenType(),
  };
}
