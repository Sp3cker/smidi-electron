import useWatchStore from "../../store/watchStore";

const List = () => {
  const { midiFileNames } = useWatchStore();
  return (
    <>
      <h2>MIDI Files</h2>
      <div className="flex flex-col gap-2">
        {midiFileNames.map((fileName) => (
          <p key={fileName}>{fileName}</p>
        ))}
      </div>
    </>
  );
};

export default List;
