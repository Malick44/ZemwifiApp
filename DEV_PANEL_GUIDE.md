# ZemNet Dev Panel & Database Seeding Guide

## 🎯 Quick Start

### 1. Fix RLS Policies (REQUIRED FIRST)

Before seeding, you **must** fix the RLS policies in Supabase:

1. Go to: https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/sql/new
2. Copy and run the SQL from: `fix-rls-complete.sql`
3. Or run this minimal fix:

```sql
-- Allow users to insert their own profiles
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Allow service_role full access
CREATE POLICY "System can manage profiles" 
  ON profiles FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

GRANT ALL ON public.profiles TO authenticated, service_role;
```

### 2. Access the Dev Panel

**Option A: Direct Link**
```
http://localhost:8082/  (app)/(shared)/dev-panel
```

**Option B: Through App**
1. Open the app
2. Navigate to Settings
3. Scroll down and tap "Dev Panel" (if added to settings)

### 3. Seed Test Data

**Quick Method (In Dev Panel):**
1. Tap "Quick Test Data" button
2. Wait for confirmation
3. Browse hotspots on map

**Manual Method (via Script):**
```bash
node seed-quick-test-data.js
```

**Full Seed (Manual SQL):**
1. Go to Supabase SQL Editor
2. Run: `Prompt-repo/supabase/migrations/004_seed_data.sql`

## 📊 What Gets Seeded

### Quick Test Data (Instant)
- ✅ 4 Hotspots (Ouagadougou locations)
- ✅ 10 Plans (various durations and prices)
- ✅ Demo host profile

### Full Seed Data (Manual SQL)
- ✅ 5 Test users (user, host, technician, new user, admin)
- ✅ 4 Hotspots with realistic locations
- ✅ 13 Plans with different pricing tiers
- ✅ 3 Purchases with vouchers (active, used, expired)
- ✅ Transaction history
- ✅ Cash-in request (pending)
- ✅ KYC submission (approved)
- ✅ Service requests
- ✅ Host earnings data
- ✅ Payout request

## 🧪 Test Credentials

Use these phone numbers for testing (OTP: any 6 digits like `123456`):

| Role | Phone | Purpose |
|------|-------|---------|
| User | +226 70 12 34 56 | Regular customer with wallet balance |
| Host | +226 70 23 45 67 | Host with hotspots and KYC approved |
| Technician | +226 70 34 56 78 | Service technician |
| New User | +226 70 45 67 89 | Fresh account, no history |
| Admin | +226 70 99 99 99 | Admin access |

## 🛠️ Dev Panel Features

### Database Stats
- Real-time count of users, hotspots, plans, vouchers
- Refresh button to update counts
- Color-coded statistics

### Seeding Actions
- **Quick Test Data**: Creates instant test hotspots and plans
- **Full Seed**: Instructions for manual SQL execution
- **Clear Test Data**: Removes test hotspots and plans

### Quick Navigation
- **Browse Hotspots**: Jump to map view
- **My Wallet**: View vouchers and balance
- **Host Dashboard**: Access host management
- **Settings**: App configuration

### Environment Info
- Supabase URL display
- Project ID
- Connection status

## 🐛 Troubleshooting

### "Row violates row-level security policy"
**Solution**: Run the RLS fix SQL first (see Step 1 above)

### "Foreign key constraint violation"
**Solution**: Profiles must exist before creating hotspots. Ensure RLS is fixed and you can create profiles.

### No hotspots showing on map
**Solutions**:
1. Check Dev Panel stats - are there hotspots?
2. Run "Quick Test Data" button
3. Check that `is_online = true` in hotspots table
4. Verify latitude/longitude values are correct

### Seed script fails
**Solutions**:
1. Check `.env` file has all 3 variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Verify service role key is correct
3. Run RLS fix first

## 📁 File Locations

```
ZemwifiApp/
├── app/(app)/(shared)/dev-panel.tsx          # Dev Panel UI
├── seed-quick-test-data.js                   # Quick seeding script
├── fix-rls-complete.sql                      # RLS policy fixes
├── Prompt-repo/supabase/migrations/
│   └── 004_seed_data.sql                     # Full seed data SQL
└── .env                                      # Supabase credentials
```

## 🚀 Next Steps After Seeding

1. **Browse Hotspots**: Open map view to see test locations
2. **Make a Purchase**: Select a plan and test payment flow
3. **View Wallet**: Check your vouchers
4. **Test Host Features**: Switch to host dashboard
5. **Test Authentication**: Sign out and sign in with different users

## 💡 Tips

- Use "Quick Test Data" for rapid iteration during development
- Use "Full Seed" for comprehensive testing of all features
- Clear test data regularly to avoid ID conflicts
- Service role key bypasses RLS - use it for seeding
- Check Supabase Dashboard → Table Editor to verify data

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo)
- [SQL Editor](https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/sql/new)
- [Table Editor](https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/editor)
- [Authentication](https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/auth/users)

---

**Need Help?** Check the implementation plan: `DESIGN_IMPLEMENTATION_PLAN.md`
