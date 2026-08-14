"use client";

import { useMemo, type ChangeEvent, type KeyboardEvent } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../primitives/input-group";
import { StaticSelect } from "../select";
import {
  getColorChannels,
  getEditableChannelHex,
  type ColorChannels,
  type ColorFormatMode,
} from "./style-guide-color-picker-channel-utils";

type ColorFooterProps = {
  resolvedHexInputId: string;
  hexInputLabel: string;
  disabled: boolean;
  draftHexValue: string;
  onHexFocus: () => void;
  onHexChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onHexBlur: () => void;
  onHexKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onColorValueFocus: () => void;
  onColorValueChange: (nextHex: string) => void;
  onColorValueBlur: () => void;
  mode: ColorFormatMode;
  onModeChange: (nextMode: ColorFormatMode) => void;
  showOpacity?: boolean;
};

const COLOR_FORMAT_MODES = [
  { label: "十六进制", value: "hex" },
  { label: "RGB", value: "rgb" },
  { label: "HSL", value: "hsl" },
  { label: "HSB", value: "hsb" },
] as const satisfies ReadonlyArray<{ label: string; value: ColorFormatMode }>;

const colorFormatSelectWidth = `calc(${Math.max(
  ...COLOR_FORMAT_MODES.map((formatMode) => formatMode.label.length),
)}ch + 2rem)`;

const colorValueInputGroupClassName = "h-6 min-w-0 flex-1";

const colorValueInputClassName =
  "min-w-0 px-1 text-center text-xs font-mono";

const colorValueCellSeparatorClassName =
  "pointer-events-none absolute top-0 bottom-0 w-px bg-[color:color-mix(in_oklab,var(--border)_12%,transparent)]";

function toColorFormatMode(value: unknown): ColorFormatMode | null {
  const candidate =
    typeof value === "string"
      ? value
      : value && typeof value === "object" && "value" in value
        ? String(value.value)
        : null;

  return COLOR_FORMAT_MODES.some((formatMode) => formatMode.value === candidate)
    ? (candidate as ColorFormatMode)
    : null;
}

function ColorFormatSelect({
  disabled,
  mode,
  onModeChange,
}: {
  disabled: boolean;
  mode: ColorFormatMode;
  onModeChange: (nextMode: ColorFormatMode) => void;
}) {
  return (
    <div className="min-w-0 shrink-0" style={{ width: colorFormatSelectWidth }}>
      <StaticSelect
        disabled={disabled}
        options={COLOR_FORMAT_MODES}
        scrollFadeValue={false}
        size="sm"
        triggerClassName="text-[11px]"
        value={mode}
        onValueChange={(nextMode) => {
          const resolvedMode = toColorFormatMode(nextMode);

          if (resolvedMode) onModeChange(resolvedMode);
        }}
      />
    </div>
  );
}

function ColorValueCells({
  channels,
  disabled,
  mode,
  onColorValueBlur,
  onColorValueChange,
  onColorValueFocus,
  showOpacity,
}: {
  channels: ColorChannels;
  disabled: boolean;
  mode: ColorFormatMode;
  onColorValueBlur: () => void;
  onColorValueChange: (nextHex: string) => void;
  onColorValueFocus: () => void;
  showOpacity: boolean;
}) {
  if (mode === "css") {
    const [red, green, blue] = channels.rgb;

    return (
      <InputGroup
        data-slot="style-guide-color-value-cells"
        className={colorValueInputGroupClassName}
        size="sm"
      >
        <InputGroupInput
          aria-label="CSS 颜色值"
          className="min-w-0 px-2 font-mono text-xs"
          disabled={disabled}
          readOnly
          value={`rgb(${red} ${green} ${blue})`}
        />
      </InputGroup>
    );
  }

  const colorValues =
    mode === "rgb"
      ? channels.rgb
      : mode === "hsl"
        ? channels.hsl
        : channels.hsb;
  const values = showOpacity ? [...colorValues, 100] : colorValues;

  return (
    <InputGroup
      data-slot="style-guide-color-value-cells"
      className={colorValueInputGroupClassName}
      size="sm"
    >
      <div className="relative flex h-full min-w-0 flex-1">
        {values.slice(1).map((_, index) => (
          <span
            aria-hidden
            className={colorValueCellSeparatorClassName}
            key={`${mode}-separator-${index}`}
            style={{ left: `${((index + 1) / values.length) * 100}%` }}
          />
        ))}
        {values.map((value, index) => {
          const isAlphaChannel = index === 3;

          return (
            <InputGroupInput
              aria-label={`${mode.toUpperCase()} 通道 ${index + 1}`}
              className={colorValueInputClassName}
              disabled={disabled}
              inputMode="numeric"
              key={`${mode}-${index}`}
              readOnly={isAlphaChannel}
              value={String(value)}
              onBlur={isAlphaChannel ? undefined : onColorValueBlur}
              onChange={(event) => {
                const nextHex = getEditableChannelHex({
                  channels,
                  channelIndex: index,
                  mode,
                  rawValue: event.target.value,
                });

                if (nextHex) onColorValueChange(nextHex);
              }}
              onFocus={
                isAlphaChannel
                  ? undefined
                  : () => {
                      onColorValueFocus();
                    }
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.currentTarget.blur();
                }
              }}
            />
          );
        })}
      </div>
      {showOpacity ? (
        <InputGroupAddon align="inline-end" className="pr-1.5 pl-0">
          <InputGroupText>%</InputGroupText>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

export function ColorFooter({
  resolvedHexInputId,
  hexInputLabel,
  disabled,
  draftHexValue,
  onHexFocus,
  onHexChange,
  onHexBlur,
  onHexKeyDown,
  onColorValueFocus,
  onColorValueChange,
  onColorValueBlur,
  mode,
  onModeChange,
  showOpacity = false,
}: ColorFooterProps) {
  const channels = useMemo(
    () => getColorChannels(draftHexValue),
    [draftHexValue],
  );

  return (
    <div
      data-slot="style-guide-color-footer"
      className="flex w-full shrink-0 items-center border-t border-[color:color-mix(in_oklab,var(--border)_6%,transparent)] px-2 py-3"
    >
      <div
        data-slot="style-guide-color-footer-row"
        className="flex w-full min-w-0 items-center gap-1.5"
      >
        <ColorFormatSelect
          disabled={disabled}
          mode={mode}
          onModeChange={onModeChange}
        />
        {mode === "hex" ? (
          <InputGroup className="h-6 min-w-0 flex-1" size="sm">
            <InputGroupInput
              id={resolvedHexInputId}
              type="text"
              inputMode="text"
              spellCheck={false}
              autoCapitalize="characters"
              autoCorrect="off"
              disabled={disabled}
              aria-label={hexInputLabel}
              className="min-w-0 font-mono text-xs"
              value={draftHexValue}
              onFocus={onHexFocus}
              onChange={onHexChange}
              onBlur={onHexBlur}
              onKeyDown={onHexKeyDown}
            />
          </InputGroup>
        ) : (
          <ColorValueCells
            channels={channels}
            disabled={disabled}
            mode={mode}
            onColorValueBlur={onColorValueBlur}
            onColorValueChange={onColorValueChange}
            onColorValueFocus={onColorValueFocus}
            showOpacity={showOpacity}
          />
        )}
      </div>
    </div>
  );
}
