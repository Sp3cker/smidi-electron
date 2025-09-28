import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type ProjectService from "../services/Project/ProjectService";

export const setProjectsIpc = (projectService: ProjectService) => {
  ipcMain.handle(IPC_CHANNELS.PROJECTS.GET_PROJECTS, async (_) => {
    try {
      const projects = await projectService.getProjects();

      return { success: true, data: projects };
    } catch (error) {
      console.debug("VoicegroupsIpc: Error getting voice groups", error);
      return { success: false, error: "Error getting voice groups" };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.PROJECTS.CREATE_PROJECT,
    async (_event, payload: { name?: string; midiPath?: string }) => {
      try {
        if (!payload?.name || !payload?.midiPath) {
          return {
            success: false,
            error: "Project name and MIDI directory are required",
          };
        }

        const projectId = await projectService.createProject(
          payload.name,
          payload.midiPath
        );

        return { success: true, data: projectId };
      } catch (error) {
        console.debug("ProjectsIpc: Error creating project", error);
        return { success: false, error: "Error creating project" };
      }
    }
  );
};
