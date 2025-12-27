-- Migration: Fix Host Dashboard Stats Enum Crash
-- Description: Updates get_host_dashboard_stats to use 'success' instead of 'confirmed' to match the payment_status enum.

CREATE OR REPLACE FUNCTION get_host_dashboard_stats()
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

  -- 1. Earnings (Use 'success' to avoid enum error)
  SELECT 
    COALESCE(SUM(amount_xof), 0)::bigint, 
    COUNT(id)::int
  INTO v_total_earnings, v_total_sales
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND status = 'success';

  -- 2. Today's Earnings
  SELECT COALESCE(SUM(amount_xof), 0)::bigint
  INTO v_today_earnings
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND status = 'success'
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
