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

  // TODO: Geçici fallback — kaldırılacak. Konum izni alınamazsa İstanbul kullanılır.
  const FALLBACK_LAT = 41.0082;
  const FALLBACK_LON = 28.9784;

  const useFallback = (reason: string) => {
    console.warn("[useGeolocation] Fallback to Istanbul:", reason);
    setState({
      latitude: FALLBACK_LAT,
      longitude: FALLBACK_LON,
      error: null,
      loading: false,
      permissionDenied: false,
    });
  };

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null, permissionDenied: false }));

    try {
      const permResult = await Geolocation.requestPermissions();
      const locationPermission = permResult.location;
      const coarsePermission = permResult.coarseLocation;
      const permissionGranted = locationPermission === "granted" || coarsePermission === "granted";

      if (!permissionGranted) {
        useFallback("permission not granted");
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
      useFallback(err?.message || "unknown error");
    }
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, requestLocation };
}
