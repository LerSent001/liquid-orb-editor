"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";
import { ControlFieldLabel } from "../../control-layout";
import { EditableSliderValueLabel, Field } from "../../primitives";
import {
  createControlHistoryGroupId,
  type ControlChangeMeta,
} from "../control-types";
import type {
  VectorControlProps,
  VectorControlValue,
} from "./vector-control-types";
import {
  getDefaultPadCoordinateMode,
  getVectorPoint,
  pointFromEvent,
} from "./vector-pad-geometry";
import { VectorPadGuides, VectorPadHandle } from "./vector-pad-parts";
import { vectorPadBackgroundImages } from "./vector-pad-variants";
import {
  formatVectorPadCoordinate,
  getVectorValueLabel,
  parseVectorValueDraft,
} from "./vector-value";

type VectorPadAxisLock = "x" | "y";

type VectorPadDragStart = {
  clientX: number;
  clientY: number;
  value: VectorControlValue;
};

const vectorPadAxisLockThresholdPx = 2;

export function VectorPadField({
  defaultValue,
  name,
  onValueChange,
  padCoordinateMode,
  padShape = "compact",
  padVariant = "default",
  x,
  y,
}: VectorControlProps): React.JSX.Element {
  const [isPointerDragging, setIsPointerDragging] = React.useState(false);
  const normalizedX = formatVectorPadCoordinate(x);
  const normalizedY = formatVectorPadCoordinate(y);
  const coordinateMode =
    padCoordinateMode ?? getDefaultPadCoordinateMode(padVariant);
  const point = getVectorPoint(normalizedX, normalizedY, coordinateMode);
  const valueLabel = getVectorValueLabel(normalizedX, normalizedY);
  const vectorPadBackgroundImage = vectorPadBackgroundImages[padVariant];
  const axisLockRef = React.useRef<VectorPadAxisLock | null>(null);
  const dragStartRef = React.useRef<VectorPadDragStart | null>(null);
  const liveHistoryGroupRef = React.useRef<string | null>(null);
  const resetX = formatVectorPadCoordinate(defaultValue?.x);
  const resetY = formatVectorPadCoordinate(defaultValue?.y);
  const accessibleName = name || "Vector";
  const updateVector = (
    nextX: string,
    nextY: string,
    meta?: ControlChangeMeta,
  ) => {
    if (meta) {
      onValueChange?.({ x: nextX, y: nextY }, meta);
      return;
    }

    onValueChange?.({ x: nextX, y: nextY });
  };
  const commitVectorValue = (nextValue: string) => {
    const nextVector = parseVectorValueDraft(nextValue);

    if (nextVector) {
      updateVector(nextVector.x, nextVector.y);
    }
  };

  function getLiveHistoryMeta(): ControlChangeMeta {
    liveHistoryGroupRef.current ??= createControlHistoryGroupId(`vector:${accessibleName}`);

    return {
      history: "merge",
      historyGroup: liveHistoryGroupRef.current,
    };
  }

  function updateFromPointer(event: React.PointerEvent<HTMLButtonElement>): void {
    const nextPoint = pointFromEvent(event, coordinateMode);
    const nextValue: VectorControlValue = {
      x: (nextPoint.x * 2 - 1).toFixed(2),
      y: (nextPoint.y * 2 - 1).toFixed(2),
    };
    const dragStart = dragStartRef.current;

    if (event.shiftKey && dragStart) {
      if (!axisLockRef.current) {
        const deltaX = event.clientX - dragStart.clientX;
        const deltaY = event.clientY - dragStart.clientY;

        if (Math.hypot(deltaX, deltaY) < vectorPadAxisLockThresholdPx) {
          updateVector(
            dragStart.value.x,
            dragStart.value.y,
            getLiveHistoryMeta(),
          );
          return;
        }

        axisLockRef.current = Math.abs(deltaX) >= Math.abs(deltaY) ? "x" : "y";
      }

      updateVector(
        axisLockRef.current === "x" ? nextValue.x : dragStart.value.x,
        axisLockRef.current === "y" ? nextValue.y : dragStart.value.y,
        getLiveHistoryMeta(),
      );
      return;
    }

    axisLockRef.current = null;

    updateVector(
      nextValue.x,
      nextValue.y,
      getLiveHistoryMeta(),
    );
  }

  function stopPointerDrag(): void {
    setIsPointerDragging(false);
    axisLockRef.current = null;
    dragStartRef.current = null;
    liveHistoryGroupRef.current = null;
  }

  return (
    <Field className="min-w-0 gap-2">
      {name ? (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <ControlFieldLabel className="min-w-0">{name}</ControlFieldLabel>
          <EditableSliderValueLabel
            ariaLabel={`${name} value`}
            maxValueLabel="-1.00, -1.00"
            onCommit={commitVectorValue}
            valueLabel={valueLabel}
          />
        </div>
      ) : null}
      <button
        aria-label={`${accessibleName} X/Y pad`}
        className={cn(
          "relative w-full cursor-default! touch-none overflow-hidden rounded-[calc(var(--radius)+2px)] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_4%,transparent),color-mix(in_oklab,var(--foreground)_1%,transparent))] select-none focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--foreground)_12%,transparent)] focus-visible:outline-none",
          padShape === "square" ? "aspect-square" : "h-[142px]",
        )}
        data-vector-pad-coordinate-mode={coordinateMode}
        data-vector-pad-shape={padShape}
        data-vector-pad-variant={padVariant}
        onDoubleClick={(event) => {
          event.preventDefault();
          stopPointerDrag();
          updateVector(resetX, resetY);
        }}
        onLostPointerCapture={stopPointerDrag}
        onPointerCancel={stopPointerDrag}
        onPointerDown={(event) => {
          event.preventDefault();
          setIsPointerDragging(true);
          axisLockRef.current = null;
          dragStartRef.current = {
            clientX: event.clientX,
            clientY: event.clientY,
            value: { x: normalizedX, y: normalizedY },
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            updateFromPointer(event);
          }
        }}
        onPointerUp={stopPointerDrag}
        style={point}
        type="button"
      >
        {vectorPadBackgroundImage ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
            style={{ backgroundImage: vectorPadBackgroundImage }}
          />
        ) : null}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px)] bg-[length:14px_14px]"
        />
        <VectorPadGuides isDragging={isPointerDragging} />
        <VectorPadHandle isDragging={isPointerDragging} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] border border-[color:color-mix(in_oklab,var(--border)_10%,transparent)]"
        />
      </button>
    </Field>
  );
}
