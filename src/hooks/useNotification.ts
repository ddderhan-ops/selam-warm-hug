import { useEffect, useRef, useCallback } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { PrayerTime } from "@/lib/prayerTimes";
import { toDateKey } from "@/lib/prayerCache";

const PRAYER_CHANNEL_ID = "prayer-times-channel";

// Fixed IDs per prayer to prevent duplicates
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

async function ensureNotificationChannel(): Promise<void> {
  try {
    await LocalNotifications.createChannel({
      id: PRAYER_CHANNEL_ID,
      name: "Namaz Vakitleri",
      description: "Ezan vakitlerinde bildirim ve ses uyarısı",
      sound: "ezan.mp3",
      importance: 5,
      visibility: 1,
      lights: true,
      lightColor: "#065f46",
      vibration: true,
    });
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
  const permissionGranted = useRef(false);
  const channelReady = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await LocalNotifications.checkPermissions();
        permissionGranted.current = result.display === "granted";
      } catch {
        if ("Notification" in window) {
          permissionGranted.current = Notification.permission === "granted";
        }
      }
      if (!channelReady.current) {
        await ensureNotificationChannel();
        channelReady.current = true;
      }
    };
    init();
  }, []);

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
          await ensureNotificationChannel();
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
  }, []);

  const sendNotification = useCallback(async (prayer: PrayerTime) => {
    if (!permissionGranted.current) return null;

    const id = getPrayerNotificationId(prayer);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: `Ezan Vakti Geldi: ${prayer.name}`,
            body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
            smallIcon: "ic_notification",
            largeIcon: "ic_launcher",
            sound: "ezan.mp3",
            channelId: PRAYER_CHANNEL_ID,
            ongoing: true,
            autoCancel: true,
          },
        ],
      });
    } catch {
      // Fallback: use SW showNotification for persistent background delivery
      const registration = await getServiceWorkerRegistration();
      if (registration) {
        await registration.showNotification(`Ezan Vakti Geldi: ${prayer.name}`, {
          body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `prayer-${prayer.nameEn}`,
          requireInteraction: true,
          data: {
            channelId: PRAYER_CHANNEL_ID,
            sound: "/audio/ezan.mp3",
            url: "/",
          },
        });
      }
    }

    return null;
  }, []);

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
      options?: { preAlertEnabled?: boolean; onPreAlert?: (prayer: PrayerTime) => void }
    ) => {
      void syncPrayerScheduleWithServiceWorker(prayers, context);

      if (!permissionGranted.current) return;

      // Cancel ALL pending notifications before scheduling new ones
      // IDs 1-6 = exact time, 101-106 = pre-alert (15 min before)
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
      const PRE_ALERT_MS = 15 * 60 * 1000;

      prayers.forEach((prayer) => {
        const timeUntil = prayer.timestamp - now;

        // Exact time notification
        if (timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000) {
          const id = getPrayerNotificationId(prayer);
          notifications.push({
            id,
            title: `Ezan Vakti Geldi: ${prayer.name}`,
            body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
            schedule: { at: new Date(prayer.timestamp), allowWhileIdle: true },
            smallIcon: "ic_notification",
            largeIcon: "ic_launcher",
            sound: "ezan.mp3",
            channelId: PRAYER_CHANNEL_ID,
            ongoing: true,
            autoCancel: true,
          });
        }

        // Pre-alert notification (15 min before) — only if preAlertEnabled
        if (options?.preAlertEnabled) {
          const preAlertTime = prayer.timestamp - PRE_ALERT_MS;
          const preTimeUntil = preAlertTime - now;
          if (preTimeUntil > 0 && preTimeUntil < 24 * 60 * 60 * 1000) {
            const preId = getPrayerNotificationId(prayer) + 100;
            notifications.push({
              id: preId,
              title: `${prayer.name} vaktine 15 dakika`,
              body: `${prayer.name} vakti yaklaşıyor. Hazırlıklarınızı yapın.`,
              schedule: { at: new Date(preAlertTime), allowWhileIdle: true },
              smallIcon: "ic_notification",
              largeIcon: "ic_launcher",
              sound: "uyari.mp3",
              channelId: PRAYER_CHANNEL_ID,
              ongoing: false,
              autoCancel: true,
            });
          }
        }
      });

      if (notifications.length > 0) {
        try {
          await LocalNotifications.schedule({ notifications: notifications as any });
        } catch {
          // Fallback to setTimeout for web
          prayers.forEach((prayer) => {
            const timeUntil = prayer.timestamp - now;
            if (timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000) {
              window.setTimeout(async () => {
                await sendNotification(prayer);
                onPrayerTime?.(prayer);
              }, timeUntil);
            }
            // Pre-alert fallback — only if preAlertEnabled
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

      // Listen for notification events to trigger callbacks
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
    [sendNotification, syncPrayerScheduleWithServiceWorker]
  );

  return {
    requestPermission,
    sendNotification,
    schedulePrayerNotifications,
    isSupported: true,
  };
}
