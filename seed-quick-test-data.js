const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedQuickTestData() {
  console.log('🌱 Seeding quick test data...\n');

  try {
    // 1. Get or create a default host profile
    console.log('👤 Setting up default host...');
    const defaultHostId = '99999999-9999-9999-9999-999999999999';
    
    // Check if default host profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', defaultHostId)
      .single();
    
    if (!existingProfile) {
      // Create default host profile (for demo purposes)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: defaultHostId,
          phone: '+226 70 00 00 00',
          full_name: 'Demo Host',
          role: 'host',
        });
      
      if (profileError) {
        console.log('   ⚠️  Could not create default host, using current user or anonymous');
      } else {
        console.log('   ✅ Default host created');
      }
    } else {
      console.log('   ✅ Default host exists');
    }

    // 2. Create test hotspots
    console.log('\n📍 Creating test hotspots...');
    const hotspots = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        host_id: defaultHostId,
        name: 'Café du Centre',
        landmark: 'Près du marché central, Avenue Kwame Nkrumah',
        lat: 12.3714277,
        lng: -1.5196603,
        ssid: 'ZemNet-CafeduCentre',
        is_online: true,
        sales_paused: false,
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        host_id: defaultHostId,
        name: 'Restaurant Chez Maman',
        landmark: 'Zone 1, à côté de la grande mosquée',
        lat: 12.3678,
        lng: -1.5272,
        ssid: 'ZemNet-ChezMaman',
        is_online: true,
        sales_paused: false,
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        host_id: defaultHostId,
        name: 'Bibliothèque Municipale',
        landmark: 'Avenue de la Nation',
        lat: 12.3665,
        lng: -1.5304,
        ssid: 'ZemNet-BiblioMunicipale',
        is_online: true,
        sales_paused: false,
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        host_id: defaultHostId,
        name: 'Hôtel La Paix',
        landmark: 'Quartier Gounghin',
        lat: 12.3891,
        lng: -1.5089,
        ssid: 'ZemNet-HotelLaPaix',
        is_online: false,
        sales_paused: false,
      },
    ];

    for (const hotspot of hotspots) {
      const { error } = await supabase.from('hotspots').upsert(hotspot);
      if (error) {
        console.log(`   ⚠️  ${hotspot.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${hotspot.name}`);
      }
    }

    // 2. Create test plans
    console.log('\n📋 Creating test plans...');
    const plans = [
      // Café du Centre
      { hotspot_id: hotspots[0].id, name: '30 minutes', duration_seconds: 1800, data_bytes: 52428800, price_xof: 100, is_active: true },
      { hotspot_id: hotspots[0].id, name: '1 heure', duration_seconds: 3600, data_bytes: 104857600, price_xof: 150, is_active: true },
      { hotspot_id: hotspots[0].id, name: '2 heures', duration_seconds: 7200, data_bytes: 209715200, price_xof: 250, is_active: true },
      
      // Restaurant Chez Maman
      { hotspot_id: hotspots[1].id, name: '1 heure', duration_seconds: 3600, data_bytes: 104857600, price_xof: 200, is_active: true },
      { hotspot_id: hotspots[1].id, name: '3 heures', duration_seconds: 10800, data_bytes: 314572800, price_xof: 400, is_active: true },
      
      // Bibliothèque Municipale
      { hotspot_id: hotspots[2].id, name: '2 heures', duration_seconds: 7200, data_bytes: 209715200, price_xof: 150, is_active: true },
      { hotspot_id: hotspots[2].id, name: 'Demi-journée', duration_seconds: 14400, data_bytes: 524288000, price_xof: 300, is_active: true },
      { hotspot_id: hotspots[2].id, name: 'Journée complète', duration_seconds: 28800, data_bytes: 1073741824, price_xof: 500, is_active: true },
      
      // Hôtel La Paix
      { hotspot_id: hotspots[3].id, name: '1 heure', duration_seconds: 3600, data_bytes: 209715200, price_xof: 250, is_active: true },
      { hotspot_id: hotspots[3].id, name: '24 heures', duration_seconds: 86400, data_bytes: 2147483648, price_xof: 1000, is_active: true },
    ];

    let planCount = 0;
    for (const plan of plans) {
      const { error } = await supabase.from('plans').insert(plan);
      if (!error) planCount++;
    }
    console.log(`   ✅ Created ${planCount} plans`);

    // 3. Show summary
    console.log('\n📊 Summary:');
    const { count: hotspotCount } = await supabase
      .from('hotspots')
      .select('*', { count: 'exact', head: true });
    const { count: planCount2 } = await supabase
      .from('plans')
      .select('*', { count: 'exact', head: true });

    console.log(`   Hotspots: ${hotspotCount}`);
    console.log(`   Plans: ${planCount2}`);

    console.log('\n✅ Quick test data seeded successfully!');
    console.log('\n🎯 Next steps:');
    console.log('   1. Open the app');
    console.log('   2. Go to Dev Panel (Settings → Dev Panel)');
    console.log('   3. Or browse hotspots directly on the map');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

seedQuickTestData().then(() => process.exit(0));
