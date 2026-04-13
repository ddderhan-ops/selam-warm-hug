import {
  getLatestPrayerTimesCache,
  getPrayerTimesCache,
  savePrayerTimesCache,
  toDateKey,
} from "@/lib/prayerCache";

export interface PrayerTime {
  name: string;
  nameEn: string;
  time: string;
  timestamp: number;
}

export interface PrayerTimesData {
  date: string;
  hijriDate: string;
  hijriDay: number;
  hijriMonth: string;
  hijriYear: number;
  city: string;
  prayers: PrayerTime[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const prayerNamesTr: Record<string, string> = {
  Fajr: "İmsak",
  Sunrise: "Güneş",
  Dhuhr: "Öğle",
  Asr: "İkindi",
  Maghrib: "Akşam",
  Isha: "Yatsı",
};

const hijriMonthsTr: Record<string, string> = {
  Muharram: "Muharrem",
  Safar: "Safer",
  "Rabi' al-awwal": "Rebiülevvel",
  "Rabi' al-thani": "Rebiülahir",
  "Jumada al-awwal": "Cemaziyelevvel",
  "Jumada al-thani": "Cemaziyelahir",
  Rajab: "Recep",
  "Sha'ban": "Şaban",
  Ramadan: "Ramazan",
  Shawwal: "Şevval",
  "Dhu al-Qi'dah": "Zilkade",
  "Dhu al-Hijjah": "Zilhicce",
};

const languageToLocale: Record<string, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  ar: 'ar-SA',
  es: 'es-ES',
  pt: 'pt-BR',
};

/**
 * Reverse geocode coordinates to a human-readable location name.
 * Uses OpenStreetMap Nominatim (free, no API key).
 */
export async function reverseGeocode(lat: number, lon: number, lang = 'tr'): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=${lang}`,
      { headers: { 'User-Agent': 'NurEzanVakti/1.0' } }
    );
    if (!response.ok) throw new Error('Geocode failed');
    const data = await response.json();
    const addr = data.address;
    
    // Try to get the most meaningful location name
    const city = addr.city || addr.town || addr.village || addr.county || addr.state || '';
    const country = addr.country || '';
    const district = addr.suburb || addr.district || addr.neighbourhood || '';
    
    if (city && country) {
      return district ? `${city}, ${district}` : `${city}, ${country}`;
    }
    return data.display_name?.split(',').slice(0, 2).join(',').trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

export async function fetchPrayerTimes(
  coordinates: Coordinates,
  cityName?: string,
  language?: string
): Promise<PrayerTimesData> {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const dateKey = toDateKey(today);
  const { latitude, longitude } = coordinates;

  // Resolve city name via reverse geocoding if not provided
  const resolvedCity = cityName || await reverseGeocode(latitude, longitude, language || 'tr');

  try {
    // Method 13 = Turkey/Diyanet (Fajr: 18°, Isha: 17°)
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=13`
    );

    if (!response.ok) {
      throw new Error("Namaz vakitleri alınamadı");
    }

    const data = await response.json();
    const timings = data.data.timings;
    const hijri = data.data.date.hijri;

    const prayerKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

    const prayers: PrayerTime[] = prayerKeys.map((key) => {
      const timeStr = String(timings[key]).split(" ")[0];
      const [hours, minutes] = timeStr.split(":").map(Number);
      const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();

      return {
        name: prayerNamesTr[key],
        nameEn: key,
        time: timeStr,
        timestamp,
      };
    });

    const locale = languageToLocale[language || 'tr'] || 'tr-TR';
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const hijriMonthTr = hijriMonthsTr[hijri.month.en] || hijri.month.en;

    const prayerData: PrayerTimesData = {
      date: today.toLocaleDateString(locale, options),
      hijriDate: `${hijri.day} ${hijriMonthTr} ${hijri.year}`,
      hijriDay: Number.parseInt(hijri.day, 10),
      hijriMonth: hijriMonthTr,
      hijriYear: Number.parseInt(hijri.year, 10),
      city: resolvedCity,
      prayers,
    };

    void savePrayerTimesCache({
      dateKey,
      latitude,
      longitude,
      data: prayerData,
    });

    return prayerData;
  } catch (error) {
    const cachedData =
      (await getPrayerTimesCache({
        dateKey,
        latitude,
        longitude,
      })) ||
      (await getLatestPrayerTimesCache({
        latitude,
        longitude,
      }));

    if (cachedData) {
      return cachedData;
    }

    throw error instanceof Error ? error : new Error("Namaz vakitleri alınamadı");
  }
}

export function getNextPrayer(
  prayers: PrayerTime[],
  now: number = Date.now()
): PrayerTime | null {
  if (!prayers.length) return null;

  const orderedPrayers = [...prayers].sort((a, b) => a.timestamp - b.timestamp);
  const upcomingPrayer = orderedPrayers.find((prayer) => prayer.timestamp > now);

  if (upcomingPrayer) {
    return upcomingPrayer;
  }

  const tomorrowFajr = orderedPrayers[0];

  return {
    ...tomorrowFajr,
    timestamp: tomorrowFajr.timestamp + 24 * 60 * 60 * 1000,
  };
}

export function formatTimeRemaining(targetTime: number): string {
  const diff = Math.max(targetTime - Date.now(), 0);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
