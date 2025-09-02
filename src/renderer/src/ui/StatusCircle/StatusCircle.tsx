import { useId, useMemo } from "react";
import StatusGradients from "./StatusGradients";

export function StatusCircle({
  label,
  defaultToRed = true,
  indicateSuccess,
  beGray,
}: {
  label?: string;
  indicateSuccess: boolean;
  defaultToRed?: boolean;
  beGray?: boolean;
}) {
  const rawId = useId();
  const idPrefix = useMemo(() => `status-${rawId.replace(/:/g, "")}`, [rawId]);

  // (optional solid fallback removed)

  return (
    <div className="h-5 w-90 flex flex-row items-center p-1">
      <svg
        width="16"
        height="12"
        viewBox="0 0 16 16"
        className="drop-shadow-2xl"
      >
        <StatusGradients idPrefix={idPrefix} direction="tb" />
        <circle
          cx="8"
          cy="8"
          r="8"
          className="stroke-[var(--yatsugi-grey-2)] stroke drop-shadow-2xl"
          fill={`url(#${beGray ? `${idPrefix}-grey` : indicateSuccess ? `${idPrefix}-green` : `${idPrefix}-red`}`}
        />
      </svg>
      <p className="pkmn-types font-pkmnem p-1 text-lg font-bold">{label}</p>
    </div>
  );
}
