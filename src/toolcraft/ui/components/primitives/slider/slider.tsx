"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "../../../lib/utils";
import { SliderControlContent } from "./slider-parts";
import { useSliderRuntime } from "./slider-runtime";
import type { SliderProps } from "./slider-types";

function Slider<Value extends number | readonly number[]>({
  className,
  defaultValue,
  disabled,
  getAriaLabel,
  largeStep,
  markerCount,
  markerValues,
  onBlurCapture,
  onPointerCancelCapture,
  onPointerDownCapture,
  onPointerUpCapture,
  onValueChange,
  onValueCommitted,
  orientation = "horizontal",
  resetValue,
  showFill = true,
  snapValues,
  step = 1,
  thumbAlignment = "edge",
  variant = "continuous",
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps<Value>) {
  const {
    handleThumbDoubleClick,
    handleValueChange,
    pointerDrag,
    resolvedMarkerCount,
    sliderValue,
  } = useSliderRuntime({
    defaultValue,
    disabled,
    largeStep,
    markerCount,
    max,
    min,
    onBlurCapture,
    onPointerCancelCapture,
    onPointerDownCapture,
    onPointerUpCapture,
    onValueChange,
    onValueCommitted,
    resetValue,
    snapValues,
    step,
    value,
    variant,
  });

  return (
    <SliderPrimitive.Root
      className={cn(
        "app-no-drag data-horizontal:w-full data-vertical:h-full",
        "[--slider-active-color:var(--foreground)] [--slider-track-color:color-mix(in_oklab,var(--muted-foreground)_38%,transparent)]",
        "data-[disabled]:[--slider-active-color:var(--foreground)] data-[disabled]:[--slider-track-color:var(--foreground)]",
        className,
      )}
      data-slot="slider"
      data-variant={variant}
      defaultValue={sliderValue.isDiscrete ? undefined : defaultValue}
      value={sliderValue.resolvedValue}
      min={min}
      max={max}
      disabled={disabled}
      largeStep={sliderValue.rootLargeStep}
      onBlurCapture={pointerDrag.handleBlurCapture}
      onPointerCancelCapture={pointerDrag.handlePointerCancelCapture}
      onPointerDownCapture={pointerDrag.handlePointerDownCapture}
      onPointerUpCapture={pointerDrag.handlePointerUpCapture}
      onValueChange={handleValueChange}
      onValueCommitted={sliderValue.handleValueCommitted}
      orientation={orientation}
      step={sliderValue.rootStep}
      thumbAlignment={thumbAlignment}
      thumbCollisionBehavior="none"
      {...props}
    >
      <SliderControlContent
        count={sliderValue.values.length}
        disabled={disabled}
        getAriaLabel={getAriaLabel}
        isDiscrete={sliderValue.isDiscrete}
        isPointerDragging={pointerDrag.isPointerDragging}
        markerCount={resolvedMarkerCount}
        markerValues={markerValues}
        max={max}
        min={min}
        onThumbDoubleClick={handleThumbDoubleClick}
        orientation={orientation}
        showFill={showFill}
      />
    </SliderPrimitive.Root>
  );
}

export { SliderInteractionProvider } from "./slider-interaction";
export type { SliderInteractionChangeDetails } from "./slider-interaction";
export { Slider };
