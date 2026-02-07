-- Migration: Add country_code to profiles
-- Stores ISO 3166-1 alpha-2 code, derived from phone dial code at registration
-- Default 'BF' for existing Burkina Faso users
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(3) DEFAULT 'BF';

COMMENT ON COLUMN public.profiles.country_code IS
  'ISO 3166-1 alpha-2 country code, derived from phone dial code at registration';

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
