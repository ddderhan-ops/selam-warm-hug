import { useState, useEffect } from "react";
import type { PrayerTime } from "@/lib/prayerTimes";
import { formatTimeRemaining } from "@/lib/prayerTimes";
import { useTranslation } from "@/contexts/LanguageContext";

interface CountdownTimerProps {
  nextPrayer: PrayerTime | null;
}

const prayerNameKeys: Record<string, 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'> = {
  Fajr: "fajr",
  Sunrise: "sunrise",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
};

export function CountdownTimer({ nextPrayer }: CountdownTimerProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState("00:00:00");

  useEffect(() => {
    if (!nextPrayer) return;

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(nextPrayer.timestamp));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer]);

  if (!nextPrayer) {
    return null;
  }

  return (
    <div className="text-center py-4 sm:py-8 animate-slide-up">
      <p className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">
        {t.nextPrayer}
      </p>
      <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-2 sm:mb-4">
        {nextPrayer ? (prayerNameKeys[nextPrayer.nameEn] ? t.prayerNames[prayerNameKeys[nextPrayer.nameEn]] : nextPrayer.name) : ''}
      </h2>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <p className="relative font-bold tabular-nums countdown-glow text-foreground" style={{ fontSize: 'clamp(2rem, 10vw, 4.5rem)' }}>
          {timeRemaining}
        </p>
      </div>
      <p className="text-muted-foreground text-sm mt-2 sm:mt-4">
        {nextPrayer.time} {t.atTime}
      </p>
    </div>
  );
}
