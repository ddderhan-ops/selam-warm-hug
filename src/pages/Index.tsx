import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PrayerTimesList } from "@/components/PrayerTimesList";
import { DailyVerse } from "@/components/DailyVerse";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { SplashScreen } from "@/components/SplashScreen";
import { QiblaCompass } from "@/components/QiblaCompass";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { ReligiousDaysPage } from "@/components/ReligiousDaysPage";
import { useTheme } from "@/hooks/useTheme";
import { useNotification } from "@/hooks/useNotification";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAdhan } from "@/hooks/useAdhan";
import { useFCM } from "@/hooks/useFCM";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  fetchPrayerTimes,
  getNextPrayer,
  reverseGeocode,
  type PrayerTimesData,
} from "@/lib/prayerTimes";
import { Loader2, ChevronRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import { usePreferences, readPreference } from "@/hooks/usePreferences";

type View = 'main' | 'qibla' | 'religious';

const NOTIFICATION_PREFERENCE_KEY = "notificationsEnabled";
const SOUND_ALERT_PREFERENCE_KEY = "soundAlertEnabled";
const PRE_ALERT_PREFERENCE_KEY = "preAlertEnabled";

function getStoredBoolean(key: string, fallback = false) {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(key);
  return value === null ? fallback : value === "true";
}

const Index = () => {
  const { t, language } = useTranslation();
  const { setPreference } = usePreferences();
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
      return !hasSeenSplash;
    }
    return true;
  });
  const [currentView, setCurrentView] = useState<View>('main');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const [locationName, setLocationName] = useState<string>('');

  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage synchronously, then async hydrate from Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState<boolean | null>(null);
  const [preAlertEnabled, setPreAlertEnabled] = useState<boolean | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [hydrated, setHydrated] = useState(false);

  const lastDateRef = useRef<string>("");
  const homeAdShownRef = useRef(false);

  const { colorTheme, setColorTheme, darkMode, setDarkMode, toggleDarkMode, autoDarkMode, toggleAutoDarkMode, preAlertMinutes, setPreAlertMinutes, alertSound, setAlertSound } = useTheme();
  const { requestPermission, schedulePrayerNotifications, isSupported } = useNotification();
  const { latitude, longitude, loading: geoLoading, permissionDenied, requestLocation } = useGeolocation();
  const { playAdhan, playPreAlert, previewSound } = useAdhan();
  const { tryShowAd } = useInterstitialAd();

  const fcmCity = prayerData?.city || locationName || "Unknown";
  const fcmLat = latitude || 41.0082;
  const fcmLng = longitude || 28.9784;

  const { updateLocation } = useFCM({
    city: fcmCity,
    latitude: fcmLat,
    longitude: fcmLng,
    enabled: notificationsEnabled === true,
  });

  // Hydrate all toggle states from Preferences on mount — until done, render null states
  useEffect(() => {
    let isActive = true;

    const hydrate = async () => {
      try {
        const [notifValue, soundValue, preAlertValue] = await Promise.all([
          readPreference(NOTIFICATION_PREFERENCE_KEY),
          readPreference(SOUND_ALERT_PREFERENCE_KEY),
          readPreference(PRE_ALERT_PREFERENCE_KEY),
        ]);
        if (!isActive) return;

        const n = notifValue !== null ? notifValue === "true" : getStoredBoolean(NOTIFICATION_PREFERENCE_KEY);
        const s = soundValue !== null ? soundValue === "true" : getStoredBoolean(SOUND_ALERT_PREFERENCE_KEY);
        const p = preAlertValue !== null ? preAlertValue === "true" : getStoredBoolean(PRE_ALERT_PREFERENCE_KEY);

        setNotificationsEnabled(n);
        setSoundAlertEnabled(s);
        setPreAlertEnabled(p);

        // Sync back to localStorage
        localStorage.setItem(NOTIFICATION_PREFERENCE_KEY, String(n));
        localStorage.setItem(SOUND_ALERT_PREFERENCE_KEY, String(s));
        localStorage.setItem(PRE_ALERT_PREFERENCE_KEY, String(p));
      } finally {
        if (isActive) setHydrated(true);
      }
    };

    hydrate();
    return () => { isActive = false; };
  }, []);

  // Re-sync when app comes to foreground
  useEffect(() => {
    let isActive = true;
    const handleVisibility = async () => {
      if (document.visibilityState !== "visible") return;
      const [notifValue, soundValue, preAlertValue] = await Promise.all([
        readPreference(NOTIFICATION_PREFERENCE_KEY),
        readPreference(SOUND_ALERT_PREFERENCE_KEY),
        readPreference(PRE_ALERT_PREFERENCE_KEY),
      ]);
      if (!isActive) return;
      if (notifValue !== null) setNotificationsEnabled(notifValue === "true");
      if (soundValue !== null) setSoundAlertEnabled(soundValue === "true");
      if (preAlertValue !== null) setPreAlertEnabled(preAlertValue === "true");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { isActive = false; document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);

  const persistToggle = useCallback(
    async (key: string, value: boolean) => {
      localStorage.setItem(key, String(value));
      await setPreference(key, String(value));
    },
    [setPreference]
  );

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  }, []);

  const loadPrayerTimes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const lat = latitude || 41.0082;
      const lon = longitude || 28.9784;
      const data = await fetchPrayerTimes({ latitude: lat, longitude: lon }, undefined, language);
      
      setLocationName(data.city);
      setPrayerData(data);
      lastDateRef.current = new Date().toDateString();

      const notificationContext = { city: data.city, latitude: lat, longitude: lon, date: data.date, hijriDate: data.hijriDate };

      if (notificationsEnabled && notificationContext) {
        schedulePrayerNotifications(
          data.prayers,
          () => {
            const soundOn = localStorage.getItem(SOUND_ALERT_PREFERENCE_KEY) === "true";
            if (soundOn) playAdhan();
          },
          notificationContext,
          {
            preAlertEnabled: preAlertEnabled === true,
            preAlertMinutes,
            onPreAlert: () => {
              const soundOn = localStorage.getItem(SOUND_ALERT_PREFERENCE_KEY) === "true";
              const preOn = localStorage.getItem(PRE_ALERT_PREFERENCE_KEY) === "true";
              if (soundOn && preOn) playPreAlert(alertSound);
            },
          }
        );
      }
    } catch (err) {
      setError(t.prayerTimesError);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, language, notificationsEnabled, preAlertEnabled, schedulePrayerNotifications, soundAlertEnabled, playAdhan, playPreAlert, t.prayerTimesError, preAlertMinutes, alertSound]);

  useEffect(() => {
    if (!geoLoading) loadPrayerTimes();
  }, [geoLoading, loadPrayerTimes]);

  useEffect(() => {
    const interval = window.setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toDateString();
      if (lastDateRef.current && lastDateRef.current !== currentDate) loadPrayerTimes();
    };
    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, [loadPrayerTimes]);

  // Auto dark mode: dark between Maghrib and Fajr
  useEffect(() => {
    if (!autoDarkMode || !prayerData) return;
    const now = Date.now();
    const maghrib = prayerData.prayers.find(p => p.nameEn === 'Maghrib');
    const fajr = prayerData.prayers.find(p => p.nameEn === 'Fajr');
    if (!maghrib || !fajr) return;
    const isNight = now >= maghrib.timestamp || now < fajr.timestamp;
    setDarkMode(isNight);
  }, [autoDarkMode, prayerData, nowTimestamp, setDarkMode]);

  // Show home interstitial once per day after first load
  useEffect(() => {
    if (!homeAdShownRef.current && prayerData && hydrated) {
      homeAdShownRef.current = true;
      setTimeout(() => tryShowAd('home'), 2000);
    }
  }, [prayerData, hydrated, tryShowAd]);

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      toast.success(t.usingCurrentLocation);
    } else {
      requestLocation();
    }
  };

  const getNotificationContext = useCallback(() => {
    const lat = latitude || 41.0082;
    const lon = longitude || 28.9784;
    return { city: prayerData?.city || locationName || t.currentLocation, latitude: lat, longitude: lon, date: prayerData?.date, hijriDate: prayerData?.hijriDate };
  }, [latitude, longitude, prayerData?.city, prayerData?.date, prayerData?.hijriDate, locationName, t.currentLocation]);

  const handleNotificationToggle = async (nextChecked?: boolean) => {
    const shouldEnable = typeof nextChecked === "boolean" ? nextChecked : !notificationsEnabled;

    if (!isSupported) {
      toast.error("Tarayıcınız bildirimleri desteklemiyor.");
      return;
    }

    if (!shouldEnable) {
      setNotificationsEnabled(false);
      setSoundAlertEnabled(false);
      setPreAlertEnabled(false);
      await Promise.all([
        persistToggle(NOTIFICATION_PREFERENCE_KEY, false),
        persistToggle(SOUND_ALERT_PREFERENCE_KEY, false),
        persistToggle(PRE_ALERT_PREFERENCE_KEY, false),
      ]);
      toast.info(t.notificationsOff);
    } else {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        setSoundAlertEnabled(true);
        setPreAlertEnabled(true);
        await Promise.all([
          persistToggle(NOTIFICATION_PREFERENCE_KEY, true),
          persistToggle(SOUND_ALERT_PREFERENCE_KEY, true),
          persistToggle(PRE_ALERT_PREFERENCE_KEY, true),
        ]);
        toast.success(t.notificationsOn);

        if (prayerData) {
          schedulePrayerNotifications(
            prayerData.prayers,
            () => {
              const soundOn = localStorage.getItem(SOUND_ALERT_PREFERENCE_KEY) === "true";
              if (soundOn) playAdhan();
            },
            getNotificationContext(),
            {
              preAlertEnabled: true,
              preAlertMinutes,
              onPreAlert: () => {
                const soundOn = localStorage.getItem(SOUND_ALERT_PREFERENCE_KEY) === "true";
                const preOn = localStorage.getItem(PRE_ALERT_PREFERENCE_KEY) === "true";
                if (soundOn && preOn) playPreAlert(alertSound);
              },
            }
          );
        }
      } else {
        setNotificationsEnabled(false);
        setSoundAlertEnabled(false);
        setPreAlertEnabled(false);
        await Promise.all([
          persistToggle(NOTIFICATION_PREFERENCE_KEY, false),
          persistToggle(SOUND_ALERT_PREFERENCE_KEY, false),
          persistToggle(PRE_ALERT_PREFERENCE_KEY, false),
        ]);
        toast.error("Bildirim izni reddedildi");
      }
    }
  };

  const handleSoundAlertToggle = async (nextChecked?: boolean) => {
    const next = typeof nextChecked === "boolean" ? nextChecked : !soundAlertEnabled;
    setSoundAlertEnabled(next);
    await persistToggle(SOUND_ALERT_PREFERENCE_KEY, next);
  };

  const handlePreAlertToggle = async (nextChecked?: boolean) => {
    const next = typeof nextChecked === "boolean" ? nextChecked : !preAlertEnabled;
    setPreAlertEnabled(next);
    await persistToggle(PRE_ALERT_PREFERENCE_KEY, next);

    // Re-schedule to add/remove pre-alert notifications
    if (notificationsEnabled && prayerData) {
      schedulePrayerNotifications(
        prayerData.prayers,
        () => {
          const soundOn = localStorage.getItem(SOUND_ALERT_PREFERENCE_KEY) === "true";
          if (soundOn) playAdhan();
        },
        getNotificationContext(),
        {
          preAlertEnabled: next,
          preAlertMinutes,
          onPreAlert: () => {
            const soundOn = localStorage.getItem(SOUND_ALERT_PREFERENCE_KEY) === "true";
            if (soundOn && next) playPreAlert(alertSound);
          },
        }
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 80 && currentView === 'main') setCurrentView('qibla');
    else if (distance < -80 && currentView === 'qibla') setCurrentView('main');
  };

  const handleCompassView = () => {
    tryShowAd('compass');
    setCurrentView('qibla');
  };

  const nextPrayer = prayerData ? getNextPrayer(prayerData.prayers, nowTimestamp) : null;

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

  if (currentView === 'religious' && prayerData) {
    return (
      <ReligiousDaysPage
        hijriDay={prayerData.hijriDay}
        hijriMonth={prayerData.hijriMonth}
        hijriYear={prayerData.hijriYear}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'qibla') {
    return (
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <QiblaCompass latitude={latitude} longitude={longitude} onBack={() => setCurrentView('main')} />
      </div>
    );
  }

  if (geoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loadingLocation}</p>
        </div>
      </div>
    );
  }

  if (loading && !prayerData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loadingPrayerTimes}</p>
        </div>
      </div>
    );
  }

  if (error && !prayerData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button onClick={loadPrayerTimes} className="text-primary underline">{t.retry}</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-md mx-auto px-4 sm:px-5 py-4 sm:py-6 pb-8 w-full">
        <Header
          locationName={prayerData?.city || locationName || t.currentLocation}
          date={prayerData?.date || ""}
          hijriDate={prayerData?.hijriDate || ""}
          darkMode={darkMode}
          onDarkModeToggle={toggleDarkMode}
          settingsButton={
            <SettingsDrawer
              notificationsEnabled={notificationsEnabled === true}
              onNotificationToggle={handleNotificationToggle}
              soundAlertEnabled={soundAlertEnabled === true}
              onSoundAlertToggle={handleSoundAlertToggle}
              preAlertEnabled={preAlertEnabled === true}
              onPreAlertToggle={handlePreAlertToggle}
              colorTheme={colorTheme}
              onColorThemeChange={setColorTheme}
              preAlertMinutes={preAlertMinutes}
              onPreAlertMinutesChange={setPreAlertMinutes}
              alertSound={alertSound}
              onAlertSoundChange={setAlertSound}
              onPreviewSound={(path) => previewSound(path, 3000)}
              autoDarkMode={autoDarkMode}
              onAutoDarkModeToggle={toggleAutoDarkMode}
            />
          }
        />

        <CountdownTimer nextPrayer={nextPrayer} />

        <div className="mt-6 mb-8">
          <PrayerTimesList prayers={prayerData?.prayers || []} nextPrayer={nextPrayer} />
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div 
            className="flex items-center gap-2 text-muted-foreground text-sm cursor-pointer hover:text-primary transition-colors"
            onClick={handleCompassView}
          >
            <span>{t.swipeForQibla}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div 
            className="flex items-center gap-2 text-muted-foreground text-sm cursor-pointer hover:text-primary transition-colors"
            onClick={() => setCurrentView('religious')}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.religiousDays}</span>
          </div>
        </div>

        <AdPlaceholder />

        <DailyVerse />

        <footer className="mt-8 text-center">
          <p className="text-muted-foreground/60 text-xs">{t.dataSource}</p>
          {soundAlertEnabled && notificationsEnabled && (
            <p className="text-primary/60 text-xs mt-1">🔔 {t.adhanActive}</p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
