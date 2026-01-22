import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PrayerTimesList } from "@/components/PrayerTimesList";
import { DailyVerse } from "@/components/DailyVerse";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { LocationPermissionCard } from "@/components/LocationPermissionCard";
import { useTheme } from "@/hooks/useTheme";
import { useNotification } from "@/hooks/useNotification";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAdhan } from "@/hooks/useAdhan";
import {
  fetchPrayerTimes,
  getNextPrayer,
  turkishCities,
  findNearestCity,
  type City,
  type PrayerTimesData,
} from "@/lib/prayerTimes";
import { Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
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
  const [adhanEnabled, setAdhanEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adhanEnabled") === "true";
    }
    return false;
  });

  const lastDateRef = useRef<string>("");

  const { theme, toggleTheme } = useTheme();
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

  const loadPrayerTimes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data: PrayerTimesData;

      if (useCurrentLocation && latitude && longitude) {
        // Use current location
        const nearestCity = findNearestCity(latitude, longitude);
        data = await fetchPrayerTimes(
          { latitude, longitude },
          nearestCity?.name
        );
      } else if (selectedCity) {
        // Use selected city
        data = await fetchPrayerTimes(selectedCity);
      } else {
        // Fallback to Istanbul
        const defaultCity = turkishCities[0];
        data = await fetchPrayerTimes(defaultCity);
        setSelectedCity(defaultCity);
      }

      setPrayerData(data);
      lastDateRef.current = new Date().toDateString();

      // Schedule notifications with adhan callback
      if (notificationsEnabled) {
        schedulePrayerNotifications(data.prayers, (prayer) => {
          if (adhanEnabled) {
            playAdhan();
          }
        });
      }
    } catch (err) {
      setError("Namaz vakitleri yüklenemedi. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    useCurrentLocation,
    latitude,
    longitude,
    selectedCity,
    notificationsEnabled,
    schedulePrayerNotifications,
    adhanEnabled,
    playAdhan,
  ]);

  // Load prayer times when location or city changes
  useEffect(() => {
    if (!geoLoading) {
      loadPrayerTimes();
    }
  }, [geoLoading, loadPrayerTimes]);

  // Check for date change and refresh at midnight
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toDateString();
      if (lastDateRef.current && lastDateRef.current !== currentDate) {
        loadPrayerTimes();
      }
    };

    const interval = setInterval(checkDateChange, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [loadPrayerTimes]);

  // Save preferences
  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
    }
    localStorage.setItem("useCurrentLocation", String(useCurrentLocation));
    localStorage.setItem("adhanEnabled", String(adhanEnabled));
  }, [selectedCity, useCurrentLocation, adhanEnabled]);

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    setUseCurrentLocation(false);
  };

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      setUseCurrentLocation(true);
      toast.success("Mevcut konum kullanılıyor");
    } else {
      requestLocation();
    }
  };

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      toast.error("Tarayıcınız bildirimleri desteklemiyor.");
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      setAdhanEnabled(false);
      toast.info("Bildirimler kapatıldı");
    } else {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        setAdhanEnabled(true);
        toast.success("Bildirimler ve ezan sesi aktif");

        if (prayerData) {
          schedulePrayerNotifications(prayerData.prayers, (prayer) => {
            playAdhan();
          });
        }
      } else {
        toast.error("Bildirim izni reddedildi");
      }
    }
  };

  const nextPrayer = prayerData ? getNextPrayer(prayerData.prayers) : null;

  // Show location permission card if needed
  if (geoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Konum alınıyor...</p>
        </div>
      </div>
    );
  }

  if (loading && !prayerData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Namaz vakitleri yükleniyor...</p>
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
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 py-6 pb-8">
        <Header
          selectedCity={
            useCurrentLocation
              ? { name: prayerData?.city || "Mevcut Konum", latitude: 0, longitude: 0 }
              : selectedCity || turkishCities[0]
          }
          onCityChange={handleCityChange}
          date={prayerData?.date || ""}
          hijriDate={prayerData?.hijriDate || ""}
          theme={theme}
          onThemeToggle={toggleTheme}
          notificationsEnabled={notificationsEnabled}
          onNotificationToggle={handleNotificationToggle}
          useCurrentLocation={useCurrentLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
          hasLocationPermission={!permissionDenied && latitude !== null}
        />

        <CountdownTimer nextPrayer={nextPrayer} />

        <div className="mt-6 mb-8">
          <PrayerTimesList
            prayers={prayerData?.prayers || []}
            nextPrayer={nextPrayer}
          />
        </div>

        <AdPlaceholder />

        <DailyVerse />

        <footer className="mt-8 text-center">
          <p className="text-muted-foreground/60 text-xs">
            Vakitler Aladhan API ile alınmaktadır
          </p>
          {adhanEnabled && notificationsEnabled && (
            <p className="text-primary/60 text-xs mt-1">
              🔔 Ezan sesi aktif
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
