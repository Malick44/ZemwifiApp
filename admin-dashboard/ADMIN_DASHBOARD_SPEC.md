# ZemNet Admin Dashboard Specification

**Generated:** December 24, 2025
**Target:** Web-first Admin/Ops Dashboard (Next.js 15)

---

## 1. Dashboard Summary

**Purpose:**
The ZemNet Admin Dashboard is the central operational control panel for the ZemNet marketplace. It enables the operations team to manage the lifecycle of hosts, users, and hotspots, oversee financial transactions (wallet cash-ins, payouts), monitor system health, and resolve support issues.

**Key Objectives:**
- **Operational Efficiency:** Streamline KYC reviews, cash-in monitoring, and payout processing.
- **Financial Integrity:** Ensure all wallet adjustments and payouts are audited and accurate.
- **Network Health:** Monitor hotspot status and host activity.
- **Fraud Prevention:** Detect and act on suspicious cash-in or voucher redemption patterns.

**Non-Goals (v1):**
- Direct router configuration/access (handled via openNDS/device).
- Deep ML-based fraud scoring (rule-based for v1).
- End-user marketing CMS (static content for now).

---

## 2. Admin Roles & Permissions

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **SuperAdmin** | Full system access | All permissions + Manage Admins + System Config |
| **OpsManager** | Operations lead | KYC Review, Manage Hosts/Hotspots, Configure Fees/Limits |
| **KYCReviewer** | Identity verification | View/Approve/Reject KYC, View Host Details |
| **SupportAgent** | L1/L2 Support | View User/Host/Transaction details, Create Tickets, Limited Reversals |
| **Finance** | Financial reconciliation | View Ledger, Manage Payouts (Batch/Mark Paid), Export Reports |

**Permission Matrix:**

| Module | SuperAdmin | OpsManager | KYCReviewer | SupportAgent | Finance |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Overview** | View | View | View | View | View |
| **Hosts (KYC)** | Edit | Edit | Edit | View | View |
| **Hosts (Manage)** | Edit | Edit | View | View | View |
| **Hotspots** | Edit | Edit | View | View | View |
| **Plans** | Edit | Edit | View | View | View |
| **Cash-ins** | View | View | View | View | View |
| **Wallet** | Adjust | Adjust | - | View | View |
| **Purchases** | View | View | - | View | View |
| **Vouchers** | Reissue | Reissue | - | View | - |
| **Payouts** | Manage | Manage | - | View | Manage |
| **Config** | Edit | Edit | - | - | View |
| **Audit Logs** | View | View | - | - | View |

---

## 3. Core Modules

1.  **Overview / KPIs:** High-level metrics (Active Hosts, Online Hotspots, Daily Revenue, Pending KYC, Pending Payouts).
2.  **Host KYC Review:** Queue of pending host applications with document viewer and decision tools.
3.  **Hosts Management:** Directory of all hosts with status (Active, Frozen), payout methods, and detailed profiles.
4.  **Hotspots Management:** Registry of hotspots including status (Online/Offline), location, sales status, and router health.
5.  **Plans Moderation:** Oversight of host-created plans to ensure pricing sanity and compliance.
6.  **Cash-in Monitoring:** Real-time view of wallet cash-in requests (Pending, Expired, Confirmed) to detect fraud.
7.  **Wallet Ledger & Adjustments:** Central ledger of all wallet transactions with capabilities for manual, audited adjustments.
8.  **Purchases & Payments:** Log of all user plan purchases and payment provider statuses.
9.  **Vouchers & Redemption Logs:** Tracking of issued vouchers and their redemption status on routers.
10. **Payouts:** Management of host earnings payouts, including batch creation, status tracking, and export.
11. **Fee & Limits Configuration:** System-wide settings for platform fees, cash-in commissions, and transaction limits.
12. **Support / Disputes:** Interface for viewing and resolving user/host reported issues.

---

## 4. Primary Admin Journeys

