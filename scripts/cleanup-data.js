// Data cleanup script - removes all business data but keeps user accounts
// Run with: node scripts/cleanup-data.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupData() {
  console.log('🧹 Starting data cleanup...');
  
  try {
    // Tables to clean (in dependency order)
    const tablesToClean = [
      'sales_items',
      'purchase_items', 
      'sales',
      'purchases',
      'expenses',
      'inventory',
      'customers',
      'suppliers',
      'app_settings'
    ];

    for (const table of tablesToClean) {
      console.log(`🗑️  Cleaning ${table}...`);
      const { error } = await supabase.from(table).delete().neq('id', 'impossible-id');
      if (error) {
        console.error(`❌ Error cleaning ${table}:`, error.message);
      } else {
        console.log(`✅ Cleaned ${table}`);
      }
    }

    // Reset app_settings to default
    console.log('🔧 Resetting app settings...');
    const { error: settingsError } = await supabase
      .from('app_settings')
      .upsert({
        id: 1,
        app_name: 'نظام المجوهرات',
        phone: null,
        email: null,
        updated_at: new Date().toISOString()
      });
    
    if (settingsError) {
      console.error('❌ Error resetting app settings:', settingsError.message);
    } else {
      console.log('✅ App settings reset');
    }

    console.log('🎉 Data cleanup completed!');
    console.log('\n📋 What was cleaned:');
    console.log('- All sales and purchase records');
    console.log('- All inventory items');
    console.log('- All customers and suppliers');
    console.log('- All expenses');
    console.log('- App settings reset to defaults');
    console.log('\n✅ What was preserved:');
    console.log('- User accounts and authentication');
    console.log('- User roles and permissions');
    console.log('- Database schema and structure');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Demo mode cleanup (localStorage)
function cleanupDemoData() {
  console.log('🧹 Cleaning demo data from localStorage...');
  
  const keysToRemove = [
    'suppliers',
    'app_settings',
    'inventory',
    'sales',
    'purchases',
    'expenses',
    'customers'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed ${key} from localStorage`);
  });

  console.log('🎉 Demo data cleanup completed!');
}

// Check if we're in demo mode
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  cleanupDemoData();
} else {
  cleanupData();
}
