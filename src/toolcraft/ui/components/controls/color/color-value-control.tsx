"use client";

import * as React from "react";

import {
  ButtonGroup,
  Input,
} from "../../primitives";
import { cn } from "../../../lib/utils";
import { ColorPickerPopover } from "./color-picker-popover";
import {
  getCommittedHexColor,
  getHexDraftValue,
  getNativeColorPickerValue,
  getSanitizedHexDraft,
  getSwatchColorValue,
} from "./color-value-utils";
import {
  createControlHistoryGroupId,
  type ControlChangeMeta,
  type ControlValueChangeHandler,
} from "../control-types";

type ColorValueControlProps = {
  children?: React.ReactNode;
  className?: string;
  color: string;
  inputName?: string;
  label: string;
  nativeInputName?: string;
  onColorChange: ControlValueChangeHandler<string>;
  showHash?: boolean;
  size?: "default" | "sm";
};

const colorValueButtonGroupClassName =
  "w-full has-[[data-slot=button][aria-expanded=true]]:[&>input]:!border-l-[color:color-mix(in_oklab,var(--border)_30%,transparent)] has-[[data-slot=button][data-open]]:[&>input]:!border-l-[color:color-mix(in_oklab,var(--border)_30%,transparent)] has-[[data-slot=button][data-popup-open]]:[&>input]:!border-l-[color:color-mix(in_oklab,var(--border)_30%,transparent)] has-[[data-slot=button][data-state=open]]:[&>input]:!border-l-[color:color-mix(in_oklab,var(--border)_30%,transparent)]";

export function ColorValueControl({
  children,
  className,
  color,
  inputName,
  label,
  nativeInputName,
  onColorChange,
  showHash = true,
  size = "default",
}: ColorValueControlProps): React.JSX.Element {
  const [draftColor, setDraftColor] = React.useState(() =>
    getHexDraftValue(color, showHash),
  );
  const [previewColor, setPreviewColor] = React.useState(color);
  const liveHistoryGroupRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setDraftColor(getHexDraftValue(color, showHash));
    setPreviewColor(color);
  }, [color, showHash]);

  function getLiveHistoryMeta(): ControlChangeMeta {
    liveHistoryGroupRef.current ??= createControlHistoryGroupId(`color:${label}`);

    return {
      history: "merge",
      historyGroup: liveHistoryGroupRef.current,
    };
  }

  function finishLiveHistoryGroup(): void {
    liveHistoryGroupRef.current = null;
  }

  function commitColor(nextColor: string, meta?: ControlChangeMeta): void {
    const normalizedColor = nextColor.toUpperCase();
    setPreviewColor(normalizedColor);
    setDraftColor(getHexDraftValue(normalizedColor, showHash));
    onColorChange(normalizedColor, meta);
  }

  function updateDraft(nextValue: string): void {
    const nextDraft = getSanitizedHexDraft(nextValue, showHash);

    setDraftColor(nextDraft);

    const committedColor = getCommittedHexColor(nextDraft);
    if (committedColor) {
      setPreviewColor(committedColor);
    }
  }

  function handleDraftBlur(): void {
    const committedColor = getCommittedHexColor(draftColor);

    if (committedColor) {
      commitColor(
        committedColor,
        liveHistoryGroupRef.current ? getLiveHistoryMeta() : undefined,
      );
      finishLiveHistoryGroup();
      return;
    }

    setDraftColor(getHexDraftValue(color, showHash));
    setPreviewColor(color);
    finishLiveHistoryGroup();
  }

  return (
    <>
      <ButtonGroup
        adjacentBorderTone="subtle"
        className={cn(colorValueButtonGroupClassName, className)}
      >
        <ColorPickerPopover
          label={label}
          pickerValue={getNativeColorPickerValue(previewColor)}
          showOpacity={Boolean(children)}
          size={size}
          swatchColor={getSwatchColorValue(previewColor)}
          onColorChange={(nextColor) => commitColor(nextColor, getLiveHistoryMeta())}
          onCommit={handleDraftBlur}
        />
        <Input
          aria-label={`${label}十六进制值`}
          autoComplete="off"
          className="font-mono"
          name={inputName}
          onBlur={handleDraftBlur}
          onChange={(event) => updateDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleDraftBlur();
              event.currentTarget.blur();
              return;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              setDraftColor(getHexDraftValue(color, showHash));
              setPreviewColor(color);
              finishLiveHistoryGroup();
              event.currentTarget.blur();
            }
          }}
          size={size}
          spellCheck={false}
          type="text"
          value={draftColor}
        />
        {children}
      </ButtonGroup>
      {nativeInputName ? (
        <input name={nativeInputName} type="hidden" value={previewColor} />
      ) : null}
    </>
  );
}
