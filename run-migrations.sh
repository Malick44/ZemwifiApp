#!/bin/bash
# Interactive Migration Runner for ZemNet Supabase Setup

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 ZemNet Database Migration Runner"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will copy each migration to your clipboard."
echo "Paste them one-by-one into the Supabase SQL Editor."
echo ""
echo "SQL Editor: https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/sql"
echo ""

for i in {1..6}; do
  file=$(ls Prompt-repo/supabase/migrations/00${i}_*.sql 2>/dev/null)
  
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Migration $i: $filename"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cat "$file" | pbcopy
    echo "✅ Copied to clipboard!"
    echo ""
    echo "Steps:"
    echo "  1. Go to SQL Editor (link above)"
    echo "  2. Paste (Cmd+V)"
    echo "  3. Click RUN button (bottom right)"
    echo "  4. Wait for 'Success' message"
    echo ""
    
    read -p "Press Enter when done to copy next migration..." answer
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All migrations copied!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verify the setup with:"
echo "  node verify-database.js"
echo ""
