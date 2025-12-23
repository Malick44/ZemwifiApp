# One-shot LLM Prompt — Expo + Supabase + Zustand (ZemNet)

Use this prompt to get an LLM to generate the **entire Expo project in one shot**.

This repo already contains:

- Product spec: `zemNet.md`
- App build spec: `zemNet-expo-build-prompt.md`
- Repo standards: `constitution.md`
- Supabase backend contract (schema + RLS + functions + seed): `supabase/migrations/*`
- Env template: `.env.example`

---

## Non‑negotiable instructions (read carefully)

1. **You must generate a complete, runnable Expo (React Native) app project in one output.**
2. **No placeholders / no TODOs** for core functionality. If something must be mocked (payments, router captive portal), implement the mock fully.
3. **Follow repository standards** from `constitution.md`.
4. **Backend is Supabase** and **state is Zustand**.
5. **Do not invent database columns or table names**. Use the SQL in `supabase/migrations/*` as the contract.
6. **Environment variables** must use exactly:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_KEY`
   And your repo already provides values in `.env.example`.
7. Do **not** include any service role keys. Client uses publishable/anon only.

---

## Output format (STRICT)

Output **only** one of these formats:

### Option A (preferred): scaffold script + minimal files

- Provide a single file named `scripts/scaffold.mjs` that writes the full project to disk.
- After that, provide only:
  - `README.md`
  - `.gitignore`
  - `.env.example` (do not change its values)

The scaffold script must create **all other files**.

### Option B: file-by-file output

If you cannot output a scaffold script, then output every file using this exact structure:

- A single line: `FILE: relative/path`
- Immediately followed by a fenced code block with the file contents.

No extra commentary. No missing files.

---

## Deterministic project file tree (must match)

Your output must create exactly this structure (add extra files only if truly necessary):

```
.
├── app
│   ├── (auth)
│   │   ├── welcome.tsx
│   │   ├── phone.tsx
│   │   ├── otp.tsx
│   │   └── profile.tsx
│   ├── (app)
│   │   ├── (user)
│   │   │   ├── map.tsx
│   │   │   ├── list.tsx
│   │   │   ├── hotspot
│   │   │   │   └── [id].tsx
│   │   │   ├── payment
│   │   │   │   ├── method.tsx
│   │   │   │   ├── status.tsx
│   │   │   │   └── success.tsx
│   │   │   ├── wallet
│   │   │   │   ├── index.tsx
│   │   │   │   ├── topup-qr.tsx
│   │   │   │   ├── topup-requests
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── [id].tsx
│   │   │   │   └── [voucherId].tsx
│   │   │   ├── history.tsx
│   │   │   └── connect-help.tsx
│   │   ├── (host)
│   │   │   ├── start.tsx
│   │   │   ├── kyc.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── claim.tsx
│   │   │   ├── setup.tsx
│   │   │   ├── hotspots.tsx
│   │   │   ├── hotspot
│   │   │   │   └── [id].tsx
│   │   │   ├── sessions.tsx
│   │   │   ├── earnings.tsx
│   │   │   ├── payouts.tsx
│   │   │   ├── cashin.tsx
│   │   │   ├── cashin-history.tsx
│   │   │   ├── technician-requests
│   │   │   │   ├── index.tsx
│   │   │   │   ├── new.tsx
│   │   │   │   └── [id].tsx
│   │   ├── (technician)
│   │   │   └── technician
│   │   │       └── dashboard.tsx
│   │   ├── (shared)
│   │   │   ├── settings.tsx
│   │   │   ├── support.tsx
│   │   │   ├── legal.tsx
│   │   │   ├── about.tsx
│   │   │   └── transaction-detail
│   │   │       └── [id].tsx
│   ├── (modal)
│   │   ├── qr.tsx
│   │   └── plan-editor.tsx
│   ├── _layout.tsx
│   └── index.tsx
│
├── src
│   ├── lib
│   │   ├── supabase.ts
│   │   ├── i18n.ts
│   │   ├── format.ts
│   │   └── time.ts
│   ├── stores
│   │   ├── authStore.ts
│   │   ├── discoveryStore.ts
│   │   ├── walletStore.ts
│   │   ├── purchasesStore.ts
│   │   └── cashInStore.ts
│   ├── components
│   │   ├── ui
│   │   │   ├── Button.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── EmptyState.tsx
│   │   └── AppHeader.tsx
│   └── types
│       └── index.ts
│
├── scripts
│   └── scaffold.mjs
├── tests
│   ├── cashin-expiry.test.ts
│   └── voucher-persist.test.ts
│
├── app.json
├── package.json
├── tsconfig.json
├── README.md
├── .env.example
└── .gitignore
```

---

## Required libraries

Use these (or the closest Expo-compatible equivalents):

- `expo`, `expo-router`, `react`, `react-native`, `typescript`
- `@supabase/supabase-js`
- `zustand`
- `@react-native-async-storage/async-storage`
- A QR library compatible with Expo (e.g., `react-native-qrcode-svg`)
- A lightweight i18n approach (can be custom module, no heavy library required)

---

## Supabase backend contract

Treat the SQL migrations as fully authoritative:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_functions_and_triggers.sql`
- `supabase/migrations/004_seed_data.sql`

### Required Supabase usage

- Use Supabase Auth for sign-in.
  - Preferred: phone OTP.
  - If phone OTP isn’t practical in the environment, use email OTP and document that substitution.
- Discovery (guest) reads must use the public RLS policies:
  - online hotspots and active plans.
- Authenticated reads must respect RLS:
  - user vouchers, purchases, transactions.

---

## Zustand rules

- Create separate domain stores (auth/discovery/wallet/purchases/cash-in).
- Persistence via `zustand/middleware` `persist` using AsyncStorage.
- Persist: vouchers, purchases, wallet balance, language.
- Do not persist: transient UI flags, loading spinners.

---

## App requirements (source spec)

Implement the app exactly per `zemNet-expo-build-prompt.md`.

Do not ask questions; make minimal assumptions and list them in `README.md`.

---

## Definition of Done (must satisfy before you stop)

1. Project installs and runs.
2. Guest can browse hotspots without login.
3. Auth flow works end-to-end.
4. User can select a plan and complete a simulated payment state machine.
5. Voucher is created (via Supabase for wallet purchases; simulated for mobile money until paid) and is also cached locally for offline access.
6. Host can create cash-in requests; user can confirm; wallet balance updates.
7. French/English toggle changes visible text.
8. There are loading/empty/error states.
9. Tests (or smoke checks) exist and run.

---

## Final instruction

Now generate the entire project in **one shot** following the Output format rules.
