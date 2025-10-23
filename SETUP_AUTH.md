# Authentication Setup Guide

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Set up the database:**
   ```bash
   # If using Supabase CLI
   npx supabase db reset
   # OR
   npx supabase migration up
   ```

3. **Create your first admin user:**
   - Go to `http://localhost:5173/admin-setup`
   - Fill in the admin details (default: admin@example.com / password123)
   - Click "إنشاء حساب المدير"

4. **Login and start using the system:**
   - Go to `http://localhost:5173/login`
   - Use the admin credentials you just created
   - Or create new users through Settings → User Management

## Test Accounts

The login page shows these test accounts (you need to create them first):
- **Admin:** admin@example.com / password123
- **Seller:** seller@example.com / password123  
- **Accountant:** accountant@example.com / password123

## User Roles & Permissions

- **Admin (مدير النظام):** Full access to everything
- **Seller (بائع):** Can manage sales, customers, and view inventory
- **Accountant (محاسب):** Can manage purchases, expenses, and accounting

## Troubleshooting

### "User not found" errors:
1. Make sure the database migrations are run
2. Check that email confirmation is disabled in Supabase dashboard
3. Try creating a new user via `/admin-setup` or `/signup`

### Permission errors:
1. Make sure users have roles assigned in the `user_roles` table
2. Check that the `profiles` table has the user's profile

### Database connection issues:
1. Check your Supabase URL and keys in `.env`
2. Make sure RLS policies are set up correctly
3. Run the migrations again if needed

## Manual Database Setup

If you need to manually create users in the database:

```sql
-- Create a user profile
INSERT INTO profiles (id, email, full_name) 
VALUES ('user-uuid', 'admin@example.com', 'مدير النظام');

-- Assign admin role
INSERT INTO user_roles (user_id, role) 
VALUES ('user-uuid', 'admin');
```

## Next Steps

Once authentication is working:
1. Create additional users through Settings → User Management
2. Assign appropriate roles to each user
3. Test permissions by logging in with different roles
4. Customize permissions in `src/hooks/usePermissions.ts` if needed
