import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { religiousDays, getReligiousDayName } from '@/lib/religiousDays';

interface ReligiousDaysPageProps {
  hijriDay: number;
  hijriMonth: string;
  hijriYear: number;
  onBack: () => void;
}

const hijriMonthOrder = [
  'Muharram', 'Safar', "Rabi' al-awwal", "Rabi' al-thani",
  "Jumada al-awwal", "Jumada al-thani", 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

// Average Hijri month length ≈ 29.53 days
const AVG_HIJRI_MONTH_DAYS = 29.53;

function getHijriMonthIndex(monthName: string): number {
  const trMonths: Record<string, number> = {
    'Muharrem': 1, 'Safer': 2, 'Rebiülevvel': 3, 'Rebiülahir': 4,
    'Cemaziyelevvel': 5, 'Cemaziyelahir': 6, 'Recep': 7, 'Şaban': 8,
    'Ramazan': 9, 'Şevval': 10, 'Zilkade': 11, 'Zilhicce': 12,
  };
  if (trMonths[monthName]) return trMonths[monthName];
  const idx = hijriMonthOrder.indexOf(monthName);
  return idx >= 0 ? idx + 1 : 1;
}

function estimateDaysUntil(
  currentMonth: number, currentDay: number,
  targetMonth: number, targetDay: number
): number {
  let monthDiff = targetMonth - currentMonth;
  if (monthDiff < 0 || (monthDiff === 0 && targetDay < currentDay)) {
    monthDiff += 12; // next Hijri year
  }
  
  if (monthDiff === 0) return targetDay - currentDay;
  
  // Days remaining in current month + full months in between + target day
  const daysLeftInCurrentMonth = Math.round(AVG_HIJRI_MONTH_DAYS) - currentDay;
  const fullMonthsBetween = monthDiff - 1;
  return daysLeftInCurrentMonth + Math.round(fullMonthsBetween * AVG_HIJRI_MONTH_DAYS) + targetDay;
}

function formatCountdown(totalDays: number, t: any): string {
  if (totalDays <= 0) return t.today || 'Bugün';
  const days = totalDays;
  if (days === 1) return `1 ${t.dayUnit || 'gün'}`;
  return `${days} ${t.dayUnit || 'gün'}`;
}

export function ReligiousDaysPage({ hijriDay, hijriMonth, hijriYear, onBack }: ReligiousDaysPageProps) {
  const { t, language } = useTranslation();
  const currentHijriMonth = getHijriMonthIndex(hijriMonth);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Calculate days until each day and sort by nearest
  const daysWithCountdown = religiousDays.map((day) => {
    const daysUntil = estimateDaysUntil(currentHijriMonth, hijriDay, day.hijriMonth, day.hijriDay);
    const isToday = day.hijriMonth === currentHijriMonth && day.hijriDay === hijriDay;
    return { ...day, daysUntil, isToday };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  const localizedMonthName = (monthIdx: number) => {
    const key = hijriMonthOrder[monthIdx - 1];
    return t.hijriMonths?.[key] || key;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <div className="p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">{t.religiousDaysTitle}</h1>
      </div>

      <div className="px-4 pb-2">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t.hijriCalendar}</p>
            <p className="text-lg font-semibold">
              {hijriDay} {localizedMonthName(currentHijriMonth)} {hijriYear}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="space-y-3 mt-4">
          {daysWithCountdown.map((day) => (
            <div
              key={day.nameKey}
              className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                day.isToday ? 'border-primary bg-primary/5 shadow-md' : 'border-border'
              }`}
            >
              <div className="text-2xl w-10 text-center">{day.icon}</div>
              <div className="flex-1">
                <p className={`font-semibold ${day.isToday ? 'text-primary' : ''}`}>
                  {getReligiousDayName(day, language)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {day.hijriDay} {localizedMonthName(day.hijriMonth)}
                </p>
              </div>
              <div className="text-right flex items-center gap-1.5">
                {day.isToday ? (
                  <Star className="w-5 h-5 text-primary fill-primary" />
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCountdown(day.daysUntil, t)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
