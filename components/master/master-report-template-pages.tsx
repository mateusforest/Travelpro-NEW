"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRightLeft,
  Building2,
  Copy,
  Download,
  Eye,
  FilePenLine,
  FileStack,
  FolderOpen,
  RefreshCcw,
  Sparkles,
} from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { EmptyState } from "@/components/system/empty-state"
import { FilterTabs } from "@/components/system/filter-tabs"
import { MetricCard } from "@/components/system/metric-card"
import { PageShell } from "@/components/system/page-shell"
import { SearchInput } from "@/components/system/search-input"
import { SectionHeader } from "@/components/system/section-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type {
  MasterReportDetail,
  MasterReportOverview,
  MasterTemplateDetail,
  MasterTemplateOverview,
} from "@/types/master"
import type { ReportRow } from "@/types/database"

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
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

function formatDateLabel(value?: string | null) {
  if (!value) return "Sem data"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function normalizeStatusLabel(value: string | null | undefined) {
  if (!value) return "Sem status"
  const normalized = value.toLowerCase()
  if (normalized.includes("draft") || normalized.includes("rascun")) return "Rascunho"
  if (normalized.includes("public")) return "Publicado"
  if (normalized.includes("active") || normalized.includes("ativo")) return "Ativo"
  if (normalized.includes("ready") || normalized.includes("pronto")) return "Pronto"
  if (normalized.includes("review") || normalized.includes("revis")) return "Em revisao"
  return value
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized.includes("public") || normalized.includes("ativo") || normalized.includes("pronto")) return "success"
  if (normalized.includes("revis") || normalized.includes("pend") || normalized.includes("rascun")) return "warning"
  if (normalized.includes("erro") || normalized.includes("falha")) return "danger"
  return "info"
}

