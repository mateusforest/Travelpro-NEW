"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DedicatedActionWorkspace, type WorkspaceSectionConfig } from "@/components/system/dedicated-action-workspace"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { toast } from "@/components/ui/use-toast"
import type { ReportRow } from "@/types/database"

const reportTypeOptions = ["Operacao geral", "Clientes", "Leads", "Viagens", "Documentos", "Financeiro", "Creditos"] as const
const periodOptions = ["Hoje", "Ultimos 7 dias", "Ultimos 30 dias", "Este mes", "Ultimo mes", "Este trimestre", "Este ano", "Personalizado"] as const
const exportOptions = ["PDF", "HTML", "PDF + HTML"] as const

const modulesByType: Record<string, string> = {
  "Operacao geral": "Clientes, leads, viagens, documentos, financeiro e creditos",
  Clientes: "Clientes",
  Leads: "Leads",
  Viagens: "Viagens",
  Documentos: "Documentos",
  Financeiro: "Financeiro",
  Creditos: "Creditos",
}

function normalizeValue(value: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function mapTemplateToType(value: string | null) {
  if (!value) return null
  const normalized = normalizeValue(value)

  if (normalized.includes("cliente")) return "Clientes"
  if (normalized.includes("lead")) return "Leads"
  if (normalized.includes("viagem")) return "Viagens"
  if (normalized.includes("document")) return "Documentos"
  if (normalized.includes("finance")) return "Financeiro"
  if (normalized.includes("credito")) return "Creditos"
  return "Operacao geral"
}

function mapFinancePeriodToReportPeriod(value: string | null) {
  switch (value) {
    case "Hoje":
      return "Hoje"
    case "Semana":
      return "Ultimos 7 dias"
    case "Mes":
    case "Mês":
      return "Este mes"
    case "Trimestre":
      return "Este trimestre"
    case "Ano":
      return "Este ano"
    case "Personalizado":
      return "Personalizado"
    default:
      return "Ultimos 30 dias"
  }
}

function sanitizePeriod(value: string | null | undefined) {
  const normalized = normalizeValue(value || null)

  if (normalized === "hoje") return "Hoje"
  if (normalized.includes("7")) return "Ultimos 7 dias"
  if (normalized.includes("30")) return "Ultimos 30 dias"
  if (normalized.includes("este mes")) return "Este mes"
  if (normalized.includes("ultimo mes")) return "Ultimo mes"
  if (normalized.includes("trimestre")) return "Este trimestre"
  if (normalized.includes("ano")) return "Este ano"
  if (normalized.includes("personalizado")) return "Personalizado"
  return "Ultimos 30 dias"
}

function buildDefaultName(type: string, period: string) {
  return `Relatorio ${type.toLowerCase()} - ${period.toLowerCase()}`
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => null)) as { error?: string } | T | null
  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Nao foi possivel concluir a operacao.")
  }
  return payload as T
}

