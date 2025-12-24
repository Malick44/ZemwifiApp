#!/usr/bin/env node

require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_USERS = [
  { email: 'amadou@test.zemnet.com', phone: '+221771234501', full_name: 'Amadou Traoré', role: 'user' },
  { email: 'fatima@test.zemnet.com', phone: '+221771234502', full_name: 'Fatima Ouédraogo', role: 'host' },
  { email: 'ibrahim@test.zemnet.com', phone: '+221771234503', full_name: 'Ibrahim Kaboré', role: 'technician' },
  { email: 'aicha@test.zemnet.com', phone: '+221771234504', full_name: 'Aicha Sawadogo', role: 'user' },
  { email: 'boukary@test.zemnet.com', phone: '+221771234505', full_name: 'Boukary Compaoré', role: 'host' },
];

async function updateProfiles() {
  console.log('🔧 Updating Dev Panel test user profiles...\n');

  for (const user of TEST_USERS) {
    try {
      console.log(`Updating ${user.full_name} (${user.role})...`);
      
      // Find user by email
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`  ❌ Error listing users:`, listError.message);
        continue;
      }

      const found = users.find(u => u.email === user.email);
      
      if (!found) {
        console.log(`  ⚠️  User not found with email ${user.email}`);
        continue;
      }

      // Update profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: found.id,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
        language: 'fr',
      });

      if (profileError) {
        console.error(`  ❌ Profile update failed:`, profileError.message);
      } else {
        console.log(`  ✅ Profile updated successfully`);
      }
    } catch (error) {
      console.error(`  ❌ Error updating ${user.full_name}:`, error.message);
    }
  }

  console.log('\n✨ Profile updates complete!\n');
}

updateProfiles();
