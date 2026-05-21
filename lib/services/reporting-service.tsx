import { getCatalogAgencyProfile } from "@/lib/services/catalog-service"
import { listClients } from "@/lib/services/client-service"
import { listCreditTransactions } from "@/lib/services/credit-service"
import { listDocuments } from "@/lib/services/document-service"
import { listFinancialRecords } from "@/lib/services/finance-service"
import { listLeads } from "@/lib/services/lead-service"
import { getReportById, updateReport } from "@/lib/services/report-service"
import { listTrips } from "@/lib/services/trip-service"
import type { AgencyAccessContext, CreditTransactionRow } from "@/types/database"
import type { ReportDocumentData, ReportMetricCard, ReportSectionBlock } from "@/types/reporting"

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed)
}

function daysFromPeriod(period: string) {
  const normalized = period.toLowerCase()
  if (normalized.includes("7")) return 7
  if (normalized.includes("90") || normalized.includes("trimestre")) return 90
  if (normalized.includes("ano")) return 365
  return 30
}

function createdWithin(value: string, days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(value).getTime() >= threshold
}

function signedCreditAmount(row: CreditTransactionRow) {
  const normalized = row.type.toLowerCase()
  if (normalized.includes("grant") || normalized.includes("bonus") || normalized.includes("credit") || normalized.includes("entrada")) return Number(row.amount || 0)
  if (normalized.includes("consumo") || normalized.includes("debit") || normalized.includes("uso")) return Number(row.amount || 0) * -1
  return Number(row.amount || 0)
}

function isRevenue(type: string) {
  return type.toLowerCase().includes("receit")
}

function isExpense(type: string) {
  return type.toLowerCase().includes("desp")
}

function isPublishedLike(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("pronto") || normalized.includes("emit") || normalized.includes("public")
}

function normalizeReportType(type: string) {
  const normalized = type.toLowerCase()
  if (normalized.includes("cliente")) return "Clientes"
  if (normalized.includes("lead")) return "Leads"
  if (normalized.includes("viagem") || normalized.includes("embarque")) return "Viagens"
  if (normalized.includes("document")) return "Documentos"
  if (normalized.includes("receita") || normalized.includes("despesa") || normalized.includes("finance")) return "Financeiro"
  if (normalized.includes("crédito") || normalized.includes("credito")) return "Créditos"
  return "Operação geral"
}

