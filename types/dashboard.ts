import type { ClientRow, DocumentRow, FinancialRecordRow, LeadRow, TripRow } from "@/types/database"

export type DashboardTone = "success" | "info" | "warning" | "danger" | "default"

export type DashboardSummaryCard = {
  label: string
  value: string
  hint: string
}

export type DashboardMetric = {
  label: string
  value: string
  change: string
  tone: DashboardTone
}

export type DashboardSystemItem = {
  label: string
  status: string
  detail: string
  tone: string
  action: "none" | "future"
}

export type DashboardFeedItem = {
  id: string
  title: string
  detail: string
  time: string
  tone: DashboardTone
  href: string
}

export type DashboardPriorityItem = {
  label: string
  value: string
  hint: string
  href: string
  tone: DashboardTone
}

export type DashboardFinanceRecord = Pick<FinancialRecordRow, "id" | "type" | "status" | "amount" | "category" | "description" | "occurred_at" | "created_at" | "client_id" | "trip_id">

export type AgencyDashboardData = {
  generated_at: string
  summary_cards: DashboardSummaryCard[]
  metrics: DashboardMetric[]
  system_items: DashboardSystemItem[]
  advisor_recommendations: string[]
  operational_feed: DashboardFeedItem[]
  priorities: DashboardPriorityItem[]
  finance_snapshot: {
    total_revenue: number
    total_expenses: number
    balance: number
    pending_revenue: number
    recent_records: DashboardFinanceRecord[]
    note: string
  }
  operation_notes: string[]
  health: {
    tone: DashboardTone
    label: string
    title: string
    description: string
  }
  counts: {
    clients: number
    leads: number
    leads_by_status: Record<string, number>
    active_trips: number
    upcoming_trips: number
    emitted_documents: number
    pending_documents: number
    total_revenue: number
    total_expenses: number
    balance: number
  }
  recent_entities: {
    clients: ClientRow[]
    leads: LeadRow[]
    trips: TripRow[]
    documents: DocumentRow[]
    financial_records: FinancialRecordRow[]
  }
}
