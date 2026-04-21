import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@hugotomazi/capacitor-navigation-bar";
import type { ColorTheme } from "@/hooks/useTheme";

export function useSystemBars(colorTheme: ColorTheme, darkMode: boolean) {
  useEffect(() => {
    document.documentElement.classList.toggle("native-edge-to-edge", Capacitor.isNativePlatform());
    document.body.classList.toggle("native-edge-to-edge", Capacitor.isNativePlatform());

    if (!Capacitor.isNativePlatform()) return;

    (async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setBackgroundColor({ color: "#00000000" });
        await NavigationBar.setTransparency({ isTransparent: true });
        await NavigationBar.setColor({
          color: "#00000000",
          darkButtons: !darkMode,
        });
        await StatusBar.setStyle({ style: darkMode ? Style.Light : Style.Dark });
      } catch (error) {
        console.warn("System bar init error:", error);
      }
    })();

    return () => {
      document.documentElement.classList.remove("native-edge-to-edge");
      document.body.classList.remove("native-edge-to-edge");
    };
  }, [darkMode]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const frame = window.requestAnimationFrame(() => {
      void Promise.all([
        StatusBar.setStyle({ style: darkMode ? Style.Light : Style.Dark }),
        NavigationBar.setColor({ color: "#00000000", darkButtons: !darkMode }),
      ]).catch((error) => {
        console.warn("System bar sync error:", error);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [colorTheme, darkMode]);
}
