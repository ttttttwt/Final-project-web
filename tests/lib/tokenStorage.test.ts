import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hasValidAccessToken,
  saveTokens,
} from "@/lib/tokenStorage";

const mockNow = () => jest.spyOn(Date, "now");

describe("tokenStorage", () => {
  beforeEach(() => {
    clearTokens();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearTokens();
    localStorage.clear();
  });

  it("persists access and refresh tokens", () => {
    saveTokens({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      tokenType: "Bearer",
    });

    expect(getAccessToken()).toBe("access-123");
    expect(getRefreshToken()).toBe("refresh-456");
    expect(hasValidAccessToken()).toBe(true);
  });

  it("respects expiration metadata when evaluating validity", () => {
    const nowSpy = mockNow();
    nowSpy.mockReturnValue(1_000);
    saveTokens({ accessToken: "expiring", expiresIn: 500 });

    // Still valid before expiry
    nowSpy.mockReturnValue(1_400);
    expect(hasValidAccessToken()).toBe(true);

    // Expired after ttl elapses
    nowSpy.mockReturnValue(1_600);
    expect(hasValidAccessToken()).toBe(false);
  });

  it("keeps existing refresh token when rotation response omits it", () => {
    saveTokens({ accessToken: "initial", refreshToken: "seed" });
    saveTokens({ accessToken: "rotated" });

    expect(getAccessToken()).toBe("rotated");
    expect(getRefreshToken()).toBe("seed");
  });
});
