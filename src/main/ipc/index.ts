import { setConfigIpc } from "./configIpc";
import { setVoicegroupsIpc } from "./voicegroupsIpc";
import { setProjectsIpc } from "./projectsIpc";
import type VoicegroupsService from "../services/Voicegroups/VoicegroupsService";
import type ProjectService from "../services/Project/ProjectService";
import type Config from "../services/Config/Config";

const assignIPCtoServices = (
  configInstance: Config,
  voicegroupsInstance: VoicegroupsService,
  projectInstance: ProjectService
) => {
  setConfigIpc(configInstance);
  setVoicegroupsIpc(voicegroupsInstance);
  setProjectsIpc(projectInstance);
};

export default assignIPCtoServices;
