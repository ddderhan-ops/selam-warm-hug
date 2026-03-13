/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC6lc83gn33dV_esmguRi44BPDGSxVNjPc",
  authDomain: "ezan-vakti-5fa77.firebaseapp.com",
  projectId: "ezan-vakti-5fa77",
  storageBucket: "ezan-vakti-5fa77.firebasestorage.app",
  messagingSenderId: "396790301454",
  appId: "1:396790301454:web:eda0008ad96ad441604d5f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Ezan Vakti Geldi";
  const options = {
    body: payload.notification?.body || "Namaz vakti girdi.",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: payload.data?.tag || "prayer-push",
    requireInteraction: true,
    data: {
      url: "/",
      sound: "/audio/ezan.mp3",
    },
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      return self.clients.openWindow("/");
    })
  );
});
