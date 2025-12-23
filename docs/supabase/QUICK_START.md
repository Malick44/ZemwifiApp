# 🚀 ZemNet Supabase - Quick Start Guide

Get your database up and running in **5 minutes**!

## ⚡ Super Quick Start (3 Commands)

```bash
# 1. Login to Supabase
supabase login

# 2. Link your project
supabase link --project-ref YOUR_PROJECT_REF

# 3. Push migrations
supabase db push
```

**Done! Your database is ready! ✅**

---

## 📋 Detailed Steps

### Step 1: Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign in/Sign up
3. Click "New Project"
4. Fill in:
   - **Name:** `zemnet-production`
   - **Database Password:** (generate strong password - SAVE IT!)
   - **Region:** EU West (Paris/Frankfurt - closest to Burkina Faso)
5. Click "Create new project"
6. ⏳ Wait ~2 minutes for provisioning

### Step 2: Get Project Details (30 seconds)

From your Supabase Dashboard:

1. Go to **Settings** → **API**
2. Copy these values:

```bash
Project URL:      https://xxxxxxxxxxxxx.supabase.co
Project Ref:      xxxxxxxxxxxxx (from URL)
anon/public key:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (KEEP SECRET!)
```

3. Go to **Settings** → **Database**
4. Copy **Connection string** (under "Connection pooling")

### Step 3: Run Migrations (1 minute)

**Option A: Using Supabase CLI** ⭐ Recommended

```bash
# Install CLI (if not already)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF
# Enter database password when prompted

# Run migrations
supabase db push
```

**Option B: Using SQL Editor** (Manual)

1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New query"
3. Copy & paste contents of `/supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Repeat for:
   - `002_rls_policies.sql`
   - `003_functions_and_triggers.sql`
   - `004_seed_data.sql` (optional - test data)

### Step 4: Verify Setup (30 seconds)

Run this in SQL Editor:

```sql
-- Check tables (should show 12 tables)
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled (should show 12 rows with rowsecurity = true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- If you ran seed data, check counts
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM hotspots) as hotspots,
  (SELECT COUNT(*) FROM plans) as plans,
  (SELECT COUNT(*) FROM vouchers) as vouchers;
```

Expected results:
- ✅ 12 tables created
- ✅ All have `rowsecurity = true`
- ✅ Seed data: 5 users, 4 hotspots, 13 plans, 3 vouchers

### Step 5: Configure Authentication (2 minutes)

1. Go to **Authentication** → **Providers**
2. Enable **Phone** provider
3. Configure SMS:

   **Using Twilio** (recommended):
   - Account SID: `ACxxxxxxxxxxxx`
   - Auth Token: `your_auth_token`
   - Messaging Service SID: `MGxxxxxxxxxxxx`

4. Click "Save"

5. Run this in SQL Editor to sync auth users:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, role, created_at)
  VALUES (NEW.id, NEW.phone, 'user', NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 6: Update Your App (1 minute)

Create an env file for your client.

For Expo apps, use `.env` (or `.env.local`) and **EXPO_PUBLIC_*** variables:

> Tip: This repo provides a canonical template at `/.env.example`.
> Copy it to `.env` (or `.env.local`) and adjust if needed.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://gcqgmcnxqhktxoaesefo.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_RxPKSYNO0FU_3XZW10zuvA_DQKr875w
```

Update your app code:

```typescript
// app/lib/supabase.ts (Expo)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 7: Test Everything (2 minutes)

```typescript
// Test 1: Phone authentication
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+22670123456'
})
console.log('OTP sent:', data)

// Test 2: Fetch public hotspots
const { data: hotspots, error: hotspotsError } = await supabase
  .from('hotspots')
  .select('*')
  .eq('is_online', true)
console.log('Hotspots:', hotspots)

// Test 3: Search nearby (using function)
const { data: nearby } = await supabase
  .rpc('search_nearby_hotspots', {
    p_lat: 12.3714277,
    p_lng: -1.5196603,
    p_radius_km: 5
  })
console.log('Nearby hotspots:', nearby)

// Test 4: Validate voucher
const { data: validation } = await supabase
  .rpc('is_voucher_valid', { p_voucher_code: 'ABCD-1234-EFGH' })
