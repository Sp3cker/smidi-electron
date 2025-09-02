// import React, { useMemo, useRef } from "react";
// import { Stage, Layer } from "react-konva";
// import { Group, Line, Text, Rect } from "react-konva";
// import watchStore from "@renderer/store/watchStore";
// import { estimateMeasures, type EstimatedTiming } from "@shared/measure";
// import { estimateMeasuresPLP, estimateMeasuresFromUserInput, type PLPEstimation } from "@shared/measure_plp";
// import { MeasureInputs } from "./MeasureInputs";
// import type { Stage as KonvaStage } from "konva/lib/Stage";

// const PixelsPerBeatControl: React.FC<{
//   value: number;
//   onChange: (v: number) => void;
// }> = ({ value, onChange }) => {
//   return (
//     <div className="flex items-center gap-2">
//       <span className="text-sm">px/beat</span>
//       <input
//         className="border rounded px-2 py-1 w-20"
//         type="number"
//         min={4}
//         max={200}
//         value={Math.round(value)}
//         onChange={(e) => onChange(Math.max(4, Math.min(200, Number(e.target.value) || 40)))}
//       />
//     </div>
//   );
// };

// const MeasureLines: React.FC<{
//   measureStartBeats: number[];
//   pixelsPerBeat: number;
//   stageRef: React.RefObject<KonvaStage | null>;
// }> = ({ measureStartBeats, pixelsPerBeat, stageRef }) => {
//   const height = stageRef.current?.height() ?? 0;
//   return (
//     <Group>
//       {measureStartBeats.map((beats, i) => {
//         const x = beats * pixelsPerBeat;
//         return (
//           <Line
//             key={`measure-${i}`}
//             points={[x, 0, x, height]}
//             stroke="#64748b"
//             strokeWidth={4}
//           />
//         );
//       })}
//     </Group>
//   );
// };

// const MeasureLabels: React.FC<{
//   measureStartBeats: number[];
//   pixelsPerBeat: number;
// }> = ({ measureStartBeats, pixelsPerBeat }) => {
//   return (
//     <Group>
//       {measureStartBeats.map((beats, i) => {
//         if (i === 0) return null; // start label at 1
//         const x = beats * pixelsPerBeat + 4;
//         return (
//           <Text
//             key={`label-${i}`}
//             x={x}
//             y={4}
//             text={`${i}`}
//             fontSize={12}
//             fontFamily="NBit"
//             fill="#94a3b8"
//             listening={false}
//           />
//         );
//       })}
//     </Group>
//   );
// };

// const MidiNotes: React.FC<{
//   midi: any;
//   pixelsPerBeat: number;
//   bpm: number;
//   stageRef: React.RefObject<KonvaStage | null>;
// }> = ({ midi, pixelsPerBeat, bpm, stageRef }) => {
//   const height = stageRef.current?.height() ?? 0;
  
//   // Get all notes from all tracks
//   const allNotes: any[] = [];
//   for (const track of midi.tracks) {
//     for (const note of track.notes) {
//       allNotes.push(note);
//     }
//   }
  
//   // Convert time to beats
//   const timeToBeats = (time: number) => (time * bpm) / 60;
  
//   // Get pitch range for vertical positioning
//   const pitches = allNotes.map(n => n.midi);
//   const minPitch = Math.min(...pitches);
//   const maxPitch = Math.max(...pitches);
//   const pitchRange = maxPitch - minPitch + 1;
  
//   const pitchToY = (pitch: number) => {
//     const normalizedPitch = (pitch - minPitch) / pitchRange;
//     return height - 20 - (normalizedPitch * (height - 40));
//   };
  
//   return (
//     <Group>
//       {allNotes.map((note, i) => {
//         const startBeats = timeToBeats(note.time);
//         const endBeats = timeToBeats(note.time + note.duration);
//         const x1 = startBeats * pixelsPerBeat;
//         const x2 = endBeats * pixelsPerBeat;
//         const y = pitchToY(note.midi);
        
//         return (
//           <Line
//             key={`note-${i}`}
//             points={[x1, y, x2, y]}
//             stroke="#3b82f6"
//             strokeWidth={2}
//             lineCap="round"
//             listening={false}
//           />
//         );
//       })}
//     </Group>
//   );
// };

// export const MeasureEstimatorDemo: React.FC = () => {
//   const stageRef = useRef<KonvaStage | null>(null);
//   const [pixelsPerBeat, setPixelsPerBeat] = React.useState(40);
//   const [estimationMode, setEstimationMode] = React.useState<'header' | 'plp' | 'user'>('user');
//   const [userBpm, setUserBpm] = React.useState(120);
//   const [userMeasures, setUserMeasures] = React.useState(16);
//   const midiFiles = watchStore((s) => s.midiFiles);
//   const file = midiFiles[0];

//   const estHeader = useMemo<EstimatedTiming | null>(() => {
//     if (!file || estimationMode !== 'header') return null;
//     return estimateMeasures(file);
//   }, [file, estimationMode]);

