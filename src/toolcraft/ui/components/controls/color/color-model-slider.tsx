"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { type HsvColor } from "../../../lib/style-guide-color-utils";
import { cn } from "../../../lib/utils";
import {
  getColorChannels,
  type ColorSurfaceModel,
} from "./style-guide-color-picker-channel-utils";

const HUE_RAIL_BACKGROUND =
  "linear-gradient(90deg, #ff0000 0%, #ffff00 16.67%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%)";
const RGB_BLUE_RAIL_BACKGROUND =
  "linear-gradient(90deg, rgb(0 0 0), rgb(0 0 255))";

function clampSliderValue(value: number, max: number): number {
  return Math.min(max, Math.max(0, value));
}

function getSliderValueFromClientX(
  clientX: number,
  bounds: DOMRect,
  max: number,
): number {
  if (bounds.width === 0) return 0;

  return clampSliderValue(
    Math.round(((clientX - bounds.left) / bounds.width) * max),
    max,
  );
}

type ColorModelSliderProps = {
  label: string;
  disabled: boolean;
  max: number;
  railBackground: string;
  value: number;
  onDragStateChange: (nextIsDragging: boolean) => void;
  onPreviewChange: (nextValue: number) => void;
  onCommit: (nextValue: number) => void;
};

export function getColorSurfaceSliderConfig({
  colorModel,
  currentColorHex,
  hueLabel,
  optimisticColor,
}: {
  colorModel: ColorSurfaceModel;
  currentColorHex: string;
  hueLabel: string;
  optimisticColor: HsvColor;
}): {
  label: string;
  max: number;
  railBackground: string;
  value: number;
} {
  if (colorModel === "rgb") {
    const [, , blue] = getColorChannels(currentColorHex).rgb;

    return {
      label: "RGB blue channel",
      max: 255,
      railBackground: RGB_BLUE_RAIL_BACKGROUND,
      value: blue,
    };
  }

  return {
    label: hueLabel,
    max: 360,
    railBackground: HUE_RAIL_BACKGROUND,
    value: optimisticColor.h,
  };
}

export function ColorModelSlider({
  label,
  disabled,
  max,
  railBackground,
  value,
  onDragStateChange,
  onPreviewChange,
  onCommit,
}: ColorModelSliderProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragBoundsRef = useRef<DOMRect | null>(null);
  const latestDragValueRef = useRef(value);
  const callbacksRef = useRef({ onCommit, onDragStateChange, onPreviewChange });
  const [isDragging, setIsDragging] = useState(false);
  const activeValue = isDragging ? latestDragValueRef.current : value;
  const valuePercent =
    max === 0 ? 0 : (clampSliderValue(activeValue, max) / max) * 100;

  useEffect(() => {
    callbacksRef.current = { onCommit, onDragStateChange, onPreviewChange };
  }, [onCommit, onDragStateChange, onPreviewChange]);

  useEffect(() => {
    if (!isDragging) {
      latestDragValueRef.current = value;
    }
  }, [isDragging, value]);

  const previewFromClientX = useCallback(
    (clientX: number) => {
      const bounds = dragBoundsRef.current;
      if (!bounds) return;

      const nextValue = getSliderValueFromClientX(clientX, bounds, max);
      latestDragValueRef.current = nextValue;
      callbacksRef.current.onPreviewChange(nextValue);
    },
    [max],
  );

  const finishDrag = useCallback((shouldCommit: boolean) => {
    const nextValue = latestDragValueRef.current;

    dragBoundsRef.current = null;
    setIsDragging(false);
    callbacksRef.current.onDragStateChange(false);

    if (shouldCommit) {
      callbacksRef.current.onCommit(nextValue);
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      previewFromClientX(event.clientX);
    };
    const handlePointerUp = (event: PointerEvent) => {
      event.preventDefault();
      previewFromClientX(event.clientX);
      finishDrag(true);
    };
    const handlePointerCancel = () => finishDrag(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("blur", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("blur", handlePointerCancel);
    };
  }, [finishDrag, isDragging, previewFromClientX]);

  const beginDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;

      const bounds = sliderRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return;

      event.preventDefault();
      dragBoundsRef.current = bounds;
      setIsDragging(true);
      callbacksRef.current.onDragStateChange(true);
      previewFromClientX(event.clientX);
    },
    [disabled, previewFromClientX],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      const step = event.shiftKey ? 10 : 1;
      let nextValue: number | null = null;

      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        nextValue = clampSliderValue(activeValue - step, max);
      } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        nextValue = clampSliderValue(activeValue + step, max);
      } else if (event.key === "Home") {
        nextValue = 0;
      } else if (event.key === "End") {
        nextValue = max;
      }

      if (nextValue == null) return;

      event.preventDefault();
      latestDragValueRef.current = nextValue;
      callbacksRef.current.onPreviewChange(nextValue);
      callbacksRef.current.onCommit(nextValue);
    },
    [activeValue, disabled, max],
  );

  return (
    <div
      data-slot="style-guide-color-hue"
      className={cn(
        "relative w-full",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div
        data-slot="style-guide-color-hue-rail"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        style={{ background: railBackground }}
      />
      <div
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={activeValue}
        className={cn(
          "relative h-[18px] w-full touch-none cursor-pointer select-none [--slider-active-color:var(--foreground)] [--slider-track-color:transparent]",
          disabled && "cursor-not-allowed",
        )}
        data-slot="slider"
        data-variant="continuous"
        onKeyDown={handleKeyDown}
        onPointerDown={beginDrag}
        ref={sliderRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
      >
        <div
          className="group/slider-control relative flex h-[18px] w-full touch-none items-center select-none"
          data-orientation="horizontal"
          data-slot="slider-control"
        >
          <div
            className="group/slider-track relative h-px w-full grow overflow-visible rounded-full bg-[color:var(--slider-track-color)] select-none"
            data-slot="slider-track"
          />
          <div
            className="group/slider-thumb absolute top-1/2 block size-[9px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full select-none before:absolute before:top-1/2 before:left-1/2 before:block before:size-[18px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
            data-dragging={isDragging ? "" : undefined}
            data-slot="slider-thumb"
            style={{ left: `${valuePercent}%` }}
          >
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 block rounded-full bg-[color:var(--slider-active-color)] transition-[scale,background-color] duration-200 ease-out motion-reduce:transition-none",
                disabled
                  ? null
                  : "group-hover/slider-thumb:scale-[1.4] group-data-[dragging]/slider-thumb:scale-[1.4]",
              )}
              data-slot="slider-dot"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
