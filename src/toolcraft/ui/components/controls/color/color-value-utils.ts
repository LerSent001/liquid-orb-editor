function resolveCssVariableColor(color: string): string {
  const variableMatch = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/i.exec(
    color.trim(),
  );

  if (!variableMatch?.[1] || typeof window === "undefined") {
    return color;
  }

  const resolvedValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variableMatch[1]);
  const fallbackValue = variableMatch[2]?.trim();
  const nextColor = resolvedValue.trim() || fallbackValue;

  return nextColor ? resolveCssVariableColor(nextColor) : color;
}

function formatHexChannel(value: number): string {
  return Math.round(Math.min(1, Math.max(0, value)) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function linearSrgbToSrgb(value: number): number {
  return value >= 0.0031308
    ? 1.055 * value ** (1 / 2.4) - 0.055
    : 12.92 * value;
}

function oklchToHex(color: string): string | null {
  const match =
    /^oklch\(\s*([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(?:deg)?(?:\s*\/\s*[+-]?\d*\.?\d+%?)?\s*\)$/i.exec(
      color.trim(),
    );

  if (!match) {
    return null;
  }

  const rawLightness = match[1] ?? "";
  const lightness = rawLightness.endsWith("%")
    ? Number.parseFloat(rawLightness) / 100
    : Number.parseFloat(rawLightness);
  const chroma = Number.parseFloat(match[2] ?? "");
  const hue = (Number.parseFloat(match[3] ?? "") * Math.PI) / 180;

  if (
    !Number.isFinite(lightness) ||
    !Number.isFinite(chroma) ||
    !Number.isFinite(hue)
  ) {
    return null;
  }

  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const lCone = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mCone = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sCone = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lCone ** 3;
  const m = mCone ** 3;
  const s = sCone ** 3;
  const red = linearSrgbToSrgb(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
  );
  const green = linearSrgbToSrgb(
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
  );
  const blue = linearSrgbToSrgb(
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  );

  return `#${formatHexChannel(red)}${formatHexChannel(green)}${formatHexChannel(blue)}`;
}

function rgbToHex(color: string): string | null {
  const match =
    /^rgba?\(\s*([+-]?\d*\.?\d+%?)\s*[,\s]\s*([+-]?\d*\.?\d+%?)\s*[,\s]\s*([+-]?\d*\.?\d+%?)/i.exec(
      color.trim(),
    );

  if (!match) {
    return null;
  }

  const channels = [match[1] ?? "", match[2] ?? "", match[3] ?? ""].map(
    (channel) => {
      const parsed = Number.parseFloat(channel);
      return channel.endsWith("%") ? parsed / 100 : parsed / 255;
    },
  );

  if (channels.some((channel) => !Number.isFinite(channel))) {
    return null;
  }

  const [red = 0, green = 0, blue = 0] = channels;

  return `#${formatHexChannel(red)}${formatHexChannel(green)}${formatHexChannel(blue)}`;
}

export function getNativeColorPickerValue(color: string): string {
  const trimmedColor = resolveCssVariableColor(color).trim();
  const bareHexMatch = /^([0-9a-f]{6})$/i.exec(trimmedColor);

  if (bareHexMatch?.[1]) {
    return `#${bareHexMatch[1].toUpperCase()}`;
  }

  const hexMatch = /^#([0-9a-f]{6})$/i.exec(trimmedColor);

  if (hexMatch?.[1]) {
    return `#${hexMatch[1].toUpperCase()}`;
  }

  const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(trimmedColor);

  if (shortHexMatch?.[1]) {
    const [red = "0", green = "0", blue = "0"] = shortHexMatch[1];
    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  const parsedFunctionalColor =
    oklchToHex(trimmedColor) ?? rgbToHex(trimmedColor);

  if (parsedFunctionalColor) {
    return parsedFunctionalColor;
  }

  return "#000000";
}

export function getSwatchColorValue(color: string): string {
  const trimmedColor = color.trim();

  if (trimmedColor.startsWith("var(") || trimmedColor.includes("(")) {
    return trimmedColor;
  }

  return getNativeColorPickerValue(trimmedColor);
}

export function getHexDraftValue(color: string, showHash: boolean): string {
  const hexColor = getNativeColorPickerValue(color);

  return showHash ? hexColor : hexColor.slice(1);
}

export function getSanitizedHexDraft(
  value: string,
  showHash: boolean,
): string {
  const hex = value
    .replace(/[^\da-f]/gi, "")
    .slice(0, 6)
    .toUpperCase();

  return showHash ? `#${hex}` : hex;
}

export function getCommittedHexColor(value: string): string | null {
  const hex = value
    .replace(/[^\da-f]/gi, "")
    .slice(0, 6)
    .toUpperCase();

  return hex.length === 6 ? `#${hex}` : null;
}
