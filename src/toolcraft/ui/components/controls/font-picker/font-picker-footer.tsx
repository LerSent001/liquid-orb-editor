"use client";

import * as React from "react";

import { Slider } from "../../primitives";

export function LetterSpacingIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden
      className="size-4 shrink-0"
      data-slot="font-picker-footer-icon"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#D9D9D9" height="16" width="1" />
      <rect fill="#D9D9D9" height="16" width="1" x="15" />
      <path
        d="M5.18182 13H4L7.41818 3H8.58182L12 13H10.8182L8.03636 4.58203H7.96364L5.18182 13ZM5.61818 9.09375H10.3818V10.168H5.61818V9.09375Z"
        fill="white"
      />
    </svg>
  );
}

export function LineHeightIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden
      className="size-4 shrink-0"
      data-slot="font-picker-footer-icon"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill="#D9D9D9"
        height="16"
        transform="rotate(90 16 0)"
        width="1"
        x="16"
      />
      <rect
        fill="#D9D9D9"
        height="16"
        transform="rotate(90 16 15)"
        width="1"
        x="16"
        y="15"
      />
      <path
        d="M5.18182 13H4L7.41818 3H8.58182L12 13H10.8182L8.03636 4.58203H7.96364L5.18182 13ZM5.61818 9.09375H10.3818V10.168H5.61818V9.09375Z"
        fill="white"
      />
    </svg>
  );
}

export function FontPickerFooterControl({
  disabled,
  icon,
  onValueChange,
  steps,
  title,
  valueIndex,
}: {
  disabled: boolean;
  icon: React.ReactNode;
  onValueChange: (nextValue: number) => void;
  steps: readonly unknown[];
  title: string;
  valueIndex: number;
}): React.JSX.Element {
  const markerValues = steps.map((_, index) => index);
  const min = 0;
  const max = Math.max(0, markerValues.length - 1);
  const currentValue = Math.min(max, Math.max(min, Math.round(valueIndex)));

  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-2"
      data-slot="font-picker-footer-control"
    >
      {icon}
      <div className="min-w-0 flex-1" data-slot="font-picker-footer-slider">
        <Slider
          className="[&_[data-slot=slider-range]]:transition-none [&_[data-slot=slider-thumb]]:transition-none"
          disabled={disabled}
          getAriaLabel={() => title}
          markerValues={markerValues}
          max={max}
          min={min}
          onValueChange={(nextValue) => {
            const resolvedValue = Array.isArray(nextValue)
              ? nextValue[0]
              : nextValue;

            if (typeof resolvedValue === "number") {
              onValueChange(Math.min(max, Math.max(min, Math.round(resolvedValue))));
            }
          }}
          showFill
          snapValues={markerValues}
          step={1}
          value={[currentValue]}
          variant="discrete"
        />
      </div>
    </div>
  );
}
