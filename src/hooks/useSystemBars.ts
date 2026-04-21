import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@capgo/capacitor-navigation-bar";
import type { ColorTheme } from "@/hooks/useTheme";

function hslToHex(hslValue: string) {
  const [hRaw, sRaw, lRaw] = hslValue.trim().split(/\s+/);
  const h = Number.parseFloat(hRaw);
  const s = Number.parseFloat(sRaw.replace("%", "")) / 100;
  const l = Number.parseFloat(lRaw.replace("%", "")) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (value: number) => Math.round((value + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getBackgroundHex() {
  const background = getComputedStyle(document.documentElement).getPropertyValue("--background");
  return hslToHex(background || "220 20% 10%");
}

export function useSystemBars(colorTheme: ColorTheme, darkMode: boolean) {
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    document.documentElement.classList.toggle("native-edge-to-edge", isNative);
    document.body.classList.toggle("native-edge-to-edge", isNative);

    if (!isNative) return;

    const backgroundColor = getBackgroundHex();

    void (async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setBackgroundColor({ color: backgroundColor });
        await NavigationBar.setNavigationBarColor({
          color: backgroundColor,
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
      const backgroundColor = getBackgroundHex();
      void Promise.all([
        StatusBar.setBackgroundColor({ color: backgroundColor }),
        StatusBar.setStyle({ style: darkMode ? Style.Light : Style.Dark }),
        NavigationBar.setNavigationBarColor({ color: backgroundColor, darkButtons: !darkMode }),
      ]).catch((error) => {
        console.warn("System bar sync error:", error);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [colorTheme, darkMode]);
}
