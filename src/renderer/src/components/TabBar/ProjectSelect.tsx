import { useEffect, useRef, useState } from "react";
import { useWatchStore } from "@renderer/store";
import { Button } from "@renderer/ui/Button";
import NewProjectDropdown from "./NewProject";
import OpenProjectDropdown from "./OpenProject/OpenProject";
import type { Project } from "@shared/dto";

const ProjectSelect = () => {
  const { selectedProjectName, setSelectedProject, setDirectory } =
    useWatchStore();
  const [activeModal, setActiveModal] = useState<"new" | "open" | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeModal) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (dropdownRef.current?.contains(event.target as Node)) {
        return;
      }
      setActiveModal(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const handleToggle = (modal: "new" | "open") => {
    setActiveModal((current) => (current === modal ? null : modal));
  };

  const handleCreateProject = (projectName: string, midiPath: string) => {
    void window.api
      .createProject(projectName, midiPath)
      .then((result) => {
        if (!result?.success) {
          console.error("Failed to create project", result?.error);
          return;
        }
        if (result.data === null || result.data === undefined) {
          console.error("Failed to create project, no project ID returned");
          return;
        }
        setSelectedProject({
          name: projectName,
          midiPath: midiPath,
          id: result.data,
        });
        setDirectory(midiPath);
        setActiveModal(null);
      })
      .catch((error) => {
        console.error("Error creating project", error);
      });
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    if (project.midiPath) {
      setDirectory(project.midiPath);
    }
    setActiveModal(null);
  };

  return (
    <div className="flex flex-col gap-2 text-left">
      <p className="text-sm ">
        Project: <span>{selectedProjectName || "None"}</span>
      </p>
      <div ref={dropdownRef} className="relative w-fit">
        <div className="flex gap-2">
          <Button onClick={() => handleToggle("new")}>New</Button>
          <Button onClick={() => handleToggle("open")}>Open</Button>
        </div>
        {activeModal === "new" ? (
          <NewProjectDropdown
            onClose={() => setActiveModal(null)}
            onCreate={handleCreateProject}
          />
        ) : null}
        {activeModal === "open" ? (
          <OpenProjectDropdown
            onClose={() => setActiveModal(null)}
            onOpen={handleOpenProject}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ProjectSelect;
