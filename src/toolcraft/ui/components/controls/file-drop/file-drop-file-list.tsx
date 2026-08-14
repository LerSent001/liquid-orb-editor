"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PaperclipIcon, XIcon } from "@phosphor-icons/react";

import { cn } from "../../../lib/utils";
import { Button } from "../../primitives";
import { FileDropPlusGlyph } from "./file-drop-presentation";
import type {
  FileDropPresentationEntry,
  FileDropPresentationItem,
} from "./file-drop-types";

type SortableFileRowProps = {
  entry: FileDropPresentationEntry;
  isSortable: boolean;
  onItemActivate?: () => void;
  onItemRemove?: (item: FileDropPresentationItem, index: number) => void;
};

function SortableFileRow({
  entry,
  isSortable,
  onItemActivate,
  onItemRemove,
}: SortableFileRowProps): React.JSX.Element {
  const { item, key: itemKey, sourceIndex } = entry;
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } =
    useSortable({
      disabled: !isSortable,
      id: itemKey,
    });
  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };
  const fileName = item.fileName ?? item.alt ?? "Untitled file";
  const content = (
    <>
      <PaperclipIcon
        aria-hidden="true"
        className="size-4 flex-none text-[color:color-mix(in_oklab,var(--foreground)_48%,transparent)]"
        weight="regular"
      />
      <span
        className="min-w-0 flex-1 overflow-hidden text-xs whitespace-nowrap [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-20px),transparent)] [mask-image:linear-gradient(to_right,black_calc(100%-20px),transparent)]"
        title={fileName}
      >
        {fileName}
      </span>
    </>
  );
  const contentClassName = cn(
    "flex h-full min-w-0 flex-1 items-center gap-2 border-0 bg-transparent pl-[7px] text-left text-sm text-[color:color-mix(in_oklab,var(--foreground)_86%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-inset",
    isSortable && "cursor-grab touch-none select-none active:cursor-grabbing",
  );

  return (
    <div
      className={cn(
        "mx-1 flex h-8 min-w-0 items-center pr-1 transition-[background-color,opacity,transform] duration-150 ease-out hover:bg-[color:color-mix(in_oklab,var(--foreground)_3%,transparent)] motion-reduce:transition-none",
        isDragging &&
          "z-10 bg-[color:color-mix(in_oklab,var(--foreground)_5%,transparent)] opacity-90",
      )}
      data-file-upload-preview-key={itemKey}
      data-preview-dragging={isDragging ? "true" : undefined}
      data-slot="file-upload-file-item"
      ref={setNodeRef}
      style={style}
    >
      {isSortable || onItemActivate ? (
        <button
          aria-label={isSortable ? `Reorder ${fileName}` : `Replace ${fileName}`}
          className={contentClassName}
          onClick={onItemActivate}
          type="button"
          {...(isSortable ? attributes : {})}
          {...(isSortable ? listeners : {})}
        >
          {content}
        </button>
      ) : (
        <div className={contentClassName}>
          {content}
        </div>
      )}
      {onItemRemove ? (
        <Button
          aria-label={`Remove ${fileName}`}
          className="flex-none"
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

type FileDropFileListProps = {
  isSortable: boolean;
  onAddFile?: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onItemActivate?: () => void;
  onItemRemove?: (item: FileDropPresentationItem, index: number) => void;
  previewEntries: readonly FileDropPresentationEntry[];
  previewKeys: string[];
  sensors: React.ComponentProps<typeof DndContext>["sensors"];
};

export function FileDropFileList({
  isSortable,
  onAddFile,
  onDragEnd,
  onItemActivate,
  onItemRemove,
  previewEntries,
  previewKeys,
  sensors,
}: FileDropFileListProps): React.JSX.Element {
  return (
    <div className="w-full" data-slot="file-upload-file-list">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        sensors={sensors}
      >
        <SortableContext items={previewKeys} strategy={verticalListSortingStrategy}>
          {previewEntries.map((entry, index) => (
            <React.Fragment key={entry.key}>
              <SortableFileRow
                entry={entry}
                isSortable={isSortable}
                onItemActivate={onItemActivate}
                onItemRemove={onItemRemove}
              />
              {index < previewEntries.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="mx-1 h-px bg-[color:color-mix(in_oklab,var(--border)_5%,transparent)]"
                  data-slot="file-upload-file-divider"
                />
              ) : null}
            </React.Fragment>
          ))}
        </SortableContext>
      </DndContext>
      {onAddFile ? (
        <button
          aria-label="Add a new file"
          className="mx-1 box-border flex h-8 w-[calc(100%-0.5rem)] min-w-0 shrink-0 items-center justify-center gap-1.5 px-1 text-xs text-[color:color-mix(in_oklab,var(--foreground)_65%,transparent)] transition-[background-color,color] duration-150 ease-out hover:bg-[color:color-mix(in_oklab,var(--foreground)_3%,transparent)] hover:text-[color:var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
          data-slot="file-upload-add-file"
          onClick={(event) => {
            event.stopPropagation();
            onAddFile();
          }}
          type="button"
        >
          <FileDropPlusGlyph className="size-3.5" />
          <span className="font-medium">Add a new file</span>
        </button>
      ) : null}
    </div>
  );
}
