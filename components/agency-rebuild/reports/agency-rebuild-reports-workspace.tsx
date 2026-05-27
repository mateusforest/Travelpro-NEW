"use client"

import { useMemo, useState } from "react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type ReportsTab =
  | "overview"
  | "reports"
  | "financial"
  | "trips"
  | "leads"
  | "clients"
  | "documents"
  | "operational"
  | "charts"
  | "history"

type ReportType =
  | "Financeiro"
  | "Fluxo de caixa"
  | "Competencia"
  | "Viagens"
  | "Leads"
  | "Clientes"
  | "Documentos"
  | "Operacional"
  | "Creditos"
  | "Catalogo"
  | "Geral"

type ReportStatus = "Rascunho" | "Gerado" | "Revisado" | "Exportado" | "Arquivado"
type ReportFormat = "Resumo executivo" | "Detalhado" | "Tabela" | "Grafico"
type ReportPeriod = "Hoje" | "7 dias" | "30 dias" | "Este mes" | "Trimestre" | "Ano" | "Personalizado"

type ReportRecord = {
  id: string
  title: string
  type: ReportType
  periodLabel: string
  status: ReportStatus
  createdAt: string
  owner: string
  origin: string
  format: ReportFormat
  summary: string
  indicators: { label: string; value: string }[]
  table: { label: string; realized: string; projected: string }[]
  chart: { label: string; value: number }[]
  insights: string[]
  history: string[]
  notes: string
}

type ReportFormState = {
  type: ReportType
  period: ReportPeriod
  startDate: string
  endDate: string
  sessions: string[]
  format: ReportFormat
  owner: string
  notes: string
}

const reportTypes: ReportType[] = [
  "Financeiro",
  "Fluxo de caixa",
  "Competencia",
  "Viagens",
  "Leads",
  "Clientes",
  "Documentos",
  "Operacional",
  "Creditos",
  "Catalogo",
  "Geral",
]

const reportPeriods: ReportPeriod[] = ["Hoje", "7 dias", "30 dias", "Este mes", "Trimestre", "Ano", "Personalizado"]
const reportFormats: ReportFormat[] = ["Resumo executivo", "Detalhado", "Tabela", "Grafico"]
const reportSessions = ["Financeiro", "Viagens", "Leads", "Clientes", "Documentos", "Operacional", "Creditos", "Catalogo"]

