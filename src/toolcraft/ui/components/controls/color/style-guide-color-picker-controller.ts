"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { getColorSurfaceSliderConfig } from "./color-model-slider";
import { hsvToHex, type HsvColor } from "../../../lib/style-guide-color-utils";
import {
  getColorChannels,
  getColorSurfaceModel,
  rgbChannelsToHex,
  type ColorFormatMode,
  type ColorSurfaceModel,
} from "./style-guide-color-picker-channel-utils";
import {
  useHexInputHandlers,
  useSurfacePointerDown,
} from "./style-guide-color-picker-interactions";
import { useHueHandlers } from "./style-guide-color-picker-hue-handlers";
import { useInteractionState } from "./style-guide-color-picker-interaction-state";
import {
  useColorModel,
} from "./style-guide-color-picker-model";
import {
  type ColorSurfacePosition,
  type DragBounds,
} from "./style-guide-color-picker-surface-geometry";
import { useSurfaceDrag } from "./style-guide-color-picker-surface-drag";
import { useSurfacePreview } from "./style-guide-color-picker-surface-preview";
import type {
  ColorPickerRefs,
  ColorPickerViewProps,
  StyleGuideColorPickerProps,
  SurfacePositionOverride,
} from "./style-guide-color-picker-types";

export const DEFAULT_COLOR_FORMAT_MODE = "hsl" satisfies ColorFormatMode;

function useColorPickerRefs(): ColorPickerRefs {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const isHexInputFocusedRef = useRef(false);
  const surfaceBoundsRef = useRef<DragBounds | null>(null);
  const surfaceDragStartHexRef = useRef<string | null>(null);
  const surfaceDragStartColorRef = useRef<HsvColor | null>(null);
  const pendingSurfaceCommitHexRef = useRef<string | null>(null);
  const pendingSurfaceBaseHexRef = useRef<string | null>(null);
  const hueDragStartHexRef = useRef<string | null>(null);

  return useMemo(
    () => ({
      surfaceRef,
      isHexInputFocusedRef,
      surfaceBoundsRef,
      surfaceDragStartHexRef,
      surfaceDragStartColorRef,
      pendingSurfaceCommitHexRef,
      pendingSurfaceBaseHexRef,
      hueDragStartHexRef,
    }),
    [],
  );
}

function useRgbBlueHandlers({
  latestHsvRef,
  hueDragStartHexRef,
  applyOptimisticHex,
  setInteractionSourceState,
  emitChange,
  onCommit,
}: {
  latestHsvRef: MutableRefObject<HsvColor>;
  hueDragStartHexRef: MutableRefObject<string | null>;
  applyOptimisticHex: (nextHex: string) => string | null;
  setInteractionSourceState: (source: "hue", nextIsActive: boolean) => void;
  emitChange: (hex: string) => void;
  onCommit?: () => void;
}) {
  const handleSliderDragStateChange = useCallback(
    (nextIsDragging: boolean) => {
      if (nextIsDragging) {
        hueDragStartHexRef.current = hsvToHex(latestHsvRef.current);
        setInteractionSourceState("hue", true);
        return;
      }
      setInteractionSourceState("hue", false);
    },
    [hueDragStartHexRef, latestHsvRef, setInteractionSourceState],
  );

  const applyBlueChannel = useCallback(
    (nextBlue: number) => {
      const channels = getColorChannels(hsvToHex(latestHsvRef.current)).rgb;
      const nextHex = rgbChannelsToHex([
        channels[0],
        channels[1],
        Math.round(Math.max(0, Math.min(255, nextBlue))),
      ]);

      return applyOptimisticHex(nextHex) ?? nextHex;
    },
    [applyOptimisticHex, latestHsvRef],
  );

  const handleSliderPreviewChange = useCallback(
    (nextValue: number) => {
      emitChange(applyBlueChannel(nextValue));
    },
    [applyBlueChannel, emitChange],
  );

  const handleSliderCommit = useCallback(
    (nextValue: number) => {
      const nextHex = applyBlueChannel(nextValue);
      const dragStartHex = hueDragStartHexRef.current;
      hueDragStartHexRef.current = null;
      if (!dragStartHex || nextHex === dragStartHex) return;

      emitChange(nextHex);
      onCommit?.();
    },
    [applyBlueChannel, emitChange, hueDragStartHexRef, onCommit],
  );

  return { handleSliderCommit, handleSliderDragStateChange, handleSliderPreviewChange };
}

