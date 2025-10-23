// Simple script to help with database setup
// This is a helper script - you'll need to run Supabase migrations separately

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSetup() {
  console.log('Checking database setup...');
  
  try {
    // Check if profiles table exists and has data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Database not set up properly:', profilesError.message);
      console.log('\n📋 To set up the database:');
      console.log('1. Run: npx supabase db reset');
      console.log('2. Or run: npx supabase migration up');
      console.log('3. Then run this script again');
      return;
    }
    
    // Check if user_roles table exists
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);
    
    if (rolesError) {
      console.error('❌ Roles table not set up:', rolesError.message);
      return;
    }
    
    console.log('✅ Database is set up correctly!');
    console.log('\n🚀 You can now:');
    console.log('1. Go to /admin-setup to create the first admin user');
    console.log('2. Or go to /signup to create a regular user');
    console.log('3. Or use the test accounts shown on the login page');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkDatabaseSetup().catch(console.error);
