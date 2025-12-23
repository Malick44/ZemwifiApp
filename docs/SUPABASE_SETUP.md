# Supabase Backend Setup Guide

Complete guide for setting up the ZemNet Supabase backend.

---

## Prerequisites

- Supabase account ([supabase.com](https://supabase.com))
- Node.js 18+ for running migrations
- Supabase CLI (optional, for local development)

---

## 1. Create a Supabase Project

1. **Sign in to Supabase**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - **Organization**: Select or create
   - **Name**: `zemnet-production` (or your preference)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users (e.g., Europe - Frankfurt)
   - **Pricing Plan**: Start with Free tier
   - Click "Create new project"

3. **Wait for Setup** (2-3 minutes)
   - Database provisioning in progress
   - You'll see a "Setting up project" screen

---

## 2. Configure Authentication

### Enable Phone Authentication

1. **Navigate to Authentication**
   - Sidebar: Click "Authentication" → "Providers"

2. **Enable Phone Provider**
   - Find "Phone" in the provider list
   - Toggle it **ON**
   - **SMS Provider**: Choose one:
     - **Twilio** (recommended for production)
     - **MessageBird**
     - **Vonage**
   
3. **Configure SMS Provider (Example: Twilio)**
   - Sign up at [twilio.com](https://twilio.com)
   - Get your Account SID and Auth Token
   - Purchase a phone number with SMS capability
   - In Supabase:
     - **Twilio Account SID**: Paste your SID
     - **Twilio Auth Token**: Paste your token
     - **Twilio Message Service SID** or **Phone Number**: Enter your Twilio number
   - Click "Save"

4. **Configure OTP Settings**
   - Go to "Authentication" → "Settings"
   - **OTP Expiry**: 60 seconds (default)
   - **Rate Limiting**: Enable to prevent abuse
   - Click "Save"

### Configure Email Settings (Optional)

If you want email notifications:
1. Go to "Authentication" → "Email Templates"
2. Customize templates for password reset, magic link, etc.

---

## 3. Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended)

1. **Open SQL Editor**
   - Sidebar: Click "SQL Editor"
   - Click "New Query"

2. **Run Migrations in Order**
   
   Copy and paste each migration file content and execute:

   **Step 1: Initial Schema** (`001_initial_schema.sql`)
   ```sql
   -- Copy entire contents from:
   -- Prompt-repo/supabase/migrations/001_initial_schema.sql
   -- Run the query
   ```

   **Step 2: RLS Policies** (`002_rls_policies.sql`)
   ```sql
   -- Copy entire contents from:
   -- Prompt-repo/supabase/migrations/002_rls_policies.sql
   -- Run the query
   ```

   **Step 3: Functions & Triggers** (`003_functions_and_triggers.sql`)
   ```sql
   -- Copy entire contents from:
   -- Prompt-repo/supabase/migrations/003_functions_and_triggers.sql
   -- Run the query
   ```

   **Step 4: Seed Data** (`004_seed_data.sql`)
   ```sql
   -- Copy entire contents from:
   -- Prompt-repo/supabase/migrations/004_seed_data.sql
   -- Run the query
   ```

   **Step 5: Admin Features** (`005_admin_features.sql`)
   ```sql
   -- Copy entire contents from:
   -- Prompt-repo/supabase/migrations/005_admin_features.sql
   -- Run the query
   ```

   **Step 6: Ratings** (`006_ratings.sql`)
   ```sql
   -- Copy entire contents from:
   -- Prompt-repo/supabase/migrations/006_ratings.sql
   -- Run the query
   ```

3. **Verify Tables Created**
   - Sidebar: Click "Table Editor"
   - You should see: `profiles`, `hotspots`, `plans`, `purchases`, `vouchers`, etc.

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
cd ZemwifiApp
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Verify with remote database
supabase db pull
```

---

## 4. Get API Credentials

1. **Navigate to Project Settings**
   - Sidebar: Click ⚙️ "Project Settings" → "API"

2. **Copy Credentials**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) Key**: `eyJhbGc...` (long string)

3. **Update `.env` File**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=eyJhbGc...your-anon-key
   ```

---

## 5. Configure Row Level Security (RLS)

RLS policies are created by migration `002_rls_policies.sql`, but verify:

1. **Check RLS Status**
   - Table Editor → Select a table (e.g., `profiles`)
   - Click "..." → "Edit Table"
   - Ensure "Enable Row Level Security" is **checked**

2. **View Policies**
   - Authentication → Policies
   - Each table should have policies like:
     - `profiles`: Users can read/update their own profile
     - `hotspots`: Public can read active hotspots
     - `vouchers`: Users can only access their own vouchers
     - `purchases`: Users can view their purchase history

---

## 6. Seed Test Data (Optional)

To test the app with sample data:

```sql
-- Create test users
INSERT INTO auth.users (id, phone, email) VALUES
  ('test-user-1', '+221771234567', 'user@test.com'),
  ('test-host-1', '+221772345678', 'host@test.com');

-- Create test profiles
INSERT INTO profiles (id, role, full_name, balance) VALUES
  ('test-user-1', 'user', 'Test User', 5000),
  ('test-host-1', 'host', 'Test Host', 10000);

-- Create test hotspot
INSERT INTO hotspots (id, name, latitude, longitude, host_id, is_active) VALUES
  ('hotspot-1', 'Test WiFi', 14.7167, -17.4677, 'test-host-1', true);

-- Create test plans
INSERT INTO plans (id, name, duration_minutes, data_mb, price, hotspot_id) VALUES
  ('plan-1', '1 Hour', 60, 500, 500, 'hotspot-1'),
  ('plan-2', '3 Hours', 180, 1500, 1000, 'hotspot-1');
```

---

## 7. Configure Storage (Optional)

For hotspot images and profile pictures:

1. **Create Storage Bucket**
   - Sidebar: Click "Storage"
   - Click "New bucket"
   - **Name**: `hotspot-images`
   - **Public**: Yes (for public images)
   - Click "Create bucket"

2. **Set Bucket Policies**
   ```sql
   -- Allow public read access
   CREATE POLICY "Public can view hotspot images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'hotspot-images');

   -- Allow authenticated users to upload
   CREATE POLICY "Hosts can upload images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'hotspot-images');
   ```

---

## 8. Test the Connection

### From Your App

1. **Start the app**
   ```bash
   npm start
   ```

2. **Test Authentication**
   - Open the app
   - Try to sign in with phone number
   - You should receive an OTP SMS
   - Verify the OTP code works

3. **Test Data Fetching**
   - Browse hotspots (should load from Supabase)
   - Check if test data appears

### Using Supabase Dashboard

1. **Table Editor**
   - Click on tables to view data
   - Manually insert/update records

2. **API Docs**
   - Sidebar: Click "API"
   - Test endpoints with the built-in documentation

---

## 9. Production Checklist

Before going live:

- [ ] **Security**
  - [ ] Review all RLS policies
  - [ ] Enable rate limiting on authentication
  - [ ] Set up database backups
  - [ ] Configure custom domain (optional)

- [ ] **Performance**
  - [ ] Add database indexes (see migration 003)
  - [ ] Enable connection pooling
  - [ ] Set up CDN for storage (if using images)

- [ ] **Monitoring**
  - [ ] Enable database logs
  - [ ] Set up alerts for errors
  - [ ] Monitor API usage

- [ ] **Compliance**
  - [ ] Review data retention policies
  - [ ] Ensure GDPR compliance (if applicable)
  - [ ] Set up data export functionality

---

## 10. Troubleshooting

### Common Issues

**Phone Authentication Not Working**
- Verify SMS provider credentials
- Check Twilio account balance
- Test phone number format (+221771234567)
- Review authentication logs

**RLS Policy Errors**
- Ensure policies are enabled on all tables
- Check user authentication state
- Review policy definitions in migration 002

**Slow Queries**
- Check database indexes (migration 003)
- Review query patterns
- Enable query performance insights

**Connection Errors**
- Verify `.env` file has correct credentials
- Check network connectivity
- Ensure Supabase project is active

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: Report app-specific issues

---

## Next Steps

1. ✅ Complete this setup guide
2. Test all app features end-to-end
3. Deploy app to TestFlight/Play Store Console
4. Monitor usage and performance
5. Iterate based on user feedback

---

**Setup Complete!** 🎉

Your ZemNet backend is now ready for production use.
