-- Add range_meters to hotspots table
ALTER TABLE hotspots 
ADD COLUMN range_meters INTEGER NOT NULL DEFAULT 50;

-- Add constraint to ensure range is reasonable (e.g., between 10m and 500m)
ALTER TABLE hotspots
ADD CONSTRAINT valid_range CHECK (range_meters >= 10 AND range_meters <= 500);

COMMENT ON COLUMN hotspots.range_meters IS 'Coverage range of the hotspot in meters';