**A) Approve Host KYC**
1.  **Trigger:** New host signs up and submits ID documents.
2.  **Action:** KYCReviewer navigates to `/hosts/kyc`, selects a pending application.
3.  **Review:** Inspects ID photos and details against submitted data.
4.  **Decision:** Clicks "Approve".
5.  **System:** Updates host status to `active`, enables "Host" role capabilities (selling plans, cash-in).
6.  **Log:** Audit log entry created.

**B) Investigate Suspicious Cash-in Cluster**
1.  **Trigger:** Alert or observation of high frequency cash-ins from a single host.
2.  **Action:** OpsManager goes to `/cashins`, filters by Host ID.
3.  **Analysis:** Sees multiple cash-ins in short succession. Checks `/wallet/ledger` for that host.
4.  **Intervention:** Clicks "Freeze Host" on the Host Detail page, providing reason "Suspicious cash-in activity".
5.  **System:** Sets host status to `frozen`, disables cash-in/sales.
6.  **Log:** Audit log entry created.

**C) Resolve "Payment completed but voucher missing"**
1.  **Trigger:** User ticket: "I paid via Wave but didn't get a code."
2.  **Action:** SupportAgent searches `/purchases` by User Phone or Transaction ID.
3.  **Verification:** Finds purchase with status `paid` but voucher generation failed (or user lost it).
4.  **Resolution:** Clicks "Reissue Voucher".
5.  **System:** Generates new signed voucher (or retrieves existing), sends SMS/displays to agent.
6.  **Log:** Audit log entry created.

**D) Run Payout Batch**
1.  **Trigger:** Weekly payout schedule.
2.  **Action:** Finance user goes to `/payouts/batches`, clicks "Create Batch".
3.  **Config:** Selects date range (e.g., last week). System calculates total due per host.
4.  **Execution:** Reviews summary, clicks "Generate".
5.  **Export:** Downloads CSV for bulk payment processing (e.g., via mobile money provider).
6.  **Finalize:** After processing, marks batch as "Paid". System updates individual payout records.

**E) Handle User Complaint about Expired Cash-in**
1.  **Trigger:** User complains they gave cash but didn't get credit.
2.  **Action:** SupportAgent goes to `/cashins`, filters by User Phone.
3.  **Investigation:** Finds request with status `expired`.
4.  **Response:** Checks timeline. Explains policy: "Host did not confirm in time. Please retake cash from host."
5.  **Note:** Adds note to ticket. No system refund (cash is physical).

**F) Hotspot Appears Offline**
1.  **Trigger:** Hotspot `last_seen` > 1 hour.
2.  **Action:** OpsManager views `/hotspots`, filters by Status: Offline.
3.  **Diagnosis:** Checks "Last Heartbeat" timestamp and Router Stats.
4.  **Resolution:** Calls Host (contact info on screen) to check power/internet.

---

## 5. Information Architecture (IA)

**Route Structure:**

- **/admin**
  - **/overview**: Dashboard home with high-level KPIs.
  - **/hosts**
    - **/**: List of all hosts (searchable, filterable).
    - **/[id]**: Host detail (profile, hotspots, wallet, activity).
    - **/kyc**: Queue of pending KYC applications.
    - **/kyc/[id]**: KYC review screen.
  - **/hotspots**
    - **/**: List of all hotspots.
    - **/[id]**: Hotspot detail (status, sales, config).
  - **/plans**: Global list of plans (moderation view).
  - **/cashins**: Global list of cash-in requests.
  - **/wallet**
    - **/ledger**: Global wallet transaction ledger.
    - **/adjustments**: Tool for manual wallet adjustments.
  - **/purchases**
    - **/**: List of plan purchases.
    - **/[id]**: Purchase detail.
  - **/vouchers**
    - **/**: List of issued vouchers.
    - **/[id]**: Voucher detail and redemption logs.
  - **/payouts**
    - **/batches**: List of payout batches.
    - **/batches/[id]**: Batch detail (list of included payouts).
  - **/config**
    - **/fees**: Platform fee and commission settings.
    - **/limits**: Transaction limits configuration.
  - **/support**
    - **/tickets**: Support ticket queue.
    - **/tickets/[id]**: Ticket detail.
  - **/audit-logs**: System-wide audit log viewer.
  - **/settings**: Admin user settings.

