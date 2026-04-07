/**
 * Islamic religious days based on Hijri calendar.
 * Hijri month (1-12), day, and localized names.
 */
export interface ReligiousDay {
  hijriMonth: number;
  hijriDay: number;
  nameKey: string;
  names: Record<string, string>;
  icon: string;
}

export const religiousDays: ReligiousDay[] = [
  {
    hijriMonth: 1, hijriDay: 1, nameKey: 'hijriNewYear',
    names: { tr: 'Hicri Yılbaşı', en: 'Islamic New Year', de: 'Islamisches Neujahr', fr: 'Nouvel an islamique', ar: 'رأس السنة الهجرية', es: 'Año Nuevo Islámico', pt: 'Ano Novo Islâmico' },
    icon: '🌙',
  },
  {
    hijriMonth: 1, hijriDay: 10, nameKey: 'ashura',
    names: { tr: 'Aşure Günü', en: 'Day of Ashura', de: 'Aschura-Tag', fr: "Jour d'Achoura", ar: 'يوم عاشوراء', es: 'Día de Ashura', pt: 'Dia de Ashura' },
    icon: '🕌',
  },
  {
    hijriMonth: 3, hijriDay: 12, nameKey: 'mawlid',
    names: { tr: 'Mevlid Kandili', en: 'Mawlid an-Nabi', de: 'Mawlid an-Nabi', fr: 'Mawlid an-Nabi', ar: 'المولد النبوي', es: 'Mawlid an-Nabi', pt: 'Mawlid an-Nabi' },
    icon: '🌟',
  },
  {
    hijriMonth: 7, hijriDay: 27, nameKey: 'miraj',
    names: { tr: 'Miraç Kandili', en: "Isra and Mi'raj", de: "Isra und Mi'radsch", fr: "Isra et Mi'raj", ar: 'الإسراء والمعراج', es: "Isra y Mi'raj", pt: "Isra e Mi'raj" },
    icon: '✨',
  },
  {
    hijriMonth: 8, hijriDay: 15, nameKey: 'baraah',
    names: { tr: 'Berat Kandili', en: 'Mid-Shaban (Barat Night)', de: 'Nacht der Vergebung', fr: 'Nuit du Pardon', ar: 'ليلة البراءة', es: 'Noche de Barat', pt: 'Noite de Barat' },
    icon: '🤲',
  },
  {
    hijriMonth: 9, hijriDay: 1, nameKey: 'ramadanStart',
    names: { tr: 'Ramazan Başlangıcı', en: 'Start of Ramadan', de: 'Beginn des Ramadan', fr: 'Début du Ramadan', ar: 'بداية رمضان', es: 'Inicio del Ramadán', pt: 'Início do Ramadã' },
    icon: '🌙',
  },
  {
    hijriMonth: 9, hijriDay: 27, nameKey: 'lailatulQadr',
    names: { tr: 'Kadir Gecesi', en: 'Laylat al-Qadr', de: 'Nacht der Bestimmung', fr: 'Nuit du Destin', ar: 'ليلة القدر', es: 'Laylat al-Qadr', pt: 'Laylat al-Qadr' },
    icon: '⭐',
  },
  {
    hijriMonth: 10, hijriDay: 1, nameKey: 'eidFitr',
    names: { tr: 'Ramazan Bayramı', en: 'Eid al-Fitr', de: 'Eid al-Fitr', fr: "Aïd al-Fitr", ar: 'عيد الفطر', es: 'Eid al-Fitr', pt: 'Eid al-Fitr' },
    icon: '🎉',
  },
  {
    hijriMonth: 12, hijriDay: 9, nameKey: 'arafat',
    names: { tr: 'Arefe Günü', en: 'Day of Arafat', de: 'Tag von Arafat', fr: "Jour d'Arafat", ar: 'يوم عرفة', es: 'Día de Arafat', pt: 'Dia de Arafat' },
    icon: '🕋',
  },
  {
    hijriMonth: 12, hijriDay: 10, nameKey: 'eidAdha',
    names: { tr: 'Kurban Bayramı', en: 'Eid al-Adha', de: 'Eid al-Adha', fr: "Aïd al-Adha", ar: 'عيد الأضحى', es: 'Eid al-Adha', pt: 'Eid al-Adha' },
    icon: '🐑',
  },
];

export function getReligiousDayName(day: ReligiousDay, lang: string): string {
  return day.names[lang] || day.names.en;
}
