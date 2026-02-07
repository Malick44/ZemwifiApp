-- 0) Add new status 'accepted_by_user'
-- Note: You might need to run this line separately if it fails inside a transaction block
ALTER TYPE public.cashin_status ADD VALUE IF NOT EXISTS 'accepted_by_user';

-- 1) Fix host_create_cashin
-- First, drop the problematic unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cashin_requests_user_phone_key'
  ) THEN
    ALTER TABLE public.cashin_requests DROP CONSTRAINT cashin_requests_user_phone_key;
  END IF;
  
  -- Also check for unique index
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'cashin_requests_user_phone_key'
  ) THEN
    DROP INDEX public.cashin_requests_user_phone_key;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.host_create_cashin(
  p_user_phone text,
  p_amount_xof bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_host_id uuid;
  v_user_id uuid;
  v_new_id uuid;
  v_expires_at timestamptz;
BEGIN
  v_host_id := auth.uid();
  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE phone = p_user_phone;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with phone % not found', p_user_phone;
  END IF;

  -- expire any existing pending/accepted requests for this user to avoid clutter
  UPDATE public.cashin_requests
  SET status = 'expired'
  WHERE user_phone = p_user_phone 
    AND status IN ('pending', 'accepted_by_user');

  v_expires_at := now() + interval '10 minutes';

  INSERT INTO public.cashin_requests (host_id, user_phone, user_id, amount, expires_at, status)
  VALUES (v_host_id, p_user_phone, v_user_id, p_amount_xof, v_expires_at, 'pending')
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('id', v_new_id, 'expires_at', v_expires_at);
END;
$$;

-- 2) Adjust wallet overdraft constraint (allow down to -5000)
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'positive_wallet_balance'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT positive_wallet_balance;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wallet_balance_threshold'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT wallet_balance_threshold
      CHECK (wallet_balance >= -5000);
  END IF;
END
$do$;

-- 2b) Fix user_confirm_cashin (STEP 2: User Accepts, NO Money Transfer Yet)
CREATE OR REPLACE FUNCTION public.user_confirm_cashin(
  p_request_id uuid,
  p_decision text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_req
  FROM public.cashin_requests
  WHERE id = p_request_id;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Request processed';
  END IF;

  IF now() > v_req.expires_at THEN
    UPDATE public.cashin_requests
    SET status = 'expired'
    WHERE id = p_request_id;
    RAISE EXCEPTION 'Request expired';
  END IF;

  IF p_decision = 'deny' THEN
    UPDATE public.cashin_requests
    SET status = 'rejected'
    WHERE id = p_request_id;
    RETURN jsonb_build_object('status', 'rejected');
  END IF;

  -- Update status to indicate User has accepted, waiting for Host to finalize
  UPDATE public.cashin_requests
  SET status = 'accepted_by_user'
  WHERE id = p_request_id;

  RETURN jsonb_build_object('status', 'accepted_by_user', 'message', 'Waiting for host completion');
END;
$$;

-- 2c) New Function: host_complete_cashin (STEP 3: Host Finalizes, Money Moves)
CREATE OR REPLACE FUNCTION public.host_complete_cashin(
  p_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req record;
  v_amount bigint;
  v_host_id uuid;
  v_host_balance bigint;
BEGIN
  v_host_id := auth.uid();
  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_req
  FROM public.cashin_requests
  WHERE id = p_request_id;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  -- Ensure only the Host who created it can complete it
  IF v_req.host_id <> v_host_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_req.status <> 'accepted_by_user' THEN
     -- Allow retrying if it's somehow stuck but logical check
    RAISE EXCEPTION 'Request not in accepted state (Status: %)', v_req.status;
  END IF;

  IF now() > v_req.expires_at THEN
    UPDATE public.cashin_requests
    SET status = 'expired'
    WHERE id = p_request_id;
    RAISE EXCEPTION 'Request expired';
  END IF;

  v_amount := v_req.amount;

  -- Lock Host Wallet
  SELECT wallet_balance INTO v_host_balance
  FROM public.profiles
  WHERE id = v_host_id
  FOR UPDATE;

  -- Check Overdraft
  IF (v_host_balance - v_amount) < -5000 THEN
    RAISE EXCEPTION 'Host limit reached (Bal: %, Req: %, Limit: -5000)', v_host_balance, v_amount;
  END IF;

  -- Debit Host
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - v_amount,
      updated_at = now()
  WHERE id = v_host_id;

  INSERT INTO public.transactions
    (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description)
  VALUES
    (v_host_id, 'payout', -v_amount, v_host_balance, v_host_balance - v_amount, p_request_id, 'cashin_request', 'Cash-in provided');

  -- Credit User
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + v_amount,
      updated_at = now()
  WHERE id = v_req.user_id;

  INSERT INTO public.transactions
    (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description)
  SELECT
    v_req.user_id, 'topup', v_amount, wallet_balance - v_amount, wallet_balance, p_request_id, 'cashin_request', 'Cash-in received'
  FROM public.profiles
  WHERE id = v_req.user_id;

  -- Finalize Request
  UPDATE public.cashin_requests
  SET status = 'confirmed',
      confirmed_at = now()
  WHERE id = p_request_id;

  RETURN jsonb_build_object('status', 'confirmed', 'amount', v_amount);
END;
$$;


-- 2.5) Ensure system_settings exists for configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text
);

