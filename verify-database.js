// Verify Database Tables After Migration
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY
);

async function verifyTables() {
  console.log('🔍 Verifying Database Setup...\n');

  const expectedTables = [
    'users',
    'hotspots',
    'plans',
    'vouchers',
    'sessions',
    'purchases',
    'transactions',
    'cashin_requests',
    'kyc_submissions',
    'payouts',
    'service_requests',
    'host_earnings'
  ];

  console.log('Expected tables:', expectedTables.length);
  console.log('Checking each table...\n');

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n✅ Verification complete!');
  console.log('📝 Next: Run migrations 002-006 for policies, functions, and seed data');
}

verifyTables();
