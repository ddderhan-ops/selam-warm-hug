import { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceOrientationState {
  heading: number | null;
  hasPermission: boolean;
  isSupported: boolean;
  error: string | null;
}

// Smoothly interpolate between angles (handles 0/360 wraparound)
function lerpAngle(from: number, to: number, factor: number): number {
  let diff = to - from;
  // Normalize to -180..180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  let result = from + diff * factor;
  // Normalize to 0..360
  while (result < 0) result += 360;
  while (result >= 360) result -= 360;
  return result;
}

export function useDeviceOrientation() {
  const [state, setState] = useState<DeviceOrientationState>({
    heading: null,
    hasPermission: false,
    isSupported: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
    error: null,
  });

  const rawHeadingRef = useRef<number | null>(null);
  const smoothHeadingRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Smoothing loop using requestAnimationFrame
  const smoothLoop = useCallback(() => {
    const raw = rawHeadingRef.current;
    if (raw === null) {
      rafRef.current = requestAnimationFrame(smoothLoop);
      return;
    }

    if (smoothHeadingRef.current === null) {
      smoothHeadingRef.current = raw;
    } else {
      smoothHeadingRef.current = lerpAngle(smoothHeadingRef.current, raw, 0.1);
    }

    setState(prev => {
      const rounded = Math.round(smoothHeadingRef.current! * 10) / 10;
      if (prev.heading !== null && Math.abs(prev.heading - rounded) < 0.15) {
        return prev; // skip tiny updates to avoid re-renders
      }
      return { ...prev, heading: rounded, hasPermission: true };
    });

    rafRef.current = requestAnimationFrame(smoothLoop);
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    if ('webkitCompassHeading' in event) {
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha;
    }

    if (heading !== null) {
      rawHeadingRef.current = heading;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Device orientation not supported' }));
      return false;
    }

    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          // Start smoothing loop
          rafRef.current = requestAnimationFrame(smoothLoop);
          setState(prev => ({ ...prev, hasPermission: true }));
          return true;
        } else {
          setState(prev => ({ ...prev, error: 'Permission denied', hasPermission: false }));
          return false;
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
        rafRef.current = requestAnimationFrame(smoothLoop);
        setState(prev => ({ ...prev, hasPermission: true }));
        return true;
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to request permission' }));
      return false;
    }
  }, [state.isSupported, handleOrientation, smoothLoop]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleOrientation]);

  return {
    ...state,
    requestPermission,
  };
}
