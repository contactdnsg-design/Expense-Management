'use client';
import { createClient } from '@/lib/supabase/client';
import type { PreClaim, PostClaim, ExceptionClaim, ApprovalStep, ExpenseItem, PreClaimBudgetLine, UserProfile, AuditLog, PreClaimStatus, PostClaimStatus, ApprovalAction } from '@/lib/types/claims';

const supabase = () => createClient();

// ─── User Profiles ───────────────────────────────────────────
export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase()
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) { console.error('getProfile error:', error.message); return null; }
    return data ? mapProfile(data) : null;
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase()
      .from('user_profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name');
    if (error) { console.error('getAllProfiles error:', error.message); return []; }
    return (data || []).map(mapProfile);
  },

  async getManagers(): Promise<UserProfile[]> {
    const { data, error } = await supabase()
      .from('user_profiles')
      .select('*')
      .in('role', ['manager', 'finance', 'admin'])
      .eq('is_active', true);
    if (error) { console.error('getManagers error:', error.message); return []; }
    return (data || []).map(mapProfile);
  },
};

// ─── Pre-Claims ───────────────────────────────────────────────
export const preClaimService = {
  async getAll(employeeId?: string): Promise<PreClaim[]> {
    let query = supabase()
      .from('pre_claims')
      .select('*, employee:user_profiles(*), budget_lines:pre_claim_budget_lines(*), approval_steps(*)')
      .order('created_at', { ascending: false });
    if (employeeId) query = query.eq('employee_id', employeeId);
    const { data, error } = await query;
    if (error) { console.error('preClaimService.getAll error:', error.message); return []; }
    return (data || []).map(mapPreClaim);
  },

  async getById(id: string): Promise<PreClaim | null> {
    const { data, error } = await supabase()
      .from('pre_claims')
      .select('*, employee:user_profiles(*), budget_lines:pre_claim_budget_lines(*), approval_steps(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) { console.error('preClaimService.getById error:', error.message); return null; }
    return data ? mapPreClaim(data) : null;
  },

  async create(payload: Partial<PreClaim> & { budgetLines?: Partial<PreClaimBudgetLine>[] }): Promise<PreClaim | null> {
    const { data: { user } } = await supabase().auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const claimNumber = `PRE-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const { budgetLines, ...claimData } = payload;

    const { data, error } = await supabase()
      .from('pre_claims')
      .insert({
        claim_number: claimNumber,
        employee_id: user.id,
        purpose: claimData.purpose || '',
        description: claimData.description || '',
        travel_from: claimData.travelFrom || '',
        travel_to: claimData.travelTo || '',
        start_date: claimData.startDate,
        end_date: claimData.endDate,
        city_tier: claimData.cityTier || 'tier2',
        estimated_total: claimData.estimatedTotal || 0,
        advance_requested: claimData.advanceRequested || 0,
        justification: claimData.justification || '',
        status: 'draft',
      })
      .select()
      .single();

    if (error) { console.error('preClaimService.create error:', error.message); return null; }

    if (budgetLines && budgetLines.length > 0 && data) {
      await supabase().from('pre_claim_budget_lines').insert(
        budgetLines.map(l => ({
          pre_claim_id: data.id,
          category: l.category,
          estimated_amount: l.estimatedAmount || 0,
          notes: l.notes || '',
        }))
      );
    }

    await logAudit(user.id, 'pre_claim', data.id, 'CLAIM_CREATED', {}, { status: 'draft' });
    return mapPreClaim(data);
  },

  async submit(id: string): Promise<boolean> {
    const { data: { user } } = await supabase().auth.getUser();
    if (!user) return false;
    const { error } = await supabase()
      .from('pre_claims')
      .update({ status: 'submitted' })
      .eq('id', id)
      .eq('employee_id', user.id);
    if (error) { console.error('preClaimService.submit error:', error.message); return false; }
    await logAudit(user.id, 'pre_claim', id, 'CLAIM_SUBMITTED', {}, { status: 'submitted' });
    return true;
  },

  async updateStatus(id: string, status: PreClaimStatus, actorId: string): Promise<boolean> {
    const { error } = await supabase()
      .from('pre_claims')
      .update({ status })
      .eq('id', id);
    if (error) { console.error('updateStatus error:', error.message); return false; }
    await logAudit(actorId, 'pre_claim', id, 'STATUS_CHANGED', {}, { status });
    return true;
  },
};

// ─── Post-Claims ──────────────────────────────────────────────
export const postClaimService = {
  async getAll(employeeId?: string): Promise<PostClaim[]> {
    let query = supabase()
      .from('post_claims')
      .select('*, employee:user_profiles(*), expense_items(*), approval_steps(*)')
      .order('created_at', { ascending: false });
    if (employeeId) query = query.eq('employee_id', employeeId);
    const { data, error } = await query;
    if (error) { console.error('postClaimService.getAll error:', error.message); return []; }
    return (data || []).map(mapPostClaim);
  },

  async getById(id: string): Promise<PostClaim | null> {
    const { data, error } = await supabase()
      .from('post_claims')
      .select('*, employee:user_profiles(*), expense_items(*), approval_steps(*), pre_claim:pre_claims(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) { console.error('postClaimService.getById error:', error.message); return null; }
    return data ? mapPostClaim(data) : null;
  },

  async create(payload: Partial<PostClaim>): Promise<PostClaim | null> {
    const { data: { user } } = await supabase().auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const claimNumber = `POST-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const { data, error } = await supabase()
      .from('post_claims')
      .insert({
        claim_number: claimNumber,
        employee_id: user.id,
        pre_claim_id: payload.preClaimId || null,
        purpose: payload.purpose || '',
        description: payload.description || '',
        travel_from: payload.travelFrom || '',
        travel_to: payload.travelTo || '',
        start_date: payload.startDate,
        end_date: payload.endDate,
        city_tier: payload.cityTier || 'tier2',
        advance_taken: payload.advanceTaken || 0,
        status: 'draft',
      })
      .select()
      .single();

    if (error) { console.error('postClaimService.create error:', error.message); return null; }
    await logAudit(user.id, 'post_claim', data.id, 'CLAIM_CREATED', {}, { status: 'draft' });
    return mapPostClaim(data);
  },

  async submit(id: string): Promise<boolean> {
    const { data: { user } } = await supabase().auth.getUser();
    if (!user) return false;
    const { error } = await supabase()
      .from('post_claims')
      .update({ status: 'submitted' })
      .eq('id', id)
      .eq('employee_id', user.id);
    if (error) { console.error('postClaimService.submit error:', error.message); return false; }
    await logAudit(user.id, 'post_claim', id, 'CLAIM_SUBMITTED', {}, { status: 'submitted' });
    return true;
  },

  async updateStatus(id: string, status: PostClaimStatus, actorId: string): Promise<boolean> {
    const updates: any = { status };
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    if (status === 'closed') updates.closed_at = new Date().toISOString();
    const { error } = await supabase().from('post_claims').update(updates).eq('id', id);
    if (error) { console.error('updateStatus error:', error.message); return false; }
    await logAudit(actorId, 'post_claim', id, 'STATUS_CHANGED', {}, { status });
    return true;
  },
};

// ─── Expense Items ────────────────────────────────────────────
export const expenseItemService = {
  async addItem(item: Partial<ExpenseItem>): Promise<ExpenseItem | null> {
    const amountInr = (item.amount || 0) * (item.exchangeRate || 1);
    const { data, error } = await supabase()
      .from('expense_items')
      .insert({
        post_claim_id: item.postClaimId,
        category: item.category,
        vendor_name: item.vendorName || '',
        bill_date: item.billDate,
        bill_number: item.billNumber || '',
        amount: item.amount || 0,
        gst_amount: item.gstAmount || 0,
        currency: item.currency || 'INR',
        exchange_rate: item.exchangeRate || 1,
        amount_inr: amountInr,
        receipt_url: item.receiptUrl || '',
        notes: item.notes || '',
      })
      .select()
      .single();
    if (error) { console.error('addItem error:', error.message); return null; }
    return mapExpenseItem(data);
  },

  async deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase().from('expense_items').delete().eq('id', id);
    if (error) { console.error('deleteItem error:', error.message); return false; }
    return true;
  },

  async getByPostClaim(postClaimId: string): Promise<ExpenseItem[]> {
    const { data, error } = await supabase()
      .from('expense_items')
      .select('*')
      .eq('post_claim_id', postClaimId)
      .order('created_at');
    if (error) { console.error('getByPostClaim error:', error.message); return []; }
    return (data || []).map(mapExpenseItem);
  },
};

