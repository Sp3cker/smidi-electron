import { useEffect } from "react";
import Konva from "konva";
import type { MotionValue } from "motion/react";
import { scheduleLayerDraw } from "./rafScheduler";

export type MotionBindingMap = Record<string, MotionValue<any>>;
export type ValueTransformMap = Record<string, (v: any) => any>;

function setNodeProp(node: Konva.Node, key: string, value: any) {
  const setter = (node as any)[key];
  if (typeof setter === "function") {
    // Konva setters are functions: node.x(10), node.opacity(0.5)
    (node as any)[key](value);
  } else {
    // Fallback, set field directly
    (node as any)[key] = value;
  }
}

export function useKonvaMotion(
  nodeRef: React.RefObject<Konva.Node>,
  bindings: MotionBindingMap,
  transforms?: ValueTransformMap
) {
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const unsubscribers: Array<() => void> = [];

    const update = (key: string, latest: any) => {
      const value = transforms?.[key] ? transforms[key](latest) : latest;
      setNodeProp(node, key, value);
      scheduleLayerDraw(node.getLayer());
    };

    // Set initial
    for (const [key, mv] of Object.entries(bindings)) {
      update(key, mv.get());
      unsubscribers.push(mv.on("change", (v) => update(key, v)));
    }

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [nodeRef, bindings, transforms]);
}


