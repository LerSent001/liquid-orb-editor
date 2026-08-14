"use client";

import * as React from "react";

import { VectorPadField } from "./vector-pad-field";
import { VectorSizeField } from "./vector-size-field";
import type { VectorControlProps } from "./vector-control-types";

export type {
  VectorControlProps,
  VectorControlValue,
  VectorPadCoordinateMode,
  VectorPadVariant,
} from "./vector-control-types";

export function VectorControl(props: VectorControlProps): React.JSX.Element {
  if (props.xLabel === "Width" || props.yLabel === "Height") {
    return <VectorSizeField {...props} />;
  }

  return <VectorPadField {...props} />;
}
