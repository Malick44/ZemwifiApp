# ZemNet Database Schema - Visual Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      USERS       │
├──────────────────┤
│ id (PK)          │◄────┐
│ phone            │     │
│ name             │     │
│ role             │     │
│ wallet_balance   │     │
│ kyc_status       │     │
└──────────────────┘     │
         │               │
         │               │
         │ 1:N           │ 1:1
         ▼               │
┌──────────────────┐     │
│    HOTSPOTS      │     │
├──────────────────┤     │
│ id (PK)          │     │
│ host_id (FK)─────┘     │
│ name             │     │
│ landmark         │     │
│ lat, lng         │     │
│ ssid             │     │
│ is_online        │     │
│ sales_paused     │     │
└──────────────────┘     │
         │               │
         │ 1:N           │
         ▼               │
┌──────────────────┐     │
│      PLANS       │     │
├──────────────────┤     │
│ id (PK)          │     │
│ hotspot_id (FK)──┘     │
│ name             │     │
│ duration_seconds │     │
│ data_bytes       │     │
│ price_xof        │     │
│ is_active        │     │
└──────────────────┘     │
         │               │
         │ 1:N           │
         ▼               │
┌──────────────────┐     │
│    VOUCHERS      │     │
├──────────────────┤     │
│ id (PK)          │     │
│ code             │     │
│ user_id (FK)─────┼─────┘
│ hotspot_id (FK)  │
│ plan_id (FK)     │
│ purchase_id (FK) │
│ expires_at       │
│ used_at          │
│ device_mac       │
└──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│    SESSIONS      │
├──────────────────┤
│ id (PK)          │
│ voucher_id (FK)──┘
│ device_mac       │
│ started_at       │
│ ended_at         │
│ data_used        │
└──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           TRANSACTION ENTITIES                              │
└─────────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────┐
        │      USERS       │
        └──────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        │ 1:N    │ 1:N    │ 1:N
        ▼        ▼        ▼
┌────────────┐ ┌──────────────┐ ┌──────────────────┐
│ PURCHASES  │ │ TRANSACTIONS │ │ CASHIN_REQUESTS  │
├────────────┤ ├──────────────┤ ├──────────────────┤
│ id (PK)    │ │ id (PK)      │ │ id (PK)          │
│ user_id    │ │ user_id (FK) │ │ host_id (FK)     │
│ hotspot_id │ │ type         │ │ user_id (FK)     │
│ plan_id    │ │ amount       │ │ user_phone       │
│ voucher_id │ │ balance_*    │ │ amount           │
│ amount     │ │ reference_id │ │ commission       │
│ provider   │ │ description  │ │ status           │
│ status     │ │ metadata     │ │ qr_code          │
└────────────┘ └──────────────┘ │ expires_at       │
                                └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             HOST FEATURES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────┐
        │   USERS (HOST)   │
        └──────────────────┘
                 │
        ┌────────┼────────┬────────┐
        │        │        │        │
        │ 1:1    │ 1:N    │ 1:N    │ 1:N
        ▼        ▼        ▼        ▼
┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐
│    KYC     │ │ EARNINGS │ │ PAYOUTS  │ │ SERVICE_REQUESTS │
│ SUBMISSIONS│ ├──────────┤ ├──────────┤ ├──────────────────┤
├────────────┤ │ id (PK)  │ │ id (PK)  │ │ id (PK)          │
│ id (PK)    │ │ host_id  │ │ host_id  │ │ host_id (FK)     │
│ user_id    │ │ period_* │ │ amount   │ │ hotspot_id (FK)  │
│ full_name  │ │ total_$  │ │ fee      │ │ technician_id    │
│ id_type    │ │ platform │ │ provider │ │ type             │
│ id_number  │ │   _fee   │ │ account  │ │ priority         │
│ id_photo   │ │ cashin_$ │ │ status   │ │ status           │
│ selfie     │ │ net_$    │ │ ref      │ │ title            │
│ address    │ │ count    │ │ dates    │ │ description      │
│ status     │ └──────────┘ └──────────┘ │ location         │
└────────────┘                           │ photos           │
                                         │ resolution       │
                                         │ rating           │
                                         └──────────────────┘

