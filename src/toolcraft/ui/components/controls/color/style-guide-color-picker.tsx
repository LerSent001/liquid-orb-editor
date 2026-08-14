"use client";

import {
  DEFAULT_COLOR_FORMAT_MODE,
  useColorPickerController,
} from "./style-guide-color-picker-controller";
import { ColorPickerView } from "./style-guide-color-picker-view";
import type { StyleGuideColorPickerProps } from "./style-guide-color-picker-types";

export { DEFAULT_COLOR_FORMAT_MODE };

export function StyleGuideColorPicker(props: StyleGuideColorPickerProps) {
  return <ColorPickerView {...useColorPickerController(props)} />;
}
