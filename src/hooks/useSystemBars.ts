import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import type { ColorTheme } from "@/hooks/useTheme";

/** Default initial color applied before theme hydrates */
const INITIAL_STATUS_BAR_COLOR = "#1A1A1A";

/**
 * Maps theme + dark mode to the correct background hex color.
 */
function getBackgroundColor(colorTheme: ColorTheme, darkMode: boolean): string {
  if (darkMode) {
    switch (colorTheme) {
      case "ocean":   return "#141e28";
      case "bronze":  return "#171411";
      default:        return "#1A1A1A";
    }
  }
  switch (colorTheme) {
    case "ocean":   return "#fafafa";
    case "bronze":  return "#fafafa";
    default:        return "#fafafa";
  }
}

/**
 * Syncs Android Status Bar color with the active theme.
 * Sets initial color to #1A1A1A on app start, then follows theme changes.
 * On web/unsupported platforms, this hook is a no-op.
 */
export function useSystemBars(colorTheme: ColorTheme, darkMode: boolean) {
  // Initial setup — runs once on app start
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const initBars = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: INITIAL_STATUS_BAR_COLOR });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn("StatusBar init error:", e);
      }
    };

    initBars();
  }, []);

  // Sync with theme changes
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const color = getBackgroundColor(colorTheme, darkMode);
    const style = darkMode ? Style.Dark : Style.Light;

    const sync = async () => {
      try {
        await StatusBar.setBackgroundColor({ color });
        await StatusBar.setStyle({ style });
      } catch (e) {
        console.warn("StatusBar sync error:", e);
      }
    };

    sync();
  }, [colorTheme, darkMode]);
}
