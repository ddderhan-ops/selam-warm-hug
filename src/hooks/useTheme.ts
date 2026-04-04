import { useState, useEffect, useCallback } from "react";

export type ColorTheme = "default" | "ocean" | "midnight" | "emerald";

const THEME_CLASSES = ["theme-ocean", "theme-midnight", "theme-emerald"];

export function useTheme() {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("colorTheme") as ColorTheme;
      if (stored && ["default", "ocean", "midnight", "emerald"].includes(stored)) return stored;
      // migrate old "theme" key
      const old = localStorage.getItem("theme");
      if (old === "ocean") return "ocean";
      if (old === "midnight") return "midnight";
    }
    return "default";
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return stored === "true";
      // migrate old theme key
      const old = localStorage.getItem("theme");
      if (old === "midnight") return true;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", ...THEME_CLASSES);
    if (colorTheme !== "default") root.classList.add(`theme-${colorTheme}`);
    if (darkMode) root.classList.add("dark");
    localStorage.setItem("colorTheme", colorTheme);
    localStorage.setItem("darkMode", String(darkMode));
  }, [colorTheme, darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  return { colorTheme, setColorTheme, darkMode, toggleDarkMode };
}
