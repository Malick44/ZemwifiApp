-- ZemNet Database Schema - Ratings Migration
-- Created: 2025-12-18
-- Description: Ratings and reviews system for hosts and technicians

-- ============================================================================
-- RATINGS TABLE
-- ============================================================================

-- Ratings table (for hosts and technicians)
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rated_entity_id UUID NOT NULL, -- ID of the host or technician being rated
  rated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_by_user_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('host', 'technician')),
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  related_purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  related_service_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user can only rate once per purchase/service request
  CONSTRAINT unique_purchase_rating UNIQUE NULLS NOT DISTINCT (related_purchase_id, rated_by_user_id),
  CONSTRAINT unique_service_rating UNIQUE NULLS NOT DISTINCT (related_service_request_id, rated_by_user_id),
  
  -- Ensure either purchase or service request is set, but not both
  CONSTRAINT rating_reference CHECK (
    (related_purchase_id IS NOT NULL AND related_service_request_id IS NULL) OR
    (related_purchase_id IS NULL AND related_service_request_id IS NOT NULL)
  )
);

-- Indexes for ratings
CREATE INDEX idx_ratings_entity ON ratings(rated_entity_id, type);
CREATE INDEX idx_ratings_user ON ratings(rated_by_user_id);
CREATE INDEX idx_ratings_purchase ON ratings(related_purchase_id);
CREATE INDEX idx_ratings_service_request ON ratings(related_service_request_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to calculate average rating for a user (host or technician)
CREATE OR REPLACE FUNCTION calculate_user_rating(user_id_param UUID, type_param VARCHAR)
RETURNS TABLE(average_rating NUMERIC, total_ratings BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(stars)::NUMERIC, 2) AS average_rating,
    COUNT(*)::BIGINT AS total_ratings
  FROM ratings
  WHERE rated_entity_id = user_id_param AND type = type_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent ratings for a user
CREATE OR REPLACE FUNCTION get_user_ratings(
  user_id_param UUID,
  type_param VARCHAR,
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  rated_by_user_name VARCHAR,
  stars INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.rated_by_user_name,
    r.stars,
    r.comment,
    r.created_at
  FROM ratings r
  WHERE r.rated_entity_id = user_id_param AND r.type = type_param
  ORDER BY r.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can rate a purchase
CREATE OR REPLACE FUNCTION can_rate_purchase(
  purchase_id_param UUID,
  user_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  purchase_exists BOOLEAN;
  already_rated BOOLEAN;
BEGIN
  -- Check if purchase exists and belongs to user
  SELECT EXISTS (
    SELECT 1 FROM purchases
    WHERE id = purchase_id_param AND user_id = user_id_param
  ) INTO purchase_exists;
  
  IF NOT purchase_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already rated
  SELECT EXISTS (
    SELECT 1 FROM ratings
    WHERE related_purchase_id = purchase_id_param AND rated_by_user_id = user_id_param
  ) INTO already_rated;
  
  RETURN NOT already_rated;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can rate a service request
CREATE OR REPLACE FUNCTION can_rate_service_request(
  service_request_id_param UUID,
  user_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  request_completed BOOLEAN;
  already_rated BOOLEAN;
  is_host BOOLEAN;
BEGIN
  -- Check if service request is completed and user is the host
  SELECT EXISTS (
    SELECT 1 FROM service_requests
    WHERE id = service_request_id_param 
      AND host_id = user_id_param
      AND status = 'completed'
  ) INTO request_completed;
  
  IF NOT request_completed THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already rated
  SELECT EXISTS (
    SELECT 1 FROM ratings
    WHERE related_service_request_id = service_request_id_param 
      AND rated_by_user_id = user_id_param
  ) INTO already_rated;
  
  RETURN NOT already_rated;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all ratings
CREATE POLICY "Users can view all ratings"
  ON ratings FOR SELECT
  USING (true);

-- Policy: Users can create ratings for their own purchases
CREATE POLICY "Users can rate their purchases"
  ON ratings FOR INSERT
  WITH CHECK (
    rated_by_user_id = auth.uid() AND
    type = 'host' AND
    related_purchase_id IS NOT NULL AND
    can_rate_purchase(related_purchase_id, auth.uid())
  );

-- Policy: Hosts can rate technicians for their service requests
CREATE POLICY "Hosts can rate technicians"
  ON ratings FOR INSERT
  WITH CHECK (
    rated_by_user_id = auth.uid() AND
    type = 'technician' AND
    related_service_request_id IS NOT NULL AND
    can_rate_service_request(related_service_request_id, auth.uid())
  );

-- Policy: Users can update their own ratings within 24 hours
CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  USING (
    rated_by_user_id = auth.uid() AND
    created_at > NOW() - INTERVAL '24 hours'
  )
  WITH CHECK (
    rated_by_user_id = auth.uid()
  );

-- Policy: Users can delete their own ratings within 24 hours
CREATE POLICY "Users can delete own ratings"
  ON ratings FOR DELETE
  USING (
    rated_by_user_id = auth.uid() AND
    created_at > NOW() - INTERVAL '24 hours'
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ratings IS 'User ratings and reviews for hosts and technicians';
COMMENT ON COLUMN ratings.rated_entity_id IS 'ID of the user (host or technician) being rated';
COMMENT ON COLUMN ratings.type IS 'Type of rating: host or technician';
COMMENT ON COLUMN ratings.stars IS 'Rating value from 1 to 5 stars';
COMMENT ON COLUMN ratings.related_purchase_id IS 'Reference to purchase if rating a host';
COMMENT ON COLUMN ratings.related_service_request_id IS 'Reference to service request if rating a technician';
