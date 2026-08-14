"use client";

import { ColorFooter } from "./color-footer";
import { ColorModelSlider } from "./color-model-slider";
import { ColorSurface } from "./color-surface";
import type { ColorPickerViewProps } from "./style-guide-color-picker-types";

export function ColorPickerView(props: ColorPickerViewProps) {
  return (
    <div
      data-slot="style-guide-color-picker"
      className="flex h-full min-h-0 w-full flex-1 flex-col"
    >
      <ColorSurface
        surfaceRef={props.surfaceRef}
        surfaceLabel={props.surfaceLabel}
        surfaceClassName={props.surfaceClassName}
        disabled={props.disabled}
        hueColor={props.hueColor}
        currentColorHex={props.currentColorHex}
        colorModel={props.colorSurfaceModel}
        optimisticColor={props.optimisticColor}
        surfacePosition={props.surfacePosition}
        isSurfaceDragging={props.isSurfaceDragging}
        onPointerDown={props.onSurfacePointerDown}
        onThumbPointerDown={(event) => {
          event.stopPropagation();
          props.onSurfacePointerDown(event);
        }}
      />
      <div
        data-slot="style-guide-color-controls"
        className="flex w-full shrink-0 flex-col"
      >
        <div
          data-slot="style-guide-color-slider-wrap"
          className="flex h-9 w-full shrink-0 items-center px-3"
        >
          <ColorModelSlider
            label={props.sliderConfig.label}
            disabled={props.disabled}
            max={props.sliderConfig.max}
            railBackground={props.sliderConfig.railBackground}
            value={props.sliderConfig.value}
            onDragStateChange={props.sliderHandlers.handleSliderDragStateChange}
            onPreviewChange={props.sliderHandlers.handleSliderPreviewChange}
            onCommit={props.sliderHandlers.handleSliderCommit}
          />
        </div>
        <ColorFooter
          resolvedHexInputId={props.resolvedHexInputId}
          hexInputLabel={props.hexInputLabel}
          disabled={props.disabled}
          draftHexValue={props.draftHexValue}
          onHexFocus={props.onHexFocus}
          onHexChange={props.onHexChange}
          onHexBlur={props.onHexBlur}
          onHexKeyDown={props.onHexKeyDown}
          onColorValueFocus={props.onColorValueFocus}
          onColorValueChange={props.onColorValueChange}
          onColorValueBlur={props.onColorValueBlur}
          mode={props.colorFormatMode}
          onModeChange={props.onColorFormatModeChange}
          showOpacity={props.showOpacity}
        />
      </div>
    </div>
  );
}
