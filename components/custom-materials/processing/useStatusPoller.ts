"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import { MaterialStatusResponse } from "@/types/custom-materials";

interface UseStatusPollerOptions {
  materialId: string;
  enabled?: boolean;
  interval?: number;
  onComplete?: (status: MaterialStatusResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for polling material processing status.
 * Automatically stops polling when status is COMPLETED or FAILED.
 */
export function useStatusPoller({
  materialId,
  enabled = true,
  interval = 3000,
  onComplete,
  onError,
}: UseStatusPollerOptions) {
  const { pollStatus, processingStatus, isPolling: storeIsPolling } = useCustomMaterialStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const status = await pollStatus(materialId);

      if (!mountedRef.current) return;

      if (status.status === "COMPLETED" || status.status === "FAILED") {
        stopPolling();
        onComplete?.(status);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error("Polling error:", error);
      onError?.(error instanceof Error ? error : new Error("Polling failed"));
    }
  }, [materialId, pollStatus, stopPolling, onComplete, onError]);

  useEffect(() => {
    mountedRef.current = true;
    let initialPollTimeout: NodeJS.Timeout | undefined;

    if (enabled && materialId) {
      // Poll immediately using setTimeout to avoid cascading renders
      initialPollTimeout = setTimeout(() => {
        if (mountedRef.current) poll();
      }, 0);
      // Then poll at interval
      intervalRef.current = setInterval(poll, interval);
    }

    return () => {
      if (initialPollTimeout) clearTimeout(initialPollTimeout);
      mountedRef.current = false;
      stopPolling();
    };
  }, [enabled, materialId, interval, poll, stopPolling]);

  return {
    status: processingStatus,
    isPolling: storeIsPolling, // Use store's isPolling instead of local state
    stopPolling,
  };
}
