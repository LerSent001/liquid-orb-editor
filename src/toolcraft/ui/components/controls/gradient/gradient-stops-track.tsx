"use client";

import type * as React from "react";

import { selectedItemBorderClassName } from "../../primitives/selection-state";
import { cn } from "../../../lib/utils";
import {
  formatStopPosition,
  getStopCssColor,
  parseStopPosition,
  type IndexedGradientStop,
} from "./gradient-control-utils";

const gradientStopPinEdgeInset = 2;

function getGradientStopPinLeftPosition(position: number): string {
  const stopPosition = formatStopPosition(position);
  const pixelOffset = gradientStopPinEdgeInset * (1 - position * 2);

  if (Math.abs(pixelOffset) < 0.01) {
    return stopPosition;
  }

  const offsetOperator = pixelOffset > 0 ? "+" : "-";
  const offsetValue = Number(Math.abs(pixelOffset).toFixed(2));

  return `calc(${stopPosition} ${offsetOperator} ${offsetValue}px)`;
}

function GradientStopPin({
  isDragging,
  isSelected,
  onDoubleClick,
  onKeyDown,
  onPointerDown,
  stop,
}: {
  isDragging: boolean;
  isSelected: boolean;
  onDoubleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  stop: IndexedGradientStop;
}): React.JSX.Element {
  const stopPosition = parseStopPosition(stop.position);

  return (
    <button
      aria-label={`Gradient stop ${stop.originalIndex + 1}`}
      aria-pressed={isSelected}
      className={cn(
        "absolute top-1 z-10 flex touch-none -translate-x-1/2 cursor-grab flex-col items-center rounded-lg outline-none",
        "active:cursor-grabbing",
        isDragging && "cursor-grabbing",
      )}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      style={{ left: getGradientStopPinLeftPosition(stopPosition) }}
      type="button"
    >
      <span
        className={cn(
          "flex size-[22px] items-center justify-center rounded-md bg-[color:var(--muted)] shadow-[0_4px_7px_color-mix(in_oklab,var(--background)_30%,transparent)] transition-colors",
          isSelected && "bg-[color:var(--accent)]",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "h-3.5 max-h-3.5 min-h-3.5 w-3.5 max-w-3.5 min-w-3.5 flex-none rounded-[4px] border border-[color:color-mix(in_oklab,var(--border)_10%,transparent)]",
            isSelected && selectedItemBorderClassName,
          )}
          style={{ backgroundColor: getStopCssColor(stop) }}
        />
      </span>
      <svg
        aria-hidden="true"
        className={cn(
          "h-1 w-2.5 text-[color:var(--muted)] transition-colors",
          isSelected && "text-[color:var(--accent)]",
        )}
        fill="none"
        viewBox="0 0 10 4"
      >
        <path
          d="M0 0H10L5.72 3.42Q5 4.08 4.28 3.42L0 0Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

export function GradientStopsTrack({
  gradient,
  onDragEnd,
  onPointerDown,
  onPointerMove,
  onRemoveStop,
  onRemoveStopByKey,
  onStartDrag,
  selectedIndex,
  stops,
  trackRef,
  draggingIndex,
}: {
  gradient: string;
  draggingIndex: number | null;
  onDragEnd: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onRemoveStop: (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onRemoveStopByKey: (
    index: number,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  onStartDrag: (
    index: number,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void;
  selectedIndex: number | null;
  stops: readonly IndexedGradientStop[];
  trackRef: React.RefObject<HTMLDivElement | null>;
}): React.JSX.Element {
  return (
    <div
      aria-label="Gradient stops track"
      className="app-no-drag relative mt-1 h-12 w-full touch-none cursor-crosshair"
      onPointerCancel={onDragEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onDragEnd}
      ref={trackRef}
    >
      <div className="absolute inset-x-0 top-4 h-6 overflow-hidden rounded-md border border-[color:color-mix(in_oklab,var(--border)_10%,transparent)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit]"
          style={{ background: gradient }}
        />
      </div>
      {stops.map((stop) => (
        <GradientStopPin
          isDragging={draggingIndex === stop.originalIndex}
          isSelected={selectedIndex === stop.originalIndex}
          key={stop.originalIndex}
          onDoubleClick={(event) => onRemoveStop(stop.originalIndex, event)}
          onKeyDown={(event) => onRemoveStopByKey(stop.originalIndex, event)}
          onPointerDown={(event) => onStartDrag(stop.originalIndex, event)}
          stop={stop}
        />
      ))}
    </div>
  );
}
