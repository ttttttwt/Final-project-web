"use client";

import { useState, useEffect, useCallback } from "react";

export interface NetworkStatus {
  /** Whether the browser is online */
  isOnline: boolean;
  /** Whether the network was recently restored */
  wasOffline: boolean;
  /** Time when network was last restored (null if never offline) */
  lastOnlineAt: Date | null;
  /** Check network connectivity by pinging an endpoint */
  checkConnectivity: () => Promise<boolean>;
}

/**
 * Hook to detect network online/offline status.
 * Provides real-time updates when network state changes.
 * 
 * @example
 * ```tsx
 * const { isOnline, wasOffline } = useNetworkStatus();
 * if (!isOnline) return <OfflineMessage />;
 * if (wasOffline) return <ReconnectedBanner />;
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Default to true during SSR
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });
  
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);

  /**
   * Check connectivity by attempting to fetch a small resource.
   * More reliable than navigator.onLine for detecting actual connectivity.
   */
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a tiny resource with cache busting
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setLastOnlineAt(new Date());
      
      // Clear the "was offline" state after 5 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    wasOffline,
    lastOnlineAt,
    checkConnectivity,
  };
}

/**
 * Hook to detect slow network conditions.
 * Uses Network Information API when available.
 */
export function useNetworkSpeed(): {
  isSlowConnection: boolean;
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  downlink: number | null;
} {
  const [networkInfo, setNetworkInfo] = useState<{
    isSlowConnection: boolean;
    effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
    downlink: number | null;
  }>({
    isSlowConnection: false,
    effectiveType: "unknown",
    downlink: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Network Information API (not available in all browsers)
    const connection = (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) return;

    const updateNetworkInfo = () => {
      const effectiveType = connection.effectiveType || "unknown";
      const downlink = connection.downlink ?? null;
      const isSlowConnection = 
        effectiveType === "slow-2g" || 
        effectiveType === "2g" ||
        (downlink !== null && downlink < 1);

      setNetworkInfo({
        isSlowConnection,
        effectiveType,
        downlink,
      });
    };

    updateNetworkInfo();
    connection.addEventListener("change", updateNetworkInfo);

    return () => {
      connection.removeEventListener("change", updateNetworkInfo);
    };
  }, []);

  return networkInfo;
}
