import { useCallback } from 'react';

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
 * 
 * In production, replace the console.log with actual AdMob SDK calls:
 * - AdMob.showInterstitial()
 */
export function useInterstitialAd() {
  const tryShowAd = useCallback((placement: 'home' | 'compass') => {
    if (!canShowAd(placement)) {
      return false;
    }

    // TODO: Replace with actual AdMob interstitial call
    // e.g. AdMob.showInterstitial({ adId: 'ca-app-pub-xxx/yyy' });
    console.log(`[AdMob] Showing interstitial for placement: ${placement}`);
    markAdShown(placement);
    return true;
  }, []);

  return { tryShowAd };
}
