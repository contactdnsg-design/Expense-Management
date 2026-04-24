-- ============================================================
-- CLAIM CHAIN SYSTEM — Full State Machine Migration
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

DROP TYPE IF EXISTS public.employee_grade CASCADE;
CREATE TYPE public.employee_grade AS ENUM ('E1','E2','E3','M1','M2','M3','D1','D2','VP','C');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('employee','manager','finance','admin','auditor');

DROP TYPE IF EXISTS public.city_tier CASCADE;
CREATE TYPE public.city_tier AS ENUM ('tier1','tier2','tier3','international');

DROP TYPE IF EXISTS public.pre_claim_status CASCADE;
CREATE TYPE public.pre_claim_status AS ENUM ('draft','submitted','under_review','approved','advance_released','converted','rejected','closed');

DROP TYPE IF EXISTS public.post_claim_status CASCADE;
CREATE TYPE public.post_claim_status AS ENUM ('draft','submitted','under_review','approved','paid','rejected','closed');

DROP TYPE IF EXISTS public.exception_claim_status CASCADE;
CREATE TYPE public.exception_claim_status AS ENUM ('submitted','escalated','approved','rejected','closed');

DROP TYPE IF EXISTS public.claim_category CASCADE;
CREATE TYPE public.claim_category AS ENUM ('travel','hotel','food','transport','misc','software','training','entertainment','medical','per_diem','internet','mobile','corporate_card');

DROP TYPE IF EXISTS public.approval_action CASCADE;
CREATE TYPE public.approval_action AS ENUM ('pending','approved','rejected','escalated','info_requested');

DROP TYPE IF EXISTS public.settlement_type CASCADE;
CREATE TYPE public.settlement_type AS ENUM ('reimbursement','recovery','exact_match','advance_adjusted');

DROP TYPE IF EXISTS public.payment_mode CASCADE;
CREATE TYPE public.payment_mode AS ENUM ('bank_transfer','corporate_card','wallet','payroll_deduction');

