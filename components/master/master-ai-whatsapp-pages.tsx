"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BellRing,
  Bot,
  Building2,
  CreditCard,
  Download,
  Logs,
  MessageSquareText,
  RefreshCcw,
  Wallet,
  Webhook,
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
import type { MasterAiCreditLogItem, MasterAiCreditOverview, MasterWhatsAppOverview } from "@/types/master"

type AiCreditsSubsection = "uso-ia" | "creditos" | "custos" | "logs-ia"

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

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDateLabel(value?: string | null) {
  if (!value) return "Sem data"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed)
}

function normalizeStatusLabel(value: string | null | undefined) {
  if (!value) return "Sem status"
  const normalized = value.toLowerCase()
  if (normalized.includes("inactive") || normalized.includes("inativ")) return "Inativa"
  if (normalized.includes("active") || normalized.includes("ativa") || normalized.includes("ativo")) return "Ativa"
  if (normalized.includes("pending") || normalized.includes("pend")) return "Pendente"
  if (normalized.includes("connected") || normalized.includes("conect")) return "Conectado"
  return value
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized.includes("atras") || normalized.includes("risk") || normalized.includes("inactive") || normalized.includes("instavel")) return "danger"
  if (normalized.includes("ativo") || normalized.includes("conect") || normalized.includes("paid") || normalized.includes("pago") || normalized.includes("active")) return "success"
  if (normalized.includes("pending") || normalized.includes("pend") || normalized.includes("review") || normalized.includes("em breve")) return "warning"
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

function subsectionTitle(subsection: AiCreditsSubsection) {
  if (subsection === "creditos") return "Creditos"
  if (subsection === "custos") return "Custos"
  if (subsection === "logs-ia") return "Logs IA"
  return "Uso IA"
}

function subsectionDescription(subsection: AiCreditsSubsection) {
  if (subsection === "creditos") return "Saldo, ranking, historico e leitura real de transacoes de creditos por agencia."
  if (subsection === "custos") return "Custos reais apenas quando houver base confiavel. Ate la, leitura honesta de consumo e empty state premium."
  if (subsection === "logs-ia") return "Trilha operacional baseada em creditos, auditoria, notificacoes e relatórios com sinal real de IA."
  return "Leitura viva de uso de IA e creditos sem integrar OpenAI real nesta etapa."
}

function filterAiLogs(logs: MasterAiCreditLogItem[], searchTerm: string) {
  const normalized = searchTerm.trim().toLowerCase()
  if (!normalized) return logs
  return logs.filter((item) =>
    item.title.toLowerCase().includes(normalized) ||
    item.detail.toLowerCase().includes(normalized) ||
    (item.agency_name || "").toLowerCase().includes(normalized),
  )
}

