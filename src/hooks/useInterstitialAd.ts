import { useCallback } from 'react';
import { showInterstitial, isNativePlatform } from '@/lib/admob';

const AD_STORAGE_PREFIX = 'interstitial_last_shown_';
const CLICK_COUNTER_KEY = 'interstitial_click_counter';
const CLICKS_PER_AD = 4; // Show an interstitial every N tracked clicks

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
 * Interstitial ad hook.
 * - tryShowAd(placement): daily-capped (1x per day per placement)
 * - trackClickAndMaybeShow(): shows an interstitial every ~4 clicks
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

  const trackClickAndMaybeShow = useCallback(() => {
    const current = Number(localStorage.getItem(CLICK_COUNTER_KEY) || '0') + 1;
    if (current >= CLICKS_PER_AD) {
      localStorage.setItem(CLICK_COUNTER_KEY, '0');
      if (isNativePlatform()) {
        void showInterstitial();
      } else {
        console.log('[AdMob web stub] Would show interstitial (click threshold)');
      }
      return true;
    }
    localStorage.setItem(CLICK_COUNTER_KEY, String(current));
    return false;
  }, []);

  return { tryShowAd, trackClickAndMaybeShow };
}
