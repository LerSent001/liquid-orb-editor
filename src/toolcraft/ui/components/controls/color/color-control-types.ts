import type { ControlValueChangeHandler } from "../control-types";

export type ColorControlInput = {
  hex?: string;
  name: string;
  onValueChange?: ControlValueChangeHandler<{ hex: string }>;
  showLabel?: boolean;
};

export type ColorOpacityValue = {
  hex: string;
  opacity: number;
};

export type ColorOpacityControlProps = {
  hex?: string;
  name: string;
  onValueChange?: ControlValueChangeHandler<ColorOpacityValue>;
  opacity?: number;
  showLabel?: boolean;
};

export type ColorControlInputPair = readonly [
  ColorControlInput,
  ColorControlInput,
];

type ColorControlSingleProps = ColorControlInput & {
  inputs?: never;
};

export type ColorControlGroupProps = {
  inputs: ColorControlInputPair;
};

export type ColorControlProps =
  | ColorControlSingleProps
  | ColorControlGroupProps;
