"use client";

import { useSliderInteractionValueChange } from "./slider-interaction";
import { resolveSliderMarkerCount } from "./slider-marker-policy";
import { useSliderPointerDragging } from "./slider-pointer-dragging";
import { useSliderThumbReset } from "./slider-reset";
import type {
  SliderFocusEventHandler,
  SliderPointerEventHandler,
  SliderProps,
  SliderVariant,
} from "./slider-types";
import { useSliderValueState } from "./slider-discrete-state";

type SliderRuntimeOptions<Value extends number | readonly number[]> = {
  defaultValue?: Value;
  disabled?: boolean;
  largeStep?: number;
  markerCount?: number;
  max: number;
  min: number;
  onBlurCapture?: SliderFocusEventHandler;
  onPointerCancelCapture?: SliderPointerEventHandler;
  onPointerDownCapture?: SliderPointerEventHandler;
  onPointerUpCapture?: SliderPointerEventHandler;
  onValueChange?: SliderProps<Value>["onValueChange"];
  onValueCommitted?: SliderProps<Value>["onValueCommitted"];
  resetValue?: Value;
  snapValues?: readonly number[];
  step: number;
  value?: Value;
  variant: SliderVariant;
};

export function useSliderRuntime<Value extends number | readonly number[]>({
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
}: SliderRuntimeOptions<Value>) {
  const sliderValue = useSliderValueState({
    defaultValue,
    largeStep,
    max,
    min,
    onValueChange,
    onValueCommitted,
    snapValues,
    step,
    value,
    variant,
  });
  const pointerDrag = useSliderPointerDragging({
    disabled,
    onBlurCapture,
    onPointerCancelCapture,
    onPointerDownCapture,
    onPointerUpCapture,
  });
  const resolvedMarkerCount = resolveSliderMarkerCount({
    markerCount,
    max,
    min,
    step,
    variant,
  });
  const handleValueChange = useSliderInteractionValueChange({
    disabled,
    handleValueChange: sliderValue.handleValueChange,
    max,
    min,
    values: sliderValue.values,
  });
  const handleThumbDoubleClick = useSliderThumbReset({
    defaultValue,
    disabled,
    handleValueChange,
    handleValueCommitted: sliderValue.handleValueCommitted,
    isDiscrete: sliderValue.isDiscrete,
    max,
    min,
    resetValue,
    snapValues,
    step,
    value,
    values: sliderValue.values,
  });

  return {
    handleThumbDoubleClick,
    handleValueChange,
    pointerDrag,
    resolvedMarkerCount,
    sliderValue,
  };
}
