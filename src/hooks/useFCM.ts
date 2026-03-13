import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { requestFCMToken, onFCMMessage, getDeviceId } from "@/lib/firebase";
import { toast } from "sonner";

interface UseFCMOptions {
  city: string;
  latitude: number;
  longitude: number;
  enabled: boolean;
}

export function useFCM({ city, latitude, longitude, enabled }: UseFCMOptions) {
  const tokenRef = useRef<string | null>(null);
  const registeredRef = useRef(false);

  const registerToken = useCallback(async () => {
    if (!enabled || registeredRef.current) return;

    try {
      // Register Firebase messaging SW
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/firebase-cloud-messaging-push-scope",
        });
      }

      const token = await requestFCMToken();
      if (!token) {
        console.warn("Could not get FCM token");
        return;
      }

      tokenRef.current = token;
      const deviceId = getDeviceId();

      const { error } = await supabase.from("fcm_tokens").upsert(
        {
          device_id: deviceId,
          fcm_token: token,
          city,
          latitude,
          longitude,
          notifications_enabled: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "device_id" }
      );

      if (error) {
        console.error("Failed to save FCM token:", error);
      } else {
        registeredRef.current = true;
        console.log("FCM token registered successfully");
      }
    } catch (error) {
      console.error("FCM registration error:", error);
    }
  }, [enabled, city, latitude, longitude]);

  const unregisterToken = useCallback(async () => {
    const deviceId = getDeviceId();

    await supabase
      .from("fcm_tokens")
      .update({ notifications_enabled: false, updated_at: new Date().toISOString() })
      .eq("device_id", deviceId);

    registeredRef.current = false;
  }, []);

  const updateLocation = useCallback(
    async (newCity: string, newLat: number, newLng: number) => {
      if (!registeredRef.current) return;

      const deviceId = getDeviceId();
      await supabase
        .from("fcm_tokens")
        .update({
          city: newCity,
          latitude: newLat,
          longitude: newLng,
          updated_at: new Date().toISOString(),
        })
        .eq("device_id", deviceId);
    },
    []
  );

  // Register token when enabled
  useEffect(() => {
    if (enabled) {
      registerToken();
    } else {
      unregisterToken();
    }
  }, [enabled, registerToken, unregisterToken]);

  // Listen for foreground messages
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = onFCMMessage((payload: unknown) => {
      const p = payload as { notification?: { title?: string; body?: string } };
      if (p.notification?.title) {
        toast(p.notification.title, {
          description: p.notification.body,
        });
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [enabled]);

  return { registerToken, unregisterToken, updateLocation };
}
