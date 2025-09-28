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
  createProject(name: string, midiPath: string) {
    const project = this.db
      .prepare(
        "INSERT INTO projects (name, midipath) VALUES (?, ?) RETURNING id"
      )
      .run(name, midiPath);

    return project.lastInsertRowid;
  }
}

export default ProjectsRepository;
