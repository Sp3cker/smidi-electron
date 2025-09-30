import { dialog, ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type ProjectService from "../services/Project/ProjectService";
import type { Project } from "@shared/dto";

const withoutBookmark = <T extends Project>(project: T) => {
  const { bookmark: _bookmark, ...rest } = project;
  return rest;
};

type CreateProjectIpcPayload = {
  name?: string;
  midiPath?: string;
};

type OpenProjectIpcPayload = {
  projectId?: number;
};

export const setProjectsIpc = (projectService: ProjectService) => {
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
      projectService.attachRenderer(event.sender);

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
        projectService.attachRenderer(event.sender);

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
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.PROJECTS.OPEN_PROJECT,
    async (event, payload: OpenProjectIpcPayload) => {
      try {
        projectService.attachRenderer(event.sender);

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
    }
  );

  ipcMain.on(IPC_CHANNELS.STOP_WATCHING, async () => {
    try {
      await projectService.stopWatching();
    } catch (error) {
      console.debug("ProjectsIpc: Error stopping watch", error);
    }
  });
};
