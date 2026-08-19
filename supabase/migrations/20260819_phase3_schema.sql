-- Migration for Phase 3: Core Budgeting & Financial Engine

-- 1. Fiscal Periods Table
CREATE TABLE IF NOT EXISTS public.fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "FY2026", "2026-Q1", "2026-01"
  type TEXT NOT NULL CHECK (type IN ('annual', 'quarterly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'locked')),
  rollover_enabled BOOLEAN NOT NULL DEFAULT false,
  carried_over_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Two-Tier Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  budget_cap NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Departments / Cost Centers Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  budget_cap NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Expenses / Line Items Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.fiscal_periods(id) ON DELETE SET NULL,
  period_name TEXT NOT NULL, -- Fallback / readable period string e.g. "2026-Q1"
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL, -- Can be negative for refunds/rebates
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT,
  payment_method TEXT NOT NULL DEFAULT 'credit_card' CHECK (payment_method IN ('credit_card', 'wire_transfer', 'direct_debit', 'petty_cash')),
  receipt_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('planned', 'pending_approval', 'approved', 'paid')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'quarterly', 'annual')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_org ON public.fiscal_periods(org_id);
CREATE INDEX IF NOT EXISTS idx_categories_org ON public.categories(org_id);
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(org_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org ON public.expenses(org_id);
CREATE INDEX IF NOT EXISTS idx_expenses_period ON public.expenses(period_name);

-- RLS Policies
ALTER TABLE public.fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage fiscal periods for their org" ON public.fiscal_periods
  FOR ALL USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Users can manage categories for their org" ON public.categories
  FOR ALL USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Users can manage departments for their org" ON public.departments
  FOR ALL USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Users can manage expenses for their org" ON public.expenses
  FOR ALL USING (public.is_org_member(org_id, auth.uid()));
