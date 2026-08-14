"use client";

import {
  PALETTE_SHADE_STEPS,
  STYLE_GUIDE_PRIMARY_FAMILY_OPTIONS,
  TAILWIND_COLOR_PALETTE,
  getPaletteHex,
  type PaletteColorFamily,
  type PaletteControlValue,
  type PaletteShadeStep,
} from "./palette-control-data";
import { usePaletteControlController } from "./palette-control-controller";
import { PaletteControlView } from "./palette-control-view";
import type { PaletteControlProps } from "./palette-control-types";

export {
  PALETTE_SHADE_STEPS,
  STYLE_GUIDE_PRIMARY_FAMILY_OPTIONS,
  TAILWIND_COLOR_PALETTE,
  getPaletteHex,
};
export type { PaletteColorFamily, PaletteControlValue, PaletteShadeStep };
export type { PaletteControlChangeMeta, PaletteControlProps } from "./palette-control-types";

export function PaletteControl(props: PaletteControlProps) {
  return <PaletteControlView {...usePaletteControlController(props)} />;
}
