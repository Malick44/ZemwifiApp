-- ZemNet Database Schema - Initial Migration
-- Created: 2025-12-18
-- Description: Core tables for users, hotspots, plans, vouchers, transactions, and sessions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('guest', 'user', 'host', 'technician', 'admin');

-- Payment providers
CREATE TYPE payment_provider AS ENUM ('wave', 'orange', 'moov', 'wallet');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'expired');

-- KYC verification status
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Cash-in request status
CREATE TYPE cashin_status AS ENUM ('pending', 'confirmed', 'expired', 'rejected');

-- Service request types
CREATE TYPE service_request_type AS ENUM (
  'router-issue',
  'setup-help',
  'network-problem',
  'maintenance',
  'hardware-repair',
  'other'
);

-- Service request priority
CREATE TYPE service_request_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Service request status
CREATE TYPE service_request_status AS ENUM (
  'pending',
  'assigned',
  'in-progress',
  'completed',
  'cancelled'
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
  'purchase',
  'topup',
  'cashin_commission',
  'sales_revenue',
  'payout',
  'refund'
);

-- Payout status
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'user',
  wallet_balance BIGINT NOT NULL DEFAULT 0, -- Balance in XOF (stored as integer for precision)
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
  
  -- Constraints
  CONSTRAINT positive_wallet_balance CHECK (wallet_balance >= 0),
  CONSTRAINT valid_phone CHECK (phone ~ '^\+[0-9]{1,15}$')
);

-- Hotspots table
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  landmark TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  ssid VARCHAR(32) NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  sales_paused BOOLEAN NOT NULL DEFAULT FALSE,
  hours VARCHAR(100), -- e.g., "08:00 - 22:00"
  router_model VARCHAR(100),
  router_serial VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_coordinates CHECK (
    lat >= -90 AND lat <= 90 AND
    lng >= -180 AND lng <= 180
  )
);

-- Plans table (pricing plans for hotspots)
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotspot_id UUID NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  data_bytes BIGINT NOT NULL,
  price_xof INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_duration CHECK (duration_seconds > 0),
  CONSTRAINT positive_data CHECK (data_bytes > 0),
  CONSTRAINT positive_price CHECK (price_xof > 0)
);

-- Vouchers table (purchased internet access codes)
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  purchase_id UUID, -- References purchases table (added later)
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  device_mac VARCHAR(17), -- MAC address of device that used the voucher
  
  -- Constraints
  CONSTRAINT valid_mac CHECK (device_mac IS NULL OR device_mac ~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
);

-- Sessions table (active internet sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  device_mac VARCHAR(17) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  data_used BIGINT NOT NULL DEFAULT 0, -- Bytes used
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_mac CHECK (device_mac ~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'),
  CONSTRAINT positive_data_used CHECK (data_used >= 0)
);

-- Purchases table (transaction records for plan purchases)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  payment_provider payment_provider NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(255), -- External payment provider reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Add foreign key to vouchers table
ALTER TABLE vouchers 
  ADD CONSTRAINT fk_vouchers_purchase 
  FOREIGN KEY (purchase_id) 
  REFERENCES purchases(id) 
  ON DELETE SET NULL;

-- Transactions table (wallet transaction history)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- Can be negative for debits
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id UUID, -- Reference to purchase, payout, etc.
  reference_type VARCHAR(50), -- 'purchase', 'payout', 'cashin', etc.
  description TEXT,
  metadata JSONB, -- Additional data (payment provider, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_balance CHECK (
    balance_after = balance_before + amount
  )
);

-- Cash-in requests table (host wallet top-ups for customers)
CREATE TABLE cashin_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_phone VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  commission INTEGER NOT NULL DEFAULT 0, -- Host commission in XOF
  status cashin_status NOT NULL DEFAULT 'pending',
  qr_code TEXT, -- QR code data for customer scanning
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_commission CHECK (commission >= 0),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- KYC submissions table
CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  id_type VARCHAR(50) NOT NULL, -- 'national_id', 'passport', 'drivers_license'
  id_number VARCHAR(100) NOT NULL,
  id_photo_url TEXT NOT NULL,
  selfie_photo_url TEXT NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'BF', -- ISO country code
  date_of_birth DATE NOT NULL,
  business_name VARCHAR(255), -- For host accounts
  business_registration VARCHAR(100), -- For host accounts
  status kyc_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  
  -- Constraints
  CONSTRAINT valid_dob CHECK (date_of_birth < CURRENT_DATE)
);

-- Payouts table (host withdrawal requests)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  fee INTEGER NOT NULL DEFAULT 0,
  net_amount INTEGER NOT NULL, -- amount - fee
  payment_provider payment_provider NOT NULL,
  payment_account VARCHAR(255) NOT NULL, -- Phone number or account number
  status payout_status NOT NULL DEFAULT 'pending',
  reference VARCHAR(255), -- External payment reference
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_fee CHECK (fee >= 0),
  CONSTRAINT valid_net_amount CHECK (net_amount = amount - fee)
);

