-- ZemNet Database Schema - Row Level Security Policies (FIXED)
-- Uses public.profiles instead of users table

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_earnings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION FOR ROLE CHECKS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role::text = required_role
  );
$$;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing role or wallet_balance
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    wallet_balance = (SELECT wallet_balance FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role('admin'));

-- Admins can update any profile
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role('admin'));

-- Public profile creation (handled by trigger, but allow insert)
CREATE POLICY "Allow profile creation"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- HOTSPOTS TABLE POLICIES
-- ============================================================================

-- Anyone can view online hotspots (for discovery)
CREATE POLICY "Public can view online hotspots"
  ON public.hotspots FOR SELECT
  USING (is_online = true);

-- Hosts can view their own hotspots (even if offline)
CREATE POLICY "Hosts can view own hotspots"
  ON public.hotspots FOR SELECT
  USING (host_id = auth.uid());

-- Hosts can create hotspots
CREATE POLICY "Hosts can create hotspots"
  ON public.hotspots FOR INSERT
  WITH CHECK (
    host_id = auth.uid() AND
    (public.has_role('host') OR public.has_role('admin'))
  );

-- Hosts can update their own hotspots
CREATE POLICY "Hosts can update own hotspots"
  ON public.hotspots FOR UPDATE
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Hosts can delete their own hotspots
CREATE POLICY "Hosts can delete own hotspots"
  ON public.hotspots FOR DELETE
  USING (host_id = auth.uid());

-- Admins can manage all hotspots
CREATE POLICY "Admins can manage hotspots"
  ON public.hotspots FOR ALL
  USING (public.has_role('admin'));

-- ============================================================================
-- PLANS TABLE POLICIES
-- ============================================================================

-- Anyone can view active plans
CREATE POLICY "Public can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- Hosts can view their own plans (even inactive)
CREATE POLICY "Hosts can view own plans"
  ON public.plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hotspots
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  );

-- Hosts can create plans for their hotspots
CREATE POLICY "Hosts can create plans"
  ON public.plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hotspots
      WHERE id = hotspot_id AND host_id = auth.uid()
    )
  );

-- Hosts can update their own plans
CREATE POLICY "Hosts can update own plans"
  ON public.plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.hotspots
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  );

-- Hosts can delete their own plans
CREATE POLICY "Hosts can delete own plans"
  ON public.plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.hotspots
      WHERE id = plans.hotspot_id AND host_id = auth.uid()
    )
  );

-- ============================================================================
-- VOUCHERS TABLE POLICIES
-- ============================================================================

-- Users can view their own vouchers
CREATE POLICY "Users can view own vouchers"
  ON public.vouchers FOR SELECT
  USING (user_id = auth.uid());

-- Hosts can view vouchers for their hotspots
CREATE POLICY "Hosts can view hotspot vouchers"
  ON public.vouchers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hotspots
      WHERE id = vouchers.hotspot_id AND host_id = auth.uid()
    )
  );

-- System can create vouchers (via purchase flow)
CREATE POLICY "Authenticated users can create vouchers"
  ON public.vouchers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own vouchers (e.g., marking as used)
CREATE POLICY "Users can update own vouchers"
  ON public.vouchers FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- SESSIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vouchers
      WHERE id = sessions.voucher_id AND user_id = auth.uid()
    )
  );

-- Hosts can view sessions on their hotspots
CREATE POLICY "Hosts can view hotspot sessions"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vouchers v
      JOIN public.hotspots h ON h.id = v.hotspot_id
      WHERE v.id = sessions.voucher_id AND h.host_id = auth.uid()
    )
  );

-- System can create sessions
CREATE POLICY "Authenticated users can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vouchers
      WHERE id = voucher_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- PURCHASES TABLE POLICIES
-- ============================================================================

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (user_id = auth.uid());

-- Hosts can view purchases for their hotspots
CREATE POLICY "Hosts can view hotspot purchases"
  ON public.purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hotspots
      WHERE id = purchases.hotspot_id AND host_id = auth.uid()
    )
  );

-- Users can create purchases
CREATE POLICY "Users can create purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- System can update purchases (payment status)
CREATE POLICY "Users can update own purchases"
  ON public.purchases FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own transaction history
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid());

