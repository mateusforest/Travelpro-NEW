import type { FinancialRecordRow } from "@/types/database"

export const FINANCE_PERIODS = ["Hoje", "Semana", "Mês", "Trimestre", "Ano", "Personalizado"] as const
export const FINANCE_FILTERS = ["Todos", "Receita", "Despesa", "A receber", "Pendente", "Pago", "Cancelado"] as const
export const FINANCE_TYPE_OPTIONS = ["Receita", "Despesa"] as const
export const FINANCE_STATUS_OPTIONS = ["Pendente", "Pago", "A receber", "Cancelado"] as const
export const FINANCE_PLAN_OPTIONS = ["Único", "Parcelado", "Recorrente mensal"] as const

export const FINANCE_CATEGORY_OPTIONS = {
  Receita: ["Pacote vendido", "Comissão", "Serviço avulso", "Taxa de consultoria", "Sinal/entrada", "Parcela recebida", "Outro"],
  Despesa: ["Operadora", "Fornecedor", "Marketing", "Plataforma/SaaS", "Comissão", "Reembolso", "Impostos", "Taxas", "Outro"],
} as const

export type FinancePeriod = (typeof FINANCE_PERIODS)[number]
export type FinanceViewFilter = (typeof FINANCE_FILTERS)[number]
export type FinanceType = (typeof FINANCE_TYPE_OPTIONS)[number]
export type FinanceStatus = (typeof FINANCE_STATUS_OPTIONS)[number]
export type FinancePlanMode = (typeof FINANCE_PLAN_OPTIONS)[number]

export type FinanceCreatePlan = {
  mode: FinancePlanMode
  installments: number
  recurrenceCount: number
}

export type FinanceDateRange = {
  start: Date | null
  end: Date | null
}

type FinanceSeriesPoint = {
  label: string
  value: number
  expenses: number
  profit: number
}

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function normalizeFinanceType(value?: string | null): FinanceType {
  return normalize(value).includes("desp") ? "Despesa" : "Receita"
}

export function normalizeFinanceStatus(value?: string | null): FinanceStatus {
  const input = normalize(value)
  if (input.includes("pago")) return "Pago"
  if (input.includes("receber")) return "A receber"
  if (input.includes("cancel")) return "Cancelado"
  return "Pendente"
}

export function getFinanceCategoryOptions(type: string) {
  return [...FINANCE_CATEGORY_OPTIONS[normalizeFinanceType(type)]]
}

export function getFinanceRecordDate(record: FinancialRecordRow) {
  return record.occurred_at || record.created_at
}

