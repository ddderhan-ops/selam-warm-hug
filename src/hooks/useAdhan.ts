import { useRef, useCallback, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";
import { ALERT_SOUND_FILES, type AlertSound } from "@/hooks/useTheme";

const WEB_AUDIO_BASE_PATH = "/raw";
const NATIVE_AUDIO_BASE_PATH = "public/raw";
const ADHAN_PATH = `${WEB_AUDIO_BASE_PATH}/ezan.mp3`;

const NATIVE_AUDIO_ASSETS = {
  ezan: { assetId: "ezan", nativePath: `${NATIVE_AUDIO_BASE_PATH}/ezan.mp3` },
  uyari: { assetId: "uyari", nativePath: `${NATIVE_AUDIO_BASE_PATH}/uyari.mp3` },
  uyari1: { assetId: "uyari1", nativePath: `${NATIVE_AUDIO_BASE_PATH}/uyari1.mp3` },
  uyari2: { assetId: "uyari2", nativePath: `${NATIVE_AUDIO_BASE_PATH}/uyari2.mp3` },
  uyari3: { assetId: "uyari3", nativePath: `${NATIVE_AUDIO_BASE_PATH}/uyari3.mp3` },
} as const;

type NativeAssetId = keyof typeof NATIVE_AUDIO_ASSETS;

function isAndroidNativePlatform() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

function getNativeAssetIdFromPath(path: string): NativeAssetId | null {
  const fileName = path.split("/").pop()?.replace(/\.[^.]+$/, "");
  if (!fileName || !(fileName in NATIVE_AUDIO_ASSETS)) return null;
  return fileName as NativeAssetId;
}

export function useAdhan() {
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const preAlertRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);
  const nativeConfiguredRef = useRef(false);
  const nativeLoadedRef = useRef<Set<NativeAssetId>>(new Set());
  const nativeLoadingRef = useRef<Partial<Record<NativeAssetId, Promise<void>>>>({});

  const clearPreviewTimeout = useCallback(() => {
    if (previewTimeoutRef.current !== null) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  }, []);

  const ensureNativeConfigured = useCallback(async () => {
    if (!isAndroidNativePlatform() || nativeConfiguredRef.current) return;

    await NativeAudio.configure({
      focus: true,
      fade: false,
    });

    nativeConfiguredRef.current = true;
  }, []);

  const ensureNativeAsset = useCallback(async (assetId: NativeAssetId) => {
    if (!isAndroidNativePlatform() || nativeLoadedRef.current.has(assetId)) return;

    const loading = nativeLoadingRef.current[assetId];
    if (loading) {
      await loading;
      return;
    }

    const task = (async () => {
      await ensureNativeConfigured();
      const asset = NATIVE_AUDIO_ASSETS[assetId];

      await NativeAudio.preload({
        assetId: asset.assetId,
        assetPath: asset.nativePath,
        audioChannelNum: 1,
        volume: 0.85,
      });

      nativeLoadedRef.current.add(assetId);
    })().finally(() => {
      delete nativeLoadingRef.current[assetId];
    });

    nativeLoadingRef.current[assetId] = task;
    await task;
  }, [ensureNativeConfigured]);

  useEffect(() => {
    if (!isAndroidNativePlatform()) return;

    void Promise.all(
      (Object.keys(NATIVE_AUDIO_ASSETS) as NativeAssetId[]).map((assetId) =>
        ensureNativeAsset(assetId).catch((error) => {
          console.warn(`Native audio preload failed for ${assetId}:`, error);
        })
      )
    );

    return () => {
      clearPreviewTimeout();
    };
  }, [clearPreviewTimeout, ensureNativeAsset]);

  const getAdhanAudio = useCallback(() => {
    if (!adhanRef.current) {
      adhanRef.current = new Audio(ADHAN_PATH);
      adhanRef.current.volume = 0.85;
      adhanRef.current.preload = "auto";
    }
    return adhanRef.current;
  }, []);

  const stopAll = useCallback(async () => {
    clearPreviewTimeout();

    [adhanRef, preAlertRef, previewRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });

    if (isAndroidNativePlatform()) {
      await Promise.all(
        (Object.keys(NATIVE_AUDIO_ASSETS) as NativeAssetId[]).map(async (assetId) => {
          try {
            await NativeAudio.stop({ assetId });
          } catch {
            // asset henüz çalmıyor olabilir
          }
        })
      );
    }
  }, [clearPreviewTimeout]);

  const playAdhan = useCallback(async () => {
    await stopAll();

    if (isAndroidNativePlatform()) {
      try {
        await ensureNativeAsset("ezan");
        void NativeAudio.play({ assetId: "ezan" }).catch((error) => {
          console.error("Native ezan sesi çalınamadı:", error);
        });
        return;
      } catch (error) {
        console.error("Native ezan hazırlığı başarısız:", error);
      }
    }

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
  }, [ensureNativeAsset, getAdhanAudio, stopAll]);

  const playPreAlert = useCallback(async (soundKey?: AlertSound) => {
    await stopAll();

    const key = soundKey || (localStorage.getItem("alertSound") as AlertSound) || "uyari";
    const path = ALERT_SOUND_FILES[key] || ALERT_SOUND_FILES.uyari;

    if (isAndroidNativePlatform()) {
      try {
        await ensureNativeAsset(key);
        void NativeAudio.play({ assetId: key }).catch((error) => {
          console.error("Native uyarı sesi çalınamadı:", error);
        });
        return;
      } catch (error) {
        console.error("Native uyarı hazırlığı başarısız:", error);
      }
    }

    try {
      preAlertRef.current = new Audio(path);
      preAlertRef.current.volume = 0.85;
      await preAlertRef.current.play();
    } catch (error) {
      console.error("Uyarı sesi çalınamadı:", error);
    }
  }, [ensureNativeAsset, stopAll]);

  const previewSound = useCallback(async (path: string, durationMs = 3000) => {
    await stopAll();

    const nativeAssetId = getNativeAssetIdFromPath(path);

    if (isAndroidNativePlatform() && nativeAssetId) {
      try {
        await ensureNativeAsset(nativeAssetId);
        void NativeAudio.play({ assetId: nativeAssetId }).catch((error) => {
          console.error("Native önizleme çalınamadı:", error);
        });

        previewTimeoutRef.current = window.setTimeout(() => {
          void NativeAudio.stop({ assetId: nativeAssetId }).catch(() => undefined);
          previewTimeoutRef.current = null;
        }, durationMs);
        return;
      } catch (error) {
        console.error("Native önizleme hazırlığı başarısız:", error);
      }
    }

    try {
      previewRef.current = new Audio(path);
      previewRef.current.volume = 0.85;
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
  }, [ensureNativeAsset, stopAll]);

  const stopAdhan = useCallback(() => {
    void stopAll();
  }, [stopAll]);

  return { playAdhan, playPreAlert, previewSound, stopAdhan };
}
