# ZemNet Supabase Database Schema

Complete database schema and migrations for the ZemNet Wi-Fi marketplace application.

## 📋 Overview

This directory contains Supabase migration files that define the complete database schema for ZemNet, including:

- **12 Core Tables** - Users, hotspots, plans, vouchers, sessions, purchases, transactions, cash-in requests, KYC submissions, payouts, service requests, and host earnings
- **10 Enum Types** - For user roles, payment providers, statuses, etc.
- **Comprehensive RLS Policies** - Secure multi-tenant data access
- **Business Logic Functions** - Purchase processing, wallet management, earnings tracking
- **Automated Triggers** - Timestamp updates, voucher code generation, earnings updates
- **Performance Indexes** - Optimized queries for all common operations
- **Test Data** - Complete seed data matching TEST_CREDENTIALS.md

> Repo conventions (important): This prompt repo targets **Expo (React Native)** apps.
> Use `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` in generated clients.
> Client state is expected to be managed with **Zustand** (persist where appropriate).

## 🗂️ Migration Files

### 001_initial_schema.sql
**Core database structure**

- **Tables:**
  - `users` - Application users (customers, hosts, technicians, admins)
  - `hotspots` - Wi-Fi hotspots managed by hosts
  - `plans` - Pricing plans for internet access
  - `vouchers` - Purchased voucher codes
  - `sessions` - Active internet usage sessions
  - `purchases` - Purchase transaction records
  - `transactions` - Wallet transaction history
  - `cashin_requests` - Host-initiated wallet top-ups
  - `kyc_submissions` - KYC verification documents
  - `payouts` - Host withdrawal requests
  - `service_requests` - Technician service requests
  - `host_earnings` - Aggregated earnings data

- **Enums:**
  - `user_role` - guest, user, host, technician, admin
  - `payment_provider` - wave, orange, moov, wallet
  - `payment_status` - pending, success, failed, expired
  - `kyc_status` - pending, approved, rejected
  - `cashin_status` - pending, confirmed, expired, rejected
  - `service_request_type` - router-issue, setup-help, network-problem, etc.
  - `service_request_priority` - low, medium, high, urgent
  - `service_request_status` - pending, assigned, in-progress, completed, cancelled
  - `transaction_type` - purchase, topup, cashin_commission, sales_revenue, payout, refund
  - `payout_status` - pending, processing, completed, failed, cancelled

- **Indexes:** 40+ indexes for optimal query performance

### 002_rls_policies.sql
**Row Level Security policies**

Implements secure multi-tenant access control:

- **Users:** Can view/update own profile; admins can manage all
- **Hotspots:** Public can discover online hotspots; hosts manage their own
- **Plans:** Public can view active plans; hosts manage their own
- **Vouchers:** Users view their own; hosts view their hotspot vouchers
- **Sessions:** Users/hosts view respective sessions
- **Purchases:** Users view their own; hosts view their hotspot sales
- **Transactions:** Users view their own; admins view all
- **Cash-in Requests:** Hosts create; users confirm/reject
- **KYC Submissions:** Users manage their own; admins review all
- **Payouts:** Hosts manage their own; admins process all
- **Service Requests:** Hosts create; technicians claim and update
- **Host Earnings:** Hosts view their own; system updates

### 003_functions_and_triggers.sql
**Database functions and triggers**

- **Timestamp Management:**
  - `update_updated_at_column()` - Auto-update updated_at timestamps
  - Applied to 6 tables via triggers

- **Voucher Management:**
  - `generate_voucher_code()` - Creates unique XXXX-XXXX-XXXX codes
  - `set_voucher_code()` - Auto-generates code on voucher insert
  - `is_voucher_valid()` - Validates voucher codes

- **Payment Processing:**
  - `process_purchase()` - Handles plan purchases, wallet deduction, voucher creation
  - `process_wallet_topup()` - Adds funds to wallet with transaction record
  - `process_cashin()` - Processes host cash-in requests with commission
  - `process_payout()` - Handles host withdrawals

- **Earnings & Analytics:**
  - `update_host_earnings()` - Updates aggregated earnings after purchase
  - `trigger_update_host_earnings()` - Auto-trigger on purchase success
  - `get_host_dashboard_stats()` - Returns dashboard statistics

