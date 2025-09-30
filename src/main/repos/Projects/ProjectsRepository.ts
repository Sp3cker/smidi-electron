import type { Database } from "better-sqlite3";
import type { Project } from "@shared/dto/project.dto";

class ProjectsRepository {
  constructor(private readonly db: Database) {}
  getProjects(): Project[] {
    const statement = this.db.prepare(
      "SELECT id, name, midipath AS midiPath, createdAt, base64Path AS bookmark FROM projects"
    );

    return statement.all() as Project[];
  }

  // Try to read the directory to check access
  createProject(name: string, midiPath: string, base64Path: string): number {
    const project = this.db
      .prepare(
        "INSERT INTO projects (name, midipath, base64Path) VALUES (?, ?, ?) RETURNING id"
      )
      .run(name, midiPath, base64Path);

    return Number(project.lastInsertRowid);
  }

  getProjectById(projectId: number): Project | undefined {
    const statement = this.db.prepare(
      "SELECT id, name, midipath AS midiPath, createdAt, base64Path AS bookmark FROM projects WHERE id = ?"
    );

    return statement.get(projectId) as Project | undefined;
  }

  deleteProject(projectId: number): void {
    this.db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
  }
}

export default ProjectsRepository;
