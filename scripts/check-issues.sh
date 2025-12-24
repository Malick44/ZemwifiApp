#!/bin/bash

echo "🔍 Checking for TypeScript and Lint Issues..."
echo "=============================================="
echo ""

# Create output directory
mkdir -p .check-results

# Check TypeScript errors
echo "📝 Running TypeScript check..."
npx tsc --noEmit --pretty > .check-results/typescript-errors.txt 2>&1
TS_EXIT_CODE=$?

if [ $TS_EXIT_CODE -eq 0 ]; then
    echo "✅ No TypeScript errors found"
else
    echo "❌ TypeScript errors found - see .check-results/typescript-errors.txt"
fi

echo ""

# Check ESLint errors
echo "🔧 Running ESLint check..."
npx eslint . --ext .ts,.tsx --format stylish > .check-results/eslint-errors.txt 2>&1
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ No ESLint errors found"
else
    echo "❌ ESLint errors found - see .check-results/eslint-errors.txt"
fi

echo ""
echo "=============================================="
echo "📊 Summary:"
echo "TypeScript: $([ $TS_EXIT_CODE -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "ESLint:     $([ $LINT_EXIT_CODE -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo ""
echo "Results saved in .check-results/"
echo ""

# Show quick summary
if [ $TS_EXIT_CODE -ne 0 ]; then
    echo "TypeScript Error Count:"
    grep -c "error TS" .check-results/typescript-errors.txt || echo "0"
fi

if [ $LINT_EXIT_CODE -ne 0 ]; then
    echo "ESLint Error Count:"
    grep -c "error" .check-results/eslint-errors.txt || echo "0"
fi
