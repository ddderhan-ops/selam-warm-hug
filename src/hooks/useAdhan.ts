import { useRef, useCallback, useEffect, useState, type MutableRefObject } from "react";
import { ALERT_SOUND_FILES, type AlertSound } from "@/hooks/useTheme";

const ADHAN_PATH = "/ezan.mp3";
const AUDIO_ERROR_MESSAGE = "Ses dosyası çalınamadı";

// Global audio context unlock flag
let audioUnlocked = false;

function cacheBust(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${Date.now()}`;
}

function createAudio(path: string) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = 0.85;
  audio.src = cacheBust(path);
  return audio;
}

// Try to unlock audio context on user interaction
function unlockAudio() {
  if (audioUnlocked) return Promise.resolve(true);
  
  return new Promise<boolean>((resolve) => {
    const testAudio = new Audio();
    testAudio.volume = 0.01;
    testAudio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVanu8LdnHgU2kNjzxnkrBSh+zPLaizsIHGu98+OZSA0PVantu6tlHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTantualmHAU1j9vztGslBSh+zPLZijwJHGrA8OScSg4OTants=";
    
    testAudio.play().then(() => {
      audioUnlocked = true;
      resolve(true);
    }).catch(() => {
      resolve(false);
    });
  });
}

export function useAdhan() {
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const preAlertRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
        try {
          ref.current.src = "";
        } catch {}
      }
    });
    setIsPlaying(false);
  }, [clearPreviewTimeout]);

  const playAudio = useCallback(async (path: string, targetRef: MutableRefObject<HTMLAudioElement | null>) => {
    // First try to unlock audio context
    await unlockAudio();
    
    stopAll();
    
    try {
      const audio = createAudio(path);
      targetRef.current = audio;
      
      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', () => reject(new Error('Failed to load audio')), { once: true });
        
        // Timeout after 3 seconds
        setTimeout(() => reject(new Error('Audio load timeout')), 3000);
      });
      
      audio.currentTime = 0;
      setIsPlaying(true);
      await audio.play();
      return true;
    } catch (error) {
      console.error(`${AUDIO_ERROR_MESSAGE}:`, error);
      targetRef.current = null;
      setIsPlaying(false);
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
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      replay();
    }, { once: true });
    return true;
  }, [playAudio]);

  const primeAudio = useCallback(async (path = ADHAN_PATH) => {
    // Try to unlock audio on user interaction
    await unlockAudio();
    
    try {
      const audio = createAudio(path);
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.volume = 0.85;
      audioUnlocked = true;
      return Promise.resolve();
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
      setIsPlaying(false);
    }, durationMs);
    return true;
  }, [playAudio]);

  const stopAdhan = useCallback(() => {
    stopAll();
  }, [stopAll]);

  return { playAdhan, playPreAlert, previewSound, stopAdhan, primeAudio, isPlaying };
}
