-- Period enum
DO $$ BEGIN
  CREATE TYPE public.submission_period AS ENUM ('annuelle','trimestrielle');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS period public.submission_period NOT NULL DEFAULT 'annuelle',
  ADD COLUMN IF NOT EXISTS director_name text,
  ADD COLUMN IF NOT EXISTS report_date date;

-- Helper: check ownership of a submission for the current user
CREATE OR REPLACE FUNCTION public.user_owns_submission(_submission_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.submissions s
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = _submission_id
      AND s.prefecture_id = p.prefecture_id
      AND public.has_role(auth.uid(), 'directeur_prefectoral'::app_role)
  )
$$;

-- Generic table creator pattern
CREATE TABLE IF NOT EXISTS public.submission_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  movement_type text NOT NULL CHECK (movement_type IN ('entrante','sortante')),
  movement_date date,
  motif text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submission_camps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  camp_type text,
  name text NOT NULL,
  girls integer NOT NULL DEFAULT 0 CHECK (girls >= 0),
  boys integer NOT NULL DEFAULT 0 CHECK (boys >= 0),
  rural integer NOT NULL DEFAULT 0 CHECK (rural >= 0),
  urban integer NOT NULL DEFAULT 0 CHECK (urban >= 0),
  facilitators integer NOT NULL DEFAULT 0 CHECK (facilitators >= 0),
  facilitators_trained integer NOT NULL DEFAULT 0 CHECK (facilitators_trained >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submission_festivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  name text NOT NULL,
  participants integer NOT NULL DEFAULT 0 CHECK (participants >= 0),
  qualified integer NOT NULL DEFAULT 0 CHECK (qualified >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submission_socioeco (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  subject text NOT NULL,
  activity_type text,
  partner text,
  duration text,
  men integer NOT NULL DEFAULT 0 CHECK (men >= 0),
  women integer NOT NULL DEFAULT 0 CHECK (women >= 0),
  urban_pct numeric NOT NULL DEFAULT 0 CHECK (urban_pct >= 0 AND urban_pct <= 100),
  rural_pct numeric NOT NULL DEFAULT 0 CHECK (rural_pct >= 0 AND rural_pct <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submission_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  program text NOT NULL,
  label text NOT NULL,
  target_value numeric NOT NULL DEFAULT 0,
  actual_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sub_assoc_sub ON public.submission_associations(submission_id);
CREATE INDEX IF NOT EXISTS idx_sub_camps_sub ON public.submission_camps(submission_id);
CREATE INDEX IF NOT EXISTS idx_sub_fest_sub ON public.submission_festivals(submission_id);
CREATE INDEX IF NOT EXISTS idx_sub_socio_sub ON public.submission_socioeco(submission_id);
CREATE INDEX IF NOT EXISTS idx_sub_ind_sub ON public.submission_indicators(submission_id);

-- Enable RLS
ALTER TABLE public.submission_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_socioeco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_indicators ENABLE ROW LEVEL SECURITY;

-- Policies (repeat for each table)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'submission_associations',
    'submission_camps',
    'submission_festivals',
    'submission_socioeco',
    'submission_indicators'
  ] LOOP
    EXECUTE format('
      CREATE POLICY "Admins manage all %1$s"
      ON public.%1$s FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), ''admin_regional''::app_role))
      WITH CHECK (public.has_role(auth.uid(), ''admin_regional''::app_role));
    ', t);

    EXECUTE format('
      CREATE POLICY "Regional team views %1$s"
      ON public.%1$s FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), ''equipe_regionale''::app_role));
    ', t);

    EXECUTE format('
      CREATE POLICY "Directors manage own %1$s"
      ON public.%1$s FOR ALL TO authenticated
      USING (public.user_owns_submission(submission_id))
      WITH CHECK (public.user_owns_submission(submission_id));
    ', t);
  END LOOP;
END $$;