import type { Json } from "@/types/database"

export const DOCUMENT_KINDS = [
  "Documento geral",
  "Contrato",
  "Voucher",
  "Recibo",
  "Passagem",
  "Template",
  "Roteiro",
  "Cotação",
] as const

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]
export type DocumentWorkspaceKind = "document" | "roteiro" | "cotacao" | "template"

const GENERAL_DOCUMENT_KINDS = new Set<DocumentKind>([
  "Documento geral",
  "Contrato",
  "Voucher",
  "Recibo",
  "Passagem",
])

function normalizeKey(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function normalizeDocumentType(value?: string | null): DocumentKind {
  const normalized = normalizeKey(value)

  if (!normalized || normalized === "documento geral" || normalized === "documento" || normalized === "general document" || normalized === "document") {
    return "Documento geral"
  }

  if (["contrato", "contract", "contracts"].includes(normalized)) return "Contrato"
  if (["voucher", "vouchers"].includes(normalized)) return "Voucher"
  if (["recibo", "recibos", "receipt", "receipts"].includes(normalized)) return "Recibo"
  if (["passagem", "passagens", "ticket", "tickets", "air ticket", "flight ticket"].includes(normalized)) return "Passagem"
  if (["template", "templates"].includes(normalized)) return "Template"
  if (["roteiro", "roteiros", "itinerary", "itineraries"].includes(normalized)) return "Roteiro"
  if (["cotacao", "cotacoes", "quote", "quotes", "proposta", "propostas"].includes(normalized)) return "Cotação"

  return "Documento geral"
}

export function getDocumentWorkspaceKind(type: string): DocumentWorkspaceKind {
  const canonical = normalizeDocumentType(type)
  if (canonical === "Roteiro") return "roteiro"
  if (canonical === "Cotação") return "cotacao"
  if (canonical === "Template") return "template"
  return "document"
}

export function isGeneralDocumentKind(type: string) {
  return GENERAL_DOCUMENT_KINDS.has(normalizeDocumentType(type))
}

export function getDocumentTypeOptions(): DocumentKind[] {
  return [...DOCUMENT_KINDS]
}

export function getOperationalDocumentTypeOptions(): DocumentKind[] {
  return [...GENERAL_DOCUMENT_KINDS]
}

export function matchesDocumentSection(type: string, mode: DocumentWorkspaceKind, filterType?: string | null) {
  const canonical = normalizeDocumentType(type)
  const filterCanonical = filterType ? normalizeDocumentType(filterType) : null

  if (mode === "roteiro") return canonical === "Roteiro"
  if (mode === "cotacao") return canonical === "Cotação"
  if (mode === "template") return canonical === "Template"
  if (filterCanonical) return canonical === filterCanonical
  return GENERAL_DOCUMENT_KINDS.has(canonical)
}

export function decorateDocumentMetadata(metadata: Json | undefined, type: string): Json {
  const canonical = normalizeDocumentType(type)
  const source = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? (metadata as Record<string, Json | undefined>) : {}

  return {
    ...source,
    document_kind: canonical,
    document_group: getDocumentWorkspaceKind(canonical),
  }
}
