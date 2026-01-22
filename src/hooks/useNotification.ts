import { useEffect, useRef, useCallback } from "react";
import type { PrayerTime } from "@/lib/prayerTimes";

export function useNotification() {
  const permissionGranted = useRef(false);
  const scheduledTimeouts = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        permissionGranted.current = true;
      }
    }

    // Cleanup timeouts on unmount
    return () => {
      scheduledTimeouts.current.forEach(clearTimeout);
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

  const sendNotification = useCallback((prayer: PrayerTime) => {
    if (!permissionGranted.current) return;

    const notification = new Notification(`Ezan Vakti Geldi: ${prayer.name}`, {
      body: `${prayer.name} vakti girdi. Hayırlı ibadetler.`,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: `prayer-${prayer.nameEn}`,
      requireInteraction: true,
    });

    // Auto close after 30 seconds
    setTimeout(() => notification.close(), 30000);

    return notification;
  }, []);

  const schedulePrayerNotifications = useCallback(
    (prayers: PrayerTime[], onPrayerTime?: (prayer: PrayerTime) => void) => {
      if (!permissionGranted.current) return;

      // Clear any existing scheduled notifications
      scheduledTimeouts.current.forEach(clearTimeout);
      scheduledTimeouts.current = [];

      const now = Date.now();

      prayers.forEach((prayer) => {
        const timeUntilPrayer = prayer.timestamp - now;

        if (timeUntilPrayer > 0 && timeUntilPrayer < 24 * 60 * 60 * 1000) {
          const timeout = setTimeout(() => {
            sendNotification(prayer);
            onPrayerTime?.(prayer);
          }, timeUntilPrayer);

          scheduledTimeouts.current.push(timeout);
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
