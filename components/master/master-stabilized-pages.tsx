"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  BadgeCheck,
  BellRing,
  Building2,
  FolderOpen,
  RefreshCcw,
  ShieldAlert,
  Store,
} from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { EmptyState } from "@/components/system/empty-state"
import { FilterTabs } from "@/components/system/filter-tabs"
import { MetricCard } from "@/components/system/metric-card"
import { PageShell } from "@/components/system/page-shell"
import { SearchInput } from "@/components/system/search-input"
import { SectionHeader } from "@/components/system/section-header"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type {
  MasterDashboardOverview,
  MasterLogOverview,
  MasterMarketplaceOverview,
  MasterPlanOverview,
} from "@/types/master"

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

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0))
}

function normalizeStatusLabel(value: string | null | undefined) {
  if (!value) return "Sem status"
  const normalized = value.toLowerCase()
  if (normalized.includes("active") || normalized.includes("ativo") || normalized.includes("public")) return "Ativo"
  if (normalized.includes("draft") || normalized.includes("rascun")) return "Rascunho"
  if (normalized.includes("inactive") || normalized.includes("inativ")) return "Inativo"
  if (normalized.includes("pend")) return "Pendente"
  if (normalized.includes("error") || normalized.includes("fail")) return "Erro"
  return value
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized.includes("erro") || normalized.includes("fail") || normalized.includes("atras")) return "danger"
  if (normalized.includes("ativo") || normalized.includes("public") || normalized.includes("success")) return "success"
  if (normalized.includes("pend") || normalized.includes("rascun") || normalized.includes("warning")) return "warning"
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