DROP TYPE IF EXISTS public.exception_type CASCADE;
CREATE TYPE public.exception_type AS ENUM ('no_pre_approval','policy_violation','lost_bill','per_diem','recurring','corporate_card_reconciliation');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- User Profiles (intermediary for auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  employee_id TEXT UNIQUE,
  grade public.employee_grade DEFAULT 'E1'::public.employee_grade,
  role public.user_role DEFAULT 'employee'::public.user_role,
  department TEXT DEFAULT '',
  cost_center TEXT DEFAULT '',
  manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  department_head_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  bank_account TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Policy Rules Engine
CREATE TABLE IF NOT EXISTS public.policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  category public.claim_category NOT NULL,
  grade public.employee_grade,
  city_tier public.city_tier,
  daily_limit NUMERIC(12,2),
  per_trip_limit NUMERIC(12,2),
  per_item_limit NUMERIC(12,2),
  requires_receipt_above NUMERIC(12,2) DEFAULT 0,
  travel_class TEXT DEFAULT 'economy',
  hotel_star_limit INTEGER DEFAULT 3,
  advance_allowed BOOLEAN DEFAULT true,
  max_advance_percent INTEGER DEFAULT 80,
  exception_threshold NUMERIC(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pre-Claims
CREATE TABLE IF NOT EXISTS public.pre_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  description TEXT DEFAULT '',
  travel_from TEXT DEFAULT '',
  travel_to TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  city_tier public.city_tier DEFAULT 'tier2'::public.city_tier,
  estimated_total NUMERIC(12,2) DEFAULT 0,
  advance_requested NUMERIC(12,2) DEFAULT 0,
  advance_sanctioned NUMERIC(12,2) DEFAULT 0,
  advance_mode public.payment_mode,
  status public.pre_claim_status DEFAULT 'draft'::public.pre_claim_status,
  policy_validated BOOLEAN DEFAULT false,
  policy_warnings JSONB DEFAULT '[]'::jsonb,
  policy_breaches JSONB DEFAULT '[]'::jsonb,
  justification TEXT DEFAULT '',
  supporting_docs JSONB DEFAULT '[]'::jsonb,
  current_approval_level INTEGER DEFAULT 0,
  converted_to_post_claim_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pre-Claim Budget Lines
CREATE TABLE IF NOT EXISTS public.pre_claim_budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_claim_id UUID NOT NULL REFERENCES public.pre_claims(id) ON DELETE CASCADE,
  category public.claim_category NOT NULL,
  estimated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  policy_limit NUMERIC(12,2),
  within_policy BOOLEAN DEFAULT true,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Post-Claims
CREATE TABLE IF NOT EXISTS public.post_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  pre_claim_id UUID REFERENCES public.pre_claims(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL,
  description TEXT DEFAULT '',
  travel_from TEXT DEFAULT '',
  travel_to TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  city_tier public.city_tier DEFAULT 'tier2'::public.city_tier,
  total_claimed NUMERIC(12,2) DEFAULT 0,
  total_approved NUMERIC(12,2) DEFAULT 0,
  advance_taken NUMERIC(12,2) DEFAULT 0,
  settlement_type public.settlement_type,
  settlement_amount NUMERIC(12,2) DEFAULT 0,
  payment_mode public.payment_mode,
  status public.post_claim_status DEFAULT 'draft'::public.post_claim_status,
  policy_validated BOOLEAN DEFAULT false,
  policy_violations JSONB DEFAULT '[]'::jsonb,
  current_approval_level INTEGER DEFAULT 0,
  finance_entry_id TEXT DEFAULT '',
  gst_captured BOOLEAN DEFAULT false,
  cost_center TEXT DEFAULT '',
  paid_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Expense Line Items
CREATE TABLE IF NOT EXISTS public.expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_claim_id UUID NOT NULL REFERENCES public.post_claims(id) ON DELETE CASCADE,
  category public.claim_category NOT NULL,
  vendor_name TEXT DEFAULT '',
  bill_date DATE,
  bill_number TEXT DEFAULT '',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  exchange_rate NUMERIC(10,4) DEFAULT 1,
  amount_inr NUMERIC(12,2),
  receipt_url TEXT DEFAULT '',
  ocr_extracted BOOLEAN DEFAULT false,
  ocr_data JSONB DEFAULT '{}'::jsonb,
  within_policy BOOLEAN DEFAULT true,
  policy_note TEXT DEFAULT '',
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Exception Claims
CREATE TABLE IF NOT EXISTS public.exception_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  exception_type public.exception_type NOT NULL,
  purpose TEXT NOT NULL,
  justification TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  category public.claim_category,
  status public.exception_claim_status DEFAULT 'submitted'::public.exception_claim_status,
  policy_deviation_flag BOOLEAN DEFAULT true,
  no_bill_declaration BOOLEAN DEFAULT false,
  per_diem_location TEXT DEFAULT '',
  per_diem_days INTEGER DEFAULT 0,
  per_diem_rate NUMERIC(12,2) DEFAULT 0,
  recurring_month TEXT DEFAULT '',
  corporate_card_last4 TEXT DEFAULT '',
  current_approval_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Approval Workflow
CREATE TABLE IF NOT EXISTS public.approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_type TEXT NOT NULL CHECK (claim_type IN ('pre_claim','post_claim','exception')),
  claim_id UUID NOT NULL,
  level INTEGER NOT NULL,
  approver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  approver_role TEXT NOT NULL,
  action public.approval_action DEFAULT 'pending'::public.approval_action,
  comments TEXT DEFAULT '',
  acted_at TIMESTAMPTZ,
  escalated_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Advance Ledger
CREATE TABLE IF NOT EXISTS public.advance_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_claim_id UUID NOT NULL REFERENCES public.pre_claims(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  mode public.payment_mode NOT NULL,
  disbursed_at TIMESTAMPTZ,
  reference_number TEXT DEFAULT '',
  settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  claim_type TEXT,
  claim_id UUID,
  action TEXT NOT NULL,
  old_value JSONB DEFAULT '{}'::jsonb,
  new_value JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Duplicate Bill Detection Log
CREATE TABLE IF NOT EXISTS public.duplicate_bill_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_item_id UUID NOT NULL REFERENCES public.expense_items(id) ON DELETE CASCADE,
  matched_expense_item_id UUID REFERENCES public.expense_items(id) ON DELETE SET NULL,
  match_reason TEXT NOT NULL,
  flagged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_manager ON public.user_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_pre_claims_employee ON public.pre_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_pre_claims_status ON public.pre_claims(status);
CREATE INDEX IF NOT EXISTS idx_post_claims_employee ON public.post_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_post_claims_status ON public.post_claims(status);
CREATE INDEX IF NOT EXISTS idx_post_claims_pre_claim ON public.post_claims(pre_claim_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_post_claim ON public.expense_items(post_claim_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_claim ON public.approval_steps(claim_id, claim_type);
CREATE INDEX IF NOT EXISTS idx_approval_steps_approver ON public.approval_steps(approver_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_claim ON public.audit_logs(claim_id, claim_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_exception_claims_employee ON public.exception_claims(employee_id);

-- ============================================================
-- 4. FUNCTIONS (BEFORE RLS POLICIES)
-- ============================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role, grade)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'grade', 'E1')::public.employee_grade
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Generate claim number
CREATE OR REPLACE FUNCTION public.generate_claim_number(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_num INTEGER;
  yr TEXT;
BEGIN
  yr := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO seq_num
  FROM (
    SELECT claim_number FROM public.pre_claims WHERE claim_number LIKE prefix || '-' || yr || '-%'
    UNION ALL
    SELECT claim_number FROM public.post_claims WHERE claim_number LIKE prefix || '-' || yr || '-%'
    UNION ALL
    SELECT claim_number FROM public.exception_claims WHERE claim_number LIKE prefix || '-' || yr || '-%'
  ) all_claims;
  RETURN prefix || '-' || yr || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$;

-- Check if user is manager or above
CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid()
  AND role IN ('manager','finance','admin','auditor')
);
$$;

-- Check if user is finance or admin
CREATE OR REPLACE FUNCTION public.is_finance_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid()
  AND role IN ('finance','admin')
);
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid()
  AND role = 'admin'
);
$$;

-- Validate pre-claim against policy
CREATE OR REPLACE FUNCTION public.validate_pre_claim_policy(p_pre_claim_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim RECORD;
  v_employee RECORD;
  v_warnings JSONB := '[]'::jsonb;
  v_breaches JSONB := '[]'::jsonb;
  v_line RECORD;
  v_rule RECORD;
BEGIN
  SELECT * INTO v_claim FROM public.pre_claims WHERE id = p_pre_claim_id;
  SELECT * INTO v_employee FROM public.user_profiles WHERE id = v_claim.employee_id;

  FOR v_line IN SELECT * FROM public.pre_claim_budget_lines WHERE pre_claim_id = p_pre_claim_id LOOP
    SELECT * INTO v_rule FROM public.policy_rules
    WHERE category = v_line.category
    AND (grade IS NULL OR grade = v_employee.grade)
    AND (city_tier IS NULL OR city_tier = v_claim.city_tier)
    AND is_active = true
    LIMIT 1;

    IF v_rule.id IS NOT NULL THEN
      IF v_rule.daily_limit IS NOT NULL AND v_line.estimated_amount > v_rule.daily_limit THEN
        v_breaches := v_breaches || jsonb_build_object(
          'category', v_line.category,
          'message', 'Exceeds daily limit of ' || v_rule.daily_limit,
          'limit', v_rule.daily_limit,
          'claimed', v_line.estimated_amount
        );
      ELSIF v_rule.per_item_limit IS NOT NULL AND v_line.estimated_amount > (v_rule.per_item_limit * 0.9) THEN
        v_warnings := v_warnings || jsonb_build_object(
          'category', v_line.category,
          'message', 'Approaching limit of ' || v_rule.per_item_limit,
          'limit', v_rule.per_item_limit,
          'claimed', v_line.estimated_amount
        );
      END IF;
    END IF;
  END LOOP;

  UPDATE public.pre_claims
  SET policy_warnings = v_warnings,
      policy_breaches = v_breaches,
      policy_validated = true
  WHERE id = p_pre_claim_id;

  RETURN jsonb_build_object('warnings', v_warnings, 'breaches', v_breaches);
END;
$$;

-- Detect duplicate bills
CREATE OR REPLACE FUNCTION public.detect_duplicate_bills(p_expense_item_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_dup RECORD;
BEGIN
  SELECT * INTO v_item FROM public.expense_items WHERE id = p_expense_item_id;

  SELECT ei.id INTO v_dup
  FROM public.expense_items ei
  WHERE ei.id != p_expense_item_id
  AND ei.vendor_name = v_item.vendor_name
  AND ei.bill_date = v_item.bill_date
  AND ei.amount = v_item.amount
  AND ei.bill_number = v_item.bill_number
  AND ei.bill_number != ''
  LIMIT 1;

  IF v_dup.id IS NOT NULL THEN
    UPDATE public.expense_items SET is_duplicate = true WHERE id = p_expense_item_id;
    INSERT INTO public.duplicate_bill_flags (expense_item_id, matched_expense_item_id, match_reason)
    VALUES (p_expense_item_id, v_dup.id, 'Same vendor, date, amount, and bill number')
    ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- Calculate post-claim settlement
CREATE OR REPLACE FUNCTION public.calculate_settlement(p_post_claim_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim RECORD;
  v_total_claimed NUMERIC;
  v_settlement_type public.settlement_type;
  v_settlement_amount NUMERIC;
BEGIN
  SELECT * INTO v_claim FROM public.post_claims WHERE id = p_post_claim_id;
  SELECT COALESCE(SUM(amount_inr), SUM(amount), 0) INTO v_total_claimed
  FROM public.expense_items WHERE post_claim_id = p_post_claim_id AND is_duplicate = false;

  UPDATE public.post_claims SET total_claimed = v_total_claimed WHERE id = p_post_claim_id;

  IF v_claim.advance_taken > v_total_claimed THEN
    v_settlement_type := 'recovery';
    v_settlement_amount := v_claim.advance_taken - v_total_claimed;
  ELSIF v_total_claimed > v_claim.advance_taken THEN
    v_settlement_type := 'reimbursement';
    v_settlement_amount := v_total_claimed - v_claim.advance_taken;
  ELSE
    v_settlement_type := 'exact_match';
    v_settlement_amount := 0;
  END IF;

  UPDATE public.post_claims
  SET settlement_type = v_settlement_type,
      settlement_amount = v_settlement_amount
  WHERE id = p_post_claim_id;

  RETURN jsonb_build_object(
    'total_claimed', v_total_claimed,
    'advance_taken', v_claim.advance_taken,
    'settlement_type', v_settlement_type,
    'settlement_amount', v_settlement_amount
  );
END;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_claim_budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exception_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_bill_flags ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "managers_view_team_profiles" ON public.user_profiles;
CREATE POLICY "managers_view_team_profiles" ON public.user_profiles
FOR SELECT TO authenticated USING (public.is_manager_or_above());

-- policy_rules
DROP POLICY IF EXISTS "all_read_policy_rules" ON public.policy_rules;
CREATE POLICY "all_read_policy_rules" ON public.policy_rules
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_policy_rules" ON public.policy_rules;
CREATE POLICY "admin_manage_policy_rules" ON public.policy_rules
FOR ALL TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- pre_claims
DROP POLICY IF EXISTS "employees_manage_own_pre_claims" ON public.pre_claims;
CREATE POLICY "employees_manage_own_pre_claims" ON public.pre_claims
FOR ALL TO authenticated USING (employee_id = auth.uid()) WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS "managers_view_pre_claims" ON public.pre_claims;
CREATE POLICY "managers_view_pre_claims" ON public.pre_claims
FOR SELECT TO authenticated USING (public.is_manager_or_above());

-- pre_claim_budget_lines
DROP POLICY IF EXISTS "employees_manage_budget_lines" ON public.pre_claim_budget_lines;
CREATE POLICY "employees_manage_budget_lines" ON public.pre_claim_budget_lines
FOR ALL TO authenticated
USING (pre_claim_id IN (SELECT id FROM public.pre_claims WHERE employee_id = auth.uid()))
WITH CHECK (pre_claim_id IN (SELECT id FROM public.pre_claims WHERE employee_id = auth.uid()));

DROP POLICY IF EXISTS "managers_view_budget_lines" ON public.pre_claim_budget_lines;
CREATE POLICY "managers_view_budget_lines" ON public.pre_claim_budget_lines
FOR SELECT TO authenticated USING (public.is_manager_or_above());

-- post_claims
DROP POLICY IF EXISTS "employees_manage_own_post_claims" ON public.post_claims;
CREATE POLICY "employees_manage_own_post_claims" ON public.post_claims
FOR ALL TO authenticated USING (employee_id = auth.uid()) WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS "managers_view_post_claims" ON public.post_claims;
CREATE POLICY "managers_view_post_claims" ON public.post_claims
FOR SELECT TO authenticated USING (public.is_manager_or_above());

-- expense_items
DROP POLICY IF EXISTS "employees_manage_expense_items" ON public.expense_items;
CREATE POLICY "employees_manage_expense_items" ON public.expense_items
FOR ALL TO authenticated
USING (post_claim_id IN (SELECT id FROM public.post_claims WHERE employee_id = auth.uid()))
WITH CHECK (post_claim_id IN (SELECT id FROM public.post_claims WHERE employee_id = auth.uid()));

DROP POLICY IF EXISTS "managers_view_expense_items" ON public.expense_items;
CREATE POLICY "managers_view_expense_items" ON public.expense_items
FOR SELECT TO authenticated USING (public.is_manager_or_above());

-- exception_claims
DROP POLICY IF EXISTS "employees_manage_exception_claims" ON public.exception_claims;
CREATE POLICY "employees_manage_exception_claims" ON public.exception_claims
FOR ALL TO authenticated USING (employee_id = auth.uid()) WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS "managers_view_exception_claims" ON public.exception_claims;
CREATE POLICY "managers_view_exception_claims" ON public.exception_claims
FOR SELECT TO authenticated USING (public.is_manager_or_above());

-- approval_steps
DROP POLICY IF EXISTS "approvers_manage_own_steps" ON public.approval_steps;
CREATE POLICY "approvers_manage_own_steps" ON public.approval_steps
FOR ALL TO authenticated USING (approver_id = auth.uid()) WITH CHECK (approver_id = auth.uid());

DROP POLICY IF EXISTS "managers_view_all_approval_steps" ON public.approval_steps;
CREATE POLICY "managers_view_all_approval_steps" ON public.approval_steps
FOR SELECT TO authenticated USING (public.is_manager_or_above());

DROP POLICY IF EXISTS "employees_view_own_approval_steps" ON public.approval_steps;
CREATE POLICY "employees_view_own_approval_steps" ON public.approval_steps
FOR SELECT TO authenticated
USING (
  claim_id IN (SELECT id FROM public.pre_claims WHERE employee_id = auth.uid())
  OR claim_id IN (SELECT id FROM public.post_claims WHERE employee_id = auth.uid())
  OR claim_id IN (SELECT id FROM public.exception_claims WHERE employee_id = auth.uid())
);

-- advance_ledger
DROP POLICY IF EXISTS "employees_view_own_advances" ON public.advance_ledger;
CREATE POLICY "employees_view_own_advances" ON public.advance_ledger
FOR SELECT TO authenticated USING (employee_id = auth.uid());

DROP POLICY IF EXISTS "finance_manage_advances" ON public.advance_ledger;
CREATE POLICY "finance_manage_advances" ON public.advance_ledger
FOR ALL TO authenticated USING (public.is_finance_or_admin()) WITH CHECK (public.is_finance_or_admin());

-- audit_logs
DROP POLICY IF EXISTS "all_view_own_audit_logs" ON public.audit_logs;
CREATE POLICY "all_view_own_audit_logs" ON public.audit_logs
FOR SELECT TO authenticated USING (actor_id = auth.uid() OR public.is_manager_or_above());

DROP POLICY IF EXISTS "system_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "system_insert_audit_logs" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (true);

-- duplicate_bill_flags
DROP POLICY IF EXISTS "finance_manage_duplicate_flags" ON public.duplicate_bill_flags;
CREATE POLICY "finance_manage_duplicate_flags" ON public.duplicate_bill_flags
FOR ALL TO authenticated USING (public.is_manager_or_above()) WITH CHECK (public.is_manager_or_above());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_pre_claims_updated_at ON public.pre_claims;
CREATE TRIGGER set_pre_claims_updated_at
  BEFORE UPDATE ON public.pre_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_post_claims_updated_at ON public.post_claims;
CREATE TRIGGER set_post_claims_updated_at
  BEFORE UPDATE ON public.post_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_exception_claims_updated_at ON public.exception_claims;
CREATE TRIGGER set_exception_claims_updated_at
  BEFORE UPDATE ON public.exception_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 8. MOCK DATA
-- ============================================================

DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
  manager_uuid UUID := gen_random_uuid();
  finance_uuid UUID := gen_random_uuid();
  emp1_uuid UUID := gen_random_uuid();
  emp2_uuid UUID := gen_random_uuid();
  pre_claim1_uuid UUID := gen_random_uuid();
  pre_claim2_uuid UUID := gen_random_uuid();
  post_claim1_uuid UUID := gen_random_uuid();
  exc_claim1_uuid UUID := gen_random_uuid();
  rule1_uuid UUID := gen_random_uuid();
  rule2_uuid UUID := gen_random_uuid();
  rule3_uuid UUID := gen_random_uuid();
  rule4_uuid UUID := gen_random_uuid();
BEGIN
  -- Auth users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@claimflow.com', crypt('Admin@123', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Arjun Kapoor', 'role', 'admin', 'grade', 'D1'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (manager_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'manager@claimflow.com', crypt('Manager@123', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Priya Sharma', 'role', 'manager', 'grade', 'M2'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (finance_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'finance@claimflow.com', crypt('Finance@123', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Rahul Mehta', 'role', 'finance', 'grade', 'M1'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (emp1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'employee@claimflow.com', crypt('Employee@123', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Sunny Singh', 'role', 'employee', 'grade', 'E3'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (emp2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'anita@claimflow.com', crypt('Anita@123', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Anita Desai', 'role', 'employee', 'grade', 'E2'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  -- Update user profiles with extra fields (trigger creates them)
  UPDATE public.user_profiles SET
    employee_id = 'EMP-001', department = 'Administration', cost_center = 'CC-ADMIN',
    role = 'admin', grade = 'D1'
  WHERE id = admin_uuid;

  UPDATE public.user_profiles SET
    employee_id = 'EMP-002', department = 'Sales', cost_center = 'CC-SALES',
    role = 'manager', grade = 'M2', manager_id = admin_uuid
  WHERE id = manager_uuid;

  UPDATE public.user_profiles SET
    employee_id = 'EMP-003', department = 'Finance', cost_center = 'CC-FIN',
    role = 'finance', grade = 'M1', manager_id = admin_uuid
  WHERE id = finance_uuid;

  UPDATE public.user_profiles SET
    employee_id = 'EMP-004', department = 'Sales', cost_center = 'CC-SALES',
    role = 'employee', grade = 'E3', manager_id = manager_uuid
  WHERE id = emp1_uuid;

  UPDATE public.user_profiles SET
    employee_id = 'EMP-005', department = 'Design', cost_center = 'CC-DESIGN',
    role = 'employee', grade = 'E2', manager_id = manager_uuid
  WHERE id = emp2_uuid;

  -- Policy Rules
  INSERT INTO public.policy_rules (id, rule_name, category, grade, city_tier, daily_limit, per_item_limit, travel_class, hotel_star_limit, advance_allowed, max_advance_percent)
  VALUES
    (rule1_uuid, 'Hotel Tier-2 Standard', 'hotel', NULL, 'tier2', 5000, 5000, 'economy', 3, true, 80),
    (rule2_uuid, 'Food Daily Limit', 'food', NULL, NULL, 800, 800, NULL, NULL, false, 0),
    (rule3_uuid, 'Travel Economy', 'travel', NULL, NULL, NULL, 15000, 'economy', NULL, true, 80),
    (rule4_uuid, 'Hotel Tier-1 Standard', 'hotel', NULL, 'tier1', 8000, 8000, 'economy', 4, true, 80)
  ON CONFLICT (id) DO NOTHING;

  -- Pre-Claims
  INSERT INTO public.pre_claims (id, claim_number, employee_id, purpose, description, travel_from, travel_to, start_date, end_date, city_tier, estimated_total, advance_requested, advance_sanctioned, advance_mode, status, policy_validated)
  VALUES
    (pre_claim1_uuid, 'PRE-2026-0001', emp1_uuid, 'Client Visit - Mumbai', 'Quarterly business review with key client in Mumbai', 'Bangalore', 'Mumbai', '2026-05-01', '2026-05-03', 'tier1', 25000, 20000, 20000, 'bank_transfer', 'advance_released', true),
    (pre_claim2_uuid, 'PRE-2026-0002', emp2_uuid, 'Design Conference - Pune', 'Annual design summit attendance', 'Bangalore', 'Pune', '2026-05-10', '2026-05-12', 'tier2', 18000, 14000, 0, 'bank_transfer', 'submitted', true)
  ON CONFLICT (id) DO NOTHING;

  -- Budget Lines for pre_claim1
  INSERT INTO public.pre_claim_budget_lines (pre_claim_id, category, estimated_amount, policy_limit, within_policy)
  VALUES
    (pre_claim1_uuid, 'travel', 12000, 15000, true),
    (pre_claim1_uuid, 'hotel', 8000, 8000, true),
    (pre_claim1_uuid, 'food', 3000, 2400, false),
    (pre_claim1_uuid, 'misc', 2000, NULL, true)
  ON CONFLICT DO NOTHING;

  -- Post-Claims
  INSERT INTO public.post_claims (id, claim_number, employee_id, pre_claim_id, purpose, description, travel_from, travel_to, start_date, end_date, city_tier, total_claimed, advance_taken, settlement_type, settlement_amount, status, policy_validated)
  VALUES
    (post_claim1_uuid, 'POST-2026-0001', emp1_uuid, pre_claim1_uuid, 'Client Visit - Mumbai Settlement', 'Actual expenses for Mumbai trip', 'Bangalore', 'Mumbai', '2026-05-01', '2026-05-03', 'tier1', 22500, 20000, 'reimbursement', 2500, 'under_review', true)
  ON CONFLICT (id) DO NOTHING;

  -- Expense Items
  INSERT INTO public.expense_items (post_claim_id, category, vendor_name, bill_date, bill_number, amount, gst_amount, amount_inr, within_policy)
  VALUES
    (post_claim1_uuid, 'travel', 'IndiGo Airlines', '2026-05-01', 'IG-20260501-001', 11500, 1035, 11500, true),
    (post_claim1_uuid, 'hotel', 'Taj Lands End', '2026-05-02', 'TAJ-2026-0501', 7800, 1404, 7800, true),
    (post_claim1_uuid, 'food', 'Various Restaurants', '2026-05-02', '', 2200, 0, 2200, true),
    (post_claim1_uuid, 'misc', 'Uber/Ola', '2026-05-03', '', 1000, 0, 1000, true)
  ON CONFLICT DO NOTHING;

  -- Exception Claim
  INSERT INTO public.exception_claims (id, claim_number, employee_id, exception_type, purpose, justification, amount, category, status, policy_deviation_flag)
  VALUES
    (exc_claim1_uuid, 'EXC-2026-0001', emp2_uuid, 'no_pre_approval', 'Emergency Client Meeting - Delhi', 'Urgent escalation required immediate travel without prior approval. Client threatened to cancel contract.', 35000, 'travel', 'escalated', true)
  ON CONFLICT (id) DO NOTHING;

  -- Approval Steps
  INSERT INTO public.approval_steps (claim_type, claim_id, level, approver_id, approver_role, action, comments, acted_at)
  VALUES
    ('pre_claim', pre_claim1_uuid, 1, manager_uuid, 'Reporting Manager', 'approved', 'Approved. Client visit is critical for Q2 targets.', now() - interval '3 days'),
    ('pre_claim', pre_claim1_uuid, 2, admin_uuid, 'Department Head', 'approved', 'Approved with advance disbursement.', now() - interval '2 days'),
    ('post_claim', post_claim1_uuid, 1, manager_uuid, 'Reporting Manager', 'pending', '', null),
    ('pre_claim', pre_claim2_uuid, 1, manager_uuid, 'Reporting Manager', 'pending', '', null),
    ('exception', exc_claim1_uuid, 1, manager_uuid, 'Reporting Manager', 'escalated', 'High value exception. Escalating to Finance.', now() - interval '1 day'),
    ('exception', exc_claim1_uuid, 2, finance_uuid, 'Finance', 'pending', '', null)
  ON CONFLICT DO NOTHING;

  -- Advance Ledger
  INSERT INTO public.advance_ledger (pre_claim_id, employee_id, amount, mode, disbursed_at, reference_number, settled)
  VALUES
    (pre_claim1_uuid, emp1_uuid, 20000, 'bank_transfer', now() - interval '2 days', 'TXN-20260422-001', false)
  ON CONFLICT DO NOTHING;

  -- Audit Logs
  INSERT INTO public.audit_logs (actor_id, claim_type, claim_id, action, new_value)
  VALUES
    (emp1_uuid, 'pre_claim', pre_claim1_uuid, 'CLAIM_SUBMITTED', jsonb_build_object('status', 'submitted', 'amount', 25000)),
    (manager_uuid, 'pre_claim', pre_claim1_uuid, 'CLAIM_APPROVED', jsonb_build_object('level', 1, 'action', 'approved')),
    (admin_uuid, 'pre_claim', pre_claim1_uuid, 'ADVANCE_RELEASED', jsonb_build_object('amount', 20000, 'mode', 'bank_transfer')),
    (emp1_uuid, 'post_claim', post_claim1_uuid, 'CLAIM_SUBMITTED', jsonb_build_object('status', 'submitted', 'amount', 22500))
  ON CONFLICT DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data error: %', SQLERRM;
END $$;
