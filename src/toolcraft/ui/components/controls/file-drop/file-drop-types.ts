import type { ReactElement, ReactNode } from "react";

import type {
  ActionControlIconName,
  ActionsControlItemState,
} from "../actions/actions-control";

export type FileDropAssetKind = "file" | "image";

export type FileDropImageTransform = {
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotationDeg?: number;
};

export type FileDropImageTransformOperation =
  | "flip-horizontal"
  | "flip-vertical"
  | "rotate-left"
  | "rotate-right";

export type FileDropImageSize = {
  height: number;
  width: number;
};

export type FileDropPreview = {
  alt?: string;
  assetKind?: FileDropAssetKind;
  fileName?: string;
  id?: string;
  size?: FileDropImageSize;
  src: string;
  transform?: FileDropImageTransform;
};

export type FileDropPresentationItem<AssetKind extends string = string> = {
  alt?: string;
  assetKind: AssetKind;
  fileName: string;
  id: string;
  previewSrc?: string;
  size?: FileDropImageSize;
  transform?: FileDropImageTransform;
};

export type FileDropPresentationEntry<AssetKind extends string = string> = {
  item: FileDropPresentationItem<AssetKind>;
  key: string;
  sourceIndex: number;
};

export type FileDropPresentationAction = {
  ariaLabel?: string;
  icon?: ActionControlIconName | ReactElement;
  label: string;
  state?: ActionsControlItemState;
  value: string;
};

export type FileDropPresentation<
  AssetKind extends string = string,
  Feedback = unknown,
  Status = unknown,
> = {
  accept: string;
  allowsFileBatch: boolean;
  allowsFolderSelection: boolean;
  emptyDescription: string;
  emptyTitle: string;
  feedback?: Feedback;
  items: readonly FileDropPresentationItem<AssetKind>[];
  presenter: "file-list" | "image-grid" | "model-item" | "single-image";
  secondaryActions: readonly FileDropPresentationAction[];
  status?: Status;
};

export type FileDropCollectionActions = {
  addLabel?: string;
  canAdd?: boolean;
  itemLabel?: string;
  name: string;
  removeLabel?: string;
  renderItemContent?: (
    item: FileDropPresentationItem,
    index: number,
  ) => ReactNode;
};

type FileDropControlSharedProps<AssetKind extends string> = {
  collectionActions?: FileDropCollectionActions;
  onClear?: () => void;
  onItemRemove?: (
    item: FileDropPresentationItem<AssetKind>,
    index: number,
  ) => void;
  onItemsReorder?: (items: FileDropPresentationItem<AssetKind>[]) => void;
};

type FileDropPresentationControlProps<
  AssetKind extends string,
  Feedback,
  Status,
> = FileDropControlSharedProps<AssetKind> & {
  accept?: never;
  assetKind?: never;
  multiple?: never;
  onFileSelect?: never;
  onFilesSelect: (files: File[]) => void;
  onFolderSelect?: (files: File[]) => void;
  onAction?: (value: string) => void;
  onItemSelect?: (
    item: FileDropPresentationItem<AssetKind>,
    index: number,
  ) => void;
  onPreviewRemove?: never;
  onPreviewReorder?: never;
  onPreviewTransform?: never;
  presentation: FileDropPresentation<AssetKind, Feedback, Status>;
  preview?: never;
  previews?: never;
};

type FileDropLegacyControlProps =
  FileDropControlSharedProps<FileDropAssetKind> & {
    accept?: string;
    assetKind?: FileDropAssetKind;
    multiple?: boolean;
    onFileSelect?: (file: File) => void;
    onFilesSelect?: (files: File[]) => void;
    onFolderSelect?: never;
    onAction?: never;
    onItemRemove?: never;
    onItemSelect?: never;
    onItemsReorder?: never;
    onPreviewRemove?: (preview: FileDropPreview, index: number) => void;
    onPreviewReorder?: (orderedPreviews: FileDropPreview[]) => void;
    onPreviewTransform?: (
      preview: FileDropPreview,
      operation: FileDropImageTransformOperation,
    ) => void;
    presentation?: undefined;
    preview?: FileDropPreview;
    previews?: readonly FileDropPreview[];
  };

export type FileDropControlProps<
  AssetKind extends string = FileDropAssetKind,
  Feedback = unknown,
  Status = unknown,
> =
  | FileDropLegacyControlProps
  | FileDropPresentationControlProps<AssetKind, Feedback, Status>;
