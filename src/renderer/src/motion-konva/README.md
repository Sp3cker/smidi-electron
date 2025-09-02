# motion-konva (local module)

Animate Konva nodes with Motion for React, without using Konva.Animation.

## Why
- Keep React in control of state.
- Use MotionValues/springs/timelines.
- Batch layer draws via requestAnimationFrame.

## API

### useKonvaMotion(nodeRef, bindings, transforms?)
Bind MotionValues to a Konva node:

```tsx
import { useRef, useEffect } from "react";
import Konva from "konva";
import { useMotionValue, animate } from "motion/react";
import { Rect } from "react-konva";
import { useKonvaMotion } from "@renderer/motion-konva";

const Example = () => {
  const x = useMotionValue(0);
  const ref = useRef<Konva.Rect>(null);

  useKonvaMotion(ref, { x });
  useEffect(() => {
    animate(x, 200, { duration: 1 });
  }, []);

  return <Rect ref={ref} x={0} y={40} width={120} height={40} fill="#3b82f6" />;
};
```

### createMotionKonva(Base)
Wrap react-konva primitives to accept MotionValues directly on `x`, `y`, `scaleX`, `scaleY`, `rotation`, `opacity` or via `motion={{ key: mv }}`.

```tsx
import { useMotionValue } from "motion/react";
import { Rect } from "react-konva";
import { createMotionKonva } from "@renderer/motion-konva";

const MotionRect = createMotionKonva(Rect);

const x = useMotionValue(0);
return <MotionRect x={x} y={40} width={120} height={40} fill="#3b82f6" />;
```

## Notes
- No Konva.Animation is used; layer redraws are scheduled via rAF.
- Prefer animating transform-like props: x, y, scaleX/Y, rotation, opacity.
- For many nodes in one layer, redraws are coalesced per frame.