function useColorPickerSurfaceDrag(
  refs: ColorPickerRefs,
  model: ReturnType<typeof useColorModel>,
  preview: ReturnType<typeof useSurfacePreview>,
  interaction: ReturnType<typeof useInteractionState>,
  surfaceModelRef: MutableRefObject<ColorSurfaceModel>,
  setSurfacePositionOverride: (
    position: ColorSurfacePosition,
    hex: string,
    surfaceModel: ColorSurfaceModel,
  ) => void,
  isSurfaceDragging: boolean,
  setIsSurfaceDragging: (nextIsDragging: boolean) => void,
  onCommit?: () => void,
) {
  const surfaceDragOptions = useMemo(
    () => ({
      isSurfaceDragging,
      setIsSurfaceDragging,
      surfaceBoundsRef: refs.surfaceBoundsRef,
      surfaceDragStartHexRef: refs.surfaceDragStartHexRef,
      surfaceDragStartColorRef: refs.surfaceDragStartColorRef,
      pendingSurfaceCommitHexRef: refs.pendingSurfaceCommitHexRef,
      pendingSurfaceBaseHexRef: refs.pendingSurfaceBaseHexRef,
      latestHsvRef: model.latestHsvRef,
      surfaceModelRef,
      applyOptimisticColor: model.applyOptimisticColor,
      scheduleSurfacePreview: preview.scheduleSurfacePreview,
      flushPendingSurfacePreview: preview.flushPendingSurfacePreview,
      setSurfacePositionOverride,
      setInteractionSourceState: interaction.setInteractionSourceState,
      emitChange: model.emitChange,
      onCommit,
    }),
    [
      interaction.setInteractionSourceState,
      isSurfaceDragging,
      model,
      onCommit,
      preview,
      refs,
      setSurfacePositionOverride,
      setIsSurfaceDragging,
      surfaceModelRef,
    ],
  );
  useSurfaceDrag(surfaceDragOptions);
}

function useColorValueHandlers(
  refs: ColorPickerRefs,
  model: ReturnType<typeof useColorModel>,
  interaction: ReturnType<typeof useInteractionState>,
  onCommit?: () => void,
) {
  const { setInteractionSourceState } = interaction;
  const handleColorValueFocus = useCallback(() => {
    refs.isHexInputFocusedRef.current = true;
    setInteractionSourceState("hex", true);
  }, [refs.isHexInputFocusedRef, setInteractionSourceState]);
  const handleColorValueChange = useCallback(
    (nextHex: string) => {
      const nextDraftHex = nextHex.toUpperCase();

      refs.isHexInputFocusedRef.current = true;
      setInteractionSourceState("hex", true);
      model.setDraftHexValue(nextDraftHex);
      model.applyOptimisticHex(nextDraftHex);
      model.emitChange(nextDraftHex);
    },
    [model, refs.isHexInputFocusedRef, setInteractionSourceState],
  );
  const handleColorValueBlur = useCallback(() => {
    refs.isHexInputFocusedRef.current = false;
    setInteractionSourceState("hex", false);
    onCommit?.();
  }, [onCommit, refs.isHexInputFocusedRef, setInteractionSourceState]);

  return {
    handleColorValueBlur,
    handleColorValueChange,
    handleColorValueFocus,
  };
}

