"use client";

import * as React from "react";

import type {
  SliderFocusEvent,
  SliderPointerEvent,
  SliderFocusEventHandler,
  SliderPointerEventHandler,
} from "./slider-types";

type SliderPointerDraggingOptions = {
  disabled?: boolean;
  onBlurCapture?: SliderFocusEventHandler;
  onPointerCancelCapture?: SliderPointerEventHandler;
  onPointerDownCapture?: SliderPointerEventHandler;
  onPointerUpCapture?: SliderPointerEventHandler;
};

export function useSliderPointerDragging({
  disabled,
  onBlurCapture,
  onPointerCancelCapture,
  onPointerDownCapture,
  onPointerUpCapture,
}: SliderPointerDraggingOptions) {
  const [isPointerDragging, setIsPointerDragging] = React.useState(false);
  const stopPointerDrag = React.useCallback(() => {
    setIsPointerDragging(false);
  }, []);
  const handlePointerDownCapture = React.useCallback(
    (event: SliderPointerEvent) => {
      onPointerDownCapture?.(event);
      if (event.defaultPrevented || disabled || event.button !== 0) {
        return;
      }

      setIsPointerDragging(true);
    },
    [disabled, onPointerDownCapture],
  );
  const handlePointerUpCapture = React.useCallback(
    (event: SliderPointerEvent) => {
      onPointerUpCapture?.(event);
      stopPointerDrag();
    },
    [onPointerUpCapture, stopPointerDrag],
  );
  const handlePointerCancelCapture = React.useCallback(
    (event: SliderPointerEvent) => {
      onPointerCancelCapture?.(event);
      stopPointerDrag();
    },
    [onPointerCancelCapture, stopPointerDrag],
  );
  const handleBlurCapture = React.useCallback(
    (event: SliderFocusEvent) => {
      onBlurCapture?.(event);
      stopPointerDrag();
    },
    [onBlurCapture, stopPointerDrag],
  );

  React.useEffect(() => {
    if (!isPointerDragging) {
      return undefined;
    }

    window.addEventListener("pointerup", stopPointerDrag);
    window.addEventListener("pointercancel", stopPointerDrag);
    window.addEventListener("blur", stopPointerDrag);

    return () => {
      window.removeEventListener("pointerup", stopPointerDrag);
      window.removeEventListener("pointercancel", stopPointerDrag);
      window.removeEventListener("blur", stopPointerDrag);
    };
  }, [isPointerDragging, stopPointerDrag]);

  return {
    handleBlurCapture,
    handlePointerCancelCapture,
    handlePointerDownCapture,
    handlePointerUpCapture,
    isPointerDragging,
  };
}
