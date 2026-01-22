import { useEffect, useRef, useCallback } from "react";
import type { PrayerTime } from "@/lib/prayerTimes";

export function useNotification() {
  const permissionGranted = useRef(false);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        permissionGranted.current = true;
      }
    }
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

  const sendNotification = useCallback((prayer: PrayerTime) => {
    if (!permissionGranted.current) return;

    new Notification(`Ezan Vakti: ${prayer.name}`, {
      body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: `prayer-${prayer.nameEn}`,
      requireInteraction: true,
    });
  }, []);

  const schedulePrayerNotifications = useCallback(
    (prayers: PrayerTime[]) => {
      if (!permissionGranted.current) return;

      const now = Date.now();

      prayers.forEach((prayer) => {
        const timeUntilPrayer = prayer.timestamp - now;

        if (timeUntilPrayer > 0 && timeUntilPrayer < 24 * 60 * 60 * 1000) {
          setTimeout(() => {
            sendNotification(prayer);
          }, timeUntilPrayer);
        }
      });
    },
    [sendNotification]
  );

  return {
    requestPermission,
    sendNotification,
    schedulePrayerNotifications,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
