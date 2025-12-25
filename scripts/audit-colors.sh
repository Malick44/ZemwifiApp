#!/bin/bash

# Script to find all remaining hardcoded colors in the codebase
# This helps verify that all colors have been migrated to the theme system

echo "=== Searching for hardcoded hex colors (#RRGGBB) ==="
echo ""

# Search for hex colors, excluding node_modules, .git, and the theme file itself
grep -r "#[0-9A-Fa-f]\{6\}" \
  --include="*.tsx" \
  --include="*.ts" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=.expo \
  app/ components/ src/ hooks/ constants/ 2>/dev/null | \
  grep -v "constants/theme.ts" | \
  grep -v "\.gemini" | \
  wc -l | \
  xargs echo "Found hex color instances:"

echo ""
echo "=== Searching for rgba/rgb colors ==="
echo ""

# Search for rgba/rgb colors
grep -r "rgba\?(" \
  --include="*.tsx" \
  --include="*.ts" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=.expo \
  app/ components/ src/ hooks/ constants/ 2>/dev/null | \
  grep -v "constants/theme.ts" | \
  grep -v "\.gemini" | \
  wc -l | \
  xargs echo "Found rgba/rgb instances:"

echo ""
echo "=== Detailed list of files with hardcoded colors ==="
echo ""

# List unique files with hardcoded colors
{
  grep -r "#[0-9A-Fa-f]\{6\}" \
    --include="*.tsx" \
    --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=.expo \
    -l \
    app/ components/ src/ hooks/ constants/ 2>/dev/null
  
  grep -r "rgba\?(" \
    --include="*.tsx" \
    --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=.expo \
    -l \
    app/ components/ src/ hooks/ constants/ 2>/dev/null
} | \
  grep -v "constants/theme.ts" | \
  grep -v "\.gemini" | \
  sort -u

echo ""
echo "=== To fix remaining files, use the useColors hook ==="
echo "Example:"
echo "  import { useColors } from '@/hooks/use-colors';"
echo "  const colors = useColors();"
echo "  // Then use colors.primary, colors.text, etc."
