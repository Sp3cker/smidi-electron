import { app } from "electron";
import { readdir } from "fs/promises";
import { join } from "path";
import FileWatcher from "../../lib/FileWatcher";
import type ProjectsRepository from "../../repos/Projects/ProjectsRepository";
import type { NoteSegment, ParsedMidiTrack, Project } from "@shared/dto";
import { MidiFile } from "@shared/MidiFile";

type CreateProjectPayload = {
  name: string;
  midiPath: string;
  bookmark?: string;
};

type StartWorkspaceResult = {
  project: Project;
  midiFiles: ParsedMidiTrack[];
};

type PersistedProject = Project & { bookmark: string };

export interface ProjectServiceEvents {
  onMidiFiles: (midiFiles: ParsedMidiTrack[]) => void;
  onWatchDirectory: (directory: string) => void;
  onWatchStatusChanged: (status: boolean) => void;
  onAppError: (error: unknown) => void;
}

class ProjectService {
  private readonly projectsRepository: ProjectsRepository;
  private events: ProjectServiceEvents | null = null;
  private watcher: FileWatcher | null = null;
  private stopAccessingSecurityScope: (() => void) | null = null;
  private activeProject: PersistedProject | null = null;
  private readonly pendingBookmarks: Map<string, string> = new Map();

  constructor(projectsRepository: ProjectsRepository) {
    this.projectsRepository = projectsRepository;
  }

  attachEvents(events: ProjectServiceEvents) {
    this.events = events;
  }

  async getProjects(): Promise<Project[]> {
    return this.projectsRepository.getProjects();
  }

  async createProject({
    name,
    midiPath,
    bookmark,
  }: CreateProjectPayload): Promise<StartWorkspaceResult> {
    const bookmarkForProject =
      bookmark ??
      this.consumeBookmark(midiPath) ??
      this.generateBookmarkFallback(midiPath);

    const projectId = this.projectsRepository.createProject(
      name,
      midiPath,
      bookmarkForProject,
    );

    const project: PersistedProject = {
      id: projectId,
      name,
      midiPath,
      bookmark: bookmarkForProject,
    };
    try {
      const midiFiles = await this.startWorkspace(project);
      const { bookmark: _bookmark, ...safeProject } = project;
      return { project: safeProject, midiFiles };
    } catch (error) {
      this.projectsRepository.deleteProject(projectId);
      throw error;
    }
  }

  async openProject(projectId: number): Promise<StartWorkspaceResult> {
    const project = this.projectsRepository.getProjectById(projectId) as
      | PersistedProject
      | undefined;

    if (!project) {
      throw new Error(`ProjectService: Project ${projectId} not found`);
    }

    const midiFiles = await this.startWorkspace(project);

    const { bookmark: _bookmark, ...safeProject } = project;

    return { project: safeProject, midiFiles };
  }

  async stopWatching() {
    await this.teardownWatcher();
    this.activeProject = null;
    this.emitWatchStatusChanged(false);
    this.emitWatchDirectory("");
  }

  cacheBookmark(directory: string, bookmark?: string) {
    const bookmarkValue = bookmark ?? this.generateBookmarkFallback(directory);
    this.pendingBookmarks.set(directory, bookmarkValue);
  }

  private async startWorkspace(
    project: PersistedProject,
  ): Promise<ParsedMidiTrack[]> {
    await this.teardownWatcher();

    this.activeProject = project;

    this.maybeStartSecurityScopedAccess(project.bookmark);
    try {
      const midiFiles = await this.loadMidiFiles(project.midiPath);

      this.emitWatchDirectory(project.midiPath);
      this.emitMidiFiles(midiFiles);
      this.emitWatchStatusChanged(true);

      await this.setupWatcher(project.midiPath);

      return midiFiles;
    } catch (error) {
      await this.teardownWatcher();
      this.activeProject = null;
      this.emitWatchStatusChanged(false);
      throw error;
    }
  }

  private async setupWatcher(directory: string) {
    this.watcher = new FileWatcher(directory);

    this.watcher.emitter.on("change", () => {
      void this.refreshMidiDirectory();
    });

    this.watcher.emitter.on("add", () => {
      void this.refreshMidiDirectory();
    });

    this.watcher.emitter.on("unlink", () => {
      void this.refreshMidiDirectory();
    });

    this.watcher.emitter.on("ready", () => {
      this.emitWatchStatusChanged(true);
    });
  }

  private async refreshMidiDirectory() {
    if (!this.activeProject) {
      return;
    }

    try {
      const midiFiles = await this.loadMidiFiles(this.activeProject.midiPath);

      this.emitMidiFiles(midiFiles);
    } catch (error) {
      this.emitAppError(error);
    }
  }

  private async teardownWatcher() {
    if (this.watcher) {
      await this.watcher.stop();
      this.watcher = null;
    }

    if (this.stopAccessingSecurityScope) {
      try {
        this.stopAccessingSecurityScope();
      } catch (error) {
        console.warn(
          "ProjectService: error stopping security scoped resource",
          error,
        );
      }
      this.stopAccessingSecurityScope = null;
    }
  }

