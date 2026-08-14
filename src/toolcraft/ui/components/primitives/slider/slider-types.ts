import type { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { BaseUIEvent } from "@base-ui/react/types";
import type * as React from "react";

export type SliderVariant = "continuous" | "discrete";

export type SliderProps<Value extends number | readonly number[]> =
  SliderPrimitive.Root.Props<Value> & {
    getAriaLabel?: (index: number) => string;
    markerCount?: number;
    markerValues?: readonly number[];
    resetValue?: Value;
    showFill?: boolean;
    snapValues?: readonly number[];
    variant?: SliderVariant;
  };

export type SliderPointerEvent = BaseUIEvent<React.PointerEvent<HTMLDivElement>>;
export type SliderFocusEvent = BaseUIEvent<React.FocusEvent<HTMLDivElement>>;
export type SliderPointerEventHandler = (event: SliderPointerEvent) => void;
export type SliderFocusEventHandler = (event: SliderFocusEvent) => void;
