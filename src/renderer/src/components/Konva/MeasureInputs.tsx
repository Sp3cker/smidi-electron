import React from "react";

export interface MeasureInputsProps {
  bpm: number;
  totalMeasures: number;
  onBpmChange: (bpm: number) => void;
  onMeasuresChange: (measures: number) => void;
}

export const MeasureInputs: React.FC<MeasureInputsProps> = ({
  bpm,
  totalMeasures,
  onBpmChange,
  onMeasuresChange,
}) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-slate-100 rounded">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">BPM:</label>
        <input
          type="number"
          min="40"
          max="300"
          value={bpm}
          onChange={(e) => onBpmChange(Math.max(40, Math.min(300, Number(e.target.value) || 120)))}
          className="border rounded px-2 py-1 w-20 text-sm"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Measures:</label>
        <input
          type="number"
          min="1"
          max="1000"
          value={totalMeasures}
          onChange={(e) => onMeasuresChange(Math.max(1, Math.min(1000, Number(e.target.value) || 16)))}
          className="border rounded px-2 py-1 w-20 text-sm"
        />
      </div>
      
      <div className="text-xs text-slate-600">
        Duration: {((totalMeasures * 4 * 60) / bpm).toFixed(1)}s
      </div>
    </div>
  );
};

export default MeasureInputs;


