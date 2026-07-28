import { useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { PrayerTime } from "@/lib/prayerTimes";
import { toDateKey } from "@/lib/prayerCache";
import { useTranslation } from "@/contexts/LanguageContext";
import type { Translations } from "@/lib/i18n";

// NOTE: Android notification channels are IMMUTABLE once created — changing a
// channel's sound requires a NEW channel id. Bump CHANNEL_VERSION whenever a
// channel's sound/importance changes so the new settings actually take effect.
const CHANNEL_VERSION = "v3";

const PRAYER_CHANNEL_ID = `prayer-times-${CHANNEL_VERSION}`;
const PRAYER_SILENT_CHANNEL_ID = `prayer-times-silent-${CHANNEL_VERSION}`;
const PRE_ALERT_CHANNEL_ID = `pre-alert-${CHANNEL_VERSION}`;

// Legacy channel ids (created without custom sounds) — deleted on startup
const LEGACY_CHANNEL_IDS = [
  "prayer-times-channel",
  "prayer-times-silent",
  "pre-alert-channel",
  "pre-alert-uyari",
  "pre-alert-uyari1",
  "pre-alert-uyari2",
  "pre-alert-uyari3",
];

// Adhan sound for the main prayer notification (android/app/src/main/res/raw/ezan.mp3)
const ADHAN_SOUND_FILE = "ezan.mp3";

// Per-sound pre-alert channels (Android channel sound is immutable; we need one channel per sound)
const PRE_ALERT_SOUND_CHANNELS: Record<string, { id: string; sound: string }> = {
  uyari: { id: `pre-alert-uyari-${CHANNEL_VERSION}`, sound: "ezan.mp3" },
  uyari1: { id: `pre-alert-uyari1-${CHANNEL_VERSION}`, sound: "uyari1.mp3" },
  uyari2: { id: `pre-alert-uyari2-${CHANNEL_VERSION}`, sound: "uyari2.mp3" },
  uyari3: { id: `pre-alert-uyari3-${CHANNEL_VERSION}`, sound: "uyari3.mp3" },
};

function getPreAlertChannelId(soundKey?: string): string {
  if (soundKey && PRE_ALERT_SOUND_CHANNELS[soundKey]) {
    return PRE_ALERT_SOUND_CHANNELS[soundKey].id;
  }
  return PRE_ALERT_CHANNEL_ID;
}


const PRAYER_FIXED_IDS: Record<string, number> = {
  Fajr: 1,
  Sunrise: 2,
  Dhuhr: 3,
  Asr: 4,
  Maghrib: 5,
  Isha: 6,
};

function getPrayerNotificationId(prayer: PrayerTime): number {
  return PRAYER_FIXED_IDS[prayer.nameEn] || Math.floor(Math.random() * 100000);
}

async function ensureNotificationChannels(t: Translations): Promise<void> {
  try {
    // Remove old channels so stale (default-sound) settings don't linger
    for (const id of LEGACY_CHANNEL_IDS) {
      try {
        await LocalNotifications.deleteChannel({ id });
      } catch {
        // channel may not exist
      }
    }

    await LocalNotifications.createChannel({
      id: PRAYER_CHANNEL_ID,
      name: t.notifChannelName,
      description: t.notifChannelName,
      importance: 5,
      visibility: 1,
      lights: true,
      lightColor: "#065f46",
      vibration: true,
      sound: ADHAN_SOUND_FILE, // res/raw/ezan.mp3
    });
    await LocalNotifications.createChannel({
      id: PRAYER_SILENT_CHANNEL_ID,
      name: t.notifChannelSilent,
      description: t.notifChannelSilent,
      importance: 5,
      visibility: 1,
      lights: true,
      lightColor: "#065f46",
      vibration: true,
      sound: "",
    });
    await LocalNotifications.createChannel({
      id: PRE_ALERT_CHANNEL_ID,
      name: t.notifPreAlertChannel,
      description: t.notifPreAlertChannel,
      importance: 5,
      visibility: 1,
      vibration: true,
      sound: PRE_ALERT_SOUND_CHANNELS.uyari1.sound,
    });
    // Create one channel per pre-alert sound so the right sound plays
    for (const [, ch] of Object.entries(PRE_ALERT_SOUND_CHANNELS)) {
      try {
        await LocalNotifications.createChannel({
          id: ch.id,
          name: `${t.notifPreAlertChannel} (${ch.sound.replace(/\.\w+$/, "")})`,
          description: t.notifPreAlertChannel,
          importance: 5,
          visibility: 1,
          vibration: true,
          sound: ch.sound, // res/raw/<name>.mp3
        });
      } catch {
        // ignore individual channel failures
      }
    }
  } catch {
    // Web ortamında createChannel desteklenmez
  }
}

interface NotificationScheduleContext {
  city: string;
  latitude: number;
  longitude: number;
  date?: string;
  hijriDate?: string;
  dateKey?: string;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export function useNotification() {
  const { t } = useTranslation();
  const permissionGranted = useRef(false);
  const channelReady = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await LocalNotifications.checkPermissions();
        permissionGranted.current = result.display === "granted";

        // Android 12+ exact alarm izni — açılışta kontrol et
        if (permissionGranted.current) {
          try {
            const exactResult = await LocalNotifications.checkExactNotificationSetting();
            if (exactResult.exact_alarm === "denied") {
              console.warn("[Notification] Exact alarm permission denied — pre-alerts may drift");
            }
          } catch { /* web/eski Android */ }
        }
      } catch {
        if ("Notification" in window) {
          permissionGranted.current = Notification.permission === "granted";
        }
      }
      if (!channelReady.current) {
        await ensureNotificationChannels(t);
        channelReady.current = true;
      }
    };
    init();
  }, [t]);

  const requestPermission = useCallback(async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      permissionGranted.current = result.display === "granted";

      if (permissionGranted.current) {
        try {
          const exactResult = await LocalNotifications.checkExactNotificationSetting();
          if (exactResult.exact_alarm === "denied") {
            await LocalNotifications.changeExactNotificationSetting();
          }
        } catch { /* web/eski Android */ }
        if (!channelReady.current) {
          await ensureNotificationChannels(t);
          channelReady.current = true;
        }
      }

      return permissionGranted.current;
    } catch {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          permissionGranted.current = true;
          return true;
        }
        if (Notification.permission !== "denied") {
          const permission = await Notification.requestPermission();
          permissionGranted.current = permission === "granted";
          return permissionGranted.current;
        }
      }
      return false;
    }
  }, [t]);

  const sendNotification = useCallback(async (prayer: PrayerTime) => {
    if (!permissionGranted.current) return null;

    const id = getPrayerNotificationId(prayer);
    const title = t.notifPrayerTitle.replace('{prayer}', prayer.name);
    const body = t.notifPrayerBody.replace('{prayer}', prayer.name);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            smallIcon: "ic_notification",
            largeIcon: "ic_launcher",
            channelId: PRAYER_CHANNEL_ID,
            sound: ADHAN_SOUND_FILE,
            ongoing: true,
            autoCancel: true,
          },
        ],
      });
    } catch {
      const registration = await getServiceWorkerRegistration();
      if (registration) {
        await registration.showNotification(title, {
          body,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `prayer-${prayer.nameEn}`,
          requireInteraction: true,
          data: {
            channelId: PRAYER_CHANNEL_ID,
            sound: "/ezan.mp3",
            url: "/",
          },
        });
      }
    }

    return null;
  }, [t]);

  const syncPrayerScheduleWithServiceWorker = useCallback(
    async (prayers: PrayerTime[], context?: NotificationScheduleContext) => {
      const registration = await getServiceWorkerRegistration();
      if (!registration?.active || !context) return;

      try {
        registration.active.postMessage({
          type: "CACHE_PRAYERS",
          payload: {
            prayers,
            city: context.city,
            latitude: context.latitude,
            longitude: context.longitude,
            date: context.date,
            hijriDate: context.hijriDate,
            dateKey: context.dateKey || toDateKey(new Date()),
          },
        });
        registration.active.postMessage({ type: "CHECK_DUE_PRAYERS" });
        console.log("[Notification] Prayer times synced with Service Worker");
      } catch (err) {
        console.warn("[Notification] SW sync failed:", err);
      }
    },
    []
  );

  const schedulePrayerNotifications = useCallback(
    async (
      prayers: PrayerTime[],
      onPrayerTime?: (prayer: PrayerTime) => void,
      context?: NotificationScheduleContext,
      options?: { soundAlertEnabled?: boolean; preAlertEnabled?: boolean; preAlertMinutes?: number; alertSound?: string; onPreAlert?: (prayer: PrayerTime) => void }
    ) => {
      void syncPrayerScheduleWithServiceWorker(prayers, context);

      if (!permissionGranted.current) return;

      try {
        const allIds = [
          ...Object.values(PRAYER_FIXED_IDS),
          ...Object.values(PRAYER_FIXED_IDS).map((id) => id + 100),
        ];
        await LocalNotifications.cancel({
          notifications: allIds.map((id) => ({ id })),
        });
      } catch {
        // ignore on web
      }

      const now = Date.now();
      const notifications: Array<any> = [];
      const preAlertMins = options?.preAlertMinutes || 15;
      const PRE_ALERT_MS = preAlertMins * 60 * 1000;

      const useSilentChannel = options?.soundAlertEnabled === true;
      const preAlertSoundKey = options?.alertSound || "uyari";
      const preAlertChannelId = getPreAlertChannelId(preAlertSoundKey);
      const preAlertSoundFile = PRE_ALERT_SOUND_CHANNELS[preAlertSoundKey]?.sound;

      prayers.forEach((prayer) => {
        const timeUntil = prayer.timestamp - now;

        if (timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000) {
          const id = getPrayerNotificationId(prayer);
          notifications.push({
            id,
            title: t.notifPrayerTitle.replace('{prayer}', prayer.name),
            body: t.notifPrayerBody.replace('{prayer}', prayer.name),
            schedule: {
              at: new Date(prayer.timestamp),
              allowWhileIdle: true,
              repeats: false,
            },
            smallIcon: "ic_notification",
            largeIcon: "ic_launcher",
            channelId: useSilentChannel ? PRAYER_SILENT_CHANNEL_ID : PRAYER_CHANNEL_ID,
            ongoing: true,
            autoCancel: true,
          });
        }

        if (options?.preAlertEnabled) {
          // Exact pre-alert time: prayer timestamp minus N minutes (in ms, no rounding)
          const preAlertTime = prayer.timestamp - PRE_ALERT_MS;
          const preTimeUntil = preAlertTime - now;
          if (preTimeUntil > 0 && preTimeUntil < 24 * 60 * 60 * 1000) {
            const preId = getPrayerNotificationId(prayer) + 100;
            const preAlertDate = new Date(preAlertTime);
            console.log(`[Notification] Pre-alert for ${prayer.nameEn}: prayer=${new Date(prayer.timestamp).toLocaleTimeString()}, fireAt=${preAlertDate.toLocaleTimeString()}, diffMin=${Math.round((prayer.timestamp - preAlertTime) / 60000)}`);
            notifications.push({
              id: preId,
              title: t.notifPreAlertTitle.replace('{prayer}', prayer.name).replace('{min}', String(preAlertMins)),
              body: t.notifPreAlertBody.replace('{prayer}', prayer.name),
              // allowWhileIdle: Doze modunda bile tetiklensin
              // repeats: false -> exact alarm (tekrarlamayan exact zamanlayıcı arka planda da çalışır)
              schedule: {
                at: preAlertDate,
                allowWhileIdle: true,
                repeats: false,
              },
              smallIcon: "ic_notification",
              largeIcon: "ic_launcher",
              channelId: preAlertChannelId,
              sound: preAlertSoundFile,
              ongoing: false,
              autoCancel: true,
            });
          }
        }
      });

      console.log(`[Notification] Scheduling ${notifications.length} notifications. Pre-alert: ${options?.preAlertEnabled ? `${preAlertMins}min, sound=${preAlertSoundKey}` : 'off'}, now=${new Date(now).toLocaleTimeString()}`);

      if (notifications.length > 0) {
        try {
          await LocalNotifications.schedule({ notifications: notifications as any });
        } catch {
          prayers.forEach((prayer) => {
            const timeUntil = prayer.timestamp - now;
            if (timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000) {
              window.setTimeout(async () => {
                await sendNotification(prayer);
                onPrayerTime?.(prayer);
              }, timeUntil);
            }
            if (options?.preAlertEnabled) {
              const preAlertTime = prayer.timestamp - PRE_ALERT_MS;
              const preTimeUntil = preAlertTime - now;
              if (preTimeUntil > 0 && preTimeUntil < 24 * 60 * 60 * 1000) {
                window.setTimeout(() => {
                  options.onPreAlert?.(prayer);
                }, preTimeUntil);
              }
            }
          });
        }
      }

      LocalNotifications.addListener("localNotificationReceived", (notification) => {
        const isPreAlert = notification.id > 100;
        const closest = prayers.find(
          (p) => {
            const targetTime = isPreAlert ? p.timestamp - PRE_ALERT_MS : p.timestamp;
            return Math.abs(targetTime - Date.now()) < 120_000;
          }
        );
        if (closest) {
          if (isPreAlert) {
            options?.onPreAlert?.(closest);
          } else {
            onPrayerTime?.(closest);
          }
        }
      }).catch(() => undefined);
    },
    [sendNotification, syncPrayerScheduleWithServiceWorker, t]
  );

  return {
    requestPermission,
    sendNotification,
    schedulePrayerNotifications,
    isSupported: true,
  };
}
