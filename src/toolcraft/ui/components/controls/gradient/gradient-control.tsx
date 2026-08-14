"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { Field } from "../../primitives";
import {
  type ControlChangeMeta,
  type ControlValueChangeHandler,
  type GradientStop,
  type GradientType,
} from "../control-types";
import {
  getGradientAngle,
  getGradientBackground,
  getGradientType,
} from "./gradient-control-utils";
import { GradientStopsList } from "./gradient-stop-list";
import { useGradientStopsController } from "./gradient-stops-controller";
import { GradientStopsTrack } from "./gradient-stops-track";
import { GradientToolbar } from "./gradient-toolbar";

export type GradientControlProps = {
  angle?: number;
  gradientType?: GradientType;
  name?: string;
  onValueChange?: ControlValueChangeHandler<{
    angle: number;
    gradientType: GradientType;
    stops: readonly GradientStop[];
  }>;
  stops: readonly GradientStop[];
};

export function GradientControl({
  angle: angleProp,
  gradientType: gradientTypeProp,
  name = "Gradient",
  onValueChange,
  stops,
}: GradientControlProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [uncontrolledAngle, setUncontrolledAngle] = useState(() =>
    getGradientAngle(angleProp),
  );
  const [uncontrolledGradientType, setUncontrolledGradientType] = useState(() =>
    getGradientType(gradientTypeProp),
  );
  const angle =
    typeof angleProp === "undefined"
      ? uncontrolledAngle
      : getGradientAngle(angleProp);
  const gradientType =
    typeof gradientTypeProp === "undefined"
      ? uncontrolledGradientType
      : getGradientType(gradientTypeProp);

  useEffect(() => {
    if (typeof angleProp !== "undefined") {
      setUncontrolledAngle(getGradientAngle(angleProp));
    }
  }, [angleProp]);

  useEffect(() => {
    if (typeof gradientTypeProp !== "undefined") {
      setUncontrolledGradientType(getGradientType(gradientTypeProp));
    }
  }, [gradientTypeProp]);

  function handleValueChange(
    value: {
      angle: number;
      gradientType: GradientType;
      stops: readonly GradientStop[];
    },
    meta?: ControlChangeMeta,
  ): void {
    if (typeof angleProp === "undefined") {
      setUncontrolledAngle(value.angle);
    }

    if (typeof gradientTypeProp === "undefined") {
      setUncontrolledGradientType(value.gradientType);
    }

    if (meta) {
      onValueChange?.(value, meta);
      return;
    }

    onValueChange?.(value);
  }

  const controller = useGradientStopsController({
    angle,
    gradientType,
    name,
    onValueChange: handleValueChange,
    stops,
    trackRef,
  });

  return (
    <Field className="min-w-0 !gap-[3px]">
      <div
        className="flex min-w-0 flex-col gap-3"
        data-slot="gradient-stops-control-main"
      >
        <div className="flex h-fit min-w-0 items-center justify-start">
          <GradientToolbar
            angle={angle}
            name={name}
            onAngleChange={controller.updateAngle}
            onTypeChange={controller.updateGradientType}
            type={gradientType}
          />
        </div>
        <div className="min-w-0">
          <GradientStopsTrack
            draggingIndex={controller.draggingIndex}
            gradient={getGradientBackground(gradientType, stops, angle)}
            onDragEnd={() => controller.setDraggingIndex(null)}
            onPointerDown={controller.handleTrackPointerDown}
            onPointerMove={controller.handleTrackPointerMove}
            onRemoveStop={controller.handleStopDoubleClick}
            onRemoveStopByKey={controller.handleStopKeyDown}
            onStartDrag={controller.handleStartDrag}
            selectedIndex={controller.selectedIndex}
            stops={controller.indexedStops}
            trackRef={trackRef}
          />
        </div>
      </div>
      <GradientStopsList
        onAdd={controller.addStop}
        onColorChange={(index, nextColor) =>
          controller.updateStop(index, { color: nextColor })
        }
        onOpacityChange={(index, nextOpacity) =>
          controller.updateStop(index, { opacity: nextOpacity })
        }
        onPositionChange={(index, nextPosition) =>
          controller.updateStop(index, { position: nextPosition })
        }
        onRemove={controller.removeStop}
        onSelect={controller.selectStop}
        selectedIndex={controller.selectedIndex}
        stops={controller.indexedStops}
      />
    </Field>
  );
}