function parseDate(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function startOfDay(value: Date) {
  const next = new Date(value)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(value: Date) {
  const next = new Date(value)
  next.setHours(23, 59, 59, 999)
  return next
}

function addDays(value: Date, amount: number) {
  const next = new Date(value)
  next.setDate(next.getDate() + amount)
  return next
}

function addMonths(value: Date, amount: number) {
  const next = new Date(value)
  next.setMonth(next.getMonth() + amount)
  return next
}

export function addMonthsIso(value: string, amount: number) {
  const base = new Date(`${value}T00:00:00`)
  if (Number.isNaN(base.getTime())) return value
  return addMonths(base, amount).toISOString()
}

export function resolveFinanceDateRange(period: FinancePeriod, options?: { startDate?: string; endDate?: string }): FinanceDateRange {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  if (period === "Hoje") return { start: todayStart, end: todayEnd }
  if (period === "Semana") return { start: startOfDay(addDays(now, -6)), end: todayEnd }
  if (period === "Mês") return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: todayEnd }
  if (period === "Trimestre") {
    const quarterStart = Math.floor(now.getMonth() / 3) * 3
    return { start: new Date(now.getFullYear(), quarterStart, 1), end: todayEnd }
  }
  if (period === "Ano") return { start: new Date(now.getFullYear(), 0, 1), end: todayEnd }

  const start = options?.startDate ? parseDate(`${options.startDate}T00:00:00`) : null
  const endBase = options?.endDate ? parseDate(`${options.endDate}T23:59:59.999`) : null
  return { start, end: endBase }
}

export function isFinancialRecordInRange(record: FinancialRecordRow, range: FinanceDateRange) {
  const parsed = parseDate(getFinanceRecordDate(record))
  if (!parsed) return false
  if (range.start && parsed.getTime() < range.start.getTime()) return false
  if (range.end && parsed.getTime() > range.end.getTime()) return false
  return true
}

export function matchesFinanceFilter(record: FinancialRecordRow, filter: string) {
  if (!filter || filter === "Todos") return true

  const normalizedFilter = normalize(filter)
  const normalizedType = normalize(record.type)
  const normalizedStatus = normalize(record.status)

  if (normalizedFilter === "receita") return normalizedType.includes("receit")
  if (normalizedFilter === "despesa") return normalizedType.includes("desp")
  if (normalizedFilter === "a receber") return normalizedStatus.includes("receber")
  if (normalizedFilter === "pendente") return normalizedStatus.includes("pend")
  if (normalizedFilter === "pago") return normalizedStatus.includes("pago")
  if (normalizedFilter === "cancelado") return normalizedStatus.includes("cancel")

  return [record.type, record.status, record.category ?? "", record.description ?? ""].some((value) => normalize(value).includes(normalizedFilter))
}

function splitAmountAcrossInstallments(total: number, count: number) {
  const totalCents = Math.round(total * 100)
  const base = Math.floor(totalCents / count)
  const remainder = totalCents - base * count

  return Array.from({ length: count }, (_, index) => ((base + (index < remainder ? 1 : 0)) / 100))
}

export function buildPlannedFinancialEntries(
  base: {
    type: string
    amount: number
    status: string
    client_id?: string | null
    trip_id?: string | null
    category?: string | null
    description?: string | null
    occurred_at: string
  },
  plan: FinanceCreatePlan,
) {
  const type = normalizeFinanceType(base.type)
  const status = normalizeFinanceStatus(base.status)
  const normalizedMode = plan.mode || "Único"

  if (normalizedMode === "Parcelado" && plan.installments > 1) {
    const amounts = splitAmountAcrossInstallments(base.amount, plan.installments)
    return amounts.map((amount, index) => ({
      ...base,
      type,
      status,
      amount,
      occurred_at: addMonthsIso(base.occurred_at, index),
      description: `${base.description?.trim() || base.category || type} • Parcela ${index + 1}/${plan.installments}`,
    }))
  }

  if (normalizedMode === "Recorrente mensal" && plan.recurrenceCount > 1) {
    return Array.from({ length: plan.recurrenceCount }, (_, index) => ({
      ...base,
      type,
      status,
      occurred_at: addMonthsIso(base.occurred_at, index),
      description: `${base.description?.trim() || base.category || type} • Recorrência ${index + 1}/${plan.recurrenceCount}`,
    }))
  }

  return [
    {
      ...base,
      type,
      status,
      description: base.description?.trim() || null,
    },
  ]
}

function formatSeriesLabel(date: Date, mode: "day" | "month") {
  return new Intl.DateTimeFormat("pt-BR", mode === "day" ? { day: "2-digit", month: "2-digit" } : { month: "short" }).format(date)
}

export function buildFinanceChartSeries(records: FinancialRecordRow[], period: FinancePeriod, range: FinanceDateRange): FinanceSeriesPoint[] {
  if (records.length === 0) return []

  const useMonthlyBuckets =
    period === "Trimestre" ||
    period === "Ano" ||
    (period === "Personalizado" && range.start && range.end && range.end.getTime() - range.start.getTime() > 45 * 24 * 60 * 60 * 1000)

  const buckets = new Map<string, FinanceSeriesPoint>()

  records.forEach((record) => {
    const date = parseDate(getFinanceRecordDate(record))
    if (!date) return

    const bucketDate = useMonthlyBuckets ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const bucketKey = bucketDate.toISOString()
    const existing = buckets.get(bucketKey) ?? { label: formatSeriesLabel(bucketDate, useMonthlyBuckets ? "month" : "day"), value: 0, expenses: 0, profit: 0 }

    if (normalizeFinanceType(record.type) === "Receita") {
      existing.value += Number(record.amount || 0)
    } else {
      existing.expenses += Number(record.amount || 0)
    }

    existing.profit = existing.value - existing.expenses
    buckets.set(bucketKey, existing)
  })

  return Array.from(buckets.entries())
    .sort(([left], [right]) => new Date(left).getTime() - new Date(right).getTime())
    .map(([, point]) => ({
      label: point.label,
      value: Number(point.value.toFixed(2)),
      expenses: Number(point.expenses.toFixed(2)),
      profit: Number(point.profit.toFixed(2)),
    }))
}
