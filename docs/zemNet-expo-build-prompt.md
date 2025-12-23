# ZemNet — Expo App Build Prompt (Hand this to an LLM)

**Source of truth:** `zemNet.md` (ZemNet Wi‑Fi Marketplace — Complete Specification)

**Goal:** Generate a complete, runnable **Expo (React Native)** application prototype for ZemNet.

**Today’s date:** December 22, 2025

---

## 0) What you are building

Build **ZemNet**, a community-powered Wi‑Fi marketplace for Burkina Faso:

- **Users** discover nearby Wi‑Fi hotspots, purchase time-based access plans (via wallet or mobile money simulation), receive a **voucher (QR + code)**, and follow guidance to connect through a captive portal.
- **Hosts** monetize their internet by creating hotspots and selling plans, and can do **cash‑in** (accept cash and credit a user wallet via a confirmation request).

This repo/task is for a **client-side Expo prototype** (with mock data and simulated payments) that respects the route structure and UI behaviors from `zemNet.md`.

### Non-goals for this build (do NOT implement)

- Real mobile money provider integration (Wave/Orange/Moov) — simulate payment statuses.
- Real router / captive portal integration — provide a “Connect help” guide and a mock “voucher validation” screen/state.
- Admin web back office.

---

## 1) Tech constraints & decisions (follow strictly)

### Platform

- Expo + React Native + TypeScript
- Use **Expo Router** for navigation.

### Backend

- Use **Supabase** (Auth + Postgres + RLS) as the backend.
- The backend contract for this app is already defined in this repo under `supabase/`.
  - Migrations live in `supabase/migrations/` (schema, RLS, functions/triggers, seed data).
  - Use them as the source of truth for tables/columns and any RPC functions.
- Expo env vars (required):
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_KEY`
  - Use the repo’s `.env.example` as the template.

### Offline expectations

- Allow **guest browsing** of hotspots (map/list) without authentication.
- Store **issued vouchers locally** so they remain viewable offline.

### Localization

- French-first, English supported.
- Text strings must be centralized (simple i18n layer).

### Accessibility

- WCAG 2.1 AA mindset: labels, focus order, readable sizing, contrast, helpful error messages.

---

## 2) App routes & navigation (Expo Router)

Implement the following route structure (keep the folder names; screens can be slightly consolidated if necessary, but keep the navigation paths working):

```
/(auth)
  welcome
  phone
  otp
  profile

/(app)
  /(user)
    map
    list
    hotspot/[id]
    payment/method
    payment/status
    payment/success
    wallet
    wallet/topup-qr
    wallet/topup-requests
    wallet/topup-requests/[id]
    wallet/[voucherId]
    history
    connect-help

  /(host)
    start
    kyc
    dashboard
    claim
    setup
    hotspots
    hotspot/[id]
    sessions
    earnings
    payouts
    cashin
    cashin-history
    technician-requests
    technician-requests/new
    technician-requests/[id]

  /(technician)
    technician/dashboard

  /(shared)
    settings
    support
    legal
    about
    transaction-detail/[id]

/(modal)
  qr
  plan-editor
