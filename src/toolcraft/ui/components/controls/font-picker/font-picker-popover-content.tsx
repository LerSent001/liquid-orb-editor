import * as React from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import {
  Input,
  PopoverContent,
} from "../../primitives";
import { cn } from "../../../lib/utils";
import {
  FONT_PICKER_FILTER_OPTIONS,
  type FontPickerFontCatalogEntry,
  type FontPickerFontFilterValue,
} from "./font-catalog";
import {
  FontPickerList,
  type FontPickerPinnedSelectedRowSide,
} from "./font-picker-list";
import {
  FontPickerFooterControl,
  LetterSpacingIcon,
  LineHeightIcon,
} from "./font-picker-footer";

type FontPickerStep = {
  label: string;
  numericValue: number;
  value: string;
};

type FontPickerPopoverContentProps = {
  attachScrollViewport: (node: HTMLDivElement | null) => void;
  bottomSpacerHeight: number;
  category: FontPickerFontFilterValue;
  clearHoverPreview: () => void;
  disabled: boolean;
  filteredFontCount: number;
  lineHeightSteps: readonly FontPickerStep[];
  lineHeightValueIndex: number;
  letterSpacingSteps: readonly FontPickerStep[];
  letterSpacingValueIndex: number;
  onCategoryChange: (nextCategory: FontPickerFontFilterValue) => void;
  onFontBlur: () => void;
  onFontFocus: (font: FontPickerFontCatalogEntry) => void;
  onFontMouseEnter: (font: FontPickerFontCatalogEntry) => void;
  onFontSelect: (font: FontPickerFontCatalogEntry) => void;
  onLetterSpacingValueChange: (nextIndex: number) => void;
  onLineHeightValueChange: (nextIndex: number) => void;
  onQueryChange: (nextQuery: string) => void;
  pinnedSelectedRowSide: FontPickerPinnedSelectedRowSide;
  popoverWidth?: number;
  query: string;
  scrollToFontIndex: (index: number) => void;
  searchInputRef: React.Ref<HTMLInputElement>;
  searchPlaceholder: string;
  selectedFont: FontPickerFontCatalogEntry | null | undefined;
  selectedFontId: string;
  selectedFontIndex: number;
  selectedFontPreviewStyle?: React.CSSProperties;
  topSpacerHeight: number;
  virtualEndIndex: number;
  virtualStartIndex: number;
  visibleFonts: readonly FontPickerFontCatalogEntry[];
};

export function FontPickerPopoverContent({
  attachScrollViewport,
  bottomSpacerHeight,
  category,
  clearHoverPreview,
  disabled,
  filteredFontCount,
  lineHeightSteps,
  lineHeightValueIndex,
  letterSpacingSteps,
  letterSpacingValueIndex,
  onCategoryChange,
  onFontBlur,
  onFontFocus,
  onFontMouseEnter,
  onFontSelect,
  onLetterSpacingValueChange,
  onLineHeightValueChange,
  onQueryChange,
  pinnedSelectedRowSide,
  popoverWidth,
  query,
  scrollToFontIndex,
  searchInputRef,
  searchPlaceholder,
  selectedFont,
  selectedFontId,
  selectedFontIndex,
  selectedFontPreviewStyle,
  topSpacerHeight,
  virtualEndIndex,
  virtualStartIndex,
  visibleFonts,
}: FontPickerPopoverContentProps): React.JSX.Element {
  return (
    <PopoverContent
      align="start"
      className="w-(--anchor-width) gap-0 overflow-hidden rounded-lg border border-[color:color-mix(in_oklab,var(--border)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--popover)_88%,transparent)] p-0 text-[color:var(--popover-foreground)] shadow-sm backdrop-blur-[12.5px]"
      finalFocus={false}
      sideOffset={6}
      style={popoverWidth ? { width: popoverWidth } : undefined}
    >
      <div>
        <div className="border-b border-[color:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)]">
          <div className="relative h-10">
            <MagnifyingGlassIcon
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[color:var(--muted-foreground)]"
            />
            <Input
              ref={searchInputRef}
              className="h-10 border-none bg-transparent pl-[34px] text-[13px] font-normal focus-visible:bg-transparent focus-visible:ring-0"
              name="font-search"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={searchPlaceholder}
              type="text"
              value={query}
            />
          </div>
        </div>
        <div className="relative before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-[color:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)]">
          <div className="flex h-10 w-full items-center justify-between overflow-x-hidden px-3">
            {FONT_PICKER_FILTER_OPTIONS.map((option) => {
              const active = category === option.value;

              return (
                <button
                  className={cn(
                    "relative z-10 h-10 shrink-0 px-0 text-xs font-normal leading-none tracking-normal text-[color:var(--muted-foreground)] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[color:var(--foreground)] after:opacity-0 after:transition-opacity after:duration-200 after:ease-in-out after:content-[''] hover:text-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]",
                    active &&
                      "text-[color:var(--foreground)] after:opacity-100",
                  )}
                  data-state={active ? "active" : "inactive"}
                  key={option.value}
                  onClick={() => onCategoryChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <FontPickerList
        attachScrollViewport={attachScrollViewport}
        bottomSpacerHeight={bottomSpacerHeight}
        category={category}
        clearHoverPreview={clearHoverPreview}
        filteredFontCount={filteredFontCount}
        onFontBlur={onFontBlur}
        onFontFocus={onFontFocus}
        onFontMouseEnter={onFontMouseEnter}
        onFontSelect={onFontSelect}
        pinnedSelectedRowSide={pinnedSelectedRowSide}
        query={query}
        scrollToFontIndex={scrollToFontIndex}
        selectedFont={selectedFont}
        selectedFontId={selectedFontId}
        selectedFontIndex={selectedFontIndex}
        selectedFontPreviewStyle={selectedFontPreviewStyle}
        topSpacerHeight={topSpacerHeight}
        virtualEndIndex={virtualEndIndex}
        virtualStartIndex={virtualStartIndex}
        visibleFonts={visibleFonts}
      />
      <div className="flex h-11 shrink-0 items-center gap-5 border-t border-[color:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)] px-3.5">
        <FontPickerFooterControl
          disabled={disabled}
          icon={<LetterSpacingIcon />}
          onValueChange={onLetterSpacingValueChange}
          steps={letterSpacingSteps}
          title="Letter spacing"
          valueIndex={letterSpacingValueIndex}
        />
        <FontPickerFooterControl
          disabled={disabled}
          icon={<LineHeightIcon />}
          onValueChange={onLineHeightValueChange}
          steps={lineHeightSteps}
          title="Line height"
          valueIndex={lineHeightValueIndex}
        />
      </div>
    </PopoverContent>
  );
}
