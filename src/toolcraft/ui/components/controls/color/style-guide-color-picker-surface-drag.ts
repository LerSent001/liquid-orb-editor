"use client";

import { useEffect, type MutableRefObject } from "react";
import { hsvToHex, type HsvColor } from "../../../lib/style-guide-color-utils";
import type { ColorSurfaceModel } from "./style-guide-color-picker-channel-utils";
import type { InteractionSource } from "./style-guide-color-picker-interaction-state";
import {
  getSurfaceHsvColor,
  getSurfacePosition,
  type ColorSurfacePosition,
  type DragBounds,
} from "./style-guide-color-picker-surface-geometry";

type SurfaceDragOptions = {
  isSurfaceDragging: boolean;
  setIsSurfaceDragging: (nextIsDragging: boolean) => void;
  surfaceBoundsRef: MutableRefObject<DragBounds | null>;
  surfaceDragStartHexRef: MutableRefObject<string | null>;
  surfaceDragStartColorRef: MutableRefObject<HsvColor | null>;
  pendingSurfaceCommitHexRef: MutableRefObject<string | null>;
  pendingSurfaceBaseHexRef: MutableRefObject<string | null>;
  latestHsvRef: MutableRefObject<HsvColor>;
  surfaceModelRef: MutableRefObject<ColorSurfaceModel>;
  applyOptimisticColor: (nextColor: HsvColor) => string;
  scheduleSurfacePreview: (hex: string) => void;
  flushPendingSurfacePreview: () => void;
  setSurfacePositionOverride: (
    position: ColorSurfacePosition,
    hex: string,
    surfaceModel: ColorSurfaceModel,
  ) => void;
  setInteractionSourceState: (source: InteractionSource, nextIsActive: boolean) => void;
  emitChange: (hex: string) => void;
  onCommit?: () => void;
};

export function useSurfaceDrag(options: SurfaceDragOptions) {
  useEffect(() => {
    if (!options.isSurfaceDragging) return;

    const updateFromSurface = (clientX: number, clientY: number) => {
      const surfaceBounds = options.surfaceBoundsRef.current;
      if (!surfaceBounds || surfaceBounds.width === 0 || surfaceBounds.height === 0) return;

      const surfacePosition = getSurfacePosition(clientX, clientY, surfaceBounds);
      const surfaceModel = options.surfaceModelRef.current;
      const nextColor = getSurfaceHsvColor({
        clientX,
        clientY,
        surfaceBounds,
        currentColor: options.surfaceDragStartColorRef.current ?? options.latestHsvRef.current,
        surfaceModel,
      });
      const optimisticHex = options.applyOptimisticColor(nextColor);
      options.setSurfacePositionOverride(surfacePosition, optimisticHex, surfaceModel);
      options.scheduleSurfacePreview(optimisticHex);
    };

    const finishDrag = () => {
      const nextHex = hsvToHex(options.latestHsvRef.current);
      const dragStartHex = options.surfaceDragStartHexRef.current;
      options.setIsSurfaceDragging(false);
      options.setInteractionSourceState("surface", false);
      options.surfaceBoundsRef.current = null;
      options.surfaceDragStartHexRef.current = null;
      options.surfaceDragStartColorRef.current = null;
      options.flushPendingSurfacePreview();

      if (!dragStartHex || nextHex === dragStartHex) {
        options.pendingSurfaceCommitHexRef.current = null;
        options.pendingSurfaceBaseHexRef.current = null;
        return;
      }

      options.pendingSurfaceCommitHexRef.current = nextHex;
      options.pendingSurfaceBaseHexRef.current = dragStartHex;
      options.emitChange(nextHex);
      options.onCommit?.();
    };

    const handlePointerMove = (event: PointerEvent) =>
      updateFromSurface(event.clientX, event.clientY);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [options]);
}
