"use client";

import * as React from "react";

import {
  createControlHistoryGroupId,
  type ControlChangeMeta,
} from "../control-types";
import {
  PALETTE_SHADE_STEPS,
  TAILWIND_COLOR_PALETTE,
  getPaletteHex,
  type PaletteColorFamily,
  type PaletteControlValue,
  type PaletteShadeStep,
} from "./palette-control-data";
import type {
  PaletteControlChangeMeta,
  PaletteControlProps,
  PaletteControlViewProps,
} from "./palette-control-types";
import { getPaletteBlockHeight } from "./palette-control-layout";

const CLICK_COMMIT_IDLE_MS = 250;
const PERSIST_SETTLE_MS = 160;
const DEFAULT_PALETTE_CONTROL_VALUE: PaletteControlValue = {
  family: "Amber",
  shade: "500",
};

function valuesEqual(left: PaletteControlValue, right: PaletteControlValue) {
  return left.family === right.family && left.shade === right.shade;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getShadeIndicatorTopPercent(shade: PaletteShadeStep) {
  const index = PALETTE_SHADE_STEPS.indexOf(shade);

  return Math.max(0, index) * (100 / PALETTE_SHADE_STEPS.length);
}

export function usePaletteControlController({
  value,
  defaultValue = DEFAULT_PALETTE_CONTROL_VALUE,
  disabled = false,
  ariaLabel = "Primary color palette",
  title = "Color palette",
  variant = "panel",
  className,
  onValueChange,
  onCommit,
  onInteractionStateChange,
}: PaletteControlProps): PaletteControlViewProps {
  const initialValue = value ?? defaultValue;
  const [optimisticValue, setOptimisticValue] =
    React.useState<PaletteControlValue>(initialValue);
  const [isShadeDragging, setIsShadeDragging] = React.useState(false);
  const [indicatorTopPercent, setIndicatorTopPercent] = React.useState(() =>
    getShadeIndicatorTopPercent(initialValue.shade),
  );
  const optimisticValueRef = React.useRef(initialValue);
  const pendingCommitRef = React.useRef<PaletteControlValue | null>(null);
  const pendingPersistRef = React.useRef<PaletteControlValue | null>(null);
  const clickCommitTimeoutRef = React.useRef<number | null>(null);
  const persistTimeoutRef = React.useRef<number | null>(null);
  const liveHistoryGroupRef = React.useRef<string | null>(null);
  const isInteractingRef = React.useRef(false);
  const shadeTrackRef = React.useRef<HTMLDivElement | null>(null);
  const onValueChangeRef = React.useRef(onValueChange);
  const onCommitRef = React.useRef(onCommit);
  const onInteractionStateChangeRef = React.useRef(onInteractionStateChange);

  const activePalette =
    TAILWIND_COLOR_PALETTE.find(
      (palette) => palette.name === optimisticValue.family,
    ) ?? TAILWIND_COLOR_PALETTE[0];
  const shadeSegmentPercent = 100 / PALETTE_SHADE_STEPS.length;

  React.useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  React.useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  React.useEffect(() => {
    onInteractionStateChangeRef.current = onInteractionStateChange;
  }, [onInteractionStateChange]);

  const setInteractionState = React.useCallback((nextIsInteracting: boolean) => {
    if (isInteractingRef.current === nextIsInteracting) {
      return;
    }

    isInteractingRef.current = nextIsInteracting;
    onInteractionStateChangeRef.current?.(nextIsInteracting);
  }, []);

  const clearClickCommitTimeout = React.useCallback(() => {
    if (clickCommitTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(clickCommitTimeoutRef.current);
    clickCommitTimeoutRef.current = null;
  }, []);

  const clearPersistTimeout = React.useCallback(() => {
    if (persistTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = null;
  }, []);

  const getLiveHistoryMeta = React.useCallback((): ControlChangeMeta => {
    liveHistoryGroupRef.current ??= createControlHistoryGroupId("palette");

    return {
      history: "merge",
      historyGroup: liveHistoryGroupRef.current,
    };
  }, []);

  const finishLiveHistoryGroup = React.useCallback(() => {
    liveHistoryGroupRef.current = null;
  }, []);

  const emitChange = React.useCallback(
    (nextValue: PaletteControlValue, stage: PaletteControlChangeMeta["stage"]) => {
      const hex = getPaletteHex(nextValue);
      const historyMeta =
        stage === "live" || liveHistoryGroupRef.current
          ? getLiveHistoryMeta()
          : undefined;

      onValueChangeRef.current?.(nextValue, {
        ...historyMeta,
        stage,
        hex,
      });
    },
    [getLiveHistoryMeta],
  );

  const syncOptimisticValue = React.useCallback((nextValue: PaletteControlValue) => {
    optimisticValueRef.current = nextValue;
    setOptimisticValue(nextValue);
  }, []);

  const flushPendingPersist = React.useCallback(
    (options?: { immediate?: boolean }) => {
      const pendingPersist = pendingPersistRef.current;

      if (!pendingPersist) {
        return false;
      }

      clearPersistTimeout();

      if (options?.immediate) {
        pendingPersistRef.current = null;
        onCommitRef.current?.(pendingPersist, getPaletteHex(pendingPersist));
        finishLiveHistoryGroup();
        setInteractionState(false);
        return true;
      }

      persistTimeoutRef.current = window.setTimeout(() => {
        persistTimeoutRef.current = null;
        const nextPersist = pendingPersistRef.current;
        pendingPersistRef.current = null;

        if (!nextPersist) {
          finishLiveHistoryGroup();
          setInteractionState(false);
          return;
        }

        onCommitRef.current?.(nextPersist, getPaletteHex(nextPersist));
        finishLiveHistoryGroup();
        setInteractionState(false);
      }, PERSIST_SETTLE_MS);

      return true;
    },
    [clearPersistTimeout, finishLiveHistoryGroup, setInteractionState],
  );

  const flushPendingCommit = React.useCallback((options?: { persistImmediately?: boolean }) => {
    const pendingCommit = pendingCommitRef.current;
    clearClickCommitTimeout();

    if (!pendingCommit) {
      if (!pendingPersistRef.current) {
        setInteractionState(false);
      }
      return false;
    }

    pendingCommitRef.current = null;
    emitChange(pendingCommit, "commit");
    pendingPersistRef.current = pendingCommit;
    flushPendingPersist({ immediate: options?.persistImmediately });

    return true;
  }, [clearClickCommitTimeout, emitChange, flushPendingPersist, setInteractionState]);

  const scheduleClickCommit = React.useCallback(
    (nextValue: PaletteControlValue) => {
      pendingCommitRef.current = nextValue;
      clearClickCommitTimeout();
      clearPersistTimeout();
      pendingPersistRef.current = null;
      setInteractionState(true);
      clickCommitTimeoutRef.current = window.setTimeout(() => {
        flushPendingCommit();
      }, CLICK_COMMIT_IDLE_MS);
    },
    [clearClickCommitTimeout, clearPersistTimeout, flushPendingCommit, setInteractionState],
  );

  const applyLiveSelection = React.useCallback(
    (nextValue: PaletteControlValue, source: "click" | "drag") => {
      if (disabled || valuesEqual(nextValue, optimisticValueRef.current)) {
        return null;
      }

      syncOptimisticValue(nextValue);
      emitChange(nextValue, "live");

      if (source === "click") {
        scheduleClickCommit(nextValue);
      } else {
        clearClickCommitTimeout();
        clearPersistTimeout();
        pendingPersistRef.current = null;
        pendingCommitRef.current = nextValue;
        setInteractionState(true);
      }

      return getPaletteHex(nextValue);
    },
    [
      clearClickCommitTimeout,
      clearPersistTimeout,
      disabled,
      emitChange,
      scheduleClickCommit,
      setInteractionState,
      syncOptimisticValue,
    ],
  );

  const updateDraggedShade = React.useCallback(
    (clientY: number) => {
      const trackBounds = shadeTrackRef.current?.getBoundingClientRect();

      if (!trackBounds || trackBounds.height === 0) {
        return;
      }

      const segmentHeight = trackBounds.height / PALETTE_SHADE_STEPS.length;
      const maxTop = trackBounds.height - segmentHeight;
      const nextTop = clamp(
        clientY - trackBounds.top - segmentHeight / 2,
        0,
        maxTop,
      );
      const nextIndex = clamp(
        Math.round(nextTop / segmentHeight),
        0,
        PALETTE_SHADE_STEPS.length - 1,
      );
      const nextShade = PALETTE_SHADE_STEPS[nextIndex]!;

      setIndicatorTopPercent((nextTop / trackBounds.height) * 100);
      applyLiveSelection(
        {
          family: optimisticValueRef.current.family,
          shade: nextShade,
        },
        "drag",
      );
    },
    [applyLiveSelection],
  );

  React.useEffect(() => {
    if (isShadeDragging) {
      return;
    }

    setIndicatorTopPercent(getShadeIndicatorTopPercent(optimisticValue.shade));
  }, [isShadeDragging, optimisticValue.shade]);

  React.useEffect(() => {
    if (!value) {
      return;
    }

    if (isShadeDragging || pendingCommitRef.current) {
      return;
    }

    syncOptimisticValue(value);
  }, [isShadeDragging, syncOptimisticValue, value]);

  React.useEffect(() => {
    if (!isShadeDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      updateDraggedShade(event.clientY);
    };

    const handlePointerFinish = () => {
      setIsShadeDragging(false);
      flushPendingCommit();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerFinish);
    window.addEventListener("pointercancel", handlePointerFinish);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerFinish);
      window.removeEventListener("pointercancel", handlePointerFinish);
    };
  }, [flushPendingCommit, isShadeDragging, updateDraggedShade]);

  React.useEffect(() => {
    return () => {
      const didCommit = flushPendingCommit({ persistImmediately: true });
      if (!didCommit) {
        flushPendingPersist({ immediate: true });
      }
    };
  }, [flushPendingCommit, flushPendingPersist]);

  const onFamilySelect = React.useCallback(
    (family: PaletteColorFamily) => {
      applyLiveSelection(
        {
          family,
          shade: optimisticValueRef.current.shade,
        },
        "click",
      );
    },
    [applyLiveSelection],
  );

  const onShadeSelect = React.useCallback(
    (shade: PaletteShadeStep) => {
      applyLiveSelection(
        {
          family: optimisticValueRef.current.family,
          shade,
        },
        "click",
      );
    },
    [applyLiveSelection],
  );

  const onShadeIndicatorPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      clearClickCommitTimeout();
      clearPersistTimeout();
      pendingPersistRef.current = null;
      setInteractionState(true);
      setIsShadeDragging(true);
    },
    [clearClickCommitTimeout, clearPersistTimeout, disabled, setInteractionState],
  );

  return {
    activePalette,
    ariaLabel,
    className,
    disabled,
    indicatorTopPercent,
    isShadeDragging,
    optimisticValue,
    paletteBlockHeight: getPaletteBlockHeight(),
    shadeSegmentPercent,
    shadeTrackRef,
    title,
    variant,
    onFamilySelect,
    onShadeIndicatorPointerDown,
    onShadeSelect,
  };
}
