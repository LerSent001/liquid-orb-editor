"use client";

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

import { type HsvColor } from "../../../lib/style-guide-color-utils";
import { cn } from "../../../lib/utils";
import {
  getColorChannels,
  type ColorSurfaceModel,
} from "./style-guide-color-picker-channel-utils";
import { type ColorSurfacePosition } from "./style-guide-color-picker-surface-geometry";

type ColorSurfaceProps = {
  surfaceRef: RefObject<HTMLDivElement | null>;
  surfaceLabel: string;
  surfaceClassName?: string;
  disabled: boolean;
  hueColor: string;
  currentColorHex: string;
  colorModel: ColorSurfaceModel;
  optimisticColor: HsvColor;
  surfacePosition: ColorSurfacePosition | null;
  isSurfaceDragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onThumbPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

function getRgbCss([red, green, blue]: [number, number, number]): string {
  return `rgb(${red} ${green} ${blue})`;
}

export function getColorSurfaceThumbPosition({
  colorModel,
  currentColorHex,
  optimisticColor,
  surfacePosition,
}: {
  colorModel: ColorSurfaceModel;
  currentColorHex: string;
  optimisticColor: HsvColor;
  surfacePosition?: ColorSurfacePosition | null;
}): { left: string; top: string } {
  if (surfacePosition) {
    return {
      left: `${surfacePosition.x * 100}%`,
      top: `${surfacePosition.y * 100}%`,
    };
  }

  const channels = getColorChannels(currentColorHex);

  if (colorModel === "rgb") {
    const [red, green] = channels.rgb;

    return {
      left: `${(red / 255) * 100}%`,
      top: `${(1 - green / 255) * 100}%`,
    };
  }

  if (colorModel === "hsl") {
    const [, saturation, lightness] = channels.hsl;

    return {
      left: `${saturation}%`,
      top: `${100 - lightness}%`,
    };
  }

  return {
    left: `${optimisticColor.s * 100}%`,
    top: `${(1 - optimisticColor.v) * 100}%`,
  };
}

export function getColorSurfaceStyle({
  colorModel,
  currentColorHex,
  hue,
  hueColor,
}: {
  colorModel: ColorSurfaceModel;
  currentColorHex: string;
  hue?: number;
  hueColor: string;
}): CSSProperties {
  const channels = getColorChannels(currentColorHex);

  if (colorModel === "rgb") {
    const blue = channels.rgb[2];

    return {
      backgroundColor: getRgbCss([0, 0, blue]),
      backgroundImage: [
        "linear-gradient(to right, rgb(0 0 0), rgb(255 0 0))",
        "linear-gradient(to top, rgb(0 0 0), rgb(0 255 0))",
      ].join(", "),
      backgroundBlendMode: "screen",
    };
  }

  if (colorModel === "hsl") {
    const [fallbackHue] = channels.hsl;
    const resolvedHue = hue ?? fallbackHue;

    return {
      backgroundImage: [
        "linear-gradient(to bottom, #fff 0%, transparent 50%, #000 100%)",
        `linear-gradient(to right, hsl(${resolvedHue} 0% 50%), hsl(${
          resolvedHue
        } 100% 50%))`,
      ].join(", "),
    };
  }

  return {
    backgroundColor: hueColor,
  };
}

export function ColorSurface({
  surfaceRef,
  surfaceLabel,
  surfaceClassName,
  disabled,
  hueColor,
  currentColorHex,
  colorModel,
  optimisticColor,
  surfacePosition,
  isSurfaceDragging,
  onPointerDown,
  onThumbPointerDown,
}: ColorSurfaceProps) {
  const thumbPosition = getColorSurfaceThumbPosition({
    colorModel,
    currentColorHex,
    optimisticColor,
    surfacePosition,
  });

  return (
    <div
      ref={surfaceRef}
      data-slot="style-guide-color-surface"
      data-color-model={colorModel}
      aria-label={surfaceLabel}
      className={cn(
        "group/surface relative aspect-square w-full shrink-0 touch-none rounded-t-[8px]",
        surfaceClassName,
        disabled && "cursor-not-allowed opacity-60",
      )}
      style={getColorSurfaceStyle({
        colorModel,
        currentColorHex,
        hue: optimisticColor.h,
        hueColor,
      })}
      onPointerDown={onPointerDown}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-[8px]">
        {colorModel === "hsb" ? (
          <>
            <div className="absolute inset-0 bg-linear-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black to-transparent" />
          </>
        ) : null}
        <div
          data-slot="style-guide-color-surface-divider"
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-[color:color-mix(in_oklab,var(--border)_6%,transparent)]"
        />
      </div>
      <div
        data-slot="style-guide-color-surface-thumb"
        aria-hidden
        className={cn(
          "absolute size-[14px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-foreground shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out group-hover/surface:scale-[1.4286]",
          isSurfaceDragging && "scale-[1.4286]",
        )}
        style={{
          backgroundColor: currentColorHex,
          left: thumbPosition.left,
          top: thumbPosition.top,
        }}
        onPointerDown={onThumbPointerDown}
      />
    </div>
  );
}
