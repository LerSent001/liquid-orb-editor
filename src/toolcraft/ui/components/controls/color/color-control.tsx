"use client";

import * as React from "react";

import { ControlFieldLabel } from "../../control-layout";
import { Field } from "../../primitives";
import { cn } from "../../../lib/utils";
import type { ControlChangeMeta } from "../control-types";
import {
  ColorOpacityInput,
  parseOpacityValue,
} from "./color-opacity-input";
import type {
  ColorControlGroupProps,
  ColorControlInput,
  ColorControlProps,
  ColorOpacityControlProps,
} from "./color-control-types";
import { ColorValueControl } from "./color-value-control";

export type {
  ColorControlInput,
  ColorControlInputPair,
  ColorControlProps,
  ColorOpacityControlProps,
  ColorOpacityValue,
} from "./color-control-types";
export { ColorValueControl } from "./color-value-control";

function isColorControlGroupProps(
  props: ColorControlProps,
): props is ColorControlGroupProps {
  return Array.isArray((props as ColorControlGroupProps).inputs);
}

function ColorControlField({
  fullWidth = false,
  hex,
  name,
  onValueChange,
  showLabel = false,
}: ColorControlInput & { fullWidth?: boolean }): React.JSX.Element {
  const activeColor = hex ?? "var(--foreground)";

  function updateColor(nextColor: string, meta?: ControlChangeMeta): void {
    const nextValue = {
      hex: nextColor,
    };

    if (meta) {
      onValueChange?.(nextValue, meta);
      return;
    }

    onValueChange?.(nextValue);
  }

  return (
    <Field className="h-fit min-w-0 justify-start gap-2">
      {showLabel ? <ControlFieldLabel>{name}</ControlFieldLabel> : null}
      <div className={cn("min-w-0", fullWidth ? "w-full" : "w-1/2 shrink-0")}>
        <ColorValueControl
          color={activeColor}
          label={name}
          onColorChange={updateColor}
        />
      </div>
    </Field>
  );
}

export function ColorControl(props: ColorControlProps): React.JSX.Element {
  if (isColorControlGroupProps(props)) {
    return (
      <div
        className="grid min-w-0 gap-[10px]"
        data-slot="color-control-grid"
        style={{
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        {props.inputs.map((input, index) => (
          <ColorControlField
            fullWidth
            key={`${input.name}-${index}`}
            {...input}
          />
        ))}
      </div>
    );
  }

  return <ColorControlField {...props} />;
}

export function ColorOpacityControl({
  hex,
  name,
  onValueChange,
  opacity,
  showLabel = false,
}: ColorOpacityControlProps): React.JSX.Element {
  const activeColor = hex ?? "var(--foreground)";
  const activeOpacity = parseOpacityValue(opacity);

  function updateColor(nextColor: string, meta?: ControlChangeMeta): void {
    const nextValue = {
      hex: nextColor,
      opacity: activeOpacity,
    };

    if (meta) {
      onValueChange?.(nextValue, meta);
      return;
    }

    onValueChange?.(nextValue);
  }

  function updateOpacity(nextOpacity: number, meta?: ControlChangeMeta): void {
    const nextValue = {
      hex: activeColor,
      opacity: nextOpacity,
    };

    if (meta) {
      onValueChange?.(nextValue, meta);
      return;
    }

    onValueChange?.(nextValue);
  }

  return (
    <Field className="h-fit min-w-0 justify-start gap-2">
      {showLabel ? <ControlFieldLabel>{name}</ControlFieldLabel> : null}
      <div className="min-w-0 w-full">
        <ColorValueControl
          color={activeColor}
          label={name}
          onColorChange={updateColor}
        >
          <ColorOpacityInput
            label={name}
            name={`${name.toLowerCase().replace(/\s+/g, "-")}-opacity`}
            onOpacityChange={updateOpacity}
            opacity={activeOpacity}
          />
        </ColorValueControl>
      </div>
    </Field>
  );
}
