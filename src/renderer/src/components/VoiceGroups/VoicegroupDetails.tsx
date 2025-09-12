import { useWatchStore } from "@renderer/store";
import { useMessageStream } from "@renderer/hooks/useSharedJson";

const VoicegroupDetails = () => {
  const { selectedVoicegroupDetails } = useWatchStore();
  const { ready, messages } = useMessageStream("voicegroup-details");

  if (!ready) return <div>Loading voicegroup details…</div>;

  console.log("VoicegroupDetails: messages", messages);

  if (messages.length > 0) {
    const latest = messages[messages.length - 1];
    if (latest.voicegroupDetails) {
      console.log("VoicegroupDetails: latest voicegroupDetails", latest.voicegroupDetails);
    }
  }
  return (
    <div>
      <code>{JSON.stringify(selectedVoicegroupDetails)}</code>
    </div>
  );
};

export default VoicegroupDetails;
