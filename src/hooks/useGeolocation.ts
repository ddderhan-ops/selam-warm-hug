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
      const permResult = await Geolocation.requestPermissions();
      const locationPermission = permResult.location;
      const coarsePermission = permResult.coarseLocation;
      const permissionGranted = locationPermission === "granted" || coarsePermission === "granted";

      if (!permissionGranted) {
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
      setState({
        latitude: null,
        longitude: null,
        error: err?.message || "Konum alınamadı.",
        loading: false,
        permissionDenied: false,
      });
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, requestLocation };
}
