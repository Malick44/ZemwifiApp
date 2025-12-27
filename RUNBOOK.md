# RUNBOOK

## Prerequisites
- Node.js
- Expo CLI
- Supabase Project

## 1. Install Dependencies
```bash
npm install
npm install expo-clipboard
```

## 2. Database Setup
Apply the canonical migration to your Supabase instance:
```bash
supabase db reset # Optional: Clean slate
supabase migration up
# OR copy content of docs/supabase/migrations/012_canonical_schema.sql to SQL Editor
```

## 3. Type Check & Lint
```bash
npm run typecheck
npx eslint .
```

## 4. Run Tests (Jest)
```bash
npm test
```
*Note: Tests for voucher logic and cash-in expiry should pass.*

## 5. Start Application
```bash
npx expo start
```
- Press `i` for iOS simulator
- Press `a` for Android emulator

## 6. Verification Steps
1. **Login**: Use phone auth.
2. **Host Mode**: Create a hotspot, create a plan.
3. **Internal Cash-in**: Go to Host Dashboard -> Cash-in. Request 1000 XOF for your own phone number.
4. **Confirm Cash-in**: Go to User Wallet -> Requests. Assert request appears. Confirm it.
5. **Check Balance**: Wallet balance should increase.
6. **Buy Voucher**: Go to Hotspot -> Choose Plan -> Confirm (Mock purchase).
7. **Redeem**: Open Voucher -> Copy Code -> "Se Connecter".
