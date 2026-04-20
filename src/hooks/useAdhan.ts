import { useRef, useCallback, useEffect } from "react";
import { ALERT_SOUND_FILES, type AlertSound } from "@/hooks/useTheme";

const ADHAN_PATH = "/ezan.mp3";
const AUDIO_VERSION = Date.now();

function cacheBust(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${AUDIO_VERSION}`;
}

function createAudio(path: string) {
  const audio = new Audio(cacheBust(path));
  audio.preload = "auto";
  audio.volume = 0.85;
  return audio;
}

export function useAdhan() {
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const preAlertRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);

  const clearPreviewTimeout = useCallback(() => {
    if (previewTimeoutRef.current !== null) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPreviewTimeout();
  }, [clearPreviewTimeout]);

  const getAdhanAudio = useCallback(() => {
    if (!adhanRef.current) {
      adhanRef.current = createAudio(ADHAN_PATH);
    }
    return adhanRef.current;
  }, []);

  const stopAll = useCallback(() => {
    clearPreviewTimeout();
    [adhanRef, preAlertRef, previewRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  }, [clearPreviewTimeout]);

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
      preAlertRef.current = createAudio(path);
      await preAlertRef.current.play();
    } catch (error) {
      console.error("Uyarı sesi çalınamadı:", error);
    }
  }, [stopAll]);

  const previewSound = useCallback(async (path: string, durationMs = 3000) => {
    stopAll();
    try {
      previewRef.current = createAudio(path);
      await previewRef.current.play();
      previewTimeoutRef.current = window.setTimeout(() => {
        if (previewRef.current) {
          previewRef.current.pause();
          previewRef.current.currentTime = 0;
        }
        previewTimeoutRef.current = null;
      }, durationMs);
    } catch (error) {
      console.error("Önizleme çalınamadı:", error);
    }
  }, [stopAll]);

  const stopAdhan = useCallback(() => {
    stopAll();
  }, [stopAll]);

  return { playAdhan, playPreAlert, previewSound, stopAdhan };
}