- **Search & Discovery:**
  - `search_nearby_hotspots()` - Finds hotspots within radius using Haversine formula

### 004_seed_data.sql
**Test data for development**

Matches the test users from `/TEST_CREDENTIALS.md`:

- **5 Test Users:**
  - Fatou Traoré (Regular User) - 2,500 XOF balance
  - Amadou Ouédraogo (Host) - 15,000 XOF balance, KYC approved
  - Ibrahim Sawadogo (Technician) - 8,000 XOF balance
  - Mariam Kaboré (New User) - 0 XOF balance
  - Admin User

- **4 Hotspots in Ouagadougou:**
  - Café du Centre - 4 plans (100-800 XOF)
  - Restaurant Chez Maman - 3 plans (200-600 XOF)
  - Bibliothèque Municipale - 3 plans (150-500 XOF)
  - Hôtel La Paix - 3 plans (250-5000 XOF)

- **Sample Data:**
  - 3 purchases for Fatou (active, used, expired)
  - 6 wallet transactions
  - 1 active session
  - 1 pending cash-in request
  - 1 approved KYC submission
  - 2 service requests (in-progress, pending)
  - Monthly earnings records
  - 1 pending payout

## 🚀 Running Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Initialize Supabase project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Or run migrations individually
supabase migration up
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_and_triggers.sql`
   - `004_seed_data.sql` (optional, for testing)
4. Execute each file

### Option 3: Manual SQL Execution

```bash
# Connect to your database
psql postgres://postgres:[PASSWORD]@[HOST]:5432/postgres

# Run migrations in order
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_rls_policies.sql
\i supabase/migrations/003_functions_and_triggers.sql
\i supabase/migrations/004_seed_data.sql
```

## 🔐 Authentication Setup

This schema integrates with Supabase Auth. You need to:

### 1. Enable Phone Authentication

In Supabase Dashboard > Authentication > Providers:
- Enable **Phone** provider
- Configure your SMS provider (Twilio, MessageBird, etc.)

### 2. Create Auth Users

For each user in the database, create corresponding auth user:

```sql
-- Example for Fatou (done via Supabase Auth API)
-- The user.id should match the UUID in the users table
```

### 3. Configure Auth Trigger

Create a trigger to sync auth.users with public.users:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, role, created_at)
  VALUES (
    NEW.id,
    NEW.phone,
    'user',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 📊 Database Schema Overview

### Entity Relationships

```
users (1) ──────< (∞) hotspots
  │                      │
  │                      │
  │                   (1) └──< (∞) plans
  │                              │
  │                           (1) │
  │                              │
  ├───< (∞) vouchers ────────────┘
  │         │
  │      (1) │
  │         │
  │         └──< (∞) sessions
  │
  ├───< (∞) purchases
  ├───< (∞) transactions
  ├───< (∞) cashin_requests (as host)
  ├───< (∞) cashin_requests (as user)
  ├───< (∞) kyc_submissions
  ├───< (∞) payouts
  ├───< (∞) service_requests (as host)
  ├───< (∞) service_requests (as technician)
  └───< (∞) host_earnings
