import type { AuditLogRow, CreditTransactionRow, NotificationRow, PaymentRow } from "@/types/database"

export type MasterStatusTone = "success" | "warning" | "danger" | "info" | "default"

export type MasterAgencyMemberSummary = {
  id: string
  full_name: string
  email: string
  role: string
  status: string
}

export type MasterAgencyActivity = {
  id: string
  action: string
  entity: string
  status: string
  created_at: string
}

export type MasterAgencyListItem = {
  id: string
  name: string
  slug: string | null
  owner_name: string | null
  owner_email: string | null
  phone: string | null
  status: string
  city: string | null
  requested_plan: string | null
  current_plan: string | null
  subscription_status: string | null
  subscription_price: number | null
  renews_at: string | null
  members_count: number
  members: MasterAgencyMemberSummary[]
  credits_balance: number
  credits_consumed: number
  payments_total: number
  last_payment_status: string | null
  created_at: string
  updated_at: string
  recent_activity: MasterAgencyActivity[]
}

export type MasterAgencyDetail = MasterAgencyListItem & {
  audit_logs: AuditLogRow[]
}

export type MasterAgencyInput = {
  name: string
  owner_name?: string | null
  owner_email?: string | null
  phone?: string | null
  status?: string | null
  city?: string | null
  requested_plan?: string | null
  modules?: string | null
  notes?: string | null
}

export type MasterAgencyOverview = {
  items: MasterAgencyListItem[]
  summary: {
    total: number
    active: number
    inactive: number
    with_subscription: number
    total_credit_balance: number
  }
}

export type MasterUserListItem = {
  id: string
  user_id: string
  full_name: string | null
  email: string
  role: string
  status: string
  phone: string | null
  agency_id: string | null
  agency_name: string | null
  member_role: string | null
  member_status: string | null
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export type MasterUserDetail = MasterUserListItem & {
  audit_logs: AuditLogRow[]
}

export type MasterUserInput = {
  role?: string | null
  status?: string | null
}

export type MasterUserOverview = {
  items: MasterUserListItem[]
  summary: {
    total: number
    active: number
    masters: number
    agency_linked: number
  }
}

export type MasterFinancePaymentItem = PaymentRow & {
  agency_name: string | null
  plan_code: string | null
}

export type MasterFinanceOverview = {
  totals: {
    payments_count: number
    payments_total: number
    paid_total: number
    active_subscriptions: number
    revenue_records_total: number
    expense_records_total: number
    credits_sold: number
    credits_consumed: number
  }
  billing_status: {
    paid: number
    pending: number
    overdue: number
    other: number
  }
  recent_payments: MasterFinancePaymentItem[]
}

export type MasterDashboardOverview = {
  agencies_total: number
  agencies_active: number
  users_total: number
  payments_total: number
  paid_total: number
  credits_sold: number
  credits_consumed: number
  top_credit_agency_name: string | null
  top_credit_agency_consumption: number
  ai_status_label: string
  ai_related_logs: number
  whatsapp_status_label: string
  whatsapp_connected_agencies: number
  reports_total: number
  templates_active: number
  templates_official: number
  agencies_with_subscription: number
  total_credit_balance: number
  active_subscriptions: number
  revenue_records_total: number
  expense_records_total: number
  billing_status: {
    paid: number
    pending: number
    overdue: number
    other: number
  }
  top_agencies: Array<{
    id: string
    name: string
    status: string
    current_plan: string | null
    members_count: number
    credits_consumed: number
    credits_balance: number
    payments_total: number
  }>
  recent_payments: Array<{
    id: string
    agency_name: string | null
    amount: number
    status: string
    paid_at: string | null
    payment_method: string | null
  }>
  recent_reports: Array<{
    id: string
    name: string
    type: string
    status: string
    agency_name: string | null
    created_at: string
  }>
  credit_logs: Array<{
    id: string
    title: string
    detail: string
    agency_name: string | null
    source: string
    status: string
    created_at: string
  }>
  whatsapp_agencies: Array<{
    agency_id: string
    agency_name: string
    whatsapp_status: string
    go_status: string
    agent_status: string
    last_event_at: string | null
  }>
  report_mix: Array<{ label: string; value: number }>
  template_mix: Array<{ label: string; value: number }>
}

export type MasterAiCreditAgencyItem = {
  agency_id: string
  agency_name: string
  agency_status: string
  plan_code: string | null
  credit_balance: number
  credits_granted: number
  credits_consumed: number
  transactions_count: number
  last_transaction_at: string | null
  top_feature: string | null
}

export type MasterAiCreditLogItem = {
  id: string
  agency_id: string | null
  agency_name: string | null
  title: string
  detail: string
  source: "audit" | "notification" | "report"
  status: string
  created_at: string
}

export type MasterAiCreditOverview = {
  summary: {
    agencies_with_usage: number
    total_balance: number
    credits_sold: number
    credits_consumed: number
    estimated_cost_total: number | null
    ai_related_logs: number
  }
  ranking: MasterAiCreditAgencyItem[]
  recent_transactions: Array<CreditTransactionRow & { agency_name: string | null; plan_code: string | null }>
  logs: MasterAiCreditLogItem[]
}

export type MasterWhatsAppAgencyItem = {
  agency_id: string
  agency_name: string
  agency_status: string
  whatsapp_status: string
  go_status: string
  agent_status: string
  contact_number: string | null
  last_event_at: string | null
}

export type MasterWhatsAppOverview = {
  summary: {
    configured_agencies: number
    agencies_with_events: number
    notifications_count: number
    audit_logs_count: number
  }
  agencies: MasterWhatsAppAgencyItem[]
  notifications: NotificationRow[]
  logs: AuditLogRow[]
}

export type MasterReportItem = {
  id: string
  name: string
  type: string
  status: string
  agency_id: string | null
  agency_name: string | null
  origin: string
  created_at: string
  updated_at: string
  result_path: string | null
}

export type MasterReportDetail = MasterReportItem & {
  preview_lines: string[]
}

export type MasterReportOverview = {
  summary: {
    total: number
    agencies_with_reports: number
    export_count: number
    recent_count: number
  }
  by_type: Array<{ label: string; count: number }>
  by_agency: Array<{ agency_id: string | null; agency_name: string; count: number }>
  recent_reports: MasterReportItem[]
  items: MasterReportItem[]
}

export type MasterTemplateType = "Documento" | "Relatorio" | "Roteiro" | "Cotacao" | "Catalogo"

export type MasterTemplateItem = {
  id: string
  agency_id: string
  agency_name: string | null
  title: string
  status: string
  template_type: MasterTemplateType
  category: string | null
  description: string | null
  version: string | null
  pricing_tier: string | null
  file_name: string | null
  is_official: boolean
  compatibilities: string[]
  customizable_fields: string[]
  updated_at: string
  created_at: string
}

export type MasterTemplateDetail = MasterTemplateItem & {
  variables: string[]
  audit_logs: AuditLogRow[]
}

export type MasterTemplateInput = {
  agency_id: string
  title: string
  status?: string
  template_type: MasterTemplateType
  category?: string | null
  description?: string | null
  version?: string | null
  pricing_tier?: string | null
  file_name?: string | null
  is_official?: boolean
  compatibilities?: string[]
  customizable_fields?: string[]
  variables?: string[]
}

export type MasterTemplateOverview = {
  summary: {
    total: number
    active: number
    official: number
    agencies_using: number
  }
  by_type: Array<{ label: string; count: number }>
  recent_activity: Array<{ id: string; title: string; description: string; created_at: string }>
  items: MasterTemplateItem[]
}
