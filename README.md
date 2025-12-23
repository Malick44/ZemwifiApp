# ZemNet WiFi Marketplace (Expo)

This Expo Router project delivers the ZemNet mobile marketplace experience with Supabase for backend and Zustand for offline-ready state. The app supports guest discovery, OTP-based authentication, voucher purchases, wallet management, host tools, and technician views.

## Environment

Create a `.env` file from `.env.example` and provide your Supabase URL and anon key.

## Running

```
npm install
npx expo start
```

## Tests

Basic smoke tests live in `tests/` and can be executed with `node`:

```
node --loader ts-node/register tests/cashin-expiry.test.ts
node --loader ts-node/register tests/voucher-persist.test.ts
```
