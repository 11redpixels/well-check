-- FIX: Allow profile creation for new users
-- Current policy requires own auth_id or matching family_id.
-- Let's ensure INSERT is explicitly allowed for the user's own profile.

DROP POLICY IF EXISTS "Profiles own access" ON public.profiles;

CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());
