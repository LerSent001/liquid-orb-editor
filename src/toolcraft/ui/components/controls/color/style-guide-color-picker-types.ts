import type {
  ChangeEvent,
  KeyboardEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import type { getColorSurfaceSliderConfig } from "./color-model-slider";
import type { HsvColor } from "../../../lib/style-guide-color-utils";
import type {
  ColorFormatMode,
  ColorSurfaceModel,
} from "./style-guide-color-picker-channel-utils";
import type {
  ColorSurfacePosition,
  DragBounds,
} from "./style-guide-color-picker-surface-geometry";

export type StyleGuideColorPickerProps = {
  value: string;
  disabled?: boolean;
  hexInputId?: string;
  hexInputLabel?: string;
  surfaceLabel?: string;
  hueLabel?: string;
  showOpacity?: boolean;
  surfaceClassName?: string;
  onChange: (hex: string) => void;
  onCommit?: () => void;
  onInteractionStateChange?: (isInteracting: boolean) => void;
};

export type ColorPickerSliderHandlers = {
  handleSliderCommit: (nextValue: number) => void;
  handleSliderDragStateChange: (nextIsDragging: boolean) => void;
  handleSliderPreviewChange: (nextValue: number) => void;
};

export type ColorPickerViewProps = {
  disabled: boolean;
  surfaceLabel: string;
  hueLabel: string;
  hexInputLabel: string;
  showOpacity: boolean;
  surfaceClassName?: string;
  surfaceRef: RefObject<HTMLDivElement | null>;
  resolvedHexInputId: string;
  optimisticColor: HsvColor;
  draftHexValue: string;
  isSurfaceDragging: boolean;
  hueColor: string;
  currentColorHex: string;
  colorFormatMode: ColorFormatMode;
  colorSurfaceModel: ColorSurfaceModel;
  surfacePosition: ColorSurfacePosition | null;
  sliderConfig: ReturnType<typeof getColorSurfaceSliderConfig>;
  sliderHandlers: ColorPickerSliderHandlers;
  onColorFormatModeChange: (nextMode: ColorFormatMode) => void;
  onSurfacePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onHexFocus: () => void;
  onHexChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onHexBlur: () => void;
  onHexKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onColorValueFocus: () => void;
  onColorValueChange: (nextHex: string) => void;
  onColorValueBlur: () => void;
};

export type ColorPickerRefs = {
  surfaceRef: RefObject<HTMLDivElement | null>;
  isHexInputFocusedRef: MutableRefObject<boolean>;
  surfaceBoundsRef: MutableRefObject<DragBounds | null>;
  surfaceDragStartHexRef: MutableRefObject<string | null>;
  surfaceDragStartColorRef: MutableRefObject<HsvColor | null>;
  pendingSurfaceCommitHexRef: MutableRefObject<string | null>;
  pendingSurfaceBaseHexRef: MutableRefObject<string | null>;
  hueDragStartHexRef: MutableRefObject<string | null>;
};

export type SurfacePositionOverride = {
  colorModel: ColorSurfaceModel;
  hex: string;
  position: ColorSurfacePosition;
};