┌─────────────────────────────────────��───────────────────────────────────────┐
│                          DATA FLOW DIAGRAMS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

PURCHASE FLOW
─────────────
   User
    │
    │ 1. Select Plan
    ▼
   Plan ──────┐
              │
    ┌─────────┘
    │ 2. Create Purchase
    ▼
  Purchase
    │
    │ 3. Deduct Wallet (if wallet payment)
    ▼
  Users.wallet_balance--
    │
    │ 4. Create Transaction
    ▼
  Transaction
    │
    │ 5. Create Voucher
    ▼
  Voucher
    │
    │ 6. Update Host Earnings
    ▼
  Host_Earnings


CASH-IN FLOW
────────────
   Host
    │
    │ 1. Create Request
    ▼
  CashIn_Request
    │
    │ 2. Customer Scans QR
    ▼
   User
    │
    │ 3. Confirm Request
    ▼
  CashIn_Request.status = confirmed
    │
    ├──► User.wallet_balance += amount
    │
    └──► Host.wallet_balance += commission
         │
         └──► Create 2 Transactions


SESSION FLOW
────────────
  Voucher
    │
    │ 1. Validate (not used, not expired)
    ▼
  is_voucher_valid() = true
    │
    │ 2. Start Session
    ▼
  Session.started_at = NOW()
    │
    │ 3. Track Usage
    ▼
  Session.data_used++
    │
    │ 4. End Session
    ▼
  Session.ended_at = NOW()
    │
    │ 5. Mark Voucher Used
    ▼
  Voucher.used_at = NOW()


PAYOUT FLOW
───────────
   Host
    │
    │ 1. Request Payout
    ▼
  Payout.status = pending
    │
    │ 2. Admin Processes
    ▼
  process_payout()
    │
    ├──► Validate Balance
    │
    ├──► Deduct from Wallet
    │
    ├──► Create Transaction
    │
    └──► Update Status
         Payout.status = processing


SERVICE REQUEST FLOW
────────────────────
   Host
    │
    │ 1. Create Request
    ▼
  Service_Request.status = pending
    │
    │ 2. Technician Claims
    ▼
  Service_Request.technician_id = tech_id
  Service_Request.status = assigned
    │
    │ 3. Start Work
    ▼
  Service_Request.status = in-progress
    │
    │ 4. Complete Work
    ▼
  Service_Request.status = completed
  Service_Request.resolution = "..."
    │
    │ 5. Host Rates
    ▼
  Service_Request.rating = 1-5


┌─────────────────────────────────────────────────────────────────────────────┐
│                         INDEX OPTIMIZATION MAP                              │
└─────────────────────────────────────────────────────────────────────────────┘

USERS
  ├─ idx_users_phone (UNIQUE)          → Login
  ├─ idx_users_role                    → Role filtering
  ├─ idx_users_kyc_status              → KYC queue
  └─ idx_users_created_at (DESC)       → Recent users

HOTSPOTS
  ├─ idx_hotspots_host_id              → Host's hotspots
  ├─ idx_hotspots_location (GIST)      → Nearby search
  ├─ idx_hotspots_is_online            → Active hotspots
  └─ idx_hotspots_created_at (DESC)    → Recent additions

PLANS
  ├─ idx_plans_hotspot_id              → Plans per hotspot
  ├─ idx_plans_is_active               → Active plans
  └─ idx_plans_price_xof               → Price sorting

VOUCHERS
  ├─ idx_vouchers_code (UNIQUE)        → Voucher lookup
  ├─ idx_vouchers_user_id              → User's vouchers
  ├─ idx_vouchers_hotspot_id           → Hotspot vouchers
  ├─ idx_vouchers_plan_id              → Plan usage
  ├─ idx_vouchers_expires_at           → Expiry cleanup
  ├─ idx_vouchers_created_at (DESC)    → Recent vouchers
  └─ idx_vouchers_used_at              → Usage analytics

