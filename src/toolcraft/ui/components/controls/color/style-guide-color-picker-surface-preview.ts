"use client";

import { useCallback, useEffect, useRef } from "react";

export function useSurfacePreview(emitChange: (hex: string) => void) {
  const pendingSurfacePreviewHexRef = useRef<string | null>(null);
  const surfacePreviewRafRef = useRef<number | null>(null);

  const clearScheduledSurfacePreview = useCallback(() => {
    if (surfacePreviewRafRef.current === null) return;
    window.cancelAnimationFrame(surfacePreviewRafRef.current);
    surfacePreviewRafRef.current = null;
  }, []);

  const flushPendingSurfacePreview = useCallback(() => {
    clearScheduledSurfacePreview();
    const pendingPreviewHex = pendingSurfacePreviewHexRef.current;
    pendingSurfacePreviewHexRef.current = null;
    if (pendingPreviewHex) emitChange(pendingPreviewHex);
  }, [clearScheduledSurfacePreview, emitChange]);

  const scheduleSurfacePreview = useCallback(
    (nextHex: string) => {
      pendingSurfacePreviewHexRef.current = nextHex;
      if (surfacePreviewRafRef.current !== null) return;

      surfacePreviewRafRef.current = window.requestAnimationFrame(() => {
        surfacePreviewRafRef.current = null;
        const scheduledHex = pendingSurfacePreviewHexRef.current;
        pendingSurfacePreviewHexRef.current = null;
        if (scheduledHex) emitChange(scheduledHex);
      });
    },
    [emitChange],
  );

  useEffect(() => clearScheduledSurfacePreview, [clearScheduledSurfacePreview]);

  return {
    pendingSurfacePreviewHexRef,
    clearScheduledSurfacePreview,
    flushPendingSurfacePreview,
    scheduleSurfacePreview,
  };
}
