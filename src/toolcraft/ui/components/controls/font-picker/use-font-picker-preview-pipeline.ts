"use client";

import * as React from "react";

import type { FontPickerFontCatalogEntry } from "./font-catalog";
import {
  queueFontPickerPreviewLoad,
  queueFontPickerPreviewLoadBatch,
} from "./font-preview-loader";
import { useHoverIntent } from "./use-hover-intent";

export function useFontPickerPreviewPipeline({
  disabled,
  onPreviewChange,
  open,
  selectedFont,
  visibleFonts,
}: {
  disabled: boolean;
  onPreviewChange?: (nextFontId: string | null) => void;
  open: boolean;
  selectedFont?: FontPickerFontCatalogEntry | null;
  visibleFonts: readonly FontPickerFontCatalogEntry[];
}): {
  cancelHoverPreviewIntent: () => void;
  clearHoverPreview: () => void;
  emitPreviewChange: (
    nextFontId: string | null,
    options?: { immediate?: boolean },
  ) => void;
  handleHoverPreview: (font: FontPickerFontCatalogEntry) => void;
  scheduleHoverPreviewIntent: (font: FontPickerFontCatalogEntry) => void;
  warmFontPreview: (
    fontEntry: FontPickerFontCatalogEntry | null | undefined,
    priority?: "high" | "normal",
  ) => void;
} {
  const previewFrameRef = React.useRef<number | null>(null);
  const pendingPreviewFontIdRef = React.useRef<string | null>(null);
  const lastEmittedPreviewFontIdRef = React.useRef<string | null>(null);

  const emitPreviewImmediately = React.useCallback(
    (nextFontId: string | null) => {
      if (disabled) {
        return;
      }

      if (nextFontId !== null && lastEmittedPreviewFontIdRef.current === nextFontId) {
        return;
      }

      lastEmittedPreviewFontIdRef.current = nextFontId;
      onPreviewChange?.(nextFontId);
    },
    [disabled, onPreviewChange],
  );

  const cancelScheduledPreview = React.useCallback(() => {
    if (previewFrameRef.current !== null) {
      window.cancelAnimationFrame(previewFrameRef.current);
      previewFrameRef.current = null;
    }

    pendingPreviewFontIdRef.current = null;
  }, []);

  const emitPreviewChange = React.useCallback(
    (nextFontId: string | null, options?: { immediate?: boolean }) => {
      if (disabled) {
        return;
      }

      if (nextFontId === null || options?.immediate) {
        cancelScheduledPreview();
        emitPreviewImmediately(nextFontId);
        return;
      }

      pendingPreviewFontIdRef.current = nextFontId;
      if (previewFrameRef.current !== null) {
        return;
      }

      previewFrameRef.current = window.requestAnimationFrame(() => {
        previewFrameRef.current = null;
        const scheduledFontId = pendingPreviewFontIdRef.current;
        pendingPreviewFontIdRef.current = null;

        if (scheduledFontId) {
          emitPreviewImmediately(scheduledFontId);
        }
      });
    },
    [cancelScheduledPreview, disabled, emitPreviewImmediately],
  );

  const warmFontPreview = React.useCallback(
    (
      fontEntry: FontPickerFontCatalogEntry | null | undefined,
      priority: "high" | "normal" = "normal",
    ) => {
      if (!fontEntry) {
        return;
      }

      queueFontPickerPreviewLoad(fontEntry, { priority });
    },
    [],
  );

  const handleHoverPreview = React.useCallback(
    (font: FontPickerFontCatalogEntry) => {
      warmFontPreview(font, "high");
      emitPreviewChange(font.id);
    },
    [emitPreviewChange, warmFontPreview],
  );

  const {
    cancelIntent: cancelHoverPreviewIntent,
    scheduleIntent: scheduleHoverPreviewIntent,
  } = useHoverIntent({ onIntent: handleHoverPreview });

  const clearHoverPreview = React.useCallback(() => {
    cancelHoverPreviewIntent();
    emitPreviewChange(null, { immediate: true });
  }, [cancelHoverPreviewIntent, emitPreviewChange]);

  React.useEffect(() => {
    if (selectedFont) {
      warmFontPreview(selectedFont, "high");
    }
  }, [selectedFont, warmFontPreview]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (selectedFont) {
      warmFontPreview(selectedFont, "high");
    }

    queueFontPickerPreviewLoadBatch(visibleFonts, { priority: "high" });
  }, [open, selectedFont, visibleFonts, warmFontPreview]);

  React.useEffect(() => {
    return () => {
      cancelHoverPreviewIntent();
      cancelScheduledPreview();
      onPreviewChange?.(null);
    };
  }, [cancelHoverPreviewIntent, cancelScheduledPreview, onPreviewChange]);

  return {
    cancelHoverPreviewIntent,
    clearHoverPreview,
    emitPreviewChange,
    handleHoverPreview,
    scheduleHoverPreviewIntent,
    warmFontPreview,
  };
}
