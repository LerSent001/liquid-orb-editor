"use client";

import * as React from "react";

type FileDropFolderInputProps = {
  ariaLabel: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFilesSelect?: (files: File[]) => void;
};

export function FileDropFolderInput({
  ariaLabel,
  inputRef,
  onFilesSelect,
}: FileDropFolderInputProps): React.JSX.Element {
  const registerInput = React.useCallback((input: HTMLInputElement | null) => {
    inputRef.current = input;
    if (input) {
      input.setAttribute("webkitdirectory", "");
      input.setAttribute("directory", "");
    }
  }, [inputRef]);

  return (
    <input
      aria-label={ariaLabel}
      className="hidden"
      multiple
      onChange={(event) => {
        const files = Array.from(event.currentTarget.files ?? []);
        if (files.length > 0) onFilesSelect?.(files);
        event.currentTarget.value = "";
      }}
      ref={registerInput}
      tabIndex={-1}
      type="file"
    />
  );
}