SESSIONS
  ├─ idx_sessions_voucher_id           → Session lookup
  ├─ idx_sessions_started_at (DESC)    → Recent sessions
  └─ idx_sessions_ended_at             → Active sessions

PURCHASES
  ├─ idx_purchases_user_id             → User history
  ├─ idx_purchases_hotspot_id          → Hotspot sales
  ├─ idx_purchases_plan_id             → Plan popularity
  ├─ idx_purchases_payment_status      → Status filtering
  └─ idx_purchases_created_at (DESC)   → Recent purchases

TRANSACTIONS
  ├─ idx_transactions_user_id          → User history
  ├─ idx_transactions_type             → Type filtering
  ├─ idx_transactions_created_at (DESC)→ Recent transactions
  └─ idx_transactions_reference        → Reference lookup

CASHIN_REQUESTS
  ├─ idx_cashin_host_id                → Host requests
  ├─ idx_cashin_user_id                → User requests
  ├─ idx_cashin_status                 → Status filtering
  ├─ idx_cashin_created_at (DESC)      → Recent requests
  └─ idx_cashin_expires_at             → Expiry cleanup

KYC_SUBMISSIONS
  ├─ idx_kyc_user_id (UNIQUE)          → User lookup
  ├─ idx_kyc_status                    → Review queue
  └─ idx_kyc_submitted_at (DESC)       → Submission order

PAYOUTS
  ├─ idx_payouts_host_id               → Host payouts
  ├─ idx_payouts_status                → Status filtering
  └─ idx_payouts_requested_at (DESC)   → Request order

SERVICE_REQUESTS
  ├─ idx_service_requests_host_id      → Host requests
  ├─ idx_service_requests_technician   → Tech assignments
  ├─ idx_service_requests_hotspot_id   → Hotspot issues
  ├─ idx_service_requests_status       → Status filtering
  ├─ idx_service_requests_priority     → Priority queue
  └─ idx_service_requests_created (DESC) → Recent requests

HOST_EARNINGS
  ├─ idx_host_earnings_host_id         → Host lookup
  └─ idx_host_earnings_period          → Period lookup


┌─────────────────────────────────────────────────────────────────────────────┐
│                       SECURITY POLICY MATRIX                                │
└─────────────────────────────────────────────────────────────────────────────┘

OPERATION PERMISSIONS (✓ = allowed, ✗ = denied, ○ = conditional)

TABLE              │ Guest │ User  │ Host  │ Tech  │ Admin │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
USERS              │       │       │       │       │       │
  SELECT           │   ✗   │  ○ 1  │  ○ 1  │  ○ 1  │   ✓   │
  INSERT           │   ✓   │   ✓   │   ✓   │   ✓   │   ✓   │
  UPDATE           │   ✗   │  ○ 1  │  ○ 1  │  ○ 1  │   ✓   │
  DELETE           │   ✗   │   ✗   │   ✗   │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
HOTSPOTS           │       │       │       │       │       │
  SELECT           │  ○ 2  │  ○ 2  │  ○ 3  │  ○ 2  │   ✓   │
  INSERT           │   ✗   │   ✗   │   ✓   │   ✗   │   ✓   │
  UPDATE           │   ✗   │   ✗   │  ○ 4  │   ✗   │   ✓   │
  DELETE           │   ✗   │   ✗   │  ○ 4  │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
PLANS              │       │       │       │       │       │
  SELECT           │  ○ 5  │  ○ 5  │  ○ 6  │  ○ 5  │   ✓   │
  INSERT           │   ✗   │   ✗   │  ○ 7  │   ✗   │   ✓   │
  UPDATE           │   ✗   │   ✗   │  ○ 7  │   ✗   │   ✓   │
  DELETE           │   ✗   │   ✗   │  ○ 7  │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
VOUCHERS           │       │       │       │       │       │
  SELECT           │   ✗   │  ○ 8  │  ○ 9  │   ✗   │   ✓   │
  INSERT           │   ✗   │   ✗   │   ✗   │   ✗   │   ✓   │
  UPDATE           │   ✗   │   ✗   │   ✗   │   ✗   │   ✓   │
  DELETE           │   ✗   │   ✗   │   ✗   │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
