-- SUPABASE RLS LOCKDOWN (PHASE 1)
-- This script enforces strict HIPAA-grade isolation between families.

-- 1. Helper function to get the current user's family_id
-- FIXED: Added SET search_path and use plpgsql to ensure RLS bypass.
CREATE OR REPLACE FUNCTION get_my_family_id() 
RETURNS UUID AS $$
DECLARE
  _family_id UUID;
BEGIN
  SELECT family_id INTO _family_id FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1;
  RETURN _family_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. FAMILIES TABLE
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Family isolation" ON families;
CREATE POLICY "Family isolation" ON families
  FOR ALL USING (id = get_my_family_id());

-- 3. PROFILES TABLE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profile isolation" ON public.profiles;
DROP POLICY IF EXISTS "Profiles own access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles family access" ON public.profiles;

-- Users can always see and manage their own profile (No recursion)
CREATE POLICY "Profiles own access" ON public.profiles
  FOR ALL USING (auth_id = auth.uid());

-- Users can see others in the same family (Uses helper function)
CREATE POLICY "Profiles family access" ON public.profiles
  FOR SELECT USING (family_id = get_my_family_id());

-- 4. MEDICATIONS TABLE
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Medication isolation" ON medications;
CREATE POLICY "Medication isolation" ON medications
  FOR ALL USING (family_id = get_my_family_id());

-- 5. MEDICATION LOGS
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Med log isolation" ON medication_logs;
CREATE POLICY "Med log isolation" ON medication_logs
  FOR ALL USING (
    profile_id IN (SELECT id FROM public.profiles WHERE family_id = get_my_family_id())
  );

-- 6. ALERTS TABLE
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Alert isolation" ON alerts;
CREATE POLICY "Alert isolation" ON alerts
  FOR ALL USING (family_id = get_my_family_id());

-- 7. VITALS LOG
ALTER TABLE vitals_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vitals isolation" ON vitals_log;
CREATE POLICY "Vitals isolation" ON vitals_log
  FOR ALL USING (
    profile_id IN (SELECT id FROM public.profiles WHERE family_id = get_my_family_id())
  );

-- 8. MANAGED DEVICES
ALTER TABLE managed_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Device isolation" ON managed_devices;
CREATE POLICY "Device isolation" ON managed_devices
  FOR ALL USING (family_id = get_my_family_id());
