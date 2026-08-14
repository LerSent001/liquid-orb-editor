"use client";

import * as React from "react";

import { ControlFieldLabel } from "../../control-layout";
import {
  Field,
  Input,
  Popover,
  ScrollFade,
  PopoverTrigger,
  SelectTriggerButton,
} from "../../primitives";
import type { ControlChangeMeta, ControlValueChangeHandler } from "../control-types";
import {
  getDefaultFontPickerFontId,
  getFontPickerFontById,
} from "./font-catalog";
import { ColorOpacityControl } from "../color";
import { StaticSelect } from "../select";
import { useMeasuredElementWidth } from "../use-measured-element-width";
import {
  getFontFamilyStyle,
  getFontPickerWeightOptions,
  getStepByValue,
  getStepIndexByValue,
  isFontPickerTextCase,
  letterSpacingSteps,
  lineHeightSteps,
  minFontPickerFontSizePx,
  normalizeFontPickerFontSize,
  normalizeFontPickerValue,
  resolveFontPickerFontWeight,
  textCaseOptions,
  type FontPickerInputValue,
  type FontPickerValue,
} from "./font-picker-value";
import { FontPickerPopoverContent } from "./font-picker-popover-content";
import { useFontPickerPreviewPipeline } from "./use-font-picker-preview-pipeline";
import { useFontPickerVirtualList } from "./use-font-picker-virtual-list";

export type FontPickerControlProps = {
  defaultValue?: FontPickerInputValue;
  disabled?: boolean;
  name: string;
  onPreviewChange?: (nextFontId: string | null) => void;
  onValueChange?: ControlValueChangeHandler<FontPickerValue>;
  searchPlaceholder?: string;
  value?: FontPickerInputValue;
};

