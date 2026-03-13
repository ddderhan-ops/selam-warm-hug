import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC6lc83gn33dV_esmguRi44BPDGSxVNjPc",
  authDomain: "ezan-vakti-5fa77.firebaseapp.com",
  projectId: "ezan-vakti-5fa77",
  storageBucket: "ezan-vakti-5fa77.firebasestorage.app",
  messagingSenderId: "396790301454",
  appId: "1:396790301454:web:eda0008ad96ad441604d5f",
  measurementId: "G-PBZQ3F2T8L",
};

const VAPID_KEY =
  "BAbHskhBosUU50vzM8-Q50YN6dFAnhksdjN69z3BcHwCBbVEm8uOdw2m_3NYcNha12L1w7_1pb3PVHagex6f4_8";

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (messaging) return messaging;

  try {
    messaging = getMessaging(app);
    return messaging;
  } catch {
    console.warn("Firebase Messaging is not supported in this browser");
    return null;
  }
}

export async function requestFCMToken(): Promise<string | null> {
  try {
    const m = getMessagingInstance();
    if (!m) return null;

    const registration = await navigator.serviceWorker.getRegistration("/firebase-cloud-messaging-push-scope");
    
    const token = await getToken(m, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
}

export function onFCMMessage(callback: (payload: unknown) => void): (() => void) | null {
  const m = getMessagingInstance();
  if (!m) return null;

  return onMessage(m, (payload) => {
    callback(payload);
  });
}

export function getDeviceId(): string {
  const KEY = "nur_ezan_device_id";
  let deviceId = localStorage.getItem(KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(KEY, deviceId);
  }
  return deviceId;
}
