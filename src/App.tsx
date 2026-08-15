import * as React from "react";
import { CodeIcon, CopySimpleIcon } from "@phosphor-icons/react";

import { Button } from "@/toolcraft/ui/components/primitives/button";
import { Input } from "@/toolcraft/ui/components/primitives/input";
import { TooltipProvider } from "@/toolcraft/ui/components/primitives/tooltip";
import { ControlFieldLabel } from "@/toolcraft/ui/components/control-layout";
import { SwitchControl as Switch } from "@/toolcraft/ui/components/controls/boolean/boolean-controls";
import { SegmentedControl } from "@/toolcraft/ui/components/controls/segmented/segmented-control";
import { SliderControl as Slider } from "@/toolcraft/ui/components/controls/slider/slider-control";
import { Panel } from "@/toolcraft/ui/components/panel/panel";
import { PanelSection } from "@/toolcraft/ui/components/panel/panel-section";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/toolcraft/ui/components/composites/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/toolcraft/ui/components/composites/tabs";

import posterUrl from "../poster.png";
import auroraPreviewUrl from "./assets/presets/aurora.png";
import blueDropPreviewUrl from "./assets/presets/blueDrop.png";
import chromePreviewUrl from "./assets/presets/chrome.png";
import frostPreviewUrl from "./assets/presets/frost.png";
import opalPreviewUrl from "./assets/presets/opal.png";
import plasmaPreviewUrl from "./assets/presets/plasma.png";
import siriPreviewUrl from "./assets/presets/siri.png";
import spectrumPreviewUrl from "./assets/presets/spectrum.png";
import violetEmberPreviewUrl from "./assets/presets/violetEmber.png";
import voiceWavePreviewUrl from "./assets/presets/voiceWave.png";
import { createSwiftExport, createWebExport } from "./code-export";
import { createOrbRenderer } from "./orb-renderer";
import {
  effectDefaults,
  initialParams,
  orbRadiusRange,
  type OrbParams,
  styleLabels,
  styleNames,
  stylePresets,
  type StyleName,
} from "./presets";

const Color = React.lazy(async () => {
  const module = await import("@/toolcraft/ui/components/controls/color/color-control");
  return { default: module.ColorControl };
});

const stylePreviewUrls: Record<StyleName, string> = {
  siri: siriPreviewUrl,
  voiceWave: voiceWavePreviewUrl,
  spectrum: spectrumPreviewUrl,
  aurora: auroraPreviewUrl,
  frost: frostPreviewUrl,
  plasma: plasmaPreviewUrl,
  chrome: chromePreviewUrl,
  opal: opalPreviewUrl,
  blueDrop: blueDropPreviewUrl,
  violetEmber: violetEmberPreviewUrl,
};

type NumericKey = {
  [Key in keyof OrbParams]: OrbParams[Key] extends number ? Key : never;
}[keyof OrbParams];

type PreviewMode = "orb" | "scene";

const defaultSceneText = "Thinking...";
const maxSceneTextLength = 20;
const hashSyncDelayMs = 500;
const previewModeOptions = [
  { label: "球体", value: "orb" },
  { label: "场景", value: "scene" },
] as const;

type ColorKey =
  | "colorA"
  | "colorB"
  | "colorC"
  | "colorD"
  | "highlightColor"
  | "shellInner"
  | "shellMid"
  | "shellEdge"
  | "sheenColor"
  | "specColor"
  | "canvasColor"
  | "glowColor";

type NumericSpec = {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
  enabledStyles?: readonly StyleName[];
};

const ridgeStyles: readonly StyleName[] = [
  "siri",
  "voiceWave",
  "spectrum",
  "aurora",
  "frost",
  "plasma",
  "blueDrop",
  "violetEmber",
];
const sharpStyles: readonly StyleName[] = [
  "frost",
  "plasma",
  "chrome",
  "blueDrop",
  "violetEmber",
];