export function MasterAiCreditsPage({ subsection = "uso-ia" }: { subsection?: AiCreditsSubsection }) {
  const router = useRouter()
  const [overview, setOverview] = useState<MasterAiCreditOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterAiCreditOverview>("/api/master/ai-credits")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar IA e creditos.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const ranking = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const items = overview?.ranking ?? []
    if (!normalized) return items
    return items.filter((item) =>
      item.agency_name.toLowerCase().includes(normalized) ||
      (item.plan_code || "").toLowerCase().includes(normalized) ||
      (item.top_feature || "").toLowerCase().includes(normalized),
    )
  }, [overview?.ranking, searchTerm])

  const transactions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const items = overview?.recent_transactions ?? []
    if (!normalized) return items
    return items.filter((item) =>
      (item.agency_name || "").toLowerCase().includes(normalized) ||
      (item.feature || "").toLowerCase().includes(normalized) ||
      (item.source || "").toLowerCase().includes(normalized),
    )
  }, [overview?.recent_transactions, searchTerm])

  const logs = useMemo(() => filterAiLogs(overview?.logs ?? [], searchTerm), [overview?.logs, searchTerm])

  return (
    <PageShell>
      <SectionHeader
        title={`IA e Creditos • ${subsectionTitle(subsection)}`}
        description={subsectionDescription(subsection)}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => toast({ title: "Configuracao futura", description: "A conexao real com OpenAI fica para a proxima etapa segura do Master." })}>
              Configurar IA
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Ajuste em breve", description: "O ajuste manual de creditos sera liberado quando houver fluxo auditavel dedicado." })}>
              Ajustar creditos
            </Button>
          </div>
        }
      />

      <FilterTabs
        items={["Uso IA", "Creditos", "Custos", "Logs IA"]}
        activeItem={subsectionTitle(subsection)}
        onChange={(item) => {
          if (item === "Uso IA") router.push("/master/ia-creditos/uso-ia")
          if (item === "Creditos") router.push("/master/ia-creditos/creditos")
          if (item === "Custos") router.push("/master/ia-creditos/custos")
          if (item === "Logs IA") router.push("/master/ia-creditos/logs-ia")
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Agencias com uso" value={isLoading ? "--" : String(overview?.summary.agencies_with_usage ?? 0)} change="Base real de creditos" tone="info" icon={Building2} />
        <MetricCard label="Creditos vendidos" value={isLoading ? "--" : String(overview?.summary.credits_sold ?? 0)} change={isLoading ? "Carregando..." : `${overview?.summary.credits_consumed ?? 0} consumidos`} tone="success" icon={CreditCard} />
        <MetricCard label="Saldo agregado" value={isLoading ? "--" : String(overview?.summary.total_balance ?? 0)} change="Leitura global por agencia" tone="warning" icon={Wallet} />
        <MetricCard label="Custos IA" value={isLoading ? "--" : overview?.summary.estimated_cost_total == null ? "Sem base" : formatMoney(overview.summary.estimated_cost_total)} change="Custo real vira leitura futura" tone="default" icon={Bot} />
      </div>

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar IA e creditos agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="xl:max-w-md">
        <SearchInput placeholder="Buscar agencia, plano, origem ou feature" value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Ranking de consumo" description="Agencias ordenadas por consumo real de creditos, sem custo ficticio por execucao.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => <div key={`master-ai-ranking-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
            </div>
          ) : ranking.length === 0 ? (
            <EmptyState title="Sem consumo registrado ainda" description="Assim que creditos reais forem lançados no Supabase, o ranking por agencia aparece aqui." />
          ) : (
            <div className="space-y-3">
              {ranking.slice(0, subsection === "creditos" ? 12 : 8).map((item) => (
                <div key={item.agency_id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.agency_name}</p>
                      <StatusPill label={normalizeStatusLabel(item.agency_status)} />
                      {item.plan_code ? <StatusPill label={item.plan_code} /> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Saldo {item.credit_balance} • consumo {item.credits_consumed} • entradas {item.credits_granted}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Top feature {item.top_feature || "Sem origem consolidada"} • ultima transacao {formatDateLabel(item.last_transaction_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                      <Link href="/master/agencias">Ver agencia</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/master/ia-creditos/creditos")}>
                      Ver consumo
                    </Button>
                    <Button className="rounded-full" onClick={() => router.push("/master/ia-creditos/logs-ia")}>
                      Ver logs
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title={subsection === "custos" ? "Custos e prontidao" : "Historico recente"} description={subsection === "custos" ? "Sem OpenAI real nem custo por execucao conectado. O modulo mostra apenas a base operacional que ja existe." : "Transacoes reais mais recentes, com origem e agencia quando disponiveis."}>
          {subsection === "custos" ? (
            overview?.summary.estimated_cost_total == null ? (
              <EmptyState
                title="Sem base real de custos ainda"
                description="O TravelPro ainda nao recebeu a camada de custo real por execucao. Nesta etapa, seguimos com creditos vendidos, consumidos e logs reais."
                actionLabel="Configurar IA"
                onAction={() => toast({ title: "Integracao futura", description: "A leitura real de custo entrara junto com a conexao segura de IA." })}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard label="Custo estimado" value={formatMoney(overview.summary.estimated_cost_total)} change="Base real disponivel" tone="warning" icon={Wallet} />
              </div>
            )
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => <div key={`master-ai-history-skeleton-${index}`} className="h-20 animate-pulse rounded-[24px] bg-white/[0.03]" />)}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState title="Nenhuma transacao encontrada" description="Quando houver transacoes de creditos registradas, o historico operacional aparecera aqui." />
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.agency_name || "Agencia sem nome"}</p>
                    <StatusPill label={item.type} />
                    {item.plan_code ? <StatusPill label={item.plan_code} /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Feature {item.feature || "Sem feature"} • origem {item.source || "Sem origem"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Valor {item.amount} • criado em {formatDateLabel(item.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      <DashboardCard title="Logs e trilha IA" description="Eventos reais relacionados a IA quando existirem em auditoria, notificacoes ou relatórios.">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={`master-ai-log-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="Sem logs reais de IA ainda"
            description="A trilha avancada de IA continua futura. Quando audit_logs, notifications ou reports tiverem eventos relacionados, eles aparecerao aqui."
            actionLabel="Configurar IA"
            onAction={() => toast({ title: "IA em breve", description: "A conexao real com IA continua planejada e sem backend fake nesta etapa." })}
          />
        ) : (
          <div className="space-y-3">
            {logs.slice(0, subsection === "logs-ia" ? 24 : 8).map((item, index) => (
              <div key={`${item.source}-${item.id}-${index}`} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <StatusPill label={normalizeStatusLabel(item.status)} />
                    <StatusPill label={item.source} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.agency_name || "Sem agencia vinculada"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.detail} • {formatDateLabel(item.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/master/ia-creditos/creditos")}>
                    Ver consumo
                  </Button>
                  <Button className="rounded-full" onClick={() => toast({ title: "Exportacao em breve", description: "A exportacao dedicada deste modulo ficara na proxima fase do Master." })}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
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

export function MasterWhatsAppRealPage() {
  const [overview, setOverview] = useState<MasterWhatsAppOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterWhatsAppOverview>("/api/master/whatsapp")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o modulo de WhatsApp.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const agencies = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const items = overview?.agencies ?? []
    if (!normalized) return items
    return items.filter((item) =>
      item.agency_name.toLowerCase().includes(normalized) ||
      (item.contact_number || "").toLowerCase().includes(normalized) ||
      item.whatsapp_status.toLowerCase().includes(normalized),
    )
  }, [overview?.agencies, searchTerm])

  const notifications = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const items = overview?.notifications ?? []
    if (!normalized) return items
    return items.filter((item) =>
      item.title.toLowerCase().includes(normalized) ||
      (item.body || "").toLowerCase().includes(normalized) ||
      (item.type || "").toLowerCase().includes(normalized),
    )
  }, [overview?.notifications, searchTerm])

  const logs = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const items = overview?.logs ?? []
    if (!normalized) return items
    return items.filter((item) =>
      item.action.toLowerCase().includes(normalized) ||
      item.entity.toLowerCase().includes(normalized),
    )
  }, [overview?.logs, searchTerm])

  return (
    <PageShell>
      <SectionHeader
        title="WhatsApp"
        description="Prontidao operacional do Master para WhatsApp, TravelPro Go e Agent sem integrar API real nesta etapa."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => toast({ title: "Integracao futura", description: "A conexao real de WhatsApp fica para a fase dedicada de instancias e webhooks." })}>
              Conectar WhatsApp
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Webhook em breve", description: "A configuracao real de webhook ficara disponivel quando a camada de integracao for ativada." })}>
              Configurar webhook
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Agencias configuradas" value={isLoading ? "--" : String(overview?.summary.configured_agencies ?? 0)} change="Leitura de metadata e sinais reais" tone="info" icon={MessageSquareText} />
        <MetricCard label="Agencias com eventos" value={isLoading ? "--" : String(overview?.summary.agencies_with_events ?? 0)} change="Audit logs e notificacoes reais" tone="warning" icon={Building2} />
        <MetricCard label="Notificacoes" value={isLoading ? "--" : String(overview?.summary.notifications_count ?? 0)} change="Sinais operacionais reais" tone="success" icon={BellRing} />
        <MetricCard label="Logs" value={isLoading ? "--" : String(overview?.summary.audit_logs_count ?? 0)} change="Sem instancias fake" tone="default" icon={Logs} />
      </div>

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar o modulo de WhatsApp agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="xl:max-w-md">
        <SearchInput placeholder="Buscar agencia, numero ou status" value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Agencias e status" description="Consolidado visual com o que ja existe no banco e placeholders honestos para a fase futura de integracao.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => <div key={`master-whatsapp-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
            </div>
          ) : agencies.length === 0 ? (
            <EmptyState
              title="Nenhuma configuracao de WhatsApp encontrada"
              description="O Master fica pronto para receber configuracoes reais quando a integracao de instancias for habilitada."
              actionLabel="Conectar WhatsApp"
              onAction={() => toast({ title: "Integracao futura", description: "Sem API real nesta etapa. O modulo continua preparado visualmente e sem dados fake." })}
            />
          ) : (
            <div className="space-y-3">
              {agencies.slice(0, 12).map((item) => (
                <div key={item.agency_id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.agency_name}</p>
                      <StatusPill label={normalizeStatusLabel(item.agency_status)} />
                      <StatusPill label={item.whatsapp_status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.contact_number || "Sem numero registrado"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Go {item.go_status} • Agent {item.agent_status} • ultimo evento {formatDateLabel(item.last_event_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                      <Link href="/master/agencias">Ver agencia</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Instancia em breve", description: "A visualizacao da instancia real sera habilitada quando a integracao de WhatsApp entrar no ar." })}>
                      Ver instancia
                    </Button>
                    <Button className="rounded-full" onClick={() => toast({ title: "Aviso preparado", description: "A notificacao direta da agencia fica para a proxima etapa segura do Master." })}>
                      Notificar agencia
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Preparacao operacional" description="Fluxos futuros mantidos como honestos, sem webhook ou teste fake.">
          <div className="space-y-3">
            {[
              "TravelPro Go continua como expansao futura, sem automacao real nesta etapa.",
              "TravelPro Agent no WhatsApp continua apenas preparado visualmente.",
              "Webhook, teste de conexao e auditoria avancada entram na fase de integracao real.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Teste futuro", description: "O teste de conexao precisa da integracao real de instancia e permanece fora desta etapa." })}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Testar conexao
            </Button>
            <Button className="rounded-full" onClick={() => toast({ title: "Webhook futuro", description: "A configuracao do webhook sera liberada com a camada real de eventos externos." })}>
              <Webhook className="mr-2 h-4 w-4" />
              Configurar webhook
            </Button>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Eventos e logs" description="Notificacoes e audit logs reais com sinal de WhatsApp, quando existirem.">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={`master-whatsapp-log-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
          </div>
        ) : notifications.length === 0 && logs.length === 0 ? (
          <EmptyState
            title="Sem eventos reais de WhatsApp ainda"
            description="A timeline deste modulo sera preenchida quando notificacoes e audit logs relacionados ao canal forem gravados no banco."
            actionLabel="Ver logs"
            onAction={() => toast({ title: "Sem logs reais ainda", description: "A camada de auditoria dedicada ao WhatsApp sera aprofundada na integracao futura." })}
          />
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 8).map((item) => (
              <div key={`master-whatsapp-notification-${item.id}`} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <StatusPill label={normalizeStatusLabel(item.status)} />
                  <StatusPill label="notification" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.body || item.type}</p>
                <p className="mt-2 text-xs text-muted-foreground">Criado em {formatDateLabel(item.created_at)}</p>
              </div>
            ))}
            {logs.slice(0, 8).map((item) => (
              <div key={`master-whatsapp-audit-${item.id}`} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <StatusPill label={normalizeStatusLabel(item.status)} />
                  <StatusPill label="audit" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.entity}</p>
                <p className="mt-2 text-xs text-muted-foreground">Criado em {formatDateLabel(item.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </PageShell>
  )
}
