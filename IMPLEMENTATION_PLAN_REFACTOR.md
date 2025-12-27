# Implementation Plan: Canonical Schema & Refactor

## Goal
Enforce canonical Supabase schema (`profiles`, `hotspots`, `wallet_transactions`, etc.), implement required RPCs, refactor stores, and implement missing UI flows (Plan Picker, Single-device UX, Cash-in).

## 1. Database Schema & RPCs (Migration `012_canonical_schema.sql`)
- [x] **Tables**: `profiles`, `hotspots`, `plans`, `wallet_transactions`, `purchases`, `vouchers`, `cashin_requests`, `hotspot_keys`.
- [x] **RPCs**:
    - `nearby_hotspots`
    - `host_create_cashin`
    - `user_confirm_cashin`
    - `process_purchase`
    - `issue_voucher` (internal)
    - `router_claim` (stubs)
    - `router_heartbeat`
- [x] **RLS Policies**: Enforce strict access control.

## 2. Store Refactor
- [ ] Refactor `authStore.ts` to use `profiles`.
- [ ] Refactor `walletStore.ts` to use `wallet_transactions` and new RPCs.
- [ ] Refactor `hostHotspotStore.ts` to use new RPCs for stats and creation.
- [ ] Create/Update `cashInStore.ts` for host and user flows.

## 3. UI Implementation
- [ ] **Single Device UX**: value in `VoucherDetails`.
- [ ] **Cash-in**: Host screen (request) & User screen (confirm with countdown).
- [ ] **Modal**: `plan-picker`.
- [ ] **Payment**: Failed/Expired screen.

## 4. Testing & Docs
- [ ] `src/lib/voucher.ts` (helper).
- [ ] Jest tests.
- [ ] `docs/portal-contract.md`.
- [ ] `IMPLEMENTATION_TRACKER.md`.
- [ ] `RUNBOOK.md`.
