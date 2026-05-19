"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeCheck,
  BarChart3,
  BellRing,
  Bot,
  Building2,
  ChartNoAxesCombined,
  CheckCheck,
  CreditCard,
  Download,
  Eye,
  FilePenLine,
  FileStack,
  HandCoins,
  LineChart,
  MessageSquareText,
  MoreHorizontal,
  Percent,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  UserCog,
  Users,
  Wallet,
} from "lucide-react"
import { agencies } from "@/mock/agencies"
import { payments } from "@/mock/financial"
import { templates as templateMock } from "@/mock/templates"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { MetricCard } from "@/components/system/metric-card"
import { DashboardCard } from "@/components/system/dashboard-card"
import { MockChart } from "@/components/system/mock-chart"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInput } from "@/components/system/search-input"
import { FilterTabs } from "@/components/system/filter-tabs"
import { toast } from "@/components/ui/use-toast"

type AgencyRecord = {
  id: string
  name: string
  plan: string
  status: string
  owner: string
  city: string
  iaUsage: string
  whatsappUsage: string
  credits: string
  mrr: string
  createdAt: string
  lastAccess: string
  health: string
  monthsOnPlatform: string
  paymentStatus: string
  nextBilling: string
  totalSpend: string
  matchStatus: string
}

type MasterUser = {
  id: string
  name: string
  email: string
  role: string
  agency: string
  status: string
  lastAccess: string
  permissions: string
}

type MarketplaceEntry = {
  id: string
  agency: string
  packageName: string
  status: string
  score: string
  views: string
  leads: string
  revenue: string
  reports: string
}

type TemplateEntry = {
  id: string
  name: string
  type: string
  category: string
  status: string
  usage: string
  createdAt: string
  updatedAt: string
  plan: string
}

type PlanEntry = {
  id: string
  name: string
  price: string
  users: string
  credits: string
  ai: string
  go: string
  agent: string
  match: string
  marketing: string
  automations: string
  activeAgencies: string
  mrr: string
  churn: string
  upgrades: string
}

type AtlasTicket = {
  id: string
  agency: string
  user: string
  subject: string
  severity: string
  status: string
  source: string
  openedAt: string
  cause: string
}

const alertItems = [
  { id: "alert-1", type: "Inadimplência", severity: "Alta", agency: "Serra Azul Turismo", time: "há 12 min" },
  { id: "alert-2", type: "Uso IA acima do esperado", severity: "Média", agency: "Horizonte Viagens", time: "há 18 min" },
  { id: "alert-3", type: "Créditos em risco", severity: "Alta", agency: "Destino Certo", time: "há 24 min" },
  { id: "alert-4", type: "Falha no WhatsApp", severity: "Alta", agency: "Atlântico Premium", time: "há 39 min" },
  { id: "alert-5", type: "Atlas sem resolução", severity: "Crítica", agency: "Horizonte Viagens", time: "há 57 min" },
  { id: "alert-6", type: "Pacote denunciado", severity: "Média", agency: "JT Viagens Premium", time: "hoje" },
]

const growthSeries = [
  { label: "Jan", value: 18, expenses: 11, profit: 7 },
  { label: "Fev", value: 26, expenses: 14, profit: 12 },
  { label: "Mar", value: 34, expenses: 16, profit: 18 },
  { label: "Abr", value: 44, expenses: 19, profit: 25 },
  { label: "Mai", value: 52, expenses: 22, profit: 30 },
  { label: "Jun", value: 63, expenses: 24, profit: 39 },
]

const agencyBase: AgencyRecord[] = agencies.map((agency, index) => ({
  ...agency,
  createdAt: ["12 jan 2025", "04 mar 2025", "18 nov 2024", "22 fev 2025"][index] ?? "01 jan 2025",
  lastAccess: ["Hoje, 09:14", "Hoje, 08:41", "Ontem, 18:20", "Hoje, 07:58"][index] ?? "Hoje, 10:00",
  health: ["Saudável", "Atenção", "Risco", "Saudável"][index] ?? "Saudável",
  monthsOnPlatform: ["16 meses", "14 meses", "19 meses", "15 meses"][index] ?? "12 meses",
  paymentStatus: ["Pago", "Pago", "Atrasado", "Pendente"][index] ?? "Pago",
  nextBilling: ["20 mai 2026", "22 mai 2026", "14 mai 2026", "28 mai 2026"][index] ?? "30 mai 2026",
  totalSpend: ["R$ 24.880", "R$ 38.240", "R$ 8.320", "R$ 17.910"][index] ?? "R$ 10.000",
  matchStatus: ["Ativo", "Ativo", "Inativo", "Ativo"][index] ?? "Ativo",
}))

const masterUsersBase: MasterUser[] = [
  { id: "usr-1", name: "Mateus Nascimento", email: "master@travelpro.com", role: "MASTER", agency: "TravelPro", status: "Ativo", lastAccess: "Hoje, 08:42", permissions: "Total" },
  { id: "usr-2", name: "Julia Prado", email: "ops@travelpro.com", role: "AGENCY_MANAGER", agency: "TravelPro", status: "Ativo", lastAccess: "Hoje, 09:03", permissions: "Onboarding + contas" },
  { id: "usr-3", name: "Leonardo Maia", email: "finance@travelpro.com", role: "AGENCY_FINANCE", agency: "TravelPro", status: "Ativo", lastAccess: "Ontem, 19:12", permissions: "Billing + crédito" },
]

const marketplaceBase: MarketplaceEntry[] = [
  { id: "mk-1", agency: "Horizonte Viagens", packageName: "Inverno em Gramado", status: "Publicado", score: "82%", views: "8.420", leads: "124", revenue: "R$ 9.880", reports: "0" },
  { id: "mk-2", agency: "Atlântico Premium", packageName: "Lua de mel nas Maldivas", status: "Destaque", score: "91%", views: "11.204", leads: "168", revenue: "R$ 16.200", reports: "1" },
  { id: "mk-3", agency: "Destino Certo", packageName: "Verão em Cancún", status: "Publicado", score: "79%", views: "6.930", leads: "98", revenue: "R$ 8.420", reports: "0" },
]

const templateBase: TemplateEntry[] = templateMock.map((item, index) => ({
  ...item,
  usage: ["84 agências", "112 agências", "46 agências", "78 agências"][index] ?? "22 agências",
  createdAt: ["15 jan 2025", "09 mar 2025", "27 abr 2025", "02 fev 2025"][index] ?? "01 jan 2025",
  updatedAt: ["Hoje, 10:12", "Ontem, 18:04", "Hoje, 08:11", "Hoje, 07:45"][index] ?? "Hoje, 09:00",
  plan: ["Pro e Scale", "Todos", "Pro", "Start, Pro e Scale"][index] ?? "Todos",
}))

