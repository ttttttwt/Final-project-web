/**
 * Tests for useNetworkStatus hook
 * Covers online/offline detection and connectivity checking
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useNetworkStatus, useNetworkSpeed } from "@/hooks/useNetworkStatus";

describe("useNetworkStatus", () => {
  // Store original navigator.onLine
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "onLine", {
      value: originalOnLine,
      writable: true,
      configurable: true,
    });
  });

  it("returns initial online state", () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
    expect(result.current.lastOnlineAt).toBeNull();
  });

  it("updates when going offline", () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("updates when coming back online", () => {
    const { result } = renderHook(() => useNetworkStatus());

    // Go offline first
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event("offline"));
    });

    // Come back online
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(true);
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
  });

  it("clears wasOffline after 5 seconds", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useNetworkStatus());

    // Go offline then online
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.wasOffline).toBe(true);

    // Advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.wasOffline).toBe(false);

    jest.useRealTimers();
  });

  it("provides checkConnectivity function", () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(typeof result.current.checkConnectivity).toBe("function");
  });

  it("checkConnectivity returns boolean", async () => {
    // Mock fetch to fail (simulating no connectivity)
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useNetworkStatus());

    const isConnected = await result.current.checkConnectivity();

    expect(typeof isConnected).toBe("boolean");
    expect(isConnected).toBe(false);

    // Cleanup
    (global.fetch as jest.Mock).mockRestore();
  });
});

describe("useNetworkSpeed", () => {
  it("returns default values when Network Information API is not available", () => {
    const { result } = renderHook(() => useNetworkSpeed());

    expect(result.current.isSlowConnection).toBe(false);
    expect(result.current.effectiveType).toBe("unknown");
    expect(result.current.downlink).toBeNull();
  });

  it("detects slow connection when effectiveType is 2g", () => {
    // Mock Network Information API
    Object.defineProperty(navigator, "connection", {
      value: {
        effectiveType: "2g",
        downlink: 0.5,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkSpeed());

    expect(result.current.isSlowConnection).toBe(true);
    expect(result.current.effectiveType).toBe("2g");

    // Cleanup
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      configurable: true,
    });
  });

  it("detects fast connection when effectiveType is 4g", () => {
    Object.defineProperty(navigator, "connection", {
      value: {
        effectiveType: "4g",
        downlink: 10,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkSpeed());

    expect(result.current.isSlowConnection).toBe(false);
    expect(result.current.effectiveType).toBe("4g");
    expect(result.current.downlink).toBe(10);

    // Cleanup
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      configurable: true,
    });
  });
});
