import { STYLE_GUIDE_PRIMARY_FAMILY_OPTIONS } from "./palette-control-data";

export const PALETTE_COLUMNS = 5;
export const PALETTE_CELL_SIZE = 28;
export const PALETTE_GAP = 12;
export const SHADE_RAIL_WIDTH = 20;

export function getPaletteBlockHeight() {
  const paletteRows = Math.ceil(
    STYLE_GUIDE_PRIMARY_FAMILY_OPTIONS.length / PALETTE_COLUMNS,
  );

  return paletteRows * PALETTE_CELL_SIZE + Math.max(0, paletteRows - 1) * PALETTE_GAP;
}