---

## 6. Screen-by-Screen Specs

*(Selected Key Screens)*

### 6.1 Overview (`/admin/overview`)
- **Purpose:** At-a-glance system health.
- **Primary Actions:** None (read-only).
- **Layout:** Grid of KPI cards + Recent Activity list.
- **Components:** `KPIStatCard`, `ChartCard` (Revenue 7d), `DataTable` (Recent Alerts).
- **Data:** Total Users, Active Hosts, Online Hotspots, Revenue (24h), Pending KYC count.

### 6.2 Host List (`/admin/hosts`)
- **Purpose:** Find and manage hosts.
- **Primary Actions:** Search, Filter by Status (Active/Frozen/Pending), Export CSV.
- **Components:** `DataTable` with columns: Name, Phone, Status, Hotspots Count, Wallet Balance, Joined Date.
- **Row Actions:** View Details, Freeze (if active).

### 6.3 Host Detail (`/admin/hosts/[id]`)
- **Purpose:** 360-view of a specific host.
- **Layout:** Header (Profile info, Status Badge), Tabs (Overview, Hotspots, Wallet, KYC, Activity).
- **Primary Actions:** Freeze/Unfreeze, Edit Profile.
- **Data:**
  - *Overview:* Total Earnings, Current Balance.
  - *Hotspots:* List of owned hotspots.
  - *Wallet:* Recent transactions.
- **Modals:** Freeze Host (Reason input).

### 6.4 KYC Review (`/admin/hosts/kyc/[id]`)
- **Purpose:** Verify host identity.
- **Layout:** Split view (Left: Submitted Data, Right: Document Images).
- **Primary Actions:** Approve, Reject (Reason required).
- **Data:** Name, ID Number, ID Type, ID Photos (Front/Back/Selfie).
- **States:** Loading (fetching images), Error (load fail).

### 6.5 Payout Batches (`/admin/payouts/batches`)
- **Purpose:** Manage host payouts.
- **Primary Actions:** Create New Batch.
- **Components:** `DataTable` (Batch ID, Date Range, Total Amount, Host Count, Status).
- **Modal:** Create Batch (Date Range Picker, Summary Preview, Confirm).

### 6.6 Wallet Ledger (`/admin/wallet/ledger`)
- **Purpose:** Audit trail of all money movement.
- **Components:** `DataTable` (Tx ID, User/Host, Type, Amount, Balance After, Date).
- **Filters:** Type (Deposit, Purchase, Payout, Fee), Date Range, User ID.

---

## 7. Reusable Components Inventory

- **AppShell:** Sidebar navigation, Top bar with user menu and breadcrumbs.
- **DataTable:** TanStack Table wrapper.
  - Features: Server-side pagination, sorting, column toggling, row selection.
- **StatusBadge:** Visual indicator for statuses (Green=Active/Online/Paid, Red=Frozen/Offline/Failed, Yellow=Pending).
- **Money:** Formatter for XOF currency (e.g., `1,500 FCFA`).
- **DateTime:** Standardized date/time display (local time).
- **ConfirmationDialog:** Modal requiring explicit confirmation (sometimes typing a keyword).
- **DrawerDetails:** Side drawer for quick view of record details without leaving the list.
- **AuditTimeline:** Vertical list of audit events.
- **KPIStatCard:** Simple card with Label, Value, and Trend.
- **ChartCard:** Wrapper for Recharts components.
- **EmptyState:** Illustration + Text + Action for empty lists.
- **Toast:** Notification system for success/error feedback.

---

## 8. Design System (Tokens)

- **Colors:**
  - Primary: Brand Blue (`#0066CC`)
  - Secondary: Teal (`#00CC99`)
  - Neutral: Slate (`50` to `900`)
  - Status:
    - Success: Emerald
    - Warning: Amber
    - Error: Rose
    - Info: Sky
- **Typography:** Inter or system-ui.
  - H1: 24px/32px Bold
  - H2: 20px/28px Semibold
  - Body: 14px/20px Regular
  - Mono: JetBrains Mono (for IDs/Codes)
