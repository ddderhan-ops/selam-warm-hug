/**
 * Islamic religious days with both Hijri and fixed Gregorian dates for 2026.
 * Gregorian dates sourced from Diyanet calendar.
 */
export interface ReligiousDay {
  hijriMonth: number;
  hijriDay: number;
  nameKey: string;
  names: Record<string, string>;
  icon: string;
  /** Fixed Gregorian date for 2026 (ISO format YYYY-MM-DD) */
  gregorianDate2026: string;
}

export const religiousDays: ReligiousDay[] = [
  {
    hijriMonth: 12, hijriDay: 9, nameKey: 'arafat',
    names: { tr: 'Kurban Bayramı Arifesi', en: 'Day of Arafat', de: 'Tag von Arafat', fr: "Jour d'Arafat", ar: 'يوم عرفة', es: 'Día de Arafat', pt: 'Dia de Arafat' },
    icon: '🕋',
    gregorianDate2026: '2026-05-26',
  },
  {
    hijriMonth: 12, hijriDay: 10, nameKey: 'eidAdha',
    names: { tr: 'Kurban Bayramı', en: 'Eid al-Adha', de: 'Eid al-Adha', fr: "Aïd al-Adha", ar: 'عيد الأضحى', es: 'Eid al-Adha', pt: 'Eid al-Adha' },
    icon: '🐑',
    gregorianDate2026: '2026-05-27',
  },
  {
    hijriMonth: 1, hijriDay: 1, nameKey: 'hijriNewYear',
    names: { tr: 'Hicri Yılbaşı', en: 'Islamic New Year', de: 'Islamisches Neujahr', fr: 'Nouvel an islamique', ar: 'رأس السنة الهجرية', es: 'Año Nuevo Islámico', pt: 'Ano Novo Islâmico' },
    icon: '🌙',
    gregorianDate2026: '2026-07-16',
  },
  {
    hijriMonth: 1, hijriDay: 10, nameKey: 'ashura',
    names: { tr: 'Aşure Günü', en: 'Day of Ashura', de: 'Aschura-Tag', fr: "Jour d'Achoura", ar: 'يوم عاشوراء', es: 'Día de Ashura', pt: 'Dia de Ashura' },
    icon: '🕌',
    gregorianDate2026: '2026-07-25',
  },
  {
    hijriMonth: 3, hijriDay: 12, nameKey: 'mawlid',
    names: { tr: 'Mevlid Kandili', en: 'Mawlid an-Nabi', de: 'Mawlid an-Nabi', fr: 'Mawlid an-Nabi', ar: 'المولد النبوي', es: 'Mawlid an-Nabi', pt: 'Mawlid an-Nabi' },
    icon: '🌟',
    gregorianDate2026: '2026-09-22',
  },
];

export function getReligiousDayName(day: ReligiousDay, lang: string): string {
  return day.names[lang] || day.names.en;
}

/** Parse YYYY-MM-DD safely into a Date at UTC midnight */
export function parseGregorianDate(dateStr: string): Date | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCDate() !== +m[3] || d.getUTCMonth() !== +m[2] - 1) return null;
  return d;
}
