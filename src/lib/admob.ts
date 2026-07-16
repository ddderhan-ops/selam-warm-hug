import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
  AdMobBannerSize,
} from "@capacitor-community/admob";

/**
 * AdMob test IDs (safe to ship without real ad units).
 * Replace with production IDs from https://admob.google.com when ready.
 *
 * Production replacement:
 *   ANDROID_APP_ID         -> ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
 *   ANDROID_BANNER_ID      -> ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
 *   ANDROID_INTERSTITIAL_ID-> ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
 *
 * The App ID also goes in android/app/src/main/AndroidManifest.xml as:
 *   <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
 *              android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
 */
export const ADMOB_TEST_IDS = {
  banner: "ca-app-pub-3940256099942544/6300978111",
  interstitial: "ca-app-pub-3940256099942544/1033173712",
};

// Production AdMob IDs for Nur Ezan Vakti
export const ADMOB_PROD_IDS = {
  appId: "ca-app-pub-4225306495072438~2731555792",
  banner: "ca-app-pub-4225306495072438/4801662859",
  interstitial: "ca-app-pub-4225306495072438/8746179665",
};

// Flip to false to serve real ads in production builds
const USE_TEST_ADS = false;

export const ADMOB_BANNER_ID = USE_TEST_ADS
  ? ADMOB_TEST_IDS.banner
  : ADMOB_PROD_IDS.banner;

export const ADMOB_INTERSTITIAL_ID = USE_TEST_ADS
  ? ADMOB_TEST_IDS.interstitial
  : ADMOB_PROD_IDS.interstitial;

export const ADMOB_APP_ID = ADMOB_PROD_IDS.appId;

let initialized = false;
let bannerVisible = false;
let interstitialPrepared = false;

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export async function initializeAdMob(): Promise<void> {
  if (!isNativePlatform() || initialized) return;
  try {
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: USE_TEST_ADS,
    });
    initialized = true;
    console.log("[AdMob] Initialized");
  } catch (e) {
    console.warn("[AdMob] Initialize failed:", e);
  }
}

export async function showBanner(): Promise<void> {
  if (!isNativePlatform()) return;
  if (!initialized) await initializeAdMob();
  if (bannerVisible) return;
  const options: BannerAdOptions = {
    adId: ADMOB_BANNER_ID,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: USE_TEST_ADS,
  };
  try {
    await AdMob.showBanner(options);
    bannerVisible = true;
    console.log("[AdMob] Banner shown");
  } catch (e) {
    console.warn("[AdMob] showBanner failed:", e);
  }
}

export async function hideBanner(): Promise<void> {
  if (!isNativePlatform() || !bannerVisible) return;
  try {
    await AdMob.hideBanner();
    bannerVisible = false;
  } catch (e) {
    console.warn("[AdMob] hideBanner failed:", e);
  }
}

export async function prepareInterstitial(): Promise<void> {
  if (!isNativePlatform()) return;
  if (!initialized) await initializeAdMob();
  if (interstitialPrepared) return;
  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_INTERSTITIAL_ID,
      isTesting: USE_TEST_ADS,
    });
    interstitialPrepared = true;
  } catch (e) {
    console.warn("[AdMob] prepareInterstitial failed:", e);
  }
}

export async function showInterstitial(): Promise<boolean> {
  if (!isNativePlatform()) return false;
  if (!interstitialPrepared) {
    await prepareInterstitial();
    if (!interstitialPrepared) return false;
  }
  try {
    await AdMob.showInterstitial();
    interstitialPrepared = false;
    // Pre-load the next one
    void prepareInterstitial();
    return true;
  } catch (e) {
    console.warn("[AdMob] showInterstitial failed:", e);
    interstitialPrepared = false;
    return false;
  }
}