- **Spacing:** 4px grid (`p-1` to `p-16`).
- **Radii:** `rounded-md` (6px) default.
- **Shadows:** `shadow-sm` for cards, `shadow-lg` for modals.

---

## 9. Data Model & Queries

**Key Tables (Supabase):**
- `profiles`: `id`, `role` (admin, host, user), `full_name`, `phone`.
- `hosts`: `id` (ref profiles), `kyc_status`, `payout_info`.
- `hotspots`: `id`, `host_id`, `name`, `status`, `last_seen_at`.
- `wallet_transactions`: `id`, `wallet_id`, `amount`, `type`, `reference_id`.
- `audit_logs`: `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`.

**Key RPCs (Edge Functions/Postgres Functions):**
- `admin_get_dashboard_stats()`: Aggregates counts for Overview.
- `admin_list_hosts(filters, page, limit)`: Paginated host search.
- `admin_approve_kyc(host_id, admin_id)`: Updates status, logs action.
- `admin_freeze_host(host_id, reason, admin_id)`: Updates status, logs action.
- `admin_create_payout_batch(start_date, end_date)`: Generates batch records.

---

## 10. Security & Audit Logging

- **Auth:** Supabase Auth.
- **RBAC:** Custom `admin_role` check in RLS policies.
  - `profiles.role` must be `admin` or specific sub-role.
- **RLS:** "Deny All" by default. Specific policies for Admin role to view/edit all data.
- **Audit Logging:**
  - **Middleware/Trigger:** Every mutation via Admin API triggers an insert to `audit_logs`.
  - **Immutable:** `audit_logs` table is append-only (RLS prevents update/delete).
- **Guardrails:**
  - Sensitive actions (Freeze, Adjust Wallet) require `reason` field.
  - Rate limiting on API endpoints.

---

## 11. Acceptance Criteria

- [ ] Admin can log in and see the Overview dashboard.
- [ ] Host list loads with pagination and search.
- [ ] KYC approval flow works: Pending -> Approved -> Host Active.
- [ ] Host freeze flow works: Active -> Frozen -> Audit Log created.
- [ ] Payout batch generation creates correct records and CSV export.
- [ ] Wallet ledger accurately reflects database transactions.
- [ ] Support agent can find a purchase by phone number.
- [ ] All sensitive actions produce an audit log entry.
- [ ] UI is responsive on desktop and tablet.

---

## 12. Test Plan

- **Unit Tests:**
  - Utility functions (currency formatting, date formatting).
  - Component rendering (StatusBadge, DataTable).
- **Integration Tests:**
  - Server Actions: Mock Supabase calls to verify logic (e.g., Payout calculation).
- **E2E Tests (Playwright):**
  - **Smoke Test:** Login -> Load Dashboard -> Navigate to Hosts.
  - **KYC Flow:** Submit (mock) -> Admin Approve -> Verify Status.
  - **Payout Flow:** Create Batch -> Verify Summary.
- **Accessibility:**
  - Run `axe-core` on Dashboard and Detail screens. Verify no critical violations.

---

## 13. Implementation Tracker

| Module | Status | Owner | Notes |
| :--- | :--- | :--- | :--- |
| **Setup** | Not Started | Tech Lead | Next.js repo, Supabase types |
| **Auth & Shell** | Not Started | Frontend | Login, Sidebar, Layout |
| **Hosts & KYC** | Not Started | Fullstack | List, Detail, Review Action |
| **Hotspots** | Not Started | Frontend | List, Detail |
| **Wallet/Finance** | Not Started | Backend | Ledger, Payouts RPCs |
| **Config/Audit** | Not Started | Fullstack | Settings, Logs |

---

## 14. Open Questions

1.  Do we need a separate "Admin" table, or just a role in `profiles`? (Assumed: Role in `profiles`).
2.  Is the Payout calculation purely based on Wallet Balance, or specific earnings? (Assumed: Wallet Balance).
3.  Do we need multi-language support (FR/EN) for v1? (Assumed: Yes, FR primary).
