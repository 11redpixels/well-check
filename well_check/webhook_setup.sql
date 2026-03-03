-- SUPABASE WEBHOOK SETUP (PHASE 4)
-- This script enables the automatic trigger for Push Notifications.

-- 1. Create the function that calls the Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_alert_webhook()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://lravvptfltbfbfmbhomp.supabase.co/functions/v1/fcm-alert-trigger',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key') -- Service Role Key for internal auth
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger on the alerts table
DROP TRIGGER IF EXISTS on_alert_created ON public.alerts;
CREATE TRIGGER on_alert_created
  AFTER INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_alert_webhook();

-- Note: Ensure the 'pgnet' extension is enabled in your Supabase Dashboard 
-- (Database > Extensions > pgnet)
CREATE EXTENSION IF NOT EXISTS pgnet;
