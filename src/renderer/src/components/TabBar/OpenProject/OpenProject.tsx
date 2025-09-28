import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@renderer/ui/Button";
import type { Project } from "@shared/dto";

type OpenProjectDropdownProps = {
  onClose: () => void;
  onOpen: (project: Project) => void;
};

const OpenProjectDropdown = ({ onClose, onOpen }: OpenProjectDropdownProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(
    (options?: { isCancelled?: () => boolean }) => {
      setIsLoading(true);
      setError(null);

      return window.api
        .getProjects()
        .then((response) => {
          if (options?.isCancelled?.()) return;
          if (response.success) {
            setProjects(response.data ?? []);
          } else {
            setError(response.error ?? "Unable to load projects");
          }
        })
        .catch((err: unknown) => {
          if (options?.isCancelled?.()) return;
          setError(
            err instanceof Error ? err.message : "Unable to load projects"
          );
        })
        .finally(() => {
          if (options?.isCancelled?.()) return;
          setIsLoading(false);
        });
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    loadProjects({ isCancelled: () => cancelled }).catch(() => {
      /* handled in loadProjects */
    });

    return () => {
      cancelled = true;
    };
  }, [loadProjects]);

  const selectedProject = useMemo(() => {
    if (selectedProjectId == null) return null;
    return projects.find((project) => project.id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);
  
  console.log("selectedProject", selectedProject);
  const handleOpenProject = () => {
    if (!selectedProject) {
      return;
    }

    onOpen(selectedProject);
  };

  const handleProjectClick = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  return (
    <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-lg border border-[var(--yatsugi-grey-1)] bg-[var(--color-neir-darkest)] p-2">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm/4 font-bold text-[var(--yatsugi-white-1)]">
          Open Project
        </h3>

        {isLoading ? (
          <p className="text-xs text-[var(--yatsugi-grey-2)]">
            Loading projects...
          </p>
        ) : error ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[var(--yatsugi-red-1)]">{error}</p>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedProjectId(null);
                loadProjects().catch(() => {
                  /* handled in loadProjects */
                });
              }}
              disabled={isLoading}
              className="self-start rounded-md px-3 py-1 border border-[var(--yatsugi-grey-1)]">
              Retry
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-xs text-[var(--yatsugi-grey-2)]">
            No projects found. Create one to get started.
          </p>
        ) : (
          <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
            {projects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => handleProjectClick(project.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left transition-colors duration-150 focus:outline-none
                      ${isSelected ? "border-[var(--yatsugi-blue-600)] bg-[var(--color-neir-dark)]" : "border-[var(--yatsugi-grey-1)] bg-[var(--color-neir-darkest)]"}
                    `}>
                    <span className="block text-sm font-semibold text-[var(--yatsugi-white-1)]">
                      {project.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--yatsugi-grey-2)]">
                      {project.midiPath}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-[var(--yatsugi-white-2)] bg-transparent">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleOpenProject}
            disabled={!selectedProject || isLoading}
            className="rounded-md py-1 bg-[var(--yatsugi-blue-600)] text-[var(--yatsugi-white-1)]">
            Open
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenProjectDropdown;
