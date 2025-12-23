-- ZemNet Database Schema - Functions and Triggers
-- Created: 2025-12-18
-- Description: Database functions, triggers, and business logic

-- ============================================================================
-- TIMESTAMP TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotspots_updated_at
  BEFORE UPDATE ON hotspots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_earnings_updated_at
  BEFORE UPDATE ON host_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VOUCHER CODE GENERATION
-- ============================================================================

-- Function to generate unique voucher code
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar characters
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN := TRUE;
BEGIN
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Format as XXXX-XXXX-XXXX
    result := substr(result, 1, 4) || '-' || substr(result, 5, 4) || '-' || substr(result, 9, 4);
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM vouchers WHERE code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate voucher code on insert
CREATE OR REPLACE FUNCTION set_voucher_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_voucher_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER voucher_code_generator
  BEFORE INSERT ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION set_voucher_code();

-- ============================================================================
-- WALLET MANAGEMENT
-- ============================================================================

-- Function to create purchase and deduct from wallet
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
  v_purchase_id UUID;
  v_voucher_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Get plan details
  SELECT * INTO v_plan FROM plans WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;
  
  -- Get user details
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if payment provider is wallet
  IF p_payment_provider = 'wallet' THEN
    -- Check sufficient balance
    IF v_user.wallet_balance < v_plan.price_xof THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;
    
    -- Deduct from wallet
    UPDATE users 
    SET wallet_balance = wallet_balance - v_plan.price_xof
    WHERE id = p_user_id;
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id, 
      type, 
      amount, 
      balance_before, 
      balance_after,
      description
    ) VALUES (
      p_user_id,
      'purchase',
      -v_plan.price_xof,
      v_user.wallet_balance,
      v_user.wallet_balance - v_plan.price_xof,
      'Purchase: ' || v_plan.name
    ) RETURNING id INTO v_transaction_id;
  END IF;
  
  -- Create purchase record
  INSERT INTO purchases (
    user_id,
    hotspot_id,
    plan_id,
    amount,
    payment_provider,
    payment_status
  ) VALUES (
    p_user_id,
    p_hotspot_id,
    p_plan_id,
    v_plan.price_xof,
    p_payment_provider,
    CASE WHEN p_payment_provider = 'wallet' THEN 'success'::payment_status ELSE 'pending'::payment_status END
  ) RETURNING id INTO v_purchase_id;
  
  -- If wallet payment, create voucher immediately
  IF p_payment_provider = 'wallet' THEN
    INSERT INTO vouchers (
      user_id,
      hotspot_id,
      plan_id,
      purchase_id,
      expires_at
    ) VALUES (
      p_user_id,
      p_hotspot_id,
      p_plan_id,
      v_purchase_id,
      NOW() + (v_plan.duration_seconds || ' seconds')::INTERVAL + INTERVAL '7 days'
    ) RETURNING id INTO v_voucher_id;
    
    -- Update purchase with voucher_id
    UPDATE purchases SET voucher_id = v_voucher_id WHERE id = v_purchase_id;
  END IF;
  
  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process wallet top-up
CREATE OR REPLACE FUNCTION process_wallet_topup(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_reference TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user RECORD;
  v_transaction_id UUID;
BEGIN
  -- Get user details
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Add to wallet
  UPDATE users 
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'topup',
    p_amount,
    v_user.wallet_balance,
    v_user.wallet_balance + p_amount,
    'Wallet top-up',
    jsonb_build_object('payment_reference', p_payment_reference)
  ) RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process cash-in (host top-up for customer)
