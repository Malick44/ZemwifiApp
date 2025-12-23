// This is a manual smoke test, run with: node --loader ts-node/register tests/cashin-expiry.test.ts
// Skipped by Jest

import assert from 'node:assert'
import { isoNow } from '../src/lib/time'

const now = new Date(isoNow()).getTime()
assert.ok(!Number.isNaN(now), 'isoNow should return valid date')

console.log('cashin-expiry.test passed')
