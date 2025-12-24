#!/usr/bin/env node

/**
 * Seed Database Script
 * Creates mock data for development and testing
 * Excludes users (already created via create-dev-users.js)
 */

require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get existing test user IDs (created by create-dev-users.js)
const TEST_USER_EMAILS = {
  user1: 'amadou@test.zemnet.com',
  host: 'fatima@test.zemnet.com',
  technician: 'ibrahim@test.zemnet.com',
  user2: 'aicha@test.zemnet.com',
  host2: 'boukary@test.zemnet.com',
};

async function getUserIds() {
  console.log('📋 Fetching existing test user IDs...\n');
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }

  const userMap = {};
  for (const [key, email] of Object.entries(TEST_USER_EMAILS)) {
    const user = users.find(u => u.email === email);
    if (user) {
      userMap[key] = user.id;
      console.log(`  ✓ ${email}: ${user.id}`);
    } else {
      console.error(`  ✗ User not found: ${email}`);
    }
  }
  
  console.log('');
  return userMap;
}

async function seedHotspots(userIds) {
  console.log('🌐 Seeding hotspots...\n');
  
  const hotspots = [
    {
      id: '10000000-0000-0000-0002-000000000001',
      host_id: userIds.host,
      name: 'Café du Centre',
      landmark: 'Près du marché central, Avenue Kwame Nkrumah',
      address: 'Avenue Kwame Nkrumah, Ouagadougou',
      lat: 12.3714277,
      lng: -1.5196603,
      ssid: 'ZemNet-CafeduCentre',
      is_online: true,
      sales_paused: false,
      hours: '08:00 - 22:00',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '10000000-0000-0000-0002-000000000002',
      host_id: userIds.host,
      name: 'Restaurant Chez Maman',
      landmark: 'Zone 1, à côté de la grande mosquée',
      address: 'Zone 1, Ouagadougou',
      lat: 12.3678,
      lng: -1.5272,
      ssid: 'ZemNet-ChezMaman',
      is_online: true,
      sales_paused: false,
      hours: '10:00 - 23:00',
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '10000000-0000-0000-0002-000000000003',
      host_id: userIds.host,
      name: 'Bibliothèque Municipale',
      landmark: 'Avenue de la Nation, près du rond-point des Nations Unies',
      address: 'Avenue de la Nation, Ouagadougou',
      lat: 12.3665,
      lng: -1.5304,
      ssid: 'ZemNet-BiblioMunicipale',
      is_online: true,
      sales_paused: false,
      hours: '08:00 - 20:00',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '10000000-0000-0000-0002-000000000004',
      host_id: userIds.host2,
      name: 'Hôtel La Paix',
      landmark: 'Quartier Gounghin, Route de Kaya',
      address: 'Route de Kaya, Ouagadougou',
      lat: 12.3891,
      lng: -1.5089,
      ssid: 'ZemNet-HotelLaPaix',
      is_online: true,
      sales_paused: false,
      hours: '24/7',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { data, error } = await supabase.from('hotspots').upsert(hotspots, { onConflict: 'id' });
  
  if (error) {
    console.error('  ❌ Error seeding hotspots:', error.message);
    return [];
  }
  
  console.log(`  ✅ Created ${hotspots.length} hotspots\n`);
  return hotspots;
}

async function seedPlans(hotspots) {
  console.log('💳 Seeding plans...\n');
  
  const plans = [
    // Café du Centre plans
    {
      id: '10000000-0000-0000-0003-000000000001',
      hotspot_id: hotspots[0].id,
      name: '30 minutes',
      duration_seconds: 1800,
      data_bytes: 52428800, // 50 MB
      price_xof: 100,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000002',
      hotspot_id: hotspots[0].id,
      name: '1 heure',
      duration_seconds: 3600,
      data_bytes: 104857600, // 100 MB
      price_xof: 150,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000003',
      hotspot_id: hotspots[0].id,
      name: '2 heures',
      duration_seconds: 7200,
      data_bytes: 209715200, // 200 MB
      price_xof: 250,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000004',
      hotspot_id: hotspots[0].id,
      name: 'Journée',
      duration_seconds: 28800,
      data_bytes: 1073741824, // 1 GB
      price_xof: 800,
      is_active: true,
    },
    
    // Restaurant Chez Maman plans
    {
      id: '10000000-0000-0000-0003-000000000005',
      hotspot_id: hotspots[1].id,
      name: '1 heure',
      duration_seconds: 3600,
      data_bytes: 104857600, // 100 MB
      price_xof: 200,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000006',
      hotspot_id: hotspots[1].id,
      name: '3 heures',
      duration_seconds: 10800,
      data_bytes: 314572800, // 300 MB
      price_xof: 400,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000007',
      hotspot_id: hotspots[1].id,
      name: 'Soirée (5h)',
      duration_seconds: 18000,
      data_bytes: 524288000, // 500 MB
      price_xof: 600,
      is_active: true,
    },
    
    // Bibliothèque plans
    {
      id: '10000000-0000-0000-0003-000000000008',
      hotspot_id: hotspots[2].id,
      name: '2 heures',
      duration_seconds: 7200,
      data_bytes: 209715200, // 200 MB
      price_xof: 150,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000009',
      hotspot_id: hotspots[2].id,
      name: 'Demi-journée',
      duration_seconds: 14400,
      data_bytes: 524288000, // 500 MB
      price_xof: 300,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000010',
      hotspot_id: hotspots[2].id,
      name: 'Journée complète',
      duration_seconds: 28800,
      data_bytes: 1073741824, // 1 GB
      price_xof: 500,
      is_active: true,
    },
    
    // Hôtel La Paix plans
    {
      id: '10000000-0000-0000-0003-000000000011',
      hotspot_id: hotspots[3].id,
      name: '1 heure',
      duration_seconds: 3600,
      data_bytes: 209715200, // 200 MB
      price_xof: 250,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000012',
      hotspot_id: hotspots[3].id,
      name: '24 heures',
      duration_seconds: 86400,
      data_bytes: 2147483648, // 2 GB
      price_xof: 1000,
      is_active: true,
    },
    {
      id: '10000000-0000-0000-0003-000000000013',
      hotspot_id: hotspots[3].id,
      name: 'Week Pass',
      duration_seconds: 604800,
      data_bytes: 10737418240, // 10 GB
      price_xof: 5000,
      is_active: true,
    },
  ];

  const { error } = await supabase.from('plans').upsert(plans, { onConflict: 'id' });
  
  if (error) {
    console.error('  ❌ Error seeding plans:', error.message);
    return [];
  }
  
  console.log(`  ✅ Created ${plans.length} plans\n`);
  return plans;
}

function generateVoucherCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];
  
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

async function seedPurchasesAndVouchers(userIds, hotspots, plans) {
  console.log('🎫 Seeding purchases and vouchers...\n');
  
  // Purchase 1: Active voucher (1 hour at Café du Centre)
  const purchase1 = {
    id: '10000000-0000-0000-0004-000000000001',
    user_id: userIds.user1,
    hotspot_id: hotspots[0].id,
    plan_id: plans[1].id, // 1 heure - 150 XOF
    amount: 150,
    payment_provider: 'wallet',
    payment_status: 'success',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const voucher1 = {
    id: '10000000-0000-0000-0005-000000000001',
    code: generateVoucherCode(),
    user_id: userIds.user1,
    hotspot_id: hotspots[0].id,
    plan_id: plans[1].id,
    purchase_id: purchase1.id,
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: purchase1.created_at,
  };

  // Purchase 2: Used voucher
  const purchase2 = {
    id: '10000000-0000-0000-0004-000000000002',
    user_id: userIds.user1,
    hotspot_id: hotspots[0].id,
    plan_id: plans[0].id, // 30 minutes - 100 XOF
    amount: 100,
    payment_provider: 'orange',
    payment_status: 'success',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const voucher2 = {
    id: '10000000-0000-0000-0005-000000000002',
    code: generateVoucherCode(),
    user_id: userIds.user1,
    hotspot_id: hotspots[0].id,
    plan_id: plans[0].id,
    purchase_id: purchase2.id,
    expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: purchase2.created_at,
    used_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    device_mac: 'AA:BB:CC:DD:EE:FF',
  };

  // Purchase 3: Expired voucher
  const purchase3 = {
    id: '10000000-0000-0000-0004-000000000003',
    user_id: userIds.user2,
    hotspot_id: hotspots[1].id,
    plan_id: plans[4].id, // 1 heure - 200 XOF
    amount: 200,
    payment_provider: 'wave',
    payment_status: 'success',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const voucher3 = {
    id: '10000000-0000-0000-0005-000000000003',
    code: generateVoucherCode(),
    user_id: userIds.user2,
    hotspot_id: hotspots[1].id,
    plan_id: plans[4].id,
    purchase_id: purchase3.id,
    expires_at: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: purchase3.created_at,
  };

  const purchases = [purchase1, purchase2, purchase3];
  const vouchers = [voucher1, voucher2, voucher3];

  const { error: purchaseError } = await supabase.from('purchases').upsert(purchases, { onConflict: 'id' });
  if (purchaseError) {
    console.error('  ❌ Error seeding purchases:', purchaseError.message);
    return;
  }

  const { error: voucherError } = await supabase.from('vouchers').upsert(vouchers, { onConflict: 'id' });
  if (voucherError) {
    console.error('  ❌ Error seeding vouchers:', voucherError.message);
    return;
  }

  console.log(`  ✅ Created ${purchases.length} purchases`);
  console.log(`  ✅ Created ${vouchers.length} vouchers\n`);
  
  return { purchases, vouchers };
}

async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.log('=' .repeat(60));
  console.log('\n');

  try {
    // Get user IDs
    const userIds = await getUserIds();
    
    if (Object.keys(userIds).length === 0) {
      console.error('❌ No test users found. Run create-dev-users.js first.\n');
      process.exit(1);
    }

    // Seed data
    const hotspots = await seedHotspots(userIds);
    const plans = await seedPlans(hotspots);
    await seedPurchasesAndVouchers(userIds, hotspots, plans);

    console.log('=' .repeat(60));
    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  📍 Hotspots: ${hotspots.length}`);
    console.log(`  💳 Plans: ${plans.length}`);
    console.log(`  🎫 Purchases: 3`);
    console.log(`  🎟️  Vouchers: 3 (1 active, 1 used, 1 expired)`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
