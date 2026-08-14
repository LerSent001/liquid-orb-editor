export type StyleName =
  | "siri"
  | "voiceWave"
  | "spectrum"
  | "aurora"
  | "frost"
  | "plasma"
  | "chrome"
  | "opal";

export type OrbParams = {
  style: StyleName;
  glassEnabled: boolean;
  speed: number;
  radius: number;
  contourDeform: number;
  zoom: number;
  warp: number;
  ridgeAmt: number;
  sharp: number;
  shade: number;
  sheen: number;
  gloss: number;
  glassOpacity: number;
  shellMidAlpha: number;
  shellEdgeAlpha: number;
  exposure: number;
  edgeSoftness: number;
  edgeGlow: number;
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
  highlightColor: string;
  shellInner: string;
  shellMid: string;
  shellEdge: string;
  sheenColor: string;
  specColor: string;
  canvasColor: string;
  glowColor: string;
};

type StylePreset = Omit<OrbParams, "style">;

const basePreset: StylePreset = {
  glassEnabled: true,
  speed: 1,
  radius: 0.72,
  contourDeform: 0,
  zoom: 0.3,
  warp: 3,
  ridgeAmt: 0.5,
  sharp: 2.2,
  shade: 0.3,
  sheen: 0.36,
  gloss: 0.28,
  glassOpacity: 0.42,
  shellMidAlpha: 0.2,
  shellEdgeAlpha: 0.22,
  exposure: 1,
  edgeSoftness: 0.005,
  edgeGlow: 0,
  colorA: "#F7FBFF",
  colorB: "#D6E8F7",
  colorC: "#A8C8F0",
  colorD: "#6F9EE8",
  highlightColor: "#FFFFFF",
  shellInner: "#FFFFFF",
  shellMid: "#D6E8F7",
  shellEdge: "#6F9EE8",
  sheenColor: "#EAF4FF",
  specColor: "#DCEAFF",
  canvasColor: "#000000",
  glowColor: "#6F9EE8",
};