export function MasterMarketplaceStablePage() {
  const [overview, setOverview] = useState<MasterMarketplaceOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterMarketplaceOverview>("/api/master/marketplace")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o marketplace.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const publishedItems = (overview?.items ?? []).filter((item) => normalizeStatusLabel(item.status) === "Ativo")

  return (
    <PageShell>
      <SectionHeader
        title="Marketplace"
        description="Camada preparatoria do TravelPro Match com leitura real do catalogo publicado, sem estatisticas inventadas."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => toast({ title: "Destaque em breve", description: "O impulsionamento do Match entra quando a camada comercial do marketplace estiver segura." })}>
              Citar destaque
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Exportacao em breve", description: "A exportacao do marketplace chega junto com a camada real do Match." })}>
              Exportar relatorio
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Agencias com vitrine" value={isLoading ? "--" : String(overview?.summary.agencies_with_packages ?? 0)} change="Base real do catalogo" tone="success" icon={Building2} />
        <MetricCard label="Pacotes publicados" value={isLoading ? "--" : String(overview?.summary.published_packages ?? 0)} change="Sem Match fake" tone="info" icon={Store} />
        <MetricCard label="Rascunhos internos" value={isLoading ? "--" : String(overview?.summary.draft_packages ?? 0)} change="Ainda fora da vitrine publica" tone="warning" icon={FolderOpen} />
        <MetricCard label="Vitrines publicas" value={isLoading ? "--" : String(overview?.summary.public_showcases ?? 0)} change="Links reais de agencia" tone="default" icon={BadgeCheck} />
      </div>

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar a base do marketplace agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <DashboardCard title="Base real do catalogo" description="Leitura segura dos pacotes ja persistidos pelas agencias e prontos para evoluir para o Match.">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={`market-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
          </div>
        ) : publishedItems.length === 0 ? (
          <EmptyState title="Sem base publica para o marketplace ainda" description="Assim que houver pacotes publicados pelas agencias, esta camada deixa de ser apenas preparatoria e passa a refletir o acervo real." actionLabel="Abrir catalogos" actionHref="/master/agencias" />
        ) : (
          <div className="space-y-3">
            {publishedItems.slice(0, 12).map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <StatusPill label={normalizeStatusLabel(item.status)} />
                    {item.category ? <StatusPill label={item.category} /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.agency_name || "Agencia sem nome"}{item.destination ? ` • ${item.destination}` : ""}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Preco {item.price_label || "Nao informado"} • atualizado em {formatDateLabel(item.updated_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                    <Link href={item.agency_slug ? `/catalogo/${item.agency_slug}` : "/master/agencias"}>
                      Abrir vitrine
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Edicao na agencia", description: "A edicao do pacote continua no portal da agencia para preservar o isolamento do tenant." })}>
                    Editar
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Destaque em breve", description: "A priorizacao do pacote depende da camada comercial do Match e continua futura." })}>
                    Destacar
                  </Button>
                  <Button className="rounded-full" onClick={() => toast({ title: "Remocao em breve", description: "A remocao global nao foi ligada no Master para nao interferir no catalogo da agencia sem trilha segura." })}>
                    Remover pacote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </PageShell>
  )
}

function MasterLogsBase({
  title,
  description,
  scope,
  futureTitle,
  futureDescription,
}: {
  title: string
  description: string
  scope?: string
  futureTitle: string
  futureDescription: string
}) {
  const [overview, setOverview] = useState<MasterLogOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const params = new URLSearchParams()
        if (scope) params.set("scope", scope)
        if (searchTerm) params.set("search", searchTerm)
        const data = await requestJson<MasterLogOverview>(`/api/master/logs?${params.toString()}`)
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar os logs.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [scope, searchTerm])

  const visibleItems = expanded ? (overview?.items ?? []).slice(0, 24) : (overview?.items ?? []).slice(0, 8)

  return (
    <PageShell>
      <SectionHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => toast({ title: futureTitle, description: futureDescription })}>
              {scope === "atlas" ? "Criar artigo" : "Aplicar"}
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Exportacao em breve", description: "A exportacao dedicada desta visao entra na proxima etapa segura do Master." })}>
              Exportar
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Eventos" value={isLoading ? "--" : String(overview?.summary.total ?? 0)} change="audit_logs reais" tone="info" icon={FolderOpen} />
        <MetricCard label="Auditoria" value={isLoading ? "--" : String(overview?.summary.audit ?? 0)} change="Sem mock critico" tone="success" icon={ShieldAlert} />
        <MetricCard label="Alertas" value={isLoading ? "--" : String(overview?.summary.warnings ?? 0)} change="Pendencias rastreaveis" tone="warning" icon={BellRing} />
        <MetricCard label="Erros" value={isLoading ? "--" : String(overview?.summary.errors ?? 0)} change="Somente quando houver trilha real" tone="default" icon={RefreshCcw} />
      </div>

      <div className="xl:max-w-md">
        <SearchInput placeholder="Buscar por acao, entidade, agencia ou usuario" value={searchTerm} onChange={setSearchTerm} />
      </div>

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar os logs agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <DashboardCard title="Timeline operacional" description="Leitura viva baseada em audit_logs globais, sem eventos ficticios nem cards fabricados.">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => <div key={`log-skeleton-${index}`} className="h-20 animate-pulse rounded-[24px] bg-white/[0.03]" />)}
          </div>
        ) : visibleItems.length === 0 ? (
          <EmptyState title="Sem eventos reais para este recorte" description="Quando a plataforma gravar audit_logs compativeis com esta sessao, a timeline aparece aqui sem precisarmos de dados de exemplo." />
        ) : (
          <div className="space-y-3">
            {visibleItems.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <StatusPill label={normalizeStatusLabel(item.status)} />
                  <StatusPill label={item.entity} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.agency_name || "TravelPro Master"}{item.user_name ? ` • ${item.user_name}` : ""}</p>
                <p className="mt-2 text-xs text-muted-foreground">Registrado em {formatDateLabel(item.created_at)}</p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (overview?.items.length ?? 0) > 8 ? (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setExpanded((current) => !current)}>
              {expanded ? "Recolher" : "Ver mais"}
            </Button>
          </div>
        ) : null}
      </DashboardCard>
    </PageShell>
  )
}

export function MasterLogsRealPage() {
  return (
    <MasterLogsBase
      title="Logs"
      description="Auditoria global do Master com dados reais de audit_logs e filtros leves de leitura."
      futureTitle="Filtros aplicados"
      futureDescription="A filtragem principal ja acontece pelos dados reais da busca. Filtros avancados entram quando a pagina ganhar recortes dedicados."
    />
  )
}

export function MasterAtlasRealPage() {
  return (
    <MasterLogsBase
      title="Atlas"
      description="Fila operacional baseada apenas em sinais reais relacionados a Atlas, suporte e escalonamentos quando existirem."
      scope="atlas"
      futureTitle="Base Atlas em breve"
      futureDescription="A edicao estruturada de artigos e atendimento humano dedicado entram junto com a camada operacional do Atlas."
    />
  )
}

export function MasterPlansStablePage() {
  const [overview, setOverview] = useState<MasterPlanOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tab, setTab] = useState("Planos")

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterPlanOverview>("/api/master/plans")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar planos.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <PageShell>
      <SectionHeader
        title="Planos"
        description="Leitura real de subscriptions e add-ons persistidos em metadata quando existirem, sem grade comercial inventada."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => toast({ title: "Edicao em breve", description: "A manutencao comercial de planos sera ligada quando houver fluxo auditavel dedicado no Master." })}>
              Salvar plano
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Pacote em breve", description: "A edicao de pacotes extras depende da camada comercial oficial e continua futura." })}>
              Salvar pacote
            </Button>
          </div>
        }
      />

      <FilterTabs items={["Planos", "Pacotes extras"]} activeItem={tab} onChange={setTab} />

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar planos e add-ons agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      {tab === "Planos" ? (
        <DashboardCard title="Base real de planos" description="Agrupamento por plan_code das subscriptions reais da plataforma.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => <div key={`plan-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
            </div>
          ) : (overview?.plans.length ?? 0) === 0 ? (
            <EmptyState title="Sem subscriptions registradas" description="Quando o billing da plataforma acumular subscriptions reais, os planos consolidados aparecem aqui." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {overview?.plans.map((plan) => (
                <div key={plan.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-foreground">{plan.plan_code}</p>
                    <StatusPill label={normalizeStatusLabel(plan.status)} />
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <p>Preco base: {plan.price == null ? "Sem preco persistido" : formatMoney(plan.price)}</p>
                    <p>Assinaturas ativas: {plan.active_subscriptions}</p>
                    <p>Agencias neste plano: {plan.agencies_count}</p>
                    <p>Receita registrada: {formatMoney(plan.payments_total)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Edicao em breve", description: `A edicao comercial do plano ${plan.plan_code} entra com trilha segura dedicada.` })}>
                      Editar plano
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Status em breve", description: "A ativacao comercial continua futura para evitar impacto indevido no billing atual." })}>
                      Ativar/Inativar
                    </Button>
                    <Button className="rounded-full" onClick={() => toast({ title: "Exclusao protegida", description: "A exclusao de plano segue bloqueada no Master ate existir fluxo seguro com impacto em subscriptions." })}>
                      Excluir plano
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      ) : (
        <DashboardCard title="Pacotes extras" description="Add-ons lidos de subscriptions.metadata quando a plataforma ja os persistiu.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => <div key={`extra-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
            </div>
          ) : (overview?.extra_packages.length ?? 0) === 0 ? (
            <EmptyState title="Sem pacotes extras persistidos" description="Quando os add-ons passarem a ser gravados em subscriptions.metadata, eles aparecem aqui com preco real, quantidade de agencias e status." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {overview?.extra_packages.map((item) => (
                <div key={item.id} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="mt-2 text-sm leading-5 text-muted-foreground">Origem {item.source}</p>
                    </div>
                    <StatusPill label={normalizeStatusLabel(item.status)} />
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p>Preco: {item.price == null ? "Sem valor persistido" : formatMoney(item.price)}</p>
                    <p>Agencias com o add-on: {item.agencies_count}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Visualizacao contextual", description: "A leitura deste add-on ja esta consolidada neste card." })}>
                      Visualizar
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Edicao em breve", description: "A manutencao comercial de add-ons continua futura para preservar o billing atual." })}>
                      Editar
                    </Button>
                    <Button className="rounded-full" onClick={() => toast({ title: "Ativacao em breve", description: "A alteracao de status dos add-ons sera liberada quando houver fluxo seguro no Master." })}>
                      Ativar/Inativar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      )}
    </PageShell>
  )
}

export function MasterSettingsStablePage() {
  const [overview, setOverview] = useState<MasterDashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await requestJson<MasterDashboardOverview>("/api/master/dashboard/overview")
        if (!active) return
        setOverview(data)
      } catch {
        if (!active) return
        setOverview(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <PageShell>
      <SectionHeader
        title="Configuracoes da plataforma"
        description="Painel administrativo reorganizado para leitura operacional clara, sem criar parametros ficticios nem salvar em storage inseguro."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => toast({ title: "Persistencia futura", description: "As configuracoes globais entram quando houver armazenamento dedicado e auditavel para a plataforma." })}>
              Salvar parametros
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Mapeamento em breve", description: "Secrets e webhooks reais continuam fora desta etapa para nao criar configuracao fake." })}>
              Mapear chaves futuras
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Estado atual da plataforma" description="Leituras vivas usadas para entender o que ja esta operacional no Master.">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Agencias" value={isLoading ? "--" : String(overview?.agencies_total ?? 0)} />
            <InfoCard label="Usuarios" value={isLoading ? "--" : String(overview?.users_total ?? 0)} />
            <InfoCard label="Receita paga" value={isLoading ? "--" : formatMoney(overview?.paid_total ?? 0)} />
            <InfoCard label="Creditos consumidos" value={isLoading ? "--" : String(overview?.credits_consumed ?? 0)} />
            <InfoCard label="IA" value={overview?.ai_status_label || "Em breve"} />
            <InfoCard label="WhatsApp" value={overview?.whatsapp_status_label || "Em breve"} />
          </div>
        </DashboardCard>

        <DashboardCard title="Governanca operacional" description="Agrupamentos claros do que ja existe e do que ainda depende de fases futuras.">
          <div className="space-y-3">
            {[
              "Billing global do Master fica isolado do financeiro operacional das agencias.",
              "IA, WhatsApp e Stripe real continuam preparados, mas sem configuracao falsa.",
              "Catalogo e relatórios ja fornecem base real para leituras executivas do Master.",
              "Parametros persistentes globais aguardam armazenamento dedicado e auditavel.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Sino em breve", description: "A central global de notificacoes do Master entra em uma etapa dedicada, sem mock novo agora." })}>
              Sino de notificacao
            </Button>
            <Button className="rounded-full" onClick={() => toast({ title: "Aplicacao futura", description: "Nao existe backend seguro para aplicar parametros globais ainda. A interface foi organizada sem persistencia fake." })}>
              Aplicar
            </Button>
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}
