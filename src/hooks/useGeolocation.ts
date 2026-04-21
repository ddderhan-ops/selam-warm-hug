import { useState, useEffect, useCallback } from "react";
import { Geolocation } from "@capacitor/geolocation";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    permissionDenied: false,
  });

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null, permissionDenied: false }));

    try {
      // Request native permission via Capacitor
      const permResult = await Geolocation.requestPermissions();
      if (permResult.location === "denied") {
        setState({
          latitude: null,
          longitude: null,
          error: "Konum izni reddedildi. Lütfen cihaz ayarlarından konum iznini açın.",
          loading: false,
          permissionDenied: true,
        });
        return;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
        permissionDenied: false,
      });
    } catch (err: any) {
      const msg = err?.message || "Konum alınamadı";
      const denied = msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("permission");
      setState({
        latitude: null,
        longitude: null,
        error: msg,
        loading: false,
        permissionDenied: denied,
      });
    }
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, requestLocation };
}
