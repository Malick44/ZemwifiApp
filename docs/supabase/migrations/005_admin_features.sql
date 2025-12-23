-- ZemNet Database Schema - Admin Features
-- Created: 2025-12-18
-- Description: Admin dashboard, activity logs, system settings, and admin operations

-- ============================================================================
-- ADMIN TABLES
-- ============================================================================

-- Admin activity logs (audit trail)
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'kyc_approve', 'kyc_reject', 'payout_approve', 'user_ban', etc.
  target_type VARCHAR(50), -- 'user', 'hotspot', 'payout', 'kyc_submission', etc.
  target_id UUID, -- ID of the affected entity
  details JSONB, -- Additional context (old/new values, reason, etc.)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action_type CHECK (action_type IN (
    'kyc_approve', 'kyc_reject',
    'payout_approve', 'payout_reject', 'payout_complete',
    'user_ban', 'user_unban', 'user_role_change',
    'hotspot_disable', 'hotspot_enable',
    'system_setting_change',
    'report_generate', 'bulk_action'
  ))
);

-- System settings (configurable platform parameters)
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'payments', 'fees', 'limits', etc.
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Can non-admins read this setting?
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform statistics (cached aggregations for admin dashboard)
CREATE TABLE platform_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_date DATE NOT NULL UNIQUE,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_users_today INTEGER NOT NULL DEFAULT 0,
  total_hosts INTEGER NOT NULL DEFAULT 0,
  new_hosts_today INTEGER NOT NULL DEFAULT 0,
  total_hotspots INTEGER NOT NULL DEFAULT 0,
  active_hotspots INTEGER NOT NULL DEFAULT 0,
  total_revenue BIGINT NOT NULL DEFAULT 0, -- Total sales
  platform_revenue BIGINT NOT NULL DEFAULT 0, -- Platform fees collected
  total_purchases INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  avg_session_duration INTEGER, -- In seconds
  pending_kyc INTEGER NOT NULL DEFAULT 0,
  pending_payouts INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  uptime_percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User reports (admin-submitted reports about users/hosts)
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be null for system-generated
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- 'fraud', 'abuse', 'spam', 'poor_service', 'other'
  description TEXT NOT NULL,
  evidence JSONB, -- URLs, screenshots, transaction IDs, etc.
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_report_type CHECK (report_type IN (
    'fraud', 'abuse', 'spam', 'poor_service', 'inappropriate_content', 'other'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'investigating', 'resolved', 'dismissed'
  ))
);

-- ============================================================================
-- INDEXES FOR ADMIN TABLES
-- ============================================================================

CREATE INDEX idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX idx_admin_logs_target ON admin_activity_logs(target_type, target_id);
CREATE INDEX idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

CREATE INDEX idx_platform_stats_date ON platform_statistics(stat_date DESC);

CREATE INDEX idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_created_at ON user_reports(created_at DESC);

