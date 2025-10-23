-- Secure function to assign the first admin or allow admins to assign roles
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  roles_count integer;
BEGIN
  -- If no roles exist yet, allow bootstrapping the first admin
  SELECT COUNT(*) INTO roles_count FROM public.user_roles;

  IF roles_count = 0 THEN
    INSERT INTO public.user_roles(user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN;
  END IF;

  -- Otherwise only admins can assign roles
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  INSERT INTO public.user_roles(user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_user_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, app_role) TO authenticated;


