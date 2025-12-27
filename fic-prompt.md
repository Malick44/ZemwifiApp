You are a Principal Product Designer + Staff Full-Stack Engineer. Design a **web-first Admin/Ops dashboard** for the ZemNet (Zemwifi) marketplace.

Context:
- Product: ZemNet enables Users to buy Wi-Fi access at Host hotspots using mobile money or wallet credit; Hosts can cash-in users (10-minute expiry) and sell host-defined plans. Vouchers are signed (HS256 per-hotspot key) and redeemed offline on routers (openNDS).
- Admin/Ops is **web-first** (not mobile). It must help run operations: KYC review, hotspot moderation, cash-in monitoring, payouts, fees/limits, fraud review, and support.
- Backend: Supabase (Postgres + RLS + Edge Functions/RPC). Frontend: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui. Charts: recharts. Tables: TanStack Table.
- Primary language: French (FR) with English fallback.
- Accessibility: WCAG 2.1 AA.

──────────────────────────────────────────────────────────────────────────────
NON-NEGOTIABLE BUILD & DESIGN RULES
──────────────────────────────────────────────────────────────────────────────
1) Accessibility: WCAG 2.1 AA (labels, focus, contrast, keyboard support).
2) Component-driven: define tokens + shared UI kit first; reuse everywhere.
3) Responsive: desktop-first but usable on tablet; define breakpoints.
4) States everywhere: every data surface has loading/empty/error/success.
5) Auditability: admin actions must be logged (who/when/what).
6) Secure: no service role key on client; admin actions go through server actions / Edge Functions; enforce RLS + admin role checks.
7) Local constraints: low bandwidth; prioritize efficient list queries, pagination, filters, export.

──────────────────────────────────────────────────────────────────────────────
OUTPUT FORMAT (FOLLOW STRICTLY)
──────────────────────────────────────────────────────────────────────────────
Return a single structured document with these sections in this exact order:

1. **Dashboard Summary**
2. **Admin Roles & Permissions**
3. **Core Modules (8–12)**
4. **Primary Admin Journeys** (at least 5)
5. **Information Architecture (IA)** (routes + one-line purpose)
6. **Screen-by-screen Specs** (for EVERY screen)
7. **Reusable Components Inventory**
8. **Design System** (tokens)
9. **Data Model & Queries** (tables/RPCs + key fields)
10. **Security & Audit Logging**
11. **Acceptance Criteria**
12. **Test Plan**
13. **Implementation Tracker**
14. **Open Questions / Assumptions**

──────────────────────────────────────────────────────────────────────────────
1) DASHBOARD SUMMARY
──────────────────────────────────────────────────────────────────────────────
- Purpose: operational control panel for ZemNet to manage hosts, users, hotspots, payments, wallet cash-ins, vouchers, and payouts.
- Non-goals for v1: anything that requires direct router access; deep ML fraud scoring; end-user marketing CMS.

──────────────────────────────────────────────────────────────────────────────
2) ADMIN ROLES & PERMISSIONS
──────────────────────────────────────────────────────────────────────────────
Define roles with explicit permissions:
- SuperAdmin (full access)
- OpsManager (KYC + payouts + fee config)
- KYCReviewer (KYC only)
- SupportAgent (tickets + user assist + limited reversals)
- Finance (payout reconciliation + exports)
Include a permission matrix (module × action).

──────────────────────────────────────────────────────────────────────────────
3) CORE MODULES (8–12)
──────────────────────────────────────────────────────────────────────────────
Include at least:
- Overview / KPIs
- Host KYC Review
- Hosts Management (freeze/unfreeze, payout methods)
- Hotspots Management (status, location, sales pause, router health/last_seen)
- Plans Moderation (pricing sanity checks, pause plans)
- Cash-in Monitoring (pending/expired/confirmed, suspicious patterns)
- Wallet Ledger & Adjustments (controlled, audited)
- Purchases & Payments (provider status, pending, failures)
- Vouchers & Redemption Logs (as available)
- Payouts (batching, statuses, failures, exports)
- Fee & Limits Configuration (platform fee, cash-in commission, caps)
- Support / Disputes (manual workflow)

──────────────────────────────────────────────────────────────────────────────
4) PRIMARY ADMIN JOURNEYS (>=5)
──────────────────────────────────────────────────────────────────────────────
Include happy path + edge case:
A) Approve host KYC → host becomes eligible to sell and cash-in
B) Investigate suspicious cash-in cluster → freeze host → log action
C) Resolve “Payment completed but voucher missing” → find purchase → reissue voucher (with constraints)
D) Run payout batch → mark paid → export report → handle payout failure
E) Handle user complaint about expired cash-in → view request timeline → explain policy (no wallet-to-cash refund)
F) Hotspot appears offline → check heartbeat/last_seen → contact host

──────────────────────────────────────────────────────────────────────────────
5) INFORMATION ARCHITECTURE (IA)
──────────────────────────────────────────────────────────────────────────────
Provide a full route list (Next.js App Router). Example structure (expand/adjust as needed):

/admin
  /overview
  /hosts
    /[id]
    /kyc
    /kyc/[id]
  /hotspots
    /[id]
  /plans
  /cashins
    /[id]
  /wallet
    /ledger
    /adjustments
  /purchases
    /[id]
  /vouchers
    /[id]
  /payouts
    /batches
    /batches/[id]
  /config
    /fees
    /limits
  /support
    /tickets
    /tickets/[id]
  /audit-logs
  /settings

For each route: screen name + one-line purpose.

