-- Ensure the app role enum exists with all expected role values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin', 'user');
  ELSE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'admin') THEN
      ALTER TYPE public.app_role ADD VALUE 'admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'super_admin') THEN
      ALTER TYPE public.app_role ADD VALUE 'super_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'user') THEN
      ALTER TYPE public.app_role ADD VALUE 'user';
    END IF;
  END IF;
END $$;

-- Make sure authenticated app requests can read and manage role rows according to RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Stable security-definer role lookup used by RLS and server authorization checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
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

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Recreate first-user bootstrap trigger; it was missing even though the function existed
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bootstrap_first_admin_trg ON auth.users;
CREATE TRIGGER bootstrap_first_admin_trg
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.bootstrap_first_admin();

-- If there are users but no super admin, promote the newest confirmed/logged-in account.
WITH candidate AS (
  SELECT id
  FROM auth.users
  ORDER BY COALESCE(last_sign_in_at, confirmed_at, email_confirmed_at, created_at) DESC
  LIMIT 1
), missing_super_admin AS (
  SELECT id FROM candidate
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin')
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::public.app_role
FROM missing_super_admin
CROSS JOIN (VALUES ('super_admin'), ('admin')) AS roles(role)
ON CONFLICT (user_id, role) DO NOTHING;