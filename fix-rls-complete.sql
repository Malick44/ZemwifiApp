-- Fix RLS policies to allow system/service_role operations
-- This solves the "new row violates row-level security policy" error

-- 1. Allow service_role to insert any profile (for triggers and seeds)
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2. Allow authenticated users to insert their own profile (fallback)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- 3. Allow authenticated users to read their own profile  
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 5. Allow service_role to read all profiles (for admin operations)
DROP POLICY IF EXISTS "System can read all profiles" ON profiles;
CREATE POLICY "System can read all profiles"
  ON profiles FOR SELECT
  TO service_role
  USING (true);

-- 6. Allow service_role to update any profile (for admin operations)
DROP POLICY IF EXISTS "System can update profiles" ON profiles;
CREATE POLICY "System can update profiles"
  ON profiles FOR UPDATE
  TO service_role
  USING (true);

-- 7. Fix the handle_new_user trigger to work properly
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
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure function runs as postgres (superuser) to bypass RLS
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON public.profiles TO authenticated, service_role;

COMMENT ON POLICY "System can insert profiles" ON profiles IS 
  'Allows service_role and triggers to insert profiles bypassing user-level RLS';

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates profile when user signs up. Runs as SECURITY DEFINER to bypass RLS.';
