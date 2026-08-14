"use client";

import { useCallback, type MutableRefObject } from "react";
import { hsvToHex, type HsvColor } from "../../../lib/style-guide-color-utils";
import type { InteractionSource } from "./style-guide-color-picker-interaction-state";

type HueHandlersOptions = {
  latestHsvRef: MutableRefObject<HsvColor>;
  hueDragStartHexRef: MutableRefObject<string | null>;
  applyOptimisticColor: (nextColor: HsvColor) => string;
  setInteractionSourceState: (source: InteractionSource, nextIsActive: boolean) => void;
  emitChange: (hex: string) => void;
  onCommit?: () => void;
};

export function useHueHandlers({
  latestHsvRef,
  hueDragStartHexRef,
  applyOptimisticColor,
  setInteractionSourceState,
  emitChange,
  onCommit,
}: HueHandlersOptions) {
  const handleHueDragStateChange = useCallback(
    (nextIsDragging: boolean) => {
      if (nextIsDragging) {
        hueDragStartHexRef.current = hsvToHex(latestHsvRef.current);
        setInteractionSourceState("hue", true);
        return;
      }
      setInteractionSourceState("hue", false);
    },
    [hueDragStartHexRef, latestHsvRef, setInteractionSourceState],
  );

  const handleHuePreviewChange = useCallback(
    (nextHue: number) => {
      const nextHex = applyOptimisticColor({
        h: nextHue,
        s: latestHsvRef.current.s,
        v: latestHsvRef.current.v,
      });
      emitChange(nextHex);
    },
    [applyOptimisticColor, emitChange, latestHsvRef],
  );

  const handleHueCommit = useCallback(
    (nextHue: number) => {
      const nextHex = applyOptimisticColor({
        h: nextHue,
        s: latestHsvRef.current.s,
        v: latestHsvRef.current.v,
      });
      const dragStartHex = hueDragStartHexRef.current;
      hueDragStartHexRef.current = null;
      if (!dragStartHex || nextHex === dragStartHex) return;

      emitChange(nextHex);
      onCommit?.();
    },
    [applyOptimisticColor, emitChange, hueDragStartHexRef, latestHsvRef, onCommit],
  );

  return { handleHueDragStateChange, handleHuePreviewChange, handleHueCommit };
}
