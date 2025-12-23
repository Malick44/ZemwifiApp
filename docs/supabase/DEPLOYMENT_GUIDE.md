# ZemNet Supabase Deployment Guide

Complete step-by-step guide to deploy the ZemNet database schema to Supabase.

## 🎯 Prerequisites

- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Node.js 16+ installed
- [ ] Git repository cloned

## 📋 Deployment Steps

### Step 1: Create Supabase Project

1. **Login to Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Sign in or create account

2. **Create New Project**
   - Click "New Project"
   - **Organization:** Select or create
   - **Name:** `zemnet-production` (or your preferred name)
   - **Database Password:** Generate strong password (save securely!)
   - **Region:** Choose closest to Burkina Faso (EU West - Paris or Frankfurt recommended)
   - Click "Create new project"
   - ⏳ Wait 2-3 minutes for provisioning

3. **Save Project Details**
   ```
   Project URL: https://[your-project-ref].supabase.co
   Project API Key (anon/public): eyJhbGc...
   Project API Key (service_role): eyJhbGc... (keep secret!)
   Database Password: [your-password]
   ```

### Step 2: Configure Supabase CLI

1. **Login via CLI**
   ```bash
   supabase login
   ```
   - This opens browser for authentication
   - Authorize the CLI

2. **Link Project**
   ```bash
   cd /path/to/zemnet-project
   supabase link --project-ref your-project-ref
   ```
   - Enter database password when prompted

3. **Verify Connection**
   ```bash
   supabase db remote list
   ```
   - Should show your project details

### Step 3: Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Run all migrations in order
supabase db push

# Verify migrations
supabase migration list
```

**Option B: Using SQL Editor in Dashboard**

1. Go to **SQL Editor** in Supabase Dashboard
2. Create new query
3. Copy contents of `001_initial_schema.sql`
4. Click "Run"
5. Repeat for `002_rls_policies.sql`
6. Repeat for `003_functions_and_triggers.sql`
7. *Optional:* Run `004_seed_data.sql` for test data

**Option C: Using psql**

```bash
# Get connection string from Supabase Dashboard > Settings > Database
psql "postgres://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Run migrations
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_rls_policies.sql
\i supabase/migrations/003_functions_and_triggers.sql
\i supabase/migrations/004_seed_data.sql  # Optional
```

### Step 4: Verify Migration Success

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables (12 total):
-- cashin_requests, host_earnings, hotspots, kyc_submissions,
-- payouts, plans, purchases, service_requests, sessions,
-- transactions, users, vouchers

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show rowsecurity = true

-- Check seed data (if you ran 004_seed_data.sql)
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM hotspots) as hotspots,
  (SELECT COUNT(*) FROM plans) as plans,
  (SELECT COUNT(*) FROM vouchers) as vouchers;
```

### Step 5: Configure Authentication

1. **Enable Phone Authentication**
   - Go to **Authentication > Providers**
   - Enable **Phone** provider
   - Configure SMS provider:

   **Option 1: Twilio (Recommended)**
   ```
   Account SID: [your-twilio-sid]
   Auth Token: [your-twilio-token]
   Phone Number: [your-twilio-number]
   ```

   **Option 2: MessageBird**
   ```
   Access Key: [your-messagebird-key]
   Originator: [your-sender-name]
   ```

2. **Configure OTP Settings**
   - Go to **Authentication > Settings**
   - **OTP expiry:** 60 seconds (default)
   - **OTP length:** 6 digits
   - **Rate limiting:** 
     - Max attempts: 3 per hour
     - Lockout duration: 1 hour

3. **Create Auth Trigger** (sync auth.users → public.users)
   
   Run in SQL Editor:
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
     )
     ON CONFLICT (id) DO NOTHING;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW
     EXECUTE FUNCTION public.handle_new_user();
   ```

### Step 6: Configure Storage (for KYC documents)

1. **Create Storage Bucket**
   - Go to **Storage**
   - Click "New bucket"
   - **Name:** `kyc-documents`
   - **Public:** No (private bucket)
   - Click "Create bucket"

2. **Set Storage Policies**
   
   Run in SQL Editor:
   ```sql
   -- Allow users to upload their own KYC documents
   CREATE POLICY "Users can upload own KYC documents"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'kyc-documents' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow users to view their own documents
   CREATE POLICY "Users can view own KYC documents"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'kyc-documents' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow admins to view all KYC documents
   CREATE POLICY "Admins can view all KYC documents"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'kyc-documents' AND
     EXISTS (
       SELECT 1 FROM users 
       WHERE id = auth.uid() AND role = 'admin'
     )
   );
   ```

### Step 7: Set Environment Variables

Create a local env file appropriate to your client:

> Tip: This repo provides a canonical template at `/.env.example`.
> Copy it to `.env` (or `.env.local`) and adjust if needed.

```bash
# Expo (recommended for this repo)
EXPO_PUBLIC_SUPABASE_URL=https://gcqgmcnxqhktxoaesefo.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_RxPKSYNO0FU_3XZW10zuvA_DQKr875w

