import type { AgencyAccessContext, CreditTransactionRow } from "@/types/database"
import type { ReportsOverviewData } from "@/types/reports-overview"
import { listCreditTransactions } from "@/lib/services/credit-service"
import { listDocuments } from "@/lib/services/document-service"
import { listFinancialRecords } from "@/lib/services/finance-service"
import { listLeads } from "@/lib/services/lead-service"
import { listReports } from "@/lib/services/report-service"
import { listTrips } from "@/lib/services/trip-service"

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function countRecent<T extends { created_at: string }>(rows: T[], days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000
  return rows.filter((row) => new Date(row.created_at).getTime() >= threshold).length
}

function isRevenue(type: string) {
  return type.toLowerCase().includes("receit")
}

function isExpense(type: string) {
  return type.toLowerCase().includes("desp")
}

function creditSignedAmount(row: CreditTransactionRow) {
  const normalized = row.type.toLowerCase()
  if (normalized.includes("grant") || normalized.includes("bonus") || normalized.includes("credit") || normalized.includes("entrada")) return Number(row.amount || 0)
  if (normalized.includes("consumo") || normalized.includes("debit") || normalized.includes("uso")) return Number(row.amount || 0) * -1
  return Number(row.amount || 0)
}

export async function buildReportSnapshot(context: AgencyAccessContext, type: string, period: string) {
  const [leads, trips, documents, financialRecords, credits] = await Promise.all([
    listLeads(context),
    listTrips(context),
    listDocuments(context),
    listFinancialRecords(context),
    listCreditTransactions(context),
  ])

  const totalRevenue = financialRecords.filter((item) => isRevenue(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpenses = financialRecords.filter((item) => isExpense(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const consumedCredits = credits.filter((item) => creditSignedAmount(item) < 0).reduce((sum, item) => sum + Math.abs(creditSignedAmount(item)), 0)
  const upcomingTrips = trips.filter((trip) => trip.starts_at && new Date(trip.starts_at).getTime() >= Date.now())

  const templates: Record<string, { title: string; lines: string[] }> = {
    "Resumo operacional": {
      title: "Resumo operacional",
      lines: [
        `${leads.length} leads no funil com ${countRecent(leads, 30)} entradas nos últimos 30 dias.`,
        `${trips.length} viagens na base com ${upcomingTrips.length} embarques futuros.`,
        `${documents.length} documentos totais e ${documents.filter((item) => item.status.toLowerCase().includes("pronto") || item.status.toLowerCase().includes("emit")).length} emitidos.`,
      ],
    },
    "Crescimento de leads": {
      title: "Crescimento de leads",
      lines: [
        `${countRecent(leads, 7)} leads criados nos últimos 7 dias.`,
        `${countRecent(leads, 30)} leads criados nos últimos 30 dias.`,
        `${leads.filter((item) => item.status.toLowerCase().includes("qual")).length} leads em qualificação.`,
      ],
    },
    "Viagens criadas": {
      title: "Viagens criadas",
      lines: [
        `${countRecent(trips, 7)} viagens abertas nos últimos 7 dias.`,
        `${upcomingTrips.length} viagens com embarque futuro.`,
        `${trips.filter((item) => (item.status || "").toLowerCase().includes("andamento")).length} viagens em andamento.`,
      ],
    },
    "Documentos emitidos": {
      title: "Documentos emitidos",
      lines: [
        `${documents.filter((item) => item.status.toLowerCase().includes("pronto") || item.status.toLowerCase().includes("emit")).length} documentos emitidos ou prontos.`,
        `${documents.filter((item) => item.status.toLowerCase().includes("rascunho") || item.status.toLowerCase().includes("pend")).length} documentos pendentes.`,
        `${countRecent(documents, 30)} documentos criados nos últimos 30 dias.`,
      ],
    },
    "Receitas e despesas": {
      title: "Receitas e despesas",
      lines: [
        `Receitas totais: ${formatMoney(totalRevenue)}.`,
        `Despesas totais: ${formatMoney(totalExpenses)}.`,
        `Saldo operacional: ${formatMoney(totalRevenue - totalExpenses)}.`,
      ],
    },
    "Consumo de créditos": {
      title: "Consumo de créditos",
      lines: [
        `${credits.length} movimentos de créditos registrados.`,
        `${consumedCredits} créditos consumidos nas operações registradas.`,
        `${credits.filter((item) => creditSignedAmount(item) > 0).reduce((sum, item) => sum + creditSignedAmount(item), 0)} créditos adicionados.`,
      ],
    },
    "Próximos embarques": {
      title: "Próximos embarques",
      lines: upcomingTrips.slice(0, 3).map((trip) => `${trip.destination} com embarque previsto para ${trip.starts_at?.slice(0, 10)}.`),
    },
  }

  const selected = templates[type] || templates["Resumo operacional"]

  return {
    type,
    period,
    generated_at: new Date().toISOString(),
    title: selected.title,
    lines: selected.lines.length ? selected.lines : ["Nenhum dado suficiente para este recorte ainda."],
  }
}

export async function getReportsOverviewData(context: AgencyAccessContext): Promise<ReportsOverviewData> {
  const [reports, leads, trips, documents, financialRecords, credits] = await Promise.all([
    listReports(context),
    listLeads(context),
    listTrips(context),
    listDocuments(context),
    listFinancialRecords(context),
    listCreditTransactions(context),
  ])

  const preview = await buildReportSnapshot(context, "Resumo operacional", "Últimos 30 dias")
  const totalRevenue = financialRecords.filter((item) => isRevenue(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpenses = financialRecords.filter((item) => isExpense(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const consumedCredits = credits.filter((item) => creditSignedAmount(item) < 0).reduce((sum, item) => sum + Math.abs(creditSignedAmount(item)), 0)
  const upcomingTrips = trips.filter((trip) => trip.starts_at && new Date(trip.starts_at).getTime() >= Date.now())

  return {
    templates: [
      { id: "resumo-operacional", title: "Resumo operacional", description: "Visão rápida da agência com foco em operação e caixa.", href: "/app/central-operacional/relatorios/novo", metric: `${leads.length} leads • ${trips.length} viagens` },
      { id: "crescimento-leads", title: "Crescimento de leads", description: "Entradas recentes e status do funil comercial.", href: "/app/central-operacional/relatorios/novo", metric: `${countRecent(leads, 30)} nos últimos 30 dias` },
      { id: "viagens-criadas", title: "Viagens criadas", description: "Base de viagens abertas e embarques futuros.", href: "/app/central-operacional/relatorios/novo", metric: `${upcomingTrips.length} próximos embarques` },
      { id: "documentos-emitidos", title: "Documentos emitidos", description: "Emissão e pendências documentais reais.", href: "/app/central-operacional/relatorios/novo", metric: `${documents.length} documentos totais` },
      { id: "receitas-despesas", title: "Receitas e despesas", description: "Resumo financeiro operacional da agência.", href: "/app/central-operacional/relatorios/novo", metric: `${formatMoney(totalRevenue - totalExpenses)} de saldo` },
      { id: "consumo-creditos", title: "Consumo de créditos", description: "Histórico e pressão operacional sobre créditos.", href: "/app/central-operacional/relatorios/novo", metric: `${consumedCredits} consumidos` },
      { id: "proximos-embarques", title: "Próximos embarques", description: "Leitura rápida das viagens mais próximas.", href: "/app/central-operacional/relatorios/novo", metric: `${upcomingTrips.length} viagens futuras` },
    ],
    recent_reports: reports.slice(0, 10),
    preview,
  }
}
