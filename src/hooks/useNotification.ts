import { useEffect, useRef, useCallback } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { PrayerTime } from "@/lib/prayerTimes";
import { toDateKey } from "@/lib/prayerCache";

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
  const scheduledIds = useRef<number[]>([]);

  useEffect(() => {
    // Check current permission status
    LocalNotifications.checkPermissions().then((result) => {
      permissionGranted.current = result.display === "granted";
    }).catch(() => {
      // Fallback for web
      if ("Notification" in window) {
        permissionGranted.current = Notification.permission === "granted";
      }
    });

    return () => {
      // Cancel any scheduled notifications on unmount
      if (scheduledIds.current.length > 0) {
        LocalNotifications.cancel({
          notifications: scheduledIds.current.map((id) => ({ id })),
        }).catch(() => undefined);
        scheduledIds.current = [];
      }
    };
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      permissionGranted.current = result.display === "granted";
      return permissionGranted.current;
    } catch {
      // Fallback for web
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

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title: `Ezan Vakti Geldi: ${prayer.name}`,
            body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
            smallIcon: "ic_notification",
            largeIcon: "ic_launcher",
            sound: "ezan.mp3",
            channelId: "prayer-times-channel",
          },
        ],
      });
    } catch {
      // Fallback: browser notification
      const registration = await getServiceWorkerRegistration();
      if (registration) {
        await registration.showNotification(`Ezan Vakti Geldi: ${prayer.name}`, {
          body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
          icon: "/pwa-192x192.png",
          tag: `prayer-${prayer.nameEn}`,
        });
      }
    }

    return null;
  }, []);

  const syncPrayerScheduleWithServiceWorker = useCallback(
    async (prayers: PrayerTime[], context?: NotificationScheduleContext) => {
      const registration = await getServiceWorkerRegistration();
      if (!registration?.active || !context) return;

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
    },
    []
  );

  const schedulePrayerNotifications = useCallback(
    async (
      prayers: PrayerTime[],
      onPrayerTime?: (prayer: PrayerTime) => void,
      context?: NotificationScheduleContext
    ) => {
      void syncPrayerScheduleWithServiceWorker(prayers, context);

      if (!permissionGranted.current) return;

      // Cancel previously scheduled
      if (scheduledIds.current.length > 0) {
        await LocalNotifications.cancel({
          notifications: scheduledIds.current.map((id) => ({ id })),
        }).catch(() => undefined);
        scheduledIds.current = [];
      }

      const now = Date.now();
      const notifications: Array<{
        id: number;
        title: string;
        body: string;
        schedule: { at: Date };
        smallIcon: string;
        largeIcon: string;
        sound: string;
        channelId: string;
      }> = [];

      prayers.forEach((prayer, index) => {
        const timeUntil = prayer.timestamp - now;
        if (timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000) {
          const id = 5000 + index;
          notifications.push({
            id,
            title: `Ezan Vakti Geldi: ${prayer.name}`,
            body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
            schedule: { at: new Date(prayer.timestamp) },
            smallIcon: "ic_notification",
            largeIcon: "ic_launcher",
            sound: "ezan.mp3",
            channelId: "prayer-times-channel",
          });
          scheduledIds.current.push(id);
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
          });
        }
      }

      // Listen for notification events to trigger callbacks
      LocalNotifications.addListener("localNotificationReceived", () => {
        // Find which prayer just fired
        const closest = prayers.find(
          (p) => Math.abs(p.timestamp - Date.now()) < 120_000
        );
        if (closest) onPrayerTime?.(closest);
      }).catch(() => undefined);
    },
    [sendNotification, syncPrayerScheduleWithServiceWorker]
  );

  return {
    requestPermission,
    sendNotification,
    schedulePrayerNotifications,
    isSupported: true, // Capacitor always supports local notifications
  };
}
