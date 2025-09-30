import { Input } from "@renderer/ui/Input";
import { Button } from "@renderer/ui/Button";
import { FormEvent, useEffect, useRef, useState } from "react";

type NewProjectDropdownProps = {
  onClose: () => void;
  onCreate: (name: string, midiPath: string) => void;
};

const NewProjectDropdown = ({ onClose, onCreate }: NewProjectDropdownProps) => {
  const [projectName, setProjectName] = useState("");
  const [inputDirectory, setInputDirectory] = useState("");
  const projectNameIsValid = projectName.trim().length > 0;

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleBrowse = () => {
    window.api.promptMidiDirectory().then((result) => {
      if (!result?.success) {
        console.error("Failed to select directory", result?.error);
        return;
      }

      setInputDirectory(result.data.directory);
    });
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectNameIsValid || !inputDirectory.trim()) {
      return;
    }
    onCreate(projectName.trim(), inputDirectory.trim());
    setProjectName("");
    setInputDirectory("");
  };

  return (
    <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-lg border border-[var(--yatsugi-grey-1)] bg-[var(--color-neir-darkest)] p-2">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <h3 className="text-sm/4 font-bold text-[var(--yatsugi-white-1)]">
          New Project
        </h3>
        {/* <p className="text-xs text-[var(--yatsugi-grey-1)]">
            Choose a name to get started with a fresh workspace.
          </p> */}

        <Input
          ref={inputRef}
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="input"
          type="text"
          placeholder="My new project"
          label="Project Name"
        />

        <div className="flex flex-col gap-2">
          <Input
            className="w-full"
            label="Directory to watch"
            placeholder="No directory selected"
            value={inputDirectory ?? ""}
            disabled={!projectNameIsValid}
            readOnly
          />
          <div className="flex flex-row gap-2">
            <Button
              variant="secondary"
              onMouseDown={handleBrowse}
              disabled={!projectNameIsValid}
            >
              Browse
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-[var(--yatsugi-white-2)] bg-transparent">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!projectNameIsValid || !inputDirectory.trim()}
            className="rounded-md py-1 bg-[var(--yatsugi-blue-600)] text-[var(--yatsugi-white-1)]">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectDropdown;
