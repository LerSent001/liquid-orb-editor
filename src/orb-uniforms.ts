import { type OrbParams, styleFlowIndexes } from "./presets";

const paletteStops = [
  "#F7FBFF",
  "#EFF6FD",
  "#E0EEF9",
  "#D4E6F7",
  "#BBD5F3",
  "#A6C7F0",
  "#87B0EB",
  "#6F9EE8",
  "#6F9EE8",
  "#6F9EE8",
  "#6F9EE8",
  "#6F9EE8",
] as const;

function rgb(hex: string): [number, number, number, number] {
  const value = hex.slice(1);

  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
    1,
  ];
}

export function writeOrbUniforms(
  target: Float32Array,
  width: number,
  height: number,
  time: number,
  params: OrbParams,
): void {
  target.fill(0);
  target[0] = width;
  target[1] = height;
  target[2] = time;

  target.set(
    [
      params.speed,
      params.radius,
      params.zoom,
      params.warp,
      params.ridgeAmt,
      params.sharp,
      params.shade,
      params.sheen,
      params.gloss,
      params.shellMidAlpha,
      params.shellEdgeAlpha,
      params.exposure,
      styleFlowIndexes[params.style],
      params.edgeSoftness,
      params.edgeGlow,
      0,
      params.glassEnabled ? 1 : 0,
      params.glassOpacity,
      params.contourDeform,
      params.bandDensity,
      params.chromaticShift,
      params.metalScale,
      params.metalStretch,
      params.metalAngle,
      params.metalOffset,
      params.metalPhase,
      params.metalEvolution,
      params.metalRoughness,
      params.metalDepth,
    ],
    3,
  );

  const colors = [
    params.colorA,
    params.colorB,
    params.colorC,
    params.colorD,
    params.highlightColor,
    params.shellInner,
    params.shellMid,
    params.shellEdge,
    params.sheenColor,
    params.specColor,
    params.canvasColor,
    params.glowColor,
    ...paletteStops,
  ];
  colors.forEach((hex, index) => target.set(rgb(hex), 32 + index * 4));
}

export function createOrbUniformSnapshot(params: OrbParams): number[] {
  const values = new Float32Array(128);
  writeOrbUniforms(values, 1, 1, 0, params);
  return Array.from(values);
}
