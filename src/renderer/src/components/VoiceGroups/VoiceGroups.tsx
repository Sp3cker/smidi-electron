import { useWatchStore } from "@renderer/store";
import { useEffect } from "react";
import VoicegroupDetails from "./VoicegroupDetails";
import { useVoicegroups } from "@renderer/hooks/useVoicegroups";

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
  const {
    selectedVoicegroup,
    voiceGroups,
    error,
    isLoading,
    setSelectedVoicegroup,
  } = useVoicegroups();
  const handleSelectVoiceGroup = (voiceGroup: string) => {
    setSelectedVoicegroup(voiceGroup);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error || !voiceGroups) {
    return (
      <div className="text-[var(--yatsugi-red-1)]">
        Error loading voice groups
      </div>
    );
  }
  return (
    <>
      <h1 className="font-bold text-xl">Voice Groups</h1>
      <div className="flex flex-row gap-2">
        <div className="flex order-1 max-w-30 flex-col gap-2 ring-1 ring-stone-900 bg-[var(--yatsugi-blue-50)]  rounded-sm p-1">
          {voiceGroups.map((voiceGroup) => (
            <VoiceGroupItem
              selected={selectedVoicegroup === voiceGroup}
              key={voiceGroup}
              voiceGroup={voiceGroup}
              onSelect={handleSelectVoiceGroup}
            />
          ))}
        </div>
        <div className="flex order-2 flex-col gap-2">
          <VoicegroupDetails />
        </div>
      </div>
    </>
  );
};

export default VoiceGroups;
