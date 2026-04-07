import type { Language } from "@/lib/i18n";

export interface Verse {
  arabic: string;
  text: string;
  source: string;
}

interface VerseEntry {
  arabic: string;
  translations: Record<Language, string>;
  sources: Record<Language, string>;
}

const dailyVerses: VerseEntry[] = [
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translations: {
      tr: "Şüphesiz zorlukla beraber kolaylık vardır.",
      en: "Surely, with hardship comes ease.",
      de: "Gewiss, mit der Erschwernis kommt Erleichterung.",
      fr: "À côté de la difficulté est certes une facilité.",
      ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      es: "Ciertamente, con la dificultad viene la facilidad.",
      pt: "Certamente, com a dificuldade vem a facilidade.",
    },
    sources: {
      tr: "İnşirah Suresi, 6",
      en: "Surah Ash-Sharh, 6",
      de: "Sure Asch-Scharh, 6",
      fr: "Sourate Ash-Sharh, 6",
      ar: "سورة الشرح، ٦",
      es: "Sura Ash-Sharh, 6",
      pt: "Sura Ash-Sharh, 6",
    },
  },
  {
    arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
    translations: {
      tr: "Allah'ın rahmetinden ümit kesmeyiniz.",
      en: "Do not lose hope in Allah's mercy.",
      de: "Verliert nicht die Hoffnung auf Allahs Barmherzigkeit.",
      fr: "Ne désespérez pas de la miséricorde d'Allah.",
      ar: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
      es: "No perdáis la esperanza en la misericordia de Allah.",
      pt: "Não percam a esperança na misericórdia de Allah.",
    },
    sources: {
      tr: "Yusuf Suresi, 87",
      en: "Surah Yusuf, 87",
      de: "Sure Yusuf, 87",
      fr: "Sourate Youssouf, 87",
      ar: "سورة يوسف، ٨٧",
      es: "Sura Yusuf, 87",
      pt: "Sura Yusuf, 87",
    },
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translations: {
      tr: "Beni anın ki, ben de sizi anayım.",
      en: "Remember Me, and I will remember you.",
      de: "Gedenkt Meiner, so gedenke Ich eurer.",
      fr: "Invoquez-Moi et Je vous invoquerai.",
      ar: "فَاذْكُرُونِي أَذْكُرْكُمْ",
      es: "Recordadme y Yo os recordaré.",
      pt: "Lembrai-vos de Mim e Eu Me lembrarei de vós.",
    },
    sources: {
      tr: "Bakara Suresi, 152",
      en: "Surah Al-Baqarah, 152",
      de: "Sure Al-Baqara, 152",
      fr: "Sourate Al-Baqara, 152",
      ar: "سورة البقرة، ١٥٢",
      es: "Sura Al-Baqarah, 152",
      pt: "Sura Al-Baqarah, 152",
    },
  },
  {
    arabic: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    translations: {
      tr: "Bana dua edin, size cevap vereyim.",
      en: "Call upon Me; I will respond to you.",
      de: "Ruft Mich an, so erhöre Ich euch.",
      fr: "Invoquez-Moi, Je vous répondrai.",
      ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    },
    sources: {
      tr: "Mü'min Suresi, 60",
      en: "Surah Ghafir, 60",
      de: "Sure Ghafir, 60",
      fr: "Sourate Ghafir, 60",
      ar: "سورة غافر، ٦٠",
    },
  },
  {
    arabic: "وَلَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
    translations: {
      tr: "Üzülme, Allah bizimle beraberdir.",
      en: "Do not grieve; Allah is with us.",
      de: "Sei nicht traurig, Allah ist mit uns.",
      fr: "Ne t'afflige pas, Allah est avec nous.",
      ar: "وَلَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
    },
    sources: {
      tr: "Tevbe Suresi, 40",
      en: "Surah At-Tawbah, 40",
      de: "Sure At-Tauba, 40",
      fr: "Sourate At-Tawbah, 40",
      ar: "سورة التوبة، ٤٠",
    },
  },
];

export function getDailyVerse(language: Language): Verse {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const index = dayOfYear % dailyVerses.length;
  const verse = dailyVerses[index];

  return {
    arabic: verse.arabic,
    text: verse.translations[language],
    source: verse.sources[language],
  };
}
