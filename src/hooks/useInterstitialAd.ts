import { useCallback } from 'react';
import { showInterstitial, isNativePlatform } from '@/lib/admob';

const AD_STORAGE_PREFIX = 'interstitial_last_shown_';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function canShowAd(key: string): boolean {
  const lastShown = localStorage.getItem(AD_STORAGE_PREFIX + key);
  return lastShown !== getToday();
}

function markAdShown(key: string): void {
  localStorage.setItem(AD_STORAGE_PREFIX + key, getToday());
}

/**
 * Frequency-capped interstitial ad hook.
 * Each placement (e.g. 'home', 'compass') is shown at most 1x per day.
 * On native (Capacitor), shows real AdMob interstitial.
 * On web, no-op (logs only).
 */
export function useInterstitialAd() {
  const tryShowAd = useCallback((placement: 'home' | 'compass') => {
    if (!canShowAd(placement)) return false;

    if (isNativePlatform()) {
      void showInterstitial().then((shown) => {
        if (shown) markAdShown(placement);
      });
    } else {
      console.log(`[AdMob web stub] Would show interstitial: ${placement}`);
      markAdShown(placement);
    }
    return true;
  }, []);

  return { tryShowAd };
}
