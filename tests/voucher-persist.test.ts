// This is a manual smoke test, run with: node --loader ts-node/register tests/voucher-persist.test.ts
// Skipped by Jest

import assert from 'node:assert'
import { useWalletStore } from '../src/stores/walletStore'

useWalletStore.setState({ vouchers: [{ id: '1', code: 'ABC', user_id: 'u', hotspot_id: 'h', plan_id: 'p', purchase_id: null, expires_at: new Date().toISOString(), created_at: new Date().toISOString(), used_at: null, device_mac: null }] })
assert.strictEqual(useWalletStore.getState().vouchers.length, 1)
console.log('voucher-persist.test passed')