```

### Tabs

- User tabs: **Carte (Map)**, **Liste (List)**, **Portefeuille (Wallet)**, **Historique (History)**, **Réglages (Settings)**
- Host entry point should be reachable from Settings or a role switch control.

---

## 3) Data model (TypeScript)

Create types matching the spirit of `zemNet.md` (keep it minimal but coherent). At minimum:

- `User`: id, name, phone, role(s), walletBalanceXOF
- `Hotspot`: id, name, landmarkText, location { lat, lng }, ssid, status (online/offline), hostId, minPriceXOF
- `Plan`: id, hotspotId, title, durationMinutes, priceXOF, isActive
- `Voucher`: id, code, qrPayload, hotspotId, planId, issuedAt, expiresAt, status (active/used/expired), deviceBinding (optional)
- `Purchase`: id, userId, hotspotId, planId, amountXOF, paymentMethod, status, createdAt
- `CashInRequest`: id, hostId, userId, amountXOF, createdAt, expiresAt, status (pending/confirmed/expired/denied)

> Important: These TS types should map cleanly to the Supabase schema defined in `supabase/migrations/001_initial_schema.sql`.

### Mock data

Provide realistic Burkina Faso examples:

- Amounts in XOF
- Phone numbers in `+226 XX XX XX XX`
- Landmark-based hotspot descriptions

---

## 4) State management & storage (Zustand)

Implement the client state using **Zustand** with a domain-store approach:

- `useAuthStore`: session, user profile, role switch
- `useDiscoveryStore`: hotspots, plans, search/filters
- `useWalletStore`: wallet balance, vouchers (persisted)
- `usePurchasesStore`: purchase history (persisted)
- `useCashInStore`: cash-in requests (persisted + expiry handling)

Persist with `zustand/middleware` `persist` using AsyncStorage.

Persisted state must include:

- a store version number
- a minimal migration strategy for shape changes

### Data fetching strategy

- Read public discovery data from Supabase (online hotspots, active plans).
- For offline mode, show last-known cached data from persisted Zustand state.
- Writes (purchase initiation, cash-in confirmation, plan edits) should:
  - attempt the Supabase write,
  - update local store on success,
  - show an actionable error on failure.

Persist using `AsyncStorage` (or secure store for voucher codes if you choose; explain choice in a short comment).

---

## 5) Screens (build behavior + edge cases)

Implement each screen with:

- Purpose
- Primary actions
- Loading / empty / error / success states

### (auth) Welcome

- Branding placeholder + highlights.
- Buttons:
  - “Commencer” → phone
  - “Continuer en invité” → user map
- Language selector (FR/EN).

### (auth) Phone

- Validate Burkina Faso format `+226` + 8 digits.
- “Continuer” simulates sending OTP and navigates to otp.

### (auth) OTP

- 6-digit input.
- Simulate verification.
- If “new user” → profile; else → user map.

### (auth) Profile

- Capture name; validate min 2 chars.
- Finish → user map.

### User: Map

- Map can be implemented as:
  - Option A (simpler): a “fake map” card + list preview
  - Option B: real map via `react-native-maps`

Show hotspot pins/rows with status (online/offline) and min price.

### User: List

- Low-data list of hotspots with filters.

### User: Hotspot detail

- Show hotspot details: name, landmark, status, SSID.
- Show plan list.
- CTA: “Acheter un pass” → payment/method.

### User: Payment method

- Choose: Wallet vs Mobile Money.
- If wallet balance insufficient → show informative error and suggest cash-in/top up.

### User: Payment status

Simulate payment states:

- Pending (“En attente”) with refresh and “J’ai payé”.
- Success → payment/success.
- Failure with retry.

### User: Payment success

- Display voucher code + QR.
- Save voucher to wallet.

### User: Wallet

- Show wallet balance.
- Section: “Mes vouchers” list.
- Section: “Recharges en attente” shortcut.

### User: Top-up QR

- Show a QR payload representing the user identifier.
- Also show the identifier as text for manual entry.

### User: Top-up requests + request detail

- List pending requests.
- Detail screen: accept/deny.
- Expiry: 10 minutes — show countdown.

### User: Voucher detail

- QR + code.
- Expiry and status.
- Actions: copy code, show fullscreen QR modal.

### User: History

- Purchases list.

### User: Connect help

- Step-by-step guide:
  1) Join SSID
  2) Captive portal opens
  3) Enter voucher
  4) Tips if portal doesn’t open

### Host: Start / KYC

- KYC form (mock) and payout method capture.
- Mark host as “KYC pending/approved” in state.

### Host: Dashboard

- KPIs: active hotspots, today revenue (mock), pending cash-ins.

### Host: Hotspot management

- List hotspots.
- Manage a hotspot: edit metadata, manage plans.

### Modal: Plan editor

- Create/edit plan (duration + price + title + active toggle).

### Host: Cash-in

- Scan user QR (can be simulated by manual entry).
- Create a cash-in request with 10-minute expiry.

### Host: Cash-in history

- List all requests with statuses.

### Shared: Settings, Support, Legal, About

- Settings: language, role switch (user/host), clear cache (dev).
- Support: WhatsApp/phone placeholders.

---

## 6) UI system (simple but consistent)

Use the visual tokens from `zemNet.md`:

- Neutral background, primary `#030213`
- Success `#10b981`, warning `#f59e0b`, info `#3b82f6`, destructive `#d4183d`

Implement minimal reusable components:

- `Button`, `TextField`, `Card`, `Badge`, `ListRow`, `EmptyState`, `Toast`

---

## 7) Project deliverables (mandatory)

The output must include:

1. A runnable Expo app (TypeScript).
2. A minimal `README.md` with:
   - setup
   - run steps
   - how to switch roles
3. Supabase integration:
  - a tiny `supabase.ts` client wrapper
  - env var setup using `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_KEY`
  - copy `.env.example` → `.env` (or `.env.local`) for local development
  - pointers to applying migrations from `supabase/migrations/`
4. Zustand stores + persistence (AsyncStorage) for offline-friendly UX.
4. At least 2 tiny tests (or a simple “smoke test” script) to validate:
   - voucher persists after app restart (mocked)
   - cash-in request expiry logic

If tests aren’t feasible in your chosen Expo setup, explain why and include an alternative verification script.

---

## 8) Acceptance criteria

- Guest can browse hotspots (map/list) without login.
- OTP flow results in an authenticated session.
- User can select a hotspot plan, complete a simulated payment, and receive a saved voucher.
- Wallet shows vouchers and balance; voucher detail shows QR + code.
- Host can create a cash-in request; user can confirm it; wallet balance updates.
- French/English toggle changes UI text.
- Loading/empty/error states exist for every list.
- Supabase reads work for discovery data (online hotspots + active plans).
- Authenticated user can read their vouchers/purchases (RLS enforced).
- Offline mode shows cached last-known hotspots/vouchers from Zustand persisted state.

---

## 9) Assumptions you may make (keep minimal)

- Use mock GPS location.
- Hotspot online/offline status is read from Supabase; if offline, show cached last-known.
- Use mock payment delay and state transitions.

When you assume something, list it clearly in a short “Assumptions” section in the README.
