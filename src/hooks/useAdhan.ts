import { useRef, useCallback, useEffect, useState, type MutableRefObject } from "react";
import { ALERT_SOUND_FILES, type AlertSound } from "@/hooks/useTheme";
import { useTranslation } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const ADHAN_PATH = "/ezan.mp3";

function cacheBust(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${Date.now()}`;
}

function createAudio(path: string): HTMLAudioElement {
  const audio = new Audio(cacheBust(path));
  audio.preload = "auto";
  audio.volume = 0.85;
  return audio;
}

// Ses açma/kısma tuşuna basılınca çalan ezanı/uyarıyı sustur
function useVolumeButtonSilence(active: boolean, silence: () => void) {
  const silenceRef = useRef(silence);
  silenceRef.current = silence;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "AudioVolumeUp" || e.key === "AudioVolumeDown" || e.key === "VolumeUp" || e.key === "VolumeDown") {
        silenceRef.current();
      }
    };
    window.addEventListener("keydown", onKey);

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { VolumeButtons } = await import("@capacitor-community/volume-buttons");
        await VolumeButtons.watchVolume({ disableSystemVolumeHandler: true }, () => {
          silenceRef.current();
        });
        if (cancelled) {
          await VolumeButtons.clearWatch();
          return;
        }
        cleanup = () => {
          VolumeButtons.clearWatch().catch(() => undefined);
        };
      } catch {
        // plugin yoksa / web ortamı
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      cleanup?.();
    };
  }, [active]);
}

export function useAdhan() {
  const { t } = useTranslation();
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
        ref.current.src = "";
      }
    });
    setIsPlaying(false);
  }, [clearPreviewTimeout]);

  // Ses tuşuyla susturma: sesi durdur + aktif bildirimleri kaldır (kanal sesi de kesilir)
  const silenceByVolumeKey = useCallback(() => {
    stopAll();
    (async () => {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const delivered = await LocalNotifications.getDeliveredNotifications();
        if (delivered.notifications?.length) {
          await LocalNotifications.removeDeliveredNotifications(delivered);
        }
      } catch {
        // web ortamı
      }
    })();
  }, [stopAll]);

  useVolumeButtonSilence(isPlaying, silenceByVolumeKey);



  const playAudio = useCallback(async (path: string, targetRef: MutableRefObject<HTMLAudioElement | null>, label?: string) => {
    stopAll();

    try {
      const audio = createAudio(path);
      targetRef.current = audio;
      audio.currentTime = 0;
      setIsPlaying(true);
      await audio.play();
      if (label) toast.success(t.audioPlaying.replace('{label}', label));
      return true;
    } catch (error) {
      console.error(`${t.audioError}:`, error);
      targetRef.current = null;
      setIsPlaying(false);
      toast.error(label ? t.audioPlayError.replace('{label}', label) : t.audioError);
      return false;
    }
  }, [stopAll, t]);

  const playAdhan = useCallback(async () => {
    const label = t.alertSoundNames.uyari;
    const started = await playAudio(ADHAN_PATH, adhanRef, label);
    if (!started || !adhanRef.current) return false;

    const audio = adhanRef.current;
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    }, { once: true });
    return true;
  }, [playAudio, t]);

  const primeAudio = useCallback(async () => true, []);

  const playPreAlert = useCallback(async (soundKey?: AlertSound) => {
    const key = soundKey || (localStorage.getItem("alertSound") as AlertSound) || "uyari";
    const path = ALERT_SOUND_FILES[key] || ALERT_SOUND_FILES.uyari;
    const label = t.alertSoundNames[key] || t.alertSoundNames.uyari;
    return playAudio(path, preAlertRef, label);
  }, [playAudio, t]);

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
