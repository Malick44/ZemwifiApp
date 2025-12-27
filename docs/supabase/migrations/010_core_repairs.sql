-- SemVer: 0.10.0
-- Description: Core repairs for Store<->DB alignment, Router Heartbeat, and Secrets

-- ============================================================================
-- 1. HOTSPOT SECRETS & HEARTBEAT
-- ============================================================================

-- Add last_seen_at to hotspots if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'last_seen_at') THEN
        ALTER TABLE hotspots ADD COLUMN last_seen_at TIMESTAMPTZ;
    END IF;
END $$;

-- Table for hotspot secrets (Key for signing vouchers)
CREATE TABLE IF NOT EXISTS hotspot_secrets (
    hotspot_id UUID PRIMARY KEY REFERENCES hotspots(id) ON DELETE CASCADE,
    secret TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for secrets (Strictly private)
ALTER TABLE hotspot_secrets ENABLE ROW LEVEL SECURITY;
-- Only admin or specific backend functions can access. No public access.
CREATE POLICY "Deny all public access" ON hotspot_secrets FOR ALL USING (false);

-- Function to auto-generate secret on hotspot creation
CREATE OR REPLACE FUNCTION generate_hotspot_secret()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO hotspot_secrets (hotspot_id, secret)
    VALUES (NEW.id, encode(gen_random_bytes(32), 'hex'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create secret when hotspot is created
DROP TRIGGER IF EXISTS trigger_generate_hotspot_secret ON hotspots;
CREATE TRIGGER trigger_generate_hotspot_secret
    AFTER INSERT ON hotspots
    FOR EACH ROW
    EXECUTE FUNCTION generate_hotspot_secret();

-- Backfill secrets for existing hotspots
INSERT INTO hotspot_secrets (hotspot_id, secret)
SELECT id, encode(gen_random_bytes(32), 'hex')
FROM hotspots
WHERE id NOT IN (SELECT hotspot_id FROM hotspot_secrets);

-- Function: Router Heartbeat
-- Called by the router to prove it's online.
-- Authenticated via the shared secret passed as a parameter (or header in edge function wrapper).
-- For this DB function, we assume the caller has already verified credentials or we check against the secret table.
CREATE OR REPLACE FUNCTION router_heartbeat(
    p_secret TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_hotspot_id UUID;
BEGIN
    -- Find hotspot by secret
    SELECT hotspot_id INTO v_hotspot_id
    FROM hotspot_secrets
    WHERE secret = p_secret;

    IF v_hotspot_id IS NULL THEN
        RAISE EXCEPTION 'Invalid secret';
    END IF;

    -- Update details
    UPDATE hotspots
    SET last_seen_at = NOW(),
        is_online = TRUE
    WHERE id = v_hotspot_id;

    RETURN jsonb_build_object('status', 'ok', 'timestamp', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 2. OFFLINE VOUCHERS (JWT)
-- ============================================================================

-- Add token column to vouchers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'token') THEN
        ALTER TABLE vouchers ADD COLUMN token TEXT;
    END IF;
END $$;

-- Enable pgcrypto for HMAC signing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function: Sign JWT (Simple HS256)
create or replace function sign_jwt(payload json, secret text) returns text as $$
declare
  header text := '{"alg":"HS256","typ":"JWT"}';
  encoded_header text;
  encoded_payload text;
  signature text;
begin
  -- url-safe base64 encoding
  encoded_header := replace(replace(replace(encode(header::bytea, 'base64'), '=', ''), '+', '-'), '/', '_');
  encoded_payload := replace(replace(replace(encode(payload::text::bytea, 'base64'), '=', ''), '+', '-'), '/', '_');
  
  -- hmac signature
  signature := replace(replace(replace(encode(hmac(encoded_header || '.' || encoded_payload, secret, 'sha256'), 'base64'), '=', ''), '+', '-'), '/', '_');
  
  return encoded_header || '.' || encoded_payload || '.' || signature;
end;
$$ language plpgsql immutable;


-- UPDATE: process_purchase to generate Signed Token
CREATE OR REPLACE FUNCTION process_purchase(
  p_user_id UUID,
  p_hotspot_id UUID,
  p_plan_id UUID,
  p_payment_provider payment_provider
)
RETURNS UUID AS $$
DECLARE
  v_plan RECORD;
  v_user RECORD;
  v_hotspot_secret TEXT;
  v_purchase_id UUID;
  v_voucher_id UUID;
  v_voucher_code TEXT;
  v_permissions JSON;
  v_jwt TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- 1. Get Plan & User
  SELECT * INTO v_plan FROM plans WHERE id = p_plan_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan not found'; END IF;
  
  SELECT * INTO v_user FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;

  -- 2. Get Hotspot Secret
  SELECT secret INTO v_hotspot_secret FROM hotspot_secrets WHERE hotspot_id = p_hotspot_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Hotspot configuration error (missing secret)'; END IF;

  -- 3. Handle Wallet Payment
  IF p_payment_provider = 'wallet' THEN
    IF v_user.wallet_balance < v_plan.price_xof THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;
    
    -- Deduct
    UPDATE profiles SET wallet_balance = wallet_balance - v_plan.price_xof WHERE id = p_user_id;
    
    -- Transaction Log
    INSERT INTO wallet_transactions (
      user_id, type, amount, balance_before, balance_after, description
    ) VALUES (
      p_user_id, 'purchase', -v_plan.price_xof, v_user.wallet_balance, v_user.wallet_balance - v_plan.price_xof, 'Purchase: ' || v_plan.name
    );
  END IF;

  -- 4. Create Purchase Record
  INSERT INTO purchases (
    user_id, hotspot_id, plan_id, amount, payment_provider, payment_status
  ) VALUES (
    p_user_id, p_hotspot_id, p_plan_id, v_plan.price_xof, p_payment_provider,
    CASE WHEN p_payment_provider = 'wallet' THEN 'success'::payment_status ELSE 'pending'::payment_status END
  ) RETURNING id INTO v_purchase_id;

  -- 5. Issue Voucher (Only if payment is success/wallet)
  IF p_payment_provider = 'wallet' THEN
    v_expires_at := NOW() + INTERVAL '7 days'; 
    -- Note: Plan duration starts on first use, but voucher itself expires if unused.
    
    -- Generate Code
    v_voucher_code := generate_voucher_code();
    
    -- Construct JWT Payload
    v_permissions := json_build_object(
      'hotspot_id', p_hotspot_id,
      'plan_id', p_plan_id,
      'duration', v_plan.duration_seconds,
      'data_limit', v_plan.data_bytes,
      'purchase_id', v_purchase_id,
      'iat', extract(epoch from now())::int,
      'exp', extract(epoch from v_expires_at)::int
    );
    
    -- Sign Token
    v_jwt := sign_jwt(v_permissions, v_hotspot_secret);

    -- Save Voucher
    INSERT INTO vouchers (
      code, user_id, hotspot_id, plan_id, purchase_id, expires_at, token
    ) VALUES (
      v_voucher_code, p_user_id, p_hotspot_id, p_plan_id, v_purchase_id, v_expires_at, v_jwt
    ) RETURNING id INTO v_voucher_id;
    
    UPDATE purchases SET voucher_id = v_voucher_id WHERE id = v_purchase_id;
  
  END IF;

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 3. NEARBY HOTSPOTS (ONLINE STATUS FIX)
-- ============================================================================

CREATE OR REPLACE FUNCTION nearby_hotspots(
  p_lat DECIMAL,
  p_lng DECIMAL,
  radius_m INTEGER DEFAULT 10000
)
RETURNS TABLE (
  id UUID,
  host_id UUID,
  name VARCHAR,
  landmark TEXT,
  address TEXT,
  ssid VARCHAR,
  lat DECIMAL,
  lng DECIMAL,
  distance_m DECIMAL,
  online BOOLEAN,
  last_seen_age_secs INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.host_id,
    h.name,
    h.landmark,
    h.address,
    h.ssid,
    h.lat,
    h.lng,
    (earth_distance(ll_to_earth(p_lat::float8, p_lng::float8), ll_to_earth(h.lat::float8, h.lng::float8)))::DECIMAL as distance_m,
    -- Online definition: Last seen < 5 minutes ago
    (h.last_seen_at > (NOW() - INTERVAL '5 minutes')) as online,
    EXTRACT(EPOCH FROM (NOW() - h.last_seen_at))::INTEGER as last_seen_age_secs
  FROM hotspots h
  WHERE 
    earth_box(ll_to_earth(p_lat::float8, p_lng::float8), radius_m) @> ll_to_earth(h.lat::float8, h.lng::float8)
    AND earth_distance(ll_to_earth(p_lat::float8, p_lng::float8), ll_to_earth(h.lat::float8, h.lng::float8)) <= radius_m
  ORDER BY distance_m ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. UTILS
-- ============================================================================

-- Function to mark voucher as used (Online Fallback)
CREATE OR REPLACE FUNCTION redeem_voucher(voucher_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_voucher RECORD;
BEGIN
  SELECT * INTO v_voucher FROM vouchers WHERE code = voucher_code;
  
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid code'; END IF;
  IF v_voucher.used_at IS NOT NULL THEN RAISE EXCEPTION 'Already used'; END IF;
  IF v_voucher.expires_at < NOW() THEN RAISE EXCEPTION 'Expired'; END IF;

  UPDATE vouchers SET used_at = NOW() WHERE id = v_voucher.id;
  
  RETURN jsonb_build_object('success', true, 'token', v_voucher.token);
END;
$$ LANGUAGE plpgsql;
