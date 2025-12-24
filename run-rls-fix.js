const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSQL(filePath) {
  console.log(`\n📄 Running SQL from: ${filePath}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Filter out comments and empty statements
        return s.length > 10 && 
               !s.startsWith('--') && 
               !s.match(/^\/\*/);
      });
    
    console.log(`   Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 80).replace(/\n/g, ' ') + '...';
      
      try {
        // Use the PostgreSQL REST API to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' });
        
        if (error) {
          // Try alternative: direct query (for simple statements)
          console.log(`   ⚠️  Statement ${i + 1}: ${preview}`);
          console.log(`      Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Statement ${i + 1}: ${preview}`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Statement ${i + 1}: ${preview}`);
        console.log(`      Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed\n`);
    
    if (errorCount > 0) {
      console.log('⚠️  Some statements failed. Manual intervention may be required.');
      console.log('   Run the SQL directly in Supabase Dashboard → SQL Editor');
    }
    
    return errorCount === 0;
    
  } catch (err) {
    console.error('❌ Error reading SQL file:', err.message);
    return false;
  }
}

async function fixRLS() {
  console.log('🔧 Fixing RLS Policies for Profile Creation\n');
  console.log('Using service role key to bypass RLS...\n');
  
  const sqlFile = path.join(__dirname, 'fix-rls-complete.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ SQL file not found: ${sqlFile}`);
    process.exit(1);
  }
  
  const success = await runSQL(sqlFile);
  
  if (!success) {
    console.log('\n📋 Manual Fix Instructions:');
    console.log('1. Go to: https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/sql/new');
    console.log('2. Copy the entire content from: fix-rls-complete.sql');
    console.log('3. Paste and run in SQL Editor');
    console.log('4. Try signing up in the app again\n');
  } else {
    console.log('✅ RLS policies fixed successfully!');
    console.log('   Try signing up in your app now.\n');
  }
}

// Alternative: Direct policy creation using Supabase client
async function fixRLSDirectly() {
  console.log('\n🔄 Attempting direct policy fix using Supabase client...\n');
  
  try {
    // Check if we can access profiles table
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.log('❌ Cannot access profiles table:', error.message);
      console.log('   Please use SQL Editor method instead.\n');
      return false;
    }
    
    console.log('✅ Service role can access profiles table');
    console.log('   Profile count:', data);
    
    // Test insert (this should work with service role)
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: testUserId,
        phone: '+22600000000',
        full_name: 'Test User',
        role: 'user'
      });
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      console.log('   RLS policies need to be updated via SQL Editor\n');
      return false;
    }
    
    console.log('✅ Service role can insert profiles');
    
    // Clean up test
    await supabase.from('profiles').delete().eq('id', testUserId);
    
    console.log('✅ RLS working correctly with service role\n');
    return true;
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       ZemNet - Fix Profile RLS Policies               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  // First check if service role works
  const serviceRoleWorks = await fixRLSDirectly();
  
  if (serviceRoleWorks) {
    console.log('🎉 Service role is working! But policies still need updating...');
  }
  
  // Then try to run the SQL
  await fixRLS();
}

main().then(() => process.exit(0));
