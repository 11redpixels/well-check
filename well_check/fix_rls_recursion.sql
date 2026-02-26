-- FIX: INFINITE RECURSION IN PROFILES RLS
-- This script repairs the get_my_family_id function and applies a non-recursive policy for profiles.

-- 1. DROP OLD POLICIES TO PREVENT CONFLICTS
DROP POLICY IF EXISTS "Profile isolation" ON public.profiles;
DROP POLICY IF EXISTS "Profile family isolation" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage family profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles own access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles family access" ON public.profiles;

-- 2. RE-DEFINE THE HELPER FUNCTION WITH BEYOND-RLS PRIVILEGES
-- We use SECURITY DEFINER and SET search_path to ensure it bypasses RLS correctly.
CREATE OR REPLACE FUNCTION public.get_my_family_id() 
RETURNS UUID AS $$
DECLARE
  _family_id UUID;
BEGIN
  -- We query the table directly. Since this is SECURITY DEFINER, it bypasses RLS 
  -- IF it is owned by a superuser (like postgres in Supabase).
  SELECT family_id INTO _family_id FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1;
  RETURN _family_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 3. APPLY NEW NON-RECURSIVE POLICIES FOR PROFILES
-- We split the policy to ensure the "owner" check happens first and doesn't trigger the function.

-- A. Users can ALWAYS see and edit their own profile (Base case - no recursion)
CREATE POLICY "Profiles own access" ON public.profiles
  FOR ALL USING (auth_id = auth.uid());

-- B. Users can SEE other profiles in the same family (Uses the helper function)
-- This will only recurse if get_my_family_id() triggers RLS, which SECURITY DEFINER should prevent.
CREATE POLICY "Profiles family access" ON public.profiles
  FOR SELECT USING (family_id = public.get_my_family_id());

-- 4. ENSURE OTHER TABLES ARE ALSO USING THE FIXED FUNCTION
-- (They already were, but this ensures they stay in sync)
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Family isolation" ON public.families;
CREATE POLICY "Family isolation" ON public.families
  FOR ALL USING (id = public.get_my_family_id());

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Alert family isolation" ON public.alerts;
CREATE POLICY "Alert family isolation" ON public.alerts
  FOR ALL USING (family_id = public.get_my_family_id());

ALTER TABLE public.vitals_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vitals family isolation" ON public.vitals_log;
CREATE POLICY "Vitals family isolation" ON public.vitals_log
  FOR ALL USING (family_id = public.get_my_family_id());

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Medication family isolation" ON public.medications;
CREATE POLICY "Medication family isolation" ON public.medications
  FOR ALL USING (family_id = public.get_my_family_id());

ALTER TABLE public.managed_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Device family isolation" ON public.managed_devices;
CREATE POLICY "Device family isolation" ON public.managed_devices
  FOR ALL USING (family_id = public.get_my_family_id());