CREATE OR REPLACE FUNCTION process_cashin(
  p_cashin_request_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_request RECORD;
  v_host RECORD;
  v_user RECORD;
  v_commission INTEGER;
BEGIN
  -- Get cash-in request details
  SELECT * INTO v_request FROM cashin_requests WHERE id = p_cashin_request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cash-in request not found';
  END IF;
  
  -- Check if already processed
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Cash-in request already processed';
  END IF;
  
  -- Check if expired
  IF v_request.expires_at < NOW() THEN
    UPDATE cashin_requests SET status = 'expired' WHERE id = p_cashin_request_id;
    RAISE EXCEPTION 'Cash-in request expired';
  END IF;
  
  -- Get host and user details
  SELECT * INTO v_host FROM users WHERE id = v_request.host_id;
  SELECT * INTO v_user FROM users WHERE id = v_request.user_id;
  
  -- Calculate commission (2%)
  v_commission := FLOOR(v_request.amount * 0.02);
  
  -- Add amount to customer wallet
  UPDATE users 
  SET wallet_balance = wallet_balance + v_request.amount
  WHERE id = v_request.user_id;
  
  -- Create transaction for customer
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    reference_id,
    reference_type,
    description
  ) VALUES (
    v_request.user_id,
    'topup',
    v_request.amount,
    v_user.wallet_balance,
    v_user.wallet_balance + v_request.amount,
    p_cashin_request_id,
    'cashin',
    'Cash-in top-up'
  );
  
  -- Add commission to host wallet
  UPDATE users 
  SET wallet_balance = wallet_balance + v_commission
  WHERE id = v_request.host_id;
  
  -- Create transaction for host commission
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    reference_id,
    reference_type,
    description
  ) VALUES (
    v_request.host_id,
    'cashin_commission',
    v_commission,
    v_host.wallet_balance,
    v_host.wallet_balance + v_commission,
    p_cashin_request_id,
    'cashin',
    'Cash-in commission (' || v_request.amount || ' XOF)'
  );
  
  -- Update cash-in request
  UPDATE cashin_requests 
  SET 
    status = 'confirmed',
    confirmed_at = NOW(),
    commission = v_commission
  WHERE id = p_cashin_request_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to process payout
CREATE OR REPLACE FUNCTION process_payout(
  p_payout_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payout RECORD;
  v_host RECORD;
BEGIN
  -- Get payout details
  SELECT * INTO v_payout FROM payouts WHERE id = p_payout_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found';
  END IF;
  
  -- Check if already processed
  IF v_payout.status != 'pending' THEN
    RAISE EXCEPTION 'Payout already processed';
  END IF;
  
  -- Get host details
  SELECT * INTO v_host FROM users WHERE id = v_payout.host_id;
  
  -- Check sufficient balance
  IF v_host.wallet_balance < v_payout.amount THEN
    UPDATE payouts 
    SET 
      status = 'failed',
      failed_at = NOW(),
      failure_reason = 'Insufficient balance'
    WHERE id = p_payout_id;
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct from host wallet
  UPDATE users 
  SET wallet_balance = wallet_balance - v_payout.amount
  WHERE id = v_payout.host_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    reference_id,
    reference_type,
    description
  ) VALUES (
    v_payout.host_id,
    'payout',
    -v_payout.amount,
    v_host.wallet_balance,
    v_host.wallet_balance - v_payout.amount,
    p_payout_id,
    'payout',
    'Payout to ' || v_payout.payment_provider
  );
  
  -- Update payout status
  UPDATE payouts 
  SET 
    status = 'processing',
    processed_at = NOW()
  WHERE id = p_payout_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- EARNINGS TRACKING
-- ============================================================================

