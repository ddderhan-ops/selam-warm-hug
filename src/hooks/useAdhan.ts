import { useRef, useCallback, useEffect, useState, type MutableRefObject } from "react";
import { ALERT_SOUND_FILES, ALERT_SOUND_LABELS, type AlertSound } from "@/hooks/useTheme";
import { toast } from "sonner";

const ADHAN_PATH = "/ezan.mp3";
const AUDIO_ERROR_MESSAGE = "Ses dosyası çalınamadı";

function cacheBust(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${Date.now()}`;
}

function createAudio(path: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = 0.85;
  audio.src = cacheBust(path);
  return audio;
}

export function useAdhan() {
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const preAlertRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);

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
    setIsPlaying(false);
  }, [clearPreviewTimeout]);

  // Audio context'i kilidi aç - kullanıcı etkileşimi gerektirir
  const unlockAudioContext = useCallback(async () => {
    if (audioContextUnlocked) return true;
    
    try {
      // Dummy ses çalarak unlock yap
      const dummyAudio = new Audio();
      dummyAudio.volume = 0.01;
      dummyAudio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      await dummyAudio.play();
      
      setAudioContextUnlocked(true);
      return true;
    } catch (err) {
      console.warn("Audio context unlock failed:", err);
      return false;
    }
  }, [audioContextUnlocked]);

  const playAudio = useCallback(async (path: string, targetRef: MutableRefObject<HTMLAudioElement | null>, label?: string) => {
    const isUnlocked = await unlockAudioContext();
    if (!isUnlocked) {
      toast.error(`Ses çalmak için önce ekrana dokunun`);
      return false;
    }
    
    stopAll();
    
    try {
      const audio = createAudio(path);
      targetRef.current = audio;
      
      audio.currentTime = 0;
      setIsPlaying(true);
      
      await audio.play();
      
      if (label) {
        toast.success(`${label} çalıyor...`);
      }
      
      return true;
    } catch (error) {
      console.error(`${AUDIO_ERROR_MESSAGE}:`, error);
      targetRef.current = null;
      setIsPlaying(false);
      toast.error(label ? `"${label}" çalınamadı` : AUDIO_ERROR_MESSAGE);
      return false;
    }
  }, [stopAll, unlockAudioContext]);

  const playAdhan = useCallback(async () => {
    const started = await playAudio(ADHAN_PATH, adhanRef, "Ezan");
    if (!started || !adhanRef.current) return false;

    const audio = adhanRef.current;
    
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      // Tekrar çal
      audio.currentTime = 0;
      void audio.play().catch((e) => console.error("Ezan tekrar çalınamadı:", e));
    }, { once: true });
    
    return true;
  }, [playAudio]);

  const primeAudio = useCallback(async (path = ADHAN_PATH) => {
    return unlockAudioContext();
  }, [unlockAudioContext]);

  const playPreAlert = useCallback(async (soundKey?: AlertSound) => {
    const key = soundKey || (localStorage.getItem("alertSound") as AlertSound) || "uyari";
    const path = ALERT_SOUND_FILES[key] || ALERT_SOUND_FILES.uyari;
    const label = ALERT_SOUND_LABELS[key] || "Uyarı";
    return playAudio(path, preAlertRef, label);
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
      setIsPlaying(false);
    }, durationMs);
    return true;
  }, [playAudio]);

  const stopAdhan = useCallback(() => {
    stopAll();
  }, [stopAll]);

  return { playAdhan, playPreAlert, previewSound, stopAdhan, primeAudio, isPlaying };
}
