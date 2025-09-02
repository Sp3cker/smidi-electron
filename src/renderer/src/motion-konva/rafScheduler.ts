// Lightweight rAF-based Konva layer draw scheduler to coalesce redraws
// Avoids Konva.Animation; safe to call from any hook

import Konva from "konva";

type LayerLike = Konva.Layer | null | undefined;

const scheduledLayers = new Set<Konva.Layer>();
let rafId: number | null = null;

function flush() {
  // Draw once per frame, batch by layer
  scheduledLayers.forEach((layer) => {
    try {
      layer.batchDraw();
    } catch {
      // ignore if layer is disposed
    }
  });
  scheduledLayers.clear();
  rafId = null;
}

export function scheduleLayerDraw(layer: LayerLike) {
  if (!layer) return;
  scheduledLayers.add(layer);
  if (rafId == null) {
    rafId = requestAnimationFrame(flush);
  }
}
