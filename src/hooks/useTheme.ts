import { useState, useEffect } from "react";

export type Theme = "default" | "ocean" | "midnight";

const THEME_CLASS_MAP: Record<Theme, string> = {
  default: "",
  ocean: "theme-ocean",
  midnight: "dark theme-midnight",
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored && ["default", "ocean", "midnight"].includes(stored)) return stored;
    }
    return "default";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-ocean", "theme-midnight");
    const classes = THEME_CLASS_MAP[theme];
    if (classes) classes.split(" ").forEach((c) => root.classList.add(c));
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
