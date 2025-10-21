-- Create test users with different roles for testing permissions

-- Insert test users into auth.users (this would normally be done through Supabase Auth)
-- For testing purposes, we'll create profiles and roles for existing users

-- Note: In a real scenario, these users would be created through Supabase Auth
-- and their IDs would be different. This is just for demonstration.

-- Create admin user profile (assuming user exists in auth.users)
-- INSERT INTO public.profiles (id, full_name, email) 
-- VALUES ('admin-user-id', 'مدير النظام', 'admin@example.com')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('admin-user-id', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Create seller user profile
-- INSERT INTO public.profiles (id, full_name, email) 
-- VALUES ('seller-user-id', 'بائع', 'seller@example.com')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('seller-user-id', 'seller')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Create accountant user profile
-- INSERT INTO public.profiles (id, full_name, email) 
-- VALUES ('accountant-user-id', 'محاسب', 'accountant@example.com')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('accountant-user-id', 'accountant')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Create a function to help with testing - get current user roles
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
$$;

-- Create a function to check if current user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY(roles)
  )
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(app_role[]) TO authenticated;