function StatusPill({ label }: { label: string }) {
  const tone = statusTone(label)
  const styles =
    tone === "success"
      ? "border-green-400/20 bg-green-400/10 text-green-300"
      : tone === "danger"
        ? "border-red-400/20 bg-red-400/10 text-red-300"
        : tone === "warning"
          ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
          : "border-sky-400/20 bg-sky-400/10 text-sky-300"

  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] ${styles}`}>{label}</span>
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function MasterReportsRealPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<MasterReportOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<MasterReportDetail | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [busyReportId, setBusyReportId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          type: typeFilter,
          status: statusFilter,
        })
        const data = await requestJson<MasterReportOverview>(`/api/master/reports?${params.toString()}`)
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar os relatorios master.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [searchTerm, typeFilter, statusFilter])

  useEffect(() => {
    if (!selectedId) {
      setSelectedReport(null)
      return
    }

    let active = true
    const loadDetail = async () => {
      try {
        const data = await requestJson<MasterReportDetail>(`/api/master/reports/${selectedId}`)
        if (!active) return
        setSelectedReport(data)
      } catch (error) {
        if (!active) return
        toast({ title: "Falha ao abrir detalhe", description: error instanceof Error ? error.message : "Nao foi possivel abrir o relatorio." })
      }
    }

    void loadDetail()
    return () => {
      active = false
    }
  }, [selectedId])

  const typeTabs = useMemo(() => ["Todos", ...(overview?.by_type.map((item) => item.label) ?? [])], [overview?.by_type])

  const generateReport = async () => {
    try {
      setIsGenerating(true)
      const composed = await requestJson<{ title: string; lines: string[]; payload: unknown }>(
        "/api/reports/compose?type=Operacao%20geral&period=Ultimos%2030%20dias",
      )

      const saved = await requestJson<ReportRow>("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          name: `Relatorio master - ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())}`,
          type: "Operacao geral",
          status: "Pronto",
          filters: {
            period: "Ultimos 30 dias",
            origin: "Master",
            preview: {
              title: composed.title,
              lines: composed.lines,
            },
            payload: composed.payload,
          },
        }),
      })

      router.push(`/master/relatorios/${saved.id}`)
    } catch (error) {
      toast({ title: "Falha ao gerar", description: error instanceof Error ? error.message : "Nao foi possivel gerar o relatorio." })
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateReport = async (id: string) => {
    try {
      setBusyReportId(id)
      await requestJson(`/api/reports/${id}/regenerate`, { method: "POST" })
      toast({ title: "Relatorio regenerado", description: "O relatorio foi atualizado com os dados reais mais recentes." })
      const params = new URLSearchParams({
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
      })
      setOverview(await requestJson<MasterReportOverview>(`/api/master/reports?${params.toString()}`))
    } catch (error) {
      toast({ title: "Falha ao regenerar", description: error instanceof Error ? error.message : "Nao foi possivel regenerar o relatorio." })
    } finally {
      setBusyReportId(null)
    }
  }

  const records = overview?.items ?? []
  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  const paginatedRecords = records.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [searchTerm, typeFilter, statusFilter])

  return (
    <PageShell>
      <SectionHeader
        title="Relatorios"
        description="Base global real de relatorios gerados na plataforma, com historico, tipo, agencia e origem."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => void generateReport()} disabled={isGenerating}>
              {isGenerating ? "Gerando..." : "Gerar relatorio"}
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Exportacao direta em contexto", description: "Use os botoes de cada relatorio salvo para exportar ou baixar o arquivo real." })}>
              Exportar
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Relatorios" value={isLoading ? "--" : String(overview?.summary.total ?? 0)} change={`${overview?.summary.recent_count ?? 0} recentes`} tone="info" icon={FolderOpen} />
        <MetricCard label="Agencias com historico" value={isLoading ? "--" : String(overview?.summary.agencies_with_reports ?? 0)} change="Base real por agencia" tone="success" icon={Building2} />
        <MetricCard label="Exportacoes" value={isLoading ? "--" : String(overview?.summary.export_count ?? 0)} change="Somente quando houver dado real" tone="warning" icon={Download} />
        <MetricCard label="Tipos ativos" value={isLoading ? "--" : String(overview?.by_type.length ?? 0)} change="Distribuicao da plataforma" tone="default" icon={FileStack} />
      </div>

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar os relatorios master agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar nome, tipo, origem ou agencia" value={searchTerm} onChange={setSearchTerm} />
        </div>
        <FilterTabs items={typeTabs} activeItem={typeFilter} onChange={setTypeFilter} />
        <FilterTabs items={["Todos", "Pronto", "Rascunho", "Em revisao"]} activeItem={statusFilter} onChange={setStatusFilter} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Historico real" description="Todos os relatorios persistidos no Supabase, com leitura segura por agencia e tipo.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => <div key={`master-report-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
            </div>
          ) : records.length === 0 ? (
            <EmptyState title="Nenhum relatorio encontrado" description="Quando o Master ou as agencias gerarem relatorios reais, o historico global aparecera aqui." actionLabel="Gerar relatorio" onAction={() => void generateReport()} />
          ) : (
            <div className="space-y-3">
              {paginatedRecords.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <StatusPill label={normalizeStatusLabel(item.status)} />
                      <StatusPill label={item.type} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.agency_name || "TravelPro Master"} • origem {item.origin}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Criado em {formatDateLabel(item.created_at)} • atualizado em {formatDateLabel(item.updated_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                      <Link href={`/master/relatorios/${item.id}`}>Abrir relatorio</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSelectedId(item.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => { window.location.href = `/api/reports/${item.id}/download` }}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                    <Button className="rounded-full" onClick={() => void regenerateReport(item.id)} disabled={busyReportId === item.id}>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      {busyReportId === item.id ? "Gerando..." : "Gerar novamente"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && records.length > pageSize ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Pagina {page} de {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" disabled={page === 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                  Anterior
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(current + 1, totalPages))}>
                  Proxima
                </Button>
              </div>
            </div>
          ) : null}
        </DashboardCard>

        <DashboardCard title="Distribuicao e recencia" description="Leituras leves para tipo, agencias com mais volume e recencia do modulo.">
          <div className="space-y-3">
            {(overview?.by_type ?? []).slice(0, 5).map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                {item.label} • {item.count} registros
              </div>
            ))}
            {(overview?.by_agency ?? []).slice(0, 5).map((item) => (
              <div key={`${item.agency_id || "master"}-${item.agency_name}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-foreground">{item.agency_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.count} relatorios registrados</p>
                <Button asChild variant="outline" className="mt-3 rounded-full border-white/10 bg-white/[0.03]">
                  <Link href="/master/agencias">Ver agencia</Link>
                </Button>
              </div>
            ))}
            {!isLoading && (overview?.by_type.length ?? 0) === 0 && (overview?.by_agency.length ?? 0) === 0 ? (
              <EmptyState title="Sem distribuicao ainda" description="O painel executivo por tipo e agencia aparece assim que houver relatorios reais suficientes para leitura global." />
            ) : null}
          </div>
        </DashboardCard>
      </div>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedReport ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedReport.name}</DialogTitle>
                <DialogDescription>Detalhe real do relatorio salvo, com origem, agencia e resumo persistido quando disponivel.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard label="Agencia" value={selectedReport.agency_name || "TravelPro Master"} />
                  <InfoCard label="Tipo" value={selectedReport.type} />
                  <InfoCard label="Status" value={normalizeStatusLabel(selectedReport.status)} />
                  <InfoCard label="Origem" value={selectedReport.origin} />
                </div>

                <DashboardCard title="Preview resumido" description="Linhas salvas no payload quando o relatorio foi persistido.">
                  {selectedReport.preview_lines.length > 0 ? (
                    <div className="space-y-3">
                      {selectedReport.preview_lines.map((line, index) => (
                        <div key={`${selectedReport.id}-line-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{line}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem preview persistido neste registro. Abra o relatorio para ver o documento completo.</p>
                  )}
                </DashboardCard>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                  <Link href="/master/agencias">Ver agencia</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href={`/master/relatorios/${selectedReport.id}`}>Abrir relatorio</Link>
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Carregando detalhe real do relatorio...</div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterTemplatesRealPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<MasterTemplateOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("Todos")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<MasterTemplateDetail | null>(null)
  const [busyTemplateId, setBusyTemplateId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          filter,
        })
        const data = await requestJson<MasterTemplateOverview>(`/api/master/templates?${params.toString()}`)
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar os templates master.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [searchTerm, filter])

  useEffect(() => {
    if (!selectedId) {
      setSelectedTemplate(null)
      return
    }

    let active = true
    const loadDetail = async () => {
      try {
        const data = await requestJson<MasterTemplateDetail>(`/api/master/templates/${selectedId}`)
        if (!active) return
        setSelectedTemplate(data)
      } catch (error) {
        if (!active) return
        toast({ title: "Falha ao abrir detalhe", description: error instanceof Error ? error.message : "Nao foi possivel abrir o template." })
      }
    }
    void loadDetail()
    return () => {
      active = false
    }
  }, [selectedId])

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      setBusyTemplateId(id)
      const nextStatus = currentStatus.toLowerCase().includes("ativo") || currentStatus.toLowerCase().includes("public") ? "Inativo" : "Ativo"
      await requestJson(`/api/master/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })
      toast({ title: "Status atualizado", description: "O template foi atualizado com sucesso." })
      const params = new URLSearchParams({ search: searchTerm, filter })
      setOverview(await requestJson<MasterTemplateOverview>(`/api/master/templates?${params.toString()}`))
    } catch (error) {
      toast({ title: "Falha ao atualizar", description: error instanceof Error ? error.message : "Nao foi possivel atualizar o template." })
    } finally {
      setBusyTemplateId(null)
    }
  }

  const publishTemplate = async (id: string) => {
    try {
      setBusyTemplateId(id)
      await requestJson(`/api/master/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Publicado", is_official: true }),
      })
      toast({ title: "Template publicado", description: "O template foi marcado como oficial da plataforma." })
      const params = new URLSearchParams({ search: searchTerm, filter })
      setOverview(await requestJson<MasterTemplateOverview>(`/api/master/templates?${params.toString()}`))
    } catch (error) {
      toast({ title: "Falha ao publicar", description: error instanceof Error ? error.message : "Nao foi possivel publicar o template." })
    } finally {
      setBusyTemplateId(null)
    }
  }

  const records = overview?.items ?? []

  return (
    <PageShell>
      <SectionHeader
        title="Templates"
        description="Biblioteca oficial real da plataforma, reaproveitando templates persistidos e metadados do ecossistema."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full"><Link href="/master/templates/new">Novo template</Link></Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "IA em breve", description: "A geracao inteligente de templates sera ligada em uma etapa futura, sem backend fake agora." })}>
              Gerar com IA
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Templates" value={isLoading ? "--" : String(overview?.summary.total ?? 0)} change={`${overview?.summary.active ?? 0} ativos`} tone="info" icon={FileStack} />
        <MetricCard label="Oficiais" value={isLoading ? "--" : String(overview?.summary.official ?? 0)} change="Marcados para a plataforma" tone="success" icon={Sparkles} />
        <MetricCard label="Agencias com uso" value={isLoading ? "--" : String(overview?.summary.agencies_using ?? 0)} change="Base real de distribuicao" tone="warning" icon={Building2} />
        <MetricCard label="Tipos" value={isLoading ? "--" : String(overview?.by_type.length ?? 0)} change="Documento, relatorio, roteiro e mais" tone="default" icon={FolderOpen} />
      </div>

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar os templates master agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar template, tipo, categoria ou agencia" value={searchTerm} onChange={setSearchTerm} />
        </div>
        <FilterTabs items={["Todos", "Ativos", "Oficiais", "Documento", "Relatorio", "Roteiro", "Cotacao", "Catalogo"]} activeItem={filter} onChange={setFilter} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Biblioteca real" description="Templates persistidos na base, com tipo, status, oficializacao e agencia de origem.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => <div key={`master-template-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
            </div>
          ) : records.length === 0 ? (
            <EmptyState title="Nenhum template encontrado" description="Quando a plataforma ou as agencias persistirem templates reais, a biblioteca oficial aparecera aqui." actionLabel="Novo template" actionHref="/master/templates/new" />
          ) : (
            <div className="space-y-3">
              {records.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <StatusPill label={normalizeStatusLabel(item.status)} />
                      <StatusPill label={item.template_type} />
                      {item.is_official ? <StatusPill label="Oficial" /> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.agency_name || "Sem agencia"} • {item.category || "Sem categoria"} • {item.version || "Sem versao"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Atualizado em {formatDateLabel(item.updated_at)} • compatibilidades {item.compatibilities.join(", ") || "Sem marcacao"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSelectedId(item.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/master/templates/new?id=${item.id}`)}>
                      <FilePenLine className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/master/templates/new?source=${item.id}`)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void toggleStatus(item.id, item.status)} disabled={busyTemplateId === item.id}>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Ativar/desativar
                    </Button>
                    <Button className="rounded-full" onClick={() => void publishTemplate(item.id)} disabled={busyTemplateId === item.id}>
                      Publicar template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Atividade e distribuicao" description="Leituras leves para tipos mais usados e atividade recente da biblioteca.">
          <div className="space-y-3">
            {(overview?.by_type ?? []).slice(0, 5).map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                {item.label} • {item.count} registros
              </div>
            ))}
            {(overview?.recent_activity ?? []).slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDateLabel(item.created_at)}</p>
              </div>
            ))}
            {!isLoading && (overview?.by_type.length ?? 0) === 0 && (overview?.recent_activity.length ?? 0) === 0 ? (
              <EmptyState title="Sem atividade recente" description="A trilha da biblioteca oficial aparece quando houver templates ou audit logs relacionados." />
            ) : null}
          </div>
        </DashboardCard>
      </div>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedTemplate ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedTemplate.title}</DialogTitle>
                <DialogDescription>Detalhe real do template com origem, tipo, variaveis e marcacoes oficiais.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard label="Agencia" value={selectedTemplate.agency_name || "Sem agencia"} />
                  <InfoCard label="Tipo" value={selectedTemplate.template_type} />
                  <InfoCard label="Status" value={normalizeStatusLabel(selectedTemplate.status)} />
                  <InfoCard label="Modelo" value={selectedTemplate.pricing_tier || "Sem tier"} />
                  <InfoCard label="Versao" value={selectedTemplate.version || "Sem versao"} />
                  <InfoCard label="Arquivo" value={selectedTemplate.file_name || "Sem arquivo"} />
                  <InfoCard label="Oficial" value={selectedTemplate.is_official ? "Sim" : "Nao"} />
                  <InfoCard label="Categoria" value={selectedTemplate.category || "Sem categoria"} />
                </div>

                <DashboardCard title="Variaveis e personalizacao" description="Campos reaproveitaveis persistidos no metadata do template.">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description || "Sem descricao operacional."}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.length > 0 ? selectedTemplate.variables.map((item, index) => (
                        <span key={`${selectedTemplate.id}-var-${index}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">{item}</span>
                      )) : <p className="text-sm text-muted-foreground">Sem variaveis mapeadas.</p>}
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title="Assets e anexos" description="Branding assets, previews e arquivos auxiliares persistidos neste template.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard label="Preview" value={selectedTemplate.preview_image_url ? "Configurado" : "Sem preview"} />
                    <InfoCard label="Capa" value={selectedTemplate.cover_image_url ? "Configurada" : "Sem capa"} />
                    <InfoCard label="Assets" value={String(selectedTemplate.branding_assets.length)} />
                    <InfoCard label="Anexos" value={String(selectedTemplate.attachments.length)} />
                  </div>
                </DashboardCard>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/master/templates/new?source=${selectedTemplate.id}`)}>
                  Usar como base
                </Button>
                <Button className="rounded-full" onClick={() => router.push(`/master/templates/new?id=${selectedTemplate.id}`)}>
                  Editar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Carregando detalhe real do template...</div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
