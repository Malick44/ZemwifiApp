/**
 * Create Test Users in Supabase Auth
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const testUsers = [
  { id: '00000000-0000-0000-0001-000000000001', email: 'fatou.traore@test.zemnet.app', phone: '+22670123456', full_name: 'Fatou Traoré', role: 'user', wallet_balance: 2500, kyc_status: null, password: 'Test123456!' },
  { id: '00000000-0000-0000-0001-000000000002', email: 'amadou.ouedraogo@test.zemnet.app', phone: '+22670234567', full_name: 'Amadou Ouédraogo', role: 'host', wallet_balance: 15000, kyc_status: 'approved', password: 'Test123456!' },
  { id: '00000000-0000-0000-0001-000000000003', email: 'ibrahim.sawadogo@test.zemnet.app', phone: '+22670345678', full_name: 'Ibrahim Sawadogo', role: 'technician', wallet_balance: 8000, kyc_status: 'approved', password: 'Test123456!' },
  { id: '00000000-0000-0000-0001-000000000004', email: 'mariam.kabore@test.zemnet.app', phone: '+22670456789', full_name: 'Mariam Kaboré', role: 'user', wallet_balance: 0, kyc_status: null, password: 'Test123456!' },
  { id: '00000000-0000-0000-0001-000000000005', email: 'admin@test.zemnet.app', phone: '+22670999999', full_name: 'Admin User', role: 'admin', wallet_balance: 0, kyc_status: 'approved', password: 'Admin123456!' }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');
  let successCount = 0;
  
  for (const user of testUsers) {
    try {
      console.log(`Creating: ${user.full_name}...`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true,
        phone: user.phone,
        user_metadata: { full_name: user.full_name, role: user.role }
      });
      
      if (error) {
        console.error(`  ❌ ${error.message}`);
        continue;
      }
      
      console.log(`  ✅ Auth user created`);
      
      await supabase.from('profiles').update({
        wallet_balance: user.wallet_balance,
        kyc_status: user.kyc_status,
        role: user.role,
        phone: user.phone
      }).eq('id', user.id);
      
      console.log(`  ✅ Profile updated\n`);
      successCount++;
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  console.log(`✅ Created ${successCount}/5 users`);
  console.log('\n📝 Test Login: fatou.traore@test.zemnet.app / Test123456!');
}

createTestUsers().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