# Web (Vite) fallback
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Optional: Service Role Key (server-side only; never ship to clients)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Keep secret!
```

### Step 8: Initialize Supabase Client

Update your app code to use Supabase:

```typescript
// Expo example
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 9: Test the Setup

1. **Test Phone Authentication**
   ```typescript
   const { data, error } = await supabase.auth.signInWithOtp({
     phone: '+22670123456'
   })
   ```

2. **Test Data Access**
   ```typescript
   // Should return online hotspots (public access)
   const { data: hotspots } = await supabase
     .from('hotspots')
     .select('*')
     .eq('is_online', true)
   ```

3. **Test RLS**
   ```typescript
   // Should only return authenticated user's vouchers
   const { data: vouchers } = await supabase
     .from('vouchers')
     .select('*')
   ```

4. **Test Business Functions**
   ```typescript
   // Search nearby hotspots
   const { data } = await supabase
     .rpc('search_nearby_hotspots', {
       p_lat: 12.3714277,
       p_lng: -1.5196603,
       p_radius_km: 5
     })
   ```

### Step 10: Configure Production Settings

1. **Database Settings**
   - Go to **Settings > Database**
   - Enable **Connection Pooling** (Supavisor)
   - Configure pool size: 15 (for free tier) or higher

2. **API Settings**
   - Go to **Settings > API**
   - Enable **Email confirmation** for new users (optional)
   - Set **JWT expiry:** 3600 seconds (1 hour)

3. **Rate Limiting**
   - Configure in **Settings > API**
   - Requests per second: 100 (adjust based on plan)

4. **Backups**
   - Automatic daily backups (enabled by default on paid plans)
   - Download manual backup: **Database > Backups**

## 🔄 Migration Rollback

If something goes wrong:

```bash
# View migration history
supabase migration list

# Rollback last migration
supabase db reset

# Rollback to specific version
supabase migration repair --version 20231218000001
```

## 🧪 Testing Checklist

After deployment, test these features:

### Authentication
- [ ] Phone number OTP login works
- [ ] OTP verification works
- [ ] User created in both auth.users and public.users
- [ ] JWT token contains correct user data

### Data Access (RLS)
- [ ] Users can view online hotspots (public)
- [ ] Users can view only their own vouchers
- [ ] Hosts can view only their own hotspots
- [ ] Admins can view all data

### Business Logic
- [ ] Voucher codes auto-generate on insert
- [ ] Purchase deducts from wallet correctly
- [ ] Cash-in adds to wallet + commission
- [ ] Host earnings update after purchase
- [ ] Payout deducts from wallet

### Search & Discovery
- [ ] Nearby hotspots search works
- [ ] Results sorted by distance
- [ ] Only online hotspots returned

## 🚨 Common Issues

### Issue: RLS blocks all queries

**Solution:**
```sql
-- Check if authenticated
SELECT auth.uid();  -- Should return UUID

-- Temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Issue: Functions not found

**Solution:**
```bash
# Verify functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

# Re-run 003_functions_and_triggers.sql
```

### Issue: Foreign key constraint errors

**Solution:**
```sql
-- Check for orphaned records
SELECT * FROM vouchers v
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = v.user_id
);

-- Delete orphaned records or fix references
```

## 📊 Monitoring

### Check Database Health

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT 
  pid,
  usename,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

### Performance Monitoring

In Supabase Dashboard:
- **Database > Query Performance** - Slow queries
- **Database > Roles** - Connection usage
- **Logs** - Real-time logs

## 🔐 Security Best Practices

- [ ] Never commit `.env` files with secrets
- [ ] Use service role key only on server-side
- [ ] Keep anon key in client-side code (it's safe with RLS)
- [ ] Enable MFA for admin accounts
- [ ] Regularly review RLS policies
- [ ] Monitor for suspicious activity
- [ ] Keep database password in secure vault
- [ ] Use SSL connections only

## 📚 Next Steps

After successful deployment:

1. **Configure Payment Webhooks**
   - Set up Wave/Orange/Moov webhook endpoints
   - Update purchase status based on payment confirmation

2. **Set up Cron Jobs**
   - Expire old vouchers (daily)
   - Update host earnings (daily)
   - Clean up expired cash-in requests (hourly)

3. **Implement Real-time Subscriptions**
   ```typescript
   // Listen for new purchases
   supabase
     .channel('purchases')
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'purchases',
       filter: `host_id=eq.${hostId}`
     }, (payload) => {
       console.log('New purchase:', payload.new)
     })
     .subscribe()
   ```

4. **Set up Analytics**
   - Track daily active users
   - Monitor hotspot usage
   - Track revenue metrics

## ✅ Deployment Complete!

Your ZemNet database is now live on Supabase! 🎉

**Support Resources:**
- [Supabase Discord](https://discord.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Last Updated:** December 18, 2025  
**Migration Version:** 1.0.0
