"use client";

import { cn } from "../../../lib/utils";
import {
  PALETTE_SHADE_STEPS,
  STYLE_GUIDE_PRIMARY_FAMILY_OPTIONS,
} from "./palette-control-data";
import {
  PALETTE_CELL_SIZE,
  PALETTE_COLUMNS,
  SHADE_RAIL_WIDTH,
} from "./palette-control-layout";
import type { PaletteControlViewProps } from "./palette-control-types";

export function PaletteControlView(props: PaletteControlViewProps) {
  const paletteGrid = (
    <div
      className="grid content-start gap-x-3 gap-y-3"
      style={{
        gridAutoRows: `${PALETTE_CELL_SIZE}px`,
        gridTemplateColumns: `repeat(${PALETTE_COLUMNS}, ${PALETTE_CELL_SIZE}px)`,
      }}
    >
      {STYLE_GUIDE_PRIMARY_FAMILY_OPTIONS.map((palette) => {
        const isSelected = palette.name === props.optimisticValue.family;

        return (
          <button
            key={palette.name}
            type="button"
            aria-label={`Primary family ${palette.name}`}
            aria-pressed={isSelected}
            disabled={props.disabled}
            className={cn(
              "relative size-[26px] place-self-center rounded-full border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] transition-[box-shadow,transform,opacity] duration-150 ease-out hover:scale-[1.04] active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--ring)_40%,transparent)] focus-visible:outline-hidden",
              isSelected &&
                "after:pointer-events-none after:absolute after:-inset-[6px] after:rounded-full after:border-2 after:border-[color:var(--foreground)] after:content-['']",
              props.disabled && "cursor-not-allowed opacity-60",
            )}
            style={{ backgroundColor: palette.shades["500"] }}
            onClick={() => props.onFamilySelect(palette.name)}
          />
        );
      })}
    </div>
  );

  const shadeRail = (
    <div className="flex items-stretch">
      <div
        ref={props.shadeTrackRef}
        data-slot="palette-shade-track"
        data-testid="palette-shade-track"
        className="relative flex min-h-0 flex-col"
        style={{
          height: `${props.paletteBlockHeight}px`,
          width: `${SHADE_RAIL_WIDTH}px`,
        }}
      >
        <div
          data-slot="palette-shade-indicator"
          data-testid="palette-shade-indicator"
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 z-10 touch-none",
            props.isShadeDragging
              ? "cursor-grabbing transition-none"
              : "cursor-grab transition-[top] duration-130 ease-out",
            props.disabled && "cursor-not-allowed",
          )}
          style={{
            height: `${props.shadeSegmentPercent}%`,
            top: `${props.indicatorTopPercent}%`,
          }}
          onPointerDown={props.onShadeIndicatorPointerDown}
        >
          <div className="absolute inset-[-3px] rounded-[7px] border-[3px] border-[color:var(--foreground)] [box-shadow:0_0_4px_rgba(0,0,0,0.3),inset_0_0_4px_rgba(0,0,0,0.3)]" />
        </div>

        {PALETTE_SHADE_STEPS.map((shade, index) => {
          const isSelected = shade === props.optimisticValue.shade;
          const isFirst = index === 0;
          const isLast = index === PALETTE_SHADE_STEPS.length - 1;

          return (
            <button
              key={shade}
              type="button"
              aria-label={`Primary shade ${shade}`}
              aria-pressed={isSelected}
              disabled={props.disabled}
              className={cn(
                "relative inline-flex min-h-0 w-5 flex-1 rounded-none border border-transparent transition-[opacity,transform] duration-150 ease-out hover:scale-[1.02]",
                "focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--ring)_40%,transparent)] focus-visible:outline-hidden",
                isFirst && "rounded-t-[3px]",
                isLast && "rounded-b-[3px]",
                props.disabled && "cursor-not-allowed opacity-60",
              )}
              style={{ backgroundColor: props.activePalette.shades[shade] }}
              onClick={() => props.onShadeSelect(shade)}
            >
              <span className="sr-only">{shade}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (props.variant === "panel") {
    return (
      <div
        aria-label={props.ariaLabel}
        data-slot="palette-control"
        className={cn("flex w-full justify-center py-[12px]", props.className)}
        role="group"
      >
        <div className="inline-flex w-fit items-stretch">
          <div
            data-slot="palette-control-palette-block"
            data-testid="palette-control-palette-block"
            className="shrink-0"
          >
            {paletteGrid}
          </div>
          <div
            aria-hidden="true"
            className="mx-5 w-px shrink-0 bg-[color:color-mix(in_oklab,var(--border)_8%,transparent)]"
          />
          <div
            data-slot="palette-control-slider-block"
            data-testid="palette-control-slider-block"
            className="flex min-w-0 items-stretch"
          >
            {shadeRail}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-label={props.ariaLabel}
      data-slot="palette-control"
      className={cn(
        "inline-flex flex-col overflow-hidden rounded-lg border border-[color:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--popover)_98%,transparent)] text-[color:var(--popover-foreground)] shadow-[0_10px_16px_color-mix(in_oklab,var(--background)_40%,transparent)]",
        props.className,
      )}
      role="group"
    >
      <div className="flex h-10 items-center border-b border-[color:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)] px-4">
        <div className="text-[14px] leading-none font-semibold text-[color:var(--foreground)]">
          {props.title}
        </div>
      </div>
      <div className="inline-grid grid-cols-[auto_1px_auto] items-stretch">
        <div className="px-4 py-4">
          {paletteGrid}
        </div>

        <div
          aria-hidden="true"
          className="h-full w-px bg-[color:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)]"
        />

        <div className="flex items-stretch px-4 py-4">
          {shadeRail}
        </div>
      </div>
    </div>
  );
}
