-- Migration: KYC Submissions and Host Dashboard Stats
-- Created: 2025-12-26
-- Description: Adds KYC table, storage bucket, and host dashboard stats RPC

-- ============================================================================
-- 1. KYC SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Info
  full_name text NOT NULL,
  id_number text NOT NULL,
  address text NOT NULL,
  
  -- Document URLs
  id_card_url text NOT NULL, -- Path in storage
  selfie_url text NOT NULL, -- Path in storage
  
  -- Status
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  -- Admin Review
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes text,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);

-- RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC submissions"
  ON public.kyc_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC submissions"
  ON public.kyc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view/update all (handled by admin role policies usually, but explicitly:)
CREATE POLICY "Admins can view all KYC submissions"
  ON public.kyc_submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update KYC submissions"
  ON public.kyc_submissions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- 2. KYC DOCUMENTS STORAGE
-- ============================================================================

-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false, -- PRIVATE BUCKET for sensitive docs
  10485760, -- 10MB limit (high quality photos)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS

-- Users can upload their own files
CREATE POLICY "Users can upload own KYC docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own files
CREATE POLICY "Users can view own KYC docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all files
CREATE POLICY "Admins can view all KYC docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );



-- ============================================================================
-- 3. PAYOUTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES public.profiles(id) NOT NULL,
  amount bigint NOT NULL,
  status text CHECK (status IN ('pending', 'processing', 'paid', 'failed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view own payouts"
  ON public.payouts FOR SELECT
  USING (auth.uid() = host_id);


-- ============================================================================
-- 4. HOST DASHBOARD STATS RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION get_host_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (postgres) to access data securely
AS $$
DECLARE
  v_host_id uuid;
  v_stats jsonb;
  
  v_total_earnings bigint;
  v_today_earnings bigint;
  v_active_hotspots int;
  v_active_sessions int;
  v_total_sales int;
  v_pending_payouts bigint;
BEGIN
  v_host_id := auth.uid();
  
  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Earnings (Sum of successful purchases)
  SELECT COALESCE(SUM(amount_xof), 0), COUNT(id)
  INTO v_total_earnings, v_total_sales
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND status = 'confirmed';

  -- 2. Today's Earnings
  SELECT COALESCE(SUM(amount_xof), 0)
  INTO v_today_earnings
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND status = 'confirmed'
  AND created_at >= CURRENT_DATE;

  -- 3. Active Hotspots
  SELECT COUNT(*)
  INTO v_active_hotspots
  FROM public.hotspots
  WHERE host_id = v_host_id
  AND is_online = true;

  -- 4. Active Sessions (Valid vouchers currently in use)
  -- Logic: Voucher is used (used_at is set) AND has not expired yet
  SELECT COUNT(*)
  INTO v_active_sessions
  FROM public.vouchers v
  JOIN public.hotspots h ON v.hotspot_id = h.id
  WHERE h.host_id = v_host_id
  AND v.used_at IS NOT NULL
  AND v.expires_at > now();

  -- 5. Pending Payouts
  SELECT COALESCE(SUM(amount), 0)
  INTO v_pending_payouts
  FROM public.payouts -- Assuming table name is 'payouts' or 'payout_requests' - standardized to 'payouts' based on previous context
  WHERE host_id = v_host_id
  AND status = 'pending';

  -- Construct JSON response
  v_stats := jsonb_build_object(
    'totalEarnings', v_total_earnings,
    'todayEarnings', v_today_earnings,
    'activeHotspots', v_active_hotspots,
    'activeSessions', v_active_sessions,
    'totalSales', v_total_sales,
    'pendingPayouts', v_pending_payouts
  );

  RETURN v_stats;
END;
$$;
