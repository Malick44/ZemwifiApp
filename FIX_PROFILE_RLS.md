# Profile Creation RLS Issue - Quick Fix Guide

## Problem
Error: "new row violates row-level security policy for table 'profiles'"

This happens because the `handle_new_user()` trigger can't create profiles due to RLS policies.

## Solution Options

### Option 1: Fix via Supabase Dashboard (RECOMMENDED)

1. Go to https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste and run this SQL:

```sql
-- Fix the handle_new_user trigger to bypass RLS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
```

5. Click **Run** (or press Cmd/Ctrl + Enter)

### Option 2: Alternative - Manual Profile Creation in Auth Flow

If the trigger still doesn't work, we can create profiles manually in the app code after signup.

## Verification

After applying the fix, try signing up again with a phone number. The error should be gone.

## Root Cause

The issue occurs because:
1. Supabase Auth creates a user in `auth.users` table
2. The trigger tries to create a profile in `public.profiles`
3. RLS policies block the insertion because the trigger doesn't have proper privileges
4. The fix adds `SECURITY DEFINER` and proper exception handling to bypass RLS

## Additional Policy (Already Added Above)

The policy "Users can insert own profile" allows authenticated users to create their own profile row, which serves as a fallback if the trigger fails.