console.log('Voucher valid:', validation)
```

---

## ✅ You're Done!

Your ZemNet database is now:
- ✅ Fully deployed
- ✅ Secured with RLS
- ✅ Ready for authentication
- ✅ Loaded with test data
- ✅ Connected to your app

---

## 🎯 Test with Seed Data

If you ran `004_seed_data.sql`, you have these ready-to-use accounts:

| Phone | Name | Role | Balance | Password |
|-------|------|------|---------|----------|
| +226 70 12 34 56 | Fatou Traoré | User | 2,500 XOF | (set via auth) |
| +226 70 23 45 67 | Amadou Ouédraogo | Host | 15,000 XOF | (set via auth) |
| +226 70 34 56 78 | Ibrahim Sawadogo | Technician | 8,000 XOF | (set via auth) |

**Note:** You need to create auth users manually in Supabase Dashboard or via API.

---

## 🔍 Quick Verification Queries

```sql
-- Show all test users
SELECT id, phone, name, role, wallet_balance 
FROM users 
ORDER BY created_at;

-- Show all hotspots with plans
SELECT 
  h.name as hotspot,
  COUNT(p.id) as plans_count,
  MIN(p.price_xof) as min_price,
  MAX(p.price_xof) as max_price
FROM hotspots h
LEFT JOIN plans p ON p.hotspot_id = h.id
GROUP BY h.id, h.name;

-- Show Fatou's vouchers
SELECT 
  v.code,
  p.name as plan,
  h.name as hotspot,
  v.expires_at,
  v.used_at,
  CASE 
    WHEN v.used_at IS NOT NULL THEN 'Used'
    WHEN v.expires_at < NOW() THEN 'Expired'
    ELSE 'Active'
  END as status
FROM vouchers v
JOIN plans p ON v.plan_id = p.id
JOIN hotspots h ON v.hotspot_id = h.id
JOIN users u ON v.user_id = u.id
WHERE u.name = 'Fatou Traoré';

-- Show Amadou's earnings
SELECT 
  period_start,
  period_end,
  total_sales,
  platform_fee,
  cashin_commission,
  net_earnings,
  purchases_count
FROM host_earnings
WHERE host_id = (SELECT id FROM users WHERE name = 'Amadou Ouédraogo')
ORDER BY period_start DESC;
```

---

## 🆘 Troubleshooting

### Can't connect to database?
```bash
# Test connection
supabase db remote list

# If fails, try re-linking
supabase link --project-ref YOUR_PROJECT_REF
```

### Migrations failed?
```bash
# Check migration status
supabase migration list

# Reset and retry (⚠️ deletes all data!)
supabase db reset
supabase db push
```

### RLS blocking queries?
```sql
-- Check if user is authenticated
SELECT auth.uid();  -- Should return UUID when logged in

-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE hotspots DISABLE ROW LEVEL SECURITY;

-- Re-enable
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
```

### Functions not found?
```sql
-- List all functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Re-run functions migration
-- Copy/paste contents of 003_functions_and_triggers.sql
```

### Need to start over?
```bash
# Full reset (⚠️ deletes EVERYTHING!)
supabase db reset
supabase db push
```

---

## 📚 Next Steps

### Essential Setup
1. ✅ **Configure SMS provider** (Twilio/MessageBird)
2. ✅ **Set up environment variables** in your app
3. ✅ **Test authentication flow** with phone OTP
4. ✅ **Test data access** with RLS enabled

### Optional Enhancements
- 🔔 Set up real-time subscriptions for live updates
- 📊 Create custom analytics views
- ⏰ Set up cron jobs for cleanup (expired vouchers, etc.)
- 💳 Configure payment provider webhooks (Wave/Orange/Moov)
- 📁 Set up Storage for KYC document uploads

### Monitoring
- 📈 Enable Database Logging (Settings → Logs)
- 🔍 Monitor Query Performance (Database → Query Performance)
- 📊 Set up alerts for connection limits
- 💾 Configure automated backups (Pro plan)

---

## 🎓 Learning Resources

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Supabase Discord:** https://discord.supabase.com

---

## 📞 Support

**Documentation Files:**
- `/supabase/README.md` - Complete schema reference
- `/supabase/DEPLOYMENT_GUIDE.md` - Detailed deployment steps
- `/supabase/SCHEMA_DIAGRAM.md` - Visual schema diagrams
- `/SUPABASE_MIGRATIONS_SUMMARY.md` - Overview of all migrations

**Migration Files:**
- `001_initial_schema.sql` - Tables, enums, indexes
- `002_rls_policies.sql` - Security policies
- `003_functions_and_triggers.sql` - Business logic
- `004_seed_data.sql` - Test data (optional)

---

## ✨ Success Checklist

After following this guide, you should have:

- [x] Supabase project created
- [x] Database schema deployed (12 tables)
- [x] Row Level Security enabled
- [x] Business logic functions created
- [x] Test data loaded (optional)
- [x] Phone authentication configured
- [x] App connected to database
- [x] Queries tested and working

**You're ready to build! 🚀**

---

**Total Time:** ~10 minutes  
**Difficulty:** Easy  
**Prerequisites:** Supabase account, npm/node installed

**Last Updated:** December 18, 2025
