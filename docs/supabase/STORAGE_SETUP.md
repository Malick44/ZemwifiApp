# Storage Bucket Setup Guide

## Option 1: Via Supabase Dashboard (Recommended)

### Step 1: Create Storage Bucket
1. Go to your Supabase Dashboard: https://app.supabase.com/project/gcqgmcnxqhktxoaesefo/storage/buckets
2. Click "New bucket"
3. Configure:
   - **Name**: `technician-requests`
   - **Public bucket**: ✅ Yes (checked)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp`
4. Click "Create bucket"

### Step 2: Set Up RLS Policies
1. Go to Storage > Policies: https://app.supabase.com/project/gcqgmcnxqhktxoaesefo/storage/policies
2. Select the `technician-requests` bucket
3. Add the following policies:

#### Policy 1: Upload Photos
- **Name**: Users can upload request photos
- **Operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'technician-requests' AND
(storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 2: View Own Photos
- **Name**: Users can view their own request photos
- **Operation**: SELECT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'technician-requests' AND
(storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 3: Delete Own Photos
- **Name**: Users can delete their own request photos
- **Operation**: DELETE
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'technician-requests' AND
(storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 4: Public Read
- **Name**: Public read access to request photos
- **Operation**: SELECT
- **Target roles**: public
- **Policy definition**:
```sql
bucket_id = 'technician-requests'
```

---

## Option 2: Via SQL Editor

1. Go to SQL Editor: https://app.supabase.com/project/gcqgmcnxqhktxoaesefo/sql/new
2. Copy and paste the entire content from `docs/supabase/migrations/007_storage_bucket.sql`
3. Click "Run"

---

## Option 3: Via Command Line

If you have database password:

```bash
# Set your database password
export SUPABASE_DB_PASSWORD="your-database-password"

# Run migration
psql "postgresql://postgres.gcqgmcnxqhktxoaesefo:${SUPABASE_DB_PASSWORD}@db.gcqgmcnxqhktxoaesefo.supabase.co:5432/postgres" \
  -f docs/supabase/migrations/007_storage_bucket.sql
```

---

## Verification

After setup, verify the bucket exists:

1. Go to: https://app.supabase.com/project/gcqgmcnxqhktxoaesefo/storage/buckets
2. You should see `technician-requests` bucket listed
3. Try uploading a test image from the app

---

## Troubleshooting

### Bucket already exists
If you see "bucket already exists" error, the bucket is already created. Just verify the policies are set up correctly.

### Upload fails
1. Check that the bucket is marked as "Public"
2. Verify RLS policies are active
3. Check file size is under 5MB
4. Ensure file type is JPEG, PNG, or WebP

### Permission denied
Make sure you're authenticated in the app before trying to upload.

---

## File Structure

Photos will be organized as:
```
technician-requests/
  ├── {user_id}/
  │   ├── req_1234567890_1234567890.jpg
  │   ├── req_1234567890_1234567891.jpg
  │   └── ...
  └── {another_user_id}/
      └── ...
```

Each user can only upload/delete their own photos, but everyone can view all photos (needed for technicians to see request photos).
