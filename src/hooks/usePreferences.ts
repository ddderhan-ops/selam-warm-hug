import { useCallback } from "react";
import { Preferences } from "@capacitor/preferences";

export function usePreferences() {
  const setPreference = useCallback(async (key: string, value: string) => {
    try {
      await Preferences.set({ key, value });
    } catch {
      localStorage.setItem(key, value);
    }
  }, []);

  const getPreference = useCallback(async (key: string): Promise<string | null> => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      return localStorage.getItem(key);
    }
  }, []);

  return { setPreference, getPreference };
}

/** Synchronous read for initialState – tries localStorage as instant fallback */
export async function readPreference(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return localStorage.getItem(key);
  }
}
