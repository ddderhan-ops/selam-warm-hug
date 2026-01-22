import { useRef, useCallback } from "react";

// Adhan audio URL (Makkah style)
const ADHAN_URL = "https://www.islamcan.com/audio/adhan/azan1.mp3";

export function useAdhan() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAdhan = useCallback(async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(ADHAN_URL);
        audioRef.current.volume = 0.7;
      }

      // Reset to beginning if already playing
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.error("Ezan sesi çalınamadı:", error);
    }
  }, []);

  const stopAdhan = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { playAdhan, stopAdhan };
}
