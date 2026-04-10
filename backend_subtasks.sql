CREATE TABLE public.subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  is_done boolean default false not null,
  due_date date,
  due_time time without time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subtasks" 
ON public.subtasks FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
