# Implementation Tracker: Canonical Schema & Refactor

**Status**: In Progress

## 1. Schema & Backend (`012_canonical_schema.sql`)
- [x] Tables: `profiles`, `hotspots`, `plans`, `wallet_transactions`
- [x] Tables: `purchases`, `vouchers`, `cashin_requests`, `hotspot_keys`
- [x] RPC `host_create_cashin`
- [x] RPC `user_confirm_cashin`
- [x] RPC `process_purchase`
- [x] RPC `nearby_hotspots`
- [x] RPC `router_heartbeat`

## 2. Stores Refactor
- [x] `walletStore`: Uses `wallet_transactions`, `pendingCashIns`, `confirmCashIn`.
- [x] `hostHotspotStore`: Uses `createCashInRequest`, removed duplicates.
- [x] `authStore`: Uses `profiles`, `wallet_balance_xof`.

## 3. UI Implementation
- [x] **Voucher Detail**: Single Device UX (Token + Open Portal + Copy).
- [x] **Host Cash-in**: Request creation screen.
- [x] **User Wallet**: Pending requests list & confirmation.
- [x] **Plan Picker**: Modal to list active plans (Basic impl).
- [x] **Payment Failed**: Error screen.
- [x] **Dashboard**: Fixed bugs and lint errors.

## 4. Documentation
- [x] `docs/portal-contract.md` created.
- [x] `src/lib/voucher.ts` (Mock helper) created.

## 5. Next Steps / TODO
- [ ] Run full test suite.
- [ ] Verify functionality on actual device/emulator involving Supabase calls (requires active backend).
- [ ] Verify Plan Picker navigation flow to Payment Confirm.
- [ ] Implement Router Firmware scripts (outside scope of this task).
