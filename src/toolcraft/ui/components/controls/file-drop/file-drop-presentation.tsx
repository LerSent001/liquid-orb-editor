"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";
import type {
  ActionControlObjectOption,
  ActionControlOption,
  ActionsControlItemState,
} from "../actions/actions-control";
import type {
  FileDropAssetKind,
  FileDropImageSize,
  FileDropImageTransform,
  FileDropImageTransformOperation,
  FileDropPresentation,
  FileDropPresentationAction,
  FileDropPresentationEntry,
  FileDropPresentationItem,
  FileDropPreview,
} from "./file-drop-types";

export const singleImagePreviewMaxHeight = 196;

export function isDragLeavingCurrentTarget(
  event: React.DragEvent<HTMLElement>,
): boolean {
  const nextTarget = event.relatedTarget;

  return !(
    nextTarget instanceof Node && event.currentTarget.contains(nextTarget)
  );
}

export function createFileDropTargetHandlers({
  enabled,
  onDragOverChange,
  onFiles,
}: Readonly<{
  enabled: boolean;
  onDragOverChange: (active: boolean) => void;
  onFiles: (files: FileList | readonly File[] | undefined) => void;
}>): React.HTMLAttributes<HTMLDivElement> {
  if (!enabled) {
    return {};
  }

  return {
    onDragEnter: (event) => {
      event.preventDefault();
      onDragOverChange(true);
    },
    onDragLeave: (event) => {
      if (isDragLeavingCurrentTarget(event)) {
        onDragOverChange(false);
      }
    },
    onDragOver: (event) => {
      event.preventDefault();
      onDragOverChange(true);
    },
    onDrop: (event) => {
      event.preventDefault();
      onDragOverChange(false);
      onFiles(event.dataTransfer?.files);
    },
  };
}

export function getFileInputAccept(accept: string): string {
  return accept
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .flatMap((part) => {
      switch (part) {
        case "gif":
          return [".gif", "image/gif"];
        case "heic":
          return [".heic", "image/heic"];
        case "heif":
          return [".heif", "image/heif"];
        case "jpg":
        case "jpeg":
          return [".jpg", ".jpeg", "image/jpeg"];
        case "png":
          return [".png", "image/png"];
        case "svg":
          return [".svg", "image/svg+xml"];
        case "tif":
        case "tiff":
          return [".tif", ".tiff", "image/tiff"];
        case "webp":
          return [".webp", "image/webp"];
        default:
          return part.startsWith(".") || part.includes("/") ? [part] : [];
      }
    })
    .join(",");
}

export function normalizeImageRotation(
  rotationDeg: number | undefined,
): 0 | 90 | 180 | 270 {
  const normalized =
    (((Math.round((rotationDeg ?? 0) / 90) * 90) % 360) + 360) % 360;

  return normalized === 90 || normalized === 180 || normalized === 270
    ? normalized
    : 0;
}

export function getImageTransformStyle(
  transform: FileDropImageTransform | undefined,
  options: { center?: boolean; includeRotation?: boolean } = {},
): React.CSSProperties {
  const rotationDeg = normalizeImageRotation(transform?.rotationDeg);
  const scaleX = transform?.flipHorizontal ? -1 : 1;
  const scaleY = transform?.flipVertical ? -1 : 1;
  const transformSteps: string[] = [];

  if (options.center) {
    transformSteps.push("translate(-50%, -50%)");
  }

  if (options.includeRotation !== false && rotationDeg !== 0) {
    transformSteps.push(`rotate(${rotationDeg}deg)`);
  }

  if (scaleX !== 1 || scaleY !== 1) {
    transformSteps.push(`scale(${scaleX}, ${scaleY})`);
  }

  if (transformSteps.length === 0) {
    return {};
  }

  return {
    transform: transformSteps.join(" "),
  };
}

export function getPreviewFrameStyle(
  size: FileDropImageSize | undefined,
): React.CSSProperties {
  if (!size || size.height <= 0 || size.width <= 0) {
    return { width: "100%" };
  }

  return {
    aspectRatio: `${size.width} / ${size.height}`,
    maxHeight: `${singleImagePreviewMaxHeight}px`,
    width: "100%",
  };
}

export function isPreviewQuarterTurn(
  transform?: FileDropImageTransform,
): boolean {
  const rotationDeg = normalizeImageRotation(transform?.rotationDeg);

  return rotationDeg === 90 || rotationDeg === 270;
}

export function getPreviewImageStyle(
  size: FileDropImageSize | undefined,
  transform?: FileDropImageTransform,
): React.CSSProperties {
  const rotationDeg = normalizeImageRotation(transform?.rotationDeg);
  const rotatedQuarterTurn = rotationDeg === 90 || rotationDeg === 270;
  const rotatedWidth =
    size && size.height > 0 && size.width > 0 && rotatedQuarterTurn
      ? `${(Math.min(size.width / size.height, size.height / size.width) * 100).toFixed(4)}%`
      : "100%";

  return {
    ...getImageTransformStyle(transform, { center: true }),
    ...(rotatedQuarterTurn ? { width: rotatedWidth } : {}),
  };
}

export function getPreviewKey(item: FileDropPreview, index: number): string {
  return item.id ?? `${item.src}:${index}`;
}

export function getPresentationItemKey(
  item: FileDropPresentationItem,
  _index: number,
): string {
  return item.id;
}

