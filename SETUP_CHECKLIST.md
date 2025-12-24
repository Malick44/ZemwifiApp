# 🚀 ZemNet Supabase Backend Setup - Interactive Checklist

**Setup Date:** December 22, 2025  
**Estimated Time:** 30-45 minutes

---

## ✅ Pre-Setup Checklist

- [ ] I have a Supabase account at [supabase.com](https://supabase.com)
- [ ] I have access to a phone number for testing SMS OTP
- [ ] I have node.js 18+ installed (`node --version`)
- [ ] I'm ready to configure production backend

---

## Step 1: Create Supabase Project ⏱️ ~5 minutes

### Actions:
1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Sign in with your account

2. **Click "New Project"**
   - **Organization**: Select your organization (or create one)
   - **Name**: `zemnet-production` (or your preference)
   - **Database Password**: Click "Generate a password"
   - ⚠️ **IMPORTANT**: Copy and save this password securely!
   - **Region**: Choose closest to Senegal (e.g., "Europe - Frankfurt" or "Africa - South Africa")
   - **Pricing Plan**: Free (for development/testing)

3. **Click "Create new project"**
   - Wait 2-3 minutes for provisioning
   - ☕ Take a break while it sets up

### Verification:
- [ ] Project created successfully
- [ ] Project status shows "Active" (green dot)
- [ ] Database password saved securely

---

## Step 2: Get API Credentials ⏱️ ~2 minutes

### Actions:
1. **Navigate to Project Settings**
   - Click the ⚙️ icon in left sidebar
   - Go to "Settings" → "API"

2. **Copy Your Credentials**
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Create .env file**
   - In your terminal, run:
   ```bash
   cd /Users/malickdes/worksapace/ZemwifiApp
   cp .env.example .env
   ```

4. **Update .env file**
   - Open `.env` in your editor
   - Replace with your actual values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=eyJhbGc...your-actual-anon-key
   ```

### Verification:
- [ ] `.env` file created
- [ ] `EXPO_PUBLIC_SUPABASE_URL` filled in
- [ ] `EXPO_PUBLIC_SUPABASE_KEY` filled in
- [ ] No spaces or quotes around values

---

## Step 3: Run Database Migrations ⏱️ ~10 minutes

### Option A: Using Supabase SQL Editor (Recommended for First Time)

1. **Open SQL Editor**
   - In Supabase Dashboard, click "SQL Editor" in left sidebar
   - Click "+ New query"

2. **Run Migration 001 - Initial Schema**
   - Open file: `Prompt-repo/supabase/migrations/001_initial_schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "RUN" or press Cmd+Enter
   - ✅ Should see: "Success. No rows returned"

3. **Run Migration 002 - RLS Policies**
   - Open file: `Prompt-repo/supabase/migrations/002_rls_policies.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "RUN"
   - ✅ Should see: "Success. No rows returned"

4. **Run Migration 003 - Functions & Triggers**
   - Open file: `Prompt-repo/supabase/migrations/003_functions_and_triggers.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "RUN"
   - ✅ Should see: "Success. No rows returned"

5. **Run Migration 004 - Seed Data**
   - Open file: `Prompt-repo/supabase/migrations/004_seed_data.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "RUN"
   - ✅ Should see: "Success. X rows affected"

6. **Run Migration 005 - Admin Features**
   - Open file: `Prompt-repo/supabase/migrations/005_admin_features.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "RUN"
   - ✅ Should see: "Success. No rows returned"

7. **Run Migration 006 - Ratings**
   - Open file: `Prompt-repo/supabase/migrations/006_ratings.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "RUN"
   - ✅ Should see: "Success. No rows returned"

### Option B: Using Supabase CLI (For Advanced Users)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref

# Run migrations
cd Prompt-repo/supabase
supabase db push
```

### Verification:
- [ ] All 6 migrations ran successfully
- [ ] No error messages in SQL Editor
- [ ] Tables visible in Table Editor

**Check Tables:**
- In Dashboard, click "Table Editor"
- You should see these tables:
  - [ ] profiles
  - [ ] hotspots
  - [ ] plans
  - [ ] purchases
  - [ ] vouchers
  - [ ] wallet_transactions
  - [ ] cashin_requests
  - [ ] payout_requests
  - [ ] ratings

---

## Step 4: Configure Phone Authentication ⏱️ ~10 minutes

### Prerequisites:
You need an SMS provider. Recommended options:
- **Twilio** (easiest setup, $15.50 credit free trial)
- **MessageBird** (European-based)
- **Vonage** (formerly Nexmo)

### Setup with Twilio (Recommended):

1. **Create Twilio Account**
   - Go to: https://www.twilio.com/try-twilio
   - Sign up for free trial ($15.50 credit)
   - Verify your email and phone

2. **Get a Phone Number**
   - In Twilio Console, go to "Phone Numbers" → "Manage" → "Buy a number"
   - Select country: Senegal (+221) or USA (+1) for testing
   - Make sure it has "SMS" capability
   - Purchase the number (uses trial credit)

3. **Get Credentials**
   ```
   Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token: (click to reveal) xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Phone Number: +1234567890 (or +221...)
   ```

4. **Configure in Supabase**
   - In Supabase Dashboard: "Authentication" → "Providers"
   - Find "Phone" and toggle it **ON**
   - **Provider**: Select "Twilio"
   - **Twilio Account SID**: Paste your Account SID
   - **Twilio Auth Token**: Paste your Auth Token
   - **Twilio Message Service SID**: Leave blank
   - **Twilio Phone Number**: Paste your +1... number
   - **OTP Template** (optional): Customize message
   - Click "Save"

5. **Test Phone Auth**
   - In Dashboard: "Authentication" → "Users" → "Send Magic Link"
   - Enter your test phone number with country code: +221771234567
   - Check your phone for SMS

### Verification:
- [ ] SMS provider (Twilio) configured
- [ ] Phone authentication enabled in Supabase
- [ ] Test SMS received successfully
- [ ] OTP code works

---

## Step 5: Configure Row Level Security ⏱️ ~3 minutes

RLS policies were created in migration 002, but let's verify:

1. **Check RLS is Enabled**
   - Go to "Table Editor"
   - Click on "profiles" table
   - Click "..." menu → "Edit Table"
   - Ensure "Enable Row Level Security" is **CHECKED** ✅
   - Repeat for: hotspots, purchases, vouchers, wallet_transactions

2. **View Policies**
   - Go to "Authentication" → "Policies"
   - You should see policies for each table
   - Example policies:
     - `profiles`: "Users can view their own profile"
     - `hotspots`: "Anyone can view active hotspots"
     - `vouchers`: "Users can only see their own vouchers"

### Verification:
- [ ] RLS enabled on all tables
- [ ] Policies visible in dashboard
- [ ] No red warning badges on tables

---

## Step 6: Test the Connection ⏱️ ~5 minutes

### From Your App:

1. **Start the Expo App**
   ```bash
   cd /Users/malickdes/worksapace/ZemwifiApp
   npm start
   ```

2. **Test Authentication**
   - Open the app (press `i` for iOS or `a` for Android)
   - Go to Sign In screen
   - Enter your phone number: +221771234567
   - Click "Send Code"
   - ✅ You should receive an SMS
   - Enter the 6-digit code
   - ✅ You should be signed in

3. **Test Data Fetching**
   - Browse hotspots screen
   - ✅ Seed data hotspots should appear
   - Try searching for hotspots
   - ✅ Search should work

### Verification:
- [ ] App connects to Supabase (no connection errors)
- [ ] Authentication flow works end-to-end
- [ ] Hotspots load from database
- [ ] No console errors

---

## Step 7: Seed Test Data (Optional) ⏱️ ~5 minutes

To test all features with sample data:

1. **Open SQL Editor**
   - In Supabase Dashboard

2. **Create Test User Profile**
   ```sql
   -- Insert test user (get user ID from auth.users after signing up)
   INSERT INTO profiles (id, role, full_name, balance, phone)
   VALUES 
     ((SELECT id FROM auth.users WHERE phone = '+221771234567'), 
      'user', 
      'Test User', 
      10000,
      '+221771234567');
   ```

3. **Create Test Host & Hotspot**
   ```sql
   -- Create host profile
   INSERT INTO profiles (id, role, full_name, balance, phone)
   VALUES 
     (gen_random_uuid(), 'host', 'Test Host', 50000, '+221772345678');

   -- Create test hotspot
   INSERT INTO hotspots (name, description, latitude, longitude, host_id, is_active)
   VALUES 
     ('Café Central WiFi', 
      'Fast WiFi at downtown café', 
      14.7167, 
      -17.4677, 
      (SELECT id FROM profiles WHERE role = 'host' LIMIT 1), 
      true);
   ```

### Verification:
- [ ] Test data inserted successfully
- [ ] Hotspot appears in app discovery
- [ ] User has balance for testing purchases

---

## 🎉 Setup Complete!

### Final Checklist:
- [ ] Supabase project created and active
- [ ] Database migrations completed (6/6)
- [ ] Phone authentication configured and tested
- [ ] RLS policies enabled and verified
- [ ] App successfully connects to backend
- [ ] Test authentication works end-to-end
- [ ] Sample data visible in app

### Next Steps:
1. ✅ **Test Full User Flow**: Sign up → Browse → Purchase → Generate Voucher QR
2. ✅ **Test Host Flow**: Create hotspot → Manage cash-in → View earnings
3. 🔄 **Deploy to Production**: When ready, create production Supabase project
4. 🔄 **Configure Payment Provider**: Integrate Orange Money/Wave API
5. 🔄 **Build & Submit**: Use EAS Build for app stores

---

## 🆘 Troubleshooting

### "Connection Error" in App
- Check `.env` file has correct URL and key
- Restart Expo dev server: `npm start` (clear cache: `npm start -c`)
- Verify Supabase project is active (green dot in dashboard)

### "Phone Authentication Failed"
- Check Twilio account has credits
- Verify phone number format includes country code (+221...)
- Check Twilio logs for delivery errors
- Try a different test phone number

### "RLS Policy Error" / "Permission Denied"
- Ensure RLS is enabled on the table
- Check policies exist for the table
- Verify user is authenticated (check session)
- Review policy SQL in migration 002

### Migration Errors
- Run migrations in order (001 → 006)
- Check for syntax errors in SQL
- Clear SQL editor and try again
- Use Supabase CLI for better error messages

### Need Help?
- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Check [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for detailed guide

---

**Setup Guide by:** GitHub Copilot  
**Date:** December 22, 2025  
**Status:** Ready for Production Testing ✅