const numericSpecs: readonly NumericSpec[] = [
  { key: "speed", label: "速度", min: 0, max: 3, step: 0.01 },
  { key: "radius", label: "半径", ...orbRadiusRange, step: 0.01 },
  { key: "contourDeform", label: "轮廓形变", min: 0, max: 1, step: 0.01 },
  { key: "zoom", label: "缩放", min: 0.05, max: 1, step: 0.01 },
  { key: "warp", label: "扭曲", min: 0, max: 6, step: 0.05 },
  { key: "ridgeAmt", label: "脊线", min: 0, max: 1, step: 0.01, enabledStyles: ridgeStyles },
  { key: "sharp", label: "锐度", min: 0.5, max: 6, step: 0.05, enabledStyles: sharpStyles },
  { key: "shade", label: "明暗", min: 0, max: 1.5, step: 0.01 },
  { key: "exposure", label: "曝光", min: 0.2, max: 3, step: 0.02 },
  { key: "sheen", label: "边缘高光", min: 0, max: 2, step: 0.02 },
  { key: "gloss", label: "色散", min: 0, max: 2, step: 0.02 },
  { key: "glassOpacity", label: "折射强度", min: 0, max: 1, step: 0.01 },
  { key: "shellMidAlpha", label: "折射宽度", min: 0, max: 1, step: 0.01 },
  { key: "shellEdgeAlpha", label: "边缘强度", min: 0, max: 1, step: 0.01 },
  { key: "edgeSoftness", label: "边缘柔化", min: 0.005, max: 0.15, step: 0.005 },
  { key: "edgeGlow", label: "外发光强度", min: 0, max: 1, step: 0.01 },
];

const numericSpecByKey = new Map(numericSpecs.map((spec) => [spec.key, spec]));
const colorKeys: readonly ColorKey[] = [
  "colorA",
  "colorB",
  "colorC",
  "colorD",
  "highlightColor",
  "shellInner",
  "shellMid",
  "shellEdge",
  "sheenColor",
  "specColor",
  "canvasColor",
  "glowColor",
];

