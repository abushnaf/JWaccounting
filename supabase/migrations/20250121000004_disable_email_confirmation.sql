-- Disable email confirmation for development
-- This allows users to sign up and login immediately without email verification

-- Update auth configuration to disable email confirmation
-- Note: This needs to be done in the Supabase dashboard under Authentication > Settings
-- But we can also create a function to handle this programmatically

-- Create a function to create users without email confirmation
CREATE OR REPLACE FUNCTION public.create_user_without_confirmation(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role app_role
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_id UUID;
  encrypted_password TEXT;
BEGIN
  -- Generate UUID for the user
  user_id := gen_random_uuid();
  
  -- Hash the password (simplified - in production use proper hashing)
  encrypted_password := crypt(user_password, gen_salt('bf'));
  
  -- Insert into auth.users directly
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    user_email,
    encrypted_password,
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
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
SELECT public.create_user_without_confirmation(
  'admin@example.com',
  'password123',
  'مدير النظام',
  'admin'
);

SELECT public.create_user_without_confirmation(
  'seller@example.com',
  'password123',
  'بائع',
  'seller'
);

SELECT public.create_user_without_confirmation(
  'accountant@example.com',
  'password123',
  'محاسب',
  'accountant'
);

-- Clean up the function
DROP FUNCTION public.create_user_without_confirmation(TEXT, TEXT, TEXT, app_role);
