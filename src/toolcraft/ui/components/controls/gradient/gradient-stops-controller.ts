"use client";

import type * as React from "react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";

import {
  createControlHistoryGroupId,
  type ControlChangeMeta,
  type ControlValueChangeHandler,
  type GradientStop,
  type GradientType,
} from "../control-types";
import {
  addGradientStop,
  getIndexedStops,
  getPositionFromTrack,
  isButtonTarget,
  maxGradientStops,
  minGradientStops,
  removeGradientStop,
  updateStopAt,
} from "./gradient-control-utils";

const playControlDragEndSound = () => undefined;
const playControlDragStartSound = () => undefined;
const playGradientAngleSound = (_previousAngle: number, _nextAngle: number) =>
  undefined;
const playGradientStopUpdateSound = (
  _previousStop: GradientStop | undefined,
  _nextStop: Partial<GradientStop>,
) => undefined;

function useGradientStopSelectionSound(
  _selectedIndex: number | null,
  setSelectedIndex: Dispatch<SetStateAction<number | null>>,
) {
  return (nextIndex: number) => setSelectedIndex(nextIndex);
}

type GradientStopsControllerOptions = {
  angle: number;
  gradientType: GradientType;
  name: string;
  onValueChange?: ControlValueChangeHandler<{
    angle: number;
    gradientType: GradientType;
    stops: readonly GradientStop[];
  }>;
  stops: readonly GradientStop[];
  trackRef: RefObject<HTMLDivElement | null>;
};

type GradientStopActionsOptions = GradientStopsControllerOptions & {
  activeStop: GradientStop | null;
  setSelectedIndex: Dispatch<SetStateAction<number | null>>;
};

function useGradientStopActions({
  activeStop,
  angle,
  gradientType,
  onValueChange,
  setSelectedIndex,
  stops,
}: GradientStopActionsOptions) {
  function updateGradient(
    nextGradient: {
      angle?: number;
      gradientType?: GradientType;
      stops?: readonly GradientStop[];
    },
    meta?: ControlChangeMeta,
  ): void {
    const nextValue = {
      angle: nextGradient.angle ?? angle,
      gradientType: nextGradient.gradientType ?? gradientType,
      stops: nextGradient.stops ?? stops,
    };

    if (meta) {
      onValueChange?.(nextValue, meta);
      return;
    }

    onValueChange?.(nextValue);
  }

  function updateStop(
    index: number,
    nextStop: Partial<GradientStop>,
    meta?: ControlChangeMeta,
  ): void {
    playGradientStopUpdateSound(stops[index], nextStop);
    updateGradient({ stops: updateStopAt(stops, index, nextStop) }, meta);
  }

  function addStop(position = "50%"): void {
    if (stops.length >= maxGradientStops) {
      return;
    }

    const { nextStop, nextStops } = addGradientStop(
      stops,
      activeStop,
      position,
    );

    updateGradient({ stops: nextStops });
    setSelectedIndex(nextStops.indexOf(nextStop));
  }

  function removeStop(index: number): void {
    if (stops.length <= minGradientStops) {
      return;
    }

    const nextStops = removeGradientStop(stops, index);

    updateGradient({ stops: nextStops });
    setSelectedIndex(
      nextStops.length > 0 ? Math.min(index, nextStops.length - 1) : null,
    );
  }

  return {
    addStop,
    removeStop,
    updateAngle: (nextAngle: number, meta?: ControlChangeMeta) => {
      playGradientAngleSound(angle, nextAngle);
      updateGradient({ angle: nextAngle }, meta);
    },
    updateGradientType: (nextType: GradientType) =>
      updateGradient({ gradientType: nextType }),
    updateStop,
  };
}

type GradientStopActions = ReturnType<typeof useGradientStopActions>;

function getGradientDragHistoryMeta(
  name: string,
  dragHistoryGroupRef: MutableRefObject<string | null>,
): ControlChangeMeta {
  dragHistoryGroupRef.current ??= createControlHistoryGroupId(
    `gradient:${name}`,
  );

  return {
    history: "merge",
    historyGroup: dragHistoryGroupRef.current,
  };
}

function useGradientStopDragWindowEvents({
  actions,
  dragHistoryGroupRef,
  draggingIndex,
  name,
  setDraggingIndex,
  trackRef,
}: {
  actions: GradientStopActions;
  dragHistoryGroupRef: MutableRefObject<string | null>;
  draggingIndex: number | null;
  name: string;
  setDraggingIndex: Dispatch<SetStateAction<number | null>>;
  trackRef: RefObject<HTMLDivElement | null>;
}): void {
  useEffect(() => {
    const activeDraggingIndex = draggingIndex;

    if (activeDraggingIndex === null) {
      return;
    }

    const stopIndex = activeDraggingIndex;

    function handlePointerMove(event: PointerEvent): void {
      actions.updateStop(
        stopIndex,
        {
          position: getPositionFromTrack(trackRef.current, event.clientX),
        },
        getGradientDragHistoryMeta(name, dragHistoryGroupRef),
      );
    }

    function stopDragging(): void {
      playControlDragEndSound();
      setDraggingIndex(null);
      dragHistoryGroupRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  });
}

export function useGradientStopsController(
  options: GradientStopsControllerOptions,
) {
  const { stops, trackRef } = options;
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragHistoryGroupRef = useRef<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const activeStop =
    selectedIndex === null ? null : (stops[selectedIndex] ?? null);
  const actions = useGradientStopActions({
    ...options,
    activeStop,
    setSelectedIndex,
  });
  const selectStop = useGradientStopSelectionSound(
    selectedIndex,
    setSelectedIndex,
  );

  useGradientStopDragWindowEvents({
    actions,
    dragHistoryGroupRef,
    draggingIndex,
    name: options.name,
    setDraggingIndex,
    trackRef,
  });

  function handleTrackPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ): void {
    if (
      draggingIndex !== null ||
      stops.length >= maxGradientStops ||
      isButtonTarget(event.target)
    ) {
      return;
    }

    actions.addStop(getPositionFromTrack(trackRef.current, event.clientX));
  }

  function handleTrackPointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ): void {
    if (draggingIndex === null) {
      return;
    }

    actions.updateStop(
      draggingIndex,
      {
        position: getPositionFromTrack(trackRef.current, event.clientX),
      },
      getGradientDragHistoryMeta(options.name, dragHistoryGroupRef),
    );
  }

  function handleStartDrag(
    index: number,
    event: React.PointerEvent<HTMLButtonElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    playControlDragStartSound();
    dragHistoryGroupRef.current = createControlHistoryGroupId(
      `gradient:${options.name}`,
    );
    setDraggingIndex(index);
    selectStop(index);
  }

  function handleStopDoubleClick(
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.stopPropagation();
    actions.removeStop(index);
  }

  function handleStopKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ): void {
    if (event.key !== "Delete" && event.key !== "Backspace") {
      return;
    }

    if (selectedIndex !== index) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    actions.removeStop(index);
  }

  return {
    ...actions,
    draggingIndex,
    handleStopDoubleClick,
    handleStopKeyDown,
    handleStartDrag,
    handleTrackPointerDown,
    handleTrackPointerMove,
    indexedStops: getIndexedStops(stops),
    selectStop,
    selectedIndex,
    setDraggingIndex: (nextIndex: number | null) => {
      setDraggingIndex(nextIndex);
      if (nextIndex === null) {
        dragHistoryGroupRef.current = null;
      }
    },
    setSelectedIndex,
  };
}
