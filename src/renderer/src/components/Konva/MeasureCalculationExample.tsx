import React, { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { MeasureGrid, BeatGrid } from './Grid';
import { useMeasureCalculation, useParentWidth } from '../../hooks/useMeasureCalculation';

/**
 * Example component demonstrating the measure calculation system
 */
export const MeasureCalculationExample: React.FC = () => {
  const [totalMeasures, setTotalMeasures] = useState(16); // 16 measures
  const [showBeatGrid, setShowBeatGrid] = useState(false);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get parent width
  const parentWidth = useParentWidth(containerRef as React.RefObject<HTMLElement>);

  // Calculate measures that fit on screen
  const measureCalculation = useMeasureCalculation(parentWidth, totalMeasures, {
    minPixelsPerBeat: 8,
    maxPixelsPerBeat: 32,
  });

  const totalBeats = totalMeasures * 4; // 4 beats per measure

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Measure Calculation Example</h3>
        
        {/* Controls */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <span>Total Measures:</span>
            <input
              type="number"
              value={totalMeasures}
              onChange={(e) => setTotalMeasures(Math.max(1, parseInt(e.target.value) || 1))}
              className="border rounded px-2 py-1 w-20"
              min="1"
              max="100"
            />
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBeatGrid}
              onChange={(e) => setShowBeatGrid(e.target.checked)}
            />
            <span>Show Beat Grid</span>
          </label>
        </div>

        {/* Debug Info */}
        <div className="text-sm text-gray-600 p-3 bg-gray-100 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div>Parent Width: {parentWidth}px</div>
            <div>Measures on Screen: {measureCalculation.measuresOnScreen}</div>
            <div>Pixels per Beat: {measureCalculation.pixelsPerBeat.toFixed(1)}</div>
            <div>Total Measures: {totalMeasures}</div>
            <div>Constrained: {measureCalculation.isConstrained ? 'Yes' : 'No'}</div>
            <div>Total Width: {measureCalculation.totalWidth.toFixed(0)}px</div>
          </div>
        </div>
      </div>

      {/* Konva Stage */}
      <div ref={containerRef} className="border border-gray-300 rounded">
        <Stage
          width={parentWidth || 800}
          height={400}
          ref={stageRef}
        >
          <Layer>
            {/* Measure-based grid */}
            <MeasureGrid
              totalMeasures={totalMeasures}
              pixelsPerBeat={measureCalculation.pixelsPerBeat}
              stageRef={stageRef}
              showMeasureLabels={true}
            />

            {/* Optional: Beat grid for finer granularity */}
            {showBeatGrid && (
              <BeatGrid
                totalBeats={totalBeats}
                pixelsPerBeat={measureCalculation.pixelsPerBeat}
                stageRef={stageRef}
                showBeatLabels={false}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-2">
        <h4 className="font-semibold">How it works:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>The system calculates how many measures can fit on screen based on the parent container's width</li>
          <li>It automatically adjusts the pixels per beat to fit all measures, within min/max constraints</li>
          <li>If the content is too wide, it will constrain to the minimum pixels per beat and show fewer measures</li>
          <li>Try resizing the browser window to see the dynamic calculation in action</li>
          <li>Toggle the beat grid to see finer granularity within measures</li>
        </ul>
      </div>
    </div>
  );
};