  private maybeStartSecurityScopedAccess(bookmark: string) {
    if (typeof app.startAccessingSecurityScopedResource !== "function") {
      return;
    }

    try {
      const stopAccessing = app.startAccessingSecurityScopedResource(bookmark);
      if (typeof stopAccessing === "function") {
        this.stopAccessingSecurityScope = () => {
          stopAccessing();
        };
      }
    } catch (error) {
      console.warn(
        "ProjectService: unable to start security scoped access",
        error,
      );
    }
  }

  private consumeBookmark(directory: string): string | undefined {
    const bookmark = this.pendingBookmarks.get(directory);
    if (bookmark) {
      this.pendingBookmarks.delete(directory);
      return bookmark;
    }
    return undefined;
  }

  private generateBookmarkFallback(directory: string): string {
    return Buffer.from(directory).toString("base64");
  }

  private async loadMidiFiles(directory: string): Promise<ParsedMidiTrack[]> {
    const files = await readdir(directory);
    const midiFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".mid"),
    );

    if (midiFiles.length === 0) {
      throw new Error("ProjectService: No MIDI files found in directory");
    }

    const parsed = await Promise.all(
      midiFiles.map(async (file) => {
        const midi = await MidiFile.fromFile(join(directory, file));
        console.log(
          `Loaded MIDI file: ${midi.fileName} (${midi.tracks.length} tracks)`,
        );
        return parseMidiToResolution(midi);
      }),
    );

    return parsed;
  }

  private emitMidiFiles(midiFiles: ParsedMidiTrack[]) {
    this.events?.onMidiFiles(midiFiles);
  }

  private emitWatchDirectory(directory: string) {
    this.events?.onWatchDirectory(directory);
  }

  private emitWatchStatusChanged(status: boolean) {
    this.events?.onWatchStatusChanged(status);
  }

  private emitAppError(error: unknown) {
    this.events?.onAppError(error);
  }
}

export default ProjectService;

export function parseMidiToResolution(midi: MidiFile): ParsedMidiTrack {
  const ppq = midi.header.ppq;
  const [numerator, denominator] = midi.header.timeSignatures[0]
    ?.timeSignature ?? [4, 4];
  const ticksPerMeasure = numerator * ppq * (4 / denominator);
  const track = midi.tracks[0];

  if (!track || track.notes.length === 0) {
    return {
      trackName: midi.fileName,
      sourcePath: midi.filePath,
      pitchRange: { lowest: 0, highest: 0 },
      measures: [],
      measureCount: 0,
      lastMeasureIndex: -1,
      ticksPerMeasure,
      timeSignature: {
        beatsPerBar: numerator,
        beatUnit: denominator,
      },
    };
  }

  const highestNoteInMidi = Math.max(...track.notes.map((note) => note.midi));
  const lowestNoteInMidi = Math.min(...track.notes.map((note) => note.midi));
  const measureSegments = new Map<number, NoteSegment[]>();
  track.notes.forEach((note) => {
    const durationTicksTotal = note.durationTicks;
    let remainingTicks = durationTicksTotal;
    let currentMeasure = Math.floor(note.ticks / ticksPerMeasure);
    let offsetTicksInBar = note.ticks % ticksPerMeasure;

    while (remainingTicks > 0) {
      if (!measureSegments.has(currentMeasure)) {
        measureSegments.set(currentMeasure, []);
      }

      const ticksLeftInBar = ticksPerMeasure - offsetTicksInBar;
      const chunkTicks = Math.min(remainingTicks, ticksLeftInBar);

      const segment: NoteSegment = {
        midi: note.midi,
        name: note.name,
        velocity: note.velocity,
        offsetTicksInBar,
        durationTicksInBar: chunkTicks,
        startTick: note.ticks + (durationTicksTotal - remainingTicks),
        endTick:
          note.ticks + (durationTicksTotal - remainingTicks) + chunkTicks,
        originalNote: note,
      };

      measureSegments.get(currentMeasure)?.push(segment);

      remainingTicks -= chunkTicks;
      currentMeasure += 1;
      offsetTicksInBar = 0;
    }
  });

  const measures = Array.from(measureSegments.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([index, segments]) => ({
      index,
      segments: segments.sort(
        (a, b) => a.offsetTicksInBar - b.offsetTicksInBar || b.midi - a.midi,
      ),
    }));

  const lastMeasureIndex = measures.length
    ? measures[measures.length - 1].index
    : -1;

  return {
    trackName: midi.fileName,
    sourcePath: midi.filePath,
    pitchRange: { lowest: lowestNoteInMidi, highest: highestNoteInMidi },
    measures,
    measureCount: measures.length,
    lastMeasureIndex,
    ticksPerMeasure,
    timeSignature: {
      beatsPerBar: numerator,
      beatUnit: denominator,
    },
  };
}
