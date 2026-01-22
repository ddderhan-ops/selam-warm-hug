import { PrayerTimeCard } from "./PrayerTimeCard";
import type { PrayerTime } from "@/lib/prayerTimes";

interface PrayerTimesListProps {
  prayers: PrayerTime[];
  nextPrayer: PrayerTime | null;
}

export function PrayerTimesList({ prayers, nextPrayer }: PrayerTimesListProps) {
  const now = Date.now();

  return (
    <div className="space-y-2">
      {prayers.map((prayer, index) => {
        const isActive = nextPrayer?.nameEn === prayer.nameEn;
        const isPassed = prayer.timestamp < now;

        return (
          <PrayerTimeCard
            key={prayer.nameEn}
            prayer={prayer}
            isActive={isActive}
            isPassed={isPassed && !isActive}
          />
        );
      })}
    </div>
  );
}
