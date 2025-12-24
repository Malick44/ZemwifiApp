#!/usr/bin/env node

/**
 * Create Dev Panel Test Users
 * 
 * This script creates the 5 test users for the Dev Panel quick login feature.
 * Run this once to set up your development environment.
 * 
 * Usage: node scripts/create-dev-users.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_USERS = [
  {
    email: 'amadou@test.zemnet.com',
    password: 'test123456',
    phone: '+22670123456',
    full_name: 'Amadou Traoré',
    role: 'user',
    wallet_balance_xof: 5000,
  },
  {
    email: 'fatima@test.zemnet.com',
    password: 'test123456',
    phone: '+22670123457',
    full_name: 'Fatima Ouédraogo',
    role: 'host',
    wallet_balance_xof: 125000,
  },
  {
    email: 'ibrahim@test.zemnet.com',
    password: 'test123456',
    phone: '+22670123458',
    full_name: 'Ibrahim Kaboré',
    role: 'technician',
    wallet_balance_xof: 0,
  },
  {
    email: 'aicha@test.zemnet.com',
    password: 'test123456',
    phone: '+22670123459',
    full_name: 'Aicha Sawadogo',
    role: 'user',
    wallet_balance_xof: 15000,
  },
  {
    email: 'boukary@test.zemnet.com',
    password: 'test123456',
    phone: '+22670123460',
    full_name: 'Boukary Compaoré',
    role: 'host',
    wallet_balance_xof: 85000,
  },
];

async function createDevUsers() {
  console.log('🔧 Creating Dev Panel test users...\n');

  for (const user of TEST_USERS) {
    try {
      console.log(`Creating ${user.full_name} (${user.role})...`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          phone: user.phone,
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⚠️  User already exists, updating profile...`);
          
          // Get existing user
          const { data: existingUser } = await supabase.auth.admin.listUsers();
          const found = existingUser?.users.find(u => u.email === user.email);
          
          if (found) {
            // Update profile
            await supabase.from('profiles').upsert({
              id: found.id,
              phone: user.phone,
              full_name: user.full_name,
              role: user.role,
              language: 'fr',
            });
            console.log(`  ✅ Profile updated`);
          }
        } else {
          throw authError;
        }
      } else if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          phone: user.phone,
          full_name: user.full_name,
          role: user.role,
          language: 'fr',
        });

        if (profileError) {
          console.error(`  ❌ Profile creation failed:`, profileError.message);
        } else {
          console.log(`  ✅ Created successfully`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error creating ${user.full_name}:`, error.message);
    }
  }

  console.log('\n✨ Dev Panel setup complete!');
  console.log('\nYou can now use the Dev Panel to quickly login as:');
  console.log('  👤 Amadou Traoré (User - 5,000 XOF)');
  console.log('  🏠 Fatima Ouédraogo (Host - 125,000 XOF)');
  console.log('  🔧 Ibrahim Kaboré (Technician)');
  console.log('  👥 Aicha Sawadogo (User - 15,000 XOF)');
  console.log('  🏪 Boukary Compaoré (Host - 85,000 XOF)');
  console.log('\nPassword for all test users: test123456');
}

createDevUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
