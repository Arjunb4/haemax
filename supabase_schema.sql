-- ============================================================
-- HAEMAX BLOOD BANK - Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- ============================================================

-- 1. PROFILES TABLE (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  fname      TEXT,
  lname      TEXT,
  phone      TEXT,
  profile_pic TEXT,
  blood_group TEXT,
  last_donated TEXT DEFAULT 'Never',
  role       TEXT DEFAULT 'user',
  status     TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow new users to insert their profile on signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin can update all profiles
CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================

-- 2. DONORS TABLE
CREATE TABLE IF NOT EXISTS public.donors (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT NOT NULL,
  blood_type        TEXT NOT NULL,
  gender            TEXT,
  weight            NUMERIC,
  dob               DATE,
  last_donated_date DATE,
  city              TEXT,
  district          TEXT,
  availability      BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Anyone can read donors (for search)
CREATE POLICY "Anyone can view donors"
  ON public.donors FOR SELECT
  USING (TRUE);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can register as donor"
  ON public.donors FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================

-- 3. RECEIVERS TABLE
CREATE TABLE IF NOT EXISTS public.receivers (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  district   TEXT,
  city       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.receivers ENABLE ROW LEVEL SECURITY;

-- Anyone can read receivers
CREATE POLICY "Anyone can view receivers"
  ON public.receivers FOR SELECT
  USING (TRUE);

-- Anyone can insert a receiver request (no login needed)
CREATE POLICY "Anyone can submit receiver request"
  ON public.receivers FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================

-- 4. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  location         TEXT,
  contact          TEXT,
  available_beds   INTEGER DEFAULT 0,
  blood_inventory  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Anyone can view hospitals
CREATE POLICY "Anyone can view hospitals"
  ON public.hospitals FOR SELECT
  USING (TRUE);

-- Only admins can insert/update/delete hospitals
CREATE POLICY "Admin can manage hospitals"
  ON public.hospitals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- DONE! Tables created.
-- 
-- NEXT STEPS:
-- 1. To make yourself admin, run this (replace with your email):
--    UPDATE public.profiles SET role = 'admin' WHERE id = (
--      SELECT id FROM auth.users WHERE email = 'your-email@example.com'
--    );
--
-- 2. In Supabase Dashboard > Authentication > Providers:
--    - Enable "Email" provider (already on by default)
--    - Enable "Google" provider and add your Google Client ID + Secret
-- ============================================================