const colorLabels: Record<ColorKey, string> = {
  colorA: "颜色 A",
  colorB: "颜色 B",
  colorC: "颜色 C",
  colorD: "颜色 D",
  highlightColor: "提亮色",
  shellInner: "折射底色",
  shellMid: "冷色散",
  shellEdge: "暖色散",
  sheenColor: "主高光色",
  specColor: "辅高光色",
  canvasColor: "背景颜色",
  glowColor: "外发光颜色",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeColor(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null;
}

function limitSceneText(value: string): string {
  return Array.from(value).slice(0, maxSceneTextLength).join("");
}

function readPreviewModeFromHash(): PreviewMode {
  return new URLSearchParams(window.location.hash.slice(1)).get("preview") === "scene"
    ? "scene"
    : "orb";
}

function readSceneTextFromHash(): string {
  const text = new URLSearchParams(window.location.hash.slice(1)).get("text");
  return text === null ? defaultSceneText : limitSceneText(text);
}

function readParamsFromHash(): OrbParams {
  const params = { ...initialParams };
  const search = new URLSearchParams(window.location.hash.slice(1));
  const style = search.get("style");

  if (style && styleNames.includes(style as StyleName)) {
    params.style = style as StyleName;
    Object.assign(params, stylePresets[params.style]);
  }

  const glass = search.get("glass");
  if (glass === "1") params.glassEnabled = true;
  if (glass === "0") params.glassEnabled = false;

  for (const spec of numericSpecs) {
    const raw = search.get(spec.key);
    if (raw === null) continue;
    const value = Number(raw);
    if (Number.isFinite(value)) {
      params[spec.key] = clamp(value, spec.min, spec.max);
    }
  }

  for (const key of colorKeys) {
    const raw = search.get(key);
    if (raw === null) continue;
    const value = normalizeColor(raw);
    if (value) params[key] = value;
  }

  return params;
}

function writeHash(params: OrbParams, previewMode: PreviewMode, sceneText: string): void {
  const search = new URLSearchParams();
  search.set("effect", "orb-glass-liquid");
  search.set("style", params.style);
  search.set("glass", params.glassEnabled ? "1" : "0");
  search.set("preview", previewMode);
  search.set("text", sceneText);
  for (const spec of numericSpecs) search.set(spec.key, String(params[spec.key]));
  for (const key of colorKeys) search.set(key, params[key]);
  window.history.replaceState(null, "", `#${search.toString()}`);
}

function useSectionState() {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({
    motion: false,
    colors: true,
    shape: true,
    glass: false,
    edge: false,
    scene: false,
  });

  return {
    isCollapsed: (key: string) => collapsed[key] ?? false,
    onCollapsedChange: (key: string) => (value: boolean) => {
      setCollapsed((current) => ({ ...current, [key]: value }));
    },
  };
}

function useStackedLayout(): boolean {
  const [stacked, setStacked] = React.useState(() =>
    window.matchMedia("(max-width: 900px)").matches,
  );

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setStacked(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return stacked;
}

export function App(): React.JSX.Element {
  const [params, setParams] = React.useState<OrbParams>(readParamsFromHash);
  const [renderState, setRenderState] = React.useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [presetCollapsed, setPresetCollapsed] = React.useState(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = React.useState(false);
  const [previewScale, setPreviewScale] = React.useState(1);
  const [previewMode, setPreviewMode] = React.useState<PreviewMode>(readPreviewModeFromHash);
  const [sceneText, setSceneText] = React.useState(readSceneTextFromHash);
  const [codeOpen, setCodeOpen] = React.useState(false);
  const [codePlatform, setCodePlatform] = React.useState<"web" | "swift">("web");
  const [copiedPlatform, setCopiedPlatform] = React.useState<"web" | "swift" | "error" | null>(null);
  const [codeParams, setCodeParams] = React.useState<OrbParams | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const stageRef = React.useRef<HTMLElement | null>(null);
  const copyBufferRef = React.useRef<HTMLTextAreaElement | null>(null);
  const paramsRef = React.useRef(params);
  const sectionState = useSectionState();
  const stackedLayout = useStackedLayout();

  const webCode = React.useMemo(
    () => (codeParams ? createWebExport(codeParams) : ""),
    [codeParams],
  );
  const swiftCode = React.useMemo(
    () => (codeParams ? createSwiftExport(codeParams) : ""),
    [codeParams],
  );

  paramsRef.current = params;

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      writeHash(params, previewMode, sceneText);
    }, hashSyncDelayMs);

    return () => window.clearTimeout(timeout);
  }, [params, previewMode, sceneText]);

  React.useEffect(() => {
    const syncFromHash = () => {
      setParams(readParamsFromHash());
      setPreviewMode(readPreviewModeFromHash());
      setSceneText(readSceneTextFromHash());
      setPreviewScale(1);
    };

    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--orb-canvas-color", params.canvasColor);
  }, [params.canvasColor]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    return createOrbRenderer({
      canvas,
      getParams: () => paramsRef.current,
      onError: (error) => {
        setErrorMessage(error.message);
        setRenderState("error");
      },
      onReady: () => setRenderState((current) => (current === "ready" ? current : "ready")),
    });
  }, []);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const handleWheel = (event: WheelEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-stage-controls]")
      ) {
        return;
      }

      event.preventDefault();
      const modeScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? stage.clientHeight
          : 1;
      const delta = clamp(-event.deltaY * modeScale * 0.001, -0.1, 0.1);
      setPreviewScale((current) =>
        Math.round(clamp(current + delta, 0.6, 1.6) * 100) / 100,
      );
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, []);

  const setParam = React.useCallback(
    <Key extends keyof OrbParams>(key: Key, value: OrbParams[Key]) => {
      setParams((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const applyStyle = React.useCallback((style: StyleName) => {
    setParams((current) => ({
      ...current,
      style,
      ...stylePresets[style],
    }));
  }, []);

  const resetAll = React.useCallback(() => {
    setParams({ ...effectDefaults });
    setSceneText(defaultSceneText);
    setPreviewScale(1);
  }, []);

  const updatePreviewMode = React.useCallback((value: string) => {
    if (value !== "orb" && value !== "scene") return;
    setPreviewMode(value);
    setPreviewScale(1);
  }, []);

  const openCode = React.useCallback(() => {
    setCodeParams({ ...paramsRef.current });
    setCopiedPlatform(null);
    setCodeOpen(true);
  }, []);

  const copyCode = React.useCallback(async () => {
    const code = codePlatform === "web" ? webCode : swiftCode;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedPlatform(codePlatform);
    } catch {
      const copyBuffer = copyBufferRef.current;
      const previousFocus = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

      if (!copyBuffer) {
        setCopiedPlatform("error");
        return;
      }

      copyBuffer.value = code;
      copyBuffer.focus();
      copyBuffer.select();
      const copied = document.execCommand("copy");
      previousFocus?.focus();
      setCopiedPlatform(copied ? codePlatform : "error");
    }
  }, [codePlatform, swiftCode, webCode]);

  function renderSlider(key: NumericKey): React.JSX.Element | null {
    const spec = numericSpecByKey.get(key);
    if (!spec) throw new Error(`缺少滑杆配置：${key}`);
    if (spec.enabledStyles && !spec.enabledStyles.includes(params.style)) return null;

    return (
      <Slider
        baseValue={effectDefaults[key]}
        key={key}
        max={spec.max}
        min={spec.min}
        name={spec.label}
        onValueChange={(value) => setParam(key, value)}
        showFill
        step={spec.step}
        value={params[key]}
      />
    );
  }

  function colorInput(key: ColorKey) {
    return {
      hex: params[key],
      name: colorLabels[key],
      onValueChange: ({ hex }: { hex: string }) => setParam(key, hex),
      showLabel: true,
    };
  }

  function colorControl(element: React.ReactNode): React.JSX.Element {
    return (
      <React.Suspense fallback={<div className="color-control-loading" aria-hidden="true" />}>
        {element}
      </React.Suspense>
    );
  }

  return (
    <TooltipProvider>
      <main
        className="orb-editor"
        data-preset-collapsed={String(!stackedLayout && presetCollapsed)}
        data-properties-collapsed={String(!stackedLayout && propertiesCollapsed)}
      >
        <aside className="preset-dock" aria-label="效果预设">
          <Panel
            className="preset-panel h-full max-h-none w-full rounded-lg"
            collapsed={presetCollapsed}
            collapseDirection="left"
            collapseLabel="收起预设面板"
            collapsible={!stackedLayout}
            expandLabel="展开预设面板"
            onCollapsedChange={setPresetCollapsed}
            title="效果预设"
          >
            <PanelSection>
              <div className="preset-control">
                <div className="preset-grid" role="group" aria-label="动态预设">
                  {styleNames.map((style) => (
                    <Button
                      aria-pressed={params.style === style}
                      className="preset-button"
                      key={style}
                      onClick={() => applyStyle(style)}
                      type="button"
                      variant="outline"
                    >
                      <img
                        alt=""
                        aria-hidden="true"
                        className="preset-preview"
                        src={stylePreviewUrls[style]}
                      />
                      <span>{styleLabels[style]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </PanelSection>
          </Panel>
        </aside>

        <section
          className="orb-stage"
          aria-label={previewMode === "scene" ? "实际场景预览" : "液态玻璃球预览"}
          data-preview-mode={previewMode}
          ref={stageRef}
          style={{ "--preview-scale": previewScale } as React.CSSProperties}
        >
          <div className="stage-mode-control" data-stage-controls>
            <SegmentedControl
              ariaLabel="切换预览模式"
              name="预览模式"
              onValueChange={updatePreviewMode}
              options={previewModeOptions}
              value={previewMode}
            />
          </div>
          <div className="preview-surface">
            <div className="orb-visual">
              {renderState === "error" ? (
                <img className="orb-poster" src={posterUrl} alt="液态玻璃球静态预览" />
              ) : null}
              <canvas
                aria-label="动态液态玻璃球"
                className="orb-canvas"
                data-ready={renderState === "ready" ? "true" : undefined}
                ref={canvasRef}
              />
              {renderState === "loading" ? (
                <div className="orb-status" role="status" aria-live="polite">
                  <span className="orb-spinner" aria-hidden="true" />
                  <span className="sr-only">正在加载球体</span>
                </div>
              ) : null}
              {renderState === "error" ? (
                <p className="orb-error" title={errorMessage}>WebGPU 不可用，当前显示静态预览</p>
              ) : null}
            </div>
            {previewMode === "scene" ? (
              <div className="scene-copy" aria-label={`场景文字：${sceneText}`}>
                <span className="scene-copy-text">{sceneText || "\u00a0"}</span>
              </div>
            ) : null}
          </div>
          <div className="stage-toolbar" data-stage-controls>
            <Button
              className="code-trigger"
              onClick={openCode}
              size="lg"
              type="button"
              variant="outline"
            >
              <CodeIcon data-icon="inline-start" />
              复制代码
            </Button>
          </div>
        </section>

        <aside className="panel-dock" aria-label="球体参数">
          <Panel
            className="orb-editor-panel h-full max-h-none w-full rounded-lg"
            collapsed={propertiesCollapsed}
            collapseDirection="right"
            collapseLabel="收起参数面板"
            collapsible={!stackedLayout}
            expandLabel="展开参数面板"
            onCollapsedChange={setPropertiesCollapsed}
            onResetControls={resetAll}
            resetLabel="重置全部参数"
            title="球体参数"
          >
            {previewMode === "scene" ? (
              <PanelSection
                collapsed={sectionState.isCollapsed("scene")}
                collapsible
                onCollapsedChange={sectionState.onCollapsedChange("scene")}
                title="场景预览"
              >
                <div className="scene-text-field">
                  <div className="scene-text-label-row">
                    <ControlFieldLabel htmlFor="scene-text-input">显示文字</ControlFieldLabel>
                    <span aria-live="polite" className="scene-text-count">
                      {Array.from(sceneText).length}/{maxSceneTextLength}
                    </span>
                  </div>
                  <Input
                    aria-describedby="scene-text-limit"
                    id="scene-text-input"
                    onChange={(event) => setSceneText(limitSceneText(event.target.value))}
                    value={sceneText}
                  />
                  <span className="sr-only" id="scene-text-limit">最多 20 个字符</span>
                </div>
              </PanelSection>
            ) : null}
            <PanelSection
              collapsed={sectionState.isCollapsed("motion")}
              collapsible
              onCollapsedChange={sectionState.onCollapsedChange("motion")}
              title="动态"
            >
              {renderSlider("speed")}
            </PanelSection>

            <PanelSection
              collapsed={sectionState.isCollapsed("colors")}
              collapsible
              onCollapsedChange={sectionState.onCollapsedChange("colors")}
              title="颜色"
            >
              {colorControl(<Color inputs={[colorInput("colorA"), colorInput("colorB")]} />)}
              {colorControl(<Color inputs={[colorInput("colorC"), colorInput("colorD")]} />)}
              {colorControl(<Color inputs={[colorInput("highlightColor"), colorInput("canvasColor")]} />)}
              {renderSlider("shade")}
              {renderSlider("exposure")}
            </PanelSection>

            <PanelSection
              collapsed={sectionState.isCollapsed("shape")}
              collapsible
              onCollapsedChange={sectionState.onCollapsedChange("shape")}
              title="形状动画"
            >
              {renderSlider("radius")}
              {renderSlider("contourDeform")}
              {renderSlider("zoom")}
              {renderSlider("warp")}
              {renderSlider("ridgeAmt")}
              {renderSlider("sharp")}
            </PanelSection>

            <PanelSection
              collapsed={sectionState.isCollapsed("glass")}
              collapsible
              onCollapsedChange={sectionState.onCollapsedChange("glass")}
              title="玻璃罩"
            >
              <div className="glass-switch">
                <Switch
                  checked={params.glassEnabled}
                  name="开启玻璃罩"
                  onCheckedChange={(checked) => setParam("glassEnabled", checked)}
                />
              </div>
              {params.glassEnabled ? (
                <>
                  {renderSlider("glassOpacity")}
                  {renderSlider("sheen")}
                  {renderSlider("gloss")}
                  {renderSlider("shellMidAlpha")}
                  {renderSlider("shellEdgeAlpha")}
                  {colorControl(<Color inputs={[colorInput("shellInner"), colorInput("shellMid")]} />)}
                  {colorControl(<Color inputs={[colorInput("shellEdge"), colorInput("sheenColor")]} />)}
                  {colorControl(<Color {...colorInput("specColor")} />)}
                </>
              ) : null}
            </PanelSection>

            <PanelSection
              collapsed={sectionState.isCollapsed("edge")}
              collapsible
              onCollapsedChange={sectionState.onCollapsedChange("edge")}
              title="边缘与外发光"
            >
              {renderSlider("edgeSoftness")}
              {renderSlider("edgeGlow")}
              {colorControl(<Color {...colorInput("glowColor")} />)}
            </PanelSection>

          </Panel>
        </aside>
      </main>

      <Sheet
        onOpenChange={(open) => {
          setCodeOpen(open);
          if (!open) setCopiedPlatform(null);
        }}
        open={codeOpen}
      >
        <SheetContent
          className="code-sheet"
          side="bottom"
        >
          <textarea
            aria-hidden="true"
            className="code-copy-buffer"
            ref={copyBufferRef}
            tabIndex={-1}
          />
          <SheetHeader className="code-sheet-header">
            <SheetTitle>复制代码</SheetTitle>
          </SheetHeader>
          <Tabs
            className="code-tabs"
            onValueChange={(value) => {
              if (value === "web" || value === "swift") {
                setCodePlatform(value);
                setCopiedPlatform(null);
              }
            }}
            value={codePlatform}
          >
            <div className="code-sheet-toolbar">
              <TabsList variant="control">
                <TabsTrigger value="web">Web</TabsTrigger>
                <TabsTrigger value="swift">SwiftUI</TabsTrigger>
              </TabsList>
              <Button onClick={copyCode} type="button" variant="outline">
                <CopySimpleIcon data-icon="inline-start" />
                {copiedPlatform === "error"
                  ? "复制失败"
                  : copiedPlatform === codePlatform
                    ? "已复制"
                    : "复制代码"}
              </Button>
            </div>
            <TabsContent className="code-tab-content" value="web">
              <pre className="code-preview" aria-label="Web 代码"><code>{webCode}</code></pre>
            </TabsContent>
            <TabsContent className="code-tab-content" value="swift">
              <pre className="code-preview" aria-label="SwiftUI 代码"><code>{swiftCode}</code></pre>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
