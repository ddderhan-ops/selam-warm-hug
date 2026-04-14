import { useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { ALERT_SOUND_FILES, type AlertSound } from "@/hooks/useTheme";

/**
 * Returns the correct audio path based on the platform.
 * - Android native: uses file:///android_res/raw/<name> to reference res/raw/ resources
 * - Web / PWA: uses the standard /audio/<name>.mp3 path
 */
function getAudioPath(webPath: string): string {
  if (Capacitor.isNativePlatform()) {
    // Extract file name without extension, e.g. "/audio/ezan.mp3" → "ezan"
    const fileName = webPath.split("/").pop()?.replace(/\.[^.]+$/, "") || "ezan";
    return `file:///android_res/raw/${fileName}`;
  }
  return webPath;
}

const ADHAN_WEB_PATH = "/audio/ezan.mp3";

export function useAdhan() {
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const preAlertRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  const getAdhanAudio = useCallback(() => {
    if (!adhanRef.current) {
      adhanRef.current = new Audio(getAudioPath(ADHAN_WEB_PATH));
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
    const webPath = ALERT_SOUND_FILES[key] || ALERT_SOUND_FILES.uyari;
    try {
      preAlertRef.current = new Audio(getAudioPath(webPath));
      preAlertRef.current.volume = 0.85;
      await preAlertRef.current.play();
    } catch (error) {
      console.error("Uyarı sesi çalınamadı:", error);
    }
  }, [stopAll]);

  const previewSound = useCallback(async (path: string, durationMs = 3000) => {
    stopAll();
    try {
      previewRef.current = new Audio(getAudioPath(path));
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
