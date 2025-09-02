import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "motion/react";
import { Stage, Layer } from "react-konva";
import MidiClipKonva from "./MidiClipKonva";
import { MotionGroup, useKonvaSpring, useKonvaSequence } from "./MotionKonva";
import { Rect, Circle, Text } from "react-konva";

/**
 * Example component demonstrating various ways to animate Konva components with Motion
 */
export const KonvaAnimationExamples: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Example 1: Using motion values directly
  const xMotion = useMotionValue(50);
  const yMotion = useMotionValue(50);
  const scaleMotion = useMotionValue(1);
  const opacityMotion = useMotionValue(1);

  // Example 2: Using springs for smooth animations
  const [springX, animateSpringX] = useKonvaSpring(100);
  const [springY, animateSpringY] = useKonvaSpring(100);

  // Example 3: Using transforms for derived animations
  const rotateMotion = useMotionValue(0);
  const scaleFromRotate = useTransform(rotateMotion, [0, 360], [1, 1.5]);

  // Example 4: Using sequence animations
  const { animateSequence } = useKonvaSequence();

  // Sample MIDI data for demonstration
  const sampleNotes = [
    { midi: 60, time: 0, duration: 1, velocity: 80 },
    { midi: 64, time: 0.5, duration: 0.5, velocity: 90 },
    { midi: 67, time: 1, duration: 1, velocity: 85 },
    { midi: 72, time: 1.5, duration: 0.5, velocity: 95 },
  ];

  const triggerAnimations = () => {
    setIsAnimating(true);

    // Example 1: Direct motion value animations
    animate(xMotion, 200, { duration: 1, ease: "easeInOut" });
    animate(yMotion, 150, { duration: 1, ease: "easeInOut" });
    animate(scaleMotion, 1.2, { duration: 0.5, ease: "easeOut" })
      .then(() => animate(scaleMotion, 1, { duration: 0.5, ease: "easeIn" }));

    // Example 2: Spring animations
    animateSpringX(300);
    animateSpringY(200);

    // Example 3: Rotation with derived scale
    animate(rotateMotion, 360, { duration: 2, ease: "linear" });

    // Example 4: Sequence animation
    animateSequence([
      { property: "opacity", value: 0.5, duration: 300 },
      { property: "scaleX", value: 1.3, duration: 500, delay: 300 },
      { property: "scaleY", value: 1.3, duration: 500 },
      { property: "opacity", value: 1, duration: 300, delay: 800 },
      { property: "scaleX", value: 1, duration: 500, delay: 1100 },
      { property: "scaleY", value: 1, duration: 500 },
    ]);

    setTimeout(() => setIsAnimating(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        <button
          onClick={triggerAnimations}
          disabled={isAnimating}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isAnimating ? "Animating..." : "Start Animations"}
        </button>
      </div>

      <Stage width={800} height={600} className="border border-gray-300">
        <Layer>
          {/* Example 1: Direct motion values */}
          <MotionGroup x={xMotion} y={yMotion} scaleX={scaleMotion} scaleY={scaleMotion}>
            <Rect
              width={100}
              height={100}
              fill="#3b82f6"
              cornerRadius={8}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={10}
              shadowOffset={{ x: 5, y: 5 }}
            />
            <Text
              x={10}
              y={35}
              text="Motion Values"
              fontSize={14}
              fill="white"
              fontFamily="Arial"
            />
          </MotionGroup>

          {/* Example 2: Spring animations */}
          <MotionGroup x={springX} y={springY}>
            <Circle
              radius={40}
              fill="#ef4444"
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={10}
              shadowOffset={{ x: 3, y: 3 }}
            />
            <Text
              x={-25}
              y={-8}
              text="Spring"
              fontSize={14}
              fill="white"
              fontFamily="Arial"
              align="center"
              width={50}
            />
          </MotionGroup>

          {/* Example 3: Transforms and derived values */}
          <MotionGroup
            x={400}
            y={100}
            rotation={rotateMotion}
            scaleX={scaleFromRotate}
            scaleY={scaleFromRotate}
          >
            <Rect
              x={-50}
              y={-50}
              width={100}
              height={100}
              fill="#10b981"
              cornerRadius={50}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={10}
              shadowOffset={{ x: 3, y: 3 }}
            />
            <Text
              x={-35}
              y={-8}
              text="Transform"
              fontSize={14}
              fill="white"
              fontFamily="Arial"
            />
          </MotionGroup>

          {/* Example 4: Animated MIDI Clip */}
          <MidiClipKonva
            x={50}
            y={300}
            width={300}
            height={150}
            fileName="Animated Clip"
            notes={sampleNotes}
            bpm={120}
            animate={{
              x: isAnimating ? 150 : 50,
              scaleX: isAnimating ? 1.1 : 1,
              scaleY: isAnimating ? 1.1 : 1,
              opacity: isAnimating ? 0.8 : 1,
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
          />

          {/* Example 5: Hover animations with motion values */}
          <HoverAnimatedRect x={500} y={50} />
        </Layer>
      </Stage>

      <div className="text-sm text-gray-600 space-y-2">
        <h3 className="font-semibold">Animation Examples:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Direct Motion Values:</strong> Blue square uses motion values for position and scale</li>
          <li><strong>Spring Physics:</strong> Red circle uses spring animations for smooth movement</li>
          <li><strong>Transforms:</strong> Green circle rotates and scales based on derived values</li>
          <li><strong>MIDI Clip:</strong> Animated clip demonstrates the updated MidiClipKonva component</li>
          <li><strong>Interactive:</strong> Purple rectangle responds to hover with motion animations</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Example of interactive hover animations
 */
const HoverAnimatedRect: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const hoverMotion = useMotionValue(0);
  const scaleHover = useTransform(hoverMotion, [0, 1], [1, 1.2]);
  const opacityHover = useTransform(hoverMotion, [0, 1], [0.7, 1]);

  return (
    <MotionGroup
      x={x}
      y={y}
      scaleX={scaleHover}
      scaleY={scaleHover}
      opacity={opacityHover}
    >
      <Rect
        width={120}
        height={80}
        fill="#8b5cf6"
        cornerRadius={8}
        shadowColor="rgba(0,0,0,0.2)"
        shadowBlur={10}
        shadowOffset={{ x: 3, y: 3 }}
        onMouseEnter={() => animate(hoverMotion, 1, { duration: 0.3 })}
        onMouseLeave={() => animate(hoverMotion, 0, { duration: 0.3 })}
      />
      <Text
        x={15}
        y={28}
        text="Hover Me"
        fontSize={14}
        fill="white"
        fontFamily="Arial"
      />
    </MotionGroup>
  );
};

/**
 * Performance-optimized animation component for many elements
 */
export const PerformanceExample: React.FC = () => {
  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Create many animated items
    const newItems = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 700,
      y: Math.random() * 500,
      delay: Math.random() * 2,
    }));
    setItems(newItems);
  }, []);

  const animateAll = () => {
    // Animate all items with staggered timing
    items.forEach((item, index) => {
      setTimeout(() => {
        const element = document.querySelector(`[data-item-id="${item.id}"]`);
        if (element) {
          animate(
            element,
            { scale: [1, 1.5, 1], rotate: [0, 180, 360] },
            { duration: 1, ease: "easeInOut" }
          );
        }
      }, item.delay * 1000);
    });
  };

  return (
    <div className="p-6">
      <button
        onClick={animateAll}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Animate All (50 items)
      </button>

      <Stage width={800} height={600} className="border border-gray-300">
        <Layer>
          {items.map((item) => (
            <MotionGroup
              key={item.id}
              x={item.x}
              y={item.y}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, delay: item.delay, repeat: Infinity, ease: "linear" }}
            >
              <Circle
                radius={15}
                fill={`hsl(${item.id * 7}, 70%, 60%)`}
                data-item-id={item.id}
              />
            </MotionGroup>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
