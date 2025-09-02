import { memo } from "react";

type Direction = "lr" | "tb" | "tlbr" | "trbl";

export type StatusGradientsProps = {
  /** Prefix used for gradient ids to avoid collisions, e.g., `status-123` */
  idPrefix?: string;
  /** Direction of gradient: left-right (lr), top-bottom (tb), diag tl->br (tlbr), diag tr->bl (trbl) */
  direction?: Direction;
};

const dirMap: Record<Direction, { x1: string; y1: string; x2: string; y2: string }> = {
  lr: { x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
  tb: { x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
  tlbr: { x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
  trbl: { x1: "100%", y1: "0%", x2: "0%", y2: "100%" },
};

/**
 * Drop this inside an <svg> to register three gradients:
 * - `${idPrefix}-green`
 * - `${idPrefix}-red`
 * - `${idPrefix}-grey`
 *
 * Usage:
 *   <svg>
 *     <StatusGradients idPrefix={unique} />
 *     <circle fill={`url(#${unique}-green)`} ... />
 *   </svg>
 */
function StatusGradientsBase({ idPrefix = "status", direction = "lr" }: StatusGradientsProps) {
  const { x1, y1, x2, y2 } = dirMap[direction];

  return (
    <defs>
      {/* GREEN: emerald 400 -> emerald 600 */}
      <linearGradient id={`${idPrefix}-green`} x1={x1} y1={y1} x2={x2} y2={y2}>
        <stop offset="0%" className="[stop-color:var(--yatsugi-green-1)] [stop-opacity:1]" />
        <stop offset="100%" className="[stop-color:var(--yatsugi-green-2)] [stop-opacity:1]" />
      </linearGradient>

      {/* RED: rose 400 -> rose 600 */}
      <linearGradient id={`${idPrefix}-red`} x1={x1} y1={y1} x2={x2} y2={y2}>
        <stop offset="0%" className="[stop-color:theme(colors.rose.400)] [stop-opacity:1]" />
        <stop offset="100%" className="[stop-color:theme(colors.rose.600)] [stop-opacity:1]" />
      </linearGradient>

      {/* GREY: zinc 400 -> zinc 600 */}
      <linearGradient id={`${idPrefix}-grey`} x1={x1} y1={y1} x2={x2} y2={y2}>
        <stop offset="0%" className="[stop-color:theme(colors.zinc.400)] [stop-opacity:1]" />
        <stop offset="100%" className="[stop-color:theme(colors.zinc.600)] [stop-opacity:1]" />
      </linearGradient>
    </defs>
  );
}

export const StatusGradients = memo(StatusGradientsBase);
export default StatusGradients;