function parseFilters(value: ReportRow["filters"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function buildNewReportValues(searchParams: URLSearchParams) {
  const type = mapTemplateToType(searchParams.get("template")) || mapTemplateToType(searchParams.get("type")) || "Operacao geral"
  const requestedPeriod = searchParams.get("type") === "Financeiro" ? mapFinancePeriodToReportPeriod(searchParams.get("period")) : sanitizePeriod(searchParams.get("period"))
  const period = requestedPeriod || "Ultimos 30 dias"
  const exportMode = searchParams.get("export")
  const financeFilter = searchParams.get("financeFilter") || "Todos"

  return {
    name: buildDefaultName(type, period),
    type,
    period,
    modules: modulesByType[type],
    export: exportOptions.includes((exportMode || "") as (typeof exportOptions)[number]) ? exportMode || "PDF + HTML" : "PDF + HTML",
    notes:
      searchParams.get("notes") ||
      (type === "Financeiro" && financeFilter !== "Todos"
        ? `Filtro automatico herdado do Financeiro: ${financeFilter}.`
        : ""),
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    financeFilter,
  }
}

function buildReportValues(report: ReportRow | undefined, searchParams: URLSearchParams): Record<string, string> {
  if (!report) {
    return buildNewReportValues(searchParams)
  }

  const filters = parseFilters(report.filters)
  const type = mapTemplateToType(report.type) || "Operacao geral"
  const period = sanitizePeriod(typeof filters.period === "string" ? filters.period : "Ultimos 30 dias")

  return {
    name: report.name || buildDefaultName(type, period),
    type,
    period,
    modules: typeof filters.modules === "string" ? filters.modules : modulesByType[type] || modulesByType["Operacao geral"],
    export: typeof filters.export === "string" ? filters.export : "PDF + HTML",
    notes: typeof filters.notes === "string" ? filters.notes : "",
    startDate: typeof filters.startDate === "string" ? filters.startDate : "",
    endDate: typeof filters.endDate === "string" ? filters.endDate : "",
    financeFilter: typeof filters.financeFilter === "string" ? filters.financeFilter : "Todos",
  }
}

function ReportWorkspaceInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get("id")
  const isEditing = Boolean(reportId)
  const [report, setReport] = useState<ReportRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const reportData = reportId ? await fetchJson<ReportRow>(`/api/reports/${reportId}`) : null
        if (!active) return
        setReport(reportData)
      } catch (error) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o relatorio.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [reportId])

  const initialValues = useMemo(() => buildReportValues(report ?? undefined, searchParams), [report, searchParams])

  const sections: WorkspaceSectionConfig[] = useMemo(
    () => [
      {
        title: "Configuracao do relatorio",
        description: "Escolha um recorte operacional real com base nas tabelas ja integradas da agencia.",
        fields: [
          { key: "name", label: "Nome do relatorio", placeholder: "Ex.: Relatorio financeiro mensal" },
          { key: "type", label: "Tipo de relatorio", type: "select", options: [...reportTypeOptions] },
          { key: "period", label: "Periodo", type: "select", options: [...periodOptions] },
          {
            key: "startDate",
            label: "Data inicial",
            placeholder: "AAAA-MM-DD",
            description: "Preencha o periodo manual apenas quando o recorte for personalizado.",
            hidden: (values) => values.period !== "Personalizado",
          },
          {
            key: "endDate",
            label: "Data final",
            placeholder: "AAAA-MM-DD",
            description: "Feche o intervalo do recorte personalizado antes de gerar o relatorio.",
            hidden: (values) => values.period !== "Personalizado",
          },
          {
            key: "modules",
            label: "Modulos incluidos",
            type: "textarea",
            rows: 3,
            readOnly: true,
            description: "Os modulos sao preenchidos automaticamente de acordo com o tipo de relatorio selecionado.",
            colSpan: 2,
          },
          {
            key: "financeFilter",
            label: "Filtro do Financeiro",
            readOnly: true,
            description: "Quando o fluxo comeca no Financeiro, este recorte e herdado automaticamente para o relatorio.",
            hidden: (values) => values.type !== "Financeiro",
          },
          { key: "export", label: "Exportacao", type: "select", options: [...exportOptions] },
          {
            key: "notes",
            label: "Notas internas do relatorio",
            type: "textarea",
            rows: 4,
            colSpan: 2,
            description: "Use este campo para registrar contexto interno, observacoes do periodo ou pontos importantes da operacao.",
          },
        ],
      },
    ],
    [],
  )

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando relatorio" description="Sincronizando configuracao real do relatorio.">
          <div className="space-y-3">
            <div className="h-4 w-48 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
          </div>
        </DashboardCard>
      </PageShell>
    )
  }

  if (loadError) {
    return (
      <PageShell>
        <DashboardCard title="Nao foi possivel abrir o relatorio" description={loadError}>
          <Button className="rounded-full" onClick={() => router.replace("/app/relatorios")}>
            Voltar para relatorios
          </Button>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <DedicatedActionWorkspace
      title={isEditing ? "Editar relatorio" : "Novo relatorio"}
      description="Monte um relatorio operacional real com base nos modulos ja integrados ao Supabase."
      backHref="/app/relatorios"
      backLabel="Voltar para relatorios"
      aiActionLabel="Gerar com IA"
      aiActionDescription="A sugestao automatica de recortes com IA ainda sera integrada a este modulo."
      primaryActionLabel={isEditing ? "Salvar relatorio" : "Gerar relatorio"}
      hideDraftAction
      hidePreviewAction
      previewTitle="Resumo do relatorio"
      previewDescription="Previa do recorte antes da geracao."
      initialValues={initialValues}
      sections={sections}
      transformValues={(nextValues, changedKey) => {
        const type = nextValues.type || "Operacao geral"
        const next = { ...nextValues, modules: modulesByType[type] || modulesByType["Operacao geral"] }

        if (changedKey === "type") {
          next.name = buildDefaultName(type, next.period || "Ultimos 30 dias")
          if (type !== "Financeiro") {
            next.financeFilter = "Todos"
          }
        }

        if (changedKey === "period" && next.period !== "Personalizado") {
          next.startDate = ""
          next.endDate = ""
        }

        return next
      }}
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.type || "Relatorio operacional"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {values.period === "Personalizado" && (values.startDate || values.endDate)
              ? `${values.startDate || "inicio aberto"} ate ${values.endDate || "fim aberto"}`
              : values.period || "Ultimos 30 dias"}
          </p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">{values.modules || modulesByType["Operacao geral"]}</div>
          {values.type === "Financeiro" && values.financeFilter && values.financeFilter !== "Todos" ? (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary/80">Filtro herdado: {values.financeFilter}</p>
          ) : null}
          {values.notes.trim() ? <p className="mt-3 text-sm text-muted-foreground">{values.notes.trim()}</p> : null}
        </div>
      )}
      sidebarInfo={{
        title: "Leitura analitica",
        description: "O relatorio e salvo na base real e pode ser aberto, baixado, exportado e regenerado.",
        items: [
          { label: "Tipo", value: (values) => values.type || "Operacao geral" },
          { label: "Periodo", value: (values) => (values.period === "Personalizado" ? `${values.startDate || "inicio aberto"} ate ${values.endDate || "fim aberto"}` : values.period || "Ultimos 30 dias") },
          { label: "Exportacao", value: (values) => values.export || "PDF + HTML" },
        ],
      }}
      onPrimaryAction={async (values) => {
        if (!values.name.trim() || values.name.trim().length < 2) {
          throw new Error("Informe um nome valido para o relatorio.")
        }

        if (values.period === "Personalizado" && !values.startDate && !values.endDate) {
          throw new Error("Defina ao menos uma data para o recorte personalizado.")
        }

        const composeParams = new URLSearchParams({
          type: values.type || "Operacao geral",
          period: values.period || "Ultimos 30 dias",
        })

        if (values.startDate) composeParams.set("startDate", values.startDate)
        if (values.endDate) composeParams.set("endDate", values.endDate)
        if (values.type === "Financeiro" && values.financeFilter && values.financeFilter !== "Todos") {
          composeParams.set("financeFilter", values.financeFilter)
        }

        const composed = await fetchJson<{ title: string; lines: string[]; payload: unknown }>(`/api/reports/compose?${composeParams.toString()}`)

        const saved = await fetchJson<ReportRow>(isEditing ? `/api/reports/${reportId}` : "/api/reports", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            name: values.name.trim(),
            type: values.type || "Operacao geral",
            status: "Pronto",
            filters: {
              period: values.period.trim() || "Ultimos 30 dias",
              modules: values.modules.trim(),
              export: values.export.trim(),
              notes: values.notes.trim(),
              startDate: values.startDate.trim(),
              endDate: values.endDate.trim(),
              financeFilter: values.type === "Financeiro" ? values.financeFilter.trim() || "Todos" : undefined,
              preview: { title: composed.title, lines: composed.lines },
              payload: composed.payload,
            },
          }),
        })

        await fetchJson("/api/credit-transactions", {
          method: "POST",
          body: JSON.stringify({
            type: "consumo",
            amount: 12,
            feature: "Relatorios operacionais",
            source: isEditing ? "Atualizacao de relatorio" : "Geracao de relatorio",
          }),
        })

        toast({
          title: isEditing ? "Relatorio atualizado" : "Relatorio gerado",
          description: isEditing
            ? "O relatorio foi atualizado, salvo e esta pronto para exportacao."
            : "O relatorio foi salvo na base real e ja pode ser aberto, baixado e exportado.",
        })

        const exportMode = values.export === "PDF" ? "pdf" : values.export === "HTML" ? "html" : values.export === "PDF + HTML" ? "pdf-html" : ""

        router.replace(exportMode ? `/app/relatorios/${saved.id}?export=${exportMode}` : `/app/relatorios/${saved.id}`)
        router.refresh()
      }}
    />
  )
}

export function ReportWorkspace() {
  return (
    <Suspense fallback={null}>
      <ReportWorkspaceInner />
    </Suspense>
  )
}
