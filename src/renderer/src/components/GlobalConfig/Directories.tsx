import { useCallback } from "react";

const Directories = ({ expansionDir, setExpansionDir }) => {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setExpansionDir(e.target.value);
    // Handle form submission logic here
  }, []);
  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="p-2">
        <h3 className="text-lg font-bold">Expansion Directory</h3>
        <input
          className="input w-full"
          type="text"
          value={expansionDir}
          onBlur={handleSubmit}
        />
        <p></p>
      </div>
    </div>
  );
};

export default Directories;
