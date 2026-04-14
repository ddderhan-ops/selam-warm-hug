import { useRef, useCallback } from "react";
import { ALERT_SOUND_FILES, type AlertSound } from "@/hooks/useTheme";

/**
 * All sounds use standard HTML5 Audio from public/sounds/ folder.
 * No native plugins needed — Capacitor WebView handles HTML5 Audio natively.
 */

const ADHAN_PATH = "/sounds/ezan.mp3";

export function useAdhan() {
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const preAlertRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  const getAdhanAudio = useCallback(() => {
    if (!adhanRef.current) {
      adhanRef.current = new Audio(ADHAN_PATH);
      adhanRef.current.volume = 0.85;
      adhanRef.current.preload = "auto";
    }
    return adhanRef.current;
  }, []);

  const stopAll = useCallback(() => {
    [adhanRef, preAlertRef, previewRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  }, []);

  const playAdhan = useCallback(async () => {
    stopAll();
    try {
      const audio = getAdhanAudio();
      audio.currentTime = 0;
      await audio.play();
      const replay = () => {
        audio.currentTime = 0;
        void audio.play().catch((e) => console.error("Ezan tekrar çalınamadı:", e));
      };
      audio.addEventListener("ended", replay, { once: true });
    } catch (error) {
      console.error("Ezan sesi çalınamadı:", error);
    }
  }, [getAdhanAudio, stopAll]);

  const playPreAlert = useCallback(async (soundKey?: AlertSound) => {
    stopAll();
    const key = soundKey || (localStorage.getItem("alertSound") as AlertSound) || "uyari";
    const path = ALERT_SOUND_FILES[key] || ALERT_SOUND_FILES.uyari;
    try {
      preAlertRef.current = new Audio(path);
      preAlertRef.current.volume = 0.85;
      await preAlertRef.current.play();
    } catch (error) {
      console.error("Uyarı sesi çalınamadı:", error);
    }
  }, [stopAll]);

  const previewSound = useCallback(async (path: string, durationMs = 3000) => {
    stopAll();
    try {
      previewRef.current = new Audio(path);
      previewRef.current.volume = 0.85;
      await previewRef.current.play();
      setTimeout(() => {
        if (previewRef.current) {
          previewRef.current.pause();
          previewRef.current.currentTime = 0;
        }
      }, durationMs);
    } catch (error) {
      console.error("Önizleme çalınamadı:", error);
    }
  }, [stopAll]);

  const stopAdhan = useCallback(() => stopAll(), [stopAll]);

  return { playAdhan, playPreAlert, previewSound, stopAdhan };
}
