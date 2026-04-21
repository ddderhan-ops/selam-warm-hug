import type { PrayerTime } from "@/lib/prayerTimes";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface PrayerTimeCardProps {
  prayer: PrayerTime;
  isActive: boolean;
  isPassed: boolean;
}

const prayerNameKeys: Record<string, 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'> = {
  Fajr: "fajr",
  Sunrise: "sunrise",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
};

export function PrayerTimeCard({ prayer, isActive, isPassed }: PrayerTimeCardProps) {
  const { t } = useTranslation();
  
  // Get translated prayer name
  const prayerKey = prayerNameKeys[prayer.nameEn];
  const translatedName = prayerKey ? t.prayerNames[prayerKey] : prayer.name;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 animate-fade-in",
        isActive && "prayer-card-active scale-[1.02]",
        !isActive && "prayer-card-inactive",
        isPassed && !isActive && "opacity-50"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isActive ? "bg-primary-foreground animate-pulse-glow" : isPassed ? "bg-muted-foreground/40" : "bg-primary"
          )}
        />
        <span
          className={cn(
            "font-medium text-base",
            isActive && "text-primary-foreground"
          )}
        >
          {translatedName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock
          className={cn(
            "w-4 h-4",
            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "font-semibold text-lg tabular-nums",
            isActive && "text-primary-foreground"
          )}
        >
          {prayer.time}
        </span>
      </div>
    </div>
  );
}
