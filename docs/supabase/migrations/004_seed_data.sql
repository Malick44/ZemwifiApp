-- ZemNet Database Schema - Seed Data
-- Created: 2025-12-18
-- Description: Optional seed data for development/testing

-- ============================================================================
-- TEST USERS
-- ============================================================================

-- Insert test users (passwords would be handled by Supabase Auth)
-- These correspond to the test users in /TEST_CREDENTIALS.md

INSERT INTO users (id, phone, name, role, wallet_balance, kyc_status, created_at) VALUES
  -- User 1: Fatou Traoré (Regular User)
  ('00000000-0000-0000-0001-000000000001', '+226 70 12 34 56', 'Fatou Traoré', 'user', 2500, NULL, NOW() - INTERVAL '30 days'),
  
  -- User 2: Amadou Ouédraogo (Host)
  ('00000000-0000-0000-0001-000000000002', '+226 70 23 45 67', 'Amadou Ouédraogo', 'host', 15000, 'approved', NOW() - INTERVAL '90 days'),
  
  -- User 3: Ibrahim Sawadogo (Technician)
  ('00000000-0000-0000-0001-000000000003', '+226 70 34 56 78', 'Ibrahim Sawadogo', 'technician', 8000, 'approved', NOW() - INTERVAL '60 days'),
  
  -- User 4: Mariam Kaboré (New User)
  ('00000000-0000-0000-0001-000000000004', '+226 70 45 67 89', 'Mariam Kaboré', 'user', 0, NULL, NOW() - INTERVAL '2 days'),
  
  -- User 5: Admin User
  ('00000000-0000-0000-0001-000000000005', '+226 70 99 99 99', 'Admin User', 'admin', 0, 'approved', NOW() - INTERVAL '180 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST HOTSPOTS (Ouagadougou)
-- ============================================================================

INSERT INTO hotspots (id, host_id, name, landmark, lat, lng, ssid, is_online, sales_paused, hours, created_at) VALUES
  -- Hotspot 1: Café du Centre
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0001-000000000002', -- Amadou's hotspot
    'Café du Centre',
    'Près du marché central, Avenue Kwame Nkrumah',
    12.3714277,
    -1.5196603,
    'ZemNet-CafeduCentre',
    TRUE,
    FALSE,
    '08:00 - 22:00',
    NOW() - INTERVAL '60 days'
  ),
  
  -- Hotspot 2: Restaurant Chez Maman
  (
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0001-000000000002',
    'Restaurant Chez Maman',
    'Zone 1, à côté de la grande mosquée',
    12.3678,
    -1.5272,
    'ZemNet-ChezMaman',
    TRUE,
    FALSE,
    '10:00 - 23:00',
    NOW() - INTERVAL '45 days'
  ),
  
  -- Hotspot 3: Bibliothèque Municipale
  (
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0001-000000000002',
    'Bibliothèque Municipale',
    'Avenue de la Nation, près du rond-point des Nations Unies',
    12.3665,
    -1.5304,
    'ZemNet-BiblioMunicipale',
    TRUE,
    FALSE,
    '08:00 - 20:00',
    NOW() - INTERVAL '30 days'
  ),
  
  -- Hotspot 4: Hôtel La Paix
  (
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0001-000000000002',
    'Hôtel La Paix',
    'Quartier Gounghin, Route de Kaya',
    12.3891,
    -1.5089,
    'ZemNet-HotelLaPaix',
    TRUE,
    FALSE,
    '24/7',
    NOW() - INTERVAL '20 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST PLANS
-- ============================================================================

INSERT INTO plans (id, hotspot_id, name, duration_seconds, data_bytes, price_xof, is_active, created_at) VALUES
  -- Plans for Café du Centre
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', '30 minutes', 1800, 52428800, 100, TRUE, NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', '1 heure', 3600, 104857600, 150, TRUE, NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001', '2 heures', 7200, 209715200, 250, TRUE, NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000001', 'Journée', 28800, 1073741824, 800, TRUE, NOW() - INTERVAL '60 days'),
  
  -- Plans for Restaurant Chez Maman
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000002', '1 heure', 3600, 104857600, 200, TRUE, NOW() - INTERVAL '45 days'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000002', '3 heures', 10800, 314572800, 400, TRUE, NOW() - INTERVAL '45 days'),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000002', 'Soirée (5h)', 18000, 524288000, 600, TRUE, NOW() - INTERVAL '45 days'),
  
  -- Plans for Bibliothèque Municipale
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000003', '2 heures', 7200, 209715200, 150, TRUE, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000003', 'Demi-journée', 14400, 524288000, 300, TRUE, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000003', 'Journée complète', 28800, 1073741824, 500, TRUE, NOW() - INTERVAL '30 days'),
  
  -- Plans for Hôtel La Paix
  ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000004', '1 heure', 3600, 209715200, 250, TRUE, NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000004', '24 heures', 86400, 2147483648, 1000, TRUE, NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000004', 'Week Pass', 604800, 10737418240, 5000, TRUE, NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST PURCHASES & VOUCHERS FOR FATOU
