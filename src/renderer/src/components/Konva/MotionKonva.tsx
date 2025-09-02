import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, MotionValue, useTransform, useSpring } from "motion/react";
import { Group as KonvaGroup } from "react-konva";
import Konva from "konva";
import { animate } from "motion";

/**
 * Hook to create an animated Konva property that syncs with a MotionValue
 */
export function useAnimatedKonvaProperty<T>(
  motionValue: MotionValue<T>,
  propertyName: string,
  konvaNodeRef: React.RefObject<Konva.Node>,
  transform?: (value: T) => any
) {
  useEffect(() => {
    const updateKonvaProperty = (latest: T) => {
      if (konvaNodeRef.current) {
        const value = transform ? transform(latest) : latest;
        (konvaNodeRef.current as any)[propertyName] = value;
        konvaNodeRef.current.getLayer()?.batchDraw();
      }
    };

    const unsubscribe = motionValue.on("change", updateKonvaProperty);

    // Set initial value
    updateKonvaProperty(motionValue.get());

    return unsubscribe;
  }, [motionValue, propertyName, konvaNodeRef, transform]);
}

/**
 * Hook to animate multiple Konva properties from motion values
 */
export function useAnimatedKonvaProperties(
  motionValues: Record<string, MotionValue<any>>,
  konvaNodeRef: React.RefObject<Konva.Node>,
  transforms?: Record<string, (value: any) => any>
) {
  useEffect(() => {
    const updateKonvaProperties = () => {
      if (konvaNodeRef.current) {
        let hasChanges = false;
        Object.entries(motionValues).forEach(([propertyName, motionValue]) => {
          const value = motionValue.get();
          const transformedValue = transforms?.[propertyName]
            ? transforms[propertyName](value)
            : value;

          if ((konvaNodeRef.current as any)[propertyName] !== transformedValue) {
            (konvaNodeRef.current as any)[propertyName] = transformedValue;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          konvaNodeRef.current.getLayer()?.batchDraw();
        }
      }
    };

    const unsubscribers = Object.values(motionValues).map(motionValue =>
      motionValue.on("change", updateKonvaProperties)
    );

    // Set initial values
    updateKonvaProperties();

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [motionValues, konvaNodeRef, transforms]);
}

/**
 * Motion-enabled Konva Group component
 * Wraps a Konva Group with motion capabilities
 */
export interface MotionGroupProps {
  children: React.ReactNode;
  x?: number | MotionValue<number>;
  y?: number | MotionValue<number>;
  scaleX?: number | MotionValue<number>;
  scaleY?: number | MotionValue<number>;
  rotation?: number | MotionValue<number>;
  opacity?: number | MotionValue<number>;
  animate?: {
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    opacity?: number;
  };
  transition?: any;
  className?: string;
  style?: React.CSSProperties;
  // All other Konva Group props
  [key: string]: any;
}

export const MotionGroup: React.FC<MotionGroupProps> = ({
  children,
  x = 0,
  y = 0,
  scaleX = 1,
  scaleY = 1,
  rotation = 0,
  opacity = 1,
  animate,
  transition,
  className,
  style,
  ...konvaProps
}) => {
  const groupRef = useRef<Konva.Group>(null);

  // Create motion values for animatable properties
  const xMotion = useMotionValue(typeof x === 'number' ? x : x.get());
  const yMotion = useMotionValue(typeof y === 'number' ? y : y.get());
  const scaleXMotion = useMotionValue(typeof scaleX === 'number' ? scaleX : scaleX.get());
  const scaleYMotion = useMotionValue(typeof scaleY === 'number' ? scaleY : scaleY.get());
  const rotationMotion = useMotionValue(typeof rotation === 'number' ? rotation : rotation.get());
  const opacityMotion = useMotionValue(typeof opacity === 'number' ? opacity : opacity.get());

  // Sync motion values with Konva properties
  useAnimatedKonvaProperties(
    {
      x: xMotion,
      y: yMotion,
      scaleX: scaleXMotion,
      scaleY: scaleYMotion,
      rotation: rotationMotion,
      opacity: opacityMotion,
    },
    groupRef
  );

  // Handle external MotionValue inputs
  useEffect(() => {
    if (typeof x !== 'number') {
      const unsubscribe = x.on("change", (latest) => xMotion.set(latest));
      return unsubscribe;
    }
  }, [x, xMotion]);

  useEffect(() => {
    if (typeof y !== 'number') {
      const unsubscribe = y.on("change", (latest) => yMotion.set(latest));
      return unsubscribe;
    }
  }, [y, yMotion]);

  useEffect(() => {
    if (typeof scaleX !== 'number') {
      const unsubscribe = scaleX.on("change", (latest) => scaleXMotion.set(latest));
      return unsubscribe;
    }
  }, [scaleX, scaleXMotion]);

  useEffect(() => {
    if (typeof scaleY !== 'number') {
      const unsubscribe = scaleY.on("change", (latest) => scaleYMotion.set(latest));
      return unsubscribe;
    }
  }, [scaleY, scaleYMotion]);

  useEffect(() => {
    if (typeof rotation !== 'number') {
      const unsubscribe = rotation.on("change", (latest) => rotationMotion.set(latest));
      return unsubscribe;
    }
  }, [rotation, rotationMotion]);

  useEffect(() => {
    if (typeof opacity !== 'number') {
      const unsubscribe = opacity.on("change", (latest) => opacityMotion.set(latest));
      return unsubscribe;
    }
  }, [opacity, opacityMotion]);

  return (
    <>
      {/* Invisible motion div to drive animations */}
      <motion.div
        className={className}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          ...style,
        }}
        animate={animate}
        transition={transition}
      />

      {/* Konva Group that gets animated */}
      <KonvaGroup
        ref={groupRef}
        x={xMotion.get()}
        y={yMotion.get()}
        scaleX={scaleXMotion.get()}
        scaleY={scaleYMotion.get()}
        rotation={rotationMotion.get()}
        opacity={opacityMotion.get()}
        {...konvaProps}
      >
        {children}
      </KonvaGroup>
    </>
  );
};

/**
 * Hook for creating smooth Konva animations with spring physics
 */
export function useKonvaSpring(
  target: number,
  config?: { stiffness?: number; damping?: number; mass?: number }
) {
  const motionValue = useMotionValue(target);
  const springValue = useSpring(motionValue, config);

  const animateTo = (value: number, options?: any) => {
    animate(springValue, value, options);
  };

  return [springValue, animateTo] as const;
}

/**
 * Hook for creating sequenced Konva animations
 */
export function useKonvaSequence() {
  const motionValues = useRef<Map<string, MotionValue<any>>>(new Map());

  const getOrCreateMotionValue = (key: string, initialValue: any) => {
    if (!motionValues.current.has(key)) {
      motionValues.current.set(key, useMotionValue(initialValue));
    }
    return motionValues.current.get(key)!;
  };

  const animateSequence = (
    sequence: Array<{
      property: string;
      value: any;
      duration?: number;
      delay?: number;
      ease?: string;
    }>,
    konvaNodeRef?: React.RefObject<any>
  ) => {
    sequence.forEach((step) => {
      const motionValue = getOrCreateMotionValue(step.property, step.value);

      setTimeout(() => {
        animate(motionValue, step.value, {
          duration: (step.duration || 300) / 1000, // Convert to seconds
          ease: step.ease || "easeOut",
        });

        // If we have a Konva node ref, trigger a redraw
        if (konvaNodeRef?.current) {
          konvaNodeRef.current.getLayer()?.batchDraw();
        }
      }, step.delay || 0);
    });
  };

  return { getOrCreateMotionValue, animateSequence };
}