-- Insert default platform fee (15%) if it doesn't exist
INSERT INTO public.system_settings (key, value, description)
VALUES ('platform_fee_percent', '0.15', 'Platform commission rate (0.15 = 15%)')
ON CONFLICT (key) DO NOTHING;

-- 3) Update process_purchase (split revenue with host dynamically)
CREATE OR REPLACE FUNCTION public.process_purchase(
  p_user_id UUID,
  p_hotspot_id UUID,
  p_plan_id UUID,
  p_payment_provider text
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan RECORD;
  v_user RECORD;
  v_host_id UUID;
  v_purchase_id UUID;
  v_voucher_id UUID;
  v_platform_fee_percent numeric;
  v_host_earnings bigint;
  v_host_balance_before bigint;
BEGIN
  -- 1. Get platform fee from settings (default to 0.15 if missing)
  SELECT value::numeric INTO v_platform_fee_percent
  FROM public.system_settings
  WHERE key = 'platform_fee_percent';

  IF v_platform_fee_percent IS NULL THEN
    v_platform_fee_percent := 0.15;
  END IF;

  -- 2. Fetch Plan & Host info
  SELECT p.*, h.host_id
  INTO v_plan
  FROM public.plans p
  JOIN public.hotspots h ON p.hotspot_id = h.id
  WHERE p.id = p_plan_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;

  v_host_id := v_plan.host_id;

  -- 3. Handle Wallet Payment
  IF p_payment_provider = 'wallet' THEN
    SELECT * INTO v_user
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_user.wallet_balance < v_plan.price_xof THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Deduct from User
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - v_plan.price_xof
    WHERE id = p_user_id;

    INSERT INTO public.transactions
      (user_id, type, amount, balance_before, balance_after, description)
    VALUES
      (p_user_id, 'purchase', -v_plan.price_xof, v_user.wallet_balance, v_user.wallet_balance - v_plan.price_xof, 'Purchase: ' || v_plan.name);
  END IF;

  -- 4. Record Purchase
  INSERT INTO public.purchases
    (user_id, hotspot_id, plan_id, amount, payment_provider, payment_status)
  VALUES
    (p_user_id, p_hotspot_id, p_plan_id, v_plan.price_xof, p_payment_provider::payment_status, 'success')
  RETURNING id INTO v_purchase_id;

  -- 5. Generate Voucher
  INSERT INTO public.vouchers
    (user_id, hotspot_id, plan_id, purchase_id, expires_at)
  VALUES
    (p_user_id, p_hotspot_id, p_plan_id, v_purchase_id, now() + (v_plan.duration_seconds || ' seconds')::interval + interval '7 days')
  RETURNING id INTO v_voucher_id;

  UPDATE public.purchases
  SET voucher_id = v_voucher_id
  WHERE id = v_purchase_id;

  -- 6. Credit Host with Revenue Share
  -- Calculate host earnings based on dynamic fee
  v_host_earnings := floor(v_plan.price_xof * (1.0 - v_platform_fee_percent))::bigint;

  SELECT wallet_balance INTO v_host_balance_before
  FROM public.profiles
  WHERE id = v_host_id
  FOR UPDATE;

  UPDATE public.profiles
  SET wallet_balance = wallet_balance + v_host_earnings
  WHERE id = v_host_id;

  INSERT INTO public.transactions
    (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
  VALUES
    (v_host_id, 'sales_revenue', v_host_earnings,
     v_host_balance_before, v_host_balance_before + v_host_earnings,
     'Sale Revenue: ' || v_plan.name, v_purchase_id, 'purchase');

  RETURN v_purchase_id;
END;
$$;