export async function buildReportDocumentData(context: AgencyAccessContext, type: string, period: string): Promise<ReportDocumentData> {
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
  const days = daysFromPeriod(period)
  const recentClients = clients.filter((item) => createdWithin(item.created_at, days))
  const recentLeads = leads.filter((item) => createdWithin(item.created_at, days))
  const recentTrips = trips.filter((item) => createdWithin(item.created_at, days))
  const recentDocuments = documents.filter((item) => createdWithin(item.created_at, days))
  const recentFinancials = financialRecords.filter((item) => createdWithin(item.created_at, days))
  const recentCredits = credits.filter((item) => createdWithin(item.created_at, days))

  const totalRevenue = financialRecords.filter((item) => isRevenue(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpenses = financialRecords.filter((item) => isExpense(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const creditBalance = credits.reduce((sum, item) => sum + signedCreditAmount(item), 0)
  const activeTrips = trips.filter((item) => (item.status || "").toLowerCase().includes("andamento") || (item.status || "").toLowerCase().includes("confirm"))
  const pendingDocuments = documents.filter((item) => !isPublishedLike(item.status))
  const upcomingTrips = trips.filter((item) => item.starts_at && new Date(item.starts_at).getTime() >= Date.now())

  const commonMetrics: ReportMetricCard[] = [
    { label: "Clientes", value: String(clients.length), detail: `${recentClients.length} no período`, tone: "info" },
    { label: "Leads", value: String(leads.length), detail: `${recentLeads.length} no período`, tone: "warning" },
    { label: "Viagens ativas", value: String(activeTrips.length), detail: `${upcomingTrips.length} embarques futuros`, tone: "success" },
    { label: "Saldo", value: formatMoney(totalRevenue - totalExpenses), detail: `${credits.length} movimentos de crédito`, tone: totalRevenue - totalExpenses >= 0 ? "success" : "danger" },
  ]

  const sectionsByType: Record<string, ReportSectionBlock[]> = {
    "Clientes": [
      {
        kind: "table",
        title: "Clientes recentes",
        description: "Base real de clientes vinculados à agência.",
        table: {
          headers: ["Nome", "Email", "Telefone", "Status", "Criado em"],
          rows: recentClients.slice(0, 12).map((item) => [item.name, item.email || "Não informado", item.phone || "Não informado", item.status, formatDate(item.created_at)]),
        },
      },
      {
        kind: "notes",
        title: "Leitura executiva",
        notes: [
          `${clients.length} clientes cadastrados no total.`,
          `${recentClients.length} clientes criados dentro do recorte selecionado.`,
          `A operação mantém ${clients.filter((item) => item.status.toLowerCase().includes("ativo")).length} clientes ativos.`,
        ],
      },
    ],
    "Leads": [
      {
        kind: "metrics",
        title: "Funil comercial",
        description: "Leitura simples do pipeline real.",
        metrics: [
          { label: "Novos", value: String(leads.filter((item) => item.status.toLowerCase().includes("novo")).length), tone: "warning" },
          { label: "Qualificação", value: String(leads.filter((item) => item.status.toLowerCase().includes("qual")).length), tone: "info" },
          { label: "Quentes", value: String(leads.filter((item) => (item.temperature || "").toLowerCase().includes("quente")).length), tone: "success" },
          { label: "No período", value: String(recentLeads.length), tone: "default" },
        ],
      },
      {
        kind: "table",
        title: "Leads recentes",
        table: {
          headers: ["Nome", "Origem", "Destino", "Status", "Criado em"],
          rows: recentLeads.slice(0, 12).map((item) => [item.name, item.origin || "Não informado", item.destination || "Em definição", item.status, formatDate(item.created_at)]),
        },
      },
    ],
    "Viagens": [
      {
        kind: "table",
        title: "Próximos embarques",
        description: "Viagens futuras que merecem atenção operacional.",
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
          `${recentTrips.length} viagens criadas dentro do período.`,
          `${activeTrips.length} viagens em andamento ou confirmadas.`,
        ],
      },
    ],
    "Documentos": [
      {
        kind: "metrics",
        title: "Status documental",
        metrics: [
          { label: "Emitidos", value: String(documents.filter((item) => isPublishedLike(item.status)).length), tone: "success" },
          { label: "Pendentes", value: String(pendingDocuments.length), tone: "warning" },
          { label: "No período", value: String(recentDocuments.length), tone: "info" },
          { label: "Total", value: String(documents.length), tone: "default" },
        ],
      },
      {
        kind: "table",
        title: "Documentos recentes",
        table: {
          headers: ["Título", "Tipo", "Status", "Criado em", "Atualizado em"],
          rows: recentDocuments.slice(0, 12).map((item) => [item.title, item.type, item.status, formatDate(item.created_at), formatDate(item.updated_at)]),
        },
      },
    ],
    "Financeiro": [
      {
        kind: "metrics",
        title: "Resumo financeiro",
        metrics: [
          { label: "Receitas", value: formatMoney(totalRevenue), tone: "success" },
          { label: "Despesas", value: formatMoney(totalExpenses), tone: "danger" },
          { label: "Saldo", value: formatMoney(totalRevenue - totalExpenses), tone: totalRevenue - totalExpenses >= 0 ? "success" : "warning" },
          { label: "Lançamentos", value: String(recentFinancials.length), tone: "info" },
        ],
      },
      {
        kind: "table",
        title: "Movimentações recentes",
        table: {
          headers: ["Categoria", "Tipo", "Status", "Valor", "Data"],
          rows: recentFinancials.slice(0, 12).map((item) => [item.category || "Sem categoria", item.type, item.status, formatMoney(Number(item.amount || 0)), formatDate(item.occurred_at)]),
        },
      },
    ],
    "Créditos": [
      {
        kind: "metrics",
        title: "Uso de créditos",
        metrics: [
          { label: "Saldo", value: String(creditBalance), tone: creditBalance > 0 ? "success" : "warning" },
          { label: "Movimentos", value: String(credits.length), tone: "info" },
          { label: "Consumo no período", value: String(recentCredits.filter((item) => signedCreditAmount(item) < 0).reduce((sum, item) => sum + Math.abs(signedCreditAmount(item)), 0)), tone: "warning" },
          { label: "Recargas", value: String(recentCredits.filter((item) => signedCreditAmount(item) > 0).reduce((sum, item) => sum + signedCreditAmount(item), 0)), tone: "success" },
        ],
      },
      {
        kind: "table",
        title: "Histórico recente",
        table: {
          headers: ["Feature", "Origem", "Tipo", "Quantidade", "Criado em"],
          rows: recentCredits.slice(0, 12).map((item) => [item.feature || "Operação geral", item.source || "Sem origem", item.type, String(item.amount), formatDate(item.created_at)]),
        },
      },
    ],
    "Operação geral": [
      {
        kind: "metrics",
        title: "Leitura cruzada",
        metrics: commonMetrics,
      },
      {
        kind: "table",
        title: "Últimos leads e clientes",
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
          headers: ["Módulo", "Total", "Recorte", "Sinal"],
          rows: [
            ["Viagens", String(trips.length), `${recentTrips.length} no período`, `${upcomingTrips.length} próximos embarques`],
            ["Documentos", String(documents.length), `${recentDocuments.length} no período`, `${pendingDocuments.length} pendentes`],
            ["Financeiro", String(financialRecords.length), `${recentFinancials.length} movimentos`, formatMoney(totalRevenue - totalExpenses)],
            ["Créditos", String(credits.length), `${recentCredits.length} movimentos`, `${creditBalance} de saldo`],
          ],
        },
      },
    ],
  }

  const sections = sectionsByType[normalizedType] ?? sectionsByType["Operação geral"]
  const title = normalizedType === "Operação geral" ? "Relatório operacional" : `Relatório de ${normalizedType.toLowerCase()}`
  const subtitleMap: Record<string, string> = {
    "Clientes": "Base de clientes, entradas recentes e leitura de relacionamento da agência.",
    "Leads": "Recorte comercial com foco em crescimento, qualificação e sinais do funil.",
    "Viagens": "Panorama das viagens criadas, ativas e embarques futuros.",
    "Documentos": "Emissão, pendências e leitura documental baseada na operação real.",
    "Financeiro": "Resumo operacional de receitas, despesas, saldo e movimentações recentes.",
    "Créditos": "Consumo, saldo e histórico operacional de créditos da agência.",
    "Operação geral": "Resumo executivo com clientes, leads, viagens, documentos, financeiro e créditos.",
  }

  return {
    id: `${normalizedType}-${Date.now()}`,
    type: normalizedType,
    title,
    subtitle: subtitleMap[normalizedType] || subtitleMap["Operação geral"],
    period,
    generatedAt: new Date().toISOString(),
    agencyName: agency.display_name,
    agencyCity: agency.city,
    agencyPhone: agency.phone,
    summary: {
      title: "Resumo executivo",
      lines: [
        `${clients.length} clientes, ${leads.length} leads e ${trips.length} viagens compõem a base operacional da agência.`,
        `${documents.length} documentos e ${financialRecords.length} lançamentos financeiros foram considerados neste recorte.`,
        `O saldo atual apurado é de ${formatMoney(totalRevenue - totalExpenses)} e o saldo de créditos está em ${creditBalance}.`,
      ],
    },
    metrics: normalizedType === "Operação geral" ? commonMetrics : sections.find((section) => section.kind === "metrics")?.metrics || commonMetrics,
    sections,
    footerNote: "Estrutura pronta para IA, Advisor, compartilhamento e portal do cliente em próximas fases.",
  }
}

export async function regenerateReportRecord(context: AgencyAccessContext, reportId: string) {
  const report = await getReportById(context, reportId)
  if (!report) {
    throw new Error("Relatório não encontrado.")
  }

  const filters = report.filters && typeof report.filters === "object" && !Array.isArray(report.filters)
    ? (report.filters as Record<string, unknown>)
    : {}

  const period = typeof filters.period === "string" ? filters.period : "Últimos 30 dias"
  const payload = await buildReportDocumentData(context, report.type, period)
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
    throw new Error("Relatório não encontrado.")
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

  const period = typeof filters.period === "string" ? filters.period : "Últimos 30 dias"
  const document = await buildReportDocumentData(context, report.type, period)

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
