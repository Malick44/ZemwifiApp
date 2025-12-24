// Automated Migration Runner for Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Note: We need the service_role key to run migrations, not the anon key
console.log('⚠️  WARNING: Running migrations requires service_role key');
console.log('   The anon key in .env cannot execute DDL statements\n');

const supabase = createClient(supabaseUrl, supabaseKey);

const migrations = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_functions_and_triggers.sql',
  '004_seed_data.sql',
  '005_admin_features.sql',
  '006_ratings.sql'
];

async function runMigration(filename) {
  const filepath = path.join(__dirname, 'Prompt-repo/supabase/migrations', filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ File not found: ${filename}`);
    return false;
  }

  const sql = fs.readFileSync(filepath, 'utf8');
  console.log(`\n📝 Running ${filename}...`);
  console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB`);

  try {
    // Note: This won't work with anon key - needs service_role
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
      return false;
    }
    
    console.log(`✅ ${filename} completed successfully`);
    return true;
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`);
    return false;
  }
}

async function runAllMigrations() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 ZemNet Database Migration Runner');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚠️  IMPORTANT: This script requires the service_role key');
  console.log('   Your current .env has the anon key which cannot run DDL');
  console.log('   \nPlease use the Supabase SQL Editor instead:\n');
  console.log('   1. Go to: https://supabase.com/dashboard/project/gcqgmcnxqhktxoaesefo/sql');
  console.log('   2. For each migration, run:\n');

  for (const migration of migrations) {
    console.log(`   cat Prompt-repo/supabase/migrations/${migration} | pbcopy`);
    console.log(`   Then paste in SQL Editor and click RUN\n`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Or run these commands to copy each migration:\n');
  
  migrations.forEach((migration, i) => {
    console.log(`# Migration ${i + 1}:`);
    console.log(`cat Prompt-repo/supabase/migrations/${migration} | pbcopy`);
    console.log('# Then paste into SQL Editor and click RUN\n');
  });
}

runAllMigrations();
