"use client";

import { useCallback, useEffect, useRef } from "react";

export type InteractionSource = "surface" | "hue" | "hex";

export function useInteractionState(onInteractionStateChange?: (isInteracting: boolean) => void) {
  const onInteractionStateChangeRef = useRef(onInteractionStateChange);
  const interactionSourcesRef = useRef<Record<InteractionSource, boolean>>({
    surface: false,
    hue: false,
    hex: false,
  });
  const isInteractingRef = useRef(false);

  useEffect(() => {
    onInteractionStateChangeRef.current = onInteractionStateChange;
  }, [onInteractionStateChange]);

  const setInteractionSourceState = useCallback(
    (source: InteractionSource, nextIsActive: boolean) => {
      if (interactionSourcesRef.current[source] === nextIsActive) return;

      interactionSourcesRef.current[source] = nextIsActive;
      const nextIsInteracting =
        interactionSourcesRef.current.surface ||
        interactionSourcesRef.current.hue ||
        interactionSourcesRef.current.hex;

      if (isInteractingRef.current === nextIsInteracting) return;

      isInteractingRef.current = nextIsInteracting;
      onInteractionStateChangeRef.current?.(nextIsInteracting);
    },
    [],
  );

  const clearInteractionState = useCallback(() => {
    if (!isInteractingRef.current) return;

    interactionSourcesRef.current = { surface: false, hue: false, hex: false };
    isInteractingRef.current = false;
    onInteractionStateChangeRef.current?.(false);
  }, []);

  useEffect(() => clearInteractionState, [clearInteractionState]);

  return { clearInteractionState, setInteractionSourceState };
}
