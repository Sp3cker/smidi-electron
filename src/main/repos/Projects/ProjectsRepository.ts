import type { Database } from "better-sqlite3";
import type { Project } from "@shared/dto/project.dto";

class ProjectsRepository {
  constructor(private readonly db: Database) {}
  getProjects(): Project[] {
    const statement = this.db.prepare(
      "SELECT id, name, midipath AS midiPath, createdAt FROM projects"
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
}

export default ProjectsRepository;
