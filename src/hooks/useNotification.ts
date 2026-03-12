import { useEffect, useRef, useCallback } from "react";
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
  const scheduledTimeouts = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      permissionGranted.current = Notification.permission === "granted";
    }

    return () => {
      scheduledTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      scheduledTimeouts.current = [];
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("Bu tarayıcı bildirimleri desteklemiyor");
      return false;
    }

    if (Notification.permission === "granted") {
      permissionGranted.current = true;
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === "granted";
      return permissionGranted.current;
    }

    return false;
  }, []);

  const sendNotification = useCallback(async (prayer: PrayerTime) => {
    if (!permissionGranted.current) {
      return null;
    }

    const title = `Ezan Vakti Geldi: ${prayer.name}`;
    const options: NotificationOptions = {
      body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: `prayer-${prayer.nameEn}`,
      requireInteraction: true,
      renotify: true,
      vibrate: [200, 120, 200],
      data: {
        sound: "/audio/ezan.mp3",
        channelId: "prayer-times-channel",
        channelName: "Namaz Vakitleri",
      },
    };

    const registration = await getServiceWorkerRegistration();

    if (registration) {
      await registration.showNotification(title, options);
      return null;
    }

    const notification = new Notification(title, options);
    window.setTimeout(() => notification.close(), 30_000);

    return notification;
  }, []);

  const syncPrayerScheduleWithServiceWorker = useCallback(
    async (prayers: PrayerTime[], context?: NotificationScheduleContext) => {
      const registration = await getServiceWorkerRegistration();

      if (!registration?.active || !context) {
        return;
      }

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

      if ("sync" in registration) {
        void (
          registration as ServiceWorkerRegistration & {
            sync?: { register: (tag: string) => Promise<void> };
          }
        ).sync?.register("prayer-times-check").catch(() => undefined);
      }
    },
    []
  );

  const schedulePrayerNotifications = useCallback(
    (
      prayers: PrayerTime[],
      onPrayerTime?: (prayer: PrayerTime) => void,
      context?: NotificationScheduleContext
    ) => {
      void syncPrayerScheduleWithServiceWorker(prayers, context);

      if (!permissionGranted.current) {
        return;
      }

      scheduledTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      scheduledTimeouts.current = [];

      const now = Date.now();

      prayers.forEach((prayer) => {
        const timeUntilPrayer = prayer.timestamp - now;

        if (timeUntilPrayer > 0 && timeUntilPrayer < 24 * 60 * 60 * 1000) {
          const timeoutId = window.setTimeout(async () => {
            await sendNotification(prayer);
            onPrayerTime?.(prayer);
          }, timeUntilPrayer);

          scheduledTimeouts.current.push(timeoutId);
        }
      });
    },
    [sendNotification, syncPrayerScheduleWithServiceWorker]
  );

  return {
    requestPermission,
    sendNotification,
    schedulePrayerNotifications,
    isSupported:
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator,
  };
}
