-- ============================================================
-- FIX FOR MISSING EMAIL COLUMN IN PROFILES TABLE
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Add the missing email column so AdminDashboard and services can properly use it.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
