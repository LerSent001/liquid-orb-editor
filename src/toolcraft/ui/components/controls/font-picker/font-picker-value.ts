import type { CSSProperties } from "react";

import {
  getFontPickerFontById,
  resolveFontPickerFontId,
  type FontPickerFontCatalogEntry,
} from "./font-catalog";

export type FontPickerLetterSpacingPreset =
  | "tight"
  | "tighter"
  | "normal"
  | "wide"
  | "wider"
  | "widest";

export type FontPickerLineHeightPreset =
  | "loose"
  | "none"
  | "normal"
  | "relaxed"
  | "snug"
  | "tight";

export type FontPickerTextCasePreset =
  | "capitalize"
  | "lowercase"
  | "original"
  | "titleCase"
  | "uppercase";

export type FontPickerValue = {
  color: string;
  fontId: string;
  fontSize: number;
  fontWeight: string;
  letterSpacing: FontPickerLetterSpacingPreset;
  lineHeight: FontPickerLineHeightPreset;
  opacity: number;
  textCase: FontPickerTextCasePreset;
};

export type FontPickerInputValue = Partial<FontPickerValue> | string | undefined;

export const defaultFontPickerFontSizePx = 16;
export const defaultFontPickerColor = "#FFFFFF";
export const defaultFontPickerOpacity = 100;
export const minFontPickerFontSizePx = 1;

export const letterSpacingSteps: Array<{
  label: string;
  numericValue: number;
  value: FontPickerLetterSpacingPreset;
}> = [
  { label: "Tighter", numericValue: -0.05, value: "tighter" },
  { label: "Tight", numericValue: -0.025, value: "tight" },
  { label: "Normal", numericValue: 0, value: "normal" },
  { label: "Wide", numericValue: 0.025, value: "wide" },
  { label: "Wider", numericValue: 0.05, value: "wider" },
  { label: "Widest", numericValue: 0.1, value: "widest" },
];

export const lineHeightSteps: Array<{
  label: string;
  numericValue: number;
  value: FontPickerLineHeightPreset;
}> = [
  { label: "None", numericValue: 1, value: "none" },
  { label: "Tight", numericValue: 1.25, value: "tight" },
  { label: "Snug", numericValue: 1.375, value: "snug" },
  { label: "Normal", numericValue: 1.5, value: "normal" },
  { label: "Relaxed", numericValue: 1.625, value: "relaxed" },
  { label: "Loose", numericValue: 2, value: "loose" },
];

export const textCaseOptions: Array<{
  label: string;
  value: FontPickerTextCasePreset;
}> = [
  { label: "As typed", value: "original" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
  { label: "Title Case", value: "titleCase" },
];

export function isFontPickerTextCase(
  value: unknown,
): value is FontPickerTextCasePreset {
  return textCaseOptions.some((option) => option.value === value);
}

export function getStepByValue<Value extends string>(
  steps: readonly { numericValue: number; value: Value }[],
  value: Value,
  fallbackValue: Value,
): { numericValue: number; value: Value } {
  const step = steps.find((item) => item.value === value);
  if (step) {
    return step;
  }

  return steps.find((item) => item.value === fallbackValue) ?? steps[0]!;
}

export function getStepIndexByValue<Value extends string>(
  steps: readonly { value: Value }[],
  value: Value,
  fallbackValue: Value,
): number {
  const stepIndex = steps.findIndex((item) => item.value === value);
  if (stepIndex >= 0) {
    return stepIndex;
  }

  const fallbackIndex = steps.findIndex((item) => item.value === fallbackValue);
  return fallbackIndex >= 0 ? fallbackIndex : 0;
}

export function normalizeFontPickerValue(
  value: FontPickerInputValue,
): FontPickerValue {
  const fontId = resolveFontPickerFontId(
    typeof value === "string" ? value : value?.fontId,
  );
  const font = getFontPickerFontById(fontId);

  if (typeof value === "string") {
    return {
      color: defaultFontPickerColor,
      fontId,
      fontSize: defaultFontPickerFontSizePx,
      fontWeight: resolveFontPickerFontWeight(font),
      letterSpacing: "normal",
      lineHeight: "normal",
      opacity: defaultFontPickerOpacity,
      textCase: "original",
    };
  }

  return {
    color: normalizeFontPickerColor(value?.color),
    fontId,
    fontSize: normalizeFontPickerFontSize(value?.fontSize),
    fontWeight: resolveFontPickerFontWeight(font, value?.fontWeight),
    letterSpacing: value?.letterSpacing ?? "normal",
    lineHeight: value?.lineHeight ?? "normal",
    opacity: normalizeFontPickerOpacity(value?.opacity),
    textCase: isFontPickerTextCase(value?.textCase) ? value.textCase : "original",
  };
}

export function normalizeFontPickerColor(value: unknown): string {
  return typeof value === "string" && value.trim()
    ? value
    : defaultFontPickerColor;
}

export function normalizeFontPickerOpacity(value: unknown): number {
  const nextOpacity =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));

  return Number.isFinite(nextOpacity)
    ? Math.min(100, Math.max(0, Math.round(nextOpacity)))
    : defaultFontPickerOpacity;
}

export function getFontPickerWeightOptions(
  font: FontPickerFontCatalogEntry | null,
): string[] {
  const weights = font?.weights.length ? font.weights : ["400"];

  return Array.from(new Set(weights.map((weight) => String(weight)))).sort(
    (left, right) => Number(left) - Number(right),
  );
}

export function resolveFontPickerFontWeight(
  font: FontPickerFontCatalogEntry | null,
  weight?: string,
): string {
  const weights = getFontPickerWeightOptions(font);
  const requestedWeight = typeof weight === "string" ? weight : undefined;

  if (requestedWeight && weights.includes(requestedWeight)) {
    return requestedWeight;
  }

  if (weights.includes("400")) {
    return "400";
  }

  const requestedNumericWeight = Number(requestedWeight ?? 400);
  if (Number.isFinite(requestedNumericWeight)) {
    return weights.reduce((closest, current) => {
      return Math.abs(Number(current) - requestedNumericWeight) <
        Math.abs(Number(closest) - requestedNumericWeight)
        ? current
        : closest;
    }, weights[0] ?? "400");
  }

  return weights[0] ?? "400";
}

export function normalizeFontPickerFontSize(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return defaultFontPickerFontSizePx;
  }

  return Math.max(minFontPickerFontSizePx, Math.round(value));
}

export function getFontFamilyStyle(
  font: FontPickerFontCatalogEntry | null,
): CSSProperties | undefined {
  return font
    ? {
        fontFamily: `"${font.family}", ui-sans-serif, system-ui, sans-serif`,
      }
    : undefined;
}