export function FontPickerControl({
  defaultValue,
  disabled = false,
  name,
  onPreviewChange,
  onValueChange,
  searchPlaceholder = "Find font",
  value,
}: FontPickerControlProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const familyWeightRowRef = React.useRef<HTMLDivElement | null>(null);
  const familyWeightRowWidth = useMeasuredElementWidth(familyWeightRowRef);
  const normalizedValue = normalizeFontPickerValue(value);
  const normalizedDefaultValue = normalizeFontPickerValue(defaultValue);
  const [fontSizeDraft, setFontSizeDraft] = React.useState(
    String(normalizedValue.fontSize),
  );
  const selectedFont = getFontPickerFontById(normalizedValue.fontId);
  const {
    attachScrollViewport,
    bottomSpacerHeight,
    cancelOpenSelectedScroll,
    category,
    filteredFonts,
    pinnedSelectedRowSide,
    prepareForOpen,
    query,
    scrollToFontIndex,
    searchInputRef,
    selectedFontIndex,
    setCategoryWithReset,
    setQueryWithReset,
    topSpacerHeight,
    virtualEndIndex,
    virtualStartIndex,
    visibleFonts,
  } = useFontPickerVirtualList({
    open,
    selectedFont,
  });
  const {
    cancelHoverPreviewIntent,
    clearHoverPreview,
    emitPreviewChange,
    handleHoverPreview,
    scheduleHoverPreviewIntent,
    warmFontPreview,
  } = useFontPickerPreviewPipeline({
    disabled,
    onPreviewChange,
    open,
    selectedFont,
    visibleFonts,
  });
  const emitChange = React.useCallback(
    (nextValue: FontPickerValue, meta?: ControlChangeMeta) => {
      onValueChange?.(nextValue, meta);
    },
    [onValueChange],
  );

  React.useEffect(() => {
    setFontSizeDraft(String(normalizedValue.fontSize));
  }, [normalizedValue.fontSize]);

  function commitFontSizeDraft(nextDraft = fontSizeDraft): void {
    const nextSize =
      nextDraft.trim() === ""
        ? normalizedDefaultValue.fontSize
        : normalizeFontPickerFontSize(Number(nextDraft));

    setFontSizeDraft(String(nextSize));

    if (nextSize !== normalizedValue.fontSize) {
      emitChange(
        {
          ...normalizedValue,
          fontSize: nextSize,
        },
        { history: "merge" },
      );
    }
  }

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        prepareForOpen(selectedFont?.category ?? "sans-serif");
      }

      setOpen(nextOpen);

      if (!nextOpen) {
        cancelOpenSelectedScroll();
        clearHoverPreview();
        window.requestAnimationFrame(() => {
          if (document.activeElement === triggerRef.current) {
            triggerRef.current?.blur();
          }
        });
      }
    },
    [
      cancelOpenSelectedScroll,
      clearHoverPreview,
      prepareForOpen,
      selectedFont?.category,
    ],
  );

  const selectedFamily = selectedFont?.family ?? getFontPickerFontById(getDefaultFontPickerFontId())?.family ?? "Inter";
  const fontWeightOptions = getFontPickerWeightOptions(selectedFont);
  const selectedFontPreviewStyle = selectedFont
    ? {
        ...getFontFamilyStyle(selectedFont),
        fontWeight: normalizedValue.fontWeight,
      }
    : undefined;
  const letterSpacingStep = getStepByValue(
    letterSpacingSteps,
    normalizedValue.letterSpacing,
    "normal",
  );
  const letterSpacingStepIndex = getStepIndexByValue(
    letterSpacingSteps,
    normalizedValue.letterSpacing,
    "normal",
  );
  const lineHeightStep = getStepByValue(
    lineHeightSteps,
    normalizedValue.lineHeight,
    "normal",
  );
  const lineHeightStepIndex = getStepIndexByValue(
    lineHeightSteps,
    normalizedValue.lineHeight,
    "normal",
  );

  return (
    <Field className="min-w-0 !gap-y-[9px]">
      <div
        className="grid min-w-0 grid-cols-2 gap-2"
        data-slot="font-picker-family-weight-row"
        ref={familyWeightRowRef}
      >
        <div
          className="min-w-0 space-y-1.5"
          data-slot="font-picker-family-field"
        >
          <ControlFieldLabel>{name}</ControlFieldLabel>
          <Popover onOpenChange={handleOpenChange} open={open}>
            <PopoverTrigger
              data-placeholder-tone="muted"
              data-radius="default"
              data-slot="select-trigger"
              data-size="default"
              data-variant="default"
              render={
                <SelectTriggerButton
                  aria-label={`Select ${name}`}
                  className="w-full justify-between rounded-lg"
                  disabled={disabled}
                  open={open}
                  ref={triggerRef}
                  title={selectedFamily}
                  type="button"
                />
              }
            >
              <span
                className="flex min-w-0 flex-1 text-left"
                data-slot="select-value"
              >
                <ScrollFade
                  className="no-scrollbar min-w-0"
                  containerClassName="min-w-0 flex-1"
                  preset="compact"
                  side="right"
                  watch={[selectedFamily, normalizedValue.fontId]}
                >
                  <span
                    className="block min-w-max whitespace-nowrap pr-2"
                    data-slot="font-picker-trigger-value"
                    style={selectedFontPreviewStyle}
                    title={selectedFamily}
                  >
                    {selectedFamily}
                  </span>
                </ScrollFade>
              </span>
            </PopoverTrigger>
            <FontPickerPopoverContent
              attachScrollViewport={attachScrollViewport}
              bottomSpacerHeight={bottomSpacerHeight}
              category={category}
              clearHoverPreview={clearHoverPreview}
              disabled={disabled}
              filteredFontCount={filteredFonts.length}
              lineHeightSteps={lineHeightSteps}
              lineHeightValueIndex={lineHeightStepIndex}
              letterSpacingSteps={letterSpacingSteps}
              letterSpacingValueIndex={letterSpacingStepIndex}
              onCategoryChange={setCategoryWithReset}
              onFontBlur={clearHoverPreview}
              onFontFocus={(font) => {
                cancelHoverPreviewIntent();
                handleHoverPreview(font);
              }}
              onFontMouseEnter={(font) => scheduleHoverPreviewIntent(font)}
              onFontSelect={(font) => {
                cancelHoverPreviewIntent();
                warmFontPreview(font, "high");
                emitPreviewChange(null, { immediate: true });
                emitChange({
                  ...normalizedValue,
                  fontId: font.id,
                  fontWeight: resolveFontPickerFontWeight(
                    font,
                    normalizedValue.fontWeight,
                  ),
                });
              }}
              onLetterSpacingValueChange={(nextIndex) => {
                const nextStep =
                  letterSpacingSteps[nextIndex] ?? letterSpacingStep;

                emitChange(
                  {
                    ...normalizedValue,
                    letterSpacing: nextStep.value,
                  },
                  { history: "merge" },
                );
              }}
              onLineHeightValueChange={(nextIndex) => {
                const nextStep = lineHeightSteps[nextIndex] ?? lineHeightStep;

                emitChange(
                  {
                    ...normalizedValue,
                    lineHeight: nextStep.value,
                  },
                  { history: "merge" },
                );
              }}
              onQueryChange={setQueryWithReset}
              pinnedSelectedRowSide={pinnedSelectedRowSide}
              popoverWidth={familyWeightRowWidth || undefined}
              query={query}
              scrollToFontIndex={scrollToFontIndex}
              searchInputRef={searchInputRef}
              searchPlaceholder={searchPlaceholder}
              selectedFont={selectedFont}
              selectedFontId={normalizedValue.fontId}
              selectedFontIndex={selectedFontIndex}
              selectedFontPreviewStyle={selectedFontPreviewStyle}
              topSpacerHeight={topSpacerHeight}
              virtualEndIndex={virtualEndIndex}
              virtualStartIndex={virtualStartIndex}
              visibleFonts={visibleFonts}
            />
          </Popover>
        </div>
        <div
          className="min-w-0 space-y-1.5"
          data-slot="font-picker-weight-field"
        >
          <ControlFieldLabel>Weight</ControlFieldLabel>
          <StaticSelect
            ariaLabel="Font weight"
            disabled={disabled || fontWeightOptions.length <= 1}
            onValueChange={(nextWeight) => {
              emitChange(
                {
                  ...normalizedValue,
                  fontWeight: resolveFontPickerFontWeight(
                    selectedFont,
                    nextWeight,
                  ),
                },
                { history: "merge" },
              );
            }}
            options={fontWeightOptions.map((weight) => ({
              label: weight,
              value: weight,
            }))}
            scrollFadeValue={false}
            triggerClassName="min-w-0"
            value={normalizedValue.fontWeight}
          />
        </div>
      </div>
      <div
        className="grid min-w-0 grid-cols-2 gap-2"
        data-slot="font-picker-typography-controls"
      >
        <div className="min-w-0 space-y-1.5" data-slot="font-picker-size-field">
          <ControlFieldLabel>Size</ControlFieldLabel>
          <Input
            aria-label="Font size"
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            disabled={disabled}
            min={minFontPickerFontSizePx}
            onBlur={() => commitFontSizeDraft()}
            onChange={(event) => setFontSizeDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitFontSizeDraft(event.currentTarget.value);
                event.currentTarget.blur();
                return;
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setFontSizeDraft(String(normalizedValue.fontSize));
                event.currentTarget.blur();
              }
            }}
            step={1}
            type="text"
            value={fontSizeDraft}
          />
        </div>
        <div
          className="min-w-0 space-y-1.5"
          data-slot="font-picker-text-case-field"
        >
          <ControlFieldLabel>Case</ControlFieldLabel>
          <StaticSelect
            ariaLabel="Text case"
            disabled={disabled}
            onValueChange={(nextTextCase) => {
              emitChange(
                {
                  ...normalizedValue,
                  textCase: isFontPickerTextCase(nextTextCase)
                    ? nextTextCase
                    : "original",
                },
                { history: "merge" },
              );
            }}
            options={textCaseOptions}
            scrollFadeValue={false}
            value={normalizedValue.textCase}
          />
        </div>
      </div>
      <div className="min-w-0" data-slot="font-picker-color-field">
        <ColorOpacityControl
          hex={normalizedValue.color}
          name="Color"
          onValueChange={(nextColor, meta) => {
            emitChange(
              {
                ...normalizedValue,
                color: nextColor.hex,
                opacity: nextColor.opacity,
              },
              meta ?? { history: "merge" },
            );
          }}
          opacity={normalizedValue.opacity}
          showLabel
        />
      </div>
    </Field>
  );
}
