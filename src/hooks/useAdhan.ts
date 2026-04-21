import { useRef, useCallback, useEffect, type MutableRefObject } from "react";
import { ALERT_SOUND_FILES, type AlertSound } from "@/hooks/useTheme";

const ADHAN_PATH = "/ezan.mp3";
const AUDIO_ERROR_MESSAGE = "Ses dosyası çalınamadı";

function cacheBust(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${Date.now()}`;
}

function createAudio(path: string) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = 0.85;
  audio.src = cacheBust(path);
  audio.load();
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

  const stopAll = useCallback(() => {
    clearPreviewTimeout();
    [adhanRef, preAlertRef, previewRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  }, [clearPreviewTimeout]);

  const playAudio = useCallback(async (path: string, targetRef: MutableRefObject<HTMLAudioElement | null>) => {
    stopAll();
    try {
      const audio = createAudio(path);
      targetRef.current = audio;
      audio.currentTime = 0;
      await audio.play();
      return true;
    } catch (error) {
      console.error(`${AUDIO_ERROR_MESSAGE}:`, error);
      targetRef.current = null;
      return false;
    }
  }, [stopAll]);

  const playAdhan = useCallback(async () => {
    const started = await playAudio(ADHAN_PATH, adhanRef);
    if (!started || !adhanRef.current) return false;

    const audio = adhanRef.current;
    const replay = () => {
      audio.currentTime = 0;
      void audio.play().catch((e) => console.error("Ezan tekrar çalınamadı:", e));
    };
    audio.addEventListener("ended", replay, { once: true });
    return true;
  }, [playAudio]);

  const primeAudio = useCallback((path = ADHAN_PATH) => {
    try {
      const audio = createAudio(path);
      audio.muted = true;
      const unlock = audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch((error) => {
          console.warn("Ses ön hazırlığı başarısız:", error);
        });

      return unlock;
    } catch (error) {
      console.warn("Ses ön hazırlığı kurulamadı:", error);
      return Promise.resolve();
    }
  }, []);

  const playPreAlert = useCallback(async (soundKey?: AlertSound) => {
    const key = soundKey || (localStorage.getItem("alertSound") as AlertSound) || "uyari";
    const path = ALERT_SOUND_FILES[key] || ALERT_SOUND_FILES.uyari;
    return playAudio(path, preAlertRef);
  }, [playAudio]);

  const previewSound = useCallback(async (path: string, durationMs = 3000) => {
    const started = await playAudio(path, previewRef);
    if (!started) return false;

    previewTimeoutRef.current = window.setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.pause();
        previewRef.current.currentTime = 0;
      }
      previewTimeoutRef.current = null;
    }, durationMs);
    return true;
  }, [playAudio]);

  const stopAdhan = useCallback(() => {
    stopAll();
  }, [stopAll]);

  return { playAdhan, playPreAlert, previewSound, stopAdhan, primeAudio };
}
