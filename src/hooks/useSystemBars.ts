import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import type { ColorTheme } from "@/hooks/useTheme";

export function useSystemBars(colorTheme: ColorTheme, darkMode: boolean) {
  // Initial setup: overlay mode for edge-to-edge
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    (async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#00000000" }); // transparent
      } catch (error) {
        console.warn("System bar init error:", error);
      }
    })();
  }, []);

  // Sync icon style with theme changes
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const frame = window.requestAnimationFrame(() => {
      void StatusBar.setStyle({
        style: darkMode ? Style.Dark : Style.Light,
      }).catch((error) => {
        console.warn("System bar sync error:", error);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [colorTheme, darkMode]);
}
