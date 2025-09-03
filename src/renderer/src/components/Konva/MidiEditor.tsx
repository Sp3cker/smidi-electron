import { Stage, Layer, Rect, Line, Group } from "react-konva";
const getRootFontSize = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

// Option A: Quarter-note scale
export const ticksToRem_Q = (ticks: number, ppq: number, remPerQuarter = 1) =>
  (ticks / ppq) * remPerQuarter;

export const ticksToPx_Q = (ticks: number, ppq: number) =>
  ticksToRem_Q(ticks, ppq, 1) * getRootFontSize();

const Grid = ({ ppq }) => {
  // 96 ppq, *or* between each quarter note bar, there are 96 ticks
  // Therefore, whatever we make as space amount between quarter notes will be 96 ticks wide
  // 1rem seems like a good width.
  // we will make 24 ticks 0.25rem wide
  const pixelSpaceBetweenQuarterNotes = 16; // This could be the stroke of a
  const quarterNoteLineStroke = 4;
  const horizontalBars = 32; // Useful width mimicing a DAW
  const barsToDraw = Array.from({ length: horizontalBars }, (_, i) => i);
  <Layer>
    {/*Horizontal Grid Layer */}
    {barsToDraw.map((_, i) => {
      const barX = i * ticksToPx_Q(96, ppq);
      return (
        <Group key={i} x={barX}>
          {/* Bar boundary */}
          <Line
            points={[0, 0, 0, rowHeight * pitches.length]}
            stroke="black"
            strokeWidth={2}
          />
          {/* Subdivisions (e.g., beats) */}
          {Array.from({ length: timeSig[0] }).map((_, b) => (
            <Line
              key={b}
              points={[
                (b * pixelsPerBar) / timeSig[0],
                0,
                (b * pixelsPerBar) / timeSig[0],
                rowHeight * pitches.length,
              ]}
              stroke="gray"
              strokeWidth={1}
              dash={[5, 5]}
            />
          ))}
          {/* Finer 128-grid if zoomed */}
        </Group>
      );
    })}
  </Layer>;
};
function MidiEditor({ processed }) {
  const { measures, bars, timeSig } = processed;
  const rowHeight = 6; // Pitch row height
  const pixelsPerBar = 200; // Adjustable via zoom
  const slotWidth = pixelsPerBar / 128;
  const visibleStartBar = 0; // From scroll state
  const visibleBarsCount = 4; // Viewport

  // Calc visible pitches (e.g., MIDI 36-96)
  const pitches = Array.from({ length: 60 }, (_, i) => 36 + i).reverse(); // Bottom-up

  return (
    <Stage
      width={pixelsPerBar * visibleBarsCount}
      height={rowHeight * pitches.length}
    >
      <Layer>
        {/* Notes Layer */}
        {bars
          .slice(visibleStartBar, visibleStartBar + visibleBarsCount)
          .map((bar) => {
            const barX = (bar - visibleStartBar) * pixelsPerBar;
            return (
              <Group key={bar} x={barX}>
                {measures[bar]?.map((seg, idx) => {
                  const y = (127 - seg.midi) * rowHeight; // Pitch to y-pos
                  const ticksPerBar = timeSig[0] * 4; // Assuming 4/4 time signature
                  const x = (seg.offsetTicksInBar / ticksPerBar) * pixelsPerBar;
                  const width =
                    (seg.durationTicksInBar / ticksPerBar) * pixelsPerBar;
                  return (
                    <Rect
                      key={idx}
                      x={x}
                      y={y}
                      width={width}
                      height={rowHeight}
                      fill={`rgba(100, 150, 55, ${seg.velocity})`} // Velocity opacity
                      cornerRadius={2}
                      // draggable // For editing
                      //   onDragEnd={/* Update seg.offset128, snap to slotWidth */}
                    />
                  );
                })}
              </Group>
            );
          })}
      </Layer>
    </Stage>
  );
}

export default MidiEditor;
