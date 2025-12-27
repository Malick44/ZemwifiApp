# Implementation Plan: KYC & Host Dashboard Optimization

## Goal
Implement missing KYC backend infrastructure, optimizing Host Dashboard performance with RPC, and verifying active sessions logic.

## Proposed Changes

### 1. Database Schema & Storage (New Migration: `011_kyc_and_host_stats.sql`)
- **Table `kyc_submissions`**:
    - `id` (UUID, PK)
    - `user_id` (UUID, FK users)
    - `full_name` (Text)
    - `id_number` (Text)
    - `address` (Text)
    - `id_card_url` (Text)
    - `selfie_url` (Text)
    - `status` (Enum: pending, approved, rejected)
    - timestamps
- **Storage Bucket `kyc-documents`**:
    - Restricted to authenticated users uploading their own files.
    - Admins can read all.
- **RPC `get_host_dashboard_stats`**:
    - Input: `host_id` (optional, uses auth.uid() if not provided but standard is to pass strict if logic needs it, though auth.uid is safer for RLS contexts. Actually, for RPCs called by client, `auth.uid()` inside the function is best practice for security).
    - Returns: JSON object with:
        - `total_earnings`
        - `today_earnings`
        - `active_hotspots`
        - `active_sessions`
        - `total_sales`
        - `pending_payouts`

### 2. Frontend Implementation
- **Value Object**: Update types to include `KYCSubmission`.
- **`kyc.tsx`**:
    - Implement file upload using `supabase.storage`.
    - Implement record insertion into `kyc_submissions`.
- **`hostHotspotStore.ts`**:
    - Update `fetchHostStats` (or similar) to use `rpc('get_host_dashboard_stats')`.
- **`dashboard.tsx`**:
    - Ensure it consumes the store correctly.

## Verification Plan
1. **Manual KYC Test**:
    - Go to `/host/kyc`.
    - Fill form, upload dummy images.
    - Submit.
    - Check Supabase `kyc_submissions` table and `kyc-documents` bucket.
2. **Dashboard Load Test**:
    - Check `/host/dashboard`.
    - Verify stats load correctly and faster (single network request).
3. **Active Sessions**:
    - Insert a dummy session in DB.
    - Verify it appears in Dashboard "Utilisateurs".
