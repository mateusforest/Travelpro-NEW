import type { DocumentRow } from "@/types/database"
import type { DocumentKind } from "@/lib/documents/document-kind"

export type DocumentInput = {
  title: string
  type: DocumentKind | string
  status?: string
  client_id?: string | null
  trip_id?: string | null
  storage_bucket?: string | null
  storage_path?: string | null
  metadata?: DocumentRow["metadata"]
}

export type DocumentResponse = DocumentRow
