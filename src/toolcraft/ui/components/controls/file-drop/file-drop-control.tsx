"use client";

import * as React from "react";
import {
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { cn } from "../../../lib/utils";
import { ActionsControl } from "../actions/actions-control";
import { Field } from "../../primitives";
import { FileDropCollectionControl } from "./file-drop-collection-control";
import { FileDropEmptyState } from "./file-drop-empty-state";
import { FileDropFileList } from "./file-drop-file-list";
import { FileDropFolderInput } from "./file-drop-folder-input";
import { FileDropImageGrid } from "./file-drop-image-grid";
import { FileDropPresentationMessages } from "./file-drop-presentation-messages";
import {
  createLegacyFileDropPresentation,
  createFileDropActionModel,
  createFileDropItemView,
  createFileDropTargetHandlers,
  getFileInputAccept,
  getPresentationItemKey,
  getPreviewKey,
  imageTransformActions,
  reorderFileDropPresentationItems,
} from "./file-drop-presentation";
import { FileDropSinglePreview } from "./file-drop-single-preview";
import type {
  FileDropAssetKind,
  FileDropControlProps,
  FileDropImageTransformOperation,
  FileDropPresentation,
  FileDropPresentationItem,
  FileDropPreview,
} from "./file-drop-types";

function FileDropControlBase<
  AssetKind extends string = FileDropAssetKind,
  Feedback = unknown,
  Status = unknown,
>({
  accept,
  assetKind = "image",
  collectionActions,
  collectionSlot = false,
  multiple = false,
  onAction,
  onClear,
  onFileSelect,
  onFilesSelect,
  onFolderSelect,
  onItemRemove,
  onItemSelect,
  onItemsReorder,
  onPreviewRemove,
  onPreviewReorder,
  onPreviewTransform,
  presentation: providedPresentation,
  preview,
  previews,
}: FileDropControlProps<AssetKind, Feedback, Status> & {
  collectionSlot?: boolean;
}): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [selectedItemKey, setSelectedItemKey] = React.useState<string | null>(
    null,
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const legacy = createLegacyFileDropPresentation({
    accept,
    assetKind,
    multiple,
    preview,
    previews,
  });
  const usesLegacyPresentation = providedPresentation === undefined;
  const presentation = (providedPresentation ??
    legacy.presentation) as FileDropPresentation<string, unknown, unknown>;
  const isImagePresenter =
    presentation.presenter === "image-grid" ||
    presentation.presenter === "single-image";
  const requiresPreviewSource = usesLegacyPresentation || isImagePresenter;
  const {
    entries: itemEntries,
    hasContent,
    isListPresenter,
    itemKeys,
    items: renderableItems,
  } = createFileDropItemView(presentation, requiresPreviewSource);
  const isAttachedCollectionSlot = collectionSlot && hasContent;
  const showsListCardinalityActions = !collectionSlot;
  const legacyPreviewByKey = new Map<string, FileDropPreview>(
    legacy.previews.map((item, index) => [getPreviewKey(item, index), item]),
  );
  const canSelectImageItem = usesLegacyPresentation
    ? Boolean(onPreviewTransform)
    : Boolean(onItemSelect);
  const requiresItemSelection =
    presentation.presenter === "image-grid" &&
    itemEntries.length > 1 &&
    canSelectImageItem;
  const selectedItemEntry = requiresItemSelection
    ? itemEntries.find((entry) => entry.key === selectedItemKey)
    : itemEntries[0];
  const shouldRenderLegacyImageActions =
    usesLegacyPresentation &&
    (presentation.presenter === "image-grid" ||
      presentation.presenter === "single-image") &&
    hasContent &&
    Boolean(onPreviewTransform) &&
    Boolean(selectedItemEntry) &&
    (!requiresItemSelection || selectedItemKey !== null);
  const secondaryActions = shouldRenderLegacyImageActions
    ? imageTransformActions
    : presentation.secondaryActions;
  const actionModel = createFileDropActionModel(
    secondaryActions,
    Boolean(shouldRenderLegacyImageActions || onAction),
  );
  const hasReorderHandler = usesLegacyPresentation
    ? Boolean(onPreviewReorder)
    : Boolean(onItemsReorder);
  const canRemoveCollectionItem = usesLegacyPresentation
    ? Boolean(onPreviewRemove)
    : Boolean(onItemRemove || (onClear && renderableItems.length === 1));
  const dropTargetHandlers = createFileDropTargetHandlers({
    enabled: !isAttachedCollectionSlot,
    onDragOverChange: setDragOver,
    onFiles: handleFiles,
  });

  if (
    !usesLegacyPresentation &&
    onItemsReorder &&
    presentation.presenter !== "file-list" &&
    presentation.presenter !== "image-grid"
  ) {
    throw new Error(
      `FileDrop presenter "${presentation.presenter}" does not support item reordering.`,
    );
  }

  React.useEffect(() => {
    if (!selectedItemKey) {
      return;
    }

    if (!requiresItemSelection || !itemKeys.includes(selectedItemKey)) {
      setSelectedItemKey(null);
    }
  }, [itemKeys, requiresItemSelection, selectedItemKey]);

  function handleFiles(fileList: FileList | readonly File[] | undefined): void {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      return;
    }

    if (!usesLegacyPresentation) {
      onFilesSelect?.(files);
      return;
    }

    if (presentation.allowsFileBatch) {
      if (onFilesSelect) {
        onFilesSelect(files);
        return;
      }

      files.forEach((file) => onFileSelect?.(file));
      return;
    }

    onFileSelect?.(files[0]);
  }

  function openFileDialog(): void {
    inputRef.current?.click();
  }

  function openFolderDialog(): void {
    folderInputRef.current?.click();
  }

  function handleItemDragEnd(event: DragEndEvent): void {
    const activeKey = String(event.active.id);
    const overKey = event.over ? String(event.over.id) : null;

    if (!hasReorderHandler || !overKey || activeKey === overKey) {
      return;
    }

    const orderedPresentationItems = reorderFileDropPresentationItems(
      presentation.items,
      itemEntries,
      activeKey,
      overKey,
    );

    if (!orderedPresentationItems) {
      return;
    }

    if (usesLegacyPresentation) {
      const orderedPreviews = orderedPresentationItems.flatMap(
        (item, index) => {
          const key = getPresentationItemKey(item, index);
          const legacyPreview = legacyPreviewByKey.get(key);

          return legacyPreview ? [legacyPreview] : [];
        },
      );

      if (orderedPreviews.length === legacy.previews.length) {
        onPreviewReorder?.(orderedPreviews);
      }
      return;
    }

    onItemsReorder?.(
      orderedPresentationItems as FileDropPresentationItem<AssetKind>[],
    );
  }

  function handleCollectionItemRemove(
    item: FileDropPresentationItem,
    index: number,
  ): void {
    if (usesLegacyPresentation) {
      const legacyPreview = legacyPreviewByKey.get(
        getPresentationItemKey(item, index),
      );

      if (legacyPreview) {
        onPreviewRemove?.(legacyPreview, index);
      }
      return;
    }

    if (onItemRemove) {
      onItemRemove(item as FileDropPresentationItem<AssetKind>, index);
      return;
    }

    if (renderableItems.length === 1) {
      onClear?.();
    }
  }

  function handleSingleItemRemove(): void {
    const entry = itemEntries[0];

    if (usesLegacyPresentation) {
      onClear?.();
      return;
    }

    if (entry && onItemRemove) {
      onItemRemove(
        entry.item as FileDropPresentationItem<AssetKind>,
        entry.sourceIndex,
      );
      return;
    }

    onClear?.();
  }

  function runLegacyImageTransform(
    operation: FileDropImageTransformOperation,
  ): void {
    if (!selectedItemEntry) {
      return;
    }

    const legacyPreview = legacyPreviewByKey.get(selectedItemEntry.key);

    if (legacyPreview) {
      onPreviewTransform?.(legacyPreview, operation);
    }
  }

  function handleSecondaryAction(value: string): void {
    if (shouldRenderLegacyImageActions) {
      runLegacyImageTransform(value as FileDropImageTransformOperation);
      return;
    }

    onAction?.(value);
  }

  if (collectionActions) {
    return (
      <FileDropCollectionControl
        actions={collectionActions}
        canRemoveAttachedItem={canRemoveCollectionItem}
        entries={itemEntries}
        onFilesSelect={onFilesSelect}
        onRemoveAttachedItem={handleCollectionItemRemove}
        presentation={presentation}
        SlotControl={FileDropControlBase}
      />
    );
  }

  return (
    <Field className="min-w-0" style={{ gap: "6px" }}>
      <input
        accept={getFileInputAccept(presentation.accept)}
        aria-label={presentation.emptyTitle}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.currentTarget.files ?? undefined);
          event.currentTarget.value = "";
        }}
        multiple={presentation.allowsFileBatch}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      {presentation.allowsFolderSelection ? (
        <FileDropFolderInput
          ariaLabel={`${presentation.emptyTitle} folder`}
          inputRef={folderInputRef}
          onFilesSelect={onFolderSelect}
        />
      ) : null}
      <div
        aria-label={
          usesLegacyPresentation
            ? legacy.dropTargetLabel
            : `${presentation.emptyTitle}. ${presentation.emptyDescription}`
        }
        className={cn(
          "group/file-upload relative flex min-h-16 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[color:color-mix(in_oklab,var(--border)_18%,transparent)] bg-[color:color-mix(in_oklab,var(--foreground)_3%,transparent)] text-center shadow-none transition-[background-color,border-color,box-shadow] duration-150 ease-out data-[drag-over=true]:border-[color:color-mix(in_oklab,var(--link)_28%,transparent)] data-[drag-over=true]:bg-[color:color-mix(in_oklab,var(--link)_13%,transparent)] data-[drag-over=true]:shadow-none",
          !isListPresenter &&
            "hover:border-[color:color-mix(in_oklab,var(--border)_35%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]",
          hasContent
            ? isListPresenter
              ? "overflow-hidden p-1.5"
              : "overflow-hidden p-2"
            : "p-0",
        )}
        data-drag-over={dragOver}
        role="group"
        {...dropTargetHandlers}
      >
        {!hasContent ? (
          <FileDropEmptyState
            description={presentation.emptyDescription}
            onActivate={openFileDialog}
            onFolderActivate={
              presentation.allowsFolderSelection ? openFolderDialog : undefined
            }
            title={presentation.emptyTitle}
          />
        ) : presentation.presenter === "file-list" ? (
          <FileDropFileList
            isSortable={hasReorderHandler && itemEntries.length > 1}
            onAddFile={showsListCardinalityActions ? openFileDialog : undefined}
            onDragEnd={handleItemDragEnd}
            onItemRemove={
              showsListCardinalityActions && canRemoveCollectionItem
                ? handleCollectionItemRemove
                : undefined
            }
            previewEntries={itemEntries}
            previewKeys={itemKeys}
            sensors={sensors}
          />
        ) : presentation.presenter === "image-grid" ? (
          <FileDropImageGrid
            isSortable={hasReorderHandler && itemEntries.length > 1}
            onAddImages={openFileDialog}
            onDragEnd={handleItemDragEnd}
            onItemRemove={
              canRemoveCollectionItem ? handleCollectionItemRemove : undefined
            }
            onPreviewSelect={
              canSelectImageItem
                ? (key) => {
                    const entry = itemEntries.find(
                      (candidate) => candidate.key === key,
                    );

                    if (!entry) {
                      return;
                    }

                    if (usesLegacyPresentation) {
                      setSelectedItemKey((currentKey) =>
                        currentKey === key ? null : key,
                      );
                      return;
                    }

                    setSelectedItemKey(key);
                    onItemSelect?.(
                      entry.item as FileDropPresentationItem<AssetKind>,
                      entry.sourceIndex,
                    );
                  }
                : undefined
            }
            previewEntries={itemEntries}
            previewKeys={itemKeys}
            selectedPreviewKey={selectedItemKey}
            sensors={sensors}
          />
        ) : presentation.presenter === "model-item" ? (
          <FileDropFileList
            isSortable={false}
            onDragEnd={handleItemDragEnd}
            onItemActivate={openFileDialog}
            onItemRemove={
              canRemoveCollectionItem ? handleCollectionItemRemove : undefined
            }
            previewEntries={itemEntries}
            previewKeys={itemKeys}
            sensors={sensors}
          />
        ) : (
          <FileDropSinglePreview
            item={renderableItems[0]}
            onActivate={openFileDialog}
            onRemove={
              usesLegacyPresentation
                ? onClear
                  ? handleSingleItemRemove
                  : undefined
                : onItemRemove || onClear
                  ? handleSingleItemRemove
                  : undefined
            }
          />
        )}
      </div>
      <FileDropPresentationMessages
        feedback={presentation.feedback}
        status={presentation.status}
      />
      {secondaryActions.length > 0 ? (
        <ActionsControl
          actionStates={actionModel.states}
          actions={actionModel.options}
          buttonColumns={isImagePresenter ? 3 : undefined}
          name={isImagePresenter ? "Image transforms" : "File actions"}
          onAction={handleSecondaryAction}
          showLabel={false}
        />
      ) : null}
    </Field>
  );
}

export function FileDropControl<
  AssetKind extends string = FileDropAssetKind,
  Feedback = unknown,
  Status = unknown,
>(props: FileDropControlProps<AssetKind, Feedback, Status>): React.JSX.Element {
  return <FileDropControlBase {...props} />;
}
