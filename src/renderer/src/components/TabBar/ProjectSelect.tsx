import { useEffect, useRef, useState } from "react";
import { useWatchStore, watchStore } from "@renderer/store";
import { Button } from "@renderer/ui/Button";
import NewProjectDropdown from "./NewProject";
import OpenProjectDropdown from "./OpenProject/OpenProject";
import type { Project } from "@shared/dto";

const ProjectSelect = () => {
  const { selectedProjectName, setSelectedProject } = useWatchStore();
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
        if (!result || !result.success) {
          const message = result && "error" in result ? result.error : undefined;
          console.error("Failed to create project", message);
          return;
        }
        if (!result.data?.project) {
          console.error("Failed to create project, no project returned");
          return;
        }
        setSelectedProject(result.data.project);
        if (result.data.midiFiles) {
          watchStore.getState().setMidiFiles(result.data.midiFiles);
        }
        setActiveModal(null);
      })
      .catch((error) => {
        console.error("Error creating project", error);
      });
  };

  const handleOpenProject = (project: Project) => {
    void window.api
      .openProject(project.id)
      .then((result) => {
        if (!result || !result.success || !result.data?.project) {
          const message = result && "error" in result ? result.error : undefined;
          console.error("Failed to open project", message);
          return;
        }

        setSelectedProject(result.data.project);
        if (result.data.midiFiles) {
          watchStore.getState().setMidiFiles(result.data.midiFiles);
        }
        setActiveModal(null);
      })
      .catch((error) => {
        console.error("Error opening project", error);
      });
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
