require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HOST_CREDS = { email: 'fatima@test.zemnet.com', password: 'test123456' };
const USER_PHONE = '+22670123456';
const USER_CREDS = { email: 'amadou@test.zemnet.com', password: 'test123456' };
const AMOUNT = 1000;

async function runTest() {
    console.log('🚀 Starting 3-Step Cash-In Flow Test');
    console.log('-----------------------------------');

    // 1. LOGIN HOST
    console.log(`\n🔑 1. Logging in as Host (${HOST_CREDS.email})...`);
    const { data: hostAuth, error: hostLoginErr } = await supabase.auth.signInWithPassword(HOST_CREDS);
    if (hostLoginErr) throw hostLoginErr;
    console.log(`   ✅ Host Logged In (ID: ${hostAuth.user.id})`);

    // 2. CREATE REQUEST
    console.log(`\n📤 2. Host creating request for ${USER_PHONE} (${AMOUNT} XOF)...`);
    const { data: reqData, error: reqErr } = await supabase.rpc('host_create_cashin', {
        p_user_phone: USER_PHONE,
        p_amount_xof: AMOUNT
    });

    if (reqErr) throw reqErr;
    const requestId = reqData.id;
    console.log(`   ✅ Request Created! ID: ${requestId}`);
    console.log(`   Status should be 'pending'`);

    // Sign out Host
    await supabase.auth.signOut();

    // 3. LOGIN USER
    console.log(`\n🔑 3. Logging in as User (${USER_CREDS.email})...`);
    const { data: userAuth, error: userLoginErr } = await supabase.auth.signInWithPassword(USER_CREDS);
    if (userLoginErr) throw userLoginErr;
    console.log(`   ✅ User Logged In (ID: ${userAuth.user.id})`);

    // 4. CONFIRM REQUEST (Step 2)
    console.log(`\n👍 4. User confirming request...`);
    const { data: confirmData, error: confirmErr } = await supabase.rpc('user_confirm_cashin', {
        p_request_id: requestId,
        p_decision: 'confirm'
    });

    if (confirmErr) throw confirmErr;
    console.log(`   ✅ User Confirmed. Result:`, confirmData);
    
    if (confirmData.status !== 'accepted_by_user') {
        console.error(`   ❌ FAIL: Expected status 'accepted_by_user', got '${confirmData.status}'`);
        process.exit(1);
    } else {
        console.log(`   ✅ PASS: Status is 'accepted_by_user'`);
    }

    // Sign out User
    await supabase.auth.signOut();

    // 5. LOGIN HOST AGAIN
    console.log(`\n🔑 5. Logging in as Host again...`);
    const { error: hostLoginErr2 } = await supabase.auth.signInWithPassword(HOST_CREDS);
    if (hostLoginErr2) throw hostLoginErr2;

    // 6. COMPLETE REQUEST (Step 3)
    console.log(`\n🏁 6. Host completing/finalizing request...`);
    const { data: completeData, error: completeErr } = await supabase.rpc('host_complete_cashin', {
        p_request_id: requestId
    });

    if (completeErr) throw completeErr;
    console.log(`   ✅ Host Completed. Result:`, completeData);

    if (completeData.status !== 'confirmed') {
        console.error(`   ❌ FAIL: Expected status 'confirmed', got '${completeData.status}'`);
    } else {
        console.log(`   ✅ PASS: Status is 'confirmed' - Transaction Complete!`);
    }

    // 7. VERIFY WALLET (Optional but good)
    console.log(`\n💰 7. Verifying Host Wallet Balance...`);
    const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', hostAuth.user.id).single();
    console.log(`   Current Host Balance: ${profile.wallet_balance}`);

}

runTest().catch(err => {
    console.error('\n❌ TEST FAILED:', err.message);
    if (err.details) console.error('Details:', err.details);
    process.exit(1);
});
