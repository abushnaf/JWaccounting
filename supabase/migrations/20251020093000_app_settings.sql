-- App settings single-row table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  app_name TEXT NOT NULL DEFAULT 'نظام المجوهرات',
  phone TEXT,
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure single row exists
INSERT INTO public.app_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies: everyone authenticated can read, only admins can write
DROP POLICY IF EXISTS "app_settings_read" ON public.app_settings;
CREATE POLICY "app_settings_read" ON public.app_settings
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "app_settings_write" ON public.app_settings;
CREATE POLICY "app_settings_write" ON public.app_settings
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