-- Service requests table (technician support requests)
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type service_request_type NOT NULL,
  priority service_request_priority NOT NULL DEFAULT 'medium',
  status service_request_status NOT NULL DEFAULT 'pending',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  photos TEXT[], -- Array of photo URLs
  notes TEXT,
  resolution TEXT,
  rating INTEGER, -- 1-5 stars
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  CONSTRAINT valid_status_dates CHECK (
    (status = 'assigned' AND assigned_at IS NOT NULL) OR status != 'assigned'
  )
);

-- Host earnings summary table (denormalized for performance)
CREATE TABLE host_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0, -- Total revenue from sales
  platform_fee INTEGER NOT NULL DEFAULT 0, -- Fee charged by ZemNet (e.g., 10%)
  cashin_commission INTEGER NOT NULL DEFAULT 0, -- Commission from cash-in services
  net_earnings INTEGER NOT NULL DEFAULT 0, -- total_sales - platform_fee + cashin_commission
  purchases_count INTEGER NOT NULL DEFAULT 0,
  cashin_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT positive_counts CHECK (
    purchases_count >= 0 AND cashin_count >= 0
  ),
  UNIQUE (host_id, period_start, period_end)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Hotspots indexes
CREATE INDEX idx_hotspots_host_id ON hotspots(host_id);
CREATE INDEX idx_hotspots_location ON hotspots USING GIST (
  ll_to_earth(lat::float8, lng::float8)
); -- Requires earthdistance extension
CREATE INDEX idx_hotspots_is_online ON hotspots(is_online);
CREATE INDEX idx_hotspots_created_at ON hotspots(created_at DESC);

-- Plans indexes
CREATE INDEX idx_plans_hotspot_id ON plans(hotspot_id);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_price_xof ON plans(price_xof);

-- Vouchers indexes
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_user_id ON vouchers(user_id);
CREATE INDEX idx_vouchers_hotspot_id ON vouchers(hotspot_id);
CREATE INDEX idx_vouchers_plan_id ON vouchers(plan_id);
CREATE INDEX idx_vouchers_expires_at ON vouchers(expires_at);
CREATE INDEX idx_vouchers_created_at ON vouchers(created_at DESC);
CREATE INDEX idx_vouchers_used_at ON vouchers(used_at);

-- Sessions indexes
CREATE INDEX idx_sessions_voucher_id ON sessions(voucher_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at DESC);
CREATE INDEX idx_sessions_ended_at ON sessions(ended_at);

-- Purchases indexes
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_hotspot_id ON purchases(hotspot_id);
CREATE INDEX idx_purchases_plan_id ON purchases(plan_id);
CREATE INDEX idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference_id, reference_type);

-- Cash-in requests indexes
CREATE INDEX idx_cashin_host_id ON cashin_requests(host_id);
CREATE INDEX idx_cashin_user_id ON cashin_requests(user_id);
CREATE INDEX idx_cashin_status ON cashin_requests(status);
CREATE INDEX idx_cashin_created_at ON cashin_requests(created_at DESC);
CREATE INDEX idx_cashin_expires_at ON cashin_requests(expires_at);

-- KYC submissions indexes
CREATE INDEX idx_kyc_user_id ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_status ON kyc_submissions(status);
CREATE INDEX idx_kyc_submitted_at ON kyc_submissions(submitted_at DESC);

-- Payouts indexes
CREATE INDEX idx_payouts_host_id ON payouts(host_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_requested_at ON payouts(requested_at DESC);

-- Service requests indexes
CREATE INDEX idx_service_requests_host_id ON service_requests(host_id);
CREATE INDEX idx_service_requests_technician_id ON service_requests(technician_id);
CREATE INDEX idx_service_requests_hotspot_id ON service_requests(hotspot_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_priority ON service_requests(priority);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at DESC);

-- Host earnings indexes
CREATE INDEX idx_host_earnings_host_id ON host_earnings(host_id);
CREATE INDEX idx_host_earnings_period ON host_earnings(period_start, period_end);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Application users (customers, hosts, technicians, admins)';
COMMENT ON TABLE hotspots IS 'Wi-Fi hotspots managed by hosts';
COMMENT ON TABLE plans IS 'Pricing plans for hotspot internet access';
COMMENT ON TABLE vouchers IS 'Purchased voucher codes for internet access';
COMMENT ON TABLE sessions IS 'Active internet usage sessions';
COMMENT ON TABLE purchases IS 'Purchase transaction records';
COMMENT ON TABLE transactions IS 'Wallet transaction history';
COMMENT ON TABLE cashin_requests IS 'Host-initiated wallet top-ups for customers';
COMMENT ON TABLE kyc_submissions IS 'KYC verification documents for hosts';
COMMENT ON TABLE payouts IS 'Host withdrawal requests';
COMMENT ON TABLE service_requests IS 'Technician service requests from hosts';
COMMENT ON TABLE host_earnings IS 'Aggregated earnings data for hosts';

COMMENT ON COLUMN users.wallet_balance IS 'Balance in XOF stored as integer (e.g., 1000 = 1000 XOF)';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount in XOF (negative for debits, positive for credits)';
COMMENT ON COLUMN cashin_requests.commission IS 'Host commission for performing cash-in service (typically 2%)';
COMMENT ON COLUMN host_earnings.platform_fee IS 'ZemNet platform fee (e.g., 10% of sales)';
