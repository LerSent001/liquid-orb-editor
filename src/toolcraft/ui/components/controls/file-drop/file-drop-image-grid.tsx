"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon, XIcon } from "@phosphor-icons/react";

import { cn } from "../../../lib/utils";
import { Button } from "../../primitives";
import {
  FileDropPlusGlyph,
  getImageTransformStyle,
} from "./file-drop-presentation";
import type {
  FileDropPresentationEntry,
  FileDropPresentationItem,
} from "./file-drop-types";

type SortablePreviewTileProps = {
  entry: FileDropPresentationEntry;
  isSortable: boolean;
  onItemRemove?: (item: FileDropPresentationItem, index: number) => void;
  onPreviewSelect?: (itemKey: string) => void;
  selected?: boolean;
};

function SortablePreviewTile({
  entry,
  isSortable,
  onItemRemove,
  onPreviewSelect,
  selected = false,
}: SortablePreviewTileProps): React.JSX.Element {
  const { item, key: itemKey, sourceIndex } = entry;
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } =
    useSortable({
      disabled: !isSortable,
      id: itemKey,
    });
  const sortableTransform = transform
    ? {
        ...transform,
        scaleX: isDragging ? 1.035 : transform.scaleX,
        scaleY: isDragging ? 1.035 : transform.scaleY,
      }
    : null;
  const style: React.CSSProperties = {
    transform: sortableTransform ? CSS.Transform.toString(sortableTransform) : undefined,
    transition,
  };
  const image = (
    <img
      alt={item.alt ?? item.fileName}
      className="size-full object-cover"
      draggable={false}
      height={item.size?.height}
      src={item.previewSrc}
      style={getImageTransformStyle(item.transform)}
      width={item.size?.width}
    />
  );

  return (
    <div
      className={cn(
        "relative aspect-square min-w-0 overflow-hidden rounded-[calc(var(--radius-lg)-4px)] bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] transition-[transform,box-shadow,opacity,border-color] duration-180 ease-out motion-reduce:transition-none",
        isSortable &&
          "will-change-transform hover:shadow-[0_8px_18px_color-mix(in_oklab,var(--background)_30%,transparent)]",
        selected &&
          "ring-2 ring-[color:color-mix(in_oklab,var(--link)_72%,transparent)] ring-offset-2 ring-offset-[color:var(--background)]",
        isDragging &&
          "z-10 cursor-grabbing opacity-90 shadow-[0_12px_24px_color-mix(in_oklab,var(--background)_55%,transparent)]",
      )}
      data-file-upload-preview-key={itemKey}
      data-preview-dragging={isDragging ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-slot="file-upload-preview-item"
      ref={setNodeRef}
      style={style}
    >
      {onPreviewSelect ? (
        <button
          aria-label={`Select ${item.alt ?? item.fileName}`}
          aria-pressed={selected}
          className="absolute inset-0 block size-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-inset"
          onClick={() => {
            onPreviewSelect(itemKey);
          }}
          type="button"
        >
          {image}
        </button>
      ) : (
        <div className="absolute inset-0 size-full">
          {image}
        </div>
      )}
      {isSortable ? (
        <button
          aria-label={`Reorder ${item.alt ?? item.fileName}`}
          className="absolute top-0.5 left-0.5 z-[1] flex size-7 cursor-grab touch-none items-center justify-center rounded-sm border-0 bg-[color:color-mix(in_oklab,var(--background)_62%,transparent)] p-0 text-[color:color-mix(in_oklab,var(--foreground)_70%,transparent)] backdrop-blur-sm active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
          type="button"
          {...attributes}
          {...listeners}
        >
          <DotsSixVerticalIcon aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
      {onItemRemove ? (
        <Button
          aria-label={`Remove ${item.alt ?? item.fileName}`}
          className="absolute top-0.5 right-0.5"
          onClick={() => {
            onItemRemove(item, sourceIndex);
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <XIcon className="drop-shadow-[0_2px_1px_color-mix(in_oklab,var(--background)_80%,transparent)]" />
        </Button>
      ) : null}
    </div>
  );
}

type FileDropImageGridProps = {
  isSortable: boolean;
  onAddImages: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onItemRemove?: (item: FileDropPresentationItem, index: number) => void;
  onPreviewSelect?: (itemKey: string) => void;
  previewEntries: readonly FileDropPresentationEntry[];
  previewKeys: string[];
  selectedPreviewKey: string | null;
  sensors: React.ComponentProps<typeof DndContext>["sensors"];
};

export function FileDropImageGrid({
  isSortable,
  onAddImages,
  onDragEnd,
  onItemRemove,
  onPreviewSelect,
  previewEntries,
  previewKeys,
  selectedPreviewKey,
  sensors,
}: FileDropImageGridProps): React.JSX.Element {
  return (
    <div className="grid w-full grid-cols-4 gap-2" data-slot="file-upload-preview-grid">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        sensors={sensors}
      >
        <SortableContext items={previewKeys} strategy={rectSortingStrategy}>
          {previewEntries.map((entry) => (
            <SortablePreviewTile
              entry={entry}
              isSortable={isSortable}
              key={entry.key}
              onItemRemove={onItemRemove}
              onPreviewSelect={onPreviewSelect}
              selected={selectedPreviewKey === entry.key}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        aria-label="Add image files"
        className="flex aspect-square min-w-0 items-center justify-center rounded-[calc(var(--radius-lg)-4px)] border border-[color:color-mix(in_oklab,var(--border)_5%,transparent)] bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[color:color-mix(in_oklab,var(--foreground)_65%,transparent)] transition-[background-color,border-color,color] duration-150 ease-out hover:border-[color:color-mix(in_oklab,var(--border)_8%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_9%,transparent)] hover:text-[color:var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
        data-slot="file-upload-add-preview"
        onClick={(event) => {
          event.stopPropagation();
          onAddImages();
        }}
        type="button"
      >
        <FileDropPlusGlyph className="size-3.5" />
      </button>
    </div>
  );
}
