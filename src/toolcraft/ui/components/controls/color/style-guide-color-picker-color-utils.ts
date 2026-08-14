import {
  hexToHsv,
  normalizeHexColor,
  type HsvColor,
} from "../../../lib/style-guide-color-utils";

export function calculateHexDistance(
  leftHex: string | null | undefined,
  rightHex: string | null | undefined,
) {
  const normalizedLeft = normalizeHexColor(leftHex);
  const normalizedRight = normalizeHexColor(rightHex);
  if (!normalizedLeft || !normalizedRight) return Number.POSITIVE_INFINITY;

  const leftValue = normalizedLeft.slice(1);
  const rightValue = normalizedRight.slice(1);
  const leftChannels = [
    Number.parseInt(leftValue.slice(0, 2), 16),
    Number.parseInt(leftValue.slice(2, 4), 16),
    Number.parseInt(leftValue.slice(4, 6), 16),
  ];
  const rightChannels = [
    Number.parseInt(rightValue.slice(0, 2), 16),
    Number.parseInt(rightValue.slice(2, 4), 16),
    Number.parseInt(rightValue.slice(4, 6), 16),
  ];

  return leftChannels.reduce(
    (distance, channel, index) => distance + Math.abs(channel - rightChannels[index]!),
    0,
  );
}

export function resolveHsvFromHex(nextHex: string, fallbackColor: HsvColor): HsvColor {
  const nextColor = hexToHsv(nextHex);
  if (nextColor.v === 0) return { h: fallbackColor.h, s: fallbackColor.s, v: 0 };
  if (nextColor.s === 0) return { h: fallbackColor.h, s: 0, v: nextColor.v };
  return nextColor;
}