export const stylePresets: Record<StyleName, StylePreset> = {
  siri: {
    ...basePreset,
    speed: 0.82,
    zoom: 0.36,
    warp: 3.2,
    ridgeAmt: 0.5,
    sharp: 2.2,
    shade: 0.12,
    sheen: 0.28,
    gloss: 0.24,
    glassOpacity: 0.44,
    shellMidAlpha: 0.18,
    shellEdgeAlpha: 0.18,
    exposure: 2,
    colorA: "#FFD86B",
    colorB: "#82F4FF",
    colorC: "#FF7BD5",
    colorD: "#8E6CFF",
    shellMid: "#9BF4FF",
    shellEdge: "#C5A9FF",
    canvasColor: "#030409",
    glowColor: "#956CFF",
  },
  voiceWave: {
    ...basePreset,
    speed: 0.95,
    radius: 0.7,
    contourDeform: 0.1,
    zoom: 0.36,
    warp: 2.6,
    ridgeAmt: 0.46,
    shade: 0.08,
    sheen: 0.22,
    gloss: 0.36,
    glassOpacity: 0.48,
    shellMidAlpha: 0.18,
    shellEdgeAlpha: 0.2,
    exposure: 1.35,
    colorA: "#09030E",
    colorB: "#CE2CCB",
    colorC: "#FF5C71",
    colorD: "#7B53FF",
    highlightColor: "#FFD9F0",
    shellMid: "#E48BFF",
    shellEdge: "#FF7890",
    sheenColor: "#FFF1FA",
    specColor: "#E7D9FF",
    canvasColor: "#020105",
    glowColor: "#CE2CCB",
  },
  aurora: {
    ...basePreset,
    speed: 3,
    contourDeform: 0.08,
    zoom: 0.4,
    warp: 4.2,
    ridgeAmt: 0.62,
    sharp: 2.1,
    shade: 0.18,
    exposure: 1.18,
    colorA: "#030816",
    colorB: "#20F0B6",
    colorC: "#32A8FF",
    colorD: "#A34BFF",
    shellMid: "#32A8FF",
    shellEdge: "#20F0B6",
    canvasColor: "#010207",
    glowColor: "#20F0B6",
  },
  plasma: {
    ...basePreset,
    speed: 1.32,
    contourDeform: 0.05,
    zoom: 0.55,
    warp: 5.4,
    ridgeAmt: 0.78,
    sharp: 4.2,
    shade: 0.16,
    exposure: 1.25,
    colorA: "#06020E",
    colorB: "#0099FF",
    colorC: "#258BFF",
    colorD: "#1375FF",
    shellInner: "#FFFFFF",
    shellMid: "#1951C2",
    shellEdge: "#00E9FF",
    sheenColor: "#EAF4FF",
    specColor: "#DCEAFF",
    canvasColor: "#020105",
    glowColor: "#0099FF",
  },
  chrome: {
    ...basePreset,
    speed: 2,
    zoom: 0.36,
    warp: 3.8,
    ridgeAmt: 0.44,
    sharp: 5.2,
    shade: 0.58,
    exposure: 1.08,
    colorA: "#FFFFFF",
    colorB: "#B9C0CA",
    colorC: "#343A43",
    colorD: "#030405",
    shellMid: "#B9C0CA",
    shellEdge: "#FFFFFF",
    canvasColor: "#050608",
    glowColor: "#FFFFFF",
  },
  opal: {
    ...basePreset,
    speed: 1.5,
    zoom: 0.3,
    warp: 2.8,
    ridgeAmt: 0.36,
    sharp: 2,
    shade: 0.1,
    sheen: 0.3,
    gloss: 0.26,
    glassOpacity: 0.38,
    shellMidAlpha: 0.2,
    shellEdgeAlpha: 0.2,
    exposure: 1.12,
    colorA: "#FFF6E8",
    colorB: "#6EF2CF",
    colorC: "#FF91D8",
    colorD: "#756BFF",
    shellMid: "#CDE5FF",
    shellEdge: "#D9C8FF",
    canvasColor: "#07080D",
    glowColor: "#9E8CFF",
  },
  spectrum: {
    ...basePreset,
    speed: 1.8,
    contourDeform: 0.03,
    zoom: 0.46,
    warp: 4.4,
    ridgeAmt: 0.72,
    shade: 0.06,
    sheen: 0.26,
    gloss: 0.24,
    glassOpacity: 0.4,
    shellMidAlpha: 0.18,
    shellEdgeAlpha: 0.18,
    exposure: 1.5,
    colorA: "#FFFFFF",
    colorB: "#1677FF",
    colorC: "#F249A0",
    colorD: "#35E6B2",
    shellMid: "#66E8FF",
    shellEdge: "#D26CFF",
    canvasColor: "#03040A",
    glowColor: "#1677FF",
  },
  frost: {
    ...basePreset,
    speed: 2.22,
    contourDeform: 0.04,
    zoom: 0.36,
    warp: 3.7,
    ridgeAmt: 0.45,
    sharp: 2.05,
    shade: 0.3,
    sheen: 0.34,
    gloss: 0.28,
    glassOpacity: 0.42,
    shellMidAlpha: 0.2,
    shellEdgeAlpha: 0.22,
    exposure: 1,
    colorA: "#F7FBFF",
    colorB: "#D6E8F7",
    colorC: "#A8C8F0",
    colorD: "#6F9EE8",
    shellMid: "#D6E8F7",
    shellEdge: "#6F9EE8",
    canvasColor: "#000000",
    glowColor: "#6F9EE8",
  },
};

export const styleLabels: Record<StyleName, string> = {
  siri: "Siri 波澜",
  voiceWave: "声纹薄膜",
  spectrum: "彩色声场",
  aurora: "极光帷幕",
  frost: "冰霜流体",
  plasma: "神经电浆",
  chrome: "液态铬",
  opal: "虹彩欧泊",
};

export const styleNames: readonly StyleName[] = [
  "siri",
  "voiceWave",
  "spectrum",
  "aurora",
  "frost",
  "plasma",
  "chrome",
  "opal",
];

export const styleFlowIndexes: Record<StyleName, number> = {
  siri: 9,
  voiceWave: 19,
  aurora: 10,
  plasma: 11,
  chrome: 12,
  opal: 13,
  spectrum: 14,
  frost: 15,
};

export const effectDefaults: OrbParams = {
  style: "siri",
  ...stylePresets.siri,
};

export const initialParams: OrbParams = {
  ...effectDefaults,
};

for (const name of styleNames) {
  if (!Number.isInteger(styleFlowIndexes[name])) {
    throw new Error(`预设缺少流场映射：${name}`);
  }
}
