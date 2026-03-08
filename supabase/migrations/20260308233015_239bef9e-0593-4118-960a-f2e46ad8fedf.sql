
CREATE TABLE public.dreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '💫',
  category TEXT NOT NULL DEFAULT 'Together',
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dreams" ON public.dreams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert dreams" ON public.dreams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update dreams" ON public.dreams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete dreams" ON public.dreams FOR DELETE TO anon, authenticated USING (true);
