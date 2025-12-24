-- ZemNet Database Schema - Fixed for Supabase Auth
-- Uses auth.users + public.profiles pattern (Supabase best practice)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('guest', 'user', 'host', 'technician', 'admin');
CREATE TYPE payment_provider AS ENUM ('wave', 'orange', 'moov', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'expired');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE cashin_status AS ENUM ('pending', 'confirmed', 'expired', 'rejected');
CREATE TYPE service_request_type AS ENUM ('router-issue', 'setup-help', 'network-problem', 'maintenance', 'hardware-repair', 'other');
CREATE TYPE service_request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE service_request_status AS ENUM ('pending', 'assigned', 'in-progress', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('purchase', 'topup', 'cashin_commission', 'sales_revenue', 'payout', 'refund');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- ============================================================================
-- PROFILES TABLE (extends auth.users with app-specific data)
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'user',
  wallet_balance BIGINT NOT NULL DEFAULT 0,
  kyc_status kyc_status,
  kyc_submitted_at TIMESTAMPTZ,
  kyc_reviewed_at TIMESTAMPTZ,
  kyc_reviewer_notes TEXT,
  profile_photo_url TEXT,
  language VARCHAR(2) DEFAULT 'fr',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT positive_wallet_balance CHECK (wallet_balance >= 0)
);

-- Auto-create profile on auth.user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- OTHER TABLES (referencing profiles)
-- ============================================================================

CREATE TABLE public.hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  landmark TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  ssid VARCHAR(32) NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  sales_paused BOOLEAN NOT NULL DEFAULT FALSE,
  hours VARCHAR(100),
  router_model VARCHAR(100),
  router_serial VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_coordinates CHECK (lat >= -90 AND lat <= 90 AND lng >= -180 AND lng <= 180)
);

CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotspot_id UUID NOT NULL REFERENCES public.hotspots(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  data_bytes BIGINT NOT NULL,
  price_xof INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT positive_duration CHECK (duration_seconds > 0),
  CONSTRAINT positive_data CHECK (data_bytes > 0),
  CONSTRAINT positive_price CHECK (price_xof > 0)
);

CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES public.hotspots(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  purchase_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  device_mac VARCHAR(17),
  
  CONSTRAINT valid_mac CHECK (device_mac IS NULL OR device_mac ~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
);

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  device_mac VARCHAR(17) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  data_used BIGINT NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_mac CHECK (device_mac ~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'),
  CONSTRAINT positive_data_used CHECK (data_used >= 0)
);

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES public.hotspots(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  payment_provider payment_provider NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT positive_amount CHECK (amount > 0)
);

ALTER TABLE public.vouchers 
  ADD CONSTRAINT fk_vouchers_purchase 
  FOREIGN KEY (purchase_id) 
  REFERENCES public.purchases(id) 
  ON DELETE SET NULL;

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_balance CHECK (balance_after = balance_before + amount)
);

CREATE TABLE public.cashin_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_phone VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  commission INTEGER NOT NULL DEFAULT 0,
  status cashin_status NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_commission CHECK (commission >= 0),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE TABLE public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  id_type VARCHAR(50) NOT NULL,
  id_number VARCHAR(100) NOT NULL,
  id_photo_url TEXT NOT NULL,
  selfie_photo_url TEXT NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'SN',
  date_of_birth DATE NOT NULL,
  business_name VARCHAR(255),
  business_registration VARCHAR(100),
  status kyc_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  
  CONSTRAINT valid_dob CHECK (date_of_birth < CURRENT_DATE)
);

CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  fee INTEGER NOT NULL DEFAULT 0,
  net_amount INTEGER NOT NULL,
  payment_provider payment_provider NOT NULL,
  payment_account VARCHAR(255) NOT NULL,
  status payout_status NOT NULL DEFAULT 'pending',
  reference VARCHAR(255),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_fee CHECK (fee >= 0),
  CONSTRAINT valid_net_amount CHECK (net_amount = amount - fee)
);

CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES public.hotspots(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type service_request_type NOT NULL,
  priority service_request_priority NOT NULL DEFAULT 'medium',
  status service_request_status NOT NULL DEFAULT 'pending',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  photos TEXT[],
  notes TEXT,
  resolution TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

CREATE TABLE public.host_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  platform_fee INTEGER NOT NULL DEFAULT 0,
  cashin_commission INTEGER NOT NULL DEFAULT 0,
  net_earnings INTEGER NOT NULL DEFAULT 0,
  purchases_count INTEGER NOT NULL DEFAULT 0,
  cashin_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT positive_counts CHECK (purchases_count >= 0 AND cashin_count >= 0),
  UNIQUE (host_id, period_start, period_end)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_hotspots_host_id ON public.hotspots(host_id);
CREATE INDEX idx_hotspots_is_online ON public.hotspots(is_online);
CREATE INDEX idx_plans_hotspot_id ON public.plans(hotspot_id);
CREATE INDEX idx_vouchers_user_id ON public.vouchers(user_id);
CREATE INDEX idx_vouchers_code ON public.vouchers(code);
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_payment_status ON public.purchases(payment_status);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_cashin_requests_host_id ON public.cashin_requests(host_id);
CREATE INDEX idx_cashin_requests_status ON public.cashin_requests(status);
