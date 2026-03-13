
-- FCM device tokens table (no auth required - anonymous device tracking)
CREATE TABLE public.fcm_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  fcm_token TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'İstanbul',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 41.0082,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 28.9784,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert/update/select (no auth, device-based)
CREATE POLICY "Allow anonymous insert" ON public.fcm_tokens FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.fcm_tokens FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON public.fcm_tokens FOR SELECT TO anon USING (true);

-- Enable pg_cron and pg_net for scheduled notifications
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
