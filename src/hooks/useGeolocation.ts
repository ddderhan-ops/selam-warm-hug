import { useState, useEffect, useCallback, useRef } from "react";

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
    loading: false,
    permissionDenied: false,
  });

  const hasRequestedRef = useRef(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Tarayıcınız konum özelliğini desteklemiyor",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionDenied: false,
        });
      },
      (error) => {
        let errorMessage = "Konum alınamadı";
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Konum izni reddedildi";
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Konum bilgisi mevcut değil";
            break;
          case error.TIMEOUT:
            errorMessage = "Konum isteği zaman aşımına uğradı";
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // 1 minute cache for fresher data
      }
    );
  }, []);

  // On mount, check if permission is already granted — only auto-request if so
  useEffect(() => {
    if (hasRequestedRef.current) return;

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          hasRequestedRef.current = true;
          requestLocation();
        }
        // If "prompt" or "denied", show the LocationPermissionCard instead
      }).catch(() => {
        // Fallback: auto-request (older browsers)
        hasRequestedRef.current = true;
        requestLocation();
      });
    } else {
      // No permissions API — auto-request
      hasRequestedRef.current = true;
      requestLocation();
    }
  }, [requestLocation]);

  return { ...state, requestLocation };
}