──────────────────────────────────────────────────────────────────────────────
6) SCREEN-BY-SCREEN SPECS (FOR EVERY SCREEN)
──────────────────────────────────────────────────────────────────────────────
For each screen, include:
- Screen Name
- Route
- Purpose
- Primary actions (top 3)
- Layout regions (header/sidebar/main/right panel)
- Key components (tables, filters, modals, drawers, toasts)
- Data shown (fields/columns + example values)
- Filters/sorting/pagination
- Validation rules (forms)
- States: Loading / Empty / Error / Success
- Navigation: from/to
- Accessibility notes (focus order, keyboard, labels)
- Audit events emitted (if any)

Must include modals/drawers for:
- Approve/Reject KYC (with reason)
- Freeze/Unfreeze host (reason required)
- Manual wallet adjustment (dual confirmation, strict limits)
- Reissue voucher (guardrails)
- Create payout batch + mark paid
- Update fees/limits (role-gated)

──────────────────────────────────────────────────────────────────────────────
7) REUSABLE COMPONENTS INVENTORY
──────────────────────────────────────────────────────────────────────────────
List components to build once:
- AppShell (Sidebar + TopBar + Breadcrumbs)
- DataTable (TanStack) with:
  - column visibility
  - server pagination
  - filter bar
  - row actions menu
- StatusBadge (online/offline/pending/failed)
- Money (XOF formatting)
- DateTime
- ConfirmationDialog (requires typing “CONFIRMER” for risky ops)
- DrawerDetails (record viewer)
- AuditTimeline
- KPIStatCard
- ChartCard (recharts)
- EmptyState
- Toast system
Include props/variants/states.

──────────────────────────────────────────────────────────────────────────────
8) DESIGN SYSTEM (TOKENS)
──────────────────────────────────────────────────────────────────────────────
Provide implementable tokens:
- Colors (primary/secondary/accent, neutrals 50–900, status colors, focus ring)
- Typography scale
- Spacing scale
- Radii + shadows
- Interaction states (hover/active/disabled/focus)
- Layout (sidebar width, max content width)
Ensure high contrast and FR-first labels.

──────────────────────────────────────────────────────────────────────────────
9) DATA MODEL & QUERIES
──────────────────────────────────────────────────────────────────────────────
Assume Supabase with these conceptual tables (adjust to your canonical schema):
- profiles (roles)
- hosts (or profile role=host) + kyc_submissions
- hotspots (location, last_seen_at, sales_paused)
- plans
- purchases (payment provider, status)
- vouchers (token metadata)
- wallet_transactions (ledger)
- cashin_requests (expires_at, status)
- payouts + payout_batches
- audit_logs
- support_tickets

For each module, list:
- required queries (SQL/RPC/Edge Function)
- required indexes
- computed fields (e.g., online = now-last_seen_at < 3min)
- export endpoints (CSV)

Include recommended RPCs / server actions, e.g.:
- admin_list_hosts(filters, page)
- admin_review_kyc(kyc_id, decision, reason)
- admin_freeze_host(host_id, reason)
- admin_create_payout_batch(date_range)
- admin_mark_payout_paid(batch_id, reference)
- admin_adjust_wallet(user_id, amount_xof, reason) [strictly audited]
- admin_reissue_voucher(purchase_id) [guardrails]

──────────────────────────────────────────────────────────────────────────────
10) SECURITY & AUDIT LOGGING
──────────────────────────────────────────────────────────────────────────────
Specify:
- Admin auth model (Supabase Auth + role in profiles + RLS)
- Server actions + Edge Functions for privileged mutations
- RLS patterns (deny by default; allow admins by role)
- Audit log schema:
  - actor_id, action, entity_type, entity_id, diff, reason, created_at, ip/user_agent (if available)
- Guardrails:
  - require reason for destructive ops
  - dual confirm for wallet adjustments
  - rate limit risky endpoints
  - least privilege per role

──────────────────────────────────────────────────────────────────────────────
11) ACCEPTANCE CRITERIA
──────────────────────────────────────────────────────────────────────────────
Checklist:
- All IA routes implemented
- All tables have loading/empty/error states
- Global search works for host/user/hotspot
- KYC review end-to-end with audit logs
- Freeze/unfreeze works and is logged
- Cash-in list shows pending/expired/confirmed with filters
- Payout batch creation + export works
- Fee/limit config works with role gating
- Keyboard navigation works across tables, dialogs, and sidebar
- Responsive at 1024/768 widths

──────────────────────────────────────────────────────────────────────────────
12) TEST PLAN
──────────────────────────────────────────────────────────────────────────────
Include:
- Unit tests (formatters, role guards)
- Integration tests for server actions (mock Supabase)
- E2E smoke tests (Playwright) for:
  - login → overview
  - KYC approve flow
  - host freeze flow
  - payout batch creation
  - config update permissions
- Accessibility checks (axe) on key screens

Provide exact commands to run tests.

──────────────────────────────────────────────────────────────────────────────
13) IMPLEMENTATION TRACKER
──────────────────────────────────────────────────────────────────────────────
Create a tracker table with:
- Module
- Status (Not started / In progress / Done)
- Owner (role)
- Key files
- Tests
- Notes
Include a prioritized milestone plan (MVP week 1/2/3).

──────────────────────────────────────────────────────────────────────────────
14) OPEN QUESTIONS / ASSUMPTIONS
──────────────────────────────────────────────────────────────────────────────
Ask up to 10 questions; if unclear, assume minimally and proceed.

Now produce the full Admin Dashboard specification per the rules above.
