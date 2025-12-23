-- ZemNet Database Schema - Row Level Security Policies
-- Created: 2025-12-18
-- Description: RLS policies for secure multi-tenant data access

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_earnings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing critical fields
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    wallet_balance = (SELECT wallet_balance FROM users WHERE id = auth.uid())
  );

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any user
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public user registration (insert)
CREATE POLICY "Public can register"
  ON users FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- HOTSPOTS TABLE POLICIES
-- ============================================================================

-- Anyone can view online hotspots (for discovery)
CREATE POLICY "Public can view online hotspots"
  ON hotspots FOR SELECT
  USING (is_online = true);

-- Hosts can view their own hotspots (even if offline)
CREATE POLICY "Hosts can view own hotspots"
  ON hotspots FOR SELECT
  USING (host_id = auth.uid());

-- Hosts can create hotspots
CREATE POLICY "Hosts can create hotspots"
  ON hotspots FOR INSERT
  WITH CHECK (
    host_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('host', 'admin')
    )
  );

-- Hosts can update their own hotspots
CREATE POLICY "Hosts can update own hotspots"
  ON hotspots FOR UPDATE
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Hosts can delete their own hotspots
CREATE POLICY "Hosts can delete own hotspots"
  ON hotspots FOR DELETE
  USING (host_id = auth.uid());

-- Admins can view/edit all hotspots
CREATE POLICY "Admins can manage all hotspots"
  ON hotspots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PLANS TABLE POLICIES
-- ============================================================================

-- Anyone can view active plans for online hotspots
CREATE POLICY "Public can view active plans"
  ON plans FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = plans.hotspot_id AND is_online = true
    )
  );

-- Hosts can view all plans for their hotspots
CREATE POLICY "Hosts can view own plans"
  ON plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  );

-- Hosts can create plans for their hotspots
CREATE POLICY "Hosts can create plans"
  ON plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  );

-- Hosts can update plans for their hotspots
CREATE POLICY "Hosts can update own plans"
  ON plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  );

-- Hosts can delete plans for their hotspots
CREATE POLICY "Hosts can delete own plans"
  ON plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  );

-- ============================================================================
-- VOUCHERS TABLE POLICIES
-- ============================================================================

-- Users can view their own vouchers
CREATE POLICY "Users can view own vouchers"
  ON vouchers FOR SELECT
  USING (user_id = auth.uid());

-- Hosts can view vouchers for their hotspots
CREATE POLICY "Hosts can view hotspot vouchers"
  ON vouchers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = vouchers.hotspot_id AND host_id = auth.uid()
    )
  );

-- System can create vouchers (after purchase)
CREATE POLICY "System can create vouchers"
  ON vouchers FOR INSERT
  WITH CHECK (true); -- Protected by application logic

-- System can update vouchers (mark as used)
CREATE POLICY "System can update vouchers"
  ON vouchers FOR UPDATE
  USING (true); -- Protected by application logic

-- ============================================================================
-- SESSIONS TABLE POLICIES
-- ============================================================================

-- Users can view sessions for their vouchers
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vouchers 
      WHERE id = sessions.voucher_id AND user_id = auth.uid()
    )
  );

-- Hosts can view sessions for their hotspot vouchers
CREATE POLICY "Hosts can view hotspot sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vouchers v
      INNER JOIN hotspots h ON v.hotspot_id = h.id
      WHERE v.id = sessions.voucher_id AND h.host_id = auth.uid()
    )
  );

-- System can manage sessions
CREATE POLICY "System can manage sessions"
  ON sessions FOR ALL
  USING (true); -- Protected by application logic and network gateway

-- ============================================================================
-- PURCHASES TABLE POLICIES
-- ============================================================================

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (user_id = auth.uid());

-- Hosts can view purchases for their hotspots
CREATE POLICY "Hosts can view hotspot purchases"
  ON purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hotspots 
      WHERE id = purchases.hotspot_id AND host_id = auth.uid()
    )
  );

-- Users can create purchases
CREATE POLICY "Users can create purchases"
  ON purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- System can update purchase status
CREATE POLICY "System can update purchases"
  ON purchases FOR UPDATE
  USING (true); -- Protected by application logic and payment webhooks

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

-- System can create transactions
CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true); -- Protected by application logic

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- CASH-IN REQUESTS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own cash-in requests
CREATE POLICY "Hosts can view own cashin requests"
  ON cashin_requests FOR SELECT
  USING (host_id = auth.uid());

