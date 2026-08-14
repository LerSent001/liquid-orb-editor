"use client";

import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "../../composites";
import { cn } from "../../../lib/utils";
import type { ControlOption } from "../control-types";
import { StaticSelect } from "../select";

const OVERFLOW_TOLERANCE_PX = 1;

export type TabsControlProps = {
  ariaLabel: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  options: readonly ControlOption[];
  value?: string;
};

export function doesTabsControlOverflow(list: HTMLElement): boolean {
  if (list.clientWidth <= 0) {
    return false;
  }

  if (list.scrollWidth > list.clientWidth + OVERFLOW_TOLERANCE_PX) {
    return true;
  }

  return Array.from(
    list.querySelectorAll<HTMLElement>(
      '[data-slot="tabs-trigger"], [data-slot="tabs-trigger-label"]',
    ),
  ).some(
    (tab) =>
      tab.clientWidth > 0 &&
      tab.scrollWidth > tab.clientWidth + OVERFLOW_TOLERANCE_PX,
  );
}

export function TabsControl({
  ariaLabel,
  disabled,
  onValueChange,
  options,
  value,
}: TabsControlProps): React.JSX.Element {
  const listRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [usesSelect, setUsesSelect] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(
    () => value ?? options[0]?.value ?? "",
  );
  const selectedValue =
    options.find((option) => option.value === (value ?? currentValue))?.value ??
    options[0]?.value ??
    "";

  React.useEffect(() => {
    if (typeof value !== "undefined") {
      setCurrentValue(value);
      return;
    }

    if (!options.some((option) => option.value === currentValue)) {
      setCurrentValue(options[0]?.value ?? "");
    }
  }, [currentValue, options, value]);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    const wrapper = wrapperRef.current;

    if (!list || !wrapper) {
      return;
    }

    const updatePresentation = (): void => {
      const nextUsesSelect = doesTabsControlOverflow(list);

      setUsesSelect((currentUsesSelect) =>
        currentUsesSelect === nextUsesSelect
          ? currentUsesSelect
          : nextUsesSelect,
      );
    };

    updatePresentation();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updatePresentation);

    observer.observe(wrapper);
    observer.observe(list);
    for (const measurementTarget of list.querySelectorAll<HTMLElement>(
      '[data-slot="tabs-trigger"], [data-slot="tabs-trigger-label"]',
    )) {
      observer.observe(measurementTarget);
    }

    return () => observer.disconnect();
  }, [options]);

  return (
    <div
      className="relative min-w-0 w-full"
      data-presentation={usesSelect ? "select" : "tabs"}
      data-slot="tabs-control"
      ref={wrapperRef}
    >
      <Tabs
        className={cn(
          "w-full gap-0",
          usesSelect &&
            "pointer-events-none invisible absolute inset-x-0 top-0",
        )}
        onValueChange={(nextValue) => {
          if (typeof nextValue === "string") {
            setCurrentValue(nextValue);
            onValueChange?.(nextValue);
          }
        }}
        value={selectedValue}
      >
        <TabsList
          aria-hidden={usesSelect || undefined}
          aria-label={ariaLabel}
          className="w-full"
          ref={listRef}
          variant="control"
        >
          {options.map((option) => (
            <TabsTrigger
              disabled={disabled}
              key={option.value}
              title={option.label}
              value={option.value}
            >
              <span
                className="min-w-0 overflow-hidden text-ellipsis"
                data-slot="tabs-trigger-label"
              >
                {option.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {usesSelect ? (
        <StaticSelect
          ariaLabel={ariaLabel}
          disabled={disabled}
          onValueChange={(nextValue) => {
            setCurrentValue(nextValue);
            onValueChange?.(nextValue);
          }}
          options={options}
          scrollFadeValue={false}
          value={selectedValue}
        />
      ) : null}
    </div>
  );
}
