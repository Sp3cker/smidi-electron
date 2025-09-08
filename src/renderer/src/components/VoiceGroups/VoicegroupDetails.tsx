import { useWatchStore } from "@renderer/store";


const VoicegroupDetails = () => {
  const { selectedVoicegroupDetails } = useWatchStore();

  return (
    <div>
      <code>{JSON.stringify(selectedVoicegroupDetails)}</code>
    </div>
  );
};

export default VoicegroupDetails;
