"use client";

import * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../primitives";
import type { ControlChangeMeta } from "../control-types";

export function parseOpacityValue(opacity: number | undefined): number {
  return Math.min(100, Math.max(0, Math.round(opacity ?? 100)));
}

function normalizeOpacityInput(value: string): number {
  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue)
    ? Math.min(100, Math.max(0, Math.round(parsedValue)))
    : 100;
}

export function ColorOpacityInput({
  label,
  name,
  onOpacityChange,
  opacity,
}: {
  label: string;
  name?: string;
  onOpacityChange: (nextOpacity: number, meta?: ControlChangeMeta) => void;
  opacity: number;
}): React.JSX.Element {
  const committedOpacity = String(parseOpacityValue(opacity));
  const [draftOpacity, setDraftOpacity] = React.useState(committedOpacity);

  React.useEffect(() => {
    setDraftOpacity(committedOpacity);
  }, [committedOpacity]);

  function commitOpacity(nextDraft = draftOpacity): void {
    const trimmedDraft = nextDraft.trim();

    if (trimmedDraft === "" || !Number.isFinite(Number.parseFloat(trimmedDraft))) {
      setDraftOpacity(committedOpacity);
      return;
    }

    const nextOpacity = normalizeOpacityInput(trimmedDraft);

    setDraftOpacity(String(nextOpacity));

    if (nextOpacity !== parseOpacityValue(opacity)) {
      onOpacityChange(nextOpacity);
    }
  }

  return (
    <InputGroup className="w-14 flex-none rounded-l-none [&:not(:focus-within):hover]:!border-[color:color-mix(in_oklab,var(--border)_20%,transparent)] [&:not(:focus-within):hover]:text-[color:var(--foreground)]">
      <InputGroupInput
        aria-label={`${label}不透明度`}
        autoComplete="off"
        className="pl-2 pr-1 text-right font-mono"
        inputMode="numeric"
        name={name}
        onBlur={() => commitOpacity()}
        onChange={(event) => setDraftOpacity(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitOpacity(event.currentTarget.value);
            event.currentTarget.blur();
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setDraftOpacity(committedOpacity);
            event.currentTarget.blur();
          }
        }}
        type="text"
        value={draftOpacity}
      />
      <InputGroupAddon align="inline-end" className="pr-1.5 pl-0">
        <InputGroupText className="group-hover/input-group:text-[color:var(--foreground)]">
          %
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