//   const estPLP = useMemo<PLPEstimation | null>(() => {
//     if (!file || estimationMode !== 'plp') return null;
//     return estimateMeasuresPLP(file);
//   }, [file, estimationMode]);

//   const estUser = useMemo<PLPEstimation | null>(() => {
//     if (!file || estimationMode !== 'user') return null;
//     return estimateMeasuresFromUserInput(file, userBpm, userMeasures);
//   }, [file, estimationMode, userBpm, userMeasures]);

//   const measureStartBeats = useMemo(() => {
//     if (estHeader) {
//       return estHeader.measures.map((m) => m.startBeats);
//     }
//     if (estPLP || estUser) {
//       return (estPLP || estUser)!.measureStartBeats;
//     }
//     return [];
//   }, [estHeader, estPLP, estUser]);

//   const contentBeats = useMemo(() => {
//     if (measureStartBeats.length === 0) return 0;
//     if (estHeader) {
//       const last = estHeader.measures[estHeader.measures.length - 1];
//       return last.startBeats + last.quarterBeatsPerMeasure;
//     }
//     if (estPLP || estUser) {
//       const lastStart = measureStartBeats[measureStartBeats.length - 1];
//       return lastStart + (estPLP || estUser)!.timeSignatureNumerator;
//     }
//     return measureStartBeats[measureStartBeats.length - 1];
//   }, [measureStartBeats, estHeader, estPLP, estUser]);

//   const totalWidth = Math.ceil(contentBeats * pixelsPerBeat);

//   return (
//     <div className="space-y-3">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <span className="font-semibold">Measure Estimator</span>
//           <PixelsPerBeatControl value={pixelsPerBeat} onChange={setPixelsPerBeat} />
//           <select 
//             value={estimationMode} 
//             onChange={(e) => setEstimationMode(e.target.value as 'header' | 'plp' | 'user')}
//             className="border rounded px-2 py-1 text-sm"
//           >
//             <option value="header">Header-based</option>
//             <option value="plp">PLP (complex)</option>
//             <option value="user">User Input</option>
//           </select>
//         </div>
//         {estHeader && estimationMode === 'header' && (
//           <div className="text-sm text-slate-500 flex gap-4">
//             <span>Measures: {estHeader.totalMeasures}</span>
//             <span>Est. BPM: {Math.round(estHeader.estimatedBpm)}</span>
//             <span>PPQ: {estHeader.ppq}</span>
//             <span>File: {file?.fileName}</span>
//           </div>
//         )}
//         {estPLP && estimationMode === 'plp' && (
//           <div className="text-sm text-slate-500 flex gap-4">
//             <span>PLP BPM: {Math.round(estPLP.bpm)}</span>
//             <span>
//               Time: {estPLP.timeSignatureNumerator}/{estPLP.timeSignatureDenominator}
//             </span>
//             <span>Measures: {estPLP.measureStartTimes.length}</span>
//             <span>File: {file?.fileName}</span>
//           </div>
//         )}
//         {estUser && estimationMode === 'user' && (
//           <div className="text-sm text-slate-500 flex gap-4">
//             <span>User BPM: {Math.round(estUser.bpm)}</span>
//             <span>
//               Time: {estUser.timeSignatureNumerator}/{estUser.timeSignatureDenominator}
//             </span>
//             <span>Measures: {estUser.measureStartTimes.length}</span>
//             <span>File: {file?.fileName}</span>
//           </div>
//         )}
//       </div>

//       {/* User Input Controls */}
//       {estimationMode === 'user' && (
//         <MeasureInputs
//           bpm={userBpm}
//           totalMeasures={userMeasures}
//           onBpmChange={setUserBpm}
//           onMeasuresChange={setUserMeasures}
//         />
//       )}

//       <div className="border rounded overflow-hidden">
//         <Stage width={Math.max(600, totalWidth)} height={240} ref={stageRef}>
//           <Layer>
//             {/* Background */}
//             <Rect x={0} y={0} width={Math.max(600, totalWidth)} height={240} fill="#0f172a" />

//             {(estHeader || estPLP || estUser) && (
//               <>
//                 <MeasureLines
//                   measureStartBeats={measureStartBeats}
//                   pixelsPerBeat={pixelsPerBeat}
//                   stageRef={stageRef}
//                 />
//                 <MeasureLabels measureStartBeats={measureStartBeats} pixelsPerBeat={pixelsPerBeat} />
                
//                 {/* Show MIDI notes when using user input */}
//                 {estimationMode === 'user' && file && (
//                   <MidiNotes
//                     midi={file}
//                     pixelsPerBeat={pixelsPerBeat}
//                     bpm={userBpm}
//                     stageRef={stageRef}
//                   />
//                 )}
//               </>
//             )}
//           </Layer>
//         </Stage>
//       </div>

//       {!file && (
//         <div className="text-sm text-slate-500">Select a watch directory with MIDI files to see estimation.</div>
//       )}
//     </div>
//   );
// };

// export default MeasureEstimatorDemo;


