# ZemNet Seed Data & Business Logic Implementation Plan

## Overview
This plan outlines the strategy for inserting mock data and implementing core business logic for the ZemNet application.

## Phase 1: Data Seeding (Excluding Users - Already Complete)

### 1.1 Hotspots (4 locations in Ouagadougou)
**Goal**: Create realistic hotspot locations with proper geo-coordinates

**Data to Insert**:
- Café du Centre (Central Market area)
- Restaurant Chez Maman (Zone 1)
- Bibliothèque Municipale (Municipal Library)
- Hôtel La Paix (Gounghin district)

**Fields**:
- host_id (link to Fatima - host user)
- name, landmark, lat, lng, ssid
- is_online, sales_paused, hours
- created_at (staggered dates)

### 1.2 Plans (13 plans across 4 hotspots)
**Goal**: Create diverse pricing tiers for different usage patterns

**Plan Types**:
- Quick access: 30min - 1hr (100-250 XOF)
- Regular use: 2-3hrs (250-400 XOF)
- Extended: Half-day, full-day (500-1000 XOF)
- Premium: 24hr, week pass (1000-5000 XOF)

**Fields**:
- hotspot_id, name
- duration_seconds, data_bytes, price_xof
- is_active, created_at

### 1.3 Purchases & Vouchers
**Goal**: Create realistic purchase history with various states

**Voucher States to Test**:
1. **Active**: Purchased but not used yet (valid)
2. **Used**: Successfully redeemed and consumed
3. **Expired**: Past expiration date, not used

**Test Scenarios**:
- Wallet payments
- Mobile money payments (Orange, Wave)
- Mix of payment methods

### 1.4 Transactions
**Goal**: Complete financial history for test users

**Transaction Types**:
- `topup`: Wallet recharge
- `purchase`: Voucher purchases (debit)
- `payout`: Withdrawals
- `cashin_earned`: Host commission from cash-in
- `refund`: Failed purchase refunds

**Balance Tracking**:
- Track balance_before and balance_after
- Ensure chronological consistency

### 1.5 Sessions
**Goal**: Usage analytics data

**Data Points**:
- Voucher redemption tracking
- Device MAC addresses
- Start/end times
- Data consumption in bytes

### 1.6 Cash-In Requests
**Goal**: Host-to-user wallet recharge flow

**States to Test**:
- `pending`: Awaiting confirmation
- `confirmed`: Completed successfully
- `expired`: Timeout (10min expiry)
- `cancelled`: User/host cancelled

### 1.7 KYC Submissions
**Goal**: Host verification process

**Test Data**:
- Approved KYC for host user
- Pending KYC submissions
- Document URLs (mock)

### 1.8 Service Requests
**Goal**: Technician dispatch system

**Request Types**:
- `setup-help`: Initial installation
- `router-issue`: Technical problems
- `maintenance`: Routine checks
- `expansion`: New equipment

**Priorities**: low, medium, high, urgent

**States**: pending, assigned, in-progress, completed, cancelled

### 1.9 Host Earnings
**Goal**: Revenue tracking and reporting

**Periods**:
- Current month (ongoing)
- Last month (completed)
- Historical data (2-3 months)

**Calculations**:
- Total sales
- Platform fee (10%)
- Cash-in commission
- Net earnings

### 1.10 Payout Requests
**Goal**: Host withdrawal system

**States**:
- `pending`: Awaiting admin approval
- `processing`: Payment in progress
- `completed`: Successfully paid
- `rejected`: Denied with reason

---

## Phase 2: Business Logic Implementation

### 2.1 Voucher Lifecycle
```
Purchase → Generate Code → Activation Window (7 days) → Use → Session → Expire
```

**Rules**:
- Vouchers expire 7 days after purchase if unused
- Once activated, duration starts immediately
- Can only be used once
- Device MAC locked after first use

**Implementation**:
- `generateVoucherCode()`: Create unique 12-char codes
- `activateVoucher()`: Start usage session
- `checkVoucherStatus()`: Validate before use
- `expireVouchers()`: Cron job to mark expired

### 2.2 Wallet System
**Core Operations**:
- Top-up (mobile money integration)
- Purchase deduction (atomic transactions)
- Balance verification (before purchase)
- Transaction history

**Rules**:
- Minimum balance: 0 XOF (no overdraft)
- Minimum top-up: 100 XOF
- Maximum wallet: 1,000,000 XOF

**Implementation**:
- `addWalletFunds()`: Atomic balance update
- `deductWalletFunds()`: With rollback on failure
- `getWalletBalance()`: Real-time balance
- `getTransactionHistory()`: Paginated list

### 2.3 Cash-In System
**Flow**:
```
Host creates request → User scans QR → User confirms → Host receives commission
```

**Rules**:
- 10-minute expiration window
- 2% commission to host (min 10 XOF)
- One-time use QR codes
- SMS/notification confirmation

