#!/bin/bash
# Migration Runner Script for ZemNet Supabase Database
# Run this to see each migration file contents

MIGRATION_DIR="Prompt-repo/supabase/migrations"

echo "=========================================="
echo "ZemNet Database Migration Files"
echo "=========================================="
echo ""
echo "📋 Copy each migration to Supabase SQL Editor and run them in order:"
echo ""

for i in {1..6}; do
  file=$(printf "%03d" $i)
  migration_file=$(ls ${MIGRATION_DIR}/${file}_*.sql 2>/dev/null)
  
  if [ -f "$migration_file" ]; then
    filename=$(basename "$migration_file")
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Migration $i: $filename"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "File location: $migration_file"
    echo "Lines: $(wc -l < "$migration_file")"
    echo ""
    echo "To view: cat $migration_file"
    echo ""
  fi
done

echo "=========================================="
echo "📝 Instructions:"
echo "=========================================="
echo "1. Open Supabase SQL Editor (already opened in browser)"
echo "2. For each migration (001-006), run:"
echo "   cat Prompt-repo/supabase/migrations/00X_filename.sql"
echo "3. Copy the output"
echo "4. Paste into SQL Editor"
echo "5. Click RUN (or Cmd+Enter)"
echo "6. Verify 'Success' message"
echo "7. Move to next migration"
echo ""
echo "Or use the quick commands below:"
echo "=========================================="

for i in {1..6}; do
  file=$(printf "%03d" $i)
  migration_file=$(ls ${MIGRATION_DIR}/${file}_*.sql 2>/dev/null)
  
  if [ -f "$migration_file" ]; then
    filename=$(basename "$migration_file")
    echo ""
    echo "# Migration $i:"
    echo "cat $migration_file"
  fi
done

echo ""
echo "=========================================="