-- ============================================================================

-- Purchase 1: Active voucher (1 hour at Café du Centre)
INSERT INTO purchases (id, user_id, hotspot_id, plan_id, amount, payment_provider, payment_status, created_at) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000002', 150, 'wallet', 'success', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vouchers (id, code, user_id, hotspot_id, plan_id, purchase_id, expires_at, created_at) VALUES
  ('00000000-0000-0000-0005-000000000001', 'ABCD-1234-EFGH', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0004-000000000001', NOW() + INTERVAL '5 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Purchase 2: Used voucher
INSERT INTO purchases (id, user_id, hotspot_id, plan_id, amount, payment_provider, payment_status, created_at) VALUES
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 100, 'orange', 'success', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vouchers (id, code, user_id, hotspot_id, plan_id, purchase_id, expires_at, created_at, used_at, device_mac) VALUES
  ('00000000-0000-0000-0005-000000000002', 'WXYZ-5678-MNOP', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0004-000000000002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', 'AA:BB:CC:DD:EE:FF')
ON CONFLICT (id) DO NOTHING;

-- Purchase 3: Expired voucher
INSERT INTO purchases (id, user_id, hotspot_id, plan_id, amount, payment_provider, payment_status, created_at) VALUES
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000005', 200, 'wave', 'success', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vouchers (id, code, user_id, hotspot_id, plan_id, purchase_id, expires_at, created_at) VALUES
  ('00000000-0000-0000-0005-000000000003', 'QRST-9012-UVWX', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0004-000000000003', NOW() - INTERVAL '23 days', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST TRANSACTIONS FOR FATOU
-- ============================================================================

INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description, created_at) VALUES
  -- Initial top-up
  ('00000000-0000-0000-0001-000000000001', 'topup', 5000, 0, 5000, NULL, NULL, 'Initial wallet top-up', NOW() - INTERVAL '15 days'),
  
  -- Purchase 1
  ('00000000-0000-0000-0001-000000000001', 'purchase', -150, 5000, 4850, '00000000-0000-0000-0004-000000000001', 'purchase', 'Purchase: 1 heure', NOW() - INTERVAL '2 days'),
  
  -- Purchase 2 (from Orange Money)
  ('00000000-0000-0000-0001-000000000001', 'purchase', 0, 4850, 4850, '00000000-0000-0000-0004-000000000002', 'purchase', 'Purchase via Orange Money', NOW() - INTERVAL '10 days'),
  
  -- Another top-up
  ('00000000-0000-0000-0001-000000000001', 'topup', 2000, 4850, 6850, NULL, NULL, 'Wallet top-up via Wave', NOW() - INTERVAL '5 days'),
  
  -- Purchase 3
  ('00000000-0000-0000-0001-000000000001', 'purchase', 0, 6850, 6850, '00000000-0000-0000-0004-000000000003', 'purchase', 'Purchase via Wave', NOW() - INTERVAL '30 days'),
  
  -- Cash withdrawal
  ('00000000-0000-0000-0001-000000000001', 'payout', -4350, 6850, 2500, NULL, NULL, 'Withdrawal to Orange Money', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEST SESSION (for used voucher)
-- ============================================================================

INSERT INTO sessions (voucher_id, device_mac, started_at, ended_at, data_used) VALUES
  ('00000000-0000-0000-0005-000000000002', 'AA:BB:CC:DD:EE:FF', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '25 minutes', 45678901)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEST CASH-IN REQUEST
-- ============================================================================

INSERT INTO cashin_requests (id, host_id, user_id, user_phone, amount, commission, status, expires_at, created_at) VALUES
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0001-000000000001', '+226 70 12 34 56', 1000, 20, 'pending', NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '2 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST KYC SUBMISSION (for Amadou)
-- ============================================================================

INSERT INTO kyc_submissions (id, user_id, full_name, id_type, id_number, id_photo_url, selfie_photo_url, address, city, country, date_of_birth, business_name, status, submitted_at, reviewed_at, reviewed_by) VALUES
  (
    '00000000-0000-0000-0007-000000000001',
    '00000000-0000-0000-0001-000000000002',
    'Amadou Ouédraogo',
    'national_id',
    'BF123456789',
    'https://example.com/kyc/id.jpg',
    'https://example.com/kyc/selfie.jpg',
    '123 Avenue Kwame Nkrumah',
    'Ouagadougou',
    'BF',
    '1985-06-15',
    'Café du Centre',
    'approved',
    NOW() - INTERVAL '85 days',
    NOW() - INTERVAL '80 days',
    '00000000-0000-0000-0001-000000000005'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST SERVICE REQUEST
-- ============================================================================

INSERT INTO service_requests (id, host_id, hotspot_id, technician_id, type, priority, status, title, description, location, created_at, assigned_at, started_at) VALUES
  (
    '00000000-0000-0000-0008-000000000001',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0001-000000000003',
    'router-issue',
    'high',
    'in-progress',
    'Router keeps disconnecting',
    'The router at Café du Centre keeps dropping connections every 30 minutes. Customers are complaining.',
    'Café du Centre, Avenue Kwame Nkrumah',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour'
  ),
  (
    '00000000-0000-0000-0008-000000000002',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0002-000000000003',
    NULL,
    'setup-help',
    'medium',
    'pending',
    'Need help configuring new router',
    'I just received a new router and need help setting it up for the hotspot.',
    'Bibliothèque Municipale, Avenue de la Nation',
    NOW() - INTERVAL '6 hours',
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST HOST EARNINGS (for Amadou)
-- ============================================================================

-- Current month earnings
INSERT INTO host_earnings (
  host_id, 
  period_start, 
  period_end, 
  total_sales, 
  platform_fee, 
  cashin_commission, 
  net_earnings, 
  purchases_count, 
  cashin_count
) VALUES (
  '00000000-0000-0000-0001-000000000002',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
  3500,
  350,
  80,
  3230,
  18,
  4
)
ON CONFLICT (host_id, period_start, period_end) DO NOTHING;

-- Last month earnings
INSERT INTO host_earnings (
  host_id, 
  period_start, 
  period_end, 
  total_sales, 
  platform_fee, 
  cashin_commission, 
  net_earnings, 
  purchases_count, 
  cashin_count
) VALUES (
  '00000000-0000-0000-0001-000000000002',
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE,
  12500,
  1250,
  250,
  11500,
  65,
  12
)
ON CONFLICT (host_id, period_start, period_end) DO NOTHING;

-- ============================================================================
-- TEST PAYOUT REQUEST
-- ============================================================================

INSERT INTO payouts (id, host_id, amount, fee, net_amount, payment_provider, payment_account, status, requested_at) VALUES
  ('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0001-000000000002', 10000, 200, 9800, 'orange', '+226 70 23 45 67', 'pending', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Display inserted counts
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users WHERE id LIKE '00000000-0000-0000-0001-%');
  RAISE NOTICE 'Hotspots: %', (SELECT COUNT(*) FROM hotspots WHERE id LIKE '00000000-0000-0000-0002-%');
  RAISE NOTICE 'Plans: %', (SELECT COUNT(*) FROM plans WHERE id LIKE '00000000-0000-0000-0003-%');
  RAISE NOTICE 'Purchases: %', (SELECT COUNT(*) FROM purchases WHERE id LIKE '00000000-0000-0000-0004-%');
  RAISE NOTICE 'Vouchers: %', (SELECT COUNT(*) FROM vouchers WHERE id LIKE '00000000-0000-0000-0005-%');
  RAISE NOTICE 'Transactions: %', (SELECT COUNT(*) FROM transactions WHERE user_id LIKE '00000000-0000-0000-0001-%');
END $$;
