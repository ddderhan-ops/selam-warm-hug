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
      es: "Invocadme y Yo os responderé.",
      pt: "Invocai-Me e Eu vos responderei.",
    },
    sources: {
      tr: "Mü'min Suresi, 60",
      en: "Surah Ghafir, 60",
      de: "Sure Ghafir, 60",
      fr: "Sourate Ghafir, 60",
      ar: "سورة غافر، ٦٠",
      es: "Sura Ghafir, 60",
      pt: "Sura Ghafir, 60",
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
      es: "No te aflijas; Allah está con nosotros.",
      pt: "Não te aflijas; Allah está conosco.",
    },
    sources: {
      tr: "Tevbe Suresi, 40",
      en: "Surah At-Tawbah, 40",
      de: "Sure At-Tauba, 40",
      fr: "Sourate At-Tawbah, 40",
      ar: "سورة التوبة، ٤٠",
      es: "Sura At-Tawbah, 40",
      pt: "Sura At-Tawbah, 40",
    },
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    translations: {
      tr: "Allah bize yeter, O ne güzel vekildir.",
      en: "Allah is sufficient for us, and He is the best Disposer of affairs.",
      de: "Uns genügt Allah, und welch vorzüglicher Sachwalter ist Er!",
      fr: "Allah nous suffit; Il est notre meilleur garant.",
      ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      es: "Allah nos basta. ¡Qué excelente protector!",
      pt: "Allah nos basta, e Ele é o melhor Protetor.",
    },
    sources: {
      tr: "Âl-i İmrân, 173", en: "Surah Al-Imran, 173", de: "Sure Al-Imran, 173",
      fr: "Sourate Al-Imran, 173", ar: "سورة آل عمران، ١٧٣",
      es: "Sura Al-Imran, 173", pt: "Sura Al-Imran, 173",
    },
  },
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    translations: {
      tr: "Kim Allah'a karşı gelmekten sakınırsa, Allah ona bir çıkış yolu açar.",
      en: "Whoever fears Allah, He will make a way out for him.",
      de: "Wer Allah fürchtet, dem schafft Er einen Ausweg.",
      fr: "Quiconque craint Allah, Il lui donnera une issue favorable.",
      ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
      es: "Quien teme a Allah, Él le dará una salida.",
      pt: "Quem teme a Allah, Ele lhe dará uma saída.",
    },
    sources: {
      tr: "Talâk, 2", en: "Surah At-Talaq, 2", de: "Sure At-Talaq, 2",
      fr: "Sourate At-Talaq, 2", ar: "سورة الطلاق، ٢",
      es: "Sura At-Talaq, 2", pt: "Sura At-Talaq, 2",
    },
  },
  {
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translations: {
      tr: "Nerede olursanız olun, O sizinle beraberdir.",
      en: "He is with you wherever you are.",
      de: "Er ist mit euch, wo immer ihr auch seid.",
      fr: "Il est avec vous où que vous soyez.",
      ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
      es: "Él está con vosotros dondequiera que estéis.",
      pt: "Ele está convosco onde quer que estejais.",
    },
    sources: {
      tr: "Hadîd, 4", en: "Surah Al-Hadid, 4", de: "Sure Al-Hadid, 4",
      fr: "Sourate Al-Hadid, 4", ar: "سورة الحديد، ٤",
      es: "Sura Al-Hadid, 4", pt: "Sura Al-Hadid, 4",
    },
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translations: {
      tr: "Şüphesiz Allah sabredenlerle beraberdir.",
      en: "Indeed, Allah is with the patient.",
      de: "Gewiss, Allah ist mit den Standhaften.",
      fr: "Allah est avec les endurants.",
      ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
      es: "Allah está con los pacientes.",
      pt: "Allah está com os pacientes.",
    },
    sources: {
      tr: "Bakara, 153", en: "Surah Al-Baqarah, 153", de: "Sure Al-Baqara, 153",
      fr: "Sourate Al-Baqara, 153", ar: "سورة البقرة، ١٥٣",
      es: "Sura Al-Baqarah, 153", pt: "Sura Al-Baqarah, 153",
    },
  },
  {
    arabic: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
    translations: {
      tr: "Başarım ancak Allah'ın yardımı iledir.",
      en: "My success is only by Allah.",
      de: "Mein Gelingen ist nur durch Allah.",
      fr: "Ma réussite ne dépend que d'Allah.",
      ar: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
      es: "Mi éxito sólo proviene de Allah.",
      pt: "Meu sucesso só vem de Allah.",
    },
    sources: {
      tr: "Hûd, 88", en: "Surah Hud, 88", de: "Sure Hud, 88",
      fr: "Sourate Hud, 88", ar: "سورة هود، ٨٨",
      es: "Sura Hud, 88", pt: "Sura Hud, 88",
    },
  },
  {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
    translations: {
      tr: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.",
      en: "Our Lord, give us good in this world and good in the Hereafter.",
      de: "Unser Herr, gib uns im Diesseits Gutes und im Jenseits Gutes.",
      fr: "Seigneur! Accorde-nous le bien ici-bas et le bien dans l'au-delà.",
      ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
      es: "Señor nuestro, danos bien en esta vida y bien en la otra.",
      pt: "Senhor nosso, dá-nos o bem nesta vida e na outra.",
    },
    sources: {
      tr: "Bakara, 201", en: "Surah Al-Baqarah, 201", de: "Sure Al-Baqara, 201",
      fr: "Sourate Al-Baqara, 201", ar: "سورة البقرة، ٢٠١",
      es: "Sura Al-Baqarah, 201", pt: "Sura Al-Baqarah, 201",
    },
  },
  {
    arabic: "وَبَشِّرِ الصَّابِرِينَ",
    translations: {
      tr: "Sabredenleri müjdele.",
      en: "And give good tidings to the patient.",
      de: "Und verkünde den Standhaften frohe Botschaft.",
      fr: "Et fais la bonne annonce aux endurants.",
      ar: "وَبَشِّرِ الصَّابِرِينَ",
      es: "Y anuncia la buena nueva a los pacientes.",
      pt: "E dá boas-novas aos pacientes.",
    },
    sources: {
      tr: "Bakara, 155", en: "Surah Al-Baqarah, 155", de: "Sure Al-Baqara, 155",
      fr: "Sourate Al-Baqara, 155", ar: "سورة البقرة، ١٥٥",
      es: "Sura Al-Baqarah, 155", pt: "Sura Al-Baqarah, 155",
    },
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
    translations: {
      tr: "Şüphesiz Allah tövbe edenleri sever, temizlenenleri de sever.",
      en: "Indeed, Allah loves those who repent and those who purify themselves.",
      de: "Allah liebt die Reumütigen und die sich Reinigenden.",
      fr: "Allah aime ceux qui se repentent et ceux qui se purifient.",
      ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
      es: "Allah ama a los que se arrepienten y a los que se purifican.",
      pt: "Allah ama os que se arrependem e os que se purificam.",
    },
    sources: {
      tr: "Bakara, 222", en: "Surah Al-Baqarah, 222", de: "Sure Al-Baqara, 222",
      fr: "Sourate Al-Baqara, 222", ar: "سورة البقرة، ٢٢٢",
      es: "Sura Al-Baqarah, 222", pt: "Sura Al-Baqarah, 222",
    },
  },
  {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translations: {
      tr: "Allah hiç kimseye gücünün üstünde bir şey yüklemez.",
      en: "Allah does not burden a soul beyond its capacity.",
      de: "Allah erlegt keiner Seele mehr auf, als sie zu leisten vermag.",
      fr: "Allah n'impose à aucune âme une charge supérieure à sa capacité.",
      ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
      es: "Allah no impone a nadie una carga superior a la que puede soportar.",
      pt: "Allah não sobrecarrega ninguém além de suas forças.",
    },
    sources: {
      tr: "Bakara, 286", en: "Surah Al-Baqarah, 286", de: "Sure Al-Baqara, 286",
      fr: "Sourate Al-Baqara, 286", ar: "سورة البقرة، ٢٨٦",
      es: "Sura Al-Baqarah, 286", pt: "Sura Al-Baqarah, 286",
    },
  },
  {
    arabic: "وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا",
    translations: {
      tr: "Allah'a tevekkül et. Vekil olarak Allah yeter.",
      en: "Put your trust in Allah; sufficient is Allah as Disposer of affairs.",
      de: "Verlass dich auf Allah; Allah genügt als Sachwalter.",
      fr: "Place ta confiance en Allah; Allah suffit comme protecteur.",
      ar: "وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا",
      es: "Confía en Allah; Allah basta como protector.",
      pt: "Confia em Allah; Allah basta como protetor.",
    },
    sources: {
      tr: "Ahzâb, 3", en: "Surah Al-Ahzab, 3", de: "Sure Al-Ahzab, 3",
      fr: "Sourate Al-Ahzab, 3", ar: "سورة الأحزاب، ٣",
      es: "Sura Al-Ahzab, 3", pt: "Sura Al-Ahzab, 3",
    },
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translations: {
      tr: "De ki: Rabbim, ilmimi artır.",
      en: "Say: My Lord, increase me in knowledge.",
      de: "Sag: Mein Herr, lass mich an Wissen zunehmen.",
      fr: "Dis: Seigneur, accrois mes connaissances.",
      ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
      es: "Di: Señor, auméntame en conocimiento.",
      pt: "Dize: Senhor, aumenta meu conhecimento.",
    },
    sources: {
      tr: "Tâ-Hâ, 114", en: "Surah Ta-Ha, 114", de: "Sure Ta-Ha, 114",
      fr: "Sourate Ta-Ha, 114", ar: "سورة طه، ١١٤",
      es: "Sura Ta-Ha, 114", pt: "Sura Ta-Ha, 114",
    },
  },
  {
    arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    translations: {
      tr: "Şüphesiz namaz hayasızlıktan ve kötülükten alıkoyar.",
      en: "Indeed, prayer prohibits immorality and wrongdoing.",
      de: "Das Gebet hält von Schändlichem und Verwerflichem ab.",
      fr: "La prière préserve de la turpitude et du blâmable.",
      ar: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
      es: "La oración preserva de la indecencia y de lo reprobable.",
      pt: "A oração afasta da indecência e do reprovável.",
    },
    sources: {
      tr: "Ankebût, 45", en: "Surah Al-Ankabut, 45", de: "Sure Al-Ankabut, 45",
      fr: "Sourate Al-Ankabut, 45", ar: "سورة العنكبوت، ٤٥",
      es: "Sura Al-Ankabut, 45", pt: "Sura Al-Ankabut, 45",
    },
  },
  {
    arabic: "وَاذْكُرْ رَبَّكَ إِذَا نَسِيتَ",
    translations: {
      tr: "Unuttuğun zaman Rabbini an.",
      en: "And remember your Lord when you forget.",
      de: "Und gedenke deines Herrn, wenn du vergisst.",
      fr: "Et invoque ton Seigneur quand tu oublies.",
      ar: "وَاذْكُرْ رَبَّكَ إِذَا نَسِيتَ",
      es: "Y recuerda a tu Señor cuando olvides.",
      pt: "E lembra-te de teu Senhor quando esqueceres.",
    },
    sources: {
      tr: "Kehf, 24", en: "Surah Al-Kahf, 24", de: "Sure Al-Kahf, 24",
      fr: "Sourate Al-Kahf, 24", ar: "سورة الكهف، ٢٤",
      es: "Sura Al-Kahf, 24", pt: "Sura Al-Kahf, 24",
    },
  },
  {
    arabic: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
    translations: {
      tr: "Biz seni ancak âlemlere rahmet olarak gönderdik.",
      en: "We have sent you not but as a mercy to the worlds.",
      de: "Wir haben dich nur als Barmherzigkeit für die Weltenbewohner gesandt.",
      fr: "Nous ne t'avons envoyé qu'en miséricorde pour l'univers.",
      ar: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
      es: "No te enviamos sino como misericordia para los mundos.",
      pt: "Não te enviamos senão como misericórdia para os mundos.",
    },
    sources: {
      tr: "Enbiyâ, 107", en: "Surah Al-Anbiya, 107", de: "Sure Al-Anbiya, 107",
      fr: "Sourate Al-Anbiya, 107", ar: "سورة الأنبياء، ١٠٧",
      es: "Sura Al-Anbiya, 107", pt: "Sura Al-Anbiya, 107",
    },
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translations: {
      tr: "Bilesiniz ki kalpler ancak Allah'ı anmakla huzur bulur.",
      en: "Verily, in the remembrance of Allah do hearts find rest.",
      de: "Sicherlich, im Gedenken Allahs finden die Herzen Ruhe.",
      fr: "Certes, c'est par l'évocation d'Allah que les cœurs se tranquillisent.",
      ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      es: "Ciertamente, con el recuerdo de Allah se tranquilizan los corazones.",
      pt: "Certamente é com a lembrança de Allah que os corações se acalmam.",
    },
    sources: {
      tr: "Ra'd, 28", en: "Surah Ar-Ra'd, 28", de: "Sure Ar-Ra'd, 28",
      fr: "Sourate Ar-Ra'd, 28", ar: "سورة الرعد، ٢٨",
      es: "Sura Ar-Rad, 28", pt: "Sura Ar-Rad, 28",
    },
  },
  {
    arabic: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
    translations: {
      tr: "İnsan için ancak çalıştığı vardır.",
      en: "Man can have nothing but what he strives for.",
      de: "Der Mensch erhält nur das, wonach er strebt.",
      fr: "L'homme n'obtient que le fruit de ses efforts.",
      ar: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
      es: "El hombre sólo obtiene lo que se esfuerza por conseguir.",
      pt: "O homem só tem aquilo pelo que se esforça.",
    },
    sources: {
      tr: "Necm, 39", en: "Surah An-Najm, 39", de: "Sure An-Najm, 39",
      fr: "Sourate An-Najm, 39", ar: "سورة النجم، ٣٩",
      es: "Sura An-Najm, 39", pt: "Sura An-Najm, 39",
    },
  },
  {
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    translations: {
      tr: "De ki: O, Allah'tır, tektir.",
      en: "Say: He is Allah, the One.",
      de: "Sag: Er ist Allah, der Eine.",
      fr: "Dis: Il est Allah, Unique.",
      ar: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      es: "Di: Él es Allah, Uno.",
      pt: "Dize: Ele é Allah, o Único.",
    },
    sources: {
      tr: "İhlâs, 1", en: "Surah Al-Ikhlas, 1", de: "Sure Al-Ichlas, 1",
      fr: "Sourate Al-Ikhlas, 1", ar: "سورة الإخلاص، ١",
      es: "Sura Al-Ijlas, 1", pt: "Sura Al-Ikhlas, 1",
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
