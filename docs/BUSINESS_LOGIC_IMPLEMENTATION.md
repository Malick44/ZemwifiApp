# ZemNet Business Logic Summary

## ✅ Completed
- **User Management**: Test users created with profiles
- **Dev Panel**: Quick login for testing different roles

## 📝 To Implement

### 1. Run Seed Script
```bash
node scripts/seed-database.js
```

This will create:
- 4 hotspots in Ouagadougou
- 13 pricing plans
- 3 sample purchases with vouchers (active, used, expired)

### 2. Core Business Logic to Add

#### Voucher Management (`src/stores/voucherStore.ts`)
```typescript
- generateVoucherCode(): Create unique codes (XXXX-XXXX-XXXX)
- activateVoucher(code, deviceMac): Start session
- checkVoucherStatus(code): Validate before use
- getMyVouchers(): List user's vouchers by status
```

#### Wallet Operations (extend `walletStore.ts`)
```typescript
- topUpWallet(amount, provider): Add funds
- deductForPurchase(amount): Atomic deduction
- getBalance(): Current wallet balance
- getTransactionHistory(): Paginated list
```

#### Cash-In System (extend `cashInStore.ts`)
```typescript
- createRequest(userPhone, amount): Host creates QR
- confirmCashIn(requestId): User accepts
- expireOldRequests(): Auto-cancel after 10min
- calculateCommission(amount): 2% to host
```

#### Session Tracking (`src/stores/sessionStore.ts`)
```typescript
- startSession(voucherId, deviceMac): Begin usage
- updateDataUsage(sessionId, bytes): Track consumption  
- endSession(sessionId): Finalize and log
- getActiveSession(userId): Check current connection
```

#### Host Earnings (extend existing)
```typescript
- recordSale(purchaseId, amount): On successful purchase
- recordCashInCommission(requestId): On cash-in
- calculatePeriodEarnings(startDate, endDate): Reports
- getPayoutBalance(): Available for withdrawal
```

### 3. Database Functions Needed

#### Supabase Functions to Create:
```sql
-- Function: Complete purchase and generate voucher
CREATE OR REPLACE FUNCTION complete_purchase(
  p_purchase_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_voucher_id UUID;
  v_code TEXT;
BEGIN
  -- Generate unique voucher code
  v_code := generate_voucher_code();
  
  -- Update purchase status
  UPDATE purchases 
  SET payment_status = 'success'
  WHERE id = p_purchase_id;
  
  -- Create voucher
  INSERT INTO vouchers (
    code, user_id, hotspot_id, plan_id, purchase_id,
    status, expires_at
  )
  SELECT 
    v_code, p_user_id, hotspot_id, plan_id, id,
    'active', NOW() + INTERVAL '7 days'
  FROM purchases
  WHERE id = p_purchase_id
  RETURNING id INTO v_voucher_id;
  
  RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Process cash-in request
CREATE OR REPLACE FUNCTION process_cashin(
  p_request_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_amount INTEGER;
  v_commission INTEGER;
  v_host_id UUID;
BEGIN
  -- Get request details
  SELECT amount, commission, host_id
  INTO v_amount, v_commission, v_host_id
  FROM cashin_requests
  WHERE id = p_request_id AND status = 'pending';
  
  -- Update user balance
  UPDATE profiles
  SET wallet_balance = wallet_balance + v_amount
  WHERE id = p_user_id;
  
  -- Update host balance
  UPDATE profiles
  SET wallet_balance = wallet_balance + v_commission
  WHERE id = v_host_id;
  
  -- Mark request as completed
  UPDATE cashin_requests
  SET status = 'confirmed', confirmed_at = NOW()
  WHERE id = p_request_id;
  
  -- Log transactions
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES 
    (p_user_id, 'cashin', v_amount, 'Cash-in via host'),
    (v_host_id, 'cashin_commission', v_commission, 'Commission from cash-in');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 4. Cron Jobs / Scheduled Tasks

#### Expire Old Vouchers (Daily)
```typescript
// Run at midnight
async function expireVouchers() {
  await supabase
    .from('vouchers')
    .update({ status: 'expired' })
    .lt('expires_at', new Date().toISOString())
    .eq('status', 'active');
}
```

#### Expire Cash-In Requests (Every 5 minutes)
```typescript
async function expireCashInRequests() {
  await supabase
    .from('cashin_requests')
    .update({ status: 'expired' })
    .lt('expires_at', new Date().toISOString())
    .eq('status', 'pending');
}
```

### 5. RLS Policies to Add

```sql
-- Users can only see their own vouchers
CREATE POLICY "Users can view own vouchers"
ON vouchers FOR SELECT
USING (auth.uid() = user_id);

-- Users can only see their own purchases
CREATE POLICY "Users can view own purchases"
ON purchases FOR SELECT
USING (auth.uid() = user_id);

-- Hosts can see their hotspot purchases
CREATE POLICY "Hosts can view hotspot purchases"
ON purchases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hotspots
    WHERE hotspots.id = purchases.hotspot_id
    AND hotspots.host_id = auth.uid()
  )
);

-- Only admins can approve KYC
CREATE POLICY "Only admins can update KYC"
ON kyc_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 6. Key Calculations

#### Platform Fees
- **Host purchase fee**: 10% of sale price
- **Cash-in commission**: 2% to host (min 10 XOF)
- **Payout fee**: 2% (50-200 XOF range)

#### Expiration Windows
- **Vouchers**: 7 days after purchase
- **Cash-in requests**: 10 minutes
- **Sessions**: Duration from plan + 5 min grace

### 7. Testing Checklist

- [ ] Purchase flow (wallet payment)
- [ ] Purchase flow (mobile money)
- [ ] Voucher generation
- [ ] Voucher activation
- [ ] Session tracking
- [ ] Cash-in request creation
- [ ] Cash-in confirmation
- [ ] Host earnings calculation
- [ ] Payout request
- [ ] Voucher expiration
- [ ] Transaction history

### 8. Next Steps Priority

1. **Week 1**: 
   - ✅ Run seed script
   - Implement voucher lifecycle
   - Complete purchase flow
   - Test wallet deductions

2. **Week 2**:
   - Implement cash-in system
   - Add session tracking
   - Host earnings dashboard
   - Transaction history

3. **Week 3**:
   - Payout system
   - KYC flow
   - Service requests
   - Admin features

### 9. Performance Considerations

- **Indexes**: Add on frequently queried columns
- **Caching**: Store active session in memory
- **Pagination**: Limit transaction history to 50/page
- **Optimistic Updates**: Update UI before server response

### 10. Security Notes

- Always validate voucher ownership before activation
- Use database transactions for wallet operations
- Rate limit purchase attempts (max 5/minute)
- Encrypt sensitive payment data
- Audit log for admin actions

---

## Quick Start

1. Ensure test users exist: `node scripts/create-dev-users.js`
2. Seed database: `node scripts/seed-database.js`
3. Open app and use Dev Panel to login as different users
4. Test purchase flow with seeded hotspots and plans

---

## Support

If issues arise:
1. Check Supabase logs for errors
2. Verify RLS policies are not blocking queries
3. Ensure service role key is used in scripts
4. Check column names match schema
