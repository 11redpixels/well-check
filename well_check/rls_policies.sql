-- SUPABASE RLS LOCKDOWN (V3 - CASCADE + ALL TABLES)
-- This script enforces strict HIPAA-grade isolation between families while avoiding recursion.

-- 1. DROP OLD FUNCTIONS WITH CASCADE
DROP FUNCTION IF EXISTS public.current_user_family_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_family_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_auth_family_id() CASCADE;

-- 2. RE-DEFINE THE HELPER FUNCTION WITH BEYOND-RLS PRIVILEGES
-- We use SECURITY DEFINER and SET search_path to ensure it bypasses RLS correctly.
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

-- 3. APPLY NEW NON-RECURSIVE POLICIES FOR ALL TABLES

-- A. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles own access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles family access" ON public.profiles;

-- Users can always see and manage their own profile (No recursion)
CREATE POLICY "Profiles own access" ON public.profiles
  FOR ALL TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Users can see others in the same family (Uses non-recursive helper)
CREATE POLICY "Profiles family access" ON public.profiles
  FOR SELECT TO authenticated
  USING (family_id = public.get_auth_family_id());

-- B. FAMILIES
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Family isolation" ON public.families;
CREATE POLICY "Family isolation" ON public.families
  FOR ALL TO authenticated
  USING (id = public.get_auth_family_id());

-- C. MEDICATIONS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Medication isolation" ON public.medications;
CREATE POLICY "Medication isolation" ON public.medications
  FOR ALL TO authenticated
  USING (family_id = public.get_auth_family_id());

-- D. MEDICATION LOGS
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Med log isolation" ON public.medication_logs;
CREATE POLICY "Med log isolation" ON public.medication_logs
  FOR ALL TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE family_id = public.get_auth_family_id()
    )
  );

-- E. ALERTS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Alert isolation" ON public.alerts;
CREATE POLICY "Alert isolation" ON public.alerts
  FOR ALL TO authenticated
  USING (family_id = public.get_auth_family_id());

-- F. VITALS LOG
ALTER TABLE public.vitals_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vitals isolation" ON public.vitals_log;
CREATE POLICY "Vitals isolation" ON public.vitals_log
  FOR ALL TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE family_id = public.get_auth_family_id()
    )
  );

-- G. MANAGED DEVICES
ALTER TABLE public.managed_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Device isolation" ON public.managed_devices;
CREATE POLICY "Device isolation" ON public.managed_devices
  FOR ALL TO authenticated
  USING (family_id = public.get_auth_family_id());