const reportSeed: ReportRecord[] = [
  {
    id: "report-1",
    title: "Resumo executivo de Maio",
    type: "Geral",
    periodLabel: "Este mes",
    status: "Revisado",
    createdAt: "2026-05-26",
    owner: "Marina Alves",
    origin: "Dashboard V3",
    format: "Resumo executivo",
    summary: "A agencia manteve crescimento em viagens premium, com estabilidade financeira e bom ritmo de conversao.",
    indicators: [
      { label: "Receitas", value: "R$ 128.400" },
      { label: "Viagens geradas", value: "18" },
      { label: "Leads convertidos", value: "6" },
      { label: "Documentos assinados", value: "14" },
    ],
    table: [
      { label: "Saldo inicial", realized: "R$ 18.200", projected: "R$ 18.200" },
      { label: "Entradas", realized: "R$ 76.100", projected: "R$ 82.000" },
      { label: "Saidas", realized: "R$ 41.800", projected: "R$ 46.400" },
      { label: "Saldo final", realized: "R$ 52.500", projected: "R$ 53.800" },
    ],
    chart: [
      { label: "Sem 1", value: 34 },
      { label: "Sem 2", value: 48 },
      { label: "Sem 3", value: 52 },
      { label: "Sem 4", value: 61 },
    ],
    insights: [
      "Leads premium elevaram a taxa de conversao nas ultimas duas semanas.",
      "Viagens internacionais puxaram o ticket medio para cima.",
      "Documentacao segue como principal gargalo antes do embarque.",
    ],
    history: ["Relatorio gerado", "Resumo revisado", "Indicadores consolidados"],
    notes: "Base executiva usada na reuniao de alinhamento.",
  },
  {
    id: "report-2",
    title: "Fluxo de caixa • Maio",
    type: "Fluxo de caixa",
    periodLabel: "Este mes",
    status: "Gerado",
    createdAt: "2026-05-25",
    owner: "Time Financeiro",
    origin: "Financeiro V3",
    format: "Tabela",
    summary: "Entradas mantem boa previsibilidade, com saidas concentradas na segunda metade do mes.",
    indicators: [
      { label: "Saldo inicial", value: "R$ 12.800" },
      { label: "Entradas", value: "R$ 61.300" },
      { label: "Saidas", value: "R$ 33.100" },
      { label: "Resultado previsto", value: "R$ 41.000" },
    ],
    table: [
      { label: "Receitas por categoria", realized: "R$ 61.300", projected: "R$ 67.200" },
      { label: "Despesas por categoria", realized: "R$ 33.100", projected: "R$ 35.700" },
      { label: "Saldo final", realized: "R$ 41.000", projected: "R$ 44.300" },
    ],
    chart: [
      { label: "Receitas", value: 61 },
      { label: "Despesas", value: 33 },
      { label: "Saldo", value: 41 },
    ],
    insights: ["Recebimentos seguem saudaveis.", "Atencao para repasses de fornecedores na ultima semana."],
    history: ["Relatorio gerado"],
    notes: "Leitura local inspirada na base do financeiro.",
  },
  {
    id: "report-3",
    title: "Pipeline comercial • Maio",
    type: "Leads",
    periodLabel: "30 dias",
    status: "Rascunho",
    createdAt: "2026-05-24",
    owner: "Time Comercial",
    origin: "Leads V3",
    format: "Grafico",
    summary: "Os leads de Instagram e indicacao seguem puxando mais oportunidades qualificadas.",
    indicators: [
      { label: "Leads recebidos", value: "64" },
      { label: "Quentes", value: "9" },
      { label: "Convertidos", value: "6" },
      { label: "Perdidos", value: "4" },
    ],
    table: [
      { label: "Instagram", realized: "22", projected: "26" },
      { label: "Indicacao", realized: "15", projected: "18" },
      { label: "WhatsApp", realized: "11", projected: "13" },
    ],
    chart: [
      { label: "Novos", value: 24 },
      { label: "Qualificados", value: 17 },
      { label: "Cotacao", value: 11 },
      { label: "Convertidos", value: 6 },
    ],
    insights: ["Leads com resposta em menos de 30 min convertem mais.", "Lua de mel segue aquecida para julho e agosto."],
    history: ["Relatorio iniciado", "Pipeline consolidado localmente"],
    notes: "Ainda precisa revisao final do comercial.",
  },
]

function emptyReportForm(): ReportFormState {
  return {
    type: "Geral",
    period: "30 dias",
    startDate: "2026-05-01",
    endDate: "2026-05-26",
    sessions: ["Financeiro", "Viagens", "Leads"],
    format: "Resumo executivo",
    owner: "Marina Alves",
    notes: "",
  }
}

