/**
 * Tests for useAiQuota hook
 * Covers quota fetching, percentage calculation, and limit detection
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { useAiQuota, useCanUseAiFeature } from "@/hooks/useAiQuota";
import api from "@/lib/api";

// Mock the API module
jest.mock("@/lib/api", () => ({
  get: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("useAiQuota", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with loading state", () => {
    mockApi.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useAiQuota());

    expect(result.current.isLoading).toBe(true);
  });

  it("fetches quota data successfully", async () => {
    const mockQuota = {
      dailyUsed: 25,
      dailyLimit: 50,
      monthlyUsed: 100,
      monthlyLimit: 500,
      dailyResetAt: "2025-12-17T00:00:00Z",
      monthlyResetAt: "2026-01-01T00:00:00Z",
    };

    mockApi.get.mockResolvedValue({ data: mockQuota });

    const { result } = renderHook(() => useAiQuota());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.usedToday).toBe(25);
    expect(result.current.dailyLimit).toBe(50);
    expect(result.current.usedMonth).toBe(100);
    expect(result.current.monthlyLimit).toBe(500);
    expect(result.current.dailyPercentage).toBe(50);
  });

  it("calculates isNearLimit correctly", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        dailyUsed: 40,
        dailyLimit: 50,
        monthlyUsed: 100,
        monthlyLimit: 500,
        dailyResetAt: null,
        monthlyResetAt: null,
      },
    });

    const { result } = renderHook(() => useAiQuota());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dailyPercentage).toBe(80);
    expect(result.current.isNearLimit).toBe(true);
    expect(result.current.isAtLimit).toBe(false);
  });

  it("calculates isAtLimit correctly", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        dailyUsed: 50,
        dailyLimit: 50,
        monthlyUsed: 100,
        monthlyLimit: 500,
        dailyResetAt: null,
        monthlyResetAt: null,
      },
    });

    const { result } = renderHook(() => useAiQuota());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dailyPercentage).toBe(100);
    expect(result.current.isAtLimit).toBe(true);
  });

  it("handles 404 error silently", async () => {
    mockApi.get.mockRejectedValue({
      response: { status: 404 },
    });

    const { result } = renderHook(() => useAiQuota());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    // Should use defaults
    expect(result.current.dailyLimit).toBe(50);
  });

  it("handles other errors", async () => {
    mockApi.get.mockRejectedValue({
      response: { 
        status: 500,
        data: { message: "Server error" },
      },
    });

    const { result } = renderHook(() => useAiQuota());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Server error");
  });

  it("fetches quota for specific feature", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        dailyUsed: 10,
        dailyLimit: 30,
        monthlyUsed: 50,
        monthlyLimit: 200,
        dailyResetAt: null,
        monthlyResetAt: null,
      },
    });

    renderHook(() => useAiQuota("grammar"));

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith("/api/v1/ai/quota?feature=grammar");
    });
  });

  it("provides refetch function", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        dailyUsed: 10,
        dailyLimit: 50,
        monthlyUsed: 50,
        monthlyLimit: 500,
        dailyResetAt: null,
        monthlyResetAt: null,
      },
    });

    const { result } = renderHook(() => useAiQuota());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Refetch wrapped in act
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });

  it("parses reset times correctly", async () => {
    const resetTime = "2025-12-17T00:00:00Z";
    mockApi.get.mockResolvedValue({
      data: {
        dailyUsed: 10,
        dailyLimit: 50,
        monthlyUsed: 50,
        monthlyLimit: 500,
        dailyResetAt: resetTime,
        monthlyResetAt: null,
      },
    });

    const { result } = renderHook(() => useAiQuota());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dailyResetTime).toBeInstanceOf(Date);
    // Date.toISOString() includes milliseconds
    expect(result.current.dailyResetTime?.toISOString()).toContain("2025-12-17T00:00:00");
  });
});

describe("useCanUseAiFeature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns canUse=true when under limit", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        dailyUsed: 10,
        dailyLimit: 50,
        monthlyUsed: 50,
        monthlyLimit: 500,
        dailyResetAt: null,
        monthlyResetAt: null,
      },
    });

    const { result } = renderHook(() => useCanUseAiFeature("roleplay"));

    await waitFor(() => {
      expect(result.current.quota.isLoading).toBe(false);
    });

    expect(result.current.canUse).toBe(true);
    expect(result.current.reason).toBeNull();
  });

  it("returns canUse=false when at limit", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        dailyUsed: 50,
        dailyLimit: 50,
        monthlyUsed: 50,
        monthlyLimit: 500,
        dailyResetAt: null,
        monthlyResetAt: null,
      },
    });

    const { result } = renderHook(() => useCanUseAiFeature("grammar"));

    await waitFor(() => {
      expect(result.current.quota.isLoading).toBe(false);
    });

    expect(result.current.canUse).toBe(false);
    expect(result.current.reason).toContain("daily limit");
    expect(result.current.reason).toContain("50");
  });
});
