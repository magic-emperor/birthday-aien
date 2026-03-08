
CREATE TABLE public.memory_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '💌',
  unlock_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read capsules" ON public.memory_capsules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert capsules" ON public.memory_capsules FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can delete capsules" ON public.memory_capsules FOR DELETE TO anon, authenticated USING (true);
