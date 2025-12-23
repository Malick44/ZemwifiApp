# ✅ ZemNet Supabase Migration Checklist

Use this checklist to ensure complete and successful database deployment.

## 📋 Pre-Migration Checklist

### Environment Setup
- [ ] Supabase account created
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Node.js 16+ installed
- [ ] Git repository cloned locally
- [ ] Database password generated and saved securely

### Project Planning
- [ ] Database region selected (EU West recommended for Burkina Faso)
- [ ] SMS provider chosen (Twilio/MessageBird)
- [ ] Payment providers identified (Wave/Orange/Moov)
- [ ] Team roles assigned (who manages database, auth, etc.)

---

## 🚀 Migration Execution Checklist

### Step 1: Create Supabase Project
- [ ] Logged into Supabase Dashboard
- [ ] New project created with name: `_________________`
- [ ] Strong database password set and saved
- [ ] Region selected: `_________________`
- [ ] Project provisioned successfully (2-3 min wait)
- [ ] Project URL noted: `_________________`
- [ ] Project Ref noted: `_________________`

### Step 2: Run Database Migrations
- [ ] Supabase CLI logged in (`supabase login`)
- [ ] Project linked (`supabase link --project-ref YOUR_REF`)
- [ ] Migration 001 executed: `001_initial_schema.sql`
  - [ ] 12 tables created
  - [ ] 10 enums created
  - [ ] 40+ indexes created
  - [ ] No errors in output
- [ ] Migration 002 executed: `002_rls_policies.sql`
  - [ ] RLS enabled on all tables
  - [ ] 60+ policies created
  - [ ] No errors in output
- [ ] Migration 003 executed: `003_functions_and_triggers.sql`
  - [ ] 15+ functions created
  - [ ] Triggers created
  - [ ] No errors in output
- [ ] Migration 004 executed (optional): `004_seed_data.sql`
  - [ ] 5 test users created
  - [ ] 4 hotspots created
  - [ ] 13 plans created
  - [ ] Sample data loaded

### Step 3: Verify Migration Success
- [ ] Table count verified (12 tables)
  ```sql
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_schema = 'public';
  -- Expected: 12
  ```
- [ ] RLS enabled on all tables verified
  ```sql
  SELECT COUNT(*) FROM pg_tables 
  WHERE schemaname = 'public' AND rowsecurity = true;
  -- Expected: 12
  ```
- [ ] Functions created verified
  ```sql
  SELECT COUNT(*) FROM information_schema.routines 
  WHERE routine_schema = 'public';
  -- Expected: 15+
  ```
- [ ] Indexes created verified
  ```sql
  SELECT COUNT(*) FROM pg_indexes 
  WHERE schemaname = 'public';
  -- Expected: 40+
  ```
- [ ] Seed data verified (if loaded)
  ```sql
  SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM hotspots) as hotspots;
  -- Expected: 5 users, 4 hotspots
  ```

---

## 🔐 Authentication Setup Checklist

### Phone Authentication Configuration
- [ ] Phone provider enabled in Dashboard (Authentication → Providers)
- [ ] SMS provider configured:
  - **Twilio:**
    - [ ] Account SID entered
    - [ ] Auth Token entered
    - [ ] Messaging Service SID entered
  - **OR MessageBird:**
    - [ ] Access Key entered
    - [ ] Originator configured
- [ ] OTP settings configured:
  - [ ] OTP expiry: 60 seconds
  - [ ] OTP length: 6 digits
  - [ ] Rate limiting enabled

### Auth Trigger Setup
- [ ] `handle_new_user()` function created
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  ```
- [ ] `on_auth_user_created` trigger created
  ```sql
  CREATE TRIGGER on_auth_user_created ...
  ```
- [ ] Trigger tested with test signup

### Test User Creation (Optional)
- [ ] Test user 1 created (Fatou - User)
- [ ] Test user 2 created (Amadou - Host)
- [ ] Test user 3 created (Ibrahim - Technician)
- [ ] All test users can authenticate
- [ ] User roles correctly assigned

---

## 📁 Storage Configuration Checklist

### KYC Documents Bucket
- [ ] Storage bucket created: `kyc-documents`
- [ ] Bucket set to private
- [ ] Upload policy created (users can upload own documents)
  ```sql
  CREATE POLICY "Users can upload own KYC documents" ...
  ```
- [ ] View policy created (users can view own documents)
  ```sql
  CREATE POLICY "Users can view own KYC documents" ...
  ```
- [ ] Admin policy created (admins can view all)
  ```sql
  CREATE POLICY "Admins can view all KYC documents" ...
  ```
- [ ] Test upload performed successfully
- [ ] Test download performed successfully

---

## ⚙️ Application Integration Checklist

### Environment Variables
- [ ] `.env.local` file created
- [ ] Expo env vars set:
  - [ ] `EXPO_PUBLIC_SUPABASE_URL`
  - [ ] `EXPO_PUBLIC_SUPABASE_KEY`
- [ ] (If building for web) `VITE_SUPABASE_URL` set
- [ ] (If building for web) `VITE_SUPABASE_ANON_KEY` set
- [ ] `.env.local` added to `.gitignore`
- [ ] Environment variables loaded in app

### Supabase Client Setup
- [ ] `@supabase/supabase-js` package installed
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] Supabase client file created (`src/app/lib/supabase.ts`)
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  export const supabase = createClient(url, key)
  ```
- [ ] Client connection tested

### Replace Mock Data with Supabase
- [ ] User authentication switched to Supabase Auth
- [ ] Hotspot fetching switched to Supabase queries
- [ ] Plan fetching switched to Supabase queries
- [ ] Voucher management switched to Supabase
- [ ] Purchase processing switched to Supabase functions
- [ ] Wallet operations switched to Supabase functions
- [ ] Mock data removed or disabled

---

## 🧪 Testing Checklist

### Authentication Tests
- [ ] Phone OTP request works
  ```typescript
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: '+22670123456'
  })
  ```
- [ ] OTP verification works
- [ ] Session persists after login
- [ ] Logout works correctly
- [ ] JWT token contains correct user data

### Data Access Tests (RLS)
- [ ] Guest can view online hotspots
- [ ] Guest cannot view offline hotspots
- [ ] User can view own vouchers only
- [ ] User cannot view other users' vouchers
- [ ] Host can view own hotspots only
- [ ] Host can manage own plans only
- [ ] Technician can view assigned requests
- [ ] Admin can view all data

### Business Logic Tests
- [ ] Purchase function works
  ```typescript
  const { data } = await supabase.rpc('process_purchase', {
    p_user_id: userId,
    p_hotspot_id: hotspotId,
    p_plan_id: planId,
    p_payment_provider: 'wallet'
  })
  ```
- [ ] Wallet deduction works correctly
- [ ] Voucher auto-generated with valid code
- [ ] Transaction created in history
- [ ] Host earnings updated automatically
- [ ] Cash-in processing works
- [ ] Commission calculated correctly (2%)
- [ ] Payout processing works

### Search & Discovery Tests
- [ ] Nearby hotspots search works
  ```typescript
  const { data } = await supabase.rpc('search_nearby_hotspots', {
    p_lat: 12.3714277,
    p_lng: -1.5196603,
    p_radius_km: 5
  })
  ```
- [ ] Results sorted by distance
- [ ] Only online hotspots returned
- [ ] Distance calculation accurate

### Function Tests
- [ ] `generate_voucher_code()` produces valid codes
- [ ] `is_voucher_valid()` correctly validates
- [ ] `get_host_dashboard_stats()` returns accurate data
- [ ] All triggers fire correctly (updated_at, earnings, etc.)

---

## 🔒 Security Verification Checklist

### Row Level Security
- [ ] RLS enabled on all 12 tables
- [ ] Policies prevent unauthorized access
- [ ] Users cannot access other users' data
- [ ] Hosts cannot access other hosts' data
- [ ] Admins can access all data
- [ ] Public data is accessible without auth

### Data Validation
- [ ] Wallet balance cannot go negative
- [ ] Phone numbers validated (E.164 format)
- [ ] Coordinates within valid ranges
- [ ] Prices must be positive
- [ ] MAC addresses validated
- [ ] Transaction integrity enforced

### API Security
- [ ] Anon key used in client (safe with RLS)
- [ ] Service role key stored securely server-side only
- [ ] API rate limiting configured
- [ ] CORS configured properly
- [ ] SSL/TLS enforced

---

## 📊 Performance Verification Checklist

### Query Performance
- [ ] Hotspot search completes <500ms
- [ ] Voucher lookup completes <100ms
- [ ] User dashboard loads <1s
- [ ] Host dashboard loads <1s
- [ ] Transaction history loads <1s