export function useColorPickerController({
  value,
  disabled = false,
  hexInputId,
  hexInputLabel = "十六进制颜色",
  surfaceLabel = "颜色饱和度和亮度",
  hueLabel = "色相",
  showOpacity = false,
  surfaceClassName,
  onChange,
  onCommit,
  onInteractionStateChange,
}: StyleGuideColorPickerProps): ColorPickerViewProps {
  const generatedHexInputId = useId();
  const [isSurfaceDragging, setIsSurfaceDragging] = useState(false);
  const [colorFormatMode, setColorFormatMode] = useState<ColorFormatMode>(
    DEFAULT_COLOR_FORMAT_MODE,
  );
  const colorSurfaceModel = getColorSurfaceModel(colorFormatMode);
  const surfaceModelRef = useRef<ColorSurfaceModel>(colorSurfaceModel);
  const [surfacePositionOverride, setSurfacePositionOverrideState] =
    useState<SurfacePositionOverride | null>(null);
  const refs = useColorPickerRefs();
  const interaction = useInteractionState(onInteractionStateChange);
  const model = useColorModel({
    value,
    isSurfaceDragging,
    hueDragStartHexRef: refs.hueDragStartHexRef,
    isHexInputFocusedRef: refs.isHexInputFocusedRef,
    pendingSurfaceCommitHexRef: refs.pendingSurfaceCommitHexRef,
    pendingSurfaceBaseHexRef: refs.pendingSurfaceBaseHexRef,
    onChange,
  });
  const preview = useSurfacePreview(model.emitChange);
  useEffect(() => {
    surfaceModelRef.current = colorSurfaceModel;
    setSurfacePositionOverrideState(null);
  }, [colorSurfaceModel]);
  const setSurfacePositionOverride = useCallback(
    (position: ColorSurfacePosition, hex: string, surfaceModel: ColorSurfaceModel) => {
      setSurfacePositionOverrideState({ colorModel: surfaceModel, hex, position });
    },
    [],
  );
  const hueHandlers = useHueHandlers({
    latestHsvRef: model.latestHsvRef,
    hueDragStartHexRef: refs.hueDragStartHexRef,
    applyOptimisticColor: model.applyOptimisticColor,
    setInteractionSourceState: interaction.setInteractionSourceState,
    emitChange: model.emitChange,
    onCommit,
  });
  const rgbBlueHandlers = useRgbBlueHandlers({
    latestHsvRef: model.latestHsvRef,
    hueDragStartHexRef: refs.hueDragStartHexRef,
    applyOptimisticHex: model.applyOptimisticHex,
    setInteractionSourceState: interaction.setInteractionSourceState,
    emitChange: model.emitChange,
    onCommit,
  });
  useColorPickerSurfaceDrag(
    refs,
    model,
    preview,
    interaction,
    surfaceModelRef,
    setSurfacePositionOverride,
    isSurfaceDragging,
    setIsSurfaceDragging,
    onCommit,
  );
  const hexHandlers = useHexInputHandlers({
    isHexInputFocusedRef: refs.isHexInputFocusedRef,
    draftHexValue: model.draftHexValue,
    normalizedHex: model.normalizedHex,
    latestHsvRef: model.latestHsvRef,
    setDraftHexValue: model.setDraftHexValue,
    applyOptimisticHex: model.applyOptimisticHex,
    emitChange: model.emitChange,
    setInteractionSourceState: interaction.setInteractionSourceState,
    onCommit,
  });
  const colorValueHandlers = useColorValueHandlers(
    refs,
    model,
    interaction,
    onCommit,
  );
  const onSurfacePointerDown = useSurfacePointerDown({
    disabled,
    surfaceRef: refs.surfaceRef,
    surfaceBoundsRef: refs.surfaceBoundsRef,
    surfaceDragStartHexRef: refs.surfaceDragStartHexRef,
    surfaceDragStartColorRef: refs.surfaceDragStartColorRef,
    pendingSurfacePreviewHexRef: preview.pendingSurfacePreviewHexRef,
    pendingSurfaceCommitHexRef: refs.pendingSurfaceCommitHexRef,
    pendingSurfaceBaseHexRef: refs.pendingSurfaceBaseHexRef,
    latestHsvRef: model.latestHsvRef,
    surfaceModel: colorSurfaceModel,
    clearScheduledSurfacePreview: preview.clearScheduledSurfacePreview,
    applyOptimisticColor: model.applyOptimisticColor,
    setSurfacePositionOverride,
    setInteractionSourceState: interaction.setInteractionSourceState,
    emitChange: model.emitChange,
    setIsSurfaceDragging,
  });
  const currentColorHex = hsvToHex(model.optimisticColor);
  const surfacePosition =
    surfacePositionOverride?.colorModel === colorSurfaceModel &&
    surfacePositionOverride.hex === currentColorHex
      ? surfacePositionOverride.position
      : null;

  return {
    disabled,
    surfaceLabel,
    hueLabel,
    hexInputLabel,
    showOpacity,
    surfaceClassName,
    surfaceRef: refs.surfaceRef,
    resolvedHexInputId: hexInputId ?? generatedHexInputId,
    optimisticColor: model.optimisticColor,
    draftHexValue: model.draftHexValue,
    isSurfaceDragging,
    hueColor: hsvToHex({ h: model.optimisticColor.h, s: 1, v: 1 }),
    currentColorHex,
    colorFormatMode,
    colorSurfaceModel,
    surfacePosition,
    sliderConfig: getColorSurfaceSliderConfig({
      colorModel: colorSurfaceModel,
      currentColorHex,
      hueLabel,
      optimisticColor: model.optimisticColor,
    }),
    sliderHandlers:
      colorSurfaceModel === "rgb"
        ? rgbBlueHandlers
        : {
            handleSliderCommit: hueHandlers.handleHueCommit,
            handleSliderDragStateChange: hueHandlers.handleHueDragStateChange,
            handleSliderPreviewChange: hueHandlers.handleHuePreviewChange,
          },
    onColorFormatModeChange: setColorFormatMode,
    onSurfacePointerDown,
    onColorValueFocus: colorValueHandlers.handleColorValueFocus,
    onColorValueChange: colorValueHandlers.handleColorValueChange,
    onColorValueBlur: colorValueHandlers.handleColorValueBlur,
    ...hexHandlers,
  };
}
