import type { DocumentRow } from "@/types/database"

export type DocumentInput = {
  title: string
  type: string
  status?: string
  client_id?: string | null
  trip_id?: string | null
  storage_path?: string | null
}

export type DocumentResponse = DocumentRow
