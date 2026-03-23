-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tasks Table
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'doing', 'done'
    priority INTEGER DEFAULT 3, -- 1=High, 2=Medium, 3=Low
    duration_min INTEGER DEFAULT 30,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    pinned_today BOOLEAN DEFAULT false,
    routine_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can insert their own tasks."
ON public.tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks."
ON public.tasks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks."
ON public.tasks
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks."
ON public.tasks
FOR SELECT
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tasks
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- FINANCIAL MODULE SCHEMA
-- ==========================================

-- 1. Financial Entries Table (Incomes/Expenses)
CREATE TABLE public.financial_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    notes TEXT,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    is_paid BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_type TEXT,
    is_fixed BOOLEAN DEFAULT false,
    reference_month TEXT NOT NULL, -- Format: 'YYYY-MM'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own financial entries."
ON public.financial_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial entries."
ON public.financial_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial entries."
ON public.financial_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial entries."
ON public.financial_entries FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_entries_updated_at
BEFORE UPDATE ON public.financial_entries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 2. Financial Budgets Table (Category Limits)
CREATE TABLE public.financial_budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    category TEXT NOT NULL,
    amount_limit DECIMAL(12,2) NOT NULL,
    reference_month TEXT NOT NULL, -- Format: 'YYYY-MM'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category, reference_month)
);

ALTER TABLE public.financial_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own financial budgets."
ON public.financial_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial budgets."
ON public.financial_budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial budgets."
ON public.financial_budgets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial budgets."
ON public.financial_budgets FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_budgets_updated_at
BEFORE UPDATE ON public.financial_budgets
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 3. Financial Goals Table (Savings Goals)
CREATE TABLE public.financial_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    target_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own financial goals."
ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals."
ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals."
ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial goals."
ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_goals_updated_at
BEFORE UPDATE ON public.financial_goals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Migration: add_goal_tracking_to_entries
ALTER TABLE financial_entries ADD COLUMN goal_id UUID REFERENCES financial_goals(id) ON DELETE SET NULL, ADD COLUMN ignore_from_balance BOOLEAN DEFAULT false;
