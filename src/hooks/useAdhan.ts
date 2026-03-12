import { useRef, useCallback } from "react";

const ADHAN_AUDIO_PATH = "/audio/ezan.mp3";

export function useAdhan() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(ADHAN_AUDIO_PATH);
      audioRef.current.volume = 0.85;
      audioRef.current.preload = "auto";
    }

    return audioRef.current;
  }, []);

  const playAdhan = useCallback(async () => {
    try {
      const audio = getAudio();

      audio.pause();
      audio.currentTime = 0;
      await audio.play();

      const replay = () => {
        audio.currentTime = 0;
        void audio.play().catch((error) => {
          console.error("Ezan sesi ikinci kez çalınamadı:", error);
        });
      };

      audio.addEventListener("ended", replay, { once: true });
    } catch (error) {
      console.error("Ezan sesi çalınamadı:", error);
    }
  }, [getAudio]);

  const stopAdhan = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  return { playAdhan, stopAdhan };
}