```

### Key Constraints

- **Wallet Balance:** Always non-negative (`CHECK wallet_balance >= 0`)
- **Transaction Integrity:** `balance_after = balance_before + amount`
- **Price Validation:** All prices > 0
- **Coordinates:** Valid lat/lng ranges
- **MAC Address:** Regex validation for device MACs
- **Phone Numbers:** E.164 format validation

## 🔍 Common Queries

### Find Nearby Hotspots

```sql
SELECT * FROM search_nearby_hotspots(
  12.3714277,  -- latitude (Ouagadougou)
  -1.5196603,  -- longitude
  5            -- radius in km
);
```

### Get Host Dashboard Stats

```sql
SELECT * FROM get_host_dashboard_stats(
  '00000000-0000-0000-0001-000000000002'  -- host user_id
);
```

### Process a Purchase

```sql
SELECT process_purchase(
  '00000000-0000-0000-0001-000000000001',  -- user_id
  '00000000-0000-0000-0002-000000000001',  -- hotspot_id
  '00000000-0000-0000-0003-000000000002',  -- plan_id
  'wallet'                                  -- payment_provider
);
```

### Validate Voucher Code

```sql
SELECT * FROM is_voucher_valid('ABCD-1234-EFGH');
```

### Process Cash-In Request

```sql
SELECT process_cashin(
  '00000000-0000-0000-0006-000000000001'  -- cashin_request_id
);
```

## 📈 Performance Considerations

### Indexes Created

- **Users:** phone, role, kyc_status, created_at
- **Hotspots:** host_id, location (GIST), is_online, created_at
- **Plans:** hotspot_id, is_active, price_xof
- **Vouchers:** code, user_id, hotspot_id, plan_id, expires_at, created_at, used_at
- **Sessions:** voucher_id, started_at, ended_at
- **Purchases:** user_id, hotspot_id, plan_id, payment_status, created_at
- **Transactions:** user_id, type, created_at, reference (composite)
- **All other tables:** Appropriate indexes for common queries

### Query Optimization

- Use `search_nearby_hotspots()` for geospatial queries
- Use `get_host_dashboard_stats()` for aggregated data
- Use `host_earnings` table for historical reporting (pre-aggregated)

## 🔒 Security Features

### Row Level Security (RLS)

- ✅ Enabled on all tables
- ✅ Users can only access their own data
- ✅ Hosts can only manage their own hotspots/plans
- ✅ Technicians can only access assigned requests
- ✅ Admins have full access

### Data Validation

- ✅ Check constraints on all numeric fields
- ✅ Regex validation for phone numbers and MAC addresses
- ✅ Coordinate validation for geo data
- ✅ Status transition validation

### Audit Trail

- ✅ `created_at` on all tables
- ✅ `updated_at` on mutable tables
- ✅ Complete transaction history
- ✅ Status timestamp fields (confirmed_at, reviewed_at, etc.)

## 🧪 Testing

### Verify Migration Success

```sql
-- Check table counts
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check seed data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Hotspots', COUNT(*) FROM hotspots
UNION ALL
SELECT 'Plans', COUNT(*) FROM plans
UNION ALL
SELECT 'Vouchers', COUNT(*) FROM vouchers
UNION ALL
SELECT 'Purchases', COUNT(*) FROM purchases
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions;
```

### Test Business Logic

```sql
-- Test voucher code generation
SELECT generate_voucher_code();

-- Test nearby search
SELECT * FROM search_nearby_hotspots(12.3714277, -1.5196603, 10);

-- Test voucher validation
SELECT * FROM is_voucher_valid('ABCD-1234-EFGH');

-- Test host stats
SELECT * FROM get_host_dashboard_stats('00000000-0000-0000-0001-000000000002');
```

## 📝 Notes

### Currency

All monetary values are stored as **integers in XOF** (West African CFA franc):
- 1 XOF = 1 stored integer
- Example: 1,000 XOF = 1000 in database
- Never use floating point for currency

### Timestamps

- All timestamps use `TIMESTAMPTZ` (timestamp with timezone)
- Server time is UTC
- Application handles timezone conversion

### Data Sizes

- **Data limits** stored in bytes (e.g., 100 MB = 104,857,600 bytes)
- **Duration** stored in seconds (e.g., 1 hour = 3,600 seconds)

### Voucher Codes

- Format: `XXXX-XXXX-XXXX` (12 characters + 2 hyphens)
- Character set: A-Z, 2-9 (excludes 0, 1, O, I for clarity)
- Unique constraint enforced

## 🆘 Troubleshooting

### Migration Fails

```bash
# Check current migration status
supabase migration list

# Repair migration history
supabase migration repair

# Reset database (CAUTION: deletes all data)
supabase db reset
```

### RLS Blocks Queries

```sql
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Check RLS Policies

```sql
-- List all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostGIS for Geospatial](https://postgis.net/documentation/)

## ✅ Checklist

Before deploying to production:

- [ ] Run all migrations in staging environment
- [ ] Verify RLS policies with test users
- [ ] Test all business logic functions
- [ ] Set up database backups
- [ ] Configure SSL connections
- [ ] Enable connection pooling
- [ ] Set up monitoring and alerts
- [ ] Review and adjust indexes based on query patterns
- [ ] Load test with expected traffic
- [ ] Document any custom queries for the team

---

**Last Updated:** December 18, 2025  
**Schema Version:** 1.0.0  
**Compatible with:** Supabase PostgreSQL 15+
