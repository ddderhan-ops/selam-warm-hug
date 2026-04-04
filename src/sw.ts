/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import {
  getAllPrayerTimesCache,
  hasPrayerNotificationBeenSent,
  markPrayerNotificationSent,
  savePrayerTimesCache,
  toDateKey,
} from "./lib/prayerCache";
import type { PrayerTime } from "./lib/prayerTimes";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string | null }>;
};

interface SyncLikeEvent extends Event {
  tag: string;
  waitUntil: (promise: Promise<unknown>) => void;
}

interface PushLikeEvent extends Event {
  data?: {
    json: () => unknown;
    text: () => string;
  };
  waitUntil: (promise: Promise<unknown>) => void;
}

interface MessagePayload {
  type?: string;
  payload?: {
    prayers?: PrayerTime[];
    city?: string;
    date?: string;
    hijriDate?: string;
    latitude?: number;
    longitude?: number;
    dateKey?: string;
  };
}

const DUE_WINDOW_MS = 90 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;
const NOTIFICATION_ICON = "/pwa-192x192.png";
const NOTIFICATION_BADGE = "/pwa-192x192.png";
const ADHAN_SOUND_PATH = "/audio/ezan.mp3";

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Periodic self-check: every 30s scan cached prayer times for due notifications
let checkIntervalId: ReturnType<typeof setInterval> | null = null;

function startPeriodicCheck() {
  if (checkIntervalId !== null) return;
  checkIntervalId = setInterval(() => {
    checkDuePrayerNotifications().catch(() => undefined);
  }, CHECK_INTERVAL_MS);
}

function stopPeriodicCheck() {
  if (checkIntervalId !== null) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
}

registerRoute(
  ({ url }) => /^https:\/\/api\.aladhan\.com\/.*/i.test(url.href),
  new NetworkFirst({
    cacheName: "prayer-times-cache",
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "app-shell-cache",
    networkTimeoutSeconds: 5,
  })
);

registerRoute(
  ({ request }) => request.destination === "audio",
  new CacheFirst({
    cacheName: "audio-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i.test(url.href),
  new StaleWhileRevalidate({
    cacheName: "google-fonts-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

async function showPrayerNotification(prayer: PrayerTime, city: string): Promise<void> {
  await self.registration.showNotification(`Ezan Vakti Geldi: ${prayer.name}`, {
    body: `${city} için ${prayer.name} vakti girdi.`,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    tag: `prayer-${prayer.nameEn}`,
    
    requireInteraction: true,
    
    data: {
      prayer: prayer.nameEn,
      channelId: "prayer-times-channel",
      channelName: "Namaz Vakitleri",
      sound: ADHAN_SOUND_PATH,
      url: "/",
    },
  });
}

async function checkDuePrayerNotifications(): Promise<void> {
  const now = Date.now();
  const records = await getAllPrayerTimesCache();

  await Promise.all(
    records.map(async (record) => {
      for (const prayer of record.prayers) {
        const diff = now - prayer.timestamp;

        if (diff < 0 || diff > DUE_WINDOW_MS) {
          continue;
        }

        const notificationId = `${record.id}_${prayer.nameEn}`;
        const alreadySent = await hasPrayerNotificationBeenSent(notificationId);

        if (alreadySent) {
          continue;
        }

        await showPrayerNotification(prayer, record.city);
        await markPrayerNotificationSent(notificationId);
      }
    })
  );
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    checkDuePrayerNotifications().then(() => {
      startPeriodicCheck();
    })
  );
});

self.addEventListener("message", (event) => {
  const message = event.data as MessagePayload;

  if (message?.type === "CACHE_PRAYERS") {
    const payload = message.payload;

    if (
      payload?.prayers?.length &&
      typeof payload.latitude === "number" &&
      typeof payload.longitude === "number"
    ) {
      const dateKey = payload.dateKey || toDateKey(new Date());

      event.waitUntil(
        savePrayerTimesCache({
          dateKey,
          latitude: payload.latitude,
          longitude: payload.longitude,
          data: {
            date: payload.date || new Date().toLocaleDateString("tr-TR"),
            hijriDate: payload.hijriDate || "",
            hijriDay: new Date().getDate(),
            hijriMonth: "",
            hijriYear: new Date().getFullYear(),
            city: payload.city || "Mevcut Konum",
            prayers: payload.prayers,
          },
        })
      );
    }
  }

  if (message?.type === "CHECK_DUE_PRAYERS") {
    event.waitUntil(checkDuePrayerNotifications());
  }
});

self.addEventListener("sync", (event: Event) => {
  const syncEvent = event as SyncLikeEvent;

  if (syncEvent.tag === "prayer-times-check") {
    syncEvent.waitUntil(checkDuePrayerNotifications());
  }
});

self.addEventListener("periodicsync", (event: Event) => {
  const syncEvent = event as SyncLikeEvent;

  if (syncEvent.tag === "prayer-times-check") {
    syncEvent.waitUntil(checkDuePrayerNotifications());
  }
});

self.addEventListener("push", (event: Event) => {
  const pushEvent = event as PushLikeEvent;

  pushEvent.waitUntil(
    (async () => {
      let payload: Record<string, unknown> = {};

      if (pushEvent.data) {
        try {
          payload = pushEvent.data.json() as Record<string, unknown>;
        } catch {
          payload = { body: pushEvent.data.text() };
        }
      }

      await self.registration.showNotification(
        String(payload.title || "Ezan Vakti Geldi"),
        {
          body: String(payload.body || "Namaz vakti girdi."),
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_BADGE,
          tag: String(payload.tag || "prayer-push"),
          data: {
            channelId: "prayer-times-channel",
            channelName: "Namaz Vakitleri",
            sound: ADHAN_SOUND_PATH,
            url: String(payload.url || "/"),
          },
        }
      );
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data?.url as string) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ((client as WindowClient).url.includes(self.location.origin)) {
          return (client as WindowClient).focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
