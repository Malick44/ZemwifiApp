-- Migration: Fix Legacy Enum and Dashboard Stats V2
-- Description: Adds 'confirmed' to legacy payment_status enum if missing, and creates a robust V2 RPC for stats.

-- 1. Attempt to add 'confirmed' to payment_status enum if it exists and lacks it
DO $$
BEGIN
    -- Check if type exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        -- We cannot easily check if value exists in safe SQL without erroring if we try to add it.
        -- But we can catch the error if we wrap strictly.
        -- Alternatively, just casting to text in the RPC is safer than modifying types blindly.
        -- But let's try to add it for correctness.
        ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'confirmed';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- already exists, ignore
        NULL;
    WHEN OTHERS THEN
        -- ignore other errors (like if it's not an enum but we thought it was)
        NULL;
END $$;

-- 2. Create V2 RPC that is robust against Enum mismatches by casting to text
CREATE OR REPLACE FUNCTION get_host_dashboard_stats_v2()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- 1. Earnings (Check both 'success' and 'confirmed' safely)
  SELECT 
    COALESCE(SUM(amount_xof), 0)::bigint, 
    COUNT(id)::int
  INTO v_total_earnings, v_total_sales
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND (status::text = 'confirmed' OR status::text = 'success');

  -- 2. Today's Earnings
  SELECT COALESCE(SUM(amount_xof), 0)::bigint
  INTO v_today_earnings
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND (status::text = 'confirmed' OR status::text = 'success')
  AND created_at >= CURRENT_DATE;

  -- 3. Active Hotspots
  SELECT COUNT(*)::int
  INTO v_active_hotspots
  FROM public.hotspots
  WHERE host_id = v_host_id
  AND is_online = true;

  -- 4. Active Sessions
  SELECT COUNT(*)::int
  INTO v_active_sessions
  FROM public.vouchers v
  JOIN public.hotspots h ON v.hotspot_id = h.id
  WHERE h.host_id = v_host_id
  AND v.used_at IS NOT NULL
  AND v.expires_at > now();

  -- 5. Pending Payouts
  SELECT COALESCE(SUM(amount_xof), 0)::bigint
  INTO v_pending_payouts
  FROM public.payouts
  WHERE host_id = v_host_id
  AND status = 'pending';

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
