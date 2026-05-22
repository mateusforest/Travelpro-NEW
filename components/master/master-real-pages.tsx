"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  BellRing,
  Bot,
  Building2,
  CreditCard,
  Eye,
  FilePenLine,
  HandCoins,
  LineChart,
  MessageSquareText,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { EmptyState } from "@/components/system/empty-state"
import { FilterTabs } from "@/components/system/filter-tabs"
import { MetricCard } from "@/components/system/metric-card"
import { MockChart } from "@/components/system/mock-chart"
import { PageShell } from "@/components/system/page-shell"
import { SearchInput } from "@/components/system/search-input"
import { SectionHeader } from "@/components/system/section-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type {
  MasterAgencyDetail,
  MasterAgencyInput,
  MasterAgencyListItem,
  MasterAgencyOverview,
  MasterDashboardOverview,
  MasterFinanceOverview,
  MasterUserDetail,
  MasterUserInput,
  MasterUserListItem,
  MasterUserOverview,
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
  if (normalized === "inactive" || normalized === "inativa" || normalized === "inativo") return "Inativa"
  if (normalized.includes("active")) return "Ativa"
  if (normalized.includes("paid")) return "Pago"
  if (normalized.includes("pending")) return "Pendente"
  if (normalized.includes("overdue")) return "Atrasado"
  return value
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized.includes("atras") || normalized.includes("risk") || normalized.includes("inactive") || normalized.includes("inativ")) return "danger"
  if (normalized.includes("ativo") || normalized.includes("paid") || normalized.includes("pago") || normalized.includes("active")) return "success"
  if (normalized.includes("pending") || normalized.includes("pend") || normalized.includes("review")) return "warning"
  return "info"
}

function isActiveStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === "active" || normalized === "ativa" || normalized === "ativo"
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{children}</span>
}