### Index Verification
- [ ] All foreign keys indexed
- [ ] Geospatial index on hotspots working
- [ ] Commonly queried fields indexed
- [ ] No unused indexes (check `pg_stat_user_indexes`)

### Database Health
- [ ] Cache hit ratio >90%
  ```sql
  SELECT 
    sum(heap_blks_hit) / 
    (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
  FROM pg_statio_user_tables;
  ```
- [ ] No slow queries (>5 seconds)
- [ ] Connection pooling enabled
- [ ] Database size acceptable

---

## 🚨 Production Readiness Checklist

### Database Settings
- [ ] Connection pooling enabled (Supavisor)
- [ ] Pool size configured appropriately
- [ ] Connection limits set
- [ ] Timeouts configured

### Backup & Recovery
- [ ] Automated backups enabled (daily)
- [ ] Point-in-time recovery enabled (7 days)
- [ ] Manual backup tested
- [ ] Restore procedure tested
- [ ] Backup retention policy set

### Monitoring
- [ ] Database logs enabled
- [ ] Query performance monitoring enabled
- [ ] Connection monitoring enabled
- [ ] Error alerts configured
- [ ] Slack/email notifications set up

### Documentation
- [ ] Schema documented (README.md)
- [ ] Deployment guide shared with team
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Team trained on database operations

---

## 📝 Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Monitor for errors in first 24 hours
- [ ] Check connection pool usage
- [ ] Verify SMS delivery works
- [ ] Test all critical user flows
- [ ] Review RLS policy effectiveness

### Week 1
- [ ] Analyze query performance
- [ ] Review slow query log
- [ ] Check cache hit ratio
- [ ] Monitor database growth
- [ ] Collect user feedback

### Week 2
- [ ] Review and optimize indexes
- [ ] Analyze usage patterns
- [ ] Plan for scaling if needed
- [ ] Update documentation based on learnings

### Monthly
- [ ] Review backup status
- [ ] Audit security policies
- [ ] Check for unused indexes
- [ ] Review database size and plan upgrades
- [ ] Test disaster recovery procedure

---

## 🆘 Emergency Procedures

### Database Connection Issues
```bash
# Check status
supabase db remote list

# Restart pooler (in dashboard)
# Settings → Database → Restart pooler
```

### RLS Issues (Users Can't Access Data)
```sql
-- Temporarily disable RLS for debugging
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable after debugging
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Migration Rollback
```bash
# View migration history
supabase migration list

# Rollback (⚠️ data loss!)
supabase db reset

# Or restore from backup
# Dashboard → Database → Backups → Restore
```

### Performance Issues
```sql
-- Find slow queries
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle' AND query_start < NOW() - INTERVAL '5 seconds';

-- Kill slow query
SELECT pg_terminate_backend(pid);

-- Analyze table
ANALYZE table_name;

-- Reindex if needed
REINDEX TABLE table_name;
```

---

## ✅ Final Sign-Off

### Stakeholder Approvals
- [ ] Database Admin approved: _________________ (Date: _______)
- [ ] Backend Developer approved: _________________ (Date: _______)
- [ ] Security Team approved: _________________ (Date: _______)
- [ ] Project Manager approved: _________________ (Date: _______)

### Go-Live Criteria Met
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Backup/recovery tested
- [ ] Monitoring active
- [ ] Team trained
- [ ] Documentation complete
- [ ] Rollback plan ready

### Production Deployment
- [ ] Deployment date: _________________
- [ ] Deployment time: _________________
- [ ] Deployed by: _________________
- [ ] Verification completed: _________________
- [ ] Post-deployment monitoring: 24 hours ✅

---

## 📞 Support Contacts

**Supabase Support:**
- Discord: https://discord.supabase.com
- Email: support@supabase.io
- Docs: https://supabase.com/docs

**Internal Team:**
- Database Admin: _________________
- Backend Lead: _________________
- DevOps: _________________
- On-Call: _________________

---

## 📚 Reference Documents

- [ ] `/supabase/README.md` reviewed
- [ ] `/supabase/DEPLOYMENT_GUIDE.md` followed
- [ ] `/supabase/QUICK_START.md` completed
- [ ] `/supabase/SCHEMA_DIAGRAM.md` understood
- [ ] `/SUPABASE_MIGRATIONS_SUMMARY.md` reviewed

---

**Migration Version:** 1.0.0  
**Last Updated:** December 18, 2025  
**Status:** Ready for Production ✅
