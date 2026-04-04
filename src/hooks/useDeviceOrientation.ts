import { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceOrientationState {
  heading: number | null;
  hasPermission: boolean;
  isSupported: boolean;
  error: string | null;
}

const LP_ALPHA = 0.08;

function lerpAngle(from: number, to: number, alpha: number): number {
  let diff = to - from;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  let result = from + diff * alpha;
  while (result < 0) result += 360;
  while (result >= 360) result -= 360;
  return result;
}

function lowPassFilter(prev: number | null, raw: number, alpha: number): number {
  if (prev === null) return raw;
  return lerpAngle(prev, raw, alpha);
}

export function useDeviceOrientation() {
  const [state, setState] = useState<DeviceOrientationState>({
    heading: null,
    hasPermission: false,
    isSupported: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
    error: null,
  });

  const rawHeadingRef = useRef<number | null>(null);
  const filteredHeadingRef = useRef<number | null>(null);
  const smoothHeadingRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const smoothLoop = useCallback(() => {
    const filtered = filteredHeadingRef.current;
    if (filtered === null) {
      rafRef.current = requestAnimationFrame(smoothLoop);
      return;
    }

    if (smoothHeadingRef.current === null) {
      smoothHeadingRef.current = filtered;
    } else {
      smoothHeadingRef.current = lerpAngle(smoothHeadingRef.current, filtered, 0.08);
    }

    setState(prev => {
      const rounded = Math.round(smoothHeadingRef.current! * 10) / 10;
      if (prev.heading !== null && Math.abs(prev.heading - rounded) < 0.2) {
        return prev;
      }
      return { ...prev, heading: rounded, hasPermission: true };
    });

    rafRef.current = requestAnimationFrame(smoothLoop);
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // Absolute orientation (Rotation Vector eşdeğeri)
    if ((event as any).absolute === true && event.alpha !== null) {
      heading = 360 - event.alpha;
    } else if ('webkitCompassHeading' in event) {
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha;
    }

    if (heading !== null) {
      rawHeadingRef.current = heading;
      filteredHeadingRef.current = lowPassFilter(
        filteredHeadingRef.current,
        heading,
        LP_ALPHA
      );
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
          try {
            window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
          } catch { /* desteklenmiyorsa yoksay */ }
          window.addEventListener('deviceorientation', handleOrientation, true);
          rafRef.current = requestAnimationFrame(smoothLoop);
          setState(prev => ({ ...prev, hasPermission: true }));
          return true;
        } else {
          setState(prev => ({ ...prev, error: 'Permission denied', hasPermission: false }));
          return false;
        }
      } else {
        try {
          window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
        } catch { /* yoksay */ }
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
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
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
