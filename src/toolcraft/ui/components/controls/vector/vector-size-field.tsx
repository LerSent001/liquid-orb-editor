"use client";

import * as React from "react";

import { ControlFieldLabel } from "../../control-layout";
import { Field, Input } from "../../primitives";
import type { VectorControlProps } from "./vector-control-types";
import { normalizeVectorCoordinate } from "./vector-value";

export function VectorSizeField({
  defaultValue,
  name,
  onValueChange,
  x,
  xLabel = "X",
  y,
  yLabel = "Y",
}: VectorControlProps): React.JSX.Element {
  const [draftValue, setDraftValue] = React.useState({ x, y });
  const committedValueRef = React.useRef({ x, y });
  const defaultValueRef = React.useRef({
    x: normalizeVectorCoordinate(defaultValue?.x),
    y: normalizeVectorCoordinate(defaultValue?.y),
  });

  React.useEffect(() => {
    committedValueRef.current = { x, y };
    setDraftValue({ x, y });
  }, [x, y]);

  React.useEffect(() => {
    defaultValueRef.current = {
      x: normalizeVectorCoordinate(defaultValue?.x),
      y: normalizeVectorCoordinate(defaultValue?.y),
    };
  }, [defaultValue?.x, defaultValue?.y]);

  function commitVector(): void {
    const nextValue = {
      x: draftValue.x.trim() === "" ? defaultValueRef.current.x : draftValue.x,
      y: draftValue.y.trim() === "" ? defaultValueRef.current.y : draftValue.y,
    };

    setDraftValue(nextValue);

    if (
      nextValue.x !== committedValueRef.current.x ||
      nextValue.y !== committedValueRef.current.y
    ) {
      onValueChange?.(nextValue);
    }
  }

  function cancelDraft(): void {
    setDraftValue(committedValueRef.current);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      commitVector();
      event.currentTarget.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelDraft();
      event.currentTarget.blur();
    }
  }

  return (
    <Field className="min-w-0 gap-2">
      <div className="flex items-center justify-between gap-3">
        <ControlFieldLabel>{name}</ControlFieldLabel>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-1.5">
        <Input
          aria-label={`${name} ${xLabel}`}
          className="font-mono"
          onBlur={commitVector}
          onChange={(event) =>
            setDraftValue((current) => ({ ...current, x: event.target.value }))
          }
          onKeyDown={handleKeyDown}
          size="default"
          value={draftValue.x}
        />
        <Input
          aria-label={`${name} ${yLabel}`}
          className="font-mono"
          onBlur={commitVector}
          onChange={(event) =>
            setDraftValue((current) => ({ ...current, y: event.target.value }))
          }
          onKeyDown={handleKeyDown}
          size="default"
          value={draftValue.y}
        />
      </div>
    </Field>
  );
}
