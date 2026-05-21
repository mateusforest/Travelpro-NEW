export type ReportMetricTone = "default" | "success" | "warning" | "danger" | "info"

export type ReportMetricCard = {
  label: string
  value: string
  detail?: string
  tone?: ReportMetricTone
}

export type ReportExecutiveSummary = {
  title: string
  lines: string[]
}

export type ReportTableData = {
  headers: string[]
  rows: string[][]
}

export type ReportSectionBlock =
  | {
      kind: "table"
      title: string
      description?: string
      table: ReportTableData
    }
  | {
      kind: "notes"
      title: string
      description?: string
      notes: string[]
    }
  | {
      kind: "metrics"
      title: string
      description?: string
      metrics: ReportMetricCard[]
    }

export type ReportDocumentData = {
  id: string
  type: string
  title: string
  subtitle: string
  period: string
  generatedAt: string
  agencyName: string
  agencyCity?: string | null
  agencyPhone?: string | null
  summary: ReportExecutiveSummary
  metrics: ReportMetricCard[]
  sections: ReportSectionBlock[]
  footerNote?: string
}
