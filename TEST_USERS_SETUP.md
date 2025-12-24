# Test Users Setup Guide

This guide explains how to create test users and seed data for your ZemNet database.

## Prerequisites

1. Supabase project created and configured
2. Migrations 001, 002, 003 already executed
3. Node.js and npm installed
4. `.env` file configured with Supabase credentials

## Required Environment Variables

Add to your `.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://gcqgmcnxqhktxoaesefo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Getting Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/settings/api
2. Find the **"service_role"** key (NOT the anon key)
3. Click to reveal and copy it
4. Add to `.env` as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT**: The service role key bypasses RLS. NEVER commit it to git or expose it client-side!

## Step-by-Step Instructions

### Step 1: Create Test Users in Auth

Run the script to create 5 authenticated test users:

```bash
node create-test-users.js
```

This creates:
- **Fatou Traoré** (+22670123456) - Regular User
- **Amadou Ouédraogo** (+22670234567) - Host with 4 hotspots
- **Ibrahim Sawadogo** (+22670345678) - Technician
- **Mariam Kaboré** (+22670456789) - New User
- **Admin User** (+22670999999) - Admin

**Test Password**: `Test123456!` (or `Admin123456!` for admin)

### Step 2: Run Migration 004 (Seed Data)

Copy [migration-004-fixed.sql](./migration-004-fixed.sql) and paste into Supabase SQL Editor, then click RUN.

This adds:
- 4 hotspots in Ouagadougou
- 13 data plans
- Sample purchases, vouchers, transactions
- KYC submission for Amadou
- Service requests
- Host earnings data
- Payout request

### Step 3: Run Migration 005 (Admin Features)

Copy [migration-005-fixed.sql](./migration-005-fixed.sql) and run it.

This adds:
- Admin activity logs
- System settings
- Platform statistics
- User reports system

### Step 4: Run Migration 006 (Ratings)

Copy [migration-006-fixed.sql](./migration-006-fixed.sql) and run it.

This adds:
- Ratings table for hosts and technicians
- Rating validation functions

### Step 5: Verify Database

```bash
node verify-database.js
```

Should show all 12 tables exist.

## Test User Credentials

| Phone | Name | Role | Password | Wallet |
|-------|------|------|----------|--------|
| +22670123456 | Fatou Traoré | User | Test123456! | 2,500 XOF |
| +22670234567 | Amadou Ouédraogo | Host | Test123456! | 15,000 XOF |
| +22670345678 | Ibrahim Sawadogo | Technician | Test123456! | 8,000 XOF |
| +22670456789 | Mariam Kaboré | User | Test123456! | 0 XOF |
| +22670999999 | Admin User | Admin | Admin123456! | 0 XOF |

## Testing Authentication

### Option 1: Supabase Auth Dashboard

1. Go to Authentication → Users in Supabase Dashboard
2. You should see all 5 users listed
3. Click on any user to see their details

### Option 2: Test in App

1. Launch your Expo app: `npm start`
2. On login screen, enter phone: `+22670123456`
3. Enter password: `Test123456!`
4. You should be logged in as Fatou

### Option 3: Test with Supabase Client

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  phone: '+22670123456',
  password: 'Test123456!'
});
```

## What Each User Has

### Fatou Traoré (Regular User)
- 2,500 XOF wallet balance
- 3 purchase history records
- 1 active voucher (ABCD-1234-EFGH)
- 1 used voucher
- 1 expired voucher
- 6 transaction records

### Amadou Ouédraogo (Host)
- 15,000 XOF wallet balance
- Owns 4 hotspots (Café du Centre, Chez Maman, Bibliothèque, Hôtel La Paix)
- 13 data plans across hotspots
- Approved KYC status
- Host earnings data (current + last month)
- 1 pending payout request (10,000 XOF)
- 2 service requests
- 1 pending cash-in request

### Ibrahim Sawadogo (Technician)
- 8,000 XOF wallet balance
- Assigned to 1 service request (in progress)
- Approved KYC status

### Mariam Kaboré (New User)
- 0 XOF wallet balance
- Created 2 days ago
- No activity yet

### Admin User
- Full admin privileges
- Can approve KYC, manage payouts, view all data

## Troubleshooting

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"
- Make sure you copied the **service_role** key, not the anon key
- Check that `.env` file is in the project root
- Restart your terminal after adding the env var

### Error: "User already exists"
- Users with these UUIDs already exist
- Either delete them from Supabase Dashboard → Authentication → Users
- Or modify the UUIDs in `create-test-users.js`

### Error: "relation 'profiles' does not exist"
- Run migrations 001, 002, 003 first
- The profiles table must exist before creating users

### Profiles not updating
- Check RLS policies are correct
- Service role key bypasses RLS, so it should work
- Check Supabase logs for errors

## Security Notes

🔒 **For Production:**
- Delete all test users before going live
- Remove service role key from any client-side code
- Use proper phone verification with SMS provider (Twilio)
- Set strong password requirements
- Enable MFA for admin accounts

## Next Steps

After setup:
1. Test login with each user type
2. Test hotspot browsing (should see Amadou's 4 hotspots)
3. Test purchase flow with Fatou's account
4. Test host dashboard with Amadou's account
5. Test admin features with Admin account
6. Configure phone authentication (Twilio) for production
