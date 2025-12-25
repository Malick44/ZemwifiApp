-- Migration: Technician Requests Table and Storage
-- Description: Create technician_requests table and storage bucket for photos

-- ============================================================================
-- PART 1: Create technician_requests table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.technician_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hotspot_id uuid, -- References hotspots table (add FK when hotspots table exists)
  technician_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Request details
  subject text NOT NULL,
  description text NOT NULL,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status text CHECK (status IN ('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')) DEFAULT 'pending',
  
  -- Media
  photo_url text,
  
  -- Status details
  rejection_reason text,
  completion_notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  assigned_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  
  -- Metadata
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'))
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_technician_requests_host_id ON public.technician_requests(host_id);
CREATE INDEX IF NOT EXISTS idx_technician_requests_technician_id ON public.technician_requests(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_requests_status ON public.technician_requests(status);
CREATE INDEX IF NOT EXISTS idx_technician_requests_created_at ON public.technician_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_technician_requests_photo_url ON public.technician_requests(photo_url) WHERE photo_url IS NOT NULL;

-- Enable RLS
ALTER TABLE public.technician_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for technician_requests
DO $$
BEGIN
  -- Hosts can view their own requests
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='technician_requests' 
      AND policyname='Hosts can view their own requests'
  ) THEN
    DROP POLICY "Hosts can view their own requests" ON public.technician_requests;
  END IF;
  
  CREATE POLICY "Hosts can view their own requests"
  ON public.technician_requests
  FOR SELECT TO authenticated
  USING (host_id = (SELECT auth.uid()));

  -- Technicians can view their assigned requests
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='technician_requests' 
      AND policyname='Technicians can view assigned requests'
  ) THEN
    DROP POLICY "Technicians can view assigned requests" ON public.technician_requests;
  END IF;
  
  CREATE POLICY "Technicians can view assigned requests"
  ON public.technician_requests
  FOR SELECT TO authenticated
  USING (technician_id = (SELECT auth.uid()));

  -- Hosts can create requests
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='technician_requests' 
      AND policyname='Hosts can create requests'
  ) THEN
    DROP POLICY "Hosts can create requests" ON public.technician_requests;
  END IF;
  
  CREATE POLICY "Hosts can create requests"
  ON public.technician_requests
  FOR INSERT TO authenticated
  WITH CHECK (host_id = (SELECT auth.uid()));

  -- Hosts can update their own pending/assigned requests
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='technician_requests' 
      AND policyname='Hosts can update own requests'
  ) THEN
    DROP POLICY "Hosts can update own requests" ON public.technician_requests;
  END IF;
  
  CREATE POLICY "Hosts can update own requests"
  ON public.technician_requests
  FOR UPDATE TO authenticated
  USING (host_id = (SELECT auth.uid()) AND status IN ('pending', 'assigned'));

  -- Technicians can update assigned requests
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='technician_requests' 
      AND policyname='Technicians can update assigned requests'
  ) THEN
    DROP POLICY "Technicians can update assigned requests" ON public.technician_requests;
  END IF;
  
  CREATE POLICY "Technicians can update assigned requests"
  ON public.technician_requests
  FOR UPDATE TO authenticated
  USING (technician_id = (SELECT auth.uid()));
END $$;

-- ============================================================================
-- PART 2: Storage Bucket Creation
-- ============================================================================

-- Create bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'technician-requests',
  'technician-requests',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 3: Enable RLS on storage.objects (if not already enabled)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'storage' AND t.tablename = 'objects'
      AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- PART 4: RLS Policies for storage.objects
-- ============================================================================

DO $$
BEGIN
  -- Policy 1: Users can upload request photos
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' 
      AND tablename='objects' 
      AND policyname='Users can upload request photos'
  ) THEN
    DROP POLICY "Users can upload request photos" ON storage.objects;
  END IF;
  
  CREATE POLICY "Users can upload request photos"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'technician-requests'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

  -- Policy 2: Users can view their own request photos
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' 
      AND tablename='objects' 
      AND policyname='Users can view their own request photos'
  ) THEN
    DROP POLICY "Users can view their own request photos" ON storage.objects;
  END IF;
  
  CREATE POLICY "Users can view their own request photos"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'technician-requests'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

  -- Policy 3: Users can delete their own request photos
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' 
      AND tablename='objects' 
      AND policyname='Users can delete their own request photos'
  ) THEN
    DROP POLICY "Users can delete their own request photos" ON storage.objects;
  END IF;
  
  CREATE POLICY "Users can delete their own request photos"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'technician-requests'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

  -- Policy 4: Public read access to request photos
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' 
      AND tablename='objects' 
      AND policyname='Public read access to request photos'
  ) THEN
    DROP POLICY "Public read access to request photos" ON storage.objects;
  END IF;
  
  CREATE POLICY "Public read access to request photos"
  ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'technician-requests');
END $$;

-- ============================================================================
-- PART 5: Trigger for updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_technician_requests_updated_at ON public.technician_requests;

CREATE TRIGGER update_technician_requests_updated_at
  BEFORE UPDATE ON public.technician_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Verification Queries (optional - uncomment to verify)
-- ============================================================================

-- Verify table was created
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'technician_requests'
-- ORDER BY ordinal_position;

-- Verify bucket was created
-- SELECT * FROM storage.buckets WHERE id = 'technician-requests';

-- Verify policies
-- SELECT schemaname, tablename, policyname, roles, cmd
-- FROM pg_policies 
-- WHERE (schemaname = 'public' AND tablename = 'technician_requests')
--    OR (schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%request photos%')
-- ORDER BY schemaname, tablename, policyname;
