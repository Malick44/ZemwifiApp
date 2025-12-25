-- Development Seed: Mock Hotspots near SF (iOS Simulator Default Location)
-- Location: 37.785834, -122.406417 (San Francisco)
-- Using real Ouagadougou hotspot data with SF coordinates for testing
-- Run this ONLY in development environment

INSERT INTO public.hotspots (
  id,
  host_id,
  name,
  landmark,
  address,
  ssid,
  lat,
  lng,
  is_online,
  sales_paused,
  hours,
  created_at,
  updated_at
) VALUES
  -- Hotspot 1: Café du Centre (500m north)
  (
    '10000000-0000-0000-0002-000000000001'::uuid,
    'f05a7ab6-acbb-416a-af8d-c23f9c362599'::uuid,
    'Café du Centre',
    'Près du marché central, Avenue Kwame Nkrumah',
    'Avenue Kwame Nkrumah, Ouagadougou',
    'ZemNet-CafeduCentre',
    37.790334,  -- ~500m north of SF default
    -122.406417,
    true,
    false,
    '08:00 - 22:00',
    '2025-10-25 05:43:08.256+00'::timestamptz,
    now()
  ),
  
  -- Hotspot 2: Restaurant Chez Maman (2km east)
  (
    '10000000-0000-0000-0002-000000000002'::uuid,
    'f05a7ab6-acbb-416a-af8d-c23f9c362599'::uuid,
    'Restaurant Chez Maman',
    'Zone 1, à côté de la grande mosquée',
    'Zone 1, Ouagadougou',
    'ZemNet-ChezMaman',
    37.785834,
    -122.386417,  -- ~2km east
    true,
    false,
    '10:00 - 23:00',
    '2025-11-09 05:43:08.267+00'::timestamptz,
    now()
  ),
  
  -- Hotspot 3: Bibliothèque Municipale (1km west)
  (
    '10000000-0000-0000-0002-000000000003'::uuid,
    'f05a7ab6-acbb-416a-af8d-c23f9c362599'::uuid,
    'Bibliothèque Municipale',
    'Avenue de la Nation, près du rond-point des Nations Unies',
    'Avenue de la Nation, Ouagadougou',
    'ZemNet-BiblioMunicipale',
    37.785834,
    -122.426417,  -- ~1km west
    true,
    false,
    '08:00 - 20:00',
    '2025-11-24 05:43:08.267+00'::timestamptz,
    now()
  ),
  
  -- Hotspot 4: Hôtel La Paix (8km south)
  (
    '10000000-0000-0000-0002-000000000004'::uuid,
    '6aea9423-7146-4e37-9f45-e9d31e6d46b7'::uuid,
    'Hôtel La Paix',
    'Quartier Gounghin, Route de Kaya',
    'Route de Kaya, Ouagadougou',
    'ZemNet-HotelLaPaix',
    37.715834,  -- ~8km south
    -122.406417,
    true,
    false,
    '24/7',
    '2025-12-04 05:43:08.267+00'::timestamptz,
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  updated_at = now();

-- Update location column using the trigger we created earlier
-- (The trigger should auto-populate, but we can force it here)
UPDATE public.hotspots
SET location = st_setsrid(st_makepoint(lng::double precision, lat::double precision), 4326)::geography
WHERE id IN (
  '10000000-0000-0000-0002-000000000001',
  '10000000-0000-0000-0002-000000000002',
  '10000000-0000-0000-0002-000000000003',
  '10000000-0000-0000-0002-000000000004'
);
