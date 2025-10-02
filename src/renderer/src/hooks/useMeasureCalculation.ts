import { useState, useEffect, useCallback } from "react";

export interface MeasureCalculationOptions {
  /** Width of each measure in pixels */
  pixelsPerMeasure?: number;
  /** Beats per measure (default: 4 for 4/4 time) */
  beatsPerMeasure?: number;
  /** Minimum pixels per beat */
  minPixelsPerBeat?: number;
  /** Maximum pixels per beat */
  maxPixelsPerBeat?: number;
}

export interface MeasureCalculationResult {
  /** Number of measures that can fit on screen */
  measuresOnScreen: number;
  /** Actual pixels per beat being used */
  pixelsPerBeat: number;
  /** Total width needed for all measures */
  totalWidth: number;
  /** Whether the calculation is based on minimum constraints */
  isConstrained: boolean;
}

/**
 * Hook to calculate how many musical measures can fit on screen
 * based on the parent container's width
 */
export const useMeasureCalculation = (
  parentWidth: number,
  totalMeasures: number,
  options: MeasureCalculationOptions = {}
) => {
  const {
    pixelsPerMeasure = 64,
    beatsPerMeasure = 4,
    minPixelsPerBeat = 8,
    maxPixelsPerBeat = 32,
  } = options;

  const [result, setResult] = useState<MeasureCalculationResult>({
    measuresOnScreen: 0,
    pixelsPerBeat: pixelsPerMeasure / beatsPerMeasure,
    totalWidth: 0,
    isConstrained: false,
  });

  const calculateMeasures = useCallback(() => {
    if (parentWidth <= 0 || totalMeasures <= 0) {
      setResult({
        measuresOnScreen: 0,
        pixelsPerBeat: pixelsPerMeasure / beatsPerMeasure,
        totalWidth: 0,
        isConstrained: false,
      });
      return;
    }

    // Calculate ideal pixels per beat to fit all measures
    const idealPixelsPerBeat = parentWidth / (totalMeasures * beatsPerMeasure);

    // Apply constraints
    const constrainedPixelsPerBeat = Math.max(
      minPixelsPerBeat,
      Math.min(maxPixelsPerBeat, idealPixelsPerBeat)
    );

    const isConstrained = constrainedPixelsPerBeat !== idealPixelsPerBeat;

    // Calculate how many measures can actually fit
    const measuresOnScreen = Math.floor(
      parentWidth / (constrainedPixelsPerBeat * beatsPerMeasure)
    );
    const totalWidth =
      totalMeasures * constrainedPixelsPerBeat * beatsPerMeasure;

    setResult({
      measuresOnScreen,
      pixelsPerBeat: constrainedPixelsPerBeat,
      totalWidth,
      isConstrained,
    });
  }, [
    parentWidth,
    totalMeasures,
    pixelsPerMeasure,
    beatsPerMeasure,
    minPixelsPerBeat,
    maxPixelsPerBeat,
  ]);

  useEffect(() => {
    calculateMeasures();
  }, [calculateMeasures]);

  return result;
};


