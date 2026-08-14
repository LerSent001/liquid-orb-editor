"use client";

import * as React from "react";
import { XIcon } from "@phosphor-icons/react";

import { cn } from "../../../lib/utils";
import { Button } from "../../primitives";
import {
  getPreviewFrameStyle,
  getPreviewImageStyle,
  isPreviewQuarterTurn,
} from "./file-drop-presentation";
import type { FileDropPresentationItem } from "./file-drop-types";

type FileDropSinglePreviewProps = {
  item: FileDropPresentationItem;
  onActivate: () => void;
  onRemove?: () => void;
};

export function FileDropSinglePreview({
  item,
  onActivate,
  onRemove,
}: FileDropSinglePreviewProps): React.JSX.Element {
  return (
    <div
      className="relative w-full max-w-full overflow-hidden rounded-[calc(var(--radius-lg)-4px)]"
      data-slot="file-upload-preview-frame"
      style={getPreviewFrameStyle(item.size)}
    >
      <button
        aria-label={`Replace ${item.alt ?? item.fileName}`}
        className="absolute inset-0 block size-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-inset"
        onClick={onActivate}
        type="button"
      >
        {item.previewSrc ? (
          <img
            alt={item.alt ?? item.fileName}
            className={cn(
              "absolute top-1/2 left-1/2 block h-auto object-contain",
              isPreviewQuarterTurn(item.transform) ? "max-w-none" : "max-h-full max-w-full",
            )}
            draggable={false}
            height={item.size?.height}
            src={item.previewSrc}
            style={getPreviewImageStyle(item.size, item.transform)}
            width={item.size?.width}
          />
        ) : null}
      </button>
      {onRemove ? (
        <Button
          aria-label={`Remove ${item.alt ?? item.fileName}`}
          className="absolute top-3 right-3"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
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
