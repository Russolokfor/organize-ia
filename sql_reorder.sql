ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS routine_order integer DEFAULT 0;
NOTIFY pgrst, 'reload schema';
