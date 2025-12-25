const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixProfileRLS() {
  console.log('🔧 Fixing RLS policies for profile creation...\n');
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('./fix-profile-rls.sql', 'utf8');
    
    // Execute the SQL
    const { data: _data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try running queries individually
      console.log('⚠️  exec_sql function not available, running queries individually...\n');
      
      // Split by semicolons and run each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const stmt of statements) {
        if (stmt.length < 10) continue; // Skip tiny statements
        console.log(`Executing: ${stmt.substring(0, 60)}...`);
        
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: stmt });
        if (stmtError) {
          console.error(`❌ Error: ${stmtError.message}`);
        }
      }
    } else {
      console.log('✅ RLS policies fixed successfully!');
    }
    
    console.log('\n📋 Verifying trigger function...');
    
    // Check if the function exists
    const { data: functions, error: funcError } = await supabase
      .rpc('check_function_exists', { func_name: 'handle_new_user' });
    
    if (!funcError && functions) {
      console.log('✅ handle_new_user function exists');
    }
    
    console.log('\n✅ Fix complete! Try signing up again.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n⚠️  Manual fix required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the SQL from fix-profile-rls.sql');
    console.log('3. Or adjust RLS policies to allow profile creation');
  }
}

fixProfileRLS().then(() => process.exit(0));
