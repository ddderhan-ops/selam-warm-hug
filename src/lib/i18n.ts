export type Language = 'tr' | 'en' | 'de' | 'fr' | 'ar';

export interface Translations {
  appName: string;
  nextPrayer: string;
  atTime: string;
  prayerNames: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  dailyVerse: string;
  share: string;
  shareAppText: string;
  settings: string;
  notifications: string;
  notificationsOn: string;
  notificationsOff: string;
  soundAlert: string;
  soundAlertDesc: string;
  language: string;
  selectCity: string;
  currentLocation: string;
  usingCurrentLocation: string;
  useCurrentLocation: string;
  qiblaCompass: string;
  qiblaDirection: string;
  distanceToKaaba: string;
  km: string;
  loading: string;
  loadingPrayerTimes: string;
  loadingLocation: string;
  error: string;
  retry: string;
  prayerTimesError: string;
  adPlaceholder: string;
  dataSource: string;
  adhanActive: string;
  swipeForQibla: string;
  back: string;
  hijriMonths: Record<string, string>;
  weekdays: Record<string, string>;
  months: Record<string, string>;
}

const translations: Record<Language, Translations> = {
  tr: {
    appName: 'Nur Ezan Vakti',
    nextPrayer: 'Sonraki Vakit',
    atTime: 'saatinde',
    prayerNames: {
      fajr: 'İmsak',
      sunrise: 'Güneş',
      dhuhr: 'Öğle',
      asr: 'İkindi',
      maghrib: 'Akşam',
      isha: 'Yatsı',
    },
    dailyVerse: 'Günün Ayeti',
    share: 'Paylaş',
    shareAppText: 'Nur Ezan Vakti uygulamasından gönderilmiştir',
    settings: 'Ayarlar',
    notifications: 'Bildirimler',
    notificationsOn: 'Bildirimler ve ezan sesi aktif',
    notificationsOff: 'Bildirimler kapatıldı',
    soundAlert: 'Sesli Uyarı',
    soundAlertDesc: 'Vakit girdiğinde "Allahu Ekber" sesi çalsın',
    language: 'Dil',
    selectCity: 'Şehir seç...',
    currentLocation: 'Mevcut Konum',
    usingCurrentLocation: 'Mevcut konum kullanılıyor',
    useCurrentLocation: 'Mevcut konumu kullan',
    qiblaCompass: 'Kıble Pusulası',
    qiblaDirection: 'Kıble Yönü',
    distanceToKaaba: "Kabe'ye Uzaklık",
    km: 'km',
    loading: 'Yükleniyor...',
    loadingPrayerTimes: 'Namaz vakitleri yükleniyor...',
    loadingLocation: 'Konum alınıyor...',
    error: 'Hata',
    retry: 'Tekrar Dene',
    prayerTimesError: 'Namaz vakitleri yüklenemedi. Lütfen tekrar deneyin.',
    adPlaceholder: 'Reklam Alanı',
    dataSource: 'Vakitler Aladhan API ile alınmaktadır',
    adhanActive: 'Ezan sesi aktif',
    swipeForQibla: 'Kıble pusulası için kaydırın →',
    back: 'Geri',
    hijriMonths: {
      Muharram: 'Muharrem',
      Safar: 'Safer',
      "Rabi' al-awwal": 'Rebiülevvel',
      "Rabi' al-thani": 'Rebiülahir',
      "Jumada al-awwal": 'Cemaziyelevvel',
      "Jumada al-thani": 'Cemaziyelahir',
      Rajab: 'Recep',
      "Sha'ban": 'Şaban',
      Ramadan: 'Ramazan',
      Shawwal: 'Şevval',
      "Dhu al-Qi'dah": 'Zilkade',
      "Dhu al-Hijjah": 'Zilhicce',
    },
    weekdays: {
      Monday: 'Pazartesi',
      Tuesday: 'Salı',
      Wednesday: 'Çarşamba',
      Thursday: 'Perşembe',
      Friday: 'Cuma',
      Saturday: 'Cumartesi',
      Sunday: 'Pazar',
    },
    months: {
      January: 'Ocak',
      February: 'Şubat',
      March: 'Mart',
      April: 'Nisan',
      May: 'Mayıs',
      June: 'Haziran',
      July: 'Temmuz',
      August: 'Ağustos',
      September: 'Eylül',
      October: 'Ekim',
      November: 'Kasım',
      December: 'Aralık',
    },
  },
  en: {
    appName: 'Nur Ezan Vakti',
    nextPrayer: 'Next Prayer',
    atTime: 'at',
    prayerNames: {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
    },
    dailyVerse: 'Verse of the Day',
    share: 'Share',
    shareAppText: 'Sent from Nur Ezan Vakti app',
    settings: 'Settings',
    notifications: 'Notifications',
    notificationsOn: 'Notifications and adhan sound active',
    notificationsOff: 'Notifications disabled',
    soundAlert: 'Sound Alert',
    soundAlertDesc: 'Play "Allahu Akbar" sound when prayer time arrives',
    language: 'Language',
    selectCity: 'Select city...',
    currentLocation: 'Current Location',
    usingCurrentLocation: 'Using current location',
    useCurrentLocation: 'Use current location',
    qiblaCompass: 'Qibla Compass',
    qiblaDirection: 'Qibla Direction',
    distanceToKaaba: 'Distance to Kaaba',
    km: 'km',
    loading: 'Loading...',
    loadingPrayerTimes: 'Loading prayer times...',
    loadingLocation: 'Getting location...',
    error: 'Error',
    retry: 'Retry',
    prayerTimesError: 'Could not load prayer times. Please try again.',
    adPlaceholder: 'Ad Space',
    dataSource: 'Times provided by Aladhan API',
    adhanActive: 'Adhan sound active',
    swipeForQibla: 'Swipe for Qibla compass →',
    back: 'Back',
    hijriMonths: {
      Muharram: 'Muharram',
      Safar: 'Safar',
      "Rabi' al-awwal": "Rabi' al-Awwal",
      "Rabi' al-thani": "Rabi' al-Thani",
      "Jumada al-awwal": 'Jumada al-Awwal',
      "Jumada al-thani": 'Jumada al-Thani',
      Rajab: 'Rajab',
      "Sha'ban": "Sha'ban",
      Ramadan: 'Ramadan',
      Shawwal: 'Shawwal',
      "Dhu al-Qi'dah": "Dhu al-Qi'dah",
      "Dhu al-Hijjah": "Dhu al-Hijjah",
    },
    weekdays: {
      Monday: 'Monday',
      Tuesday: 'Tuesday',
      Wednesday: 'Wednesday',
      Thursday: 'Thursday',
      Friday: 'Friday',
      Saturday: 'Saturday',
      Sunday: 'Sunday',
    },
    months: {
      January: 'January',
      February: 'February',
      March: 'March',
      April: 'April',
      May: 'May',
      June: 'June',
      July: 'July',
      August: 'August',
      September: 'September',
      October: 'October',
      November: 'November',
      December: 'December',
    },
  },
  de: {
    appName: 'Nur Ezan Vakti',
    nextPrayer: 'Nächstes Gebet',
    atTime: 'um',
    prayerNames: {
      fajr: 'Fadschr',
      sunrise: 'Sonnenaufgang',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Ischa',
    },
    dailyVerse: 'Vers des Tages',
    share: 'Teilen',
    shareAppText: 'Gesendet von der Nur Ezan Vakti App',
    settings: 'Einstellungen',
    notifications: 'Benachrichtigungen',
    notificationsOn: 'Benachrichtigungen und Adhan-Sound aktiv',
    notificationsOff: 'Benachrichtigungen deaktiviert',
    soundAlert: 'Tonalarm',
    soundAlertDesc: '"Allahu Akbar" Sound bei Gebetszeit abspielen',
    language: 'Sprache',
    selectCity: 'Stadt wählen...',
    currentLocation: 'Aktueller Standort',
    usingCurrentLocation: 'Aktueller Standort wird verwendet',
    useCurrentLocation: 'Aktuellen Standort verwenden',
    qiblaCompass: 'Qibla-Kompass',
    qiblaDirection: 'Qibla-Richtung',
    distanceToKaaba: 'Entfernung zur Kaaba',
    km: 'km',
    loading: 'Laden...',
    loadingPrayerTimes: 'Gebetszeiten werden geladen...',
    loadingLocation: 'Standort wird abgerufen...',
    error: 'Fehler',
    retry: 'Erneut versuchen',
    prayerTimesError: 'Gebetszeiten konnten nicht geladen werden.',
    adPlaceholder: 'Werbefläche',
    dataSource: 'Zeiten von Aladhan API bereitgestellt',
    adhanActive: 'Adhan-Sound aktiv',
    swipeForQibla: 'Für Qibla-Kompass wischen →',
    back: 'Zurück',
    hijriMonths: {
      Muharram: 'Muharram',
      Safar: 'Safar',
      "Rabi' al-awwal": "Rabi' al-Awwal",
      "Rabi' al-thani": "Rabi' al-Thani",
      "Jumada al-awwal": 'Dschumada al-Ula',
      "Jumada al-thani": 'Dschumada ath-Thaniya',
      Rajab: 'Radschab',
      "Sha'ban": "Scha'ban",
      Ramadan: 'Ramadan',
      Shawwal: 'Schawwal',
      "Dhu al-Qi'dah": "Dhu l-Qa'da",
      "Dhu al-Hijjah": 'Dhu l-Hiddscha',
    },
    weekdays: {
      Monday: 'Montag',
      Tuesday: 'Dienstag',
      Wednesday: 'Mittwoch',
      Thursday: 'Donnerstag',
      Friday: 'Freitag',
      Saturday: 'Samstag',
      Sunday: 'Sonntag',
    },
    months: {
      January: 'Januar',
      February: 'Februar',
      March: 'März',
      April: 'April',
      May: 'Mai',
      June: 'Juni',
      July: 'Juli',
      August: 'August',
      September: 'September',
      October: 'Oktober',
      November: 'November',
      December: 'Dezember',
    },
  },
  fr: {
    appName: 'Nur Ezan Vakti',
    nextPrayer: 'Prochaine Prière',
    atTime: 'à',
    prayerNames: {
      fajr: 'Fajr',
      sunrise: 'Lever du soleil',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
    },
    dailyVerse: 'Verset du Jour',
    share: 'Partager',
    shareAppText: 'Envoyé depuis l\'app Nur Heures de Prière',
    settings: 'Paramètres',
    notifications: 'Notifications',
    notificationsOn: 'Notifications et adhan activés',
    notificationsOff: 'Notifications désactivées',
    soundAlert: 'Alerte Sonore',
    soundAlertDesc: 'Jouer "Allahu Akbar" à l\'heure de la prière',
    language: 'Langue',
    selectCity: 'Choisir une ville...',
    currentLocation: 'Position Actuelle',
    usingCurrentLocation: 'Utilisation de la position actuelle',
    useCurrentLocation: 'Utiliser la position actuelle',
    qiblaCompass: 'Boussole Qibla',
    qiblaDirection: 'Direction de la Qibla',
    distanceToKaaba: 'Distance à la Kaaba',
    km: 'km',
    loading: 'Chargement...',
    loadingPrayerTimes: 'Chargement des heures de prière...',
    loadingLocation: 'Obtention de la position...',
    error: 'Erreur',
    retry: 'Réessayer',
    prayerTimesError: 'Impossible de charger les heures de prière.',
    adPlaceholder: 'Espace Publicitaire',
    dataSource: 'Horaires fournis par Aladhan API',
    adhanActive: 'Adhan actif',
    swipeForQibla: 'Glissez pour la boussole Qibla →',
    back: 'Retour',
    hijriMonths: {
      Muharram: 'Mouharram',
      Safar: 'Safar',
      "Rabi' al-awwal": "Rabi' al-Awwal",
      "Rabi' al-thani": "Rabi' ath-Thani",
      "Jumada al-awwal": 'Joumada al-Oula',
      "Jumada al-thani": 'Joumada ath-Thania',
      Rajab: 'Rajab',
      "Sha'ban": "Cha'bane",
      Ramadan: 'Ramadan',
      Shawwal: 'Chawwal',
      "Dhu al-Qi'dah": "Dhou al-Qi'da",
      "Dhu al-Hijjah": 'Dhou al-Hijja',
    },
    weekdays: {
      Monday: 'Lundi',
      Tuesday: 'Mardi',
      Wednesday: 'Mercredi',
      Thursday: 'Jeudi',
      Friday: 'Vendredi',
      Saturday: 'Samedi',
      Sunday: 'Dimanche',
    },
    months: {
      January: 'Janvier',
      February: 'Février',
      March: 'Mars',
      April: 'Avril',
      May: 'Mai',
      June: 'Juin',
      July: 'Juillet',
      August: 'Août',
      September: 'Septembre',
      October: 'Octobre',
      November: 'Novembre',
      December: 'Décembre',
    },
  },
  ar: {
    appName: 'نور أوقات الصلاة',
    nextPrayer: 'الصلاة القادمة',
    atTime: 'في الساعة',
    prayerNames: {
      fajr: 'الفجر',
      sunrise: 'الشروق',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء',
    },
    dailyVerse: 'آية اليوم',
    share: 'مشاركة',
    shareAppText: 'أُرسلت من تطبيق نور أوقات الصلاة',
    settings: 'الإعدادات',
    notifications: 'الإشعارات',
    notificationsOn: 'الإشعارات وصوت الأذان مفعّلة',
    notificationsOff: 'الإشعارات معطّلة',
    soundAlert: 'التنبيه الصوتي',
    soundAlertDesc: 'تشغيل صوت "الله أكبر" عند وقت الصلاة',
    language: 'اللغة',
    selectCity: 'اختر المدينة...',
    currentLocation: 'الموقع الحالي',
    usingCurrentLocation: 'يتم استخدام الموقع الحالي',
    useCurrentLocation: 'استخدم الموقع الحالي',
    qiblaCompass: 'بوصلة القبلة',
    qiblaDirection: 'اتجاه القبلة',
    distanceToKaaba: 'المسافة إلى الكعبة',
    km: 'كم',
    loading: 'جارٍ التحميل...',
    loadingPrayerTimes: 'جارٍ تحميل أوقات الصلاة...',
    loadingLocation: 'جارٍ تحديد الموقع...',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
    prayerTimesError: 'تعذر تحميل أوقات الصلاة. يرجى المحاولة مرة أخرى.',
    adPlaceholder: 'مساحة إعلانية',
    dataSource: 'الأوقات من Aladhan API',
    adhanActive: 'صوت الأذان مفعّل',
    swipeForQibla: '← اسحب لبوصلة القبلة',
    back: 'رجوع',
    hijriMonths: {
      Muharram: 'محرّم',
      Safar: 'صفر',
      "Rabi' al-awwal": 'ربيع الأول',
      "Rabi' al-thani": 'ربيع الثاني',
      "Jumada al-awwal": 'جمادى الأولى',
      "Jumada al-thani": 'جمادى الثانية',
      Rajab: 'رجب',
      "Sha'ban": 'شعبان',
      Ramadan: 'رمضان',
      Shawwal: 'شوّال',
      "Dhu al-Qi'dah": 'ذو القعدة',
      "Dhu al-Hijjah": 'ذو الحجة',
    },
    weekdays: {
      Monday: 'الإثنين',
      Tuesday: 'الثلاثاء',
      Wednesday: 'الأربعاء',
      Thursday: 'الخميس',
      Friday: 'الجمعة',
      Saturday: 'السبت',
      Sunday: 'الأحد',
    },
    months: {
      January: 'يناير',
      February: 'فبراير',
      March: 'مارس',
      April: 'أبريل',
      May: 'مايو',
      June: 'يونيو',
      July: 'يوليو',
      August: 'أغسطس',
      September: 'سبتمبر',
      October: 'أكتوبر',
      November: 'نوفمبر',
      December: 'ديسمبر',
    },
  },
};

export const languageNames: Record<Language, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  ar: 'العربية',
};

export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'tr';
  
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supportedLangs: Language[] = ['tr', 'en', 'de', 'fr', 'ar'];
  
  return supportedLangs.includes(browserLang as Language) 
    ? (browserLang as Language) 
    : 'tr';
}

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function isRTL(lang: Language): boolean {
  return lang === 'ar';
}
