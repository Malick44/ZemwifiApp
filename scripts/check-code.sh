#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting code check..."
echo "-----------------------------------"

# Run Linting
echo -e "${GREEN}Running Lint Check (expo lint)...${NC}"
npm run lint
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Lint check passed!${NC}"
else
    echo -e "${RED}Lint check failed!${NC}"
fi

echo "-----------------------------------"

# Run TypeScript Check
echo -e "${GREEN}Running TypeScript Check (tsc)...${NC}"
npx tsc --noEmit
TSC_EXIT_CODE=$?

if [ $TSC_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}TypeScript check passed!${NC}"
else
    echo -e "${RED}TypeScript check failed!${NC}"
fi

echo "-----------------------------------"

# Summary
if [ $LINT_EXIT_CODE -eq 0 ] && [ $TSC_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. Please review the output above.${NC}"
    exit 1
fi
