import { ArrowLeft, Calendar, Star } from 'lucide-react';
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

function getHijriMonthIndex(monthName: string): number {
  // Try matching Turkish/translated month names to their index
  const trMonths: Record<string, number> = {
    'Muharrem': 1, 'Safer': 2, 'Rebiülevvel': 3, 'Rebiülahir': 4,
    'Cemaziyelevvel': 5, 'Cemaziyelahir': 6, 'Recep': 7, 'Şaban': 8,
    'Ramazan': 9, 'Şevval': 10, 'Zilkade': 11, 'Zilhicce': 12,
  };
  if (trMonths[monthName]) return trMonths[monthName];
  const idx = hijriMonthOrder.indexOf(monthName);
  return idx >= 0 ? idx + 1 : 1;
}

export function ReligiousDaysPage({ hijriDay, hijriMonth, hijriYear, onBack }: ReligiousDaysPageProps) {
  const { t, language } = useTranslation();
  const currentHijriMonth = getHijriMonthIndex(hijriMonth);

  // Sort: upcoming first, then past
  const sortedDays = [...religiousDays].sort((a, b) => {
    const aUpcoming = a.hijriMonth > currentHijriMonth || (a.hijriMonth === currentHijriMonth && a.hijriDay >= hijriDay);
    const bUpcoming = b.hijriMonth > currentHijriMonth || (b.hijriMonth === currentHijriMonth && b.hijriDay >= hijriDay);
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    return (a.hijriMonth - b.hijriMonth) || (a.hijriDay - b.hijriDay);
  });

  const localizedMonthName = (monthIdx: number) => {
    const key = hijriMonthOrder[monthIdx - 1];
    return t.hijriMonths[key] || key;
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
          {sortedDays.map((day) => {
            const isUpcoming = day.hijriMonth > currentHijriMonth || 
              (day.hijriMonth === currentHijriMonth && day.hijriDay >= hijriDay);
            const isToday = day.hijriMonth === currentHijriMonth && day.hijriDay === hijriDay;

            return (
              <div
                key={day.nameKey}
                className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                  isToday ? 'border-primary bg-primary/5 shadow-md' : 
                  isUpcoming ? 'border-border' : 'border-border/50 opacity-60'
                }`}
              >
                <div className="text-2xl w-10 text-center">{day.icon}</div>
                <div className="flex-1">
                  <p className={`font-semibold ${isToday ? 'text-primary' : ''}`}>
                    {getReligiousDayName(day, language)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {day.hijriDay} {localizedMonthName(day.hijriMonth)}
                  </p>
                </div>
                {isToday && (
                  <Star className="w-5 h-5 text-primary fill-primary" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
