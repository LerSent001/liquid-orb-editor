import {
  clampNumber,
  hexToHsv,
  hsvToHex,
  type HsvColor,
} from "../../../lib/style-guide-color-utils";
import {
  getColorChannels,
  hslChannelsToHex,
  rgbChannelsToHex,
  type ColorSurfaceModel,
} from "./style-guide-color-picker-channel-utils";
import { resolveHsvFromHex } from "./style-guide-color-picker-color-utils";

export type DragBounds = Pick<DOMRect, "left" | "top" | "width" | "height">;
export type ColorSurfacePosition = { x: number; y: number };

export function getSurfacePosition(
  clientX: number,
  clientY: number,
  surfaceBounds: DragBounds,
): ColorSurfacePosition {
  return {
    x: clampNumber((clientX - surfaceBounds.left) / surfaceBounds.width, 0, 1),
    y: clampNumber((clientY - surfaceBounds.top) / surfaceBounds.height, 0, 1),
  };
}

export function getSurfaceHexColor({
  clientX,
  clientY,
  currentColor,
  surfaceBounds,
  surfaceModel,
}: {
  clientX: number;
  clientY: number;
  currentColor: HsvColor;
  surfaceBounds: DragBounds;
  surfaceModel: ColorSurfaceModel;
}): string {
  const { x, y } = getSurfacePosition(clientX, clientY, surfaceBounds);

  if (surfaceModel === "rgb") {
    const [, , blue] = getColorChannels(hsvToHex(currentColor)).rgb;

    return rgbChannelsToHex([
      Math.round(x * 255),
      Math.round((1 - y) * 255),
      blue,
    ]);
  }

  if (surfaceModel === "hsl") {
    return hslChannelsToHex([
      Math.round(currentColor.h),
      Math.round(x * 100),
      Math.round((1 - y) * 100),
    ]);
  }

  return hsvToHex({
    h: currentColor.h,
    s: x,
    v: 1 - y,
  });
}

export function getSurfaceHsvColor({
  clientX,
  clientY,
  currentColor,
  surfaceBounds,
  surfaceModel,
}: {
  clientX: number;
  clientY: number;
  currentColor: HsvColor;
  surfaceBounds: DragBounds;
  surfaceModel: ColorSurfaceModel;
}): HsvColor {
  const { x, y } = getSurfacePosition(clientX, clientY, surfaceBounds);

  if (surfaceModel === "rgb") {
    return resolveHsvFromHex(
      getSurfaceHexColor({
        clientX,
        clientY,
        currentColor,
        surfaceBounds,
        surfaceModel,
      }),
      currentColor,
    );
  }

  if (surfaceModel === "hsl") {
    const nextColor = hexToHsv(
      hslChannelsToHex([
        Math.round(currentColor.h),
        Math.round(x * 100),
        Math.round((1 - y) * 100),
      ]),
    );

    return { ...nextColor, h: currentColor.h };
  }

  return {
    h: currentColor.h,
    s: x,
    v: 1 - y,
  };
}
