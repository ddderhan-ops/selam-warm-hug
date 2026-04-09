import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { religiousDays, getReligiousDayName, parseGregorianDate } from '@/lib/religiousDays';

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

function daysUntil(targetDateStr: string): number {
  const target = parseGregorianDate(targetDateStr);
  if (!target) return 9999;
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = target.getTime() - todayUTC;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatCountdown(days: number, t: any): string {
  if (days <= 0) return t.today || 'Bugün';
  if (days === 1) return `1 ${t.dayUnit || 'gün'}`;
  return `${days} ${t.dayUnit || 'gün'}`;
}

function formatGregorianDate(dateStr: string, language: string): string {
  const d = parseGregorianDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString(language === 'tr' ? 'tr-TR' : language, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

export function ReligiousDaysPage({ hijriDay, hijriMonth, hijriYear, onBack }: ReligiousDaysPageProps) {
  const { t, language } = useTranslation();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Filter out past days and sort by nearest
  const upcomingDays = religiousDays
    .map((day) => ({ ...day, daysLeft: daysUntil(day.gregorianDate2026) }))
    .filter((day) => day.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const localizedMonthName = (monthIdx: number) => {
    const key = hijriMonthOrder[monthIdx - 1];
    return t.hijriMonths?.[key] || key;
  };

  const currentHijriMonthIdx = (() => {
    const trMonths: Record<string, number> = {
      'Muharrem': 1, 'Safer': 2, 'Rebiülevvel': 3, 'Rebiülahir': 4,
      'Cemaziyelevvel': 5, 'Cemaziyelahir': 6, 'Recep': 7, 'Şaban': 8,
      'Ramazan': 9, 'Şevval': 10, 'Zilkade': 11, 'Zilhicce': 12,
    };
    if (trMonths[hijriMonth]) return trMonths[hijriMonth];
    const idx = hijriMonthOrder.indexOf(hijriMonth);
    return idx >= 0 ? idx + 1 : 1;
  })();

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
              {hijriDay} {localizedMonthName(currentHijriMonthIdx)} {hijriYear}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8">
        {upcomingDays.length === 0 ? (
          <p className="text-center text-muted-foreground mt-8">{t.noUpcomingEvents}</p>
        ) : (
          <div className="space-y-3 mt-4">
            {upcomingDays.map((day) => {
              const isToday = day.daysLeft === 0;
              return (
                <div
                  key={day.nameKey}
                  className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                    isToday ? 'border-primary bg-primary/5 shadow-md' : 'border-border'
                  }`}
                >
                  <div className="text-2xl w-10 text-center">{day.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${isToday ? 'text-primary' : ''}`}>
                      {getReligiousDayName(day, language)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {day.hijriDay} {localizedMonthName(day.hijriMonth)} · {formatGregorianDate(day.gregorianDate2026, language)}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-1.5 shrink-0">
                    {isToday ? (
                      <Star className="w-5 h-5 text-primary fill-primary" />
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                          {formatCountdown(day.daysLeft, t)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
