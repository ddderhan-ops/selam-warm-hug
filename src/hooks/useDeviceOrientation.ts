import { useState, useEffect, useCallback } from 'react';

interface DeviceOrientationState {
  heading: number | null;
  hasPermission: boolean;
  isSupported: boolean;
  error: string | null;
}

export function useDeviceOrientation() {
  const [state, setState] = useState<DeviceOrientationState>({
    heading: null,
    hasPermission: false,
    isSupported: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
    error: null,
  });

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // For iOS, use webkitCompassHeading if available
    let heading: number | null = null;
    
    if ('webkitCompassHeading' in event) {
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // For Android, alpha gives rotation around z-axis
      // We need to convert it to compass heading
      heading = 360 - event.alpha;
    }

    if (heading !== null) {
      setState(prev => ({
        ...prev,
        heading,
        hasPermission: true,
      }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Device orientation not supported' }));
      return false;
    }

    try {
      // iOS 13+ requires explicit permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setState(prev => ({ ...prev, hasPermission: true }));
          return true;
        } else {
          setState(prev => ({ ...prev, error: 'Permission denied', hasPermission: false }));
          return false;
        }
      } else {
        // Non-iOS devices don't need permission
        window.addEventListener('deviceorientation', handleOrientation, true);
        setState(prev => ({ ...prev, hasPermission: true }));
        return true;
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to request permission' }));
      return false;
    }
  }, [state.isSupported, handleOrientation]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  return {
    ...state,
    requestPermission,
  };
}
