-- ENABLE REALTIME FOR KEY TABLES (V80.1)
-- This ensures that the Admin dashboard updates instantly when new members join or status changes.

-- 1. Enable Realtime for the 'profiles' table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- 2. Enable Realtime for other critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.families;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medication_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.managed_devices;