-- Function to update host earnings (call this after successful purchase)
CREATE OR REPLACE FUNCTION update_host_earnings(
  p_purchase_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_purchase RECORD;
  v_hotspot RECORD;
  v_period_start DATE;
  v_period_end DATE;
  v_platform_fee INTEGER;
BEGIN
  -- Get purchase details
  SELECT * INTO v_purchase FROM purchases WHERE id = p_purchase_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Only process successful purchases
  IF v_purchase.payment_status != 'success' THEN
    RETURN;
  END IF;
  
  -- Get hotspot owner
  SELECT * INTO v_hotspot FROM hotspots WHERE id = v_purchase.hotspot_id;
  
  -- Calculate period (current month)
  v_period_start := DATE_TRUNC('month', v_purchase.created_at)::DATE;
  v_period_end := (DATE_TRUNC('month', v_purchase.created_at) + INTERVAL '1 month - 1 day')::DATE;
  
  -- Calculate platform fee (10% of sale)
  v_platform_fee := FLOOR(v_purchase.amount * 0.10);
  
  -- Insert or update earnings record
  INSERT INTO host_earnings (
    host_id,
    period_start,
    period_end,
    total_sales,
    platform_fee,
    net_earnings,
    purchases_count
  ) VALUES (
    v_hotspot.host_id,
    v_period_start,
    v_period_end,
    v_purchase.amount,
    v_platform_fee,
    v_purchase.amount - v_platform_fee,
    1
  )
  ON CONFLICT (host_id, period_start, period_end)
  DO UPDATE SET
    total_sales = host_earnings.total_sales + v_purchase.amount,
    platform_fee = host_earnings.platform_fee + v_platform_fee,
    net_earnings = host_earnings.net_earnings + (v_purchase.amount - v_platform_fee),
    purchases_count = host_earnings.purchases_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update earnings after purchase
CREATE OR REPLACE FUNCTION trigger_update_host_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'success' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'success') THEN
    PERFORM update_host_earnings(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_earnings_update
  AFTER INSERT OR UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_host_earnings();

-- ============================================================================
-- VOUCHER EXPIRY CHECK
-- ============================================================================

-- Function to check if voucher is valid
CREATE OR REPLACE FUNCTION is_voucher_valid(p_voucher_code TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  voucher_id UUID,
  reason TEXT
) AS $$
DECLARE
  v_voucher RECORD;
BEGIN
  -- Find voucher
  SELECT * INTO v_voucher FROM vouchers WHERE code = p_voucher_code;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Voucher not found';
    RETURN;
  END IF;
  
  -- Check if already used
  IF v_voucher.used_at IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, v_voucher.id, 'Voucher already used';
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_voucher.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, v_voucher.id, 'Voucher expired';
    RETURN;
  END IF;
  
  -- Valid
  RETURN QUERY SELECT TRUE, v_voucher.id, 'Valid'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEARCH FUNCTIONS
-- ============================================================================

-- Function to search hotspots near a location
CREATE OR REPLACE FUNCTION search_nearby_hotspots(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius_km DECIMAL DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  landmark TEXT,
  lat DECIMAL,
  lng DECIMAL,
  distance_km DECIMAL,
  is_online BOOLEAN,
  min_price INTEGER,
  host_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.landmark,
    h.lat,
    h.lng,
    ROUND(
      (6371 * acos(
        cos(radians(p_lat)) * cos(radians(h.lat)) * 
        cos(radians(h.lng) - radians(p_lng)) + 
        sin(radians(p_lat)) * sin(radians(h.lat))
      ))::NUMERIC,
      2
    ) AS distance_km,
    h.is_online,
    (
      SELECT MIN(price_xof) 
      FROM plans 
      WHERE hotspot_id = h.id AND is_active = TRUE
    )::INTEGER AS min_price,
    h.host_id
  FROM hotspots h
  WHERE h.is_online = TRUE
  AND (
    6371 * acos(
      cos(radians(p_lat)) * cos(radians(h.lat)) * 
      cos(radians(h.lng) - radians(p_lng)) + 
      sin(radians(p_lat)) * sin(radians(h.lat))
    )
  ) <= p_radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STATISTICS FUNCTIONS
-- ============================================================================

-- Function to get host dashboard stats
CREATE OR REPLACE FUNCTION get_host_dashboard_stats(p_host_id UUID)
RETURNS TABLE(
  total_hotspots INTEGER,
  active_hotspots INTEGER,
  total_sales_today INTEGER,
  total_sessions_today INTEGER,
  wallet_balance INTEGER,
  pending_payouts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM hotspots WHERE host_id = p_host_id),
    (SELECT COUNT(*)::INTEGER FROM hotspots WHERE host_id = p_host_id AND is_online = TRUE),
    (
      SELECT COALESCE(SUM(p.amount), 0)::INTEGER
      FROM purchases p
      INNER JOIN hotspots h ON p.hotspot_id = h.id
      WHERE h.host_id = p_host_id 
      AND p.payment_status = 'success'
      AND p.created_at >= CURRENT_DATE
    ),
    (
      SELECT COUNT(DISTINCT s.id)::INTEGER
      FROM sessions s
      INNER JOIN vouchers v ON s.voucher_id = v.id
      INNER JOIN hotspots h ON v.hotspot_id = h.id
      WHERE h.host_id = p_host_id
      AND s.started_at >= CURRENT_DATE
    ),
    (SELECT wallet_balance::INTEGER FROM users WHERE id = p_host_id),
    (SELECT COALESCE(SUM(amount), 0)::INTEGER FROM payouts WHERE host_id = p_host_id AND status = 'pending');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION generate_voucher_code IS 
  'Generates a unique 12-character voucher code in format XXXX-XXXX-XXXX';

COMMENT ON FUNCTION process_purchase IS 
  'Processes a plan purchase, handles wallet deduction, and creates voucher';

COMMENT ON FUNCTION process_wallet_topup IS 
  'Adds funds to user wallet and creates transaction record';

COMMENT ON FUNCTION process_cashin IS 
  'Processes host cash-in request, tops up customer wallet, and pays commission';

COMMENT ON FUNCTION process_payout IS 
  'Processes host payout request and deducts from wallet';

COMMENT ON FUNCTION update_host_earnings IS 
  'Updates aggregated earnings data for a host after a successful purchase';

COMMENT ON FUNCTION is_voucher_valid IS 
  'Checks if a voucher code is valid and returns validation result';

COMMENT ON FUNCTION search_nearby_hotspots IS 
  'Searches for online hotspots within a specified radius using haversine formula';

COMMENT ON FUNCTION get_host_dashboard_stats IS 
  'Returns aggregated statistics for host dashboard';
