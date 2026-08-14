"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

export function VectorPadGuides({
  isDragging,
}: {
  isDragging: boolean;
}): React.JSX.Element {
  const motionClass = isDragging
    ? "transition-none"
    : "transition-[top] duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]";
  const verticalMotionClass = isDragging
    ? "transition-none"
    : "transition-[left] duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]";

  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 z-10 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--foreground)_20%,transparent),transparent)]",
          motionClass,
        )}
        style={{ top: "var(--xy-pad-display-y)" }}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--foreground)_20%,transparent),transparent)]",
          verticalMotionClass,
        )}
        style={{ left: "var(--xy-pad-display-x)" }}
      />
    </>
  );
}

export function VectorPadHandle({
  isDragging,
}: {
  isDragging: boolean;
}): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "xy-handle group/xy-handle pointer-events-auto absolute z-20 size-3 -translate-x-1/2 -translate-y-1/2 cursor-default will-change-[left,top,transform]",
        isDragging
          ? "cursor-pointer transition-transform duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          : "transition-[left,top,transform] duration-[260ms,260ms,120ms] ease-[cubic-bezier(0.34,1.56,0.64,1),cubic-bezier(0.34,1.56,0.64,1),cubic-bezier(0.22,1,0.36,1)] hover:cursor-pointer",
      )}
      style={{ left: "var(--xy-pad-display-x)", top: "var(--xy-pad-display-y)" }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-[-5px] rounded-full bg-[color:color-mix(in_oklab,var(--foreground)_12%,transparent)] opacity-0 blur-[8px] transition-[opacity,scale] duration-200 ease-out",
          isDragging ? "scale-[1.45] opacity-100" : "scale-95",
        )}
      />
      <span
        className={cn(
          "relative block size-full rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--foreground)_95%,transparent),color-mix(in_oklab,var(--foreground)_76%,transparent)),linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_20%,transparent),color-mix(in_oklab,var(--foreground)_6%,transparent))] shadow-[0_4px_10px_color-mix(in_oklab,var(--background)_20%,transparent)] transition-[scale,background-color,box-shadow] duration-200 ease-out will-change-transform motion-reduce:transition-none",
          isDragging ? "scale-[1.3333]" : "group-hover/xy-handle:scale-[1.3333]",
        )}
      />
    </div>
  );
}
