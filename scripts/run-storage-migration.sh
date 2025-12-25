#!/bin/bash

# Script to run storage bucket migration via Supabase Management API
# This creates the storage bucket and RLS policies

SUPABASE_URL="https://gcqgmcnxqhktxoaesefo.supabase.co"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

echo "🚀 Running storage bucket migration..."
echo ""

# Read the SQL file
SQL_CONTENT=$(cat docs/supabase/migrations/007_storage_bucket.sql)

# Execute via Supabase REST API
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}"

echo ""
echo "✅ Migration complete!"
echo ""
echo "You can verify the bucket was created at:"
echo "${SUPABASE_URL}/project/default/storage/buckets"
