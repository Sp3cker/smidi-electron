import { useState, useEffect, useTransition, useCallback } from "react";
import useWatchStore from "@renderer/store/useWatchStore";
import { useConfigStoreWithSelectors } from "@renderer/store/useConfigStore";
import type { Voicegroup } from "@shared/dto";

export const useVoicegroups = () => {
  const validConfig = useConfigStoreWithSelectors().validConfig;
  const { selectedVoicegroup, setSelectedVoicegroup } = useWatchStore();
  const [voiceGroups, setVoiceGroups] = useState<Voicegroup[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const handleLoadVoiceGroups = useCallback(async () => {
    setError(null);

    startTransition(async () => {
      try {
        const voiceGroups = await window.api.getVoiceGroups();
        if (!voiceGroups.success) {
          setError(new Error("Error getting voice groups"));
          return;
        }
        setVoiceGroups(voiceGroups.data);
      } catch (error) {
        setError(error as Error);
      }
    });
  }, []);
  useEffect(() => {
    if (!validConfig) {
      return;
    }
    handleLoadVoiceGroups();
    return;
  }, [validConfig]);

  return {
    voiceGroups,
    isLoading,
    error,
    selectedVoicegroup,
    setSelectedVoicegroup,
  };
};
