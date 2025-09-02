import { useEffect, useState } from "react";

const getVoiceGroups = async () => {
  const voiceGroups = await window.api.getVoiceGroups();
  return voiceGroups;
};
const VoiceGroupItem = ({
  voiceGroup,
  selected,
  onSelect,
}: {
  voiceGroup: string;
  selected: boolean;
  onSelect: (voiceGroup: string) => void;
}) => {
  return (
    <div
      className={`flex  hover:bg-[var(--yatsugi-blue-600)] flex-col gap-2 ${selected ? "bg-[var(--yatsugi-blue-600)]" : ""}`}
      onClick={() => onSelect(voiceGroup)}
    >
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-2">
          <p
            className={`text-lg font-pkmnem font-bold ${selected ? "text-zinc-800" : ""}`}
          >
            {voiceGroup}
          </p>
        </div>
      </div>
    </div>
  );
};
const VoiceGroups = () => {
  const [voiceGroups, setVoiceGroups] = useState<string[]>([]);
  const [selectedVoiceGroup, setSelectedVoiceGroup] = useState<string | null>(
    null
  );
  const handleSelectVoiceGroup = (voiceGroup: string) => {
    setSelectedVoiceGroup(voiceGroup);
  };
  useEffect(() => {
    const fetchVoiceGroups = async () => {
      const voiceGroups = await getVoiceGroups();
      console.log("voiceGroups", voiceGroups);
      setVoiceGroups(voiceGroups);
    };
    fetchVoiceGroups();
  }, []);
  if (voiceGroups.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <h1 className="font-bold text-xl">Voice Groups</h1>
      <div className="flex max-w-30 flex-col gap-2 ring-1 ring-stone-900 bg-[var(--yatsugi-blue-50)]  rounded-sm p-1">
        {voiceGroups.map((voiceGroup) => (
          <VoiceGroupItem
            selected={selectedVoiceGroup === voiceGroup}
            key={voiceGroup}
            voiceGroup={voiceGroup}
            onSelect={handleSelectVoiceGroup}
          />
        ))}
      </div>
    </>
  );
};

export default VoiceGroups;
