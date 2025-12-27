-- Migration: Fix Schema Mismatches (Legacy vs Canonical)
-- Description: Renames legacy columns to match canonical schema and recreates dependent RPCs.

-- 1. Fix PLANS table columns
DO $$ 
BEGIN
  -- Rename duration_seconds -> duration_s
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'duration_seconds') THEN
    ALTER TABLE public.plans RENAME COLUMN duration_seconds TO duration_s;
  END IF;

  -- Rename price -> price_xof (if legacy exists)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'price') THEN
    ALTER TABLE public.plans RENAME COLUMN price TO price_xof;
  END IF;
  
  -- Add data_cap_bytes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'data_cap_bytes') THEN
    ALTER TABLE public.plans ADD COLUMN data_cap_bytes bigint;
  END IF;
END $$;

-- 2. Fix PURCHASES table columns
DO $$ 
BEGIN
  -- Rename amount -> amount_xof
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'amount') THEN
    ALTER TABLE public.purchases RENAME COLUMN amount TO amount_xof;
  END IF;

  -- Rename payment_status -> status
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_status') THEN
    ALTER TABLE public.purchases RENAME COLUMN payment_status TO status;
  END IF;
  
  -- Rename payment_provider -> provider
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_provider') THEN
    ALTER TABLE public.purchases RENAME COLUMN payment_provider TO provider;
  END IF;
END $$;

-- 2.b Fix PAYOUTS table columns
DO $$ 
BEGIN
  -- Rename amount -> amount_xof
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payouts' AND column_name = 'amount') THEN
    ALTER TABLE public.payouts RENAME COLUMN amount TO amount_xof;
  END IF;
END $$;

-- 3. Re-create nearby_hotspots RPC (using canonical names and prefixed params)
-- Drop potential previous signatures
DROP FUNCTION IF EXISTS nearby_hotspots(float, float, int);
DROP FUNCTION IF EXISTS nearby_hotspots(double precision, double precision, integer);

CREATE OR REPLACE FUNCTION nearby_hotspots(
  p_lat float,
  p_lng float,
  p_radius_m int
)
RETURNS TABLE (
  hotspot_id uuid,
  name text,
  landmark text,
  latitude float,
  longitude float,
  distance_m float,
  is_online boolean,
  sales_paused boolean,
  min_price_xof bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.name::text,
    h.landmark::text,
    st_y(h.location::geometry) as latitude,
    st_x(h.location::geometry) as longitude,
    st_distance(h.location, st_point(p_lng, p_lat)::geography) as distance_m,
    COALESCE(h.is_online, false) as is_online,
    COALESCE(h.sales_paused, false) as sales_paused,
    MIN(p.price_xof)::bigint as min_price_xof
  FROM public.hotspots h
  LEFT JOIN public.plans p ON p.hotspot_id = h.id AND p.is_active = true
  WHERE st_dwithin(h.location, st_point(p_lng, p_lat)::geography, p_radius_m)
  GROUP BY h.id
  ORDER BY distance_m ASC;
END;
$$;

-- 4. Re-create get_host_dashboard_stats RPC (using canonical names)
DROP FUNCTION IF EXISTS get_host_dashboard_stats();

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

  -- 1. Earnings
  SELECT 
    COALESCE(SUM(amount_xof), 0)::bigint, 
    COUNT(id)::int
  INTO v_total_earnings, v_total_sales
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND status = 'confirmed';

  -- 2. Today's Earnings
  SELECT COALESCE(SUM(amount_xof), 0)::bigint
  INTO v_today_earnings
  FROM public.purchases
  WHERE hotspot_id IN (SELECT id FROM public.hotspots WHERE host_id = v_host_id)
  AND status = 'confirmed'
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
  -- Using amount_xof (canonical)
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
