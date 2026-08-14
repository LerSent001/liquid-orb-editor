import type { VectorControlValue } from "./vector-control-types";

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function getVectorValueLabel(x: string, y: string): string {
  return `${formatVectorPadCoordinate(x)}, ${formatVectorPadCoordinate(y)}`;
}

export function normalizeVectorCoordinate(value: string | undefined): string {
  return typeof value === "string" && value.trim() ? value : "0.00";
}

export function formatVectorPadCoordinate(value: string | undefined): string {
  const parsedValue = Number.parseFloat(normalizeVectorCoordinate(value));

  if (!Number.isFinite(parsedValue)) {
    return "0.00";
  }

  const roundedValue = Math.abs(parsedValue) < 0.005 ? 0 : clamp(parsedValue, -1, 1);

  return roundedValue.toFixed(2);
}

export function parseVectorValueDraft(value: string): VectorControlValue | null {
  const matches = value.match(/[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)/g);

  if (!matches || matches.length < 2) {
    return null;
  }

  const [rawX, rawY] = matches;
  const nextX = Number.parseFloat(rawX.replace(",", "."));
  const nextY = Number.parseFloat(rawY.replace(",", "."));

  if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
    return null;
  }

  return {
    x: clamp(nextX, -1, 1).toFixed(2),
    y: clamp(nextY, -1, 1).toFixed(2),
  };
}
