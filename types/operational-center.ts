import type { AuditLogRow, CreditTransactionRow, NotificationRow, ReportRow, TaskRow } from "@/types/database"

export type OperationalTone = "success" | "info" | "warning" | "danger" | "default"

export type OperationalFeedItem = {
  id: string
  title: string
  detail: string
  time: string
  tone: OperationalTone
  href: string
  origin: string
}

export type OperationalPriorityItem = {
  id: string
  label: string
  value: string
  hint: string
  href: string
  tone: OperationalTone
}

export type OperationalStatusItem = {
  label: string
  value: string
  detail: string
  tone: OperationalTone
}

export type CentralOperationalData = {
  generated_at: string
  priorities: OperationalPriorityItem[]
  feed: OperationalFeedItem[]
  statuses: OperationalStatusItem[]
  notifications: NotificationRow[]
  tasks: TaskRow[]
  reports: ReportRow[]
  recent_credits: CreditTransactionRow[]
  recent_audit_logs: AuditLogRow[]
}
