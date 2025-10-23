// Script to create test users for development
// Run this with: node scripts/setup-test-users.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
  {
    email: 'admin@example.com',
    password: 'password123',
    full_name: 'مدير النظام',
    role: 'admin'
  },
  {
    email: 'seller@example.com', 
    password: 'password123',
    full_name: 'بائع',
    role: 'seller'
  },
  {
    email: 'accountant@example.com',
    password: 'password123', 
    full_name: 'محاسب',
    role: 'accountant'
  }
];

async function createTestUsers() {
  console.log('Creating test users...');
  
  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.full_name,
          },
        },
      });

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError.message);
        continue;
      }

      if (authData.user) {
        console.log(`✅ User ${user.email} created successfully`);
        
        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: user.role,
          });

        if (roleError) {
          console.error(`Error assigning role to ${user.email}:`, roleError.message);
        } else {
          console.log(`✅ Role ${user.role} assigned to ${user.email}`);
        }
      }
    } catch (error) {
      console.error(`Error with user ${user.email}:`, error.message);
    }
  }
  
  console.log('Test user creation completed!');
  console.log('\nYou can now login with:');
  testUsers.forEach(user => {
    console.log(`${user.email} / ${user.password} (${user.role})`);
  });
}

createTestUsers().catch(console.error);
