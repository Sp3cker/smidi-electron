import { dialog, ipcMain, type WebContents } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type ProjectService from "../services/Project/ProjectService";
import type { ParsedMidiTrack, Project } from "@shared/dto";
import type { ProjectServiceEvents } from "../services/Project/ProjectService";

const withoutBookmark = <T extends Project>(project: T) => {
  const { bookmark, ...rest } = project;
  void bookmark;
  return rest;
};

type CreateProjectIpcPayload = {
  name?: string;
  midiPath?: string;
};

type OpenProjectIpcPayload = {
  projectId?: number;
};

const createProjectEvents = (
  getRenderer: () => WebContents | undefined,
): ProjectServiceEvents => ({
  onMidiFiles: (midiFiles: ParsedMidiTrack[]) => {
    getRenderer()?.send(IPC_CHANNELS.MIDI_MAN.MIDI_FILES, midiFiles);
  },
  onWatchDirectory: (directory: string) => {
    getRenderer()?.send(IPC_CHANNELS.SET_WATCH_DIRECTORY, directory);
  },
  onWatchStatusChanged: (status: boolean) => {
    getRenderer()?.send(IPC_CHANNELS.WATCH_STATUS_CHANGED, status);
  },
  onAppError: (error: unknown) => {
    const normalizedError =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            origin: "ProjectService",
          }
        : {
            message: String(error),
            origin: "ProjectService",
          };

    getRenderer()?.send(IPC_CHANNELS.APP_ERROR, {
      success: false,
      error: normalizedError,
    });
  },
});

export const setProjectsIpc = (projectService: ProjectService) => {
  let currentRenderer: WebContents | undefined;

  const getRenderer = () => currentRenderer;

  projectService.attachEvents(createProjectEvents(getRenderer));
  ipcMain.handle(IPC_CHANNELS.PROJECTS.GET_PROJECTS, async () => {
    try {
      const projects = await projectService.getProjects();
      return {
        success: true,
        data: projects.map((project) => withoutBookmark(project)),
      };
    } catch (error) {
      console.debug("ProjectsIpc: Error getting projects", error);
      return { success: false, error: "Error getting projects" };
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROMPT_MIDI_DIRECTORY, async (event) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory", "createDirectory"],
        securityScopedBookmarks: true,
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: "Directory selection was cancelled" };
      }

      const directory = result.filePaths[0];
      currentRenderer = event.sender;

      const bookmark = result.bookmarks?.[0];
      projectService.cacheBookmark(directory, bookmark);

      return {
        success: true,
        data: {
          directory,
        },
      };
    } catch (error) {
      console.debug("ProjectsIpc: Error prompting for directory", error);
      return { success: false, error: "Failed to open directory picker" };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.PROJECTS.CREATE_PROJECT,
    async (event, payload: CreateProjectIpcPayload) => {
      try {
        currentRenderer = event.sender;

        if (!payload?.name || !payload?.midiPath) {
          return {
            success: false,
            error: "Project name and directory are required",
          };
        }

        const result = await projectService.createProject({
          name: payload.name,
          midiPath: payload.midiPath,
        });

        return { success: true, data: result };
      } catch (error) {
        console.debug("ProjectsIpc: Error creating project", error);
        return { success: false, error: "Error creating project" };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.PROJECTS.OPEN_PROJECT,
    async (event, payload: OpenProjectIpcPayload) => {
      try {
        currentRenderer = event.sender;

        if (!payload?.projectId) {
          return {
            success: false,
            error: "Project ID is required",
          };
        }

        const result = await projectService.openProject(payload.projectId);

        return { success: true, data: result };
      } catch (error) {
        console.debug("ProjectsIpc: Error opening project", error);
        return { success: false, error: "Error opening project" };
      }
    },
  );

  ipcMain.on(IPC_CHANNELS.STOP_WATCHING, async () => {
    try {
      await projectService.stopWatching();
    } catch (error) {
      console.debug("ProjectsIpc: Error stopping watch", error);
    }
  });
};
