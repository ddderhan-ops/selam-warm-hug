import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@capgo/capacitor-navigation-bar";
import type { ColorTheme } from "@/hooks/useTheme";

export function useSystemBars(_colorTheme: ColorTheme, darkMode: boolean) {
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    document.documentElement.classList.toggle("native-edge-to-edge", isNative);
    document.body.classList.toggle("native-edge-to-edge", isNative);
    if (!isNative) return;

    void (async () => {
      try {
        // Draw behind both bars
        await StatusBar.setOverlaysWebView({ overlay: true });
        // Transparent bars — the CSS background shows through
        await StatusBar.setBackgroundColor({ color: "#00000000" });
        await StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light });
        await NavigationBar.setNavigationBarColor({ color: "#00000000", darkButtons: !darkMode });
      } catch (e) {
        console.warn("System bar init error:", e);
      }
    })();

    return () => {
      document.documentElement.classList.remove("native-edge-to-edge");
      document.body.classList.remove("native-edge-to-edge");
    };
  }, [darkMode]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const frame = requestAnimationFrame(() => {
      void Promise.all([
        StatusBar.setBackgroundColor({ color: "#00000000" }),
        StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light }),
        NavigationBar.setNavigationBarColor({ color: "#00000000", darkButtons: !darkMode }),
      ]).catch((e) => console.warn("System bar sync error:", e));
    });
    return () => cancelAnimationFrame(frame);
  }, [_colorTheme, darkMode]);
}