const planBase: PlanEntry[] = [
  { id: "plan-1", name: "Start", price: "R$ 497", users: "3", credits: "1.500", ai: "Básico", go: "1 número", agent: "Limitado", match: "Entrada", marketing: "Off", automations: "Essenciais", activeAgencies: "26", mrr: "R$ 12.922", churn: "5,8%", upgrades: "7" },
  { id: "plan-2", name: "Pro", price: "R$ 997", users: "6", credits: "3.500", ai: "Médio", go: "2 números", agent: "Assistido", match: "Expandido", marketing: "On", automations: "Intermediárias", activeAgencies: "41", mrr: "R$ 40.877", churn: "3,2%", upgrades: "11" },
  { id: "plan-3", name: "Scale", price: "R$ 1.490", users: "8", credits: "6.000", ai: "Avançado", go: "3 números", agent: "Completo", match: "Premium", marketing: "On", automations: "Premium", activeAgencies: "34", mrr: "R$ 50.660", churn: "2,4%", upgrades: "18" },
]

const atlasBase: AtlasTicket[] = [
  { id: "atl-1", agency: "Horizonte Viagens", user: "Marina Alves", subject: "Atlas não resolveu regra de follow-up", severity: "Crítica", status: "Escalado", source: "Atlas Advisor", openedAt: "há 42 min", cause: "Base de scripts insuficiente para cenário híbrido" },
  { id: "atl-2", agency: "Atlântico Premium", user: "Rafael Costa", subject: "Dúvida sobre moderação do Match", severity: "Média", status: "Aberto", source: "Marketplace", openedAt: "há 1h", cause: "Política de destaque ainda não aplicada ao caso" },
  { id: "atl-3", agency: "Destino Certo", user: "Diego Prado", subject: "Erro recorrente em orientação de cobrança", severity: "Alta", status: "Aberto", source: "Financeiro", openedAt: "há 2h", cause: "Contexto de billing incompleto" },
]

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function statusTone(status: string) {
  if (["Ativa", "Ativo", "Publicado", "Pago", "Saudável", "Resolvido"].includes(status)) return "success"
  if (["Atrasado", "Risco", "Crítica", "Escalado"].includes(status)) return "danger"
  if (["Pendente", "Atenção", "Aberto", "Em emissão"].includes(status)) return "warning"
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

function MasterHeaderActions({ primary, secondary }: { primary?: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {primary}
      {secondary}
    </div>
  )
}

type ConfirmAction = {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
} | null

type MockField = {
  label: string
  value: string
}

function ModalField({ label, value }: MockField) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      <input defaultValue={value} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
    </label>
  )
}

