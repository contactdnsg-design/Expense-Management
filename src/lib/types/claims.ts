export type EmployeeGrade = 'E1'|'E2'|'E3'|'M1'|'M2'|'M3'|'D1'|'D2'|'VP'|'C';
export type UserRole = 'employee'|'manager'|'finance'|'admin'|'auditor';
export type CityTier = 'tier1'|'tier2'|'tier3'|'international';
export type PreClaimStatus = 'draft'|'submitted'|'under_review'|'approved'|'advance_released'|'converted'|'rejected'|'closed';
export type PostClaimStatus = 'draft'|'submitted'|'under_review'|'approved'|'paid'|'rejected'|'closed';
export type ExceptionClaimStatus = 'submitted'|'escalated'|'approved'|'rejected'|'closed';
export type ClaimCategory = 'travel'|'hotel'|'food'|'transport'|'misc'|'software'|'training'|'entertainment'|'medical'|'per_diem'|'internet'|'mobile'|'corporate_card';
export type ApprovalAction = 'pending'|'approved'|'rejected'|'escalated'|'info_requested';
export type SettlementType = 'reimbursement'|'recovery'|'exact_match'|'advance_adjusted';
export type PaymentMode = 'bank_transfer'|'corporate_card'|'wallet'|'payroll_deduction';
export type ExceptionType = 'no_pre_approval'|'policy_violation'|'lost_bill'|'per_diem'|'recurring'|'corporate_card_reconciliation';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  employeeId?: string;
  grade: EmployeeGrade;
  role: UserRole;
  department: string;
  costCenter: string;
  managerId?: string;
  departmentHeadId?: string;
  bankAccount?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  ruleName: string;
  category: ClaimCategory;
  grade?: EmployeeGrade;
  cityTier?: CityTier;
  dailyLimit?: number;
  perTripLimit?: number;
  perItemLimit?: number;
  requiresReceiptAbove?: number;
  travelClass?: string;
  hotelStarLimit?: number;
  advanceAllowed: boolean;
  maxAdvancePercent: number;
  exceptionThreshold?: number;
  isActive: boolean;
}

export interface PreClaim {
  id: string;
  claimNumber: string;
  employeeId: string;
  purpose: string;
  description: string;
  travelFrom: string;
  travelTo: string;
  startDate?: string;
  endDate?: string;
  cityTier: CityTier;
  estimatedTotal: number;
  advanceRequested: number;
  advanceSanctioned: number;
  advanceMode?: PaymentMode;
  status: PreClaimStatus;
  policyValidated: boolean;
  policyWarnings: any[];
  policyBreaches: any[];
  justification: string;
  supportingDocs: any[];
  currentApprovalLevel: number;
  convertedToPostClaimId?: string;
  createdAt: string;
  updatedAt: string;
  employee?: UserProfile;
  budgetLines?: PreClaimBudgetLine[];
  approvalSteps?: ApprovalStep[];
}

export interface PreClaimBudgetLine {
  id: string;
  preClaimId: string;
  category: ClaimCategory;
  estimatedAmount: number;
  policyLimit?: number;
  withinPolicy: boolean;
  notes: string;
}

export interface PostClaim {
  id: string;
  claimNumber: string;
  employeeId: string;
  preClaimId?: string;
  purpose: string;
  description: string;
  travelFrom: string;
  travelTo: string;
  startDate?: string;
  endDate?: string;
  cityTier: CityTier;
  totalClaimed: number;
  totalApproved: number;
  advanceTaken: number;
  settlementType?: SettlementType;
  settlementAmount: number;
  paymentMode?: PaymentMode;
  status: PostClaimStatus;
  policyValidated: boolean;
  policyViolations: any[];
  currentApprovalLevel: number;
  financeEntryId?: string;
  gstCaptured: boolean;
  costCenter: string;
  paidAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  employee?: UserProfile;
  expenseItems?: ExpenseItem[];
  approvalSteps?: ApprovalStep[];
  preClaim?: PreClaim;
}

export interface ExpenseItem {
  id: string;
  postClaimId: string;
  category: ClaimCategory;
  vendorName: string;
  billDate?: string;
  billNumber: string;
  amount: number;
  gstAmount: number;
  currency: string;
  exchangeRate: number;
  amountInr?: number;
  receiptUrl: string;
  ocrExtracted: boolean;
  ocrData: any;
  withinPolicy: boolean;
  policyNote: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  notes: string;
  createdAt: string;
}

export interface ExceptionClaim {
  id: string;
  claimNumber: string;
  employeeId: string;
  exceptionType: ExceptionType;
  purpose: string;
  justification: string;
  amount: number;
  category?: ClaimCategory;
  status: ExceptionClaimStatus;
  policyDeviationFlag: boolean;
  noBillDeclaration: boolean;
  perDiemLocation: string;
  perDiemDays: number;
  perDiemRate: number;
  recurringMonth: string;
  corporateCardLast4: string;
  currentApprovalLevel: number;
  createdAt: string;
  updatedAt: string;
  employee?: UserProfile;
  approvalSteps?: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  claimType: 'pre_claim'|'post_claim'|'exception';
  claimId: string;
  level: number;
  approverId?: string;
  approverRole: string;
  action: ApprovalAction;
  comments: string;
  actedAt?: string;
  escalatedTo?: string;
  createdAt: string;
  approver?: UserProfile;
}

export interface AdvanceLedger {
  id: string;
  preClaimId: string;
  employeeId: string;
  amount: number;
  mode: PaymentMode;
  disbursedAt?: string;
  referenceNumber: string;
  settled: boolean;
  settledAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  claimType?: string;
  claimId?: string;
  action: string;
  oldValue: any;
  newValue: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  actor?: UserProfile;
}
