import { useState, useEffect, useCallback } from "react";

export type ColorTheme = "default" | "ocean" | "bronze";

const THEME_CLASSES = ["theme-ocean", "theme-bronze"];

const PRE_ALERT_MINUTES_KEY = "preAlertMinutes";
const ALERT_SOUND_KEY = "alertSound";
const AUTO_DARK_KEY = "autoDarkMode";

export type AlertSound = "uyari" | "uyari1" | "uyari2" | "uyari3";

export const ALERT_SOUND_FILES: Record<AlertSound, string> = {
  uyari: "/raw/uyari.mp3",
  uyari1: "/raw/uyari1.mp3",
  uyari2: "/raw/uyari2.mp3",
  uyari3: "/raw/uyari3.mp3",
};

export const ALERT_SOUND_LABELS: Record<AlertSound, string> = {
  uyari: "Allahu Ekber",
  uyari1: "Uyarı Sesi 1",
  uyari2: "Uyarı Sesi 2",
  uyari3: "Uyarı Sesi 3",
};

export function useTheme() {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("colorTheme") as ColorTheme;
      if (stored && ["default", "ocean", "bronze"].includes(stored)) return stored;
    }
    return "default";
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return stored === "true";
    }
    return false;
  });

  const [autoDarkMode, setAutoDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AUTO_DARK_KEY);
      if (stored !== null) return stored === "true";
    }
    return false;
  });

  const [preAlertMinutes, setPreAlertMinutes] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PRE_ALERT_MINUTES_KEY);
      if (stored) { const n = parseInt(stored, 10); if (n >= 1 && n <= 60) return n; }
    }
    return 15;
  });

  const [alertSound, setAlertSound] = useState<AlertSound>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ALERT_SOUND_KEY) as AlertSound;
      if (stored && stored in ALERT_SOUND_FILES) return stored;
    }
    return "uyari";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", ...THEME_CLASSES);
    if (colorTheme !== "default") root.classList.add(`theme-${colorTheme}`);
    if (darkMode) root.classList.add("dark");
    localStorage.setItem("colorTheme", colorTheme);
    localStorage.setItem("darkMode", String(darkMode));
  }, [colorTheme, darkMode]);

  useEffect(() => {
    localStorage.setItem(PRE_ALERT_MINUTES_KEY, String(preAlertMinutes));
  }, [preAlertMinutes]);

  useEffect(() => {
    localStorage.setItem(ALERT_SOUND_KEY, alertSound);
  }, [alertSound]);

  useEffect(() => {
    localStorage.setItem(AUTO_DARK_KEY, String(autoDarkMode));
  }, [autoDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const toggleAutoDarkMode = useCallback(() => {
    setAutoDarkMode((prev) => !prev);
  }, []);

  return {
    colorTheme, setColorTheme,
    darkMode, setDarkMode, toggleDarkMode,
    autoDarkMode, toggleAutoDarkMode,
    preAlertMinutes, setPreAlertMinutes,
    alertSound, setAlertSound,
  };
}
