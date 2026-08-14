import type { ControlValueChangeHandler } from "../control-types";

export type VectorControlValue = {
  x: string;
  y: string;
};

export type VectorPadVariant =
  | "default"
  | "whiteBalance"
  | "colorBalance"
  | "chromaOffset"
  | "toneBias";

export type VectorPadCoordinateMode = "cartesian" | "screen";

export type VectorControlProps = VectorControlValue & {
  defaultValue?: Partial<VectorControlValue>;
  name: string;
  onValueChange?: ControlValueChangeHandler<VectorControlValue>;
  padCoordinateMode?: VectorPadCoordinateMode;
  padShape?: "compact" | "square";
  padVariant?: VectorPadVariant;
  xLabel?: string;
  yLabel?: string;
};
