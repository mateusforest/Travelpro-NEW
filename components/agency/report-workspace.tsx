"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DedicatedActionWorkspace, type WorkspaceSectionConfig } from "@/components/system/dedicated-action-workspace"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { toast } from "@/components/ui/use-toast"
import type { ReportRow } from "@/types/database"

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

function buildReportValues(report?: ReportRow): Record<string, string> {
  const filters = report ? parseFilters(report.filters) : {}
  return {
    name: report?.name ?? "Resumo operacional",
    type: report?.type ?? "Resumo operacional",
    period: typeof filters.period === "string" ? filters.period : "Últimos 30 dias",
    modules: typeof filters.modules === "string" ? filters.modules : "Clientes, leads, viagens, documentos, financeiro, créditos",
    export: typeof filters.export === "string" ? filters.export : "PDF",
    filters: typeof filters.notes === "string" ? filters.notes : "",
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
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o relatório.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [reportId])

  const sections: WorkspaceSectionConfig[] = useMemo(
    () => [
      {
        title: "Configuração do relatório",
        description: "Escolha um recorte leve, operacional e baseado nas tabelas reais da agência.",
        fields: [
          { key: "name", label: "Nome do relatório" },
          { key: "type", label: "Tipo de relatório", type: "select", options: ["Resumo operacional", "Crescimento de leads", "Viagens criadas", "Documentos emitidos", "Receitas e despesas", "Consumo de créditos", "Próximos embarques"] },
          { key: "period", label: "Período" },
          { key: "modules", label: "Módulos" },
          { key: "export", label: "Exportação" },
          { key: "filters", label: "Observações do recorte", type: "textarea", rows: 4, colSpan: 2 },
        ],
      },
    ],
    [],
  )

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando relatório" description="Sincronizando configuração real do relatório.">
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
        <DashboardCard title="Nao foi possivel abrir o relatório" description={loadError}>
          <Button className="rounded-full" onClick={() => router.replace("/app/central-operacional/relatorios")}>
            Voltar para relatórios
          </Button>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <DedicatedActionWorkspace
      title={isEditing ? "Editar relatório" : "Novo relatório"}
      description="Monte um relatório operacional real com base nos módulos já integrados ao Supabase."
      backHref="/app/central-operacional/relatorios"
      backLabel="Voltar para relatórios"
      aiActionLabel="Gerar com IA"
      aiActionDescription="A sugestão automática de recortes com IA ainda será integrada a este módulo."
      primaryActionLabel={isEditing ? "Salvar relatório" : "Gerar relatório"}
      hideDraftAction
      previewTitle="Resumo do relatório"
      previewDescription="Prévia do recorte antes da geração."
      initialValues={buildReportValues(report ?? undefined)}
      sections={sections}
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.type || "Relatório operacional"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.period || "Últimos 30 dias"}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.modules || "Clientes, leads, viagens, documentos, financeiro e créditos"}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura analítica",
        description: "O relatório é salvo na base real e pode gerar consumo operacional de créditos.",
        items: [
          { label: "Tipo", value: (values) => values.type || "Resumo operacional" },
          { label: "Período", value: (values) => values.period || "Últimos 30 dias" },
          { label: "Exportação", value: (values) => values.export || "PDF" },
        ],
      }}
      onPrimaryAction={async (values) => {
        if (!values.name.trim() || values.name.trim().length < 2) {
          throw new Error("Informe um nome válido para o relatório.")
        }

        const overview = await fetchJson<{ title: string; lines: string[] }>(`/api/reports/overview-snapshot?type=${encodeURIComponent(values.type || "Resumo operacional")}&period=${encodeURIComponent(values.period || "Últimos 30 dias")}`)

        await fetchJson<ReportRow>(isEditing ? `/api/reports/${reportId}` : "/api/reports", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            name: values.name.trim(),
            type: values.type || "Resumo operacional",
            status: "Pronto",
            filters: {
              period: values.period.trim() || "Últimos 30 dias",
              modules: values.modules.trim(),
              export: values.export.trim(),
              notes: values.filters.trim(),
              preview: overview,
            },
          }),
        })

        await fetchJson("/api/credit-transactions", {
          method: "POST",
          body: JSON.stringify({
            type: "consumo",
            amount: 12,
            feature: "Relatórios operacionais",
            source: isEditing ? "Atualização de relatório" : "Geração de relatório",
          }),
        })

        toast({
          title: isEditing ? "Relatório atualizado" : "Relatório gerado",
          description: isEditing ? "O relatório foi atualizado e o consumo operacional foi registrado." : "O relatório foi salvo na base real e o consumo operacional foi registrado.",
        })

        router.replace("/app/central-operacional/relatorios")
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
