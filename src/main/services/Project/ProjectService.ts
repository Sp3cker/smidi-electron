import type ProjectsRepository from "../../repos/Projects/ProjectsRepository";
import type { Project } from "@shared/dto";

class ProjectService {
  private readonly projectsRepository: ProjectsRepository;
  constructor(projectsRepository: ProjectsRepository) {
    this.projectsRepository = projectsRepository;
  }

  async getProjects(): Promise<Project[]> {
    try {
      return this.projectsRepository.getProjects();
    } catch (error) {
      throw new Error("ProjectService: error getting projects" + error);
    }
  }

  async createProject(name: string, midiPath: string) {
    try {
      return this.projectsRepository.createProject(name, midiPath);
    } catch (error) {
      throw new Error("ProjectService: error creating project" + error);
    }
  }
}

export default ProjectService;
