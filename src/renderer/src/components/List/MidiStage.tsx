import React, { useCallback, useRef, useState } from "react";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage } from "react-konva";
import { useSpring, animated } from "@react-spring/konva";
import { clamp } from "motion";
const AnimatedStage = animated(Stage);
import { useAltKey } from "../../hooks/useAltKey";

const MidiStage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const stageStateRef = useRef({ scale: 1, x: 0, y: 0 });
  const [canDrag, setCanDrag] = useState(false);
  const [springs, api] = useSpring(() => ({
    scaleX: 1,
    scaleY: 1,
    x: 0,
    y: 0,
    config: { tension: 260, friction: 28 }, // tweak to taste
  }));
  const stageRef = useRef<KonvaStage | null>(null);

  const applyStageTransform = useCallback(
    (scale: number) => {
      // stageStateRef.current = { scale, x, y };
      api.start({ scaleX: scale, scaleY: scale });
    },
    [api]
  );

  const handleWheel = useCallback(
    (evt: KonvaEventObject<WheelEvent>) => {
      if (!evt.evt.metaKey && !evt.evt.ctrlKey) return; // bail unless ⌘/Ctrl is held
      // console.log(evt.currentTarget.scale());
      console.log(evt.currentTarget);
      evt.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const { scale, x, y } = stageStateRef.current;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = evt.evt.deltaY > 0 ? -1 : 1;
      const nextScale = clamp(0.25, 4, scale * Math.pow(1.05, direction));

      const mousePointTo = {
        x: (pointer.x - x) / scale,
        y: (pointer.y - y) / scale,
      };

      const nextPos = {
        x: pointer.x - mousePointTo.x * nextScale,
        y: pointer.y - mousePointTo.y * nextScale,
      };

      applyStageTransform(nextScale);
      // applyStageTransform(nextScale, nextPos.x, nextPos.y);
    },
    [applyStageTransform]
  );

  const handleClick = useCallback((evt: KonvaEventObject<MouseEvent>) => {
    console.log("Stage clicked", evt);
    // Deselect any selected note or item when clicking on empty space
  }, []);
  const handleAltHold = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.container().style.cursor = "grab";
    setCanDrag(true);
  }, []);
  const handleAltRelease = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.container().style.cursor = "";
    setCanDrag(false);
  }, []);
  useAltKey(handleAltHold, handleAltRelease);
  return (
    <AnimatedStage
      width={800}
      height={window.innerHeight}
      ref={stageRef}
      onMouseDown={(e) => console.log(e)}
      onClick={handleClick}
      draggable={canDrag}
      onWheel={handleWheel}
      scaleX={springs.scaleX}
      // onDragMove={handleDragMove}
      // {...springs}
    >
      {children}
    </AnimatedStage>
  );
};

export default MidiStage;
