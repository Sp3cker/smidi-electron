import { useWatchStore } from "@renderer/store";
import { GroupVoice, Node } from "@shared/dto";
const VoicegroupVoice = ({ voice }: { voice: Node }) => {
  return (
    <div className="flex flex-col gap-2 ring-1 ring-stone-900 bg-[var(--yatsugi-blue-50)]  rounded-sm p-1">
      {voice.type}
    </div>
  );
};
const VoicegroupDetailList = ({ voicegroup }: { voicegroup: GroupVoice }) => {
  return (
    <div>
      <h1>{voicegroup.voicegroup}</h1>
      <div className="flex flex-col gap-2 ring-1 ring-stone-900 bg-[var(--yatsugi-blue-50)]  rounded-sm p-1">
        {voicegroup.voices.map((voice, index) => (
          <VoicegroupVoice key={index} voice={voice} />
        ))}
      </div>
    </div>
  );
};
const VoicegroupDetails = () => {
  const { selectedVoicegroupDetails } = useWatchStore();
  const data = selectedVoicegroupDetails as GroupVoice;
  if (!data) return <div>No data</div>;
  return (
    <div>
      <VoicegroupDetailList voicegroup={data} />
    </div>
  );
};

export default VoicegroupDetails;
