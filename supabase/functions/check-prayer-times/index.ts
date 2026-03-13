import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const prayerNamesTr: Record<string, string> = {
  Fajr: "İmsak",
  Sunrise: "Güneş",
  Dhuhr: "Öğle",
  Asr: "İkindi",
  Maghrib: "Akşam",
  Isha: "Yatsı",
};

const prayerKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface LocationGroup {
  city: string;
  latitude: number;
  longitude: number;
}

async function fetchPrayerTimings(lat: number, lng: number): Promise<Record<string, string>> {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=13`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Aladhan API failed: ${text}`);
  }

  const data = await response.json();
  return data.data.timings;
}

function isWithinWindow(timeStr: string, windowMinutes: number = 2): boolean {
  const [hours, minutes] = timeStr.split(" ")[0].split(":").map(Number);
  const now = new Date();
  
  // Create prayer time for today in UTC (API returns in local time based on coords)
  const prayerDate = new Date(now);
  prayerDate.setHours(hours, minutes, 0, 0);
  
  const diffMs = Math.abs(now.getTime() - prayerDate.getTime());
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= windowMinutes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get distinct locations from registered tokens
    const { data: tokens, error } = await supabase
      .from("fcm_tokens")
      .select("city, latitude, longitude")
      .eq("notifications_enabled", true);

    if (error) throw new Error(`DB error: ${error.message}`);
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No registered devices" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group by unique locations (rounded to 1 decimal)
    const locationMap = new Map<string, LocationGroup>();
    for (const t of tokens) {
      const key = `${Math.round(t.latitude * 10) / 10}_${Math.round(t.longitude * 10) / 10}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          city: t.city,
          latitude: t.latitude,
          longitude: t.longitude,
        });
      }
    }

    const sendFunctionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-prayer-notification`;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let notificationsSent = 0;

    for (const [, location] of locationMap) {
      try {
        const timings = await fetchPrayerTimings(location.latitude, location.longitude);

        for (const key of prayerKeys) {
          const timeStr = timings[key];
          if (!timeStr) continue;

          if (isWithinWindow(timeStr, 2)) {
            console.log(`Prayer ${key} is due for ${location.city} at ${timeStr}`);

            const response = await fetch(sendFunctionUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                prayerName: prayerNamesTr[key],
                prayerNameEn: key,
                city: location.city,
              }),
            });

            const result = await response.json();
            notificationsSent += result.sent || 0;
          }
        }
      } catch (err) {
        console.error(`Error checking prayers for ${location.city}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        locationsChecked: locationMap.size,
        notificationsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
