export interface Verse {
  arabic: string;
  turkish: string;
  source: string;
}

export const dailyVerses: Verse[] = [
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    turkish: "Şüphesiz zorlukla beraber kolaylık vardır.",
    source: "İnşirah Suresi, 6"
  },
  {
    arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
    turkish: "Allah'ın rahmetinden ümit kesmeyiniz.",
    source: "Yusuf Suresi, 87"
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    turkish: "Beni anın ki, ben de sizi anayım.",
    source: "Bakara Suresi, 152"
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    turkish: "Kim Allah'a güvenirse, Allah ona yeter.",
    source: "Talak Suresi, 3"
  },
  {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
    turkish: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.",
    source: "Bakara Suresi, 201"
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    turkish: "De ki: Rabbim, ilmimi artır!",
    source: "Taha Suresi, 114"
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    turkish: "Şüphesiz Allah sabredenlerle beraberdir.",
    source: "Bakara Suresi, 153"
  },
  {
    arabic: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ",
    turkish: "Sabret! Senin sabrın ancak Allah'ın yardımıyladır.",
    source: "Nahl Suresi, 127"
  },
  {
    arabic: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    turkish: "Bana dua edin, size cevap vereyim.",
    source: "Mü'min Suresi, 60"
  },
  {
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    turkish: "Nerede olursanız olun, O sizinle beraberdir.",
    source: "Hadid Suresi, 4"
  },
  {
    arabic: "فَإِنَّ ذِكْرَى تَنفَعُ الْمُؤْمِنِينَ",
    turkish: "Çünkü hatırlatmak müminlere fayda verir.",
    source: "Zariyat Suresi, 55"
  },
  {
    arabic: "وَلَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
    turkish: "Üzülme, Allah bizimle beraberdir.",
    source: "Tevbe Suresi, 40"
  },
  {
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    turkish: "De ki: O, Allah'tır, bir tektir.",
    source: "İhlas Suresi, 1"
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    turkish: "Hamd, âlemlerin Rabbi Allah'a mahsustur.",
    source: "Fatiha Suresi, 2"
  },
];

export function getDailyVerse(): Verse {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % dailyVerses.length;
  return dailyVerses[index];
}