function AgencyEditDialog({
  open,
  onOpenChange,
  initialAgency,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAgency: MasterAgencyListItem | null
  onSaved: (agency: MasterAgencyListItem) => void
}) {
  const [values, setValues] = useState<MasterAgencyInput>({
    name: "",
    owner_name: "",
    owner_email: "",
    phone: "",
    status: "active",
    city: "",
    requested_plan: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!initialAgency) return
    setValues({
      name: initialAgency.name,
      owner_name: initialAgency.owner_name || "",
      owner_email: initialAgency.owner_email || "",
      phone: initialAgency.phone || "",
      status: initialAgency.status,
      city: initialAgency.city || "",
      requested_plan: initialAgency.requested_plan || initialAgency.current_plan || "",
    })
  }, [initialAgency])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{initialAgency ? `Editar ${initialAgency.name}` : "Editar agência"}</DialogTitle>
          <DialogDescription>Atualize os dados básicos da conta sem alterar billing, auth ou módulos fora deste escopo.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <label className="space-y-2">
            <FieldLabel>Nome</FieldLabel>
            <input value={values.name || ""} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2">
            <FieldLabel>Status</FieldLabel>
            <select value={values.status || "active"} onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none">
              <option value="active" className="bg-background">Ativa</option>
              <option value="inactive" className="bg-background">Inativa</option>
            </select>
          </label>
          <label className="space-y-2">
            <FieldLabel>Responsável</FieldLabel>
            <input value={values.owner_name || ""} onChange={(event) => setValues((current) => ({ ...current, owner_name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2">
            <FieldLabel>E-mail</FieldLabel>
            <input value={values.owner_email || ""} onChange={(event) => setValues((current) => ({ ...current, owner_email: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2">
            <FieldLabel>Telefone</FieldLabel>
            <input value={values.phone || ""} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2">
            <FieldLabel>Cidade</FieldLabel>
            <input value={values.city || ""} onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <FieldLabel>Plano desejado</FieldLabel>
            <input value={values.requested_plan || ""} onChange={(event) => setValues((current) => ({ ...current, requested_plan: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
          </label>
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="rounded-full"
            disabled={isSubmitting}
            onClick={async () => {
              if (!initialAgency) return
              try {
                setIsSubmitting(true)
                await requestJson(`/api/master/agencies/${initialAgency.id}`, {
                  method: "PATCH",
                  body: JSON.stringify(values),
                })
                onSaved({
                  ...initialAgency,
                  name: values.name,
                  owner_name: values.owner_name || null,
                  owner_email: values.owner_email || null,
                  phone: values.phone || null,
                  status: values.status || initialAgency.status,
                  city: values.city || null,
                  requested_plan: values.requested_plan || null,
                })
                toast({ title: "Agência atualizada", description: "Os dados básicos da agência foram salvos." })
                onOpenChange(false)
              } catch (error) {
                toast({ title: "Falha ao salvar", description: error instanceof Error ? error.message : "Nao foi possivel atualizar a agencia." })
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UserEditDialog({
  open,
  onOpenChange,
  initialUser,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialUser: MasterUserListItem | null
  onSaved: (user: MasterUserListItem) => void
}) {
  const [values, setValues] = useState<MasterUserInput>({ role: "agency_user", status: "active" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!initialUser) return
    setValues({
      role: initialUser.role,
      status: initialUser.status,
    })
  }, [initialUser])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{initialUser?.full_name || initialUser?.email || "Editar usuário"}</DialogTitle>
          <DialogDescription>Ajuste role e status apenas onde o schema já suporta a alteração com segurança.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-6 py-5">
          <label className="space-y-2">
            <FieldLabel>Role</FieldLabel>
            <select value={values.role || "agency_user"} onChange={(event) => setValues((current) => ({ ...current, role: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none">
              {["master", "agency_admin", "agency_user", "client"].map((role) => (
                <option key={role} value={role} className="bg-background">{role}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <FieldLabel>Status</FieldLabel>
            <select value={values.status || "active"} onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none">
              {["active", "inactive", "pending"].map((status) => (
                <option key={status} value={status} className="bg-background">{status}</option>
              ))}
            </select>
          </label>
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="rounded-full"
            disabled={isSubmitting}
            onClick={async () => {
              if (!initialUser) return
              try {
                setIsSubmitting(true)
                await requestJson(`/api/master/users/${initialUser.id}`, {
                  method: "PATCH",
                  body: JSON.stringify(values),
                })
                onSaved({
                  ...initialUser,
                  role: values.role || initialUser.role,
                  status: values.status || initialUser.status,
                })
                toast({ title: "Usuário atualizado", description: "Role e status foram salvos com sucesso." })
                onOpenChange(false)
              } catch (error) {
                toast({ title: "Falha ao salvar", description: error instanceof Error ? error.message : "Nao foi possivel atualizar o usuario." })
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MasterDashboardPage() {
  const [overview, setOverview] = useState<MasterDashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterDashboardOverview>("/api/master/dashboard/overview")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o dashboard master.")
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
        title="Dashboard Master"
        description="Leitura real consolidada de agências, usuários, cobrança e créditos do ecossistema."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full"><Link href="/master/agencias">Abrir agências</Link></Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/financeiro">Abrir financeiro</Link></Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/ia-creditos">IA e creditos</Link></Button>
          </div>
        }
      />

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar o dashboard master agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Agências" value={isLoading ? "--" : String(overview?.agencies_total ?? 0)} change={isLoading ? "Carregando..." : `${overview?.agencies_active ?? 0} ativas`} tone="success" icon={Building2} />
        <MetricCard label="Usuários" value={isLoading ? "--" : String(overview?.users_total ?? 0)} change="Perfis reais do Supabase" tone="info" icon={Users} />
        <MetricCard label="Receita paga" value={isLoading ? "--" : formatMoney(overview?.paid_total ?? 0)} change={isLoading ? "Carregando..." : `Total registrado ${formatMoney(overview?.payments_total ?? 0)}`} tone="success" icon={Wallet} />
        <MetricCard label="Créditos" value={isLoading ? "--" : `${overview?.credits_sold ?? 0}`} change={isLoading ? "Carregando..." : `${overview?.credits_consumed ?? 0} consumidos`} tone="warning" icon={CreditCard} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Leitura executiva" description="Resumo vivo somente dos domínios já conectados ao Supabase nesta etapa.">
          <div className="space-y-3">
            {[
              `Agências totais: ${overview?.agencies_total ?? 0}.`,
              `Usuários totais: ${overview?.users_total ?? 0}.`,
              `Receita paga apurada: ${formatMoney(overview?.paid_total ?? 0)}.`,
              `Créditos vendidos: ${overview?.credits_sold ?? 0} e consumidos: ${overview?.credits_consumed ?? 0}.`,
              `Maior consumo atual: ${overview?.top_credit_agency_name ?? "Sem dados ainda"}${overview?.top_credit_agency_consumption ? ` (${overview.top_credit_agency_consumption} creditos)` : ""}.`,
              `IA: ${overview?.ai_status_label ?? "Em breve"} com ${overview?.ai_related_logs ?? 0} sinais reais.`,
              `WhatsApp: ${overview?.whatsapp_status_label ?? "Em breve"} em ${overview?.whatsapp_connected_agencies ?? 0} agencias.`,
              `Relatorios salvos: ${overview?.reports_total ?? 0}. Templates ativos: ${overview?.templates_active ?? 0}, oficiais: ${overview?.templates_official ?? 0}.`,
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard title="Próximos passos" description="Ações seguras disponíveis sem abrir outros módulos futuros do Master.">
          <div className="space-y-3">
            <Button asChild className="w-full rounded-full"><Link href="/master/agencias">Gerenciar agências</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/usuarios">Revisar usuários</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/financeiro">Abrir financeiro</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/ia-creditos">Abrir IA e creditos</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/whatsapp">Abrir WhatsApp</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/relatorios">Abrir relatorios</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/templates">Abrir templates</Link></Button>
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}

export function MasterDashboardPremiumPage() {
  const [overview, setOverview] = useState<MasterDashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const topAgencies = overview?.top_agencies ?? []
  const recentPayments = overview?.recent_payments ?? []
  const recentReports = overview?.recent_reports ?? []
  const creditLogs = overview?.credit_logs ?? []
  const whatsappAgencies = overview?.whatsapp_agencies ?? []

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterDashboardOverview>("/api/master/dashboard/overview")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o dashboard master.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const executiveSeries = useMemo(
    () => [
      { label: "Agências", value: overview?.agencies_total ?? 0 },
      { label: "Assinaturas", value: overview?.active_subscriptions ?? 0 },
      { label: "Usuários", value: overview?.users_total ?? 0 },
      { label: "Relatórios", value: overview?.reports_total ?? 0 },
      { label: "Templates", value: overview?.templates_active ?? 0 },
      { label: "WhatsApp", value: overview?.whatsapp_connected_agencies ?? 0 },
    ],
    [overview],
  )

  const financeSeries = useMemo(
    () => [
      {
        label: "Receita",
        value: overview?.paid_total ?? 0,
        expenses: overview?.expense_records_total ?? 0,
        profit: Math.max((overview?.paid_total ?? 0) - (overview?.expense_records_total ?? 0), 0),
      },
      {
        label: "Cobrado",
        value: overview?.payments_total ?? 0,
        expenses: Math.max((overview?.payments_total ?? 0) - (overview?.paid_total ?? 0), 0),
        profit: overview?.paid_total ?? 0,
      },
      {
        label: "Créditos",
        value: overview?.credits_sold ?? 0,
        expenses: overview?.credits_consumed ?? 0,
        profit: Math.max((overview?.credits_sold ?? 0) - (overview?.credits_consumed ?? 0), 0),
      },
    ],
    [overview],
  )

  const moduleMixSeries = useMemo(() => {
    const reportItems = overview?.report_mix ?? []
    const templateItems = overview?.template_mix ?? []
    const labels = Array.from(new Set([...reportItems.map((item) => item.label), ...templateItems.map((item) => item.label)])).slice(0, 6)
    return labels.map((label) => ({
      label,
      value: reportItems.find((item) => item.label === label)?.value ?? 0,
      expenses: templateItems.find((item) => item.label === label)?.value ?? 0,
      profit: Math.max((reportItems.find((item) => item.label === label)?.value ?? 0) - (templateItems.find((item) => item.label === label)?.value ?? 0), 0),
    }))
  }, [overview])

  const executiveAlerts = useMemo(() => {
    const alerts: Array<{ id: string; title: string; description: string; severity: string; href: string }> = []

    if ((overview?.billing_status.overdue ?? 0) > 0) {
      alerts.push({
        id: "billing-overdue",
        title: "Cobranças em atraso",
        description: `${overview?.billing_status.overdue ?? 0} registros exigem atenção no financeiro master.`,
        severity: "Alta",
        href: "/master/financeiro",
      })
    }

    if ((overview?.ai_related_logs ?? 0) > 0) {
      alerts.push({
        id: "ai-logs",
        title: "Sinais operacionais de IA",
        description: `${overview?.ai_related_logs ?? 0} logs reais já apareceram nos módulos de IA e créditos.`,
        severity: "Média",
        href: "/master/ia-creditos/logs-ia",
      })
    }

    if ((overview?.whatsapp_connected_agencies ?? 0) === 0) {
      alerts.push({
        id: "whatsapp-empty",
        title: "WhatsApp ainda sem agências configuradas",
        description: "O módulo segue preparado, mas ainda sem agências conectadas de forma rastreável.",
        severity: "Observação",
        href: "/master/whatsapp",
      })
    }

    if ((overview?.templates_official ?? 0) === 0) {
      alerts.push({
        id: "templates-official",
        title: "Biblioteca oficial sem templates publicados",
        description: "Vale reforçar a base oficial da plataforma para padronização operacional.",
        severity: "Média",
        href: "/master/templates",
      })
    }

    if ((overview?.agencies_total ?? 0) === 0) {
      alerts.push({
        id: "agencies-empty",
        title: "Sem agências na base",
        description: "O Master está pronto, mas ainda não há contas registradas para leitura executiva.",
        severity: "Observação",
        href: "/master/agencias",
      })
    }

    return alerts.slice(0, 4)
  }, [overview])

  const executiveSignals = useMemo(
    () => [
      {
        label: "Receita líquida observável",
        value: formatMoney(Math.max((overview?.paid_total ?? 0) - (overview?.expense_records_total ?? 0), 0)),
      },
      {
        label: "Agências com assinatura",
        value: `${overview?.agencies_with_subscription ?? 0} de ${overview?.agencies_total ?? 0}`,
      },
      {
        label: "Saldo agregado de créditos",
        value: `${overview?.total_credit_balance ?? 0} créditos`,
      },
      {
        label: "Maior consumo atual",
        value: overview?.top_credit_agency_name ? `${overview.top_credit_agency_name} • ${overview.top_credit_agency_consumption} créditos` : "Sem consumo relevante ainda",
      },
    ],
    [overview],
  )

  return (
    <PageShell>
      <SectionHeader
        title="Dashboard Master"
        description="Cockpit executivo do ecossistema com sinais reais de agências, billing, créditos, relatórios e operação da plataforma."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full"><Link href="/master/agencias">Abrir agências</Link></Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/financeiro">Abrir financeiro</Link></Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/ia-creditos">IA e créditos</Link></Button>
          </div>
        }
      />

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Não foi possível carregar o dashboard master agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Agências" value={isLoading ? "--" : String(overview?.agencies_total ?? 0)} change={isLoading ? "Carregando..." : `${overview?.agencies_active ?? 0} ativas`} tone="success" icon={Building2} />
        <MetricCard label="Usuários" value={isLoading ? "--" : String(overview?.users_total ?? 0)} change="Perfis reais do Supabase" tone="info" icon={Users} />
        <MetricCard label="Receita paga" value={isLoading ? "--" : formatMoney(overview?.paid_total ?? 0)} change={isLoading ? "Carregando..." : `Total registrado ${formatMoney(overview?.payments_total ?? 0)}`} tone="success" icon={Wallet} />
        <MetricCard label="Créditos" value={isLoading ? "--" : `${overview?.credits_sold ?? 0}`} change={isLoading ? "Carregando..." : `${overview?.credits_consumed ?? 0} consumidos`} tone="warning" icon={CreditCard} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard title="Camada executiva" description="Resumo premium do que está acontecendo agora na plataforma, com prioridade para densidade operacional e leitura de decisão.">
          <div className="rounded-[30px] border border-primary/15 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  TravelPro Master Live
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-foreground md:text-[2rem]">
                  Centro operacional da plataforma com leitura real de billing, créditos, agências e atividade executiva.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                  O backend continua 100% real. Esta camada recoloca o peso visual do cockpit enterprise sem perder integridade de dados, rotas ou services.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:min-w-[320px] xl:max-w-[360px]">
                {executiveSignals.map((signal) => (
                  <div key={signal.label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{signal.label}</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{isLoading ? "Carregando..." : signal.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Alertas executivos" description="Sinais prioritários reais ou zero-state honesto quando a plataforma ainda não gerou tensão suficiente.">
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={`master-alert-skeleton-${index}`} className="h-24 animate-pulse rounded-[24px] bg-white/[0.03]" />)
            ) : executiveAlerts.length > 0 ? (
              executiveAlerts.map((item) => (
                <Link key={item.id} href={item.href} className="block rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition-all hover:border-primary/15 hover:bg-white/[0.05]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <StatusPill label={item.severity} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                    <ShieldAlert className="mt-0.5 h-4 w-4 text-primary/80" />
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="Sem alertas críticos por agora" description="O cockpit segue monitorando billing, IA, templates e canais. Assim que surgirem sinais reais, eles aparecem aqui com prioridade." />
            )}
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <MockChart title="Escala da plataforma" description="Distribuição real entre agências, assinaturas, usuários, relatórios, templates e canais preparados." series={executiveSeries} />
        <MockChart title="Financeiro e créditos" description="Leitura viva entre receita paga, volume cobrado, saldo de créditos e pressão operacional." series={financeSeries} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Agências em destaque" description="Contas com mais peso financeiro ou maior consumo de créditos no ecossistema.">
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={`master-agency-highlight-${index}`} className="h-28 animate-pulse rounded-[24px] bg-white/[0.03]" />)
            ) : topAgencies.length > 0 ? (
              topAgencies.map((agency) => (
                <div key={agency.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{agency.name}</p>
                        <StatusPill label={normalizeStatusLabel(agency.status)} />
                        {agency.current_plan ? <StatusPill label={agency.current_plan} /> : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {agency.members_count} membros • {agency.credits_consumed} créditos consumidos • saldo {agency.credits_balance}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/70">
                        Receita consolidada {formatMoney(agency.payments_total)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                        <Link href="/master/agencias">Ver agência</Link>
                      </Button>
                      <Button asChild className="rounded-full">
                        <Link href="/master/ia-creditos">Ver consumo</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Sem agências para destacar" description="Quando a base real ganhar contas com uso, billing ou consumo relevante, elas aparecerão aqui." />
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Mistura de relatórios e templates" description="Leitura por tipo para reforçar profundidade operacional sem adicionar ruído visual.">
          {isLoading ? (
            <div className="h-[380px] animate-pulse rounded-[24px] bg-white/[0.03]" />
          ) : moduleMixSeries.length > 0 ? (
            <MockChart title="Produção por tipo" description="Linha principal para relatórios e comparativo para templates ativos por categoria." series={moduleMixSeries} />
          ) : (
            <EmptyState title="Sem mix suficiente ainda" description="Os gráficos ganham corpo assim que relatórios e templates começarem a ser usados de forma mais consistente." />
          )}
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <DashboardCard title="Radar de IA e WhatsApp" description="Status vivo das camadas preparadas da plataforma, com zero state honesto e atividade recente quando houver.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">IA e créditos</p>
                  <p className="text-xs text-muted-foreground">{overview?.ai_status_label ?? "Em breve"} • {overview?.ai_related_logs ?? 0} sinais reais</p>
                </div>
              </div>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5 text-primary">
                  <MessageSquareText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">WhatsApp e Go</p>
                  <p className="text-xs text-muted-foreground">{overview?.whatsapp_status_label ?? "Em breve"} • {overview?.whatsapp_connected_agencies ?? 0} agências com sinal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {creditLogs.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <StatusPill label={normalizeStatusLabel(item.status)} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.agency_name || "TravelPro Master"} • {item.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/70">{item.source} • {formatDateLabel(item.created_at)}</p>
              </div>
            ))}
            {!isLoading && creditLogs.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                Ainda não há logs suficientes para IA e créditos, mas a estrutura já está pronta para capturar a operação real.
              </div>
            ) : null}
          </div>
        </DashboardCard>

        <DashboardCard title="Fluxo operacional recente" description="Pagamentos, relatórios e canais aparecem aqui como widgets vivos, sem simplificar a leitura executiva.">
          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary/70">
                <HandCoins className="h-3.5 w-3.5" />
                Últimos pagamentos
              </div>
              <div className="space-y-3">
                {recentPayments.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{item.agency_name || "Agência sem nome"}</p>
                        <StatusPill label={normalizeStatusLabel(item.status)} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{formatMoney(item.amount)} • {item.payment_method || "Sem método definido"}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-primary/70">{formatDateLabel(item.paid_at)}</p>
                  </div>
                ))}
                {!isLoading && recentPayments.length === 0 ? <p className="text-sm text-muted-foreground">Sem pagamentos recentes por enquanto.</p> : null}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary/70">
                <BarChart3 className="h-3.5 w-3.5" />
                Relatórios recentes
              </div>
              <div className="space-y-3">
                {recentReports.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <StatusPill label={normalizeStatusLabel(item.status)} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.type} • {item.agency_name || "TravelPro Master"}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/70">{formatDateLabel(item.created_at)}</p>
                  </div>
                ))}
                {!isLoading && recentReports.length === 0 ? <p className="text-sm text-muted-foreground">Sem relatórios recentes por enquanto.</p> : null}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary/70">
                <LineChart className="h-3.5 w-3.5" />
                Canais preparados
              </div>
              <div className="space-y-3">
                {whatsappAgencies.map((item) => (
                  <div key={item.agency_id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.agency_name}</p>
                      <StatusPill label={item.whatsapp_status} />
                      <StatusPill label={item.go_status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Agent {item.agent_status}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/70">
                      {item.last_event_at ? `Último evento em ${formatDateLabel(item.last_event_at)}` : "Sem eventos rastreáveis ainda"}
                    </p>
                  </div>
                ))}
                {!isLoading && whatsappAgencies.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma agência com sinal de WhatsApp ainda.</p> : null}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardCard title="Ações rápidas" description="Atalhos executivos para seguir navegando no Master sem perder a sensação de cockpit.">
          <div className="space-y-3">
            <Button asChild className="w-full rounded-full"><Link href="/master/agencias">Gerenciar agências</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/usuarios">Revisar usuários</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/financeiro">Abrir financeiro</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/ia-creditos">Abrir IA e créditos</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/whatsapp">Abrir WhatsApp</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/relatorios">Abrir relatórios</Link></Button>
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/templates">Abrir templates</Link></Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Estado do ecossistema" description="Widgets resumidos para dar profundidade visual sem poluir o dashboard.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard label="Billing pago" value={String(overview?.billing_status.paid ?? 0)} />
            <InfoCard label="Billing pendente" value={String(overview?.billing_status.pending ?? 0)} />
            <InfoCard label="Billing atrasado" value={String(overview?.billing_status.overdue ?? 0)} />
            <InfoCard label="Templates oficiais" value={String(overview?.templates_official ?? 0)} />
            <InfoCard label="Relatórios totais" value={String(overview?.reports_total ?? 0)} />
            <InfoCard label="Receitas operacionais" value={formatMoney(overview?.revenue_records_total ?? 0)} />
            <InfoCard label="Despesas operacionais" value={formatMoney(overview?.expense_records_total ?? 0)} />
            <InfoCard label="IA / WhatsApp" value={`${overview?.ai_status_label ?? "Em breve"} • ${overview?.whatsapp_status_label ?? "Em breve"}`} />
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}

export function MasterAgenciesPage() {
  const [overview, setOverview] = useState<MasterAgencyOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedAgency, setSelectedAgency] = useState<MasterAgencyDetail | null>(null)
  const [editAgency, setEditAgency] = useState<MasterAgencyListItem | null>(null)

  useEffect(() => {
    let active = true
    const loadAgencies = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterAgencyOverview>(`/api/master/agencies?search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusFilter)}`)
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar as agencias.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadAgencies()
    return () => {
      active = false
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    if (!selectedId) {
      setSelectedAgency(null)
      return
    }
    let active = true
    const loadDetail = async () => {
      try {
        const detail = await requestJson<MasterAgencyDetail>(`/api/master/agencies/${selectedId}`)
        if (!active) return
        setSelectedAgency(detail)
      } catch (error) {
        if (!active) return
        toast({ title: "Falha ao abrir detalhe", description: error instanceof Error ? error.message : "Nao foi possivel abrir a agencia." })
      }
    }
    void loadDetail()
    return () => {
      active = false
    }
  }, [selectedId])

  const records = overview?.items ?? []

  return (
    <PageShell>
      <SectionHeader
        title="Agências"
        description="Base real do Master com status, assinatura, membros, consumo e atividade recente."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full"><Link href="/master/agencias/nova">Nova agência</Link></Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Exportação em breve", description: "A exportação da base master ficará como próxima etapa segura." })}>
              Exportar base
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Agências" value={isLoading ? "--" : String(overview?.summary.total ?? 0)} change={`${overview?.summary.active ?? 0} ativas`} tone="success" icon={Building2} />
        <MetricCard label="Assinaturas" value={isLoading ? "--" : String(overview?.summary.with_subscription ?? 0)} change="Com plano vinculado" tone="info" icon={ShieldCheck} />
        <MetricCard label="Créditos" value={isLoading ? "--" : String(overview?.summary.total_credit_balance ?? 0)} change="Saldo agregado" tone="warning" icon={CreditCard} />
        <MetricCard label="Inativas" value={isLoading ? "--" : String(overview?.summary.inactive ?? 0)} change="Contas fora de operação" tone="danger" icon={AlertTriangle} />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar agência, responsável ou cidade" value={searchTerm} onChange={setSearchTerm} />
        </div>
        <FilterTabs items={["Todos", "active", "inactive"]} activeItem={statusFilter} onChange={setStatusFilter} />
      </div>

      <DashboardCard title="Base de agências" description="Ações reais para visualizar, editar, ativar ou revisar consumo.">
        {loadError ? (
          <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <p className="font-medium">Nao foi possivel carregar as agencias agora.</p>
            <p className="mt-1 text-amber-100/80">{loadError}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={`master-agency-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
          </div>
        ) : records.length === 0 ? (
          <EmptyState title="Nenhuma agência encontrada" description="Quando houver agências reais cadastradas no Supabase, elas aparecerão aqui com assinatura, membros e consumo." actionLabel="Criar agência" actionHref="/master/agencias/nova" />
        ) : (
          <div className="space-y-3">
            {records.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <StatusPill label={normalizeStatusLabel(item.status)} />
                    {item.current_plan ? <StatusPill label={item.current_plan} /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.owner_name || "Sem responsável"} • {item.city || "Sem cidade"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.members_count} membros • saldo {item.credits_balance} créditos • última cobrança {normalizeStatusLabel(item.last_payment_status)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSelectedId(item.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setEditAgency(item)}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/[0.03]"
                    onClick={async () => {
                      try {
                        const nextStatus = isActiveStatus(item.status) ? "inactive" : "active"
                        await requestJson(`/api/master/agencies/${item.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: nextStatus }),
                        })
                        setOverview((current) =>
                          current
                            ? {
                                ...current,
                                items: current.items.map((entry) => (entry.id === item.id ? { ...entry, status: nextStatus } : entry)),
                              }
                            : current,
                        )
                        toast({ title: nextStatus === "active" ? "Agência ativada" : "Agência inativada", description: `${item.name} teve o status atualizado.` })
                      } catch (error) {
                        toast({ title: "Falha ao atualizar", description: error instanceof Error ? error.message : "Nao foi possivel alterar o status da agencia." })
                      }
                    }}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {isActiveStatus(item.status) ? "Inativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <AgencyEditDialog
        open={Boolean(editAgency)}
        onOpenChange={(open) => !open && setEditAgency(null)}
        initialAgency={editAgency}
        onSaved={(nextAgency) => {
          setOverview((current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((entry) => (entry.id === nextAgency.id ? { ...entry, ...nextAgency } : entry)),
                }
              : current,
          )
        }}
      />

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-5xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedAgency ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedAgency.name}</DialogTitle>
                <DialogDescription>Detalhe real da conta com assinatura, membros, créditos e atividade recente.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard label="Status" value={normalizeStatusLabel(selectedAgency.status)} />
                  <InfoCard label="Plano" value={selectedAgency.current_plan || selectedAgency.requested_plan || "Sem assinatura"} />
                  <InfoCard label="Responsável" value={selectedAgency.owner_name || "Nao informado"} />
                  <InfoCard label="Renovação" value={formatDateLabel(selectedAgency.renews_at)} />
                  <InfoCard label="Membros" value={String(selectedAgency.members_count)} />
                  <InfoCard label="Saldo de créditos" value={String(selectedAgency.credits_balance)} />
                  <InfoCard label="Créditos consumidos" value={String(selectedAgency.credits_consumed)} />
                  <InfoCard label="Pagamentos" value={formatMoney(selectedAgency.payments_total)} />
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <DashboardCard title="Membros vinculados" description="Perfis reais relacionados à agência.">
                    <div className="space-y-3">
                      {selectedAgency.members.length > 0 ? selectedAgency.members.map((member) => (
                        <div key={member.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{member.full_name}</p>
                            <StatusPill label={member.role} />
                            <StatusPill label={normalizeStatusLabel(member.status)} />
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">Nenhum membro vinculado ainda.</p>}
                    </div>
                  </DashboardCard>

                  <DashboardCard title="Atividade recente" description="Eventos reais do audit log quando disponíveis.">
                    <div className="space-y-3">
                      {selectedAgency.audit_logs.length > 0 ? selectedAgency.audit_logs.map((log) => (
                        <div key={log.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{log.action}</p>
                            <StatusPill label={normalizeStatusLabel(log.status)} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{log.entity} • {formatDateLabel(log.created_at)}</p>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">Sem audit logs vinculados a esta agência por enquanto.</p>}
                    </div>
                  </DashboardCard>
                </div>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setEditAgency(selectedAgency)}>
                  Editar
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Membros em foco", description: "A lista real de membros já está carregada neste detalhe." })}>
                  Ver membros
                </Button>
                <Button className="rounded-full" onClick={() => toast({ title: "Consumo em foco", description: "O saldo e o consumo reais de créditos já estão consolidados neste detalhe." })}>
                  Ver consumo
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Carregando detalhe real da agência...</div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterUsersPage() {
  const [overview, setOverview] = useState<MasterUserOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("Todos")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<MasterUserDetail | null>(null)
  const [editUser, setEditUser] = useState<MasterUserListItem | null>(null)

  useEffect(() => {
    let active = true
    const loadUsers = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterUserOverview>(`/api/master/users?search=${encodeURIComponent(searchTerm)}&role=${encodeURIComponent(roleFilter)}`)
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar os usuarios.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadUsers()
    return () => {
      active = false
    }
  }, [searchTerm, roleFilter])

  useEffect(() => {
    if (!selectedId) {
      setSelectedUser(null)
      return
    }
    let active = true
    const loadDetail = async () => {
      try {
        const detail = await requestJson<MasterUserDetail>(`/api/master/users/${selectedId}`)
        if (!active) return
        setSelectedUser(detail)
      } catch (error) {
        if (!active) return
        toast({ title: "Falha ao abrir detalhe", description: error instanceof Error ? error.message : "Nao foi possivel abrir o usuario." })
      }
    }
    void loadDetail()
    return () => {
      active = false
    }
  }, [selectedId])

  const records = overview?.items ?? []

  return (
    <PageShell>
      <SectionHeader
        title="Usuários"
        description="Perfis reais da plataforma com role, agência, status e leitura segura de atividade."
        actions={
          <Button className="rounded-full" onClick={() => toast({ title: "Convite em breve", description: "O convite via Auth Admin fica para a próxima etapa segura do Master." })}>
            Convidar usuário
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Usuários" value={isLoading ? "--" : String(overview?.summary.total ?? 0)} change={`${overview?.summary.active ?? 0} ativos`} tone="success" icon={Users} />
        <MetricCard label="Masters" value={isLoading ? "--" : String(overview?.summary.masters ?? 0)} change="Perfis com acesso global" tone="info" icon={ShieldCheck} />
        <MetricCard label="Vinculados" value={isLoading ? "--" : String(overview?.summary.agency_linked ?? 0)} change="Com agência associada" tone="warning" icon={Building2} />
        <MetricCard label="Ações futuras" value="Convite" change="Reset e onboarding ficam em breve" tone="default" icon={RefreshCcw} />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar nome, e-mail ou agência" value={searchTerm} onChange={setSearchTerm} />
        </div>
        <FilterTabs items={["Todos", "master", "agency_admin", "agency_user", "client"]} activeItem={roleFilter} onChange={setRoleFilter} />
      </div>

      <DashboardCard title="Base de usuários" description="Visualize detalhe real e ajuste role/status quando o schema já suportar com segurança.">
        {loadError ? (
          <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <p className="font-medium">Nao foi possivel carregar os usuarios agora.</p>
            <p className="mt-1 text-amber-100/80">{loadError}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={`master-user-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
          </div>
        ) : records.length === 0 ? (
          <EmptyState title="Nenhum usuário encontrado" description="Os perfis reais do Supabase aparecerão aqui assim que existirem ou corresponderem aos filtros aplicados." />
        ) : (
          <div className="space-y-3">
            {records.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.full_name || item.email}</p>
                    <StatusPill label={item.role} />
                    <StatusPill label={normalizeStatusLabel(item.status)} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.email}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.agency_name || "Sem agência vinculada"} • última atividade {formatDateLabel(item.last_activity_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSelectedId(item.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setEditUser(item)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Reset em breve", description: "O reset de acesso depende da camada admin do Auth e ficará para a próxima etapa." })}>
                    <BellRing className="mr-2 h-4 w-4" />
                    Resetar acesso
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <UserEditDialog
        open={Boolean(editUser)}
        onOpenChange={(open) => !open && setEditUser(null)}
        initialUser={editUser}
        onSaved={(nextUser) => {
          setOverview((current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((entry) => (entry.id === nextUser.id ? { ...entry, ...nextUser } : entry)),
                }
              : current,
          )
        }}
      />

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedUser ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedUser.full_name || selectedUser.email}</DialogTitle>
                <DialogDescription>Detalhe real do perfil com role, vínculo de agência e trilha de auditoria disponível.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard label="E-mail" value={selectedUser.email} />
                  <InfoCard label="Role" value={selectedUser.role} />
                  <InfoCard label="Status" value={normalizeStatusLabel(selectedUser.status)} />
                  <InfoCard label="Agência" value={selectedUser.agency_name || "Sem vínculo"} />
                  <InfoCard label="Role membro" value={selectedUser.member_role || "Sem vínculo"} />
                  <InfoCard label="Status membro" value={selectedUser.member_status || "Sem vínculo"} />
                  <InfoCard label="Telefone" value={selectedUser.phone || "Nao informado"} />
                  <InfoCard label="Última atividade" value={formatDateLabel(selectedUser.last_activity_at)} />
                </div>

                <DashboardCard title="Auditoria recente" description="Eventos reais do usuário quando disponíveis no audit log.">
                  <div className="space-y-3">
                    {selectedUser.audit_logs.length > 0 ? selectedUser.audit_logs.map((log) => (
                      <div key={log.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{log.action}</p>
                          <StatusPill label={normalizeStatusLabel(log.status)} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{log.entity} • {formatDateLabel(log.created_at)}</p>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">Sem trilha de auditoria vinculada a este usuário por enquanto.</p>}
                  </div>
                </DashboardCard>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setEditUser(selectedUser)}>
                  Editar
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Convite em breve", description: "O reenvio de convite ficará para quando o fluxo Auth Admin for ligado ao Master." })}>
                  Reenviar convite
                </Button>
                <Button className="rounded-full" onClick={() => toast({ title: "Reset em breve", description: "O reset de acesso ainda depende da camada admin do Auth." })}>
                  Resetar acesso
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Carregando detalhe real do usuário...</div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterFinancePage() {
  const [overview, setOverview] = useState<MasterFinanceOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<MasterFinanceOverview>("/api/master/finance")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o financeiro master.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const payments = overview?.recent_payments ?? []

  return (
    <PageShell>
      <SectionHeader
        title="Financeiro"
        description="Billing real do Master com pagamentos, assinaturas, financeiro agregado e créditos."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => toast({ title: "Cobrança em breve", description: "A emissão operacional de cobrança ficará para a próxima fase, sem Stripe real nesta etapa." })}>
              Gerar cobrança
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Stripe em breve", description: "Checkout, Stripe e cobrança automática continuam fora do escopo desta etapa." })}>
              Conectar Stripe
            </Button>
          </div>
        }
      />

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar o financeiro master agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pagamentos" value={isLoading ? "--" : String(overview?.totals.payments_count ?? 0)} change={isLoading ? "Carregando..." : formatMoney(overview?.totals.payments_total ?? 0)} tone="info" icon={HandCoins} />
        <MetricCard label="Receita paga" value={isLoading ? "--" : formatMoney(overview?.totals.paid_total ?? 0)} change={isLoading ? "Carregando..." : `Operacional ${formatMoney(overview?.totals.revenue_records_total ?? 0)}`} tone="success" icon={Wallet} />
        <MetricCard label="Assinaturas ativas" value={isLoading ? "--" : String(overview?.totals.active_subscriptions ?? 0)} change="Base real de subscriptions" tone="info" icon={ShieldCheck} />
        <MetricCard label="Créditos" value={isLoading ? "--" : `${overview?.totals.credits_sold ?? 0}`} change={isLoading ? "Carregando..." : `${overview?.totals.credits_consumed ?? 0} consumidos`} tone="warning" icon={CreditCard} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Status de cobrança" description="Leitura real dos pagamentos registrados quando houver dados.">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Pagos" value={String(overview?.billing_status.paid ?? 0)} />
            <InfoCard label="Pendentes" value={String(overview?.billing_status.pending ?? 0)} />
            <InfoCard label="Atrasados" value={String(overview?.billing_status.overdue ?? 0)} />
            <InfoCard label="Outros" value={String(overview?.billing_status.other ?? 0)} />
            <InfoCard label="Receitas operacionais" value={formatMoney(overview?.totals.revenue_records_total ?? 0)} />
            <InfoCard label="Despesas operacionais" value={formatMoney(overview?.totals.expense_records_total ?? 0)} />
          </div>
        </DashboardCard>

        <DashboardCard title="Ações futuras" description="Fluxos que continuam honestamente como próximas etapas do Master.">
          <div className="space-y-3">
            {[
              "Cobrança automática via Stripe continua em breve.",
              "Checkout e emissão externa continuam fora desta etapa.",
              "Exportação financeira avançada continua futura.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Últimos pagamentos" description="Histórico real de cobranças registradas no Supabase.">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={`master-finance-skeleton-${index}`} className="h-24 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState title="Nenhum pagamento registrado" description="Quando houver pagamentos ou cobranças persistidas, eles aparecerão aqui com status real." />
        ) : (
          <div className="space-y-3">
            {payments.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.agency_name || "Agência sem nome"}</p>
                    <StatusPill label={normalizeStatusLabel(item.status)} />
                    {item.plan_code ? <StatusPill label={item.plan_code} /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{formatMoney(Number(item.amount || 0))} • {item.payment_method || "Sem método"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Pago em {formatDateLabel(item.paid_at)} • criado em {formatDateLabel(item.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Cobrança em breve", description: "A ação manual de cobrar seguirá para a próxima etapa do Master." })}>
                    Cobrar
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Checkout em breve", description: "A abertura de checkout permanece futura nesta etapa." })}>
                    Abrir checkout
                  </Button>
                  <Button className="rounded-full" onClick={() => toast({ title: "Relatório em breve", description: "A exportação financeira avançada ficará concentrada no módulo de relatórios do Master." })}>
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
