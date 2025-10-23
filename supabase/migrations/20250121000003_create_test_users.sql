-- Create test users for development/testing
-- Note: These users will be created in auth.users via Supabase Auth API
-- This migration creates the profiles and roles for them

-- First, let's create a function to create test users programmatically
CREATE OR REPLACE FUNCTION public.create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role app_role
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Insert into auth.users (this would normally be done via Supabase Auth API)
  -- For development, we'll create a placeholder and then create the profile/role
  -- In production, these users should be created via the Supabase Auth API
  
  -- Generate a UUID for the user
  user_id := gen_random_uuid();
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (user_id, user_email, user_name)
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN user_id;
END;
$$;

-- Create test users
-- Note: In a real scenario, these would be created via Supabase Auth API
-- and their actual UUIDs would be used here

-- Admin user
SELECT public.create_test_user(
  'admin@example.com',
  'password123',
  'مدير النظام',
  'admin'
);

-- Seller user  
SELECT public.create_test_user(
  'seller@example.com',
  'password123',
  'بائع',
  'seller'
);

-- Accountant user
SELECT public.create_test_user(
  'accountant@example.com',
  'password123',
  'محاسب',
  'accountant'
);

-- Clean up the function
DROP FUNCTION public.create_test_user(TEXT, TEXT, TEXT, app_role);
