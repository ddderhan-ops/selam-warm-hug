import { useRef, useCallback } from "react";

const ADHAN_AUDIO_PATH = "/audio/ezan.mp3";
const PRE_ALERT_AUDIO_PATH = "/audio/uyari.mp3";

export function useAdhan() {
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const preAlertRef = useRef<HTMLAudioElement | null>(null);

  const getAdhanAudio = useCallback(() => {
    if (!adhanRef.current) {
      adhanRef.current = new Audio(ADHAN_AUDIO_PATH);
      adhanRef.current.volume = 0.85;
      adhanRef.current.preload = "auto";
    }
    return adhanRef.current;
  }, []);

  const getPreAlertAudio = useCallback(() => {
    if (!preAlertRef.current) {
      preAlertRef.current = new Audio(PRE_ALERT_AUDIO_PATH);
      preAlertRef.current.volume = 0.85;
      preAlertRef.current.preload = "auto";
    }
    return preAlertRef.current;
  }, []);

  const stopAll = useCallback(() => {
    if (adhanRef.current) {
      adhanRef.current.pause();
      adhanRef.current.currentTime = 0;
    }
    if (preAlertRef.current) {
      preAlertRef.current.pause();
      preAlertRef.current.currentTime = 0;
    }
  }, []);

  const playAdhan = useCallback(async () => {
    stopAll();
    try {
      const audio = getAdhanAudio();
      audio.currentTime = 0;
      await audio.play();

      // Replay once when ended
      const replay = () => {
        audio.currentTime = 0;
        void audio.play().catch((e) => console.error("Ezan tekrar çalınamadı:", e));
      };
      audio.addEventListener("ended", replay, { once: true });
    } catch (error) {
      console.error("Ezan sesi çalınamadı:", error);
    }
  }, [getAdhanAudio, stopAll]);

  const playPreAlert = useCallback(async () => {
    stopAll();
    try {
      const audio = getPreAlertAudio();
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error("Uyarı sesi çalınamadı:", error);
    }
  }, [getPreAlertAudio, stopAll]);

  const stopAdhan = useCallback(() => {
    stopAll();
  }, [stopAll]);

  return { playAdhan, playPreAlert, stopAdhan };
}
