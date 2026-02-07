-- Migration: Fix technician_requests missing foreign keys
-- The table was created with FKs to auth.users (invisible to PostgREST).
-- We need FKs to public.profiles and public.hotspots for joins to work.
-- ============================================================================

-- Step 1: Drop the old FKs pointing to auth.users (if they exist)
-- These are invisible to PostgREST and cause PGRST200 errors
ALTER TABLE public.technician_requests
  DROP CONSTRAINT IF EXISTS technician_requests_host_id_fkey;

ALTER TABLE public.technician_requests
  DROP CONSTRAINT IF EXISTS technician_requests_technician_id_fkey;

ALTER TABLE public.technician_requests
  DROP CONSTRAINT IF EXISTS technician_requests_hotspot_id_fkey;

-- Step 2: Add proper FKs to public.profiles and public.hotspots
-- These names MUST match what the app code references in PostgREST join hints

-- host_id -> profiles.id
ALTER TABLE public.technician_requests
  ADD CONSTRAINT technician_requests_host_id_fkey
  FOREIGN KEY (host_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- technician_id -> profiles.id (nullable, so SET NULL on delete)
ALTER TABLE public.technician_requests
  ADD CONSTRAINT technician_requests_technician_id_fkey
  FOREIGN KEY (technician_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- hotspot_id -> hotspots.id (nullable)
ALTER TABLE public.technician_requests
  ADD CONSTRAINT technician_requests_hotspot_id_fkey
  FOREIGN KEY (hotspot_id) REFERENCES public.hotspots(id) ON DELETE SET NULL;

-- Step 3: Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