// ─── Exception Claims ─────────────────────────────────────────
export const exceptionClaimService = {
  async getAll(employeeId?: string): Promise<ExceptionClaim[]> {
    let query = supabase()
      .from('exception_claims')
      .select('*, employee:user_profiles(*), approval_steps(*)')
      .order('created_at', { ascending: false });
    if (employeeId) query = query.eq('employee_id', employeeId);
    const { data, error } = await query;
    if (error) { console.error('exceptionClaimService.getAll error:', error.message); return []; }
    return (data || []).map(mapExceptionClaim);
  },

  async create(payload: Partial<ExceptionClaim>): Promise<ExceptionClaim | null> {
    const { data: { user } } = await supabase().auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const claimNumber = `EXC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const { data, error } = await supabase()
      .from('exception_claims')
      .insert({
        claim_number: claimNumber,
        employee_id: user.id,
        exception_type: payload.exceptionType,
        purpose: payload.purpose || '',
        justification: payload.justification || '',
        amount: payload.amount || 0,
        category: payload.category,
        no_bill_declaration: payload.noBillDeclaration || false,
        per_diem_location: payload.perDiemLocation || '',
        per_diem_days: payload.perDiemDays || 0,
        per_diem_rate: payload.perDiemRate || 0,
        recurring_month: payload.recurringMonth || '',
        corporate_card_last4: payload.corporateCardLast4 || '',
        status: 'submitted',
        policy_deviation_flag: true,
      })
      .select()
      .single();
    if (error) { console.error('exceptionClaimService.create error:', error.message); return null; }
    await logAudit(user.id, 'exception', data.id, 'EXCEPTION_CLAIM_SUBMITTED', {}, { type: payload.exceptionType });
    return mapExceptionClaim(data);
  },
};

// ─── Approval Steps ───────────────────────────────────────────
export const approvalService = {
  async getPendingForApprover(approverId: string): Promise<ApprovalStep[]> {
    const { data, error } = await supabase()
      .from('approval_steps')
      .select('*')
      .eq('approver_id', approverId)
      .eq('action', 'pending')
      .order('created_at');
    if (error) { console.error('getPendingForApprover error:', error.message); return []; }
    return (data || []).map(mapApprovalStep);
  },

  async getAllPending(): Promise<ApprovalStep[]> {
    const { data, error } = await supabase()
      .from('approval_steps')
      .select('*, approver:user_profiles(*)')
      .eq('action', 'pending')
      .order('created_at');
    if (error) { console.error('getAllPending error:', error.message); return []; }
    return (data || []).map(mapApprovalStep);
  },

  async act(stepId: string, action: ApprovalAction, comments: string, actorId: string): Promise<boolean> {
    const { error } = await supabase()
      .from('approval_steps')
      .update({ action, comments, acted_at: new Date().toISOString() })
      .eq('id', stepId);
    if (error) { console.error('approvalService.act error:', error.message); return false; }
    await logAudit(actorId, 'approval', stepId, `APPROVAL_${action.toUpperCase()}`, {}, { action, comments });
    return true;
  },

  async createStep(step: Partial<ApprovalStep>): Promise<ApprovalStep | null> {
    const { data, error } = await supabase()
      .from('approval_steps')
      .insert({
        claim_type: step.claimType,
        claim_id: step.claimId,
        level: step.level || 1,
        approver_id: step.approverId,
        approver_role: step.approverRole || '',
        action: 'pending',
      })
      .select()
      .single();
    if (error) { console.error('createStep error:', error.message); return null; }
    return mapApprovalStep(data);
  },

  async getForClaim(claimId: string, claimType: string): Promise<ApprovalStep[]> {
    const { data, error } = await supabase()
      .from('approval_steps')
      .select('*, approver:user_profiles(*)')
      .eq('claim_id', claimId)
      .eq('claim_type', claimType)
      .order('level');
    if (error) { console.error('getForClaim error:', error.message); return []; }
    return (data || []).map(mapApprovalStep);
  },
};

// ─── Audit Logs ───────────────────────────────────────────────
export const auditService = {
  async getAll(limit = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase()
      .from('audit_logs')
      .select('*, actor:user_profiles(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('auditService.getAll error:', error.message); return []; }
    return (data || []).map(mapAuditLog);
  },

  async getForClaim(claimId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase()
      .from('audit_logs')
      .select('*, actor:user_profiles(full_name, email, role)')
      .eq('claim_id', claimId)
      .order('created_at');
    if (error) { console.error('getForClaim error:', error.message); return []; }
    return (data || []).map(mapAuditLog);
  },
};

// ─── Audit Logger ─────────────────────────────────────────────
async function logAudit(actorId: string, claimType: string, claimId: string, action: string, oldValue: any, newValue: any) {
  await supabase().from('audit_logs').insert({
    actor_id: actorId,
    claim_type: claimType,
    claim_id: claimId,
    action,
    old_value: oldValue,
    new_value: newValue,
  });
}

// ─── Mappers (snake_case → camelCase) ─────────────────────────
function mapProfile(d: any): UserProfile {
  return {
    id: d.id, email: d.email, fullName: d.full_name,
    employeeId: d.employee_id, grade: d.grade, role: d.role,
    department: d.department || '', costCenter: d.cost_center || '',
    managerId: d.manager_id, departmentHeadId: d.department_head_id,
    bankAccount: d.bank_account, isActive: d.is_active,
    avatarUrl: d.avatar_url, createdAt: d.created_at, updatedAt: d.updated_at,
  };
}

function mapPreClaim(d: any): PreClaim {
  return {
    id: d.id, claimNumber: d.claim_number, employeeId: d.employee_id,
    purpose: d.purpose, description: d.description || '',
    travelFrom: d.travel_from || '', travelTo: d.travel_to || '',
    startDate: d.start_date, endDate: d.end_date, cityTier: d.city_tier,
    estimatedTotal: d.estimated_total || 0, advanceRequested: d.advance_requested || 0,
    advanceSanctioned: d.advance_sanctioned || 0, advanceMode: d.advance_mode,
    status: d.status, policyValidated: d.policy_validated,
    policyWarnings: d.policy_warnings || [], policyBreaches: d.policy_breaches || [],
    justification: d.justification || '', supportingDocs: d.supporting_docs || [],
    currentApprovalLevel: d.current_approval_level || 0,
    convertedToPostClaimId: d.converted_to_post_claim_id,
    createdAt: d.created_at, updatedAt: d.updated_at,
    employee: d.employee ? mapProfile(d.employee) : undefined,
    budgetLines: d.budget_lines ? d.budget_lines.map(mapBudgetLine) : d.pre_claim_budget_lines ? d.pre_claim_budget_lines.map(mapBudgetLine) : undefined,
    approvalSteps: d.approval_steps ? d.approval_steps.map(mapApprovalStep) : undefined,
  };
}

function mapBudgetLine(d: any): PreClaimBudgetLine {
  return {
    id: d.id, preClaimId: d.pre_claim_id, category: d.category,
    estimatedAmount: d.estimated_amount || 0, policyLimit: d.policy_limit,
    withinPolicy: d.within_policy, notes: d.notes || '',
  };
}

function mapPostClaim(d: any): PostClaim {
  return {
    id: d.id, claimNumber: d.claim_number, employeeId: d.employee_id,
    preClaimId: d.pre_claim_id, purpose: d.purpose, description: d.description || '',
    travelFrom: d.travel_from || '', travelTo: d.travel_to || '',
    startDate: d.start_date, endDate: d.end_date, cityTier: d.city_tier,
    totalClaimed: d.total_claimed || 0, totalApproved: d.total_approved || 0,
    advanceTaken: d.advance_taken || 0, settlementType: d.settlement_type,
    settlementAmount: d.settlement_amount || 0, paymentMode: d.payment_mode,
    status: d.status, policyValidated: d.policy_validated,
    policyViolations: d.policy_violations || [],
    currentApprovalLevel: d.current_approval_level || 0,
    financeEntryId: d.finance_entry_id, gstCaptured: d.gst_captured,
    costCenter: d.cost_center || '', paidAt: d.paid_at, closedAt: d.closed_at,
    createdAt: d.created_at, updatedAt: d.updated_at,
    employee: d.employee ? mapProfile(d.employee) : undefined,
    expenseItems: d.expense_items ? d.expense_items.map(mapExpenseItem) : undefined,
    approvalSteps: d.approval_steps ? d.approval_steps.map(mapApprovalStep) : undefined,
    preClaim: d.pre_claim ? mapPreClaim(d.pre_claim) : undefined,
  };
}

function mapExpenseItem(d: any): ExpenseItem {
  return {
    id: d.id, postClaimId: d.post_claim_id, category: d.category,
    vendorName: d.vendor_name || '', billDate: d.bill_date, billNumber: d.bill_number || '',
    amount: d.amount || 0, gstAmount: d.gst_amount || 0, currency: d.currency || 'INR',
    exchangeRate: d.exchange_rate || 1, amountInr: d.amount_inr,
    receiptUrl: d.receipt_url || '', ocrExtracted: d.ocr_extracted,
    ocrData: d.ocr_data || {}, withinPolicy: d.within_policy,
    policyNote: d.policy_note || '', isDuplicate: d.is_duplicate,
    duplicateOf: d.duplicate_of, notes: d.notes || '', createdAt: d.created_at,
  };
}

function mapExceptionClaim(d: any): ExceptionClaim {
  return {
    id: d.id, claimNumber: d.claim_number, employeeId: d.employee_id,
    exceptionType: d.exception_type, purpose: d.purpose, justification: d.justification,
    amount: d.amount || 0, category: d.category, status: d.status,
    policyDeviationFlag: d.policy_deviation_flag, noBillDeclaration: d.no_bill_declaration,
    perDiemLocation: d.per_diem_location || '', perDiemDays: d.per_diem_days || 0,
    perDiemRate: d.per_diem_rate || 0, recurringMonth: d.recurring_month || '',
    corporateCardLast4: d.corporate_card_last4 || '',
    currentApprovalLevel: d.current_approval_level || 0,
    createdAt: d.created_at, updatedAt: d.updated_at,
    employee: d.employee ? mapProfile(d.employee) : undefined,
    approvalSteps: d.approval_steps ? d.approval_steps.map(mapApprovalStep) : undefined,
  };
}

function mapApprovalStep(d: any): ApprovalStep {
  return {
    id: d.id, claimType: d.claim_type, claimId: d.claim_id,
    level: d.level, approverId: d.approver_id, approverRole: d.approver_role,
    action: d.action, comments: d.comments || '', actedAt: d.acted_at,
    escalatedTo: d.escalated_to, createdAt: d.created_at,
    approver: d.approver ? mapProfile(d.approver) : undefined,
  };
}

function mapAuditLog(d: any): AuditLog {
  return {
    id: d.id, actorId: d.actor_id, claimType: d.claim_type, claimId: d.claim_id,
    action: d.action, oldValue: d.old_value || {}, newValue: d.new_value || {},
    ipAddress: d.ip_address || '', userAgent: d.user_agent || '',
    createdAt: d.created_at,
    actor: d.actor ? { fullName: d.actor.full_name, email: d.actor.email, role: d.actor.role } as any : undefined,
  };
}
