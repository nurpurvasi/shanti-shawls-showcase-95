CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'))
WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Visitors read active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (is_active);
CREATE POLICY "Admins read all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read gallery" ON public.gallery;
CREATE POLICY "Visitors read active gallery"
ON public.gallery
FOR SELECT
TO anon, authenticated
USING (is_active);
CREATE POLICY "Admins read all gallery"
ON public.gallery
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery;
CREATE POLICY "Admins manage gallery"
ON public.gallery
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read homepage" ON public.homepage_sections;
CREATE POLICY "Visitors read active homepage"
ON public.homepage_sections
FOR SELECT
TO anon, authenticated
USING (is_active);
CREATE POLICY "Admins read all homepage"
ON public.homepage_sections
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage homepage" ON public.homepage_sections;
CREATE POLICY "Admins manage homepage"
ON public.homepage_sections
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read available products" ON public.products;
CREATE POLICY "Visitors read available products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_available);
CREATE POLICY "Admins read all products"
ON public.products
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products"
ON public.products
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Visitors read published reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (is_published);
CREATE POLICY "Admins read all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Visitors read settings"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage settings" ON public.settings;
CREATE POLICY "Admins manage settings"
ON public.settings
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;