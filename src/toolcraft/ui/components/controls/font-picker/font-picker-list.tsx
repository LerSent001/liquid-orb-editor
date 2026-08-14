import * as React from "react";
import { CheckIcon } from "@phosphor-icons/react";

import { ScrollFade } from "../../primitives";
import { cn } from "../../../lib/utils";
import type {
  FontPickerFontCatalogEntry,
  FontPickerFontFilterValue,
} from "./font-catalog";
import { getFontFamilyStyle } from "./font-picker-value";

export const fontItemHeightPx = 36;
export const fontItemGapPx = 1;
export const fontVirtualItemStepPx = fontItemHeightPx + fontItemGapPx;
export const fontListOverscanItems = 6;
export const fontListHeightWithFooterPx = 240;
export const fontPreloadBufferAheadItems = 60;
export const fontPreloadBufferBehindItems = 30;

export type FontPickerPinnedSelectedRowSide = "bottom" | "top" | null;

type FontPickerListProps = {
  attachScrollViewport: (node: HTMLDivElement | null) => void;
  bottomSpacerHeight: number;
  category: FontPickerFontFilterValue;
  clearHoverPreview: () => void;
  filteredFontCount: number;
  onFontBlur: () => void;
  onFontFocus: (font: FontPickerFontCatalogEntry) => void;
  onFontMouseEnter: (font: FontPickerFontCatalogEntry) => void;
  onFontSelect: (font: FontPickerFontCatalogEntry) => void;
  pinnedSelectedRowSide: FontPickerPinnedSelectedRowSide;
  query: string;
  scrollToFontIndex: (index: number) => void;
  selectedFont: FontPickerFontCatalogEntry | null | undefined;
  selectedFontId: string;
  selectedFontIndex: number;
  selectedFontPreviewStyle?: React.CSSProperties;
  topSpacerHeight: number;
  virtualEndIndex: number;
  virtualStartIndex: number;
  visibleFonts: readonly FontPickerFontCatalogEntry[];
};

const menuItemInteractionClassName =
  "hover:bg-[color:color-mix(in_oklab,var(--muted-foreground)_10%,transparent)] hover:text-[color:var(--foreground)] focus:bg-[color:color-mix(in_oklab,var(--muted-foreground)_10%,transparent)] focus:text-[color:var(--foreground)]";

export function FontPickerList({
  attachScrollViewport,
  bottomSpacerHeight,
  category,
  clearHoverPreview,
  filteredFontCount,
  onFontBlur,
  onFontFocus,
  onFontMouseEnter,
  onFontSelect,
  pinnedSelectedRowSide,
  query,
  scrollToFontIndex,
  selectedFont,
  selectedFontId,
  selectedFontIndex,
  selectedFontPreviewStyle,
  topSpacerHeight,
  virtualEndIndex,
  virtualStartIndex,
  visibleFonts,
}: FontPickerListProps): React.JSX.Element {
  return (
    <div
      className="relative isolate pb-1"
      onMouseLeave={clearHoverPreview}
    >
      <div className="px-1 pt-1">
        <div className="relative h-60">
          <ScrollFade
            className="toolcraft-scrollbar h-full"
            containerClassName="h-full"
            data-slot="font-picker-list-viewport"
            height={24}
            preset="default"
            showOppositeSide
            side="bottom"
            viewportRef={attachScrollViewport}
            watch={[
              filteredFontCount,
              query,
              category,
              virtualStartIndex,
              virtualEndIndex,
            ]}
          >
            {visibleFonts.length ? (
              <div
                className="flex flex-col gap-px"
                data-slot="font-picker-list"
              >
                {topSpacerHeight > 0 ? (
                  <div
                    aria-hidden
                    style={{ height: `${topSpacerHeight}px` }}
                  />
                ) : null}
                {visibleFonts.map((font) => {
                  const selected = font.id === selectedFontId;

                  return (
                    <button
                      className={cn(
                        "flex min-h-9 w-full items-center justify-between gap-3 rounded-sm px-2.5 text-left text-sm font-normal text-[color:color-mix(in_oklab,var(--foreground)_85%,transparent)] outline-none",
                        menuItemInteractionClassName,
                        selected &&
                          "bg-[color:color-mix(in_oklab,var(--muted-foreground)_5%,transparent)] font-medium text-[color:var(--foreground)] hover:bg-[color:color-mix(in_oklab,var(--muted-foreground)_5%,transparent)] focus:bg-[color:color-mix(in_oklab,var(--muted-foreground)_5%,transparent)]",
                      )}
                      key={font.id}
                      onBlur={onFontBlur}
                      onClick={() => onFontSelect(font)}
                      onFocus={() => onFontFocus(font)}
                      onMouseEnter={() => onFontMouseEnter(font)}
                      type="button"
                    >
                      <span
                        className="min-w-0 truncate text-sm"
                        style={getFontFamilyStyle(font)}
                      >
                        {font.family}
                      </span>
                      {selected ? (
                        <CheckIcon
                          aria-hidden
                          className="size-3.5 shrink-0 text-[color:var(--foreground)]"
                          weight="bold"
                        />
                      ) : null}
                    </button>
                  );
                })}
                {bottomSpacerHeight > 0 ? (
                  <div
                    aria-hidden
                    style={{ height: `${bottomSpacerHeight}px` }}
                  />
                ) : null}
              </div>
            ) : null}
          </ScrollFade>
          {!visibleFonts.length ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-sm px-2 text-center text-xs text-[color:var(--muted-foreground)]">
                No fonts match your search.
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {pinnedSelectedRowSide ? (
        <div
          className={cn(
            "absolute inset-x-0 z-20 overflow-hidden bg-[color:color-mix(in_oklab,var(--popover)_90%,transparent)]",
            pinnedSelectedRowSide === "top"
              ? "top-0 border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]"
              : "bottom-0 border-t border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]",
          )}
        >
          <button
            aria-label={`Jump to selected font ${selectedFont?.family ?? ""}`}
            className={cn(
              "flex min-h-9 w-full items-center justify-between px-[14px] text-left text-sm font-medium text-[color:var(--foreground)] outline-none",
              menuItemInteractionClassName,
            )}
            data-side={pinnedSelectedRowSide}
            data-slot="selected-font-jump-row"
            onClick={() => scrollToFontIndex(selectedFontIndex)}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            <span
              className="min-w-0 flex-1 truncate text-sm"
              style={selectedFontPreviewStyle}
            >
              {selectedFont?.family ?? ""}
            </span>
            <CheckIcon
              aria-hidden
              className="size-3.5 shrink-0"
              weight="bold"
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
