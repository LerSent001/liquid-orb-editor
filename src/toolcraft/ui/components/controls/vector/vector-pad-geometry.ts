import type * as React from "react";

import type {
  VectorPadCoordinateMode,
  VectorPadVariant,
} from "./vector-control-types";
import { clamp } from "./vector-value";

type VectorPadPoint = { x: number; y: number };

export type VectorPadStyle = React.CSSProperties & {
  "--xy-pad-display-x": string;
  "--xy-pad-display-y": string;
  "--xy-pad-handle-margin": string;
  "--xy-pad-x": string;
  "--xy-pad-y": string;
};

export function getDefaultPadCoordinateMode(
  padVariant: VectorPadVariant,
): VectorPadCoordinateMode {
  return padVariant === "default" ? "screen" : "cartesian";
}

export function pointFromEvent(
  event: React.PointerEvent<HTMLElement>,
  coordinateMode: VectorPadCoordinateMode,
): VectorPadPoint {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = clamp((event.clientX - rect.left) / rect.width);
  const yRatio = clamp((event.clientY - rect.top) / rect.height);
  const y = coordinateMode === "screen" ? yRatio : 1 - yRatio;

  return { x, y };
}

export function getVectorPoint(
  x: string,
  y: string,
  coordinateMode: VectorPadCoordinateMode,
): VectorPadStyle {
  const parsedX = Number.parseFloat(x);
  const parsedY = Number.parseFloat(y);
  const clampedX = Number.isFinite(parsedX) ? clamp(parsedX, -1, 1) : 0;
  const clampedY = Number.isFinite(parsedY) ? clamp(parsedY, -1, 1) : 0;
  const xPosition = `${(clampedX + 1) * 50}%`;
  const yPosition =
    coordinateMode === "screen"
      ? `${((clampedY + 1) / 2) * 100}%`
      : `${(1 - (clampedY + 1) / 2) * 100}%`;

  return {
    "--xy-pad-display-x":
      "clamp(var(--xy-pad-handle-margin), var(--xy-pad-x), calc(100% - var(--xy-pad-handle-margin)))",
    "--xy-pad-display-y":
      "clamp(var(--xy-pad-handle-margin), var(--xy-pad-y), calc(100% - var(--xy-pad-handle-margin)))",
    "--xy-pad-handle-margin": "12px",
    "--xy-pad-x": xPosition,
    "--xy-pad-y": yPosition,
  };
}