export function createFileDropItemView(
  presentation: FileDropPresentation<string, unknown, unknown>,
  requiresPreviewSource: boolean,
): Readonly<{
  entries: readonly FileDropPresentationEntry[];
  hasContent: boolean;
  isListPresenter: boolean;
  itemKeys: string[];
  items: readonly FileDropPresentationItem[];
}> {
  const entries: readonly FileDropPresentationEntry[] =
    presentation.items.flatMap((item, sourceIndex) =>
      requiresPreviewSource && !item.previewSrc
        ? []
        : [
            {
              item,
              key: getPresentationItemKey(item, sourceIndex),
              sourceIndex,
            },
          ],
    );

  return {
    entries,
    hasContent: entries.length > 0,
    isListPresenter:
      presentation.presenter === "file-list" ||
      presentation.presenter === "model-item",
    itemKeys: entries.map((entry) => entry.key),
    items: entries.map((entry) => entry.item),
  };
}

export function createFileDropActionModel(
  actions: readonly FileDropPresentationAction[],
  enabled: boolean,
): Readonly<{
  options: readonly ActionControlObjectOption[];
  states: Readonly<Record<string, ActionsControlItemState>>;
}> {
  return {
    options: actions.map(({ state: _state, ...action }) => action),
    states: actions.reduce<Record<string, ActionsControlItemState>>(
      (states, action) => {
        if (!enabled) {
          states[action.value] = { ...action.state, disabled: true };
        } else if (action.state) {
          states[action.value] = action.state;
        }

        return states;
      },
      {},
    ),
  };
}

export function reorderFileDropPresentationItems<AssetKind extends string>(
  items: readonly FileDropPresentationItem<AssetKind>[],
  visibleEntries: readonly FileDropPresentationEntry<AssetKind>[],
  activeKey: string,
  overKey: string,
): FileDropPresentationItem<AssetKind>[] | null {
  const activeIndex = visibleEntries.findIndex(
    (entry) => entry.key === activeKey,
  );
  const overIndex = visibleEntries.findIndex((entry) => entry.key === overKey);

  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return null;
  }

  const reorderedEntries = [...visibleEntries];
  const [movedEntry] = reorderedEntries.splice(activeIndex, 1);

  if (!movedEntry) {
    return null;
  }

  reorderedEntries.splice(overIndex, 0, movedEntry);
  const visibleSourceIndices = visibleEntries
    .map((entry) => entry.sourceIndex)
    .sort((left, right) => left - right);
  const reorderedItems = [...items];

  reorderedEntries.forEach((entry, index) => {
    const sourceIndex = visibleSourceIndices[index];

    if (sourceIndex !== undefined) {
      reorderedItems[sourceIndex] = entry.item;
    }
  });

  return reorderedItems;
}

type LegacyFileDropPresentationInput = {
  accept?: string;
  assetKind: FileDropAssetKind;
  multiple: boolean;
  preview?: FileDropPreview;
  previews?: readonly FileDropPreview[];
};

export type LegacyFileDropPresentation = {
  dropTargetLabel: string;
  previews: readonly FileDropPreview[];
  presentation: FileDropPresentation<FileDropAssetKind, never, never>;
};

export function createLegacyFileDropPresentation({
  accept = "",
  assetKind,
  multiple,
  preview,
  previews,
}: LegacyFileDropPresentationInput): LegacyFileDropPresentation {
  const previewItems = previews ?? (preview ? [preview] : []);
  const items = previewItems.map(
    (item, index): FileDropPresentationItem<FileDropAssetKind> => ({
      alt: item.alt,
      assetKind: item.assetKind ?? assetKind,
      fileName:
        item.fileName ??
        item.alt ??
        (assetKind === "file" ? "Untitled file" : "Untitled image"),
      id: getPreviewKey(item, index),
      previewSrc: item.src,
      size: item.size,
      transform: item.transform,
    }),
  );
  const hasContent = previewItems.some((item) => Boolean(item.src));
  const presenter =
    assetKind === "file"
      ? "file-list"
      : multiple && items.length > 1
        ? "image-grid"
        : "single-image";
  const emptyTitle =
    assetKind === "file"
      ? "Click to upload a file"
      : "Click to upload an image";
  const dropTargetLabel = hasContent
    ? multiple
      ? assetKind === "file"
        ? "Drop files"
        : "Drop image files"
      : assetKind === "file"
        ? "Replace file"
        : "Replace image file"
    : multiple
      ? assetKind === "file"
        ? "Browse files"
        : "Browse image files"
      : assetKind === "file"
        ? "Browse file"
        : "Browse image file";

  return {
    dropTargetLabel,
    previews: previewItems,
    presentation: {
      accept,
      allowsFileBatch: multiple,
      allowsFolderSelection: false,
      emptyDescription: "or drag it onto the canvas",
      emptyTitle,
      items,
      presenter,
      secondaryActions: [],
    },
  };
}

export function FileDropPlusGlyph({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={cn("flex-none", className)}
      fill="none"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 2.5V11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
      />
      <path
        d="M2.5 7H11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
      />
    </svg>
  );
}

export const imageTransformActions = [
  {
    ariaLabel: "90° Right",
    icon: "rotate-cw",
    label: "90°",
    value: "rotate-right",
  },
  {
    ariaLabel: "Flip horizontal",
    icon: "flip-horizontal",
    label: "Flip H",
    value: "flip-horizontal",
  },
  {
    ariaLabel: "Flip vertical",
    icon: "flip-vertical",
    label: "Flip V",
    value: "flip-vertical",
  },
] satisfies readonly (ActionControlOption & {
  value: FileDropImageTransformOperation;
})[];
