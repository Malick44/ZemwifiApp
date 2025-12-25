-- Enable PostGIS
create extension if not exists postgis;

-- 1. Schema Change: Add location column
alter table public.hotspots
  add column if not exists location geography(Point, 4326);

-- 2. Backfill Data: Populate location from lat/lng
update public.hotspots
set location = st_setsrid(st_makepoint(lng::double precision, lat::double precision), 4326)::geography
where location is null and lat is not null and lng is not null;

-- 3. Indexing: Create index for fast spatial queries
create index if not exists idx_hotspots_location_gist
  on public.hotspots using gist (location);

-- 4. RPC Function: Create the optimized nearby_hotspots function
create or replace function public.nearby_hotspots(
  lat double precision,
  lng double precision,
  radius_m integer default 3000
)
returns table (
  id uuid,
  host_id uuid,
  name text,
  landmark text,
  address text,
  ssid text,
  lat double precision,
  lng double precision,
  distance_m double precision,
  online boolean
)
language sql
stable
as $$
  with origin as (
    select st_setsrid(st_makepoint(lng, lat), 4326)::geography as g
  )
  select
    h.id,
    h.host_id,
    h.name,
    h.landmark,
    h.address,
    h.ssid,
    st_y(h.location::geometry) as lat,
    st_x(h.location::geometry) as lng,
    st_distance(h.location, o.g) as distance_m,
    -- Online Logic: True if manually set OR heartbeat within last 5 mins
    (h.is_online = true OR (now() - h.updated_at) < interval '5 minutes') as online
  from public.hotspots h
  cross join origin o
  where h.location is not null
    -- Filter out paused sales (equivalent to "active" in this context)
    and h.sales_paused = false
    and st_dwithin(h.location, o.g, radius_m)
  order by distance_m asc
  limit 200;
$$;

-- 5. Trigger: Keep location in sync on INSERT/UPDATE
create or replace function public.set_hotspot_location()
returns trigger
language plpgsql
as $$
begin
  if new.lat is not null and new.lng is not null then
    new.location := st_setsrid(st_makepoint(new.lng::double precision, new.lat::double precision), 4326)::geography;
  else
    new.location := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_hotspots_set_location on public.hotspots;
create trigger trg_hotspots_set_location
before insert or update of lat, lng on public.hotspots
for each row execute function public.set_hotspot_location();
