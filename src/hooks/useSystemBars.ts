import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@capgo/capacitor-navigation-bar";
import type { ColorTheme } from "@/hooks/useTheme";

const INITIAL_SYSTEM_BAR_COLOR = "#1A1A1A";

function parseHslToken(token: string) {
  const match = token.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) return null;

  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (h < 60) {
    red = chroma;
    green = x;
  } else if (h < 120) {
    red = x;
    green = chroma;
  } else if (h < 180) {
    green = chroma;
    blue = x;
  } else if (h < 240) {
    green = x;
    blue = chroma;
  } else if (h < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const toHex = (value: number) => Math.round((value + m) * 255).toString(16).padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

function readThemeSurface() {
  if (typeof window === "undefined") {
    return { color: INITIAL_SYSTEM_BAR_COLOR, darkSurface: true };
  }

  const backgroundToken = getComputedStyle(document.documentElement).getPropertyValue("--background");
  const parsed = parseHslToken(backgroundToken);

  if (!parsed) {
    return { color: INITIAL_SYSTEM_BAR_COLOR, darkSurface: true };
  }

  return {
    color: hslToHex(parsed.h, parsed.s, parsed.l),
    darkSurface: parsed.l < 55,
  };
}

function paintWebView(color: string) {
  if (typeof document === "undefined") return;

  document.documentElement.style.backgroundColor = color;
  document.body?.style.setProperty("background-color", color);
  document.getElementById("root")?.style.setProperty("background-color", color);
}

async function syncNativeBars(color: string, darkSurface: boolean) {
  await StatusBar.setOverlaysWebView({ overlay: false });
  await StatusBar.setBackgroundColor({ color });
  await StatusBar.setStyle({ style: darkSurface ? Style.Light : Style.Dark });

  if (Capacitor.getPlatform() === "android") {
    await NavigationBar.setNavigationBarColor({
      color,
      dividerColor: color,
      darkButtons: !darkSurface,
    });
  }
}

export function useSystemBars(colorTheme: ColorTheme, darkMode: boolean) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    paintWebView(INITIAL_SYSTEM_BAR_COLOR);

    void syncNativeBars(INITIAL_SYSTEM_BAR_COLOR, true).catch((error) => {
      console.warn("System bar init error:", error);
    });
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const frame = window.requestAnimationFrame(() => {
      const { color, darkSurface } = readThemeSurface();
      paintWebView(color);

      void syncNativeBars(color, darkSurface).catch((error) => {
        console.warn("System bar sync error:", error);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [colorTheme, darkMode]);
}
