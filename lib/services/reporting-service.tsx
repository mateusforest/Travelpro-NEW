import { getCatalogAgencyProfile } from "@/lib/services/catalog-service"
import { listClients } from "@/lib/services/client-service"
import { listCreditTransactions } from "@/lib/services/credit-service"
import { listDocuments } from "@/lib/services/document-service"
import { listFinancialRecords } from "@/lib/services/finance-service"
import { listLeads } from "@/lib/services/lead-service"
import { getReportById, updateReport } from "@/lib/services/report-service"
import { listTrips } from "@/lib/services/trip-service"
import type { AgencyAccessContext, CreditTransactionRow, FinancialRecordRow } from "@/types/database"
import type { ReportDocumentData, ReportMetricCard, ReportSectionBlock } from "@/types/reporting"

export type ReportBuildOptions = {
  startDate?: string | null
  endDate?: string | null
  financeFilter?: string | null
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return "Nao informado"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed)
}

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function startOfDay(value: Date) {
  const result = new Date(value)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(value: Date) {
  const result = new Date(value)
  result.setHours(23, 59, 59, 999)
  return result
}

function shiftDays(value: Date, days: number) {
  const result = new Date(value)
  result.setDate(result.getDate() + days)
  return result
}

function shiftMonths(value: Date, months: number) {
  const result = new Date(value)
  result.setMonth(result.getMonth() + months, 1)
  return result
}

function parseDateInput(value?: string | null) {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function resolvePeriodRange(period: string, options: ReportBuildOptions) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const normalized = normalize(period)

  if (normalized === "hoje") {
    return { start: todayStart, end: todayEnd }
  }

  if (normalized.includes("7")) {
    return { start: startOfDay(shiftDays(now, -6)), end: todayEnd }
  }

  if (normalized.includes("30")) {
    return { start: startOfDay(shiftDays(now, -29)), end: todayEnd }
  }

  if (normalized.includes("este mes")) {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: todayEnd }
  }

  if (normalized.includes("ultimo mes")) {
    const start = shiftMonths(new Date(now.getFullYear(), now.getMonth(), 1), -1)
    const end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
    return { start, end }
  }

  if (normalized.includes("trimestre")) {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    return { start: new Date(now.getFullYear(), quarterStartMonth, 1), end: todayEnd }
  }

  if (normalized.includes("ano")) {
    return { start: new Date(now.getFullYear(), 0, 1), end: todayEnd }
  }

  if (normalized.includes("personalizado")) {
    const start = parseDateInput(options.startDate)
    const endBase = parseDateInput(options.endDate)

    if (start || endBase) {
      return {
        start: start ? startOfDay(start) : null,
        end: endBase ? endOfDay(endBase) : null,
      }
    }
  }

  return { start: startOfDay(shiftDays(now, -29)), end: todayEnd }
}

function isWithinRange(value: string | null | undefined, range: { start: Date | null; end: Date | null }) {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  if (range.start && parsed.getTime() < range.start.getTime()) return false
  if (range.end && parsed.getTime() > range.end.getTime()) return false
  return true
}

function signedCreditAmount(row: CreditTransactionRow) {
  const normalizedType = normalize(row.type)
  if (normalizedType.includes("grant") || normalizedType.includes("bonus") || normalizedType.includes("credit") || normalizedType.includes("entrada")) return Number(row.amount || 0)
  if (normalizedType.includes("consumo") || normalizedType.includes("debit") || normalizedType.includes("uso")) return Number(row.amount || 0) * -1
  return Number(row.amount || 0)
}

function isRevenue(type: string) {
  return normalize(type).includes("receit")
}

function isExpense(type: string) {
  return normalize(type).includes("desp")
}

function isPublishedLike(status: string) {
  const normalizedStatus = normalize(status)
  return normalizedStatus.includes("pronto") || normalizedStatus.includes("emit") || normalizedStatus.includes("public")
}

