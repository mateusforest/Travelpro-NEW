import type { ReportRow } from "@/types/database"

export type ReportTemplateSummary = {
  id: string
  title: string
  description: string
  href: string
  metric: string
}

export type ReportsOverviewData = {
  templates: ReportTemplateSummary[]
  recent_reports: ReportRow[]
  preview: {
    title: string
    lines: string[]
  }
}
