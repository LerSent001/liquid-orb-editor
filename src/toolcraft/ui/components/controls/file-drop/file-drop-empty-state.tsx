"use client";

import { CloudArrowUpIcon } from "@phosphor-icons/react";

type FileDropEmptyStateProps = {
  description: string;
  onActivate: () => void;
  onFolderActivate?: () => void;
  title: string;
};

function FileDropEmptyStateContent({
  description,
  title,
}: Pick<FileDropEmptyStateProps, "description" | "title">): React.JSX.Element {
  return (
    <>
      <CloudArrowUpIcon
        className="size-6 flex-none text-[color:var(--muted-foreground)] transition-colors duration-150 ease-out group-data-[drag-over=true]/file-upload:text-[color:var(--link)]"
        weight="light"
      />
      <p className="m-0 flex max-w-full flex-col text-xs leading-tight text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] transition-colors duration-150 ease-out group-hover/file-upload:text-[color:color-mix(in_oklab,var(--foreground)_85%,transparent)] group-data-[drag-over=true]/file-upload:text-[color:var(--link)]">
        <span>{title}</span>
        <span>{description}</span>
      </p>
    </>
  );
}

export function FileDropEmptyState({
  description,
  onActivate,
  onFolderActivate,
  title,
}: FileDropEmptyStateProps): React.JSX.Element {
  if (onFolderActivate) {
    return (
      <div className="flex w-full min-w-0 flex-col items-center justify-center gap-2 px-3 py-3 text-center">
        <FileDropEmptyStateContent description={description} title={title} />
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            className="rounded-md border border-[color:var(--border)] bg-transparent px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
            onClick={onActivate}
            type="button"
          >
            Choose files
          </button>
          <button
            className="rounded-md border border-[color:var(--border)] bg-transparent px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
            onClick={onFolderActivate}
            type="button"
          >
            Choose folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className="flex w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-[calc(var(--radius-lg)-4px)] border-0 bg-transparent px-3 py-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
      onClick={onActivate}
      type="button"
    >
      <FileDropEmptyStateContent description={description} title={title} />
    </button>
  );
}
