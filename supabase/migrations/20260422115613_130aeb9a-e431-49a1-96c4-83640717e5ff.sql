-- Enum des rôles
CREATE TYPE public.app_role AS ENUM ('admin_regional', 'equipe_regionale', 'directeur_prefectoral');

-- Enum statut de soumission
CREATE TYPE public.submission_status AS ENUM ('brouillon', 'soumise', 'validee');

-- Table des préfectures
CREATE TABLE public.prefectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prefectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prefectures readable by authenticated users"
  ON public.prefectures FOR SELECT TO authenticated USING (true);

-- Profils utilisateurs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  prefecture_id UUID REFERENCES public.prefectures(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rôles (séparés du profil pour éviter les escalades de privilèges)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier un rôle
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- Politiques profiles
CREATE POLICY "Users see own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins and regional team see all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin_regional') OR
    public.has_role(auth.uid(), 'equipe_regionale')
  );

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins manage all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin_regional'))
  WITH CHECK (public.has_role(auth.uid(), 'admin_regional'));

-- Politiques user_roles
CREATE POLICY "Users see own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins see all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin_regional'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin_regional'))
  WITH CHECK (public.has_role(auth.uid(), 'admin_regional'));

-- Trigger : créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Soumissions annuelles agrégées
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture_id UUID NOT NULL REFERENCES public.prefectures(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  status public.submission_status NOT NULL DEFAULT 'brouillon',
  comments TEXT,

  perm_associations INTEGER DEFAULT 0,
  perm_conventions INTEGER DEFAULT 0,
  perm_clubs INTEGER DEFAULT 0,
  perm_educative INTEGER DEFAULT 0,
  perm_cultural INTEGER DEFAULT 0,
  perm_sportive INTEGER DEFAULT 0,
  perm_capacity INTEGER DEFAULT 0,

  outreach_educative INTEGER DEFAULT 0,
  outreach_cultural INTEGER DEFAULT 0,
  outreach_sportive INTEGER DEFAULT 0,
  outreach_capacity INTEGER DEFAULT 0,

  camping_associations INTEGER DEFAULT 0,
  camping_participants INTEGER DEFAULT 0,
  camping_female INTEGER DEFAULT 0,
  camping_male INTEGER DEFAULT 0,
  camping_rural INTEGER DEFAULT 0,
  camping_urban INTEGER DEFAULT 0,
  camping_facilitators INTEGER DEFAULT 0,
  camping_trainings INTEGER DEFAULT 0,

  festivals_count INTEGER DEFAULT 0,
  festivals_participants INTEGER DEFAULT 0,
  festivals_qualified INTEGER DEFAULT 0,

  integration_trainings INTEGER DEFAULT 0,
  integration_beneficiaries INTEGER DEFAULT 0,
  integration_partners INTEGER DEFAULT 0,

  inst_updated INTEGER DEFAULT 0,
  inst_in_progress INTEGER DEFAULT 0,
  inst_dispute INTEGER DEFAULT 0,
  inst_rehab_needs INTEGER DEFAULT 0,

  completeness_pct NUMERIC(5,2) DEFAULT 0,
  global_score NUMERIC(5,2) DEFAULT 0,

  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(prefecture_id, year)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and team see all submissions"
  ON public.submissions FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin_regional') OR
    public.has_role(auth.uid(), 'equipe_regionale')
  );

CREATE POLICY "Directors see own prefecture submissions"
  ON public.submissions FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'directeur_prefectoral') AND
    prefecture_id IN (SELECT prefecture_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins manage all submissions"
  ON public.submissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin_regional'))
  WITH CHECK (public.has_role(auth.uid(), 'admin_regional'));

CREATE POLICY "Directors manage own prefecture submissions"
  ON public.submissions FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'directeur_prefectoral') AND
    prefecture_id IN (SELECT prefecture_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'directeur_prefectoral') AND
    prefecture_id IN (SELECT prefecture_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed des 13 préfectures (12 historiques + Anfa)
INSERT INTO public.prefectures (code, name_fr, name_ar) VALUES
  ('BMR', 'Ben M''Sick - Moulay Rachid', 'بن مسيك مولاي رشيد'),
  ('ASH', 'Aïn Sebaâ - Hay Mohammadi', 'عين السبع الحي المحمدي'),
  ('FMS', 'Fida - Mers Sultan', 'الفداء مرس السلطان'),
  ('ACH', 'Aïn Chock - Hay Hassani - Nouaceur', 'عين الشق الحي الحسني النواصر'),
  ('SBR', 'Sidi Bernoussi', 'سيدي البرنوصي'),
  ('MED', 'Médiouna', 'مديونة'),
  ('MOH', 'Mohammedia', 'المحمدية'),
  ('BSL', 'Benslimane', 'بنسليمان'),
  ('JDA', 'El Jadida', 'الجديدة'),
  ('SBN', 'Sidi Bennour', 'سيدي بنور'),
  ('BRC', 'Berrechid', 'برشيد'),
  ('STT', 'Settat', 'سطات'),
  ('ANF', 'Anfa', 'أنفا');