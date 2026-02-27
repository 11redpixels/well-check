-- SUPABASE RLS LOCKDOWN (V5 - ROBUST REPAIR)
-- This script enforces strict HIPAA-grade isolation between families while avoiding recursion.

-- 1. DROP OLD FUNCTIONS WITH CASCADE
DROP FUNCTION IF EXISTS public.current_user_family_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_family_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_auth_family_id() CASCADE;

-- 2. RE-DEFINE THE HELPER FUNCTION WITH BEYOND-RLS PRIVILEGES
CREATE OR REPLACE FUNCTION public.get_auth_family_id() 
RETURNS UUID AS $$
BEGIN
  -- We query the table directly. Since this is SECURITY DEFINER, it bypasses RLS 
  -- IF it is owned by a superuser (like postgres in Supabase).
  RETURN (
    SELECT family_id 
    FROM public.profiles 
    WHERE auth_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 3. APPLY NEW NON-RECURSIVE POLICIES FOR ALL TABLES (WITH ROBUSTNESS)
DO $$ 
BEGIN
  -- A. PROFILES
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Profile family isolation" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles own access" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles family access" ON public.profiles;
    
    CREATE POLICY "Profiles own access" ON public.profiles FOR ALL USING (auth_id = auth.uid());
    CREATE POLICY "Profiles family access" ON public.profiles FOR SELECT USING (family_id = public.get_auth_family_id());
  END IF;

  -- B. FAMILIES
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'families') THEN
    ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Family isolation" ON public.families;
    CREATE POLICY "Family isolation" ON public.families FOR ALL USING (id = public.get_auth_family_id());
  END IF;

  -- C. MEDICATIONS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medications') THEN
    ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Medication isolation" ON public.medications;
    CREATE POLICY "Medication isolation" ON public.medications FOR ALL USING (family_id = public.get_auth_family_id());
  END IF;

  -- D. MEDICATION LOGS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medication_logs') THEN
    ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Med log isolation" ON public.medication_logs;
    CREATE POLICY "Med log isolation" ON public.medication_logs 
      FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE family_id = public.get_auth_family_id()));
  END IF;

  -- E. ALERTS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alerts') THEN
    ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Alert isolation" ON public.alerts;
    CREATE POLICY "Alert isolation" ON public.alerts FOR ALL USING (family_id = public.get_auth_family_id());
  END IF;

  -- F. VITALS LOG
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vitals_log') THEN
    ALTER TABLE public.vitals_log ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Vitals isolation" ON public.vitals_log;
    CREATE POLICY "Vitals isolation" ON public.vitals_log 
      FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE family_id = public.get_auth_family_id()));
  END IF;

  -- G. MANAGED DEVICES
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'managed_devices') THEN
    ALTER TABLE public.managed_devices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Device isolation" ON public.managed_devices;
    CREATE POLICY "Device isolation" ON public.managed_devices FOR ALL USING (family_id = public.get_auth_family_id());
  END IF;
END $$;
