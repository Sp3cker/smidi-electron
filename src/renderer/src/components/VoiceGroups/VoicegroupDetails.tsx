import { useWatchStore } from "@renderer/store";
import { GroupVoice, KeysplitVoice, Node } from "@shared/dto";
import { useMemo } from "react";

const Square1Voice = ({ voice, number }: { voice: Node; number: number }) => {
  <div className="flex flex-col gap-2 ring-1 ring-[var(--yatsugi-blue-500)] bg-[var(--yatsugi-blue-50)] rounded-sm p-1">
    <div className="flex flex-row gap-2">
      <p>{number}</p>
      <p>{voice.type.charAt(0).toUpperCase() + voice.type.slice(1)}</p>
      <div className="flex flex-col gap-2">
        <p>{voice.arguments[0]}</p>
        <p>{voice.arguments[1]}</p>
        <p>{voice.arguments[2]}</p>
        <p>{voice.arguments[3]}</p>
      </div>
    </div>
  </div>;
};
const KeysplitVoiceRow = ({
  voice,
  number,
}: {
  voice: KeysplitVoice;
  number: number;
}) => {
  return (
    <div className="voicegroup-row-item ">
      <div className="flex flex-row gap-x-2">
        <div className="font-bold w-full">
          <p>#{number}</p>
          <p>
            {voice.commentLabel
              ? voice.commentLabel.charAt(0).toUpperCase() +
                voice.commentLabel.slice(1)
              : voice.type.charAt(0).toUpperCase() + voice.type.slice(1)}
          </p>
        </div>
        <div className="w-full"></div> {/* Forces a line break */}
        <p>Keysplit: {voice.keysplit}</p>
      </div>
    </div>
  );
};
const VoicegroupVoice = ({
  voice,
  number,
}: {
  voice: Node;
  number: number;
}) => {
  return (
    <div className="voicegroup-row-item ">
      <div className="flex flex-row gap-2">
        <p>{number}</p>
        <p>{voice.type.charAt(0).toUpperCase() + voice.type.slice(1)}</p>
      </div>
    </div>
  );
};
const VoicegroupDetailList = ({ voicegroup }: { voicegroup: GroupVoice }) => {
  return (
    <div>
      <h1>{voicegroup.voicegroup}</h1>
      <div className="flex flex-col gap-2 ring-1 ring-stone-900 bg-[var(--yatsugi-blue-50)]  rounded-sm p-1">
        {voicegroup.voices.map((voice, index) => {
          switch (voice.type) {
            case "Group":
              return (
                <VoicegroupVoice key={index} voice={voice} number={index + 1} />
              );
            case "Keysplit":
              return (
                <KeysplitVoiceRow
                  key={index}
                  voice={voice}
                  number={index + 1}
                />
              );
            case "DirectSound":
              return (
                <VoicegroupVoice key={index} voice={voice} number={index + 1} />
              );
            case "Programwave":
              return (
                <VoicegroupVoice key={index} voice={voice} number={index + 1} />
              );
            case "Square1":
              return (
                <VoicegroupVoice key={index} voice={voice} number={index + 1} />
              );
            case "Square2":
              return (
                <VoicegroupVoice key={index} voice={voice} number={index + 1} />
              );
            case "Noise":
              return (
                <VoicegroupVoice key={index} voice={voice} number={index + 1} />
              );
          }
        })}
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
