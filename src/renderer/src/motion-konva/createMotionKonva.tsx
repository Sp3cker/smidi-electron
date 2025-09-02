import React, { forwardRef, useMemo, useRef } from "react";
import Konva from "konva";
import type { MotionValue } from "motion/react";
import { useKonvaMotion } from "./useKonvaMotion";

// Keys commonly animated on Konva nodes
const defaultAnimatableKeys = [
  "x",
  "y",
  "scaleX",
  "scaleY",
  "rotation",
  "opacity",
] as const;

export type MotionifiedProps<P> = Omit<P, typeof defaultAnimatableKeys[number]> &
  Partial<Record<typeof defaultAnimatableKeys[number], number | MotionValue<number>>> & {
    motion?: Partial<Record<string, MotionValue<any>>>;
  };

export function createMotionKonva<P extends object, N extends Konva.Node>(
  BaseComponent: React.ComponentType<any>
) {
  type Props = MotionifiedProps<P> & React.ComponentProps<typeof BaseComponent> & {
    nodeRef?: React.RefObject<N>;
  };

  const MotionComponent = forwardRef<N, Props>((props, forwardedRef) => {
    const { motion, nodeRef, ...rest } = props as any;
    const localRef = useRef<N>(null);
    const ref = (nodeRef || (forwardedRef as any)) ?? localRef;

    // Collect MotionValue props
    const bindings = useMemo(() => {
      const out: Record<string, MotionValue<any>> = {};
      for (const key of defaultAnimatableKeys) {
        const v = (props as any)[key];
        if (v && typeof v === "object" && "on" in v) out[key] = v as MotionValue<any>;
      }
      if (motion) {
        for (const [k, mv] of Object.entries(motion)) {
          out[k] = mv as MotionValue<any>;
        }
      }
      return out;
    }, [props, motion]);

    useKonvaMotion(ref as any, bindings);

    return <BaseComponent ref={ref} {...rest} />;
  });

  MotionComponent.displayName = `Motion(${(BaseComponent as any).displayName || (BaseComponent as any).name || "Konva"})`;
  return MotionComponent as unknown as React.FC<Props>;
}


