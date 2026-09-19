-- ============================================================
-- FIX RLS POLICIES FOR HAEMAX ADMIN PANEL
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- STEP 1: Drop the problematic recursive policies on profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- STEP 2: Create a security-definer function to check if user is admin
-- This avoids the infinite recursion caused by policies that query the same table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- STEP 3: Recreate clean, non-recursive RLS policies

-- Users can view their own profile OR admin can view all
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile OR admin can update any
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Allow users to insert their own profile on signup
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- STEP 4: Ensure admin can update donor status (for Donor Approval)
-- Drop and recreate donor update policy cleanly
DROP POLICY IF EXISTS "Admin can update donors" ON public.donors;

CREATE POLICY "donors_update_policy"
  ON public.donors FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- STEP 5: Ensure admin can manage hospitals
DROP POLICY IF EXISTS "Admin can manage hospitals" ON public.hospitals;

CREATE POLICY "hospitals_admin_policy"
  ON public.hospitals FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- STEP 6: Make yourself admin (replace with YOUR actual email)
-- UPDATE public.profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'arjunbb441@gmail.com');
--
-- OR run via Supabase Dashboard > Authentication > Users
-- Find your user > copy their UUID, then:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<your-uuid-here>';
-- ============================================================

-- VERIFY: Check your profile's role
-- SELECT id, fname, role, status FROM public.profiles;