function statusTone(status: ReportStatus) {
  if (status === "Revisado") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Gerado" || status === "Exportado") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Rascunho") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildReportsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<ReportsTab>("overview")
  const [reports, setReports] = useState<ReportRecord[]>(reportSeed)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [graphOpen, setGraphOpen] = useState(false)
  const [form, setForm] = useState<ReportFormState>(emptyReportForm())
  const [filters, setFilters] = useState({
    type: "all",
    period: "all",
    status: "all",
    owner: "all",
    session: "all",
    format: "all",
  })

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === detailId) ?? null,
    [detailId, reports],
  )

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        if (filters.type !== "all" && report.type !== filters.type) return false
        if (filters.period !== "all" && report.periodLabel !== filters.period) return false
        if (filters.status !== "all" && report.status !== filters.status) return false
        if (filters.owner !== "all" && report.owner !== filters.owner) return false
        if (filters.format !== "all" && report.format !== filters.format) return false
        if (filters.session !== "all" && !report.summary.toLowerCase().includes(filters.session.toLowerCase()) && report.type !== filters.session) return false
        return true
      }),
    [filters, reports],
  )

  const totals = useMemo(
    () => ({
      generated: reports.length,
      recent: reports.filter((report) => report.createdAt === "2026-05-26" || report.createdAt === "2026-05-25").length,
      pending: reports.filter((report) => report.status === "Rascunho").length,
      exports: reports.filter((report) => report.status === "Exportado").length,
      financial: reports.filter((report) => report.type === "Financeiro" || report.type === "Fluxo de caixa" || report.type === "Competencia").length,
      operational: reports.filter((report) => report.type === "Operacional" || report.type === "Geral").length,
    }),
    [reports],
  )

  const historyItems = useMemo(
    () =>
      reports.flatMap((report) =>
        report.history.map((item, index) => ({
          id: `${report.id}-${index}`,
          title: item,
          report: report.title,
        })),
      ),
    [reports],
  )

  const currentGraphReport = selectedReport ?? reports[0] ?? null

  const toggleSession = (session: string) => {
    setForm((current) => ({
      ...current,
      sessions: current.sessions.includes(session)
        ? current.sessions.filter((item) => item !== session)
        : [...current.sessions, session],
    }))
  }

  const generateReport = () => {
    const payload: ReportRecord = {
      id: `report-${Date.now()}`,
      title: `${form.type} • ${form.period}`,
      type: form.type,
      periodLabel: form.period,
      status: "Gerado",
      createdAt: "2026-05-26",
      owner: form.owner,
      origin: "Workspace Relatorios V3",
      format: form.format,
      summary: `Relatorio local em formato ${form.format.toLowerCase()} para as sessoes ${form.sessions.join(", ")}.`,
      indicators: [
        { label: "Sessoes incluidas", value: String(form.sessions.length) },
        { label: "Periodo", value: form.period },
        { label: "Responsavel", value: form.owner },
        { label: "Formato", value: form.format },
      ],
      table: [
        { label: "Saldo inicial", realized: "R$ 18.200", projected: "R$ 18.200" },
        { label: "Entradas", realized: "R$ 76.100", projected: "R$ 82.000" },
        { label: "Saidas", realized: "R$ 41.800", projected: "R$ 46.400" },
        { label: "Saldo final", realized: "R$ 52.500", projected: "R$ 53.800" },
      ],
      chart: [
        { label: "Bloco 1", value: 28 },
        { label: "Bloco 2", value: 44 },
        { label: "Bloco 3", value: 39 },
        { label: "Bloco 4", value: 58 },
      ],
      insights: [
        "A leitura executiva foi preparada localmente para o preview da V3.",
        "O proximo passo sera conectar dados reais por modulo sem perder a camada premium.",
      ],
      history: ["Relatorio gerado"],
      notes: form.notes,
    }
    setReports((items) => [payload, ...items])
    setGenerateOpen(false)
    toast({
      title: "Relatorio gerado",
      description: "A nova leitura foi criada localmente no workspace da V3.",
    })
  }

  const duplicateReport = (reportId: string) => {
    const current = reports.find((item) => item.id === reportId)
    if (!current) return
    const duplicated: ReportRecord = {
      ...current,
      id: `report-${Date.now()}`,
      title: `${current.title} • Copia`,
      status: "Rascunho",
      createdAt: "2026-05-26",
      history: ["Relatorio duplicado", ...current.history],
    }
    setReports((items) => [duplicated, ...items])
    toast({
      title: "Relatorio duplicado",
      description: "A copia foi adicionada localmente para ajustes na V3.",
    })
  }

  const reviewReport = (reportId: string) => {
    setReports((items) =>
      items.map((item) =>
        item.id === reportId
          ? { ...item, status: "Revisado", history: ["Relatorio revisado", ...item.history] }
          : item,
      ),
    )
    toast({
      title: "Relatorio revisado",
      description: "O status foi promovido localmente para revisado.",
    })
  }

  const archiveReport = (reportId: string) => {
    setReports((items) =>
      items.map((item) =>
        item.id === reportId
          ? { ...item, status: "Arquivado", history: ["Relatorio arquivado", ...item.history] }
          : item,
      ),
    )
    toast({
      title: "Relatorio arquivado",
      description: "O item foi movido para arquivado no preview da V3.",
    })
  }

  const deleteReport = (reportId: string) => {
    setReports((items) => items.filter((item) => item.id !== reportId))
    if (detailId === reportId) setDetailId(null)
    toast({
      title: "Relatorio removido",
      description: "A exclusao afetou apenas o estado local do preview.",
    })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Relatorios"
        description="Leituras operacionais, financeiras, comerciais e executivas da agencia."
        contentClassName="sm:max-w-[1400px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Relatorios gerados", value: totals.generated.toString() },
                  { label: "Relatorios recentes", value: totals.recent.toString() },
                  { label: "Pendentes de revisao", value: totals.pending.toString() },
                  { label: "Exportacoes", value: totals.exports.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Gerar relatorio" className="rounded-full" onAction={() => setGenerateOpen(true)} />
                <AgencyRebuildActionButton actionType="modal" label="Ver grafico" className="rounded-full" onAction={() => setGraphOpen(true)} />
                <AgencyRebuildActionButton actionType="future" label="Exportar" className="rounded-full" futureMessage="As exportacoes PDF e Excel serao ligadas depois ao modulo real." />
                <AgencyRebuildActionButton actionType="future" label="Agendar relatorio" className="rounded-full" futureMessage="O agendamento automatico ainda esta em preparacao na V3." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as ReportsTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="reports">Relatorios</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="trips">Viagens</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="clients">Clientes</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="operational">Operacional</TabsTrigger>
                <TabsTrigger value="charts">Graficos</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Gerados", value: totals.generated.toString(), note: "Leituras prontas para a operacao." },
                    { label: "Financeiros", value: totals.financial.toString(), note: "Fluxo, competencia e caixa." },
                    { label: "Comerciais", value: reports.filter((item) => item.type === "Leads" || item.type === "Clientes").length.toString(), note: "Pipeline e relacionamento." },
                    { label: "Operacionais", value: totals.operational.toString(), note: "Sinais de execucao do ecossistema." },
                    { label: "Recentes", value: totals.recent.toString(), note: "Produzidos nos ultimos dias." },
                    { label: "Pendentes", value: totals.pending.toString(), note: "Ainda aguardando revisao." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <BaseCardV3 eyebrow="Leitura executiva" title="Resumo do mes" description="Alertas, oportunidades, riscos e proximos passos da agencia." className="rounded-[28px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        "As viagens premium mantem o ticket medio em alta.",
                        "Documentos seguem como principal ponto de revisao antes do embarque.",
                        "Leads qualificados vindos de indicacao convertem melhor.",
                        "Oportunidade de consolidar relatorios executivos por sessao.",
                      ].map((item) => (
                        <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>

                  <BaseCardV3 eyebrow="Top leituras" title="Relatorios em evidência" description="Os recortes mais consultados dentro do preview." className="rounded-[28px]">
                    <div className="space-y-2">
                      {reports.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.type} • {item.status}</div>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Select value={filters.type} onValueChange={(value) => setFilters((current) => ({ ...current, type: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {reportTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.period} onValueChange={(value) => setFilters((current) => ({ ...current, period: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Periodo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os periodos</SelectItem>
                      {reportPeriods.map((period) => <SelectItem key={period} value={period}>{period}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="Rascunho">Rascunho</SelectItem>
                      <SelectItem value="Gerado">Gerado</SelectItem>
                      <SelectItem value="Revisado">Revisado</SelectItem>
                      <SelectItem value="Exportado">Exportado</SelectItem>
                      <SelectItem value="Arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.format} onValueChange={(value) => setFilters((current) => ({ ...current, format: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Formato" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os formatos</SelectItem>
                      {reportFormats.map((format) => <SelectItem key={format} value={format}>{format}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredReports.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.45fr_0.9fr_0.9fr_0.9fr_1fr_1fr]">
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.origin} • {item.format}</div>
                          </div>
                          <div className="text-sm text-muted-foreground"><div>Tipo</div><div className="mt-1 text-zinc-100">{item.type}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Periodo</div><div className="mt-1 text-zinc-100">{item.periodLabel}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Status</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                          <div className="text-sm text-muted-foreground"><div>Criado em</div><div className="mt-1 text-zinc-100">{item.createdAt}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Responsavel</div><div className="mt-1 text-zinc-100">{item.owner}</div></div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <AgencyRebuildActionButton actionType="modal" label="Abrir" className="h-8 rounded-full px-3 text-xs" onAction={() => setDetailId(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Revisar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => reviewReport(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Duplicar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => duplicateReport(item.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Ver grafico" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                            setDetailId(item.id)
                            setGraphOpen(true)
                          }} />
                          <AgencyRebuildActionButton actionType="future" label="Exportar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="As exportacoes PDF e Excel serao conectadas depois." />
                          <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="h-8 rounded-full border-rose-400/20 bg-rose-400/[0.06] px-3 text-xs text-rose-100" onAction={() => deleteReport(item.id)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {[
                { key: "financial", label: "Financeiro", filter: ["Financeiro", "Fluxo de caixa", "Competencia"] as ReportType[] },
                { key: "trips", label: "Viagens", filter: ["Viagens"] as ReportType[] },
                { key: "leads", label: "Leads", filter: ["Leads"] as ReportType[] },
                { key: "clients", label: "Clientes", filter: ["Clientes"] as ReportType[] },
                { key: "documents", label: "Documentos", filter: ["Documentos"] as ReportType[] },
                { key: "operational", label: "Operacional", filter: ["Operacional", "Geral"] as ReportType[] },
              ].map((section) => (
                <TabsContent key={section.key} value={section.key as ReportsTab} className="space-y-3">
                  {reports.filter((item) => section.filter.includes(item.type)).map((item) => (
                    <BaseCardV3 key={item.id} eyebrow={section.label} title={item.title} description={item.summary} className="rounded-[24px]" />
                  ))}
                </TabsContent>
              ))}

              <TabsContent value="charts" className="space-y-4">
                <BaseCardV3 eyebrow="Graficos" title="Leitura visual local" description="Filtros por sessao e periodo sem poluicao visual." className="rounded-[28px]">
                  <div className="grid gap-4 md:grid-cols-[0.35fr_0.65fr]">
                    <div className="space-y-3">
                      <Select value={filters.session} onValueChange={(value) => setFilters((current) => ({ ...current, session: value }))}>
                        <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Sessao" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as sessoes</SelectItem>
                          {reportSessions.map((session) => <SelectItem key={session} value={session}>{session}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={filters.period} onValueChange={(value) => setFilters((current) => ({ ...current, period: value }))}>
                        <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Periodo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os periodos</SelectItem>
                          {reportPeriods.map((period) => <SelectItem key={period} value={period}>{period}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid min-h-[280px] grid-cols-4 items-end gap-3 rounded-[22px] border border-white/8 bg-black/16 p-4">
                      {(currentGraphReport?.chart ?? []).map((point) => (
                        <div key={point.label} className="flex h-full flex-col justify-end gap-2">
                          <div className="group relative flex-1">
                            <div
                              className="w-full rounded-t-[14px] bg-[linear-gradient(180deg,rgba(249,115,22,0.85),rgba(249,115,22,0.2))] transition-transform duration-200 group-hover:-translate-y-1"
                              style={{ height: `${Math.max(18, point.value)}%` }}
                            />
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/90 px-2.5 py-1 text-[11px] text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.35)] group-hover:block">
                              {(currentGraphReport?.type === "Financeiro" || currentGraphReport?.type === "Fluxo de caixa" || currentGraphReport?.type === "Competencia") ? "Valor" : currentGraphReport?.type ?? "Indicador"}: {point.value}
                            </div>
                          </div>
                          <div className="text-center text-[11px] text-muted-foreground">{point.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </BaseCardV3>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {historyItems.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.report}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        title="Gerar relatorio"
        description="Escolha tipo, periodo, sessoes e formato da leitura executiva."
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setGenerateOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Gerar relatorio" className="rounded-full" onAction={generateReport} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value as ReportType }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo do relatorio" /></SelectTrigger>
            <SelectContent>{reportTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.period} onValueChange={(value) => setForm((current) => ({ ...current, period: value as ReportPeriod }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Periodo" /></SelectTrigger>
            <SelectContent>{reportPeriods.map((period) => <SelectItem key={period} value={period}>{period}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.format} onValueChange={(value) => setForm((current) => ({ ...current, format: value as ReportFormat }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Formato" /></SelectTrigger>
            <SelectContent>{reportFormats.map((format) => <SelectItem key={format} value={format}>{format}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsavel" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 text-sm font-medium text-zinc-100">Sessoes incluidas</div>
              <div className="flex flex-wrap gap-2">
                {reportSessions.map((session) => {
                  const active = form.sessions.includes(session)
                  return (
                    <button
                      key={session}
                      type="button"
                      onClick={() => toggleSession(session)}
                      className={`rounded-full border px-3 py-2 text-xs transition ${active ? "border-primary/20 bg-primary/[0.10] text-zinc-100" : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/15"}`}
                    >
                      {session}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes, recorte executivo e foco da leitura." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedReport)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailId(null)
        }}
        title={selectedReport?.title ?? "Detalhes do relatorio"}
        description="Resumo executivo, indicadores, tabela, grafico, insights e historico do relatorio."
        contentClassName="sm:max-w-[1220px]"
      >
        {selectedReport ? (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <BaseCardV3 eyebrow={selectedReport.type} title="Resumo executivo" description={selectedReport.summary} className="rounded-[26px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedReport.indicators.map((item) => (
                    <div key={item.label} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">{item.label}</div>
                      <div className="mt-1 text-sm font-medium text-zinc-100">{item.value}</div>
                    </div>
                  ))}
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Insights" title="Sinais e recomendacoes" description="Leitura simulada e honesta do que o relatorio sugere agora." className="rounded-[26px]">
                <div className="space-y-2">
                  {selectedReport.insights.map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>
            </div>

            <BaseCardV3 eyebrow="Tabela de dados" title="Competencia e fluxo de caixa" description="Leitura premium tipo DRE com recorte atual." className="rounded-[28px]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
                      <th className="px-3 py-3">Bloco</th>
                      <th className="px-3 py-3">Realizado</th>
                      <th className="px-3 py-3">Previsto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.table.map((row) => (
                      <tr key={row.label} className="border-b border-white/6 text-muted-foreground">
                        <td className="px-3 py-3 text-zinc-100">{row.label}</td>
                        <td className="px-3 py-3">{row.realized}</td>
                        <td className="px-3 py-3">{row.projected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BaseCardV3>

            <div className="flex flex-wrap gap-2">
              <AgencyRebuildActionButton actionType="api" label="Revisar" className="rounded-full" onAction={() => reviewReport(selectedReport.id)} />
              <AgencyRebuildActionButton actionType="api" label="Duplicar" className="rounded-full" onAction={() => duplicateReport(selectedReport.id)} />
              <AgencyRebuildActionButton actionType="future" label="Exportar PDF" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A exportacao em PDF sera ativada depois no modulo real." />
              <AgencyRebuildActionButton actionType="future" label="Exportar Excel" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A exportacao Excel sera ativada em seguida." />
              <AgencyRebuildActionButton actionType="api" label="Arquivar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => archiveReport(selectedReport.id)} />
              <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/[0.06] text-rose-100" onAction={() => deleteReport(selectedReport.id)} />
            </div>
          </div>
        ) : null}
      </BaseModalV3>

      <BaseModalV3
        open={graphOpen}
        onOpenChange={setGraphOpen}
        title="Grafico operacional"
        description="Leitura visual local do relatorio selecionado, com tooltip em portugues e sem poluicao."
        contentClassName="sm:max-w-5xl"
      >
        {currentGraphReport ? (
          <div className="grid gap-4 md:grid-cols-[0.35fr_0.65fr]">
            <div className="space-y-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                <div className="text-sm font-medium text-zinc-100">{currentGraphReport.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{currentGraphReport.type} • {currentGraphReport.periodLabel}</div>
              </div>
              <Select value={filters.session} onValueChange={(value) => setFilters((current) => ({ ...current, session: value }))}>
                <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Sessao" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as sessoes</SelectItem>
                  {reportSessions.map((session) => <SelectItem key={session} value={session}>{session}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.period} onValueChange={(value) => setFilters((current) => ({ ...current, period: value }))}>
                <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Periodo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os periodos</SelectItem>
                  {reportPeriods.map((period) => <SelectItem key={period} value={period}>{period}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid min-h-[320px] grid-cols-4 items-end gap-4 rounded-[26px] border border-white/8 bg-black/16 p-5">
              {currentGraphReport.chart.map((point) => (
                <div key={point.label} className="flex h-full flex-col justify-end gap-3">
                  <div className="group relative flex-1">
                    <div
                      className="w-full rounded-t-[16px] bg-[linear-gradient(180deg,rgba(249,115,22,0.85),rgba(249,115,22,0.18))] transition-transform duration-200 group-hover:-translate-y-1"
                      style={{ height: `${Math.max(18, point.value)}%` }}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/95 px-2.5 py-1 text-[11px] text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.35)] group-hover:block">
                      {currentGraphReport.type === "Financeiro" || currentGraphReport.type === "Fluxo de caixa" || currentGraphReport.type === "Competencia" ? "Valor" : "Indicador"}: {point.value}
                    </div>
                  </div>
                  <div className="text-center text-[11px] text-muted-foreground">{point.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