**Implementation**:
- `createCashInRequest()`: Generate QR code
- `confirmCashIn()`: User acceptance
- `processCashIn()`: Transfer funds + commission
- `expireCashInRequests()`: Auto-cancel old requests

### 2.4 Host Earnings
**Calculation**:
```
Net Earnings = Total Sales - Platform Fee (10%) + Cash-In Commission (2%)
```

**Tracking**:
- Real-time updates on purchases
- Monthly aggregation
- Payout-ready balance

**Implementation**:
- `recordPurchaseEarning()`: On successful sale
- `recordCashInCommission()`: On cash-in completion
- `calculatePeriodEarnings()`: Monthly reports
- `getPayoutBalance()`: Available for withdrawal

### 2.5 Payout Processing
**Requirements**:
- Minimum payout: 1,000 XOF
- Payout fee: 2% (50-200 XOF range)
- Processing time: 24-48 hours
- Payment providers: Orange Money, Wave, Moov Money

**Workflow**:
```
Request → Admin Review → Payment Processing → Confirmation → Balance Update
```

**Implementation**:
- `requestPayout()`: Create withdrawal request
- `approvePayout()`: Admin approval (manual)
- `processPayout()`: Integration with payment API
- `confirmPayout()`: Update host balance

### 2.6 Session Management
**Tracking**:
- Connection time (start/end)
- Data usage (bytes transferred)
- Device information (MAC address)
- Quality metrics (optional: speed, disconnects)

**Rules**:
- One device per voucher
- Session auto-ends on:
  - Time expiration
  - Data limit reached
  - Manual disconnect

**Implementation**:
- `startSession()`: Begin tracking
- `updateSessionData()`: Periodic updates (every 5min)
- `endSession()`: Cleanup and finalize
- `getActiveSession()`: Check user's current session

### 2.7 Service Request Lifecycle
**Flow**:
```
Host creates → System notifies technicians → Technician accepts → Work completed → Review
```

**Priority-based Assignment**:
- Urgent: <1 hour response
- High: <4 hours response
- Medium: <24 hours response
- Low: <72 hours response

**Implementation**:
- `createServiceRequest()`: Host submission
- `assignTechnician()`: Auto or manual
- `updateRequestStatus()`: State transitions
- `completeRequest()`: Close with notes

### 2.8 KYC Verification
**Documents Required**:
- Government ID (photo)
- Selfie with ID
- Proof of address
- Business registration (for hosts)

**Verification Process**:
```
Submit → Queue → Admin Review → Approve/Reject → Status Update
```

**Implementation**:
- `submitKYC()`: Upload documents
- `reviewKYC()`: Admin interface
- `approveKYC()`: Enable host features
- `rejectKYC()`: Request resubmission

---

## Phase 3: Real-Time Features

### 3.1 Hotspot Status
- Online/offline detection
- Last seen timestamp
- Connection quality indicator

### 3.2 Notifications
- Purchase confirmations
- Voucher expiration warnings (24hrs before)
- Cash-in request updates
- Service request status changes

### 3.3 Analytics
- Daily active users
- Popular hotspots
- Peak usage times
- Revenue trends

---

## Implementation Priority

### High Priority (Week 1)
1. ✅ User creation (DONE)
2. Hotspot seeding
3. Plan creation
4. Purchase & voucher flow
5. Basic wallet operations

### Medium Priority (Week 2)
6. Transaction history
7. Cash-in system
8. Host earnings tracking
9. Session management

### Low Priority (Week 3)
10. KYC submissions
11. Service requests
12. Payout system
13. Analytics dashboard

---

## Testing Strategy

### Unit Tests
- Wallet balance calculations
- Voucher code generation uniqueness
- Expiration logic
- Fee calculations

### Integration Tests
- End-to-end purchase flow
- Cash-in complete flow
- Payout request to completion

### Load Tests
- 1000+ concurrent voucher activations
- 10,000+ transaction history queries
- Real-time hotspot status updates

---

## Database Performance Considerations

### Indexes Needed
```sql
CREATE INDEX idx_vouchers_user_id ON vouchers(user_id);
CREATE INDEX idx_vouchers_status ON vouchers(expires_at) WHERE used_at IS NULL;
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_purchases_user_created ON purchases(user_id, created_at DESC);
CREATE INDEX idx_sessions_voucher ON sessions(voucher_id);
```

### Materialized Views
- Active hotspot count
- Daily revenue summary
- User activity metrics

---

## Security Considerations

1. **Voucher Codes**: Cryptographically random, check for uniqueness
2. **Balance Operations**: Use database transactions with row-level locking
3. **Payment Integration**: Store only reference IDs, not payment details
4. **QR Codes**: One-time use, expire after 10 minutes
5. **API Rate Limiting**: Prevent abuse of purchase endpoints

---

## Next Steps

1. Create seed data script (`scripts/seed-database.js`)
2. Implement core business logic in stores
3. Add validation rules to Supabase RLS policies
4. Create database functions for complex operations
5. Set up cron jobs for expiration tasks
