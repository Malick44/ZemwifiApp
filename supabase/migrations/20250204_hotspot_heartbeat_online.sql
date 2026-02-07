-- Heartbeat-based online status for hotspots.

drop function if exists public.nearby_hotspots(double precision, double precision, integer);
drop function if exists public.nearby_hotspots(real, real, integer);

create or replace function public.refresh_hotspot_online_status(
  p_grace interval default interval '5 minutes'
)
returns void
language sql
security definer
as $$
  update public.hotspots as h
  set is_online = (h.last_seen_at is not null and h.last_seen_at >= now() - p_grace)
  where h.is_online is distinct from (h.last_seen_at is not null and h.last_seen_at >= now() - p_grace);
$$;

create or replace function public.nearby_hotspots(
  p_lat float,
  p_lng float,
  radius_m int
)
returns table (
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
language plpgsql
security definer
as $$
begin
  update public.hotspots as h
  set is_online = (h.last_seen_at is not null and h.last_seen_at >= now() - interval '5 minutes')
  where h.location is not null
    and st_dwithin(h.location, st_point(p_lng, p_lat)::geography, radius_m)
    and h.is_online is distinct from (h.last_seen_at is not null and h.last_seen_at >= now() - interval '5 minutes');

  return query
  select
    h.id,
    h.name::text,
    h.landmark::text,
    st_y(h.location::geometry) as latitude,
    st_x(h.location::geometry) as longitude,
    st_distance(h.location, st_point(p_lng, p_lat)::geography) as distance_m,
    (h.last_seen_at is not null and h.last_seen_at >= now() - interval '5 minutes') as is_online,
    coalesce(h.sales_paused, false) as sales_paused,
    min(p.price_xof)::bigint as min_price_xof
  from public.hotspots h
  left join public.plans p on p.hotspot_id = h.id and p.is_active = true
  where h.location is not null
    and st_dwithin(h.location, st_point(p_lng, p_lat)::geography, radius_m)
  group by h.id
  order by distance_m asc;
end;
$$;

create or replace function public.get_host_dashboard_stats()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_host_id uuid;
  v_stats jsonb;

  v_total_earnings bigint;
  v_today_earnings bigint;
  v_active_hotspots int;
  v_active_sessions int;
  v_total_sales int;
  v_pending_payouts bigint;
begin
  v_host_id := auth.uid();

  if v_host_id is null then
    raise exception 'Not authenticated';
  end if;

  perform public.refresh_hotspot_online_status();

  -- 1. Earnings
  select
    coalesce(sum(amount_xof), 0)::bigint,
    count(id)::int
  into v_total_earnings, v_total_sales
  from public.purchases
  where hotspot_id in (select id from public.hotspots where host_id = v_host_id)
  and status in ('confirmed', 'success');

  -- 2. Today's Earnings
  select coalesce(sum(amount_xof), 0)::bigint
  into v_today_earnings
  from public.purchases
  where hotspot_id in (select id from public.hotspots where host_id = v_host_id)
  and status in ('confirmed', 'success')
  and created_at >= current_date;

  -- 3. Active Hotspots
  select count(*)::int
  into v_active_hotspots
  from public.hotspots
  where host_id = v_host_id
  and is_online = true;

  -- 4. Active Sessions
  select count(*)::int
  into v_active_sessions
  from public.vouchers v
  join public.hotspots h on v.hotspot_id = h.id
  where h.host_id = v_host_id
  and v.used_at is not null
  and v.expires_at > now();

  -- 5. Pending Payouts
  select coalesce(sum(amount_xof), 0)::bigint
  into v_pending_payouts
  from public.payouts
  where host_id = v_host_id
  and status = 'pending';

  v_stats := jsonb_build_object(
    'totalEarnings', v_total_earnings,
    'todayEarnings', v_today_earnings,
    'activeHotspots', v_active_hotspots,
    'activeSessions', v_active_sessions,
    'totalSales', v_total_sales,
    'pendingPayouts', v_pending_payouts
  );

  return v_stats;
end;
$$;
