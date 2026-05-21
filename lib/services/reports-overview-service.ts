import type { AgencyAccessContext } from "@/types/database"
import type { ReportsOverviewData } from "@/types/reports-overview"
import { buildReportDocumentData } from "@/lib/services/reporting-service"
import { listReports } from "@/lib/services/report-service"

export async function buildReportSnapshot(context: AgencyAccessContext, type: string, period: string) {
  const payload = await buildReportDocumentData(context, type, period)
  return {
    type,
    period,
    generated_at: payload.generatedAt,
    title: payload.title,
    lines: payload.summary.lines,
    payload,
  }
}

export async function getReportsOverviewData(context: AgencyAccessContext): Promise<ReportsOverviewData> {
  const reports = await listReports(context)
  const preview = await buildReportSnapshot(context, "Operação geral", "Últimos 30 dias")

  return {
    templates: [
      { id: "operacao-geral", title: "Operação geral", description: "Leitura executiva cruzando clientes, leads, viagens, documentos, financeiro e créditos.", href: "/app/central-operacional/relatorios/novo", metric: "Panorama completo da agência" },
      { id: "clientes", title: "Clientes", description: "Base real de clientes, crescimento e relacionamento recente.", href: "/app/central-operacional/relatorios/novo", metric: "Clientes ativos e recentes" },
      { id: "leads", title: "Leads", description: "Funil comercial, origem e qualificação dos leads reais.", href: "/app/central-operacional/relatorios/novo", metric: "Pipeline comercial vivo" },
      { id: "viagens", title: "Viagens", description: "Viagens criadas, confirmadas e próximos embarques.", href: "/app/central-operacional/relatorios/novo", metric: "Operação de viagens" },
      { id: "documentos", title: "Documentos", description: "Emissão, pendências e status documental da agência.", href: "/app/central-operacional/relatorios/novo", metric: "Fluxo documental" },
      { id: "financeiro", title: "Financeiro", description: "Receitas, despesas, saldo e movimentações reais.", href: "/app/central-operacional/relatorios/novo", metric: "Caixa operacional" },
      { id: "creditos", title: "Créditos", description: "Saldo, consumo e histórico operacional de créditos.", href: "/app/central-operacional/relatorios/novo", metric: "Uso de créditos" },
    ],
    recent_reports: reports.slice(0, 10),
    preview: {
      title: preview.title,
      lines: preview.lines,
    },
  }
}
