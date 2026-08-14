import type * as React from "react";

import type { ControlChangeMeta } from "../control-types";
import type {
  PaletteColorFamily,
  PaletteControlValue,
  PaletteShadeStep,
} from "./palette-control-data";

export type PaletteControlChangeMeta = ControlChangeMeta & {
  stage: "live" | "commit";
  hex: string;
};

export type PaletteControlProps = {
  value?: PaletteControlValue;
  defaultValue?: PaletteControlValue;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  variant?: "popover" | "panel";
  className?: string;
  onValueChange?: (
    nextValue: PaletteControlValue,
    meta: PaletteControlChangeMeta,
  ) => void;
  onCommit?: (nextValue: PaletteControlValue, hex: string) => void;
  onInteractionStateChange?: (isInteracting: boolean) => void;
};

export type PaletteControlViewProps = {
  activePalette: {
    name: PaletteColorFamily;
    shades: Record<PaletteShadeStep, string>;
  };
  ariaLabel: string;
  className?: string;
  disabled: boolean;
  indicatorTopPercent: number;
  isShadeDragging: boolean;
  optimisticValue: PaletteControlValue;
  paletteBlockHeight: number;
  shadeSegmentPercent: number;
  shadeTrackRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  variant: NonNullable<PaletteControlProps["variant"]>;
  onFamilySelect: (family: PaletteColorFamily) => void;
  onShadeIndicatorPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onShadeSelect: (shade: PaletteShadeStep) => void;
};