-- ============================================================================
-- ADMIN FUNCTIONS
-- ============================================================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type VARCHAR,
  p_target_type VARCHAR,
  p_target_id UUID,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;
  
  INSERT INTO admin_activity_logs (
    admin_id,
    action_type,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_id,
    p_action_type,
    p_target_type,
    p_target_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve KYC submission
CREATE OR REPLACE FUNCTION admin_approve_kyc(
  p_admin_id UUID,
  p_submission_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;
  
  -- Get user_id and update KYC submission
  UPDATE kyc_submissions
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    reviewer_notes = p_notes
  WHERE id = p_submission_id
  RETURNING user_id INTO v_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'KYC submission not found';
  END IF;
  
  -- Update user's KYC status
  UPDATE users
  SET 
    kyc_status = 'approved',
    kyc_reviewed_at = NOW()
  WHERE id = v_user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id,
    'kyc_approve',
    'kyc_submission',
    p_submission_id,
    jsonb_build_object('user_id', v_user_id, 'notes', p_notes)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reject KYC submission
CREATE OR REPLACE FUNCTION admin_reject_kyc(
  p_admin_id UUID,
  p_submission_id UUID,
  p_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;
  
  IF p_notes IS NULL OR p_notes = '' THEN
    RAISE EXCEPTION 'Rejection notes are required';
  END IF;
  
  -- Get user_id and update KYC submission
  UPDATE kyc_submissions
  SET 
    status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    reviewer_notes = p_notes
  WHERE id = p_submission_id
  RETURNING user_id INTO v_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'KYC submission not found';
  END IF;
  
  -- Update user's KYC status
  UPDATE users
  SET 
    kyc_status = 'rejected',
    kyc_reviewed_at = NOW(),
    kyc_reviewer_notes = p_notes
  WHERE id = v_user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id,
    'kyc_reject',
    'kyc_submission',
    p_submission_id,
    jsonb_build_object('user_id', v_user_id, 'notes', p_notes)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to complete payout
CREATE OR REPLACE FUNCTION admin_complete_payout(
  p_admin_id UUID,
  p_payout_id UUID,
  p_reference TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payout RECORD;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;
  
  IF p_reference IS NULL OR p_reference = '' THEN
    RAISE EXCEPTION 'Payment reference is required';
  END IF;
  
  -- Get payout details
  SELECT * INTO v_payout FROM payouts WHERE id = p_payout_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found';
  END IF;
  
  IF v_payout.status != 'pending' AND v_payout.status != 'processing' THEN
    RAISE EXCEPTION 'Payout is not in pending/processing status';
  END IF;
  
  -- Update payout status
  UPDATE payouts
  SET 
    status = 'completed',
    reference = p_reference,
    completed_at = NOW()
  WHERE id = p_payout_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id,
    'payout_complete',
    'payout',
    p_payout_id,
    jsonb_build_object(
      'host_id', v_payout.host_id,
      'amount', v_payout.amount,
      'reference', p_reference
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to fail payout
CREATE OR REPLACE FUNCTION admin_fail_payout(
  p_admin_id UUID,
  p_payout_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payout RECORD;
  v_host RECORD;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;
  
  IF p_reason IS NULL OR p_reason = '' THEN
    RAISE EXCEPTION 'Failure reason is required';
  END IF;
  
  -- Get payout details
  SELECT * INTO v_payout FROM payouts WHERE id = p_payout_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found';
  END IF;
  
  IF v_payout.status != 'pending' AND v_payout.status != 'processing' THEN
    RAISE EXCEPTION 'Payout is not in pending/processing status';
  END IF;
  
  -- Get host details
  SELECT * INTO v_host FROM users WHERE id = v_payout.host_id;
  
  -- Refund the amount to host wallet (it was deducted when payout was created)
  UPDATE users
  SET wallet_balance = wallet_balance + v_payout.amount
  WHERE id = v_payout.host_id;
  
  -- Create refund transaction
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
    'refund',
    v_payout.amount,
    v_host.wallet_balance,
    v_host.wallet_balance + v_payout.amount,
    p_payout_id,
    'payout',
    'Payout failed: ' || p_reason
  );
  
  -- Update payout status
  UPDATE payouts
  SET 
    status = 'failed',
    failed_at = NOW(),
    failure_reason = p_reason
  WHERE id = p_payout_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id,
    'payout_reject',
    'payout',
    p_payout_id,
    jsonb_build_object(
      'host_id', v_payout.host_id,
      'amount', v_payout.amount,
      'reason', p_reason
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to ban/unban user
CREATE OR REPLACE FUNCTION admin_toggle_user_status(
  p_admin_id UUID,
  p_user_id UUID,
  p_is_active BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;
  
  -- Cannot ban yourself
  IF p_admin_id = p_user_id THEN
    RAISE EXCEPTION 'Cannot change your own status';
  END IF;
  
  -- Update user status
  UPDATE users
  SET is_active = p_is_active
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id,
    CASE WHEN p_is_active THEN 'user_unban' ELSE 'user_ban' END,
    'user',
    p_user_id,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform statistics for dashboard
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE(
  total_users BIGINT,
  active_users_today BIGINT,
  total_hosts BIGINT,
  total_hotspots BIGINT,
  active_hotspots BIGINT,
  pending_kyc BIGINT,
  pending_payouts BIGINT,
  total_revenue_today BIGINT,
  total_purchases_today BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM users WHERE role != 'admin'),
    (SELECT COUNT(*) FROM users WHERE last_login_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM users WHERE role = 'host'),
    (SELECT COUNT(*) FROM hotspots),
    (SELECT COUNT(*) FROM hotspots WHERE is_online = TRUE),
    (SELECT COUNT(*) FROM kyc_submissions WHERE status = 'pending'),
    (SELECT COUNT(*) FROM payouts WHERE status = 'pending'),
    (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE payment_status = 'success' AND created_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM purchases WHERE payment_status = 'success' AND created_at >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Function to update daily platform statistics (for cron job)
CREATE OR REPLACE FUNCTION update_platform_statistics()
RETURNS VOID AS $$
DECLARE
  v_stat_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO platform_statistics (
    stat_date,
    total_users,
    new_users_today,
    total_hosts,
    new_hosts_today,
    total_hotspots,
    active_hotspots,
    total_revenue,
    platform_revenue,
    total_purchases,
    total_sessions,
    avg_session_duration,
    pending_kyc,
    pending_payouts
  ) VALUES (
    v_stat_date,
    (SELECT COUNT(*) FROM users WHERE role != 'admin'),
    (SELECT COUNT(*) FROM users WHERE role != 'admin' AND created_at >= v_stat_date),
    (SELECT COUNT(*) FROM users WHERE role = 'host'),
    (SELECT COUNT(*) FROM users WHERE role = 'host' AND created_at >= v_stat_date),
    (SELECT COUNT(*) FROM hotspots),
    (SELECT COUNT(*) FROM hotspots WHERE is_online = TRUE),
    (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE payment_status = 'success'),
    (SELECT COALESCE(SUM(amount), 0) * 0.10 FROM purchases WHERE payment_status = 'success'),
    (SELECT COUNT(*) FROM purchases WHERE payment_status = 'success'),
    (SELECT COUNT(*) FROM sessions),
    (SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at)))::INTEGER FROM sessions WHERE ended_at IS NOT NULL),
    (SELECT COUNT(*) FROM kyc_submissions WHERE status = 'pending'),
    (SELECT COUNT(*) FROM payouts WHERE status = 'pending')
  )
  ON CONFLICT (stat_date)
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users_today = EXCLUDED.new_users_today,
    total_hosts = EXCLUDED.total_hosts,
    new_hosts_today = EXCLUDED.new_hosts_today,
    total_hotspots = EXCLUDED.total_hotspots,
    active_hotspots = EXCLUDED.active_hotspots,
    total_revenue = EXCLUDED.total_revenue,
    platform_revenue = EXCLUDED.platform_revenue,
    total_purchases = EXCLUDED.total_purchases,
    total_sessions = EXCLUDED.total_sessions,
    avg_session_duration = EXCLUDED.avg_session_duration,
    pending_kyc = EXCLUDED.pending_kyc,
    pending_payouts = EXCLUDED.pending_payouts,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ADMIN RLS POLICIES
-- ============================================================================

-- Admin activity logs
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity logs"
  ON admin_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create activity logs"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (true);

-- System settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public settings visible to all"
  ON system_settings FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Admins can view all settings"
  ON system_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage settings"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Platform statistics
ALTER TABLE platform_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view platform stats"
  ON platform_statistics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can manage stats"
  ON platform_statistics FOR ALL
  USING (true);

-- User reports
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON user_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage reports"
  ON user_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SEED DEFAULT SYSTEM SETTINGS
-- ============================================================================

INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('platform_fee_percentage', '10', 'Platform fee percentage on sales', 'fees', false),
  ('cashin_commission_percentage', '2', 'Host commission percentage on cash-in services', 'fees', false),
  ('payout_min_amount', '10000', 'Minimum payout amount in XOF', 'limits', true),
  ('payout_max_amount', '1000000', 'Maximum payout amount in XOF', 'limits', true),
  ('payout_processing_fee', '1000', 'Fixed fee for payout processing', 'fees', true),
  ('voucher_expiry_days', '7', 'Days until voucher expires after purchase', 'general', true),
  ('kyc_required_for_host', 'true', 'Whether KYC is required to become a host', 'general', true),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'general', false),
  ('max_hotspots_per_host', '10', 'Maximum hotspots a single host can create', 'limits', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_stats_updated_at
  BEFORE UPDATE ON platform_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE admin_activity_logs IS 
  'Audit trail of all admin actions for compliance and security';

COMMENT ON TABLE system_settings IS 
  'Configurable platform parameters (fees, limits, toggles)';

COMMENT ON TABLE platform_statistics IS 
  'Daily aggregated platform metrics for admin dashboard';

COMMENT ON TABLE user_reports IS 
  'User-submitted reports about problematic users or hosts';

COMMENT ON FUNCTION log_admin_action IS 
  'Creates an audit log entry for admin actions';

COMMENT ON FUNCTION admin_approve_kyc IS 
  'Approves a KYC submission and updates user status';

COMMENT ON FUNCTION admin_reject_kyc IS 
  'Rejects a KYC submission with required notes';

COMMENT ON FUNCTION admin_complete_payout IS 
  'Marks a payout as completed with payment reference';

COMMENT ON FUNCTION admin_fail_payout IS 
  'Marks a payout as failed and refunds the host wallet';

COMMENT ON FUNCTION admin_toggle_user_status IS 
  'Bans or unbans a user account';

COMMENT ON FUNCTION get_platform_stats IS 
  'Returns current platform statistics for admin dashboard';

COMMENT ON FUNCTION update_platform_statistics IS 
  'Updates daily statistics (should be run via cron job)';
