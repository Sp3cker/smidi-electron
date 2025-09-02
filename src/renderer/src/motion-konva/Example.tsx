import React, { useEffect, useRef } from "react";
import { Stage, Layer, Rect, Circle, Group } from "react-konva";
import { useMotionValue, animate } from "motion/react";
import Konva from "konva";
import { useKonvaMotion, createMotionKonva } from "./index";

const MotionRect = createMotionKonva(Rect);
const MotionCircle = createMotionKonva(Circle);
const MotionGroup = createMotionKonva(Group);

export const MotionKonvaExample: React.FC = () => {
  const x = useMotionValue(20);
  const y = useMotionValue(20);
  const s = useMotionValue(1);
  const o = useMotionValue(1);

  const rectRef = useRef<Konva.Rect>(null);
  useKonvaMotion(rectRef as unknown as React.RefObject<Konva.Node>, {
    x,
    y,
    scaleX: s,
    scaleY: s,
    opacity: o,
  });

  useEffect(() => {
    animate(x, 250, { duration: 0.8, ease: "easeInOut" });
    animate(y, 120, { duration: 0.8, ease: "easeInOut" });
    animate(o, 0.6, { duration: 0.3 }).then(() =>
      animate(o, 1, { duration: 0.3 }),
    );
    animate(s, 1.2, { duration: 0.4 }).then(() =>
      animate(s, 1, { duration: 0.4 }),
    );
  }, [x, y, o, s]);

  return (
    <Stage width={500} height={220} className="border border-gray-200">
      <Layer>
        {/* Hook-driven */}
        <Rect
          ref={rectRef}
          x={0}
          y={0}
          width={120}
          height={60}
          fill="#3b82f6"
          cornerRadius={8}
        />

        {/* Wrapper-driven */}
        <MotionGroup x={180} y={110}>
          <MotionCircle radius={28} fill="#ef4444" />
        </MotionGroup>

        {/* Direct wrapper with MotionValue on prop */}
        <MotionRect
          x={x}
          y={140}
          width={100}
          height={40}
          fill="#10b981"
          cornerRadius={6}
        />
      </Layer>
    </Stage>
  );
};
