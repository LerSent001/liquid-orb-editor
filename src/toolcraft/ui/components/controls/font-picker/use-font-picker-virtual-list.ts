"use client";

import * as React from "react";

import {
  filterFontPickerFonts,
  type FontPickerFontCatalogEntry,
  type FontPickerFontFilterValue,
} from "./font-catalog";
import { queueFontPickerPreviewLoadBatch } from "./font-preview-loader";
import {
  fontItemHeightPx,
  fontListHeightWithFooterPx,
  fontListOverscanItems,
  fontPreloadBufferAheadItems,
  fontPreloadBufferBehindItems,
  fontVirtualItemStepPx,
  type FontPickerPinnedSelectedRowSide,
} from "./font-picker-list";

export function useFontPickerVirtualList({
  open,
  selectedFont,
}: {
  open: boolean;
  selectedFont?: FontPickerFontCatalogEntry | null;
}): {
  attachScrollViewport: (node: HTMLDivElement | null) => void;
  bottomSpacerHeight: number;
  cancelOpenSelectedScroll: () => void;
  category: FontPickerFontFilterValue;
  filteredFonts: readonly FontPickerFontCatalogEntry[];
  pinnedSelectedRowSide: FontPickerPinnedSelectedRowSide;
  prepareForOpen: (nextCategory: FontPickerFontFilterValue) => void;
  query: string;
  scrollToFontIndex: (index: number) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFontIndex: number;
  setCategoryWithReset: (nextCategory: FontPickerFontFilterValue) => void;
  setQueryWithReset: (nextQuery: string) => void;
  topSpacerHeight: number;
  virtualEndIndex: number;
  virtualStartIndex: number;
  visibleFonts: readonly FontPickerFontCatalogEntry[];
} {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] =
    React.useState<FontPickerFontFilterValue>("sans-serif");
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [scrollViewportElement, setScrollViewportElement] =
    React.useState<HTMLDivElement | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const scrollViewportRef = React.useRef<HTMLDivElement | null>(null);
  const previousScrollTopRef = React.useRef(0);
  const scrollDirectionRef = React.useRef<"backward" | "forward">("forward");
  const shouldScrollSelectedOnOpenRef = React.useRef(false);
  const scrollFrameRef = React.useRef<number | null>(null);

  const filteredFonts = React.useMemo(
    () => filterFontPickerFonts(query, category),
    [category, query],
  );
  const selectedFontIndex = React.useMemo(() => {
    if (!selectedFont) {
      return -1;
    }

    return filteredFonts.findIndex((font) => font.id === selectedFont.id);
  }, [filteredFonts, selectedFont]);
  const resolvedViewportHeight =
    viewportHeight > 0 ? viewportHeight : fontListHeightWithFooterPx;
  const selectedFontTop =
    selectedFontIndex >= 0 ? selectedFontIndex * fontVirtualItemStepPx : 0;
  const selectedFontBottom = selectedFontTop + fontItemHeightPx;
  const selectedFontVisible =
    selectedFontIndex >= 0 &&
    selectedFontBottom > scrollTop &&
    selectedFontTop < scrollTop + resolvedViewportHeight;
  const pinnedSelectedRowSide =
    selectedFont && selectedFontIndex >= 0 && !selectedFontVisible
      ? selectedFontBottom <= scrollTop
        ? "top"
        : "bottom"
      : null;
  const visibleItemCount = Math.max(
    1,
    Math.ceil(resolvedViewportHeight / fontVirtualItemStepPx),
  );
  const virtualStartIndex = Math.max(
    0,
    Math.floor(scrollTop / fontVirtualItemStepPx) - fontListOverscanItems,
  );
  const virtualEndIndex = Math.min(
    filteredFonts.length,
    virtualStartIndex + visibleItemCount + fontListOverscanItems * 2,
  );
  const visibleFonts = React.useMemo(
    () => filteredFonts.slice(virtualStartIndex, virtualEndIndex),
    [filteredFonts, virtualEndIndex, virtualStartIndex],
  );
  const topSpacerHeight = virtualStartIndex * fontVirtualItemStepPx;
  const bottomSpacerHeight = Math.max(
    0,
    (filteredFonts.length - virtualEndIndex) * fontVirtualItemStepPx,
  );

  const resetViewportScroll = React.useCallback(() => {
    const viewportElement = scrollViewportRef.current;
    if (viewportElement) {
      viewportElement.scrollTop = 0;
    }

    previousScrollTopRef.current = 0;
    scrollDirectionRef.current = "forward";
    setScrollTop(0);
  }, []);

  const scrollToFontIndex = React.useCallback((index: number) => {
    if (index < 0 || !scrollViewportRef.current) {
      return;
    }

    const nextScrollTop = index * fontVirtualItemStepPx;
    scrollDirectionRef.current =
      nextScrollTop >= scrollViewportRef.current.scrollTop
        ? "forward"
        : "backward";
    previousScrollTopRef.current = nextScrollTop;
    scrollViewportRef.current.scrollTop = nextScrollTop;
    setScrollTop(nextScrollTop);
  }, []);

  const queueBufferedPreload = React.useCallback(
    (direction: "backward" | "forward") => {
      if (!filteredFonts.length) {
        return;
      }

      const backwardItems =
        direction === "forward"
          ? fontPreloadBufferBehindItems
          : fontPreloadBufferAheadItems;
      const forwardItems =
        direction === "forward"
          ? fontPreloadBufferAheadItems
          : fontPreloadBufferBehindItems;
      const preloadStart = Math.max(0, virtualStartIndex - backwardItems);
      const preloadEnd = Math.min(filteredFonts.length, virtualEndIndex + forwardItems);

      if (preloadStart >= preloadEnd) {
        return;
      }

      queueFontPickerPreviewLoadBatch(filteredFonts.slice(preloadStart, preloadEnd), {
        priority: "normal",
      });
    },
    [filteredFonts, virtualEndIndex, virtualStartIndex],
  );

  const setCategoryWithReset = React.useCallback(
    (nextCategory: FontPickerFontFilterValue) => {
      resetViewportScroll();
      setCategory(nextCategory);
    },
    [resetViewportScroll],
  );

  const setQueryWithReset = React.useCallback(
    (nextQuery: string) => {
      resetViewportScroll();
      setQuery(nextQuery);
    },
    [resetViewportScroll],
  );

  const prepareForOpen = React.useCallback(
    (nextCategory: FontPickerFontFilterValue) => {
      shouldScrollSelectedOnOpenRef.current = true;
      setQuery("");
      setCategory(nextCategory);
      resetViewportScroll();
    },
    [resetViewportScroll],
  );

  const cancelOpenSelectedScroll = React.useCallback(() => {
    shouldScrollSelectedOnOpenRef.current = false;
  }, []);

  const attachScrollViewport = React.useCallback((node: HTMLDivElement | null) => {
    scrollViewportRef.current = node;
    setScrollViewportElement(node);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    queueBufferedPreload(scrollDirectionRef.current);
  }, [open, queueBufferedPreload, scrollTop]);

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    if (!open || !shouldScrollSelectedOnOpenRef.current || selectedFontIndex < 0) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      shouldScrollSelectedOnOpenRef.current = false;
      scrollToFontIndex(selectedFontIndex);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, scrollToFontIndex, selectedFontIndex]);

  React.useEffect(() => {
    if (!open || !scrollViewportElement) {
      return undefined;
    }

    const viewportElement = scrollViewportElement;
    const syncMetrics = () => {
      setViewportHeight(
        viewportElement.clientHeight > 0
          ? viewportElement.clientHeight
          : fontListHeightWithFooterPx,
      );
      setScrollTop(viewportElement.scrollTop);
    };
    const handleScroll = () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        const nextScrollTop = viewportElement.scrollTop;
        scrollDirectionRef.current =
          nextScrollTop >= previousScrollTopRef.current ? "forward" : "backward";
        previousScrollTopRef.current = nextScrollTop;
        setScrollTop(nextScrollTop);
      });
    };

    syncMetrics();
    viewportElement.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", syncMetrics);

    return () => {
      viewportElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", syncMetrics);

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [open, scrollViewportElement]);

  return {
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
  };
}
