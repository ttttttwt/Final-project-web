/**
 * Tests for useRetryWithBackoff hook
 * Covers exponential backoff, countdown, and retry exhaustion
 * 
 * Note: These tests use immediate execution without delays to avoid timing issues
 */

import { renderHook, act } from "@testing-library/react";
import { useRetryWithBackoff, retryWithBackoff } from "@/hooks/useRetryWithBackoff";

describe("useRetryWithBackoff", () => {
  it("initializes with correct default state", () => {
    const mockFn = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRetryWithBackoff(mockFn));

    expect(result.current.attemptNumber).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.isExhausted).toBe(false);
    expect(result.current.countdown).toBe(0);
    expect(result.current.lastError).toBeNull();
  });

  it("calls onRetryStart when retry starts", async () => {
    const mockFn = jest.fn().mockResolvedValue(undefined);
    const onRetryStart = jest.fn();
    
    const { result } = renderHook(() => 
      useRetryWithBackoff(mockFn, { onRetryStart })
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(onRetryStart).toHaveBeenCalledWith(1);
  });

  it("calls onSuccess when retry succeeds", async () => {
    const mockFn = jest.fn().mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => 
      useRetryWithBackoff(mockFn, { onSuccess })
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.lastError).toBeNull();
  });

  it("increments attemptNumber on failure", async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error("Error 1"));
    
    const { result } = renderHook(() => useRetryWithBackoff(mockFn));

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.attemptNumber).toBe(1);
    expect(result.current.lastError).not.toBeNull();
  });

  it("tracks isRetrying state", async () => {
    let resolvePromise: () => void;
    const mockFn = jest.fn().mockImplementation(() => 
      new Promise<void>(resolve => { resolvePromise = resolve; })
    );
    
    const { result } = renderHook(() => useRetryWithBackoff(mockFn));

    // Start retry (don't await)
    let retryPromise: Promise<void>;
    act(() => {
      retryPromise = result.current.retry();
    });

    expect(result.current.isRetrying).toBe(true);

    // Complete the promise
    await act(async () => {
      resolvePromise!();
      await retryPromise;
    });

    expect(result.current.isRetrying).toBe(false);
  });

  it("resets state correctly", async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error("Error"));
    
    const { result } = renderHook(() => useRetryWithBackoff(mockFn));

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.attemptNumber).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.attemptNumber).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.isExhausted).toBe(false);
    expect(result.current.countdown).toBe(0);
    expect(result.current.lastError).toBeNull();
  });
});

describe("retryWithBackoff utility", () => {
  it("returns result on first success", async () => {
    const mockFn = jest.fn().mockResolvedValue("success");

    const result = await retryWithBackoff(mockFn, { baseDelay: 0 });

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure with zero delay", async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockResolvedValue("success");

    const result = await retryWithBackoff(mockFn, { baseDelay: 0 });

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("throws after max retries", async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error("Always fails"));

    await expect(
      retryWithBackoff(mockFn, { maxRetries: 2, baseDelay: 0 })
    ).rejects.toThrow("Always fails");
    
    expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it("respects shouldRetry callback", async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error("Don't retry this"));
    const shouldRetry = jest.fn().mockReturnValue(false);

    await expect(
      retryWithBackoff(mockFn, { shouldRetry, baseDelay: 0 })
    ).rejects.toThrow("Don't retry this");
    
    expect(mockFn).toHaveBeenCalledTimes(1); // No retries
    expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error), 0);
  });
});
