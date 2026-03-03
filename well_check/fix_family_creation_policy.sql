-- FIX: Allow authenticated users to create families
-- The current policy requires the user to already be in a family to access the families table.
-- This prevents the initial family creation.

DROP POLICY IF EXISTS "Family isolation" ON families;

-- Allow users to create (insert) a family
CREATE POLICY "Users can create families" ON families
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow users to view the family they belong to
CREATE POLICY "Users can view their family" ON families
  FOR SELECT TO authenticated
  USING (id = public.get_auth_family_id() OR admin_id = auth.uid());

-- Allow admins to update their family
CREATE POLICY "Admins can update their family" ON families
  FOR UPDATE TO authenticated
  USING (admin_id = auth.uid());
