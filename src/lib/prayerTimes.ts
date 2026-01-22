export interface PrayerTime {
  name: string;
  nameEn: string;
  time: string;
  timestamp: number;
}

export interface PrayerTimesData {
  date: string;
  hijriDate: string;
  city: string;
  prayers: PrayerTime[];
}

export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export const turkishCities: City[] = [
  { name: "İstanbul", latitude: 41.0082, longitude: 28.9784 },
  { name: "Ankara", latitude: 39.9334, longitude: 32.8597 },
  { name: "İzmir", latitude: 38.4192, longitude: 27.1287 },
  { name: "Bursa", latitude: 40.1885, longitude: 29.0610 },
  { name: "Antalya", latitude: 36.8969, longitude: 30.7133 },
  { name: "Adana", latitude: 36.9914, longitude: 35.3308 },
  { name: "Konya", latitude: 37.8746, longitude: 32.4932 },
  { name: "Gaziantep", latitude: 37.0662, longitude: 37.3833 },
  { name: "Kayseri", latitude: 38.7312, longitude: 35.4787 },
  { name: "Trabzon", latitude: 41.0027, longitude: 39.7168 },
  { name: "Diyarbakır", latitude: 37.9144, longitude: 40.2306 },
  { name: "Erzurum", latitude: 39.9043, longitude: 41.2679 },
  { name: "Samsun", latitude: 41.2867, longitude: 36.33 },
  { name: "Eskişehir", latitude: 39.7767, longitude: 30.5206 },
  { name: "Mersin", latitude: 36.8121, longitude: 34.6415 },
];

const prayerNamesTr: Record<string, string> = {
  Fajr: "İmsak",
  Sunrise: "Güneş",
  Dhuhr: "Öğle",
  Asr: "İkindi",
  Maghrib: "Akşam",
  Isha: "Yatsı",
};

export async function fetchPrayerTimes(city: City): Promise<PrayerTimesData> {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${city.latitude}&longitude=${city.longitude}&method=13`
  );

  if (!response.ok) {
    throw new Error("Namaz vakitleri alınamadı");
  }

  const data = await response.json();
  const timings = data.data.timings;
  const hijri = data.data.date.hijri;

  const prayerKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  
  const prayers: PrayerTime[] = prayerKeys.map((key) => {
    const timeStr = timings[key];
    const [hours, minutes] = timeStr.split(":").map(Number);
    const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();
    
    return {
      name: prayerNamesTr[key],
      nameEn: key,
      time: timeStr,
      timestamp,
    };
  });

  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return {
    date: today.toLocaleDateString("tr-TR", options),
    hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year}`,
    city: city.name,
    prayers,
  };
}

export function getNextPrayer(prayers: PrayerTime[]): PrayerTime | null {
  const now = Date.now();
  
  for (const prayer of prayers) {
    if (prayer.timestamp > now) {
      return prayer;
    }
  }
  
  // If all prayers have passed, return the first prayer (for tomorrow)
  return prayers[0];
}

export function formatTimeRemaining(targetTime: number): string {
  const now = Date.now();
  let diff = targetTime - now;
  
  if (diff < 0) {
    // Next day's prayer
    diff += 24 * 60 * 60 * 1000;
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
