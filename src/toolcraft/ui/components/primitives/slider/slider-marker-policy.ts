import type { SliderVariant } from "./slider-types";

function getSliderStepMarkerCount({
  max,
  min,
  step,
}: {
  max: number;
  min: number;
  step: number;
}): number | undefined {
  if (
    !Number.isFinite(step) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    step <= 0 ||
    max <= min
  ) {
    return undefined;
  }

  const rawStepCount = (max - min) / step;
  const roundedStepCount = Math.round(rawStepCount);
  const stepCount =
    Math.abs(rawStepCount - roundedStepCount) < Number.EPSILON * 100
      ? roundedStepCount
      : Math.floor(rawStepCount) + 1;

  return Math.max(2, stepCount + 1);
}

export function resolveSliderMarkerCount({
  markerCount,
  max,
  min,
  step,
  variant,
}: {
  markerCount?: number;
  max: number;
  min: number;
  step: number;
  variant: SliderVariant;
}): number {
  return variant === "discrete"
    ? (
        markerCount ??
        getSliderStepMarkerCount({ max, min, step }) ??
        Math.max(2, Math.round(max - min) + 1)
      )
    : (markerCount ?? Math.max(2, Math.round(max - min) + 1));
}
