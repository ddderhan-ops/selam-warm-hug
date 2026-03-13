import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FCMToken {
  fcm_token: string;
  city: string;
  device_id: string;
}

async function getFirebaseAccessToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);

  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const payload = btoa(JSON.stringify(claimSet))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const signInput = `${header}.${payload}`;

  // Import the private key
  const pemContents = serviceAccount.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signInput}.${signature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

async function sendFCMMessage(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data: data || {},
          android: {
            priority: "high",
            notification: {
              channel_id: "prayer-times-channel",
              sound: "default",
            },
          },
          webpush: {
            headers: { Urgency: "high" },
            notification: {
              requireInteraction: true,
              icon: "/pwa-192x192.png",
              badge: "/pwa-192x192.png",
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error(`FCM send failed for token ${token.slice(0, 20)}...: ${err}`);
    return false;
  }

  await response.text();
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON secret not configured");
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const firebaseProjectId = serviceAccount.project_id;

    const { prayerName, prayerNameEn, city } = await req.json();

    if (!prayerName || !prayerNameEn) {
      return new Response(
        JSON.stringify({ error: "prayerName and prayerNameEn are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all enabled FCM tokens, optionally filtered by city
    let query = supabase
      .from("fcm_tokens")
      .select("fcm_token, city, device_id")
      .eq("notifications_enabled", true);

    if (city) {
      query = query.eq("city", city);
    }

    const { data: tokens, error } = await query;

    if (error) {
      throw new Error(`DB query failed: ${error.message}`);
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No tokens found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getFirebaseAccessToken(serviceAccountJson);

    const title = `Ezan Vakti Geldi: ${prayerName}`;
    const body = `${prayerName} vakti girdi. Hayırlı ibadetler.`;

    let sent = 0;
    const invalidTokens: string[] = [];

    await Promise.all(
      (tokens as FCMToken[]).map(async (t) => {
        const success = await sendFCMMessage(accessToken, firebaseProjectId, t.fcm_token, title, body, {
          tag: `prayer-${prayerNameEn}`,
          prayerName,
          prayerNameEn,
        });
        if (success) {
          sent++;
        } else {
          invalidTokens.push(t.device_id);
        }
      })
    );

    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      await supabase
        .from("fcm_tokens")
        .delete()
        .in("device_id", invalidTokens);
    }

    return new Response(
      JSON.stringify({ success: true, sent, total: tokens.length }),
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
