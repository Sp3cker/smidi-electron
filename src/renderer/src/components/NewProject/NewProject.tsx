import { Input } from "@renderer/ui";

const NewProject = () => {
  return (
    <div>
      <h1>New Project</h1>
      <Input type="text" label="Project Name" />
      <Input type="text" label="Voicegroup" />
    </div>
  );
};

export default NewProject;
