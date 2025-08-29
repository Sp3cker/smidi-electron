import type { Database } from "better-sqlite3";

type ProjectRow = {
  name: string;
  createdAt: string;
};

class ProjectsRepository {
  constructor(private readonly db: Database) {}
  getProjects() {
    const projects = this.db
      .prepare<ProjectRow[]>("SELECT name, createdAt FROM projects")
      .all();

    return projects;
  }
  createProject(name: string) {
    const project = this.db
      .prepare("INSERT INTO projects (name) VALUES (?) RETURNING id")
      .run(name);

    return project.lastInsertRowid;
  }
}

export default ProjectsRepository;
