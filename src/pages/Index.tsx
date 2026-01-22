import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PrayerTimesList } from "@/components/PrayerTimesList";
import { DailyVerse } from "@/components/DailyVerse";
import { useTheme } from "@/hooks/useTheme";
import { useNotification } from "@/hooks/useNotification";
import {
  fetchPrayerTimes,
  getNextPrayer,
  turkishCities,
  type City,
  type PrayerTimesData,
} from "@/lib/prayerTimes";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<City>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedCity");
      if (stored) {
        const parsed = JSON.parse(stored);
        return turkishCities.find(c => c.name === parsed.name) || turkishCities[0];
      }
    }
    return turkishCities[0];
  });
  
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { requestPermission, schedulePrayerNotifications, isSupported } = useNotification();

  const loadPrayerTimes = useCallback(async (city: City) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrayerTimes(city);
      setPrayerData(data);
      
      if (notificationsEnabled) {
        schedulePrayerNotifications(data.prayers);
      }
    } catch (err) {
      setError("Namaz vakitleri yüklenemedi. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [notificationsEnabled, schedulePrayerNotifications]);

  useEffect(() => {
    loadPrayerTimes(selectedCity);
  }, [selectedCity, loadPrayerTimes]);

  useEffect(() => {
    localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
  }, [selectedCity]);

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      alert("Tarayıcınız bildirimleri desteklemiyor.");
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      const granted = await requestPermission();
      setNotificationsEnabled(granted);
      
      if (granted && prayerData) {
        schedulePrayerNotifications(prayerData.prayers);
      }
    }
  };

  const nextPrayer = prayerData ? getNextPrayer(prayerData.prayers) : null;

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
          <button
            onClick={() => loadPrayerTimes(selectedCity)}
            className="text-primary underline"
          >
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
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          date={prayerData?.date || ""}
          hijriDate={prayerData?.hijriDate || ""}
          theme={theme}
          onThemeToggle={toggleTheme}
          notificationsEnabled={notificationsEnabled}
          onNotificationToggle={handleNotificationToggle}
        />

        <CountdownTimer nextPrayer={nextPrayer} />

        <div className="mt-6 mb-8">
          <PrayerTimesList
            prayers={prayerData?.prayers || []}
            nextPrayer={nextPrayer}
          />
        </div>

        <DailyVerse />

        <footer className="mt-8 text-center">
          <p className="text-muted-foreground/60 text-xs">
            Vakitler Aladhan API ile alınmaktadır
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
