import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PrayerTimesList } from "@/components/PrayerTimesList";
import { DailyVerse } from "@/components/DailyVerse";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { SplashScreen } from "@/components/SplashScreen";
import { QiblaCompass } from "@/components/QiblaCompass";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { useTheme } from "@/hooks/useTheme";
import { useNotification } from "@/hooks/useNotification";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAdhan } from "@/hooks/useAdhan";
import { useFCM } from "@/hooks/useFCM";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  fetchPrayerTimes,
  getNextPrayer,
  turkishCities,
  findNearestCity,
  type City,
  type PrayerTimesData,
} from "@/lib/prayerTimes";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type View = 'main' | 'qibla';

const Index = () => {
  const { t, language } = useTranslation();
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
  
  const [selectedCity, setSelectedCity] = useState<City | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedCity");
      if (stored) {
        const parsed = JSON.parse(stored);
        return turkishCities.find((c) => c.name === parsed.name) || null;
      }
    }
    return null;
  });

  const [useCurrentLocation, setUseCurrentLocation] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("useCurrentLocation") === "true";
    }
    return true;
  });

  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("soundAlertEnabled") === "true";
    }
    return false;
  });
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  const lastDateRef = useRef<string>("");

  const { theme, setTheme } = useTheme();

  const cycleTheme = useCallback(() => {
    const order: Array<"default" | "ocean" | "midnight"> = ["default", "ocean", "midnight"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }, [theme, setTheme]);

  const { requestPermission, schedulePrayerNotifications, isSupported } =
    useNotification();
  const {
    latitude,
    longitude,
    loading: geoLoading,
    permissionDenied,
    requestLocation,
  } = useGeolocation();
  const { playAdhan } = useAdhan();

  // FCM push notifications
  const fcmCity = prayerData?.city || selectedCity?.name || "İstanbul";
  const fcmLat = latitude || selectedCity?.latitude || 41.0082;
  const fcmLng = longitude || selectedCity?.longitude || 28.9784;

  const { updateLocation } = useFCM({
    city: fcmCity,
    latitude: fcmLat,
    longitude: fcmLng,
    enabled: notificationsEnabled,
  });
  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  }, []);

  const loadPrayerTimes = useCallback(async () => {
    setLoading(true);
    setError(null);

      try {
        let data: PrayerTimesData;
        let notificationContext: {
          city: string;
          latitude: number;
          longitude: number;
          date: string;
          hijriDate: string;
        } | null = null;

        if (useCurrentLocation && latitude && longitude) {
          const nearestCity = findNearestCity(latitude, longitude);
          data = await fetchPrayerTimes(
            { latitude, longitude },
            nearestCity?.name,
            language
          );
          notificationContext = {
            city: data.city,
            latitude,
            longitude,
            date: data.date,
            hijriDate: data.hijriDate,
          };
        } else if (selectedCity) {
          data = await fetchPrayerTimes(selectedCity, undefined, language);
          notificationContext = {
            city: data.city,
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude,
            date: data.date,
            hijriDate: data.hijriDate,
          };
        } else {
          const defaultCity = turkishCities[0];
          data = await fetchPrayerTimes(defaultCity, undefined, language);
          setSelectedCity(defaultCity);
          notificationContext = {
            city: data.city,
            latitude: defaultCity.latitude,
            longitude: defaultCity.longitude,
            date: data.date,
            hijriDate: data.hijriDate,
          };
        }

        setPrayerData(data);
        lastDateRef.current = new Date().toDateString();

        if (notificationsEnabled && notificationContext) {
          schedulePrayerNotifications(
            data.prayers,
            () => {
              if (soundAlertEnabled) {
                playAdhan();
              }
            },
            notificationContext
          );
        }
    } catch (err) {
      setError(t.prayerTimesError);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    useCurrentLocation,
    latitude,
    longitude,
    selectedCity,
    language,
    notificationsEnabled,
    schedulePrayerNotifications,
    soundAlertEnabled,
    playAdhan,
    t.prayerTimesError,
  ]);

  // Load prayer times when location or city changes
  useEffect(() => {
    if (!geoLoading) {
      loadPrayerTimes();
    }
  }, [geoLoading, loadPrayerTimes]);

  // Live clock tick so next prayer and countdown switch without refresh
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check for date change and refresh at midnight
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toDateString();
      if (lastDateRef.current && lastDateRef.current !== currentDate) {
        loadPrayerTimes();
      }
    };

    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, [loadPrayerTimes]);

  // Save preferences
  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
    }
    localStorage.setItem("useCurrentLocation", String(useCurrentLocation));
    localStorage.setItem("soundAlertEnabled", String(soundAlertEnabled));
  }, [selectedCity, useCurrentLocation, soundAlertEnabled]);

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    setUseCurrentLocation(false);
    // Update FCM token location
    if (notificationsEnabled) {
      updateLocation(city.name, city.latitude, city.longitude);
    }
  };

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      setUseCurrentLocation(true);
      toast.success(t.usingCurrentLocation);
    } else {
      requestLocation();
    }
  };

  const getNotificationContext = useCallback(() => {
    if (useCurrentLocation && latitude && longitude) {
      return {
        city: prayerData?.city || t.currentLocation,
        latitude,
        longitude,
        date: prayerData?.date,
        hijriDate: prayerData?.hijriDate,
      };
    }

    const fallbackCity = selectedCity || turkishCities[0];

    return {
      city: prayerData?.city || fallbackCity.name,
      latitude: fallbackCity.latitude,
      longitude: fallbackCity.longitude,
      date: prayerData?.date,
      hijriDate: prayerData?.hijriDate,
    };
  }, [
    useCurrentLocation,
    latitude,
    longitude,
    prayerData?.city,
    prayerData?.date,
    prayerData?.hijriDate,
    selectedCity,
    t.currentLocation,
  ]);

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      toast.error("Tarayıcınız bildirimleri desteklemiyor.");
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      setSoundAlertEnabled(false);
      toast.info(t.notificationsOff);
    } else {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        setSoundAlertEnabled(true);
        toast.success(t.notificationsOn);

        if (prayerData) {
          schedulePrayerNotifications(
            prayerData.prayers,
            () => {
              playAdhan();
            },
            getNotificationContext()
          );
        }
      } else {
        toast.error("Bildirim izni reddedildi");
      }
    }
  };

  const handleSoundAlertToggle = () => {
    setSoundAlertEnabled(!soundAlertEnabled);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;

    if (isLeftSwipe && currentView === 'main') {
      setCurrentView('qibla');
    } else if (isRightSwipe && currentView === 'qibla') {
      setCurrentView('main');
    }
  };

  const nextPrayer = prayerData ? getNextPrayer(prayerData.prayers, nowTimestamp) : null;

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show Qibla compass
  if (currentView === 'qibla') {
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <QiblaCompass
          latitude={latitude}
          longitude={longitude}
          onBack={() => setCurrentView('main')}
        />
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
          <button onClick={loadPrayerTimes} className="text-primary underline">
            {t.retry}
          </button>
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
          selectedCity={
            useCurrentLocation
              ? { name: prayerData?.city || t.currentLocation, latitude: 0, longitude: 0 }
              : selectedCity || turkishCities[0]
          }
          onCityChange={handleCityChange}
          date={prayerData?.date || ""}
          hijriDate={prayerData?.hijriDate || ""}
          theme={theme}
          onThemeCycle={cycleTheme}
          notificationsEnabled={notificationsEnabled}
          onNotificationToggle={handleNotificationToggle}
          useCurrentLocation={useCurrentLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
          hasLocationPermission={!permissionDenied && latitude !== null}
          settingsButton={
            <SettingsDrawer
              notificationsEnabled={notificationsEnabled}
              onNotificationToggle={handleNotificationToggle}
              soundAlertEnabled={soundAlertEnabled}
              onSoundAlertToggle={handleSoundAlertToggle}
              theme={theme}
              onThemeChange={setTheme}
            />
          }
        />

        <CountdownTimer nextPrayer={nextPrayer} />

        <div className="mt-6 mb-8">
          <PrayerTimesList
            prayers={prayerData?.prayers || []}
            nextPrayer={nextPrayer}
          />
        </div>

        {/* Swipe hint */}
        <div 
          className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4 cursor-pointer hover:text-primary transition-colors"
          onClick={() => setCurrentView('qibla')}
        >
          <span>{t.swipeForQibla}</span>
          <ChevronRight className="w-4 h-4" />
        </div>

        <AdPlaceholder />

        <DailyVerse />

        <footer className="mt-8 text-center">
          <p className="text-muted-foreground/60 text-xs">
            {t.dataSource}
          </p>
          {soundAlertEnabled && notificationsEnabled && (
            <p className="text-primary/60 text-xs mt-1">
              🔔 {t.adhanActive}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