SESSIONS           │       │       │       │       │       │
  SELECT           │   ✗   │  ○ 10 │  ○ 11 │   ✗   │   ✓   │
  INSERT/UPDATE    │   ✗   │   ✗   │   ✗   │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
PURCHASES          │       │       │       │       │       │
  SELECT           │   ✗   │  ○ 12 │  ○ 13 │   ✗   │   ✓   │
  INSERT           │   ✗   │   ✓   │   ✓   │   ✗   │   ✓   │
  UPDATE           │   ✗   │   ✗   │   ✗   │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
TRANSACTIONS       │       │       │       │       │       │
  SELECT           │   ✗   │  ○ 14 │  ○ 14 │  ○ 14 │   ✓   │
  INSERT           │   ✗   │   ✗   │   ✗   │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
CASHIN_REQUESTS    │       │       │       │       │       │
  SELECT           │   ✗   │  ○ 15 │  ○ 16 │   ✗   │   ✓   │
  INSERT           │   ✗   │   ✗   │   ✓   │   ✗   │   ✓   │
  UPDATE           │   ✗   │  ○ 17 │  ○ 18 │   ✗   │   ✓   │
───────────────────┼───────┼───────┼───────┼───────┼───────┤
SERVICE_REQUESTS   │       │       │       │       │       │
  SELECT           │   ✗   │   ✗   │  ○ 19 │  ○ 20 │   ✓   │
  INSERT           │   ✗   │   ✗   │   ✓   │   ✗   │   ✓   │
  UPDATE           │   ✗   │   ✗   │  ○ 21 │  ○ 22 │   ✓   │

LEGEND:
  1: Own record only
  2: Online hotspots only
  3: Online hotspots + own hotspots
  4: Own hotspots only
  5: Active plans for online hotspots
  6: All plans for own hotspots
  7: Plans for own hotspots
  8: Own vouchers only
  9: Vouchers for own hotspots
  10: Sessions for own vouchers
  11: Sessions for own hotspot vouchers
  12: Own purchases only
  13: Purchases for own hotspots
  14: Own transactions only
  15: Cash-in requests for self
  16: Cash-in requests created by self
  17: Confirm/reject own requests
  18: Cancel own pending requests
  19: Own service requests
  20: Assigned + pending requests
  21: Own pending requests
  22: Assigned requests + can claim pending

┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUICK REFERENCE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

TABLE SIZES (Estimated Production Scale):

Small (<1,000 rows)
  - kyc_submissions
  - payouts
  - service_requests

Medium (1,000-100,000 rows)
  - users
  - hotspots
  - plans
  - cashin_requests
  - host_earnings

Large (100,000-1M rows)
  - vouchers
  - sessions
  - purchases

Very Large (>1M rows)
  - transactions


CRITICAL BUSINESS RULES:

1. Wallet balance cannot go negative
2. Voucher codes must be unique
3. Transaction amounts must match balance changes
4. Host earns 90% of sales (10% platform fee)
5. Host earns 2% commission on cash-ins
6. Vouchers expire 7 days after plan duration
7. Only active plans can be purchased
8. Only online hotspots are visible to public
9. KYC approval required for hosts
10. Service requests can be claimed by any technician


BACKUP & RESTORE:

Backup:
  pg_dump -h [host] -U postgres -d postgres > backup.sql

Restore:
  psql -h [host] -U postgres -d postgres < backup.sql

Point-in-Time Recovery (Supabase):
  Dashboard > Database > Backups > Restore


MONITORING QUERIES:

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Table sizes
SELECT 
  schemaname || '.' || tablename as table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle' AND query_start < NOW() - INTERVAL '5 seconds'
ORDER BY query_start;

-- Unused indexes
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Cache hit ratio (should be >90%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

---

**Legend:**
- `PK` = Primary Key
- `FK` = Foreign Key
- `1:N` = One-to-Many relationship
- `1:1` = One-to-One relationship
- `◄─` = Foreign key relationship
- `▼` = Flow direction

**Last Updated:** December 18, 2025
