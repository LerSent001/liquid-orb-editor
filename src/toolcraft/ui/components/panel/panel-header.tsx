"use client";

import * as React from "react";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";

import { PrimitiveArrowIcon } from "../primitives/primitive-arrow-icon";
import {
  PanelIconButton,
  stopPanelHeaderButtonPointerDown,
} from "./panel-icon-button";
import { cn } from "../../lib/utils";

type PanelHeaderProps = {
  collapsed: boolean;
  collapseDirection?: "left" | "right" | "up";
  collapseLabel?: string;
  expandLabel?: string;
  onResetControls?: () => void;
  onToggleCollapsed?: () => void;
  resetLabel?: string;
  title: string;
};

export function PanelHeader({
  collapsed,
  collapseDirection = "up",
  collapseLabel = "收起参数面板",
  expandLabel = "展开参数面板",
  onResetControls,
  onToggleCollapsed,
  resetLabel = "重置全部参数",
  title,
}: PanelHeaderProps): React.JSX.Element {
  const arrowDirection =
    collapseDirection === "left"
      ? collapsed
        ? "right"
        : "left"
      : collapseDirection === "right"
        ? collapsed
          ? "left"
          : "right"
        : collapsed
          ? "down"
          : "up";

  return (
    <div
      className="shrink-0"
      data-collapsed={String(collapsed)}
      data-slot="properties-panel-header-shell"
    >
      <div
        className={cn(
          "flex h-9 touch-none items-center gap-3 pr-1 pl-3 hover:cursor-grab active:cursor-grabbing",
          collapsed ? "justify-center px-1" : "justify-between",
        )}
        data-panel-drag-handle=""
        data-slot="properties-panel-header"
      >
        <p
          className={cn(
            "m-0 min-w-0 truncate text-xs-plus font-medium text-[color:var(--foreground)]",
            collapsed && "sr-only",
          )}
        >
          {title}
        </p>
        <div className="inline-flex shrink-0 items-center gap-1">
          {collapsed || !onResetControls ? null : (
            <PanelIconButton
              label={resetLabel}
              onClick={onResetControls}
              onPointerDown={stopPanelHeaderButtonPointerDown}
              spinOnClick
            >
              <ArrowCounterClockwiseIcon />
            </PanelIconButton>
          )}
          {onToggleCollapsed ? (
            <PanelIconButton
              label={collapsed ? expandLabel : collapseLabel}
              onClick={onToggleCollapsed}
              onPointerDown={stopPanelHeaderButtonPointerDown}
            >
              <PrimitiveArrowIcon direction={arrowDirection} />
            </PanelIconButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
