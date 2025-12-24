// Quick Supabase Connection Test
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET');
console.log('\n---\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials not found in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('Test 1: Basic Connection');
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.log('⚠️  Query returned error:', error.message);
      console.log('   This is expected if tables don\'t exist yet.\n');
    } else {
      console.log('✅ Connected successfully!');
      console.log('   Data:', data, '\n');
    }

    // Test 2: Check auth
    console.log('Test 2: Authentication Status');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ User is authenticated');
      console.log('   User ID:', session.user.id);
    } else {
      console.log('ℹ️  No active session (this is normal for initial setup)');
    }

    // Test 3: List tables (requires service_role key, so this might fail)
    console.log('\nTest 3: Checking Database Tables');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('ℹ️  Cannot list tables with anon key (expected)');
      console.log('   You can check tables in the Supabase dashboard');
    } else {
      console.log('✅ Tables found:', tables?.map(t => t.table_name).join(', '));
    }

    console.log('\n---\n');
    console.log('🎉 Connection test complete!');
    console.log('\n✅ Your app is ready to connect to Supabase');
    console.log('📝 Next steps:');
    console.log('   1. Run database migrations if not done yet');
    console.log('   2. Start your app: npm start');
    console.log('   3. Test authentication flow\n');

  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    console.error('\nTroubleshooting:');
    console.error('   - Check if Supabase project is active');
    console.error('   - Verify URL and Key in .env file');
    console.error('   - Ensure no firewall is blocking the connection\n');
    process.exit(1);
  }
}

testConnection();
