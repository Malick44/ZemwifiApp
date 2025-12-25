# Development Seed Data

## Mock Hotspots for iOS Simulator Testing

### Quick Start

1. **Run the seed file in Supabase SQL Editor:**
   ```sql
   -- Copy and paste the contents of 20251224_seed_dev_hotspots.sql
   ```

2. **What it does:**
   - Updates existing Ouagadougou hotspots with SF coordinates
   - Uses real host IDs and hotspot data from your database
   - Preserves all metadata (names, SSIDs, hours, etc.)

### What Gets Created

4 real hotspots from Ouagadougou, relocated to **San Francisco** for testing:

| Name | Distance | Status | Original Location |
|------|----------|--------|-------------------|
| Café du Centre | 500m | Online | Ouagadougou |
| Restaurant Chez Maman | 2km | Online | Ouagadougou |
| Bibliothèque Municipale | 1km | Online | Ouagadougou |
| Hôtel La Paix | 8km | Online | Ouagadougou |

### Testing on Simulator

1. Run app on iOS Simulator (defaults to SF: 37.785834, -122.406417)
2. Open Map screen
3. You should see **4 green markers** around you
4. Tap markers to verify:
   - Distance calculations (500m, 1km, 2km, 8km)
   - French names and landmarks display correctly
   - Bottom sheet shows proper formatting

### Reverting to Real Coordinates

To restore Ouagadougou coordinates:
```sql
UPDATE public.hotspots SET
  lat = 12.37142770, lng = -1.51966030
WHERE id = '10000000-0000-0000-0002-000000000001';

UPDATE public.hotspots SET
  lat = 12.36780000, lng = -1.52720000
WHERE id = '10000000-0000-0000-0002-000000000002';

UPDATE public.hotspots SET
  lat = 12.36650000, lng = -1.53040000
WHERE id = '10000000-0000-0000-0002-000000000003';

UPDATE public.hotspots SET
  lat = 12.38910000, lng = -1.50890000
WHERE id = '10000000-0000-0000-0002-000000000004';

-- Refresh location column
UPDATE public.hotspots
SET location = st_setsrid(st_makepoint(lng::double precision, lat::double precision), 4326)::geography
WHERE id IN (
  '10000000-0000-0000-0002-000000000001',
  '10000000-0000-0000-0002-000000000002',
  '10000000-0000-0000-0002-000000000003',
  '10000000-0000-0000-0002-000000000004'
);
```