function ConfirmationDialog({ action, onClose }: { action: ConfirmAction; onClose: () => void }) {
  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{action?.title}</DialogTitle>
          <DialogDescription>{action?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              action?.onConfirm()
              onClose()
            }}
          >
            {action?.confirmLabel ?? "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MockFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  confirmLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  fields: MockField[]
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[56vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          {fields.map((field) => (
            <ModalField key={field.label} {...field} />
          ))}
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MasterDashboardPage() {
  const fireAction = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Dashboard Master"
        description="Centro executivo do TravelPro com saúde da plataforma, alertas, crescimento e decisões operacionais."
        actions={
          <MasterHeaderActions
            primary={<Button asChild className="rounded-full"><Link href="/master/relatorios">Abrir relatórios</Link></Button>}
            secondary={<Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]"><Link href="/master/atlas">Ver Atlas</Link></Button>}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <MetricCard label="Agências ativas" value="128" change="+12 este mês" tone="success" icon={Building2} />
        <MetricCard label="MRR estimado" value="R$ 38.490" change="+8,4% no ciclo" tone="success" icon={Wallet} />
        <MetricCard label="Uso IA" value="74k exec." change="R$ 6.420 de custo" tone="warning" icon={Bot} />
        <MetricCard label="Créditos consumidos" value="228k" change="86% do previsto" tone="warning" icon={CreditCard} />
        <MetricCard label="Chamados Atlas" value="18" change="4 críticos" tone="danger" icon={ShieldAlert} />
        <MetricCard label="Market Match" value="312 pacotes" change="22 em destaque" tone="info" icon={Store} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MockChart title="Crescimento da plataforma" description="Base ativa, custo e margem por ciclo." span="half" series={growthSeries} />
        <DashboardCard title="Alertas" description="Sinais que merecem ação imediata do time Master.">
          <div className="space-y-3">
            {alertItems.map((item) => (
              <div key={item.id} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.type}</p>
                      <StatusPill label={item.severity} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.agency}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fireAction("Agência notificada", `${item.agency} recebeu um aviso executivo.`)}>Notificar</Button>
                    <Button size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fireAction("Detalhes do alerta", `O alerta ${item.type} foi aberto em modo mockado.`)}>Ver detalhes</Button>
                    <Button size="sm" className="rounded-full" onClick={() => fireAction("Alerta resolvido", `${item.type} foi marcado como tratado.`)}>Resolver</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}

export function MasterAgenciesPage() {
  const [records, setRecords] = useState<AgencyRecord[]>(agencyBase)
  const [selected, setSelected] = useState<AgencyRecord | null>(null)
  const [activeFilter, setActiveFilter] = useState("Status")
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  const toggleStatus = (id: string) => {
    setRecords((current) =>
      current.map((item) => (item.id === id ? { ...item, status: item.status === "Ativa" ? "Inativa" : "Ativa" } : item)),
    )
  }

  return (
    <PageShell>
      <SectionHeader
        title="Agências"
        description="Controle completo da base com filtros, ranking, ações administrativas e visão 360 da conta."
        actions={<MasterHeaderActions primary={<Button className="rounded-full" onClick={() => setCreateOpen(true)}>Nova agência</Button>} secondary={<Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Base exportada", "A exportação mockada da base foi preparada.")}>Exportar base</Button>} />}
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar agência, responsável ou cidade" />
        </div>
        <FilterTabs items={["Status", "Plano", "Inadimplência", "Uso IA", "Uso WhatsApp", "Match ativo", "Cadastro"]} activeItem={activeFilter} onChange={setActiveFilter} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard title="Base de agências" description="Ações rápidas por conta com prioridade para operação e crescimento.">
          <div className="space-y-3">
            {records.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <StatusPill label={item.status} />
                    <StatusPill label={item.plan} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.owner} • {item.city}</p>
                  <p className="mt-2 text-xs text-muted-foreground">IA {item.iaUsage} • WhatsApp {item.whatsappUsage} • Créditos {item.credits}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelected(item)}>
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Agência em edição", `${item.name} foi aberta para edição mockada.`)}>
                      <FilePenLine className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => toggleStatus(item.id)}>
                      <ArrowRightLeft className="h-4 w-4" />
                      {item.status === "Ativa" ? "Inativar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Agência notificada", `${item.name} recebeu um comunicado administrativo.`)}>
                      <BellRing className="h-4 w-4" />
                      Notificar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Bônus aplicado", `${item.name} recebeu créditos bonificados em modo mockado.`)}>
                      <CreditCard className="h-4 w-4" />
                      Bonificar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Plano preparado", `A alteração de plano de ${item.name} foi preparada em modo mockado.`)}>
                      <ShieldCheck className="h-4 w-4" />
                      Alterar plano
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Modo agência", `A visualização como ${item.name} foi preparada em modo mockado.`)}>
                      <Building2 className="h-4 w-4" />
                      Ver como agência
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200" onSelect={() => setConfirmAction({
                      title: "Excluir agência",
                      description: `Deseja confirmar a exclusão mockada de ${item.name}?`,
                      confirmLabel: "Excluir agência",
                      onConfirm: () => fire("Agência excluída", `${item.name} foi removida em modo mockado.`),
                    })}>
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Ranking e risco" description="Leituras rápidas para operar crescimento, margem e churn.">
          <div className="space-y-3">
            {[
              "Agências que mais consomem IA: Horizonte Viagens, Atlântico Premium",
              "Agências que mais faturam: Atlântico Premium, Horizonte Viagens",
              "Agências que mais gastam no sistema: Atlântico Premium, Destino Certo",
              "Agências com maior uso do Match: Atlântico Premium, Horizonte Viagens",
              "Agências em risco de churn: Serra Azul Turismo, Destino Certo",
              "Agências há mais tempo na base: Serra Azul Turismo, Horizonte Viagens",
            ].map((line) => (
              <div key={line} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                {line}
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova agência"
        description="Cadastre uma nova agência com plano inicial e responsável principal."
        fields={[
          { label: "Agência", value: "Pulsar Viagens" },
          { label: "Responsável", value: "Larissa Moura" },
          { label: "Cidade", value: "Belo Horizonte" },
          { label: "Plano inicial", value: "Pro" },
        ]}
        confirmLabel="Salvar agência"
        onConfirm={() => fire("Agência criada", "A nova agência foi preparada em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Visão administrativa completa da conta, cobrança, uso, analytics e histórico.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-white/8 px-4 py-4">
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-3xl bg-transparent p-0">
                    <TabsTrigger value="overview" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Visão geral</TabsTrigger>
                    <TabsTrigger value="finance" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Financeiro</TabsTrigger>
                    <TabsTrigger value="usage" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Uso e créditos</TabsTrigger>
                    <TabsTrigger value="modules" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Funções</TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Analytics</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Histórico</TabsTrigger>
                  </TabsList>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                  <TabsContent value="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard label="Status" value={selected.status} />
                    <InfoCard label="Plano atual" value={selected.plan} />
                    <InfoCard label="Tempo de uso" value={selected.monthsOnPlatform} />
                    <InfoCard label="Data de cadastro" value={selected.createdAt} />
                    <InfoCard label="Último acesso" value={selected.lastAccess} />
                    <InfoCard label="Saúde da conta" value={selected.health} />
                    <InfoCard label="Responsável" value={selected.owner} />
                    <InfoCard label="Cidade" value={selected.city} />
                    <InfoCard label="Match" value={selected.matchStatus} />
                  </TabsContent>
                  <TabsContent value="finance" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard label="Plano assinado" value={selected.plan} />
                    <InfoCard label="Valor mensal" value={selected.mrr} />
                    <InfoCard label="Status de pagamento" value={selected.paymentStatus} />
                    <InfoCard label="Última cobrança" value="24 abr 2026" />
                    <InfoCard label="Próxima cobrança" value={selected.nextBilling} />
                    <InfoCard label="Total gasto" value={selected.totalSpend} />
                    <InfoCard label="Inadimplência" value={selected.paymentStatus === "Atrasado" ? "Sim" : "Não"} />
                    <InfoCard label="Pacotes extras" value="Match destaque + créditos adicionais" />
                    <InfoCard label="Histórico" value="6 cobranças concluídas no ano" />
                  </TabsContent>
                  <TabsContent value="usage" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard label="Uso IA" value={selected.iaUsage} />
                    <InfoCard label="Créditos consumidos" value="3.820" />
                    <InfoCard label="Créditos disponíveis" value={selected.credits} />
                    <InfoCard label="TravelPro Go" value="Ativo" />
                    <InfoCard label="Agent" value="Ativo" />
                    <InfoCard label="Marketing IA" value="On" />
                    <InfoCard label="Match" value={selected.matchStatus} />
                    <InfoCard label="Documentos gerados" value="482" />
                    <InfoCard label="PDFs" value="191" />
                    <InfoCard label="WhatsApp" value={selected.whatsappUsage} />
                    <InfoCard label="Automações" value="12 fluxos ativos" />
                  </TabsContent>
                  <TabsContent value="modules" className="grid gap-4 md:grid-cols-2">
                    <InfoCard label="Módulos ativos" value="Go, Agent, Match, Financeiro, Documentos" />
                    <InfoCard label="Módulos bloqueados" value="Nenhum bloqueio estrutural" />
                    <InfoCard label="Limites por plano" value="Scale com créditos e IA avançados" />
                    <InfoCard label="Upgrades ativos" value="Destaque Match + bônus de crédito" />
                    <InfoCard label="Permissões" value="Admin total + equipe financeira limitada" />
                  </TabsContent>
                  <TabsContent value="analytics" className="space-y-4">
                    <MockChart title="Crescimento da agência" description="Uso por período e evolução do negócio." span="full" series={growthSeries.slice(0, 4)} />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InfoCard label="Leads" value="184 no mês" />
                      <InfoCard label="Viagens" value="42 ativas" />
                      <InfoCard label="Documentos" value="482 gerados" />
                      <InfoCard label="Conversões Match" value="18 fechamentos" />
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="space-y-3">
                    {["Plano alterado para Scale", "Bônus de 1.000 créditos aplicado", "Agência notificada sobre uso IA", "Acesso master em modo visualização", "Chamado Atlas aberto sobre follow-up", "Desbloqueio após regularização financeira"].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
                    ))}
                  </TabsContent>
                </div>
              </Tabs>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Agência em edição", `${selected.name} foi aberta para edição mockada.`)}>Editar agência</Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Agência notificada", `${selected.name} recebeu um comunicado administrativo.`)}>Notificar</Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Créditos bonificados", `${selected.name} recebeu um bônus de créditos.`)}>Bonificar créditos</Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Plano pronto para ajuste", `A troca de plano de ${selected.name} foi preparada.`)}>Alterar plano</Button>
                <Button className="rounded-full" onClick={() => fire("Modo agência", `Visualização como ${selected.name} preparada em modo mockado.`)}>Ver como agência</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterUsersPage() {
  const [records, setRecords] = useState(masterUsersBase)
  const [selected, setSelected] = useState<MasterUser | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  const toggleStatus = (id: string) => {
    setRecords((current) => current.map((item) => (item.id === id ? { ...item, status: item.status === "Ativo" ? "Inativo" : "Ativo" } : item)))
  }

  return (
    <PageShell>
      <SectionHeader title="Usuários Master" description="Acessos administrativos, roles, permissões e histórico de atividade." actions={<Button className="rounded-full" onClick={() => fire("Convite preparado", "O fluxo de convite de usuário Master ficou pronto em modo mockado.")}>Convidar usuário</Button>} />
      <DashboardCard title="Equipe administrativa" description="Cada usuário possui ações rápidas e detalhe individual.">
        <div className="space-y-3">
          {records.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <StatusPill label={item.status} />
                  <StatusPill label={item.role} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.email}</p>
                <p className="mt-2 text-xs text-muted-foreground">Último acesso: {item.lastAccess} • Permissões: {item.permissions}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelected(item)}><Eye className="h-4 w-4" />Visualizar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Usuário em edição", `${item.name} foi aberto para edição mockada.`)}><UserCog className="h-4 w-4" />Editar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => toggleStatus(item.id)}><ArrowRightLeft className="h-4 w-4" />{item.status === "Ativo" ? "Inativar" : "Ativar"}</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Usuário notificado", `${item.name} recebeu uma notificação administrativa.`)}><BellRing className="h-4 w-4" />Notificar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200" onSelect={() => setConfirmAction({
                    title: "Excluir usuário",
                    description: `Deseja confirmar a exclusão mockada de ${item.name}?`,
                    confirmLabel: "Excluir usuário",
                    onConfirm: () => fire("Usuário excluído", `${item.name} foi removido em modo mockado.`),
                  })}><Trash2 className="h-4 w-4" />Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </DashboardCard>
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Dados, role, permissões, vínculo e histórico do usuário administrativo.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="E-mail" value={selected.email} />
                <InfoCard label="Role" value={selected.role} />
                <InfoCard label="Agência vinculada" value={selected.agency} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Último acesso" value={selected.lastAccess} />
                <InfoCard label="Permissões" value={selected.permissions} />
              </div>
              <div className="space-y-3 px-6 pb-5">
                {["Acesso ao financeiro exportado", "Alerta de uso IA revisado", "Alteração de plano confirmada", "Convite de novo usuário aprovado"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
                ))}
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Usuário editado", `${selected.name} foi colocado em modo de edição.`)}>Editar</Button>
                <Button className="rounded-full" onClick={() => fire("Permissões revisadas", `As permissões de ${selected.name} foram ajustadas em modo mockado.`)}>Aplicar ajuste</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterMarketplacePage() {
  const [records] = useState(marketplaceBase)
  const [selected, setSelected] = useState<MarketplaceEntry | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader title="Marketplace" description="Controle do TravelPro Match com pacotes, moderação, receita, score e impulsionamento." actions={<MasterHeaderActions primary={<Button className="rounded-full" onClick={() => fire("Campanha preparada", "O fluxo de destaque do marketplace foi aberto em modo mockado.")}>Criar destaque</Button>} secondary={<Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Relatório preparado", "O relatório de marketplace foi preparado.")}>Exportar relatório</Button>} />} />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Agências participantes" value="86" change="+9 no mês" tone="success" icon={Building2} />
        <MetricCard label="Pacotes ativos" value="312" change="22 em destaque" tone="info" icon={Store} />
        <MetricCard label="Leads gerados" value="1.420" change="+14%" tone="success" icon={Users} />
        <MetricCard label="Receita Match" value="R$ 28.200" change="impulsionamento + destaque" tone="warning" icon={Wallet} />
      </div>
      <DashboardCard title="Operação do Match" description="Pacotes, score, cliques e moderação por agência.">
        <div className="space-y-3">
          {records.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.packageName}</p>
                  <StatusPill label={item.status} />
                  <StatusPill label={`Score ${item.score}`} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.agency}</p>
                <p className="mt-2 text-xs text-muted-foreground">Views {item.views} • Leads {item.leads} • Receita {item.revenue} • Denúncias {item.reports}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelected(item)}><Eye className="h-4 w-4" />Visualizar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Pacote em edição", `${item.packageName} foi aberto para edição mockada.`)}><FilePenLine className="h-4 w-4" />Editar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Status alterado", `${item.packageName} teve seu status ajustado em modo mockado.`)}><ArrowRightLeft className="h-4 w-4" />Ativar/Inativar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Agência notificada", `${item.agency} recebeu um aviso sobre o marketplace.`)}><BellRing className="h-4 w-4" />Notificar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Destaque configurado", `${item.packageName} entrou em destaque mockado.`)}><BadgeCheck className="h-4 w-4" />Destacar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200" onSelect={() => setConfirmAction({
                    title: "Remover pacote",
                    description: `Deseja confirmar a remoção mockada de ${item.packageName}?`,
                    confirmLabel: "Remover pacote",
                    onConfirm: () => fire("Pacote removido", `${item.packageName} foi removido em modo mockado.`),
                  })}><Trash2 className="h-4 w-4" />Remover</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </DashboardCard>
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.packageName}</DialogTitle>
                <DialogDescription>Detalhe do pacote no Match com desempenho, moderação, receita e histórico.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard label="Agência responsável" value={selected.agency} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Score médio" value={selected.score} />
                <InfoCard label="Leads gerados" value={selected.leads} />
                <InfoCard label="Visualizações" value={selected.views} />
                <InfoCard label="Cliques WhatsApp" value="412" />
                <InfoCard label="Impulsionamentos" value="3 ativos" />
                <InfoCard label="Denúncias / moderação" value={selected.reports} />
                <InfoCard label="Receita gerada" value={selected.revenue} />
              </div>
              <div className="space-y-3 px-6 pb-5">
                {["Pacote entrou em destaque premium", "Score aumentou após melhoria visual", "Uma denúncia foi analisada e resolvida", "Agência recebeu 18 leads no ciclo"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
                ))}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterFinancePage() {
  const [activeFilter, setActiveFilter] = useState("MRR")
  const [chargeOpen, setChargeOpen] = useState(false)
  const [selected, setSelected] = useState<(typeof payments)[number] | null>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Financeiro"
        description="Billing, pagamentos, inadimplência e leitura financeira administrativa da plataforma."
        actions={
          <MasterHeaderActions
            primary={<Button className="rounded-full" onClick={() => setChargeOpen(true)}>Gerar cobrança</Button>}
            secondary={<Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Relatório baixado", "O relatório financeiro foi preparado em modo mockado.")}>Baixar relatório</Button>}
          />
        }
      />
      <FilterTabs items={["MRR", "Pagamentos", "Inadimplência", "Histórico"]} activeItem={activeFilter} onChange={setActiveFilter} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Receita mensal" value="R$ 38.490" change="Fechamento parcial" tone="success" icon={Wallet} />
        <MetricCard label="Inadimplência" value="3 contas" change="Exige atenção" tone="danger" icon={AlertTriangle} />
        <MetricCard label="Assinaturas ativas" value="124" change="4 upgrades na semana" tone="info" icon={CreditCard} />
        <MetricCard label="Próximos vencimentos" value="18" change="Janela de 7 dias" tone="warning" icon={BadgeCheck} />
      </div>
      <DashboardCard title="Histórico financeiro" description="Abra, edite ou notifique cada item financeiro da base.">
        <div className="space-y-3">
          {payments.map((item, index) => (
            <div key={`${item.agency}-${index}`} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.agency}</p>
                  <StatusPill label={item.status} />
                  <StatusPill label={item.plan} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.amount} • vencimento {item.dueDate}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSelected(item)}>Visualizar</Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Item em edição", `${item.agency} foi aberto para edição mockada.`)}>Editar</Button>
                <Button className="rounded-full" onClick={() => fire("Agência notificada", `${item.agency} recebeu um aviso financeiro mockado.`)}>Notificar</Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <MockFormDialog
        open={chargeOpen}
        onOpenChange={setChargeOpen}
        title="Gerar cobrança"
        description="Prepare uma nova cobrança administrativa para uma agência da base."
        fields={[
          { label: "Agência", value: "Horizonte Viagens" },
          { label: "Plano", value: "Scale" },
          { label: "Valor", value: "R$ 1.490" },
          { label: "Vencimento", value: "24 mai 2026" },
        ]}
        confirmLabel="Gerar cobrança"
        onConfirm={() => fire("Cobrança gerada", "A cobrança foi preparada em modo mockado.")}
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.agency}</DialogTitle>
                <DialogDescription>Detalhe financeiro com plano, valor, vencimento e status atual.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Plano" value={selected.plan} />
                <InfoCard label="Valor" value={selected.amount} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Vencimento" value={selected.dueDate} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<"connections" | "go" | "agent">("connections")
  const [createOpen, setCreateOpen] = useState(false)
  const [goOpen, setGoOpen] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [selectedNumber, setSelectedNumber] = useState<{ agency: string; number: string; status: string; go: string; agent: string; messages: string } | null>(null)
  const fire = (title: string, description: string) => toast({ title, description })
  const numbers = [
    { id: "wa-1", agency: "Horizonte Viagens", number: "+55 11 99888-1111", status: "Conectado", go: "Ativo", agent: "Ativo", messages: "12.480" },
    { id: "wa-2", agency: "Atlântico Premium", number: "+55 21 99777-2222", status: "Conectado", go: "Ativo", agent: "Pausado", messages: "9.230" },
    { id: "wa-3", agency: "Destino Certo", number: "+55 31 99666-3333", status: "Instável", go: "Ativo", agent: "Ativo", messages: "7.540" },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="WhatsApp"
        description="Conexões, canais e configuração dedicada do TravelPro Go e do TravelPro Agent."
        actions={<Button className="rounded-full" onClick={() => setCreateOpen(true)}>Adicionar número</Button>}
      />
      <FilterTabs items={["Conexões", "TravelPro Go", "TravelPro Agent"]} activeItem={activeTab === "connections" ? "Conexões" : activeTab === "go" ? "TravelPro Go" : "TravelPro Agent"} onChange={(item) => setActiveTab(item === "TravelPro Go" ? "go" : item === "TravelPro Agent" ? "agent" : "connections")} />

      {activeTab === "connections" ? (
        <DashboardCard title="Números conectados" description="Gerencie conexões ativas, consumo e módulos habilitados por agência.">
          <div className="space-y-3">
            {numbers.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.agency}</p>
                    <StatusPill label={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.number}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Go {item.go} • Agent {item.agent} • Mensagens {item.messages}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSelectedNumber(item)}>Visualizar</Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Número em edição", `${item.number} foi aberto para edição mockada.`)}>Editar</Button>
                  <Button className="rounded-full" onClick={() => setConfirmAction({
                    title: "Excluir número",
                    description: `Deseja confirmar a exclusão mockada de ${item.number}?`,
                    confirmLabel: "Excluir número",
                    onConfirm: () => fire("Número excluído", `${item.number} foi removido em modo mockado.`),
                  })}>Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      ) : null}

      {activeTab === "go" ? (
        <DashboardCard title="TravelPro Go" description="Configuração separada do WhatsApp operacional oficial da agência.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard label="WhatsApp principal" value="+55 11 99888-1111" />
            <InfoCard label="Número atendente" value="+55 11 97777-1010" />
            <InfoCard label="Permissões" value="Lançamentos, notificações e ações internas" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setGoOpen(true)}>Visualizar configuração</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setGoOpen(true)}>Editar configuração</Button>
            <Button className="rounded-full" onClick={() => fire("Configuração Go salva", "As permissões e o número oficial foram salvos em modo mockado.")}>Salvar configuração</Button>
          </div>
        </DashboardCard>
      ) : null}

      {activeTab === "agent" ? (
        <DashboardCard title="TravelPro Agent" description="Configuração separada do canal do agente IA, regras e estilo de atendimento.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard label="Canal do Agent" value="+55 11 96666-2020" />
            <InfoCard label="Estilo de atendimento" value="Consultivo premium" />
            <InfoCard label="Regras de resposta" value="Escalonar crises, billing e objeções complexas" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setAgentOpen(true)}>Visualizar configuração</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setAgentOpen(true)}>Editar configuração</Button>
            <Button className="rounded-full" onClick={() => fire("Configuração Agent salva", "As regras do agente foram salvas em modo mockado.")}>Salvar configuração</Button>
          </div>
        </DashboardCard>
      ) : null}

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Adicionar número"
        description="Cadastre um novo número ou canal de WhatsApp para uma agência da base."
        fields={[
          { label: "Agência", value: "Horizonte Viagens" },
          { label: "Número", value: "+55 11 95555-3030" },
          { label: "Módulo", value: "TravelPro Go" },
          { label: "Status inicial", value: "Conectado" },
        ]}
        confirmLabel="Salvar número"
        onConfirm={() => fire("Número adicionado", "O novo número foi preparado em modo mockado.")}
      />
      <MockFormDialog
        open={goOpen}
        onOpenChange={setGoOpen}
        title="Configuração TravelPro Go"
        description="Defina o número oficial, atendente e permissões do Go para a agência."
        fields={[
          { label: "WhatsApp principal", value: "+55 11 99888-1111" },
          { label: "Atendente oficial", value: "+55 11 97777-1010" },
          { label: "Permissões", value: "Lançar informações e notificar clientes" },
          { label: "Ações permitidas", value: "Roteiros, documentos, catálogo e tarefas" },
        ]}
        confirmLabel="Salvar configuração"
        onConfirm={() => fire("TravelPro Go salvo", "A configuração do TravelPro Go foi salva em modo mockado.")}
      />
      <MockFormDialog
        open={agentOpen}
        onOpenChange={setAgentOpen}
        title="Configuração TravelPro Agent"
        description="Defina canal, estilo de atendimento e regras de resposta do agente IA."
        fields={[
          { label: "Canal do Agent", value: "+55 11 96666-2020" },
          { label: "Comportamento", value: "Assistido com autonomia controlada" },
          { label: "Estilo", value: "Consultivo premium" },
          { label: "Regras de resposta", value: "Escalonar crises e billing" },
        ]}
        confirmLabel="Salvar configuração"
        onConfirm={() => fire("TravelPro Agent salvo", "A configuração do Agent foi salva em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selectedNumber)} onOpenChange={(open) => !open && setSelectedNumber(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedNumber ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedNumber.agency}</DialogTitle>
                <DialogDescription>Detalhe do canal com estado, módulos e consumo de mensagens.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Número" value={selectedNumber.number} />
                <InfoCard label="Status" value={selectedNumber.status} />
                <InfoCard label="TravelPro Go" value={selectedNumber.go} />
                <InfoCard label="TravelPro Agent" value={selectedNumber.agent} />
                <InfoCard label="Mensagens" value={selectedNumber.messages} />
                <InfoCard label="Origem" value="Canal oficial da agência" />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterLogsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("Sistema")
  const fire = (title: string, description: string) => toast({ title, description })
  const logs = [
    { id: "lg-1", title: "Role atualizada", type: "Administração", agency: "TravelPro", user: "Julia Prado", status: "Concluído", time: "há 10 min" },
    { id: "lg-2", title: "Ajuste manual de créditos", type: "Sistema", agency: "Destino Certo", user: "Leonardo Maia", status: "Concluído", time: "há 28 min" },
    { id: "lg-3", title: "Conexão WhatsApp restabelecida", type: "Auditoria", agency: "Horizonte Viagens", user: "Webhook", status: "Sucesso", time: "há 1h" },
    { id: "lg-4", title: "Falha de cobrança mockada", type: "Erros", agency: "Serra Azul Turismo", user: "Billing", status: "Atenção", time: "há 2h" },
  ]

  return (
    <PageShell>
      <SectionHeader title="Logs" description="Eventos administrativos, erros, sistema e auditoria com filtros aplicáveis." />
      <FilterTabs items={["Sistema", "Administração", "Erros", "Auditoria"]} activeItem={activeFilter} onChange={setActiveFilter} />
      <DashboardCard title="Filtros" description="Refine a trilha por tipo, período, agência, usuário e status.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <InfoCard label="Tipo" value={activeFilter} />
          <InfoCard label="Período" value="Últimos 7 dias" />
          <InfoCard label="Agência" value="Todas" />
          <InfoCard label="Usuário" value="Todos" />
          <InfoCard label="Status" value="Todos" />
        </div>
        <div className="mt-4">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setFiltersOpen(true)}>
            Editar filtros
          </Button>
        </div>
      </DashboardCard>
      <DashboardCard title="Eventos recentes" description="Leitura rápida da trilha administrativa e operacional.">
        <div className="space-y-3">
          {logs.map((item) => (
            <div key={item.id} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <StatusPill label={item.status} />
                    <StatusPill label={item.type} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.agency} • {item.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Editar filtros de logs"
        description="Busque por tipo, período, agência, usuário e status da ocorrência."
        fields={[
          { label: "Tipo", value: activeFilter },
          { label: "Período", value: "Últimos 7 dias" },
          { label: "Agência", value: "Todas" },
          { label: "Usuário", value: "Todos" },
        ]}
        confirmLabel="Aplicar filtros"
        onConfirm={() => fire("Filtros aplicados", "Os filtros de logs foram aplicados em modo mockado.")}
      />
    </PageShell>
  )
}

export function MasterSettingsPage() {
  const [mappingOpen, setMappingOpen] = useState(false)
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Configurações da plataforma"
        description="Parâmetros globais, branding, políticas e preparação das futuras chaves de integração."
        actions={
          <MasterHeaderActions
            primary={<Button className="rounded-full" onClick={() => fire("Parâmetros salvos", "Os parâmetros globais foram salvos em modo mockado.")}>Salvar parâmetros</Button>}
            secondary={<Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setMappingOpen(true)}>Mapear chaves futuras</Button>}
          />
        }
      />
      <DashboardCard title="Parâmetros globais" description="Base administrativa pronta para evoluir para integrações reais.">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard label="Plataforma" value="TravelPro" />
          <InfoCard label="Domínio principal" value="app.travelpro.com" />
          <InfoCard label="Branding global" value="Dark premium + laranja TravelPro" />
          <InfoCard label="Política de créditos" value="Renovação mensal com bônus controlados" />
          <InfoCard label="Alertas executivos" value="Billing, Atlas, WhatsApp, IA e marketplace" />
          <InfoCard label="Integrações futuras" value="Supabase, Stripe, OpenAI, WhatsApp oficial e observabilidade" />
        </div>
      </DashboardCard>
      <MockFormDialog
        open={mappingOpen}
        onOpenChange={setMappingOpen}
        title="Mapear chaves futuras"
        description="Registre o espaço para secrets, webhooks e ambientes que serão conectados depois."
        fields={[
          { label: "Supabase", value: "NEXT_PUBLIC_SUPABASE_URL" },
          { label: "Stripe", value: "STRIPE_SECRET_KEY" },
          { label: "OpenAI", value: "OPENAI_API_KEY" },
          { label: "WhatsApp", value: "WHATSAPP_API_TOKEN" },
        ]}
        confirmLabel="Salvar mapeamento"
        onConfirm={() => fire("Mapeamento salvo", "As chaves futuras foram mapeadas em modo mockado.")}
      />
    </PageShell>
  )
}

export function MasterTemplatesPage() {
  const [records] = useState(templateBase)
  const [selected, setSelected] = useState<TemplateEntry | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader title="Templates" description="Biblioteca premium para roteiros, contratos, cotações, vouchers e documentos operacionais." actions={<Button className="rounded-full" onClick={() => setCreateOpen(true)}>Novo template</Button>} />
      <DashboardCard title="Biblioteca ativa" description="Templates com ações rápidas e contexto de uso por plano.">
        <div className="space-y-3">
          {records.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <StatusPill label={item.status} />
                  <StatusPill label={item.type} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
                <p className="mt-2 text-xs text-muted-foreground">Uso {item.usage} • Última edição {item.updatedAt} • Plano {item.plan}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelected(item)}><Eye className="h-4 w-4" />Visualizar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Template em edição", `${item.name} foi aberto para edição mockada.`)}><FilePenLine className="h-4 w-4" />Editar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Status alterado", `${item.name} teve o status ajustado em modo mockado.`)}><ArrowRightLeft className="h-4 w-4" />Ativar/Inativar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Template duplicado", `${item.name} foi duplicado em modo mockado.`)}><FileStack className="h-4 w-4" />Duplicar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200" onSelect={() => setConfirmAction({
                    title: "Excluir template",
                    description: `Deseja confirmar a exclusão mockada de ${item.name}?`,
                    confirmLabel: "Excluir template",
                    onConfirm: () => fire("Template excluído", `${item.name} foi removido em modo mockado.`),
                  })}><Trash2 className="h-4 w-4" />Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo template"
        description="Crie um novo template com tipo, categoria e plano de disponibilidade."
        fields={[
          { label: "Nome", value: "Contrato Premium Europa" },
          { label: "Tipo", value: "Contrato" },
          { label: "Categoria", value: "Premium" },
          { label: "Plano disponível", value: "Pro e Scale" },
        ]}
        confirmLabel="Salvar template"
        onConfirm={() => fire("Template criado", "O novo template foi preparado em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Visão do template com disponibilidade, uso e histórico de atualização.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Tipo" value={selected.type} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Uso por agências" value={selected.usage} />
                <InfoCard label="Criado em" value={selected.createdAt} />
                <InfoCard label="Última edição" value={selected.updatedAt} />
                <InfoCard label="Plano disponível" value={selected.plan} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterPlansPage() {
  const [selected, setSelected] = useState<PlanEntry | null>(null)
  const [activeTab, setActiveTab] = useState<"plans" | "extras">("plans")
  const [createOpen, setCreateOpen] = useState(false)
  const [createExtraOpen, setCreateExtraOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })
  const extraPackages = [
    { id: "extra-1", name: "Usuários adicionais", description: "+2 licenças extras", status: "Ativo" },
    { id: "extra-2", name: "Créditos extras", description: "Pacote recorrente de 5.000 créditos", status: "Ativo" },
    { id: "extra-3", name: "TravelPro Match", description: "Impulsionamento e destaque adicional", status: "Ativo" },
    { id: "extra-4", name: "TravelPro Agent", description: "Mais jornadas e follow-ups", status: "Ativo" },
    { id: "extra-5", name: "Marketing IA", description: "Campanhas e calendário promocional", status: "Inativo" },
    { id: "extra-6", name: "WhatsApp adicional", description: "Canal extra para operação", status: "Ativo" },
    { id: "extra-7", name: "Automações extras", description: "Fluxos premium e regras avançadas", status: "Ativo" },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="Planos"
        description="Planos SaaS, limites, recursos, analytics por plano e pacotes extras do ecossistema."
        actions={
          <MasterHeaderActions
            primary={<Button className="rounded-full" onClick={() => setCreateOpen(true)}>Novo plano</Button>}
            secondary={<Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setCreateExtraOpen(true)}>Novo pacote extra</Button>}
          />
        }
      />
      <FilterTabs items={["Planos", "Pacotes extras"]} activeItem={activeTab === "plans" ? "Planos" : "Pacotes extras"} onChange={(item) => setActiveTab(item === "Planos" ? "plans" : "extras")} />
      {activeTab === "plans" ? (
      <div className="grid gap-4 lg:grid-cols-3">
        {planBase.map((plan) => (
          <DashboardCard key={plan.id} title={plan.name} description={`${plan.price}/mês`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-primary">
                {plan.activeAgencies} agências
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelected(plan)}><Eye className="h-4 w-4" />Visualizar plano</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Plano em edição", `${plan.name} foi aberto para edição mockada.`)}><FilePenLine className="h-4 w-4" />Editar plano</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Status alterado", `${plan.name} teve status alterado em modo mockado.`)}><ArrowRightLeft className="h-4 w-4" />Ativar/Inativar</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelected(plan)}><LineChart className="h-4 w-4" />Ver analytics</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200" onSelect={() => setConfirmAction({
                    title: "Excluir plano",
                    description: `Deseja confirmar a exclusão mockada do plano ${plan.name}?`,
                    confirmLabel: "Excluir plano",
                    onConfirm: () => fire("Plano excluído", `${plan.name} foi removido em modo mockado.`),
                  })}><Trash2 className="h-4 w-4" />Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <p>Usuários: {plan.users}</p>
              <p>Créditos: {plan.credits}</p>
              <p>IA: {plan.ai}</p>
              <p>WhatsApp / Go: {plan.go}</p>
              <p>Agent: {plan.agent}</p>
              <p>Match: {plan.match}</p>
              <p>Marketing IA: {plan.marketing}</p>
              <p>Automações: {plan.automations}</p>
            </div>
          </DashboardCard>
        ))}
      </div>
      ) : (
        <DashboardCard title="Pacotes extras" description="Add-ons complementares para crédito, canais, módulos e escala operacional.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {extraPackages.map((item) => (
              <div key={item.id} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                  <StatusPill label={item.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Pacote aberto", `${item.name} foi aberto em modo mockado.`)}>Visualizar</Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Pacote em edição", `${item.name} foi aberto para edição mockada.`)}>Editar</Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Status alterado", `${item.name} teve status alterado em modo mockado.`)}>Ativar/Inativar</Button>
                  <Button className="rounded-full" onClick={() => setConfirmAction({
                    title: "Excluir pacote extra",
                    description: `Deseja confirmar a exclusão mockada de ${item.name}?`,
                    confirmLabel: "Excluir pacote",
                    onConfirm: () => fire("Pacote extra excluído", `${item.name} foi removido em modo mockado.`),
                  })}>Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo plano"
        description="Cadastre um novo plano com preço, limites e escopo principal."
        fields={[
          { label: "Plano", value: "Elite" },
          { label: "Preço", value: "R$ 2.390" },
          { label: "Usuários inclusos", value: "12" },
          { label: "Créditos inclusos", value: "10.000" },
        ]}
        confirmLabel="Salvar plano"
        onConfirm={() => fire("Plano criado", "O novo plano foi preparado em modo mockado.")}
      />
      <MockFormDialog
        open={createExtraOpen}
        onOpenChange={setCreateExtraOpen}
        title="Novo pacote extra"
        description="Cadastre um novo add-on com tipo, preço e disponibilidade."
        fields={[
          { label: "Nome", value: "Automações extras" },
          { label: "Categoria", value: "Automações" },
          { label: "Preço", value: "R$ 220" },
          { label: "Disponibilidade", value: "Pro, Scale e Elite" },
        ]}
        confirmLabel="Salvar pacote"
        onConfirm={() => fire("Pacote criado", "O novo pacote extra foi preparado em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Detalhe do plano com limites, recursos e analytics executivos.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard label="Preço" value={selected.price} />
                <InfoCard label="Usuários inclusos" value={selected.users} />
                <InfoCard label="Créditos inclusos" value={selected.credits} />
                <InfoCard label="Limite IA" value={selected.ai} />
                <InfoCard label="WhatsApp / Go" value={selected.go} />
                <InfoCard label="Agent" value={selected.agent} />
                <InfoCard label="Match" value={selected.match} />
                <InfoCard label="Marketing IA" value={selected.marketing} />
                <InfoCard label="Automações" value={selected.automations} />
                <InfoCard label="Agências usando" value={selected.activeAgencies} />
                <InfoCard label="MRR do plano" value={selected.mrr} />
                <InfoCard label="Churn estimado" value={selected.churn} />
                <InfoCard label="Upgrades" value={selected.upgrades} />
                <InfoCard label="Downgrades" value="4" />
                <InfoCard label="Margem estimada" value="71%" />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterAtlasPage() {
  const [records, setRecords] = useState(atlasBase)
  const [selected, setSelected] = useState<AtlasTicket | null>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  const resolveTicket = (id: string) => {
    setRecords((current) => current.map((item) => (item.id === id ? { ...item, status: "Resolvido" } : item)))
  }

  return (
    <PageShell>
      <SectionHeader title="Atlas" description="Chamados, dúvidas escaladas, causas prováveis e oportunidades de melhoria do ecossistema." actions={<MasterHeaderActions primary={<Button className="rounded-full" onClick={() => fire("Novo artigo", "A base de solução do Atlas foi aberta em modo mockado.")}>Criar artigo</Button>} secondary={<Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Atlas exportado", "O relatório executivo do Atlas foi preparado.")}>Exportar análise</Button>} />} />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Chamados abertos" value="18" change="4 críticos" tone="danger" icon={ShieldAlert} />
        <MetricCard label="Resolvidos" value="126" change="84% em 24h" tone="success" icon={CheckCheck} />
        <MetricCard label="Escalados" value="9" change="aguardando humano" tone="warning" icon={Users} />
        <MetricCard label="Problemas recorrentes" value="6" change="financeiro, Match e WhatsApp" tone="info" icon={AlertTriangle} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <DashboardCard title="Fila do Atlas" description="Chamados que exigem leitura administrativa ou atendimento humano.">
          <div className="space-y-3">
            {records.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.subject}</p>
                    <StatusPill label={item.severity} />
                    <StatusPill label={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.agency} • {item.user}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Origem {item.source} • {item.openedAt}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelected(item)}><Eye className="h-4 w-4" />Visualizar chamado</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Atendimento assumido", `O chamado ${item.id} foi assumido em modo mockado.`)}><Users className="h-4 w-4" />Assumir atendimento</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Resposta preparada", `Uma resposta para ${item.agency} foi preparada.`)}><MessageSquareText className="h-4 w-4" />Responder</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => resolveTicket(item.id)}><CheckCheck className="h-4 w-4" />Marcar resolvido</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Agência notificada", `${item.agency} foi avisada sobre o andamento do Atlas.`)}><BellRing className="h-4 w-4" />Notificar agência</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Artigo sugerido", `A solução de ${item.subject} foi enviada para a base do Atlas.`)}><FileStack className="h-4 w-4" />Criar artigo/solução</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard title="Análises do Atlas" description="Principais dúvidas, módulos com mais dificuldade e falhas comuns.">
          <div className="space-y-3">
            {[
              "Principais dúvidas: billing, Match, follow-up do Agent, templates premium",
              "Módulos com mais dificuldade: financeiro, marketplace, WhatsApp",
              "Agências que mais acionam suporte: Horizonte Viagens e Destino Certo",
              "Falhas comuns: cobrança, contexto insuficiente e moderação do Match",
              "Sugestões de melhoria: artigos guiados, regras de billing e trilha de onboarding",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>Histórico mockado da conversa, causa provável e contexto da agência.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <InfoCard label="Agência" value={selected.agency} />
                  <InfoCard label="Usuário" value={selected.user} />
                  <InfoCard label="Gravidade" value={selected.severity} />
                  <InfoCard label="Status" value={selected.status} />
                  <InfoCard label="Origem" value={selected.source} />
                  <InfoCard label="Tempo aberto" value={selected.openedAt} />
                  <InfoCard label="Causa provável" value={selected.cause} />
                </div>
                <div className="mt-4 space-y-3">
                  {["Atlas tentou sugerir script inicial", "Usuário informou que o cenário foge da jornada padrão", "Chamado foi escalado para time humano", "Recomendação: criar artigo específico para o caso", "Time executivo avaliou impacto no módulo financeiro", "Próximo passo sugerido: novo artigo e revisão do fluxo"].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Resposta preparada", `Uma resposta para ${selected.agency} foi preparada.`)}>Responder</Button>
                <Button className="rounded-full" onClick={() => resolveTicket(selected.id)}>Marcar resolvido</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function MasterReportsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const fire = (title: string, description: string) => toast({ title, description })
  const reportCards = [
    "Agências",
    "Financeiro",
    "Usuários",
    "Marketplace",
    "IA e créditos",
    "WhatsApp",
    "Atlas",
    "Planos",
    "Uso geral",
  ]
  const recentReports = [
    { id: "mr-1", title: "MRR e churn", meta: "Atualizado hoje • visão executiva", status: "Pronto" },
    { id: "mr-2", title: "Marketplace Match", meta: "Últimos 7 dias • moderação e receita", status: "Atualizado" },
    { id: "mr-3", title: "Atlas e suporte", meta: "Chamados críticos • escalonamentos", status: "Em revisão" },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="Relatórios"
        description="Centro executivo para leitura, geração e exportação dos relatórios do ecossistema TravelPro."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => fire("Relatório gerado", "O relatório executivo do Master foi preparado.")}>Gerar relatório</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("PDF preparado", "A exportação PDF foi preparada em modo mockado.")}>Exportar PDF</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("CSV preparado", "A exportação CSV foi preparada em modo mockado.")}>Exportar CSV</Button>
          </div>
        }
      />

      <DashboardCard title="Filtros" description="Monte o recorte antes de gerar, exportar ou compartilhar o relatório.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <InfoCard label="Período" value="Últimos 30 dias" />
          <InfoCard label="Agência" value="Todas as agências" />
          <InfoCard label="Plano" value="Todos os planos" />
          <InfoCard label="Status" value="Ativos e em atenção" />
          <InfoCard label="Tipo" value="Resumo executivo" />
        </div>
        <div className="mt-4">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setFiltersOpen(true)}>
            Editar filtros
          </Button>
        </div>
      </DashboardCard>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Relatórios disponíveis" description="Acesse rapidamente os principais módulos executivos.">
          <div className="grid gap-3 md:grid-cols-2">
            {reportCards.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => fire("Relatório selecionado", item + " foi definido como foco do relatório.")}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/15 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">Leitura pronta para geração, exportação e análise rápida.</p>
              </button>
            ))}
          </div>
        </DashboardCard>

        <div className="space-y-5">
          <DashboardCard title="Recentes" description="Saídas geradas pelo time executivo.">
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{report.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{report.meta}</p>
                    </div>
                    <StatusPill label={report.status} />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Preview executivo" description="Resumo do relatório atualmente em foco.">
            <div className="space-y-3">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-foreground">MRR e churn</p>
                <p className="mt-2 text-sm text-muted-foreground">Crescimento estável, upgrades acima do previsto e atenção moderada em churn de contas Start.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <InfoCard label="MRR" value="R$ 38.490" />
                <InfoCard label="Churn" value="3,2%" />
                <InfoCard label="Upgrades" value="18 no ciclo" />
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
      <MockFormDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Editar filtros"
        description="Ajuste período, agência, plano, status e tipo antes de gerar o relatório."
        fields={[
          { label: "Período", value: "Últimos 30 dias" },
          { label: "Agência", value: "Todas as agências" },
          { label: "Plano", value: "Todos os planos" },
          { label: "Status", value: "Ativos e em atenção" },
        ]}
        confirmLabel="Aplicar filtros"
        onConfirm={() => fire("Filtros aplicados", "Os filtros do relatório foram atualizados em modo mockado.")}
      />
    </PageShell>
  )
}