function normalizeReportType(type: string) {
  const normalizedType = normalize(type)
  if (normalizedType.includes("cliente")) return "Clientes"
  if (normalizedType.includes("lead")) return "Leads"
  if (normalizedType.includes("viagem") || normalizedType.includes("embarque")) return "Viagens"
  if (normalizedType.includes("document")) return "Documentos"
  if (normalizedType.includes("receita") || normalizedType.includes("despesa") || normalizedType.includes("finance")) return "Financeiro"
  if (normalizedType.includes("credito")) return "Creditos"
  return "Operacao geral"
}

function matchesFinanceFilter(record: FinancialRecordRow, financeFilter?: string | null) {
  if (!financeFilter || financeFilter === "Todos") return true

  const filter = normalize(financeFilter)
  return [record.type, record.status, record.category ?? "", record.description ?? ""].some((value) => normalize(value).includes(filter))
}

function buildRangeLabel(period: string, options: ReportBuildOptions) {
  if (period !== "Personalizado") return period

  const start = options.startDate ? formatDate(options.startDate) : "inicio aberto"
  const end = options.endDate ? formatDate(options.endDate) : "fim aberto"
  return `Personalizado (${start} ate ${end})`
}

export async function buildReportDocumentData(
  context: AgencyAccessContext,
  type: string,
  period: string,
  options: ReportBuildOptions = {},
): Promise<ReportDocumentData> {
  const [agency, clients, leads, trips, documents, financialRecords, credits] = await Promise.all([
    getCatalogAgencyProfile(context),
    listClients(context),
    listLeads(context),
    listTrips(context),
    listDocuments(context),
    listFinancialRecords(context),
    listCreditTransactions(context),
  ])

  const normalizedType = normalizeReportType(type)
  const range = resolvePeriodRange(period, options)
  const displayPeriod = buildRangeLabel(period, options)

  const recentClients = clients.filter((item) => isWithinRange(item.created_at, range))
  const recentLeads = leads.filter((item) => isWithinRange(item.created_at, range))
  const recentTrips = trips.filter((item) => isWithinRange(item.created_at, range))
  const recentDocuments = documents.filter((item) => isWithinRange(item.created_at, range))
  const recentCredits = credits.filter((item) => isWithinRange(item.created_at, range))
  const periodFinancials = financialRecords.filter((item) => isWithinRange(item.occurred_at || item.created_at, range))
  const scopedFinancials = periodFinancials.filter((item) => matchesFinanceFilter(item, options.financeFilter))

  const totalRevenue = financialRecords.filter((item) => isRevenue(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpenses = financialRecords.filter((item) => isExpense(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const creditBalance = credits.reduce((sum, item) => sum + signedCreditAmount(item), 0)
  const activeTrips = trips.filter((item) => normalize(item.status).includes("andamento") || normalize(item.status).includes("confirm"))
  const pendingDocuments = documents.filter((item) => !isPublishedLike(item.status))
  const upcomingTrips = trips.filter((item) => item.starts_at && new Date(item.starts_at).getTime() >= Date.now())

  const scopedRevenue = scopedFinancials.filter((item) => isRevenue(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const scopedExpenses = scopedFinancials.filter((item) => isExpense(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const financeFilterLabel = options.financeFilter && options.financeFilter !== "Todos" ? options.financeFilter : null

  const commonMetrics: ReportMetricCard[] = [
    { label: "Clientes", value: String(clients.length), detail: `${recentClients.length} no periodo`, tone: "info" },
    { label: "Leads", value: String(leads.length), detail: `${recentLeads.length} no periodo`, tone: "warning" },
    { label: "Viagens ativas", value: String(activeTrips.length), detail: `${upcomingTrips.length} embarques futuros`, tone: "success" },
    { label: "Saldo", value: formatMoney(totalRevenue - totalExpenses), detail: `${credits.length} movimentos de credito`, tone: totalRevenue - totalExpenses >= 0 ? "success" : "danger" },
  ]

  const sectionsByType: Record<string, ReportSectionBlock[]> = {
    Clientes: [
      {
        kind: "table",
        title: "Clientes recentes",
        description: "Base real de clientes vinculados a agencia.",
        table: {
          headers: ["Nome", "Email", "Telefone", "Status", "Criado em"],
          rows: recentClients.slice(0, 12).map((item) => [item.name, item.email || "Nao informado", item.phone || "Nao informado", item.status, formatDate(item.created_at)]),
        },
      },
      {
        kind: "notes",
        title: "Leitura executiva",
        notes: [
          `${clients.length} clientes cadastrados no total.`,
          `${recentClients.length} clientes criados dentro do recorte selecionado.`,
          `A operacao mantem ${clients.filter((item) => normalize(item.status).includes("ativo")).length} clientes ativos.`,
        ],
      },
    ],
    Leads: [
      {
        kind: "metrics",
        title: "Funil comercial",
        description: "Leitura simples do pipeline real.",
        metrics: [
          { label: "Novos", value: String(leads.filter((item) => normalize(item.status).includes("novo")).length), tone: "warning" },
          { label: "Qualificacao", value: String(leads.filter((item) => normalize(item.status).includes("qual")).length), tone: "info" },
          { label: "Quentes", value: String(leads.filter((item) => normalize(item.temperature || "").includes("quente")).length), tone: "success" },
          { label: "No periodo", value: String(recentLeads.length), tone: "default" },
        ],
      },
      {
        kind: "table",
        title: "Leads recentes",
        table: {
          headers: ["Nome", "Origem", "Destino", "Status", "Criado em"],
          rows: recentLeads.slice(0, 12).map((item) => [item.name, item.origin || "Nao informado", item.destination || "Em definicao", item.status, formatDate(item.created_at)]),
        },
      },
    ],
    Viagens: [
      {
        kind: "table",
        title: "Proximos embarques",
        description: "Viagens futuras que merecem atencao operacional.",
        table: {
          headers: ["Destino", "Status", "Embarque", "Retorno", "Resumo"],
          rows: upcomingTrips.slice(0, 12).map((item) => [item.destination, item.status || "Planejamento", formatDate(item.starts_at), formatDate(item.ends_at), item.summary || "Sem resumo"]),
        },
      },
      {
        kind: "notes",
        title: "Panorama de viagens",
        notes: [
          `${trips.length} viagens registradas na base.`,
          `${recentTrips.length} viagens criadas dentro do periodo.`,
          `${activeTrips.length} viagens em andamento ou confirmadas.`,
        ],
      },
    ],
    Documentos: [
      {
        kind: "metrics",
        title: "Status documental",
        metrics: [
          { label: "Emitidos", value: String(documents.filter((item) => isPublishedLike(item.status)).length), tone: "success" },
          { label: "Pendentes", value: String(pendingDocuments.length), tone: "warning" },
          { label: "No periodo", value: String(recentDocuments.length), tone: "info" },
          { label: "Total", value: String(documents.length), tone: "default" },
        ],
      },
      {
        kind: "table",
        title: "Documentos recentes",
        table: {
          headers: ["Titulo", "Tipo", "Status", "Criado em", "Atualizado em"],
          rows: recentDocuments.slice(0, 12).map((item) => [item.title, item.type, item.status, formatDate(item.created_at), formatDate(item.updated_at)]),
        },
      },
    ],
    Financeiro: [
      {
        kind: "metrics",
        title: "Resumo financeiro",
        description: financeFilterLabel ? `Recorte aplicado automaticamente a partir do Financeiro: ${financeFilterLabel}.` : "Receitas, despesas, saldo e volume operacional do recorte selecionado.",
        metrics: [
          { label: "Receitas", value: formatMoney(scopedRevenue), tone: "success" },
          { label: "Despesas", value: formatMoney(scopedExpenses), tone: "danger" },
          { label: "Saldo", value: formatMoney(scopedRevenue - scopedExpenses), tone: scopedRevenue - scopedExpenses >= 0 ? "success" : "warning" },
          { label: "Lancamentos", value: String(scopedFinancials.length), tone: "info" },
        ],
      },
      {
        kind: "table",
        title: financeFilterLabel ? `Movimentacoes recentes - ${financeFilterLabel}` : "Movimentacoes recentes",
        table: {
          headers: ["Categoria", "Tipo", "Status", "Valor", "Data"],
          rows: scopedFinancials.slice(0, 12).map((item) => [item.category || "Sem categoria", item.type, item.status, formatMoney(Number(item.amount || 0)), formatDate(item.occurred_at)]),
        },
      },
    ],
    Creditos: [
      {
        kind: "metrics",
        title: "Uso de creditos",
        metrics: [
          { label: "Saldo", value: String(creditBalance), tone: creditBalance > 0 ? "success" : "warning" },
          { label: "Movimentos", value: String(credits.length), tone: "info" },
          { label: "Consumo no periodo", value: String(recentCredits.filter((item) => signedCreditAmount(item) < 0).reduce((sum, item) => sum + Math.abs(signedCreditAmount(item)), 0)), tone: "warning" },
          { label: "Recargas", value: String(recentCredits.filter((item) => signedCreditAmount(item) > 0).reduce((sum, item) => sum + signedCreditAmount(item), 0)), tone: "success" },
        ],
      },
      {
        kind: "table",
        title: "Historico recente",
        table: {
          headers: ["Feature", "Origem", "Tipo", "Quantidade", "Criado em"],
          rows: recentCredits.slice(0, 12).map((item) => [item.feature || "Operacao geral", item.source || "Sem origem", item.type, String(item.amount), formatDate(item.created_at)]),
        },
      },
    ],
    "Operacao geral": [
      {
        kind: "metrics",
        title: "Leitura cruzada",
        metrics: commonMetrics,
      },
      {
        kind: "table",
        title: "Ultimos leads e clientes",
        table: {
          headers: ["Tipo", "Nome", "Status", "Contexto", "Criado em"],
          rows: [
            ...recentClients.slice(0, 6).map((item) => ["Cliente", item.name, item.status, item.email || item.phone || "Sem contato", formatDate(item.created_at)]),
            ...recentLeads.slice(0, 6).map((item) => ["Lead", item.name, item.status, item.destination || item.origin || "Sem contexto", formatDate(item.created_at)]),
          ].slice(0, 12),
        },
      },
      {
        kind: "table",
        title: "Frente operacional",
        table: {
          headers: ["Modulo", "Total", "Recorte", "Sinal"],
          rows: [
            ["Viagens", String(trips.length), `${recentTrips.length} no periodo`, `${upcomingTrips.length} proximos embarques`],
            ["Documentos", String(documents.length), `${recentDocuments.length} no periodo`, `${pendingDocuments.length} pendentes`],
            ["Financeiro", String(financialRecords.length), `${periodFinancials.length} movimentos`, formatMoney(totalRevenue - totalExpenses)],
            ["Creditos", String(credits.length), `${recentCredits.length} movimentos`, `${creditBalance} de saldo`],
          ],
        },
      },
    ],
  }

  const sections = sectionsByType[normalizedType] ?? sectionsByType["Operacao geral"]
  const title = normalizedType === "Operacao geral" ? "Relatorio operacional" : `Relatorio de ${normalizedType.toLowerCase()}`
  const subtitleMap: Record<string, string> = {
    Clientes: "Base de clientes, entradas recentes e leitura de relacionamento da agencia.",
    Leads: "Recorte comercial com foco em crescimento, qualificacao e sinais do funil.",
    Viagens: "Panorama das viagens criadas, ativas e embarques futuros.",
    Documentos: "Emissao, pendencias e leitura documental baseada na operacao real.",
    Financeiro: "Resumo operacional de receitas, despesas, saldo e movimentacoes recentes.",
    Creditos: "Consumo, saldo e historico operacional de creditos da agencia.",
    "Operacao geral": "Resumo executivo com clientes, leads, viagens, documentos, financeiro e creditos.",
  }

  const summaryLines = [
    `${clients.length} clientes, ${leads.length} leads e ${trips.length} viagens compoem a base operacional da agencia.`,
    `${documents.length} documentos e ${financialRecords.length} lancamentos financeiros foram considerados neste recorte.`,
    `O saldo atual apurado e de ${formatMoney(totalRevenue - totalExpenses)} e o saldo de creditos esta em ${creditBalance}.`,
  ]

  if (normalizedType === "Financeiro") {
    summaryLines[1] = `${scopedFinancials.length} lancamentos financeiros entraram no recorte selecionado.`
    summaryLines[2] = `O saldo do recorte financeiro atual e de ${formatMoney(scopedRevenue - scopedExpenses)}.`
    if (financeFilterLabel) {
      summaryLines.push(`Filtro herdado automaticamente do modulo Financeiro: ${financeFilterLabel}.`)
    }
  }

  return {
    id: `${normalizedType}-${Date.now()}`,
    type: normalizedType,
    title,
    subtitle: subtitleMap[normalizedType] || subtitleMap["Operacao geral"],
    period: displayPeriod,
    generatedAt: new Date().toISOString(),
    agencyName: agency.display_name,
    agencyCity: agency.city,
    agencyPhone: agency.phone,
    summary: {
      title: "Resumo executivo",
      lines: summaryLines,
    },
    metrics: normalizedType === "Operacao geral" ? commonMetrics : sections.find((section) => section.kind === "metrics")?.metrics || commonMetrics,
    sections,
    footerNote: "Estrutura pronta para IA, Advisor, compartilhamento e portal do cliente em proximas fases.",
  }
}

export async function regenerateReportRecord(context: AgencyAccessContext, reportId: string) {
  const report = await getReportById(context, reportId)
  if (!report) {
    throw new Error("Relatorio nao encontrado.")
  }

  const filters = report.filters && typeof report.filters === "object" && !Array.isArray(report.filters)
    ? (report.filters as Record<string, unknown>)
    : {}

  const period = typeof filters.period === "string" ? filters.period : "Ultimos 30 dias"
  const options: ReportBuildOptions = {
    startDate: typeof filters.startDate === "string" ? filters.startDate : null,
    endDate: typeof filters.endDate === "string" ? filters.endDate : null,
    financeFilter: typeof filters.financeFilter === "string" ? filters.financeFilter : null,
  }

  const payload = await buildReportDocumentData(context, report.type, period, options)
  const preview = { title: payload.title, lines: payload.summary.lines }

  return updateReport(context, reportId, {
    status: "Pronto",
    filters: {
      ...filters,
      period,
      preview,
      payload,
    },
  })
}

export async function resolveReportDocument(context: AgencyAccessContext, reportId: string) {
  const report = await getReportById(context, reportId)
  if (!report) {
    throw new Error("Relatorio nao encontrado.")
  }

  const filters = report.filters && typeof report.filters === "object" && !Array.isArray(report.filters)
    ? (report.filters as Record<string, unknown>)
    : {}

  const payloadCandidate = filters.payload
  if (payloadCandidate && typeof payloadCandidate === "object" && !Array.isArray(payloadCandidate)) {
    return {
      report,
      document: payloadCandidate as ReportDocumentData,
    }
  }

  const period = typeof filters.period === "string" ? filters.period : "Ultimos 30 dias"
  const document = await buildReportDocumentData(context, report.type, period, {
    startDate: typeof filters.startDate === "string" ? filters.startDate : null,
    endDate: typeof filters.endDate === "string" ? filters.endDate : null,
    financeFilter: typeof filters.financeFilter === "string" ? filters.financeFilter : null,
  })

  return {
    report,
    document,
  }
}

export async function getReportDownloadData(context: AgencyAccessContext, reportId: string) {
  const { report, document } = await resolveReportDocument(context, reportId)
  return {
    report,
    document,
    filename: `${report.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") || "relatorio"}.html`,
  }
}
