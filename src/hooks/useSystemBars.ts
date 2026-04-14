import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@hugotomazi/capacitor-navigation-bar";
import type { ColorTheme } from "@/hooks/useTheme";

/**
 * Maps theme + dark mode to the correct background hex color
 * that matches the CSS --background variable for each combination.
 */
function getBackgroundColor(colorTheme: ColorTheme, darkMode: boolean): string {
  if (darkMode) {
    switch (colorTheme) {
      case "ocean":   return "#141e28"; // 210 25% 9%
      case "bronze":  return "#171411"; // 30 10% 8%
      default:        return "#171b24"; // 220 20% 10%
    }
  }
  // Light mode — all themes share the same light background
  switch (colorTheme) {
    case "ocean":   return "#fafafa"; // 0 0% 98% (same root)
    case "bronze":  return "#fafafa";
    default:        return "#fafafa";
  }
}

/**
 * Syncs Android Status Bar and Navigation Bar colors with the active theme.
 * On web/unsupported platforms, this hook is a no-op.
 */
export function useSystemBars(colorTheme: ColorTheme, darkMode: boolean) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const color = getBackgroundColor(colorTheme, darkMode);
    const style = darkMode ? Style.Dark : Style.Light;

    const sync = async () => {
      try {
        // Status bar
        await StatusBar.setBackgroundColor({ color });
        await StatusBar.setStyle({ style });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn("StatusBar plugin error:", e);
      }

      try {
        // Navigation bar
        await NavigationBar.setColor({ color, darkButtons: !darkMode });
      } catch (e) {
        console.warn("NavigationBar plugin error:", e);
      }
    };

    sync();
  }, [colorTheme, darkMode]);
}
