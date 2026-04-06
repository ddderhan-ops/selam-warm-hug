import { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceOrientationState {
  heading: number | null;
  hasPermission: boolean;
  isSupported: boolean;
  error: string | null;
}

type HeadingSource = 'none' | 'alpha' | 'absolute' | 'webkit';

const LP_ALPHA = 0.08;
const SMOOTH_ALPHA = 0.18;
const HEADING_UPDATE_INTERVAL_MS = 48;
const SOURCE_PRIORITY: Record<HeadingSource, number> = {
  none: 0,
  alpha: 1,
  absolute: 2,
  webkit: 3,
};

function normalizeAngle(angle: number): number {
  let normalized = angle;
  while (normalized < 0) normalized += 360;
  while (normalized >= 360) normalized -= 360;
  return normalized;
}

function getAngleDifference(from: number, to: number): number {
  let diff = to - from;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

function lerpAngle(from: number, to: number, alpha: number): number {
  return normalizeAngle(from + getAngleDifference(from, to) * alpha);
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

  const filteredHeadingRef = useRef<number | null>(null);
  const smoothHeadingRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const headingSourceRef = useRef<HeadingSource>('none');
  const listenersActiveRef = useRef(false);

  const smoothLoop = useCallback((timestamp: number) => {
    const filtered = filteredHeadingRef.current;

    if (
      filtered !== null &&
      (lastFrameTimeRef.current === null ||
        timestamp - lastFrameTimeRef.current >= HEADING_UPDATE_INTERVAL_MS)
    ) {
      lastFrameTimeRef.current = timestamp;
      smoothHeadingRef.current =
        smoothHeadingRef.current === null
          ? filtered
          : lerpAngle(smoothHeadingRef.current, filtered, SMOOTH_ALPHA);

      setState(prev => {
        const rounded = Math.round(normalizeAngle(smoothHeadingRef.current!));
        if (
          prev.heading !== null &&
          Math.abs(getAngleDifference(prev.heading, rounded)) < 1
        ) {
          return prev;
        }

        return { ...prev, heading: rounded, hasPermission: true, error: null };
      });
    }

    rafRef.current = requestAnimationFrame(smoothLoop);
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;
    let source: HeadingSource = 'none';
    const orientationEvent = event as DeviceOrientationEvent & {
      absolute?: boolean;
      webkitCompassAccuracy?: number;
      webkitCompassHeading?: number;
    };

    if (typeof orientationEvent.webkitCompassHeading === 'number') {
      if (
        typeof orientationEvent.webkitCompassAccuracy !== 'number' ||
        orientationEvent.webkitCompassAccuracy <= 35
      ) {
        heading = orientationEvent.webkitCompassHeading;
        source = 'webkit';
      }
    } else if (orientationEvent.absolute === true && event.alpha !== null) {
      heading = 360 - event.alpha;
      source = 'absolute';
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha;
      source = 'alpha';
    }

    if (heading !== null) {
      heading = normalizeAngle(heading);

      if (SOURCE_PRIORITY[source] < SOURCE_PRIORITY[headingSourceRef.current]) {
        return;
      }

      if (SOURCE_PRIORITY[source] > SOURCE_PRIORITY[headingSourceRef.current]) {
        headingSourceRef.current = source;
        filteredHeadingRef.current = heading;
        smoothHeadingRef.current = heading;
        return;
      }

      filteredHeadingRef.current = lowPassFilter(filteredHeadingRef.current, heading, LP_ALPHA);
    }
  }, []);

  const startTracking = useCallback(() => {
    if (listenersActiveRef.current) return;

    try {
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    } catch {
      // desteklenmiyorsa yoksay
    }

    window.addEventListener('deviceorientation', handleOrientation, true);
    listenersActiveRef.current = true;

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(smoothLoop);
    }
  }, [handleOrientation, smoothLoop]);

  const stopTracking = useCallback(() => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.removeEventListener('deviceorientation', handleOrientation, true);
    listenersActiveRef.current = false;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    lastFrameTimeRef.current = null;
    filteredHeadingRef.current = null;
    smoothHeadingRef.current = null;
    headingSourceRef.current = 'none';
  }, [handleOrientation]);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Device orientation not supported' }));
      return false;
    }

    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          startTracking();
          setState(prev => ({ ...prev, hasPermission: true, error: null }));
          return true;
        } else {
          setState(prev => ({ ...prev, error: 'Permission denied', hasPermission: false }));
          return false;
        }
      } else {
        startTracking();
        setState(prev => ({ ...prev, hasPermission: true, error: null }));
        return true;
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to request permission' }));
      return false;
    }
  }, [state.isSupported, startTracking]);

  useEffect(() => {
    return stopTracking;
  }, [stopTracking]);

  return {
    ...state,
    requestPermission,
  };
}