-- System can create transactions
CREATE POLICY "System can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.has_role('admin'));

-- ============================================================================
-- CASHIN REQUESTS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own cashin requests
CREATE POLICY "Hosts can view own cashin requests"
  ON public.cashin_requests FOR SELECT
  USING (host_id = auth.uid());

-- Users can view their own cashin requests
CREATE POLICY "Users can view their cashin requests"
  ON public.cashin_requests FOR SELECT
  USING (user_id = auth.uid());

-- Hosts can create cashin requests
CREATE POLICY "Hosts can create cashin requests"
  ON public.cashin_requests FOR INSERT
  WITH CHECK (
    host_id = auth.uid() AND
    (public.has_role('host') OR public.has_role('admin'))
  );

-- Hosts can update their own cashin requests
CREATE POLICY "Hosts can update own cashin requests"
  ON public.cashin_requests FOR UPDATE
  USING (host_id = auth.uid());

-- ============================================================================
-- KYC SUBMISSIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own KYC submission
CREATE POLICY "Users can view own KYC"
  ON public.kyc_submissions FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their KYC submission
CREATE POLICY "Users can create KYC"
  ON public.kyc_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their pending KYC submission
CREATE POLICY "Users can update pending KYC"
  ON public.kyc_submissions FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Admins can view all KYC submissions
CREATE POLICY "Admins can view all KYC"
  ON public.kyc_submissions FOR SELECT
  USING (public.has_role('admin'));

-- Admins can update any KYC submission
CREATE POLICY "Admins can review KYC"
  ON public.kyc_submissions FOR UPDATE
  USING (public.has_role('admin'));

-- ============================================================================
-- PAYOUTS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own payout requests
CREATE POLICY "Hosts can view own payouts"
  ON public.payouts FOR SELECT
  USING (host_id = auth.uid());

-- Hosts can create payout requests
CREATE POLICY "Hosts can create payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (
    host_id = auth.uid() AND
    (public.has_role('host') OR public.has_role('admin'))
  );

-- Hosts can cancel their pending payouts
CREATE POLICY "Hosts can cancel pending payouts"
  ON public.payouts FOR UPDATE
  USING (host_id = auth.uid() AND status = 'pending');

-- Admins can view all payouts
CREATE POLICY "Admins can view all payouts"
  ON public.payouts FOR SELECT
  USING (public.has_role('admin'));

-- Admins can update any payout
CREATE POLICY "Admins can process payouts"
  ON public.payouts FOR UPDATE
  USING (public.has_role('admin'));

-- ============================================================================
-- SERVICE REQUESTS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own service requests
CREATE POLICY "Hosts can view own service requests"
  ON public.service_requests FOR SELECT
  USING (host_id = auth.uid());

-- Technicians can view assigned service requests
CREATE POLICY "Technicians can view assigned requests"
  ON public.service_requests FOR SELECT
  USING (
    technician_id = auth.uid() OR
    (public.has_role('technician') AND status = 'pending')
  );

-- Hosts can create service requests
CREATE POLICY "Hosts can create service requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (host_id = auth.uid());

-- Hosts can update their own service requests
CREATE POLICY "Hosts can update own service requests"
  ON public.service_requests FOR UPDATE
  USING (host_id = auth.uid());

-- Technicians can update assigned requests
CREATE POLICY "Technicians can update assigned requests"
  ON public.service_requests FOR UPDATE
  USING (technician_id = auth.uid());

-- Admins can manage all service requests
CREATE POLICY "Admins can manage service requests"
  ON public.service_requests FOR ALL
  USING (public.has_role('admin'));

-- ============================================================================
-- HOST EARNINGS TABLE POLICIES
-- ============================================================================

-- Hosts can view their own earnings
CREATE POLICY "Hosts can view own earnings"
  ON public.host_earnings FOR SELECT
  USING (host_id = auth.uid());

-- System can create/update earnings records
CREATE POLICY "Hosts can manage own earnings"
  ON public.host_earnings FOR ALL
  USING (host_id = auth.uid());

-- Admins can view all host earnings
CREATE POLICY "Admins can view all earnings"
  ON public.host_earnings FOR SELECT
  USING (public.has_role('admin'));

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute on helper function
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;