-- Users can view cash-in requests made for them
CREATE POLICY "Users can view own cashin requests"
  ON cashin_requests FOR SELECT
  USING (user_id = auth.uid());

-- Hosts can create cash-in requests
CREATE POLICY "Hosts can create cashin requests"
  ON cashin_requests FOR INSERT
  WITH CHECK (
    host_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('host', 'admin')
    )
  );

-- Users can update cash-in requests (confirm/reject)
CREATE POLICY "Users can update cashin status"
  ON cashin_requests FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    -- Can only update status field
    amount = (SELECT amount FROM cashin_requests WHERE id = cashin_requests.id)
  );

-- Hosts can cancel their own pending requests
CREATE POLICY "Hosts can cancel own cashin requests"
  ON cashin_requests FOR UPDATE
  USING (
    host_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (
    host_id = auth.uid()
  );

-- ============================================================================
-- KYC SUBMISSIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own KYC submission
CREATE POLICY "Users can view own KYC"
  ON kyc_submissions FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own KYC submission
CREATE POLICY "Users can submit KYC"
  ON kyc_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their pending KYC submission
CREATE POLICY "Users can update pending KYC"
  ON kyc_submissions FOR UPDATE
  USING (
    user_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (
    user_id = auth.uid() AND status = 'pending'
  );

-- Admins can view all KYC submissions
CREATE POLICY "Admins can view all KYC"
  ON kyc_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update KYC submissions (approve/reject)
CREATE POLICY "Admins can review KYC"
  ON kyc_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PAYOUTS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own payouts
CREATE POLICY "Hosts can view own payouts"
  ON payouts FOR SELECT
  USING (host_id = auth.uid());

-- Hosts can create payout requests
CREATE POLICY "Hosts can request payouts"
  ON payouts FOR INSERT
  WITH CHECK (
    host_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('host', 'admin')
    )
  );

-- Hosts can cancel their pending payouts
CREATE POLICY "Hosts can cancel pending payouts"
  ON payouts FOR UPDATE
  USING (
    host_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (
    host_id = auth.uid() AND
    status = 'cancelled'
  );

-- Admins can view and manage all payouts
CREATE POLICY "Admins can manage payouts"
  ON payouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SERVICE REQUESTS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own service requests
CREATE POLICY "Hosts can view own requests"
  ON service_requests FOR SELECT
  USING (host_id = auth.uid());

-- Technicians can view assigned requests
CREATE POLICY "Technicians can view assigned requests"
  ON service_requests FOR SELECT
  USING (
    technician_id = auth.uid() OR
    (
      status = 'pending' AND
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'technician'
      )
    )
  );

-- Hosts can create service requests
CREATE POLICY "Hosts can create requests"
  ON service_requests FOR INSERT
  WITH CHECK (
    host_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('host', 'admin')
    )
  );

-- Hosts can update their own pending requests
CREATE POLICY "Hosts can update own pending requests"
  ON service_requests FOR UPDATE
  USING (
    host_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (
    host_id = auth.uid()
  );

-- Technicians can update assigned requests
CREATE POLICY "Technicians can update assigned requests"
  ON service_requests FOR UPDATE
  USING (technician_id = auth.uid())
  WITH CHECK (technician_id = auth.uid());

-- Technicians can self-assign pending requests
CREATE POLICY "Technicians can claim requests"
  ON service_requests FOR UPDATE
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'technician'
    )
  )
  WITH CHECK (
    technician_id = auth.uid() AND
    status = 'assigned'
  );

-- Admins can manage all requests
CREATE POLICY "Admins can manage all requests"
  ON service_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- HOST EARNINGS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own earnings
CREATE POLICY "Hosts can view own earnings"
  ON host_earnings FOR SELECT
  USING (host_id = auth.uid());

-- System can create/update earnings records
CREATE POLICY "System can manage earnings"
  ON host_earnings FOR ALL
  USING (true); -- Protected by application logic and cron jobs

-- Admins can view all earnings
CREATE POLICY "Admins can view all earnings"
  ON host_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTION FOR ROLE CHECKS
-- ============================================================================

-- Function to check if current user has a specific role
CREATE OR REPLACE FUNCTION auth.has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own profile" ON users IS 
  'Users can view their own user record';

COMMENT ON POLICY "Public can view online hotspots" ON hotspots IS 
  'Public discovery of active hotspots for the map/list view';

COMMENT ON POLICY "Users can view own vouchers" ON vouchers IS 
  'Users can view vouchers they have purchased';

COMMENT ON FUNCTION auth.has_role IS 
  'Helper function to check if authenticated user has a specific role';
