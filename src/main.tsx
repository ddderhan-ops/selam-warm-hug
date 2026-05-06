import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { initializeAdMob, prepareInterstitial, isNativePlatform } from "./lib/admob";

if (isNativePlatform()) {
  void initializeAdMob().then(() => prepareInterstitial());
}

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    void registration.update();

    if ("sync" in registration) {
      void (registration as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      }).sync?.register("prayer-times-check").catch(() => undefined);
    }

    const periodicSync = (
      registration as ServiceWorkerRegistration & {
        periodicSync?: {
          register: (tag: string, options: { minInterval: number }) => Promise<void>;
        };
      }
    ).periodicSync;

    if (periodicSync) {
      void periodicSync
        .register("prayer-times-check", { minInterval: 15 * 60 * 1000 })
        .catch(() => undefined);
    }
  },
});

createRoot(document.getElementById("root")!).render(<App />);
