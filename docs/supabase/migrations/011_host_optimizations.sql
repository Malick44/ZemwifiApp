-- SemVer: 0.11.0
-- Description: Host Optimizations (Stats RPC) and Storage Policies for KYC

-- ============================================================================
-- 1. HOST STATS RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION get_host_stats(p_host_id UUID)
RETURNS TABLE (
  total_revenue_today BIGINT,
  active_sessions_count INTEGER,
  active_hotspots_count INTEGER,
  total_hotspots_count INTEGER,
  wallet_balance_val BIGINT -- rename to avoid ambiguity
) AS $$
DECLARE
  v_wallet_balance BIGINT;
BEGIN
  -- Get Wallet Balance
  SELECT wallet_balance INTO v_wallet_balance FROM profiles WHERE id = p_host_id;

  RETURN QUERY
  SELECT
    -- Revenue Today (from wallet_transactions of type 'cashin_commission' or 'sales_revenue'?)
    -- Actually, host revenue comes from 'sales_revenue'.
    COALESCE(SUM(amount), 0) as total_revenue_today,
    
    -- Active Sessions (Vouchers used + not expired + belonging to host's hotspots)
    (
        SELECT COUNT(*)::INTEGER 
        FROM vouchers v
        JOIN hotspots h ON v.hotspot_id = h.id
        WHERE h.host_id = p_host_id
          AND v.used_at IS NOT NULL
          AND v.expires_at > NOW()
    ) as active_sessions_count,

    -- Active Hotspots
    (
        SELECT COUNT(*)::INTEGER FROM hotspots 
        WHERE host_id = p_host_id AND is_online = true
    ) as active_hotspots_count,

    -- Total Hotspots
    (
        SELECT COUNT(*)::INTEGER FROM hotspots 
        WHERE host_id = p_host_id
    ) as total_hotspots_count,
    
    COALESCE(v_wallet_balance, 0) as wallet_balance_val

  FROM wallet_transactions
  WHERE user_id = p_host_id
    AND type = 'sales_revenue'
    AND created_at >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 2. STORAGE BUCKET setup (Idempotent)
-- ============================================================================

-- Note: Storage buckets creation via SQL is specific to Supabase and sometimes requires
-- the storage extension or API. We'll add RLS policies assuming bucket 'kyc_documents' exists.
-- If not created, user needs to create it in Dashboard or we use a separate script.
-- Here we try to insert into storage.buckets if permissions allow.

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Hosts can upload their own files
CREATE POLICY "Hosts can upload KYC docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Only Admins can view (and the user who uploaded)
CREATE POLICY "Admins and Owner can view KYC docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text -- Owner
    OR 
    exists (select 1 from profiles where id = auth.uid() and role = 'admin') -- Admin
  )
);
