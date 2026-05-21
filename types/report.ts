import type { ReportRow } from "@/types/database"

export type ReportInput = {
  name: string
  type: string
  status?: string
  filters?: ReportRow["filters"]
  result_path?: string | null
}

export type ReportResponse = ReportRow
