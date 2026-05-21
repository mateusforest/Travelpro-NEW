"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRightLeft,
  BellRing,
  Bot,
  CalendarClock,
  CheckCheck,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Eye,
  ExternalLink,
  FileBadge,
  FilePenLine,
  FileText,
  HandCoins,
  HeartHandshake,
  MessageSquareText,
  MoreHorizontal,
  Palette,
  PlaneTakeoff,
  Percent,
  Receipt,
  Route,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Tags,
  Target,
  Trash2,
  TrendingUp,
  UserRoundPlus,
  Users,
  Wallet,
  Waypoints,
} from "lucide-react"
import { clients } from "@/mock/clients"
import { trips } from "@/mock/trips"
import { documents } from "@/mock/documents"
import { tasks } from "@/mock/tasks"
import { templates } from "@/mock/templates"
import { leads } from "@/mock/leads"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { MetricCard } from "@/components/system/metric-card"
import { DashboardCard } from "@/components/system/dashboard-card"
import { FeatureExplanationCard } from "@/components/system/feature-explanation-card"
import { SearchInput } from "@/components/system/search-input"
import { FilterTabs } from "@/components/system/filter-tabs"
import { SetupStatusCard } from "@/components/system/setup-status-card"
import { SmartActionButton } from "@/components/system/smart-action-button"
import { LivePreviewPanel } from "@/components/system/live-preview-panel"
import { MediaUploadCard } from "@/components/system/media-upload-card"
import { OperationalWorkspaceLayout } from "@/components/system/operational-workspace-layout"
import { WorkspaceSidebarInfo } from "@/components/system/workspace-sidebar-info"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { MockChart } from "@/components/system/mock-chart"
import { toast } from "@/components/ui/use-toast"
import type { CatalogItemRow, ClientRow, DocumentRow, FinancialRecordRow, LeadRow, TeamMemberRow, TripRow } from "@/types/database"

type ClientRecord = (typeof clients)[number] & {
  document?: string
  preferences: string
  profile: string
  recommendations: string[]
  companions: string
  notes: string
}

type TripRecord = (typeof trips)[number] & {
  id: string
  dayProgress: number
  stage: string
  timeline: { label: string; detail: string; current?: boolean }[]
  checklist: { label: string; done: boolean }[]
}

type DocumentRecord = (typeof documents)[number] & {
  preview: string
}

type TeamRecord = {
  id: string
  name: string
  role: string
  scope: string
  status: string
  lastAccess: string
  modules: string
}

type QuoteRecord = {
  id: string
  client: string
  destination: string
  status: string
  value: string
  includes: string
  notes: string
}

type MessageRecord = {
  id: string
  sender: "agency" | "client"
  text: string
  time: string
  status?: string
}

const clientRecords: ClientRecord[] = clients.map((client, index) => ({
  ...client,
  document: ["Passaporte BR1234567", "Passaporte BR5678901", "RG 45.333.222-0", "Passaporte BR7788991"][index] ?? "Documento validado",
  preferences: ["Hotel boutique, transfer privado e janelas com vista.", "Parques, praticidade e roteiro com horários claros.", "Experiência romântica, spa e jantares especiais.", "Viagem objetiva, internet forte e logística rápida."][index] ?? "Perfil premium",
  profile: ["Ama experiências premium e destinos de praia com conforto alto.", "Valoriza praticidade, previsibilidade e atividades familiares.", "Busca exclusividade, romance e atendimento muito próximo.", "Prefere viagens funcionais, bons acessos e agenda organizada."][index] ?? "Perfil padrão",
  recommendations: [["Maldivas Signature", "Mykonos Escape", "Tulum Grand"], ["Orlando Family VIP", "Gramado Inverno", "Costa do Sauípe"], ["Santorini Honeymoon", "Bora Bora Bliss", "Mendoza Private"], ["Lisboa Business Plus", "Madrid Smart Stay", "Santiago Premium"]][index] ?? ["Cancún Family Escape"],
  companions: ["1 acompanhante", "cônjuge + 2 filhos", "1 acompanhante", "sem acompanhantes"][index] ?? "sem acompanhantes",
  notes: ["Cliente responde rápido no WhatsApp e valoriza upgrades.", "Prefere aprovar tudo com antecedência e gosta de checklists.", "Atenção alta a detalhes e jantar especial.", "Viagens geralmente curtas, foco em eficiência."][index] ?? "Sem observações",
}))

const tripRecords: TripRecord[] = trips.map((trip, index) => ({
  ...trip,
  dayProgress: [62, 45, 18][index] ?? 50,
  stage: trip.status === "Em andamento" ? "Em andamento" : trip.status === "Confirmada" ? "Confirmada" : trip.status === "Planejamento" ? "Planejamento" : "Finalizada",
  timeline: [
    { label: "Dia 1", detail: "Check-in, transfer e chegada tranquila." },
    { label: "Dia 2", detail: "Passeio principal e almoço reservado.", current: trip.status === "Em andamento" },
    { label: "Dia 3", detail: "Momento livre com experiência sugerida." },
  ],
  checklist: [
    { label: "Contrato", done: true },
    { label: "Pagamento", done: trip.status !== "Planejamento" },
    { label: "Voucher", done: trip.status === "Confirmada" || trip.status === "Em andamento" },
    { label: "Passagem", done: trip.status !== "Planejamento" },
    { label: "Seguro", done: trip.status === "Confirmada" || trip.status === "Em andamento" },
    { label: "Roteiro", done: true },
  ],
}))

const documentRecords: DocumentRecord[] = [
  ...documents,
  { id: "DOC-04", name: "Recibo de entrada", client: "Ana Martins", trip: "Cancún", type: "Recibo", status: "Pronto", preview: "Comprovante de entrada da viagem com branding da agência." },
  { id: "DOC-05", name: "Passagem aérea", client: "João Ribeiro", trip: "Orlando", type: "Passagem", status: "Em emissão", preview: "Trechos aéreos e localizador da reserva." },
].map((item) => ({
  ...item,
  preview:
    "preview" in item
      ? item.preview
      : item.type === "Contrato"
        ? "Contrato com identidade da ag?ncia e campos da viagem."
        : item.type === "Voucher"
          ? "Voucher do servi?o com hor?rios, local e contato."
          : item.type === "Seguro"
            ? "Cobertura ativa e instru??es r?pidas para acionamento."
            : "Documento pronto para compartilhar com o cliente.",
}))

const teamRecords: TeamRecord[] = [
  { id: "tm-1", name: "Marina Alves", role: "AGENCY_ADMIN", scope: "Acesso total", status: "Ativo", lastAccess: "Hoje, 08:42", modules: "Financeiro, viagens, documentos, IA" },
  { id: "tm-2", name: "Lucas Prado", role: "AGENCY_SALES", scope: "Leads + cota??es", status: "Ativo", lastAccess: "Hoje, 09:15", modules: "Leads, cota??es, Agent" },
  { id: "tm-3", name: "Renata Moura", role: "AGENCY_FINANCE", scope: "Financeiro + contratos", status: "Ativo", lastAccess: "Ontem, 18:03", modules: "Financeiro, contratos, relat?rios" },
  { id: "tm-4", name: "Caio Vieira", role: "AGENCY_OPERATIONAL", scope: "Viagens + documentos", status: "Convite pendente", lastAccess: "Ainda sem acesso", modules: "Viagens, documentos, central operacional" },
]

const quoteRecords: QuoteRecord[] = [
  { id: "qt-1", client: "Carla Dias", destination: "Paris", status: "Enviada", value: "R$ 18.400", includes: "A?reo, hotel boutique, transfer", notes: "Cliente pediu foco em experi?ncia rom?ntica." },
  { id: "qt-2", client: "Fabio Mello", destination: "Gramado", status: "Aguardando aprova??o", value: "R$ 9.200", includes: "Hotel, carro e parque", notes: "Fam?lia com duas crian?as." },
  { id: "qt-3", client: "Beatriz Lima", destination: "Macei?", status: "Aprovada", value: "R$ 12.780", includes: "Resort, a?reo e seguro", notes: "Preparar convers?o em viagem." },
]

const reportCards = [
  "Clientes",
  "Viagens",
  "Financeiro",
  "Documentos",
  "IA e cr?ditos",
  "TravelPro Go",
  "Agent",
  "Match",
  "Equipe",
  "Central Operacional",
]

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error || "Não foi possível concluir a operação.")
  }

  return (await response.json()) as T
}

function mapClientRowToRecord(row: ClientRow, index: number): ClientRecord {
  return {
    ...row,
    tag: ["Premium", "Família", "Lua de mel", "Corporativo"][index % 4] ?? "Premium",
    destination: ["Cancún", "Orlando", "Maldivas", "Lisboa"][index % 4] ?? "Destino em definição",
    document: row.profile_id ? `Perfil ${row.profile_id.slice(0, 8)}` : "Documento validado",
    preferences: ["Hotel boutique, transfer privado e janelas com vista.", "Parques, praticidade e roteiro com horários claros.", "Experiência romântica, spa e jantares especiais.", "Viagem objetiva, internet forte e logística rápida."][index % 4],
    profile: ["Ama experiências premium e destinos de praia com conforto alto.", "Valoriza praticidade, previsibilidade e atividades familiares.", "Busca exclusividade, romance e atendimento muito próximo.", "Prefere viagens funcionais, bons acessos e agenda organizada."][index % 4],
    recommendations: [["Maldivas Signature", "Mykonos Escape", "Tulum Grand"], ["Orlando Family VIP", "Gramado Inverno", "Costa do Sauípe"], ["Santorini Honeymoon", "Bora Bora Bliss", "Mendoza Private"], ["Lisboa Business Plus", "Madrid Smart Stay", "Santiago Premium"]][index % 4],
    companions: ["1 acompanhante", "cônjuge + 2 filhos", "1 acompanhante", "sem acompanhantes"][index % 4],
    notes: ["Cliente responde rápido no WhatsApp e valoriza upgrades.", "Prefere aprovar tudo com antecedência e gosta de checklists.", "Atenção alta a detalhes e jantar especial.", "Viagens geralmente curtas, foco em eficiência."][index % 4],
  }
}

function mapTripRowToRecord(row: TripRow, index: number): TripRecord {
  const status = row.status || "Planejamento"

  return {
    ...row,
    client: ["Ana Martins", "João Ribeiro", "Marina Costa", "Pedro Santos"][index % 4] ?? "Cliente vinculado",
    dates: row.starts_at && row.ends_at ? `${row.starts_at.slice(0, 10)} • ${row.ends_at.slice(0, 10)}` : "Datas em definição",
    documents: `${2 + (index % 4)} arquivos`,
    finance: index % 2 === 0 ? "Saldo ok" : "A receber",
    itinerary: index % 2 === 0 ? "Roteiro final" : "Roteiro premium",
    dayProgress: [62, 45, 18, 72][index % 4] ?? 50,
    stage: status,
    timeline: [
      { label: "Dia 1", detail: "Check-in, transfer e chegada tranquila." },
      { label: "Dia 2", detail: "Passeio principal e almoço reservado.", current: status === "Em andamento" },
      { label: "Dia 3", detail: "Momento livre com experiência sugerida." },
    ],
    checklist: [
      { label: "Contrato", done: true },
      { label: "Pagamento", done: status !== "Planejamento" },
      { label: "Voucher", done: status === "Confirmada" || status === "Em andamento" },
      { label: "Passagem", done: status !== "Planejamento" },
      { label: "Seguro", done: status === "Confirmada" || status === "Em andamento" },
      { label: "Roteiro", done: true },
    ],
  }
}

function mapDocumentRowToRecord(row: DocumentRow, index: number): DocumentRecord {
  return {
    ...row,
    name: row.title,
    client: ["Ana Martins", "João Ribeiro", "Marina Costa", "Pedro Santos"][index % 4] ?? "Cliente vinculado",
    trip: ["Cancún", "Orlando", "Maldivas", "Lisboa"][index % 4] ?? "Viagem vinculada",
    preview:
      row.type === "Contrato"
        ? "Contrato com identidade da agência e campos da viagem."
        : row.type === "Voucher"
          ? "Voucher do serviço com horários, local e contato."
          : row.type === "Seguro"
            ? "Cobertura ativa e instruções rápidas para acionamento."
            : "Documento pronto para compartilhar com o cliente.",
  }
}

function mapLeadRowToCard(row: LeadRow) {
  return {
    ...row,
    stage: row.status || "Novo lead",
    temperature: row.temperature || "Morno",
    destination: row.destination || "Destino em definição",
  }
}

function mapTeamRowToRecord(row: TeamMemberRow, index: number): TeamRecord {
  return {
    ...row,
    scope: row.scope || ["Acesso total", "Leads + cotações", "Financeiro + contratos", "Viagens + documentos"][index % 4],
    lastAccess: ["Hoje, 08:42", "Hoje, 09:15", "Ontem, 18:03", "Ainda sem acesso"][index % 4],
    modules: row.modules || ["Financeiro, viagens, documentos, IA", "Leads, cotações, Agent", "Financeiro, contratos, relatórios", "Viagens, documentos, central operacional"][index % 4],
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

const financeSeriesByPeriod = {
  Hoje: [
    { label: "08h", value: 1800, expenses: 420, profit: 1380 },
    { label: "10h", value: 2400, expenses: 710, profit: 1690 },
    { label: "12h", value: 3100, expenses: 940, profit: 2160 },
    { label: "14h", value: 2600, expenses: 820, profit: 1780 },
  ],
  Semana: [
    { label: "Seg", value: 12400, expenses: 4200, profit: 8200 },
    { label: "Ter", value: 14900, expenses: 5200, profit: 9700 },
    { label: "Qua", value: 13100, expenses: 4700, profit: 8400 },
    { label: "Qui", value: 16800, expenses: 6100, profit: 10700 },
    { label: "Sex", value: 17200, expenses: 6400, profit: 10800 },
  ],
  Mês: [
    { label: "Sem 1", value: 18400, expenses: 6200, profit: 12200 },
    { label: "Sem 2", value: 22100, expenses: 7100, profit: 15000 },
    { label: "Sem 3", value: 19800, expenses: 5300, profit: 14500 },
    { label: "Sem 4", value: 23900, expenses: 6800, profit: 17100 },
  ],
  Trimestre: [
    { label: "Jan", value: 68400, expenses: 22100, profit: 46300 },
    { label: "Fev", value: 74200, expenses: 24600, profit: 49600 },
    { label: "Mar", value: 81100, expenses: 25800, profit: 55300 },
  ],
  Ano: [
    { label: "Q1", value: 223700, expenses: 72500, profit: 151200 },
    { label: "Q2", value: 247300, expenses: 80100, profit: 167200 },
    { label: "Q3", value: 231800, expenses: 76400, profit: 155400 },
    { label: "Q4", value: 264100, expenses: 84200, profit: 179900 },
  ],
  Personalizado: [
    { label: "P1", value: 18200, expenses: 6500, profit: 11700 },
    { label: "P2", value: 21400, expenses: 7600, profit: 13800 },
    { label: "P3", value: 19600, expenses: 7100, profit: 12500 },
  ],
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function StatusPill({ label }: { label: string }) {
  const styles =
    label.includes("Ativo") || label.includes("Confirmada") || label.includes("Aprovada") || label.includes("Pronto")
      ? "border-green-400/20 bg-green-400/10 text-green-300"
      : label.includes("Planejamento") || label.includes("Pendente") || label.includes("Aguardando") || label.includes("emissão")
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : label.includes("Em andamento") || label.includes("Enviada") || label.includes("Hoje")
          ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
          : "border-white/10 bg-white/[0.06] text-muted-foreground"

  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] ${styles}`}>{label}</span>
}

function InternalMessages({ initialMessages }: { initialMessages: MessageRecord[] }) {
  const [messages, setMessages] = useState<MessageRecord[]>(initialMessages)
  const [draft, setDraft] = useState("")

  const canSend = useMemo(() => draft.trim().length > 0, [draft])

  const sendMessage = () => {
    if (!canSend) return
    setMessages((current) => [
      ...current,
      { id: `msg-${current.length + 1}`, sender: "agency", text: draft.trim(), time: "Agora", status: "Enviado" },
    ])
    setDraft("")
    toast({ title: "Mensagem enviada", description: "A mensagem foi adicionada localmente em modo mockado." })
  }

  return (
    <div className="space-y-3">
      <div className="max-h-[280px] space-y-3 overflow-y-auto rounded-[24px] border border-white/8 bg-black/10 p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "agency" ? "justify-end" : "justify-start"}`}>
            <div className={message.sender === "agency" ? "max-w-[85%] rounded-[22px] rounded-br-md border border-primary/15 bg-primary/10 px-4 py-3" : "max-w-[85%] rounded-[22px] rounded-bl-md border border-white/8 bg-white/[0.03] px-4 py-3"}>
              <p className="text-sm leading-6 text-foreground">{message.text}</p>
              <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                <span>{message.time}</span>
                {message.status ? <span>{message.status}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreva uma mensagem..."
          rows={1}
          className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button className="rounded-full" onClick={sendMessage} disabled={!canSend}>
          <Send className="h-4 w-4" />
          Enviar
        </Button>
      </div>
    </div>
  )
}

function ActionMenu({ items }: { items: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; danger?: boolean }[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
        {items.map((item, index) => (
          <DropdownMenuItem key={`${item.label}-${index}`} className={`rounded-2xl px-3 py-2.5 ${item.danger ? "text-red-200 focus:text-red-200" : ""}`} onSelect={item.onClick}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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

export function AgencyDashboardPage() {
  return (
    <PageShell>
      <SectionHeader
        title="Dashboard da agência"
        description="Uma visão mais executiva e compacta da operação, com foco no que move vendas, entrega e caixa."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/viagens">Nova viagem</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/central-operacional">Abrir central</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Leads novos" value="24" change="+6 hoje" tone="success" icon={Waypoints} />
        <MetricCard label="Viagens em andamento" value="12" change="4 próximas partidas" tone="info" icon={PlaneTakeoff} />
        <MetricCard label="Documentos pendentes" value="7" change="2 urgentes" tone="warning" icon={FileText} />
        <MetricCard label="Follow-ups pendentes" value="14" change="3 quentes" tone="warning" icon={HeartHandshake} />
        <MetricCard label="Resumo financeiro" value="R$ 84.200" change="R$ 12.400 a receber" tone="success" icon={Wallet} />
        <MetricCard label="TravelPro Go" value="Ativo" change="184 comandos no dia" tone="info" icon={MessageSquareText} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Ações rápidas" description="Atalhos para mover a operação sem perder contexto.">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { title: "Novo cliente", href: "/app/clientes", icon: UserRoundPlus, description: "Cadastrar contato e abrir relacionamento." },
              { title: "Nova cotação", href: "/app/viagens/cotacoes", icon: Receipt, description: "Montar proposta com rapidez." },
              { title: "Novo contrato", href: "/app/documentos/contratos", icon: FilePenLine, description: "Gerar e revisar documento da viagem." },
              { title: "Publicar pacote", href: "/app/catalogo", icon: Tags, description: "Levar a oferta para vitrine e Match." },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition-all hover:border-primary/15 hover:bg-white/[0.05]">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Operação resumida" description="O que merece sua atenção primeiro hoje.">
          <div className="space-y-3">
            {[
              "Contrato da Ana Martins pronto para assinatura.",
              "Passagem do João Ribeiro em emissão final.",
              "TravelPro Go acima da média saudável no dia.",
              "Lead de Paris com maior chance de conversão após 18h.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}

export function AgencyClientsPage() {
  const [records, setRecords] = useState<ClientRecord[]>([])
  const [selected, setSelected] = useState<ClientRecord | null>(null)
  const [activeFilter, setActiveFilter] = useState("Todos")
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true
    requestJson<ClientRow[]>("/api/clients")
      .then((data) => {
        if (!active) return
        setRecords(data.map(mapClientRowToRecord))
      })
      .catch(() => {
        if (!active) return
        setRecords([])
      })
    return () => {
      active = false
    }
  }, [])

  const visibleClients = useMemo(() => {
    if (activeFilter === "Todos") return records
    if (activeFilter === "Em viagem") return records.filter((client) => client.status === "Em viagem")
    return records.filter((client) => client.tag === activeFilter)
  }, [activeFilter, records])

  return (
    <PageShell>
      <SectionHeader
        title="Clientes"
        description="Base ativa da agência com detalhes completos, histórico e perfil de viagem."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/app/clientes/novo">Novo cliente</Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar cliente, destino ou tag" />
        </div>
        <FilterTabs items={["Todos", "Premium", "Em viagem", "Família", "Lua de mel"]} activeItem={activeFilter} onChange={setActiveFilter} />
      </div>

      <DashboardCard title="Clientes da agência" description="Cada cliente abre um detalhe completo com histórico, financeiro e mensagens internas.">
        <div className="space-y-3">
          {visibleClients.map((client) => (
            <div key={client.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={() => setSelected(client)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{client.name}</p>
                  <StatusPill label={client.status} />
                  <StatusPill label={client.tag} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{client.email} • {client.phone}</p>
                <p className="mt-2 text-xs text-muted-foreground">Destino em foco: {client.destination}</p>
              </button>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => setSelected(client) },
                  {
                    label: "Editar",
                    icon: FilePenLine,
                    onClick: async () => {
                      try {
                        const updated = await requestJson<ClientRow>(`/api/clients/${client.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: client.status }),
                        })
                        const mapped = mapClientRowToRecord(updated, records.findIndex((item) => item.id === client.id))
                        setRecords((current) => current.map((item) => (item.id === client.id ? mapped : item)))
                        fire("Cliente atualizado", `${client.name} foi sincronizado com o Supabase.`)
                      } catch (error) {
                        fire("Falha ao atualizar", error instanceof Error ? error.message : "Não foi possível atualizar o cliente.")
                      }
                    },
                  },
                  { label: "Notificar", icon: BellRing, onClick: () => fire("Cliente notificado", `${client.name} recebeu uma notificação mockada.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir cliente",
                        description: `Deseja confirmar a exclusão mockada de ${client.name}?`,
                        confirmLabel: "Excluir cliente",
                        onConfirm: async () => {
                          try {
                            await requestJson(`/api/clients/${client.id}`, { method: "DELETE" })
                            setRecords((current) => current.filter((item) => item.id !== client.id))
                            fire("Cliente excluído", `${client.name} foi removido do Supabase.`)
                          } catch (error) {
                            fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir o cliente.")
                          }
                        },
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo cliente"
        description="Cadastre um novo cliente com os dados essenciais para iniciar o relacionamento."
        fields={[
          { label: "Nome", value: "Marina Costa" },
          { label: "E-mail", value: "marina@cliente.com" },
          { label: "Telefone", value: "+55 11 97777-0001" },
          { label: "Destino de interesse", value: "Santorini" },
        ]}
        confirmLabel="Salvar cliente"
        onConfirm={async () => {
          try {
            const created = await requestJson<ClientRow>("/api/clients", {
              method: "POST",
              body: JSON.stringify({
                name: "Marina Costa",
                email: "marina@cliente.com",
                phone: "+55 11 97777-0001",
                status: "Ativo",
              }),
            })
            setRecords((current) => [mapClientRowToRecord(created, current.length), ...current])
            fire("Cliente criado", "O novo cliente foi salvo no Supabase.")
          } catch (error) {
            fire("Falha ao criar", error instanceof Error ? error.message : "Não foi possível criar o cliente.")
          }
        }}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Dados, histórico, mensagens, perfil de viajante e recomendações da operação.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="dados" className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-white/8 px-4 py-4">
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-3xl bg-transparent p-0">
                    {["dados", "viagens", "financeiro", "documentos", "mensagens", "perfil", "ia"].map((tab) => (
                      <TabsTrigger key={tab} value={tab} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 capitalize data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">
                        {tab === "ia" ? "Recomendações IA" : tab === "perfil" ? "Perfil do viajante" : tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                  <TabsContent value="dados" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard label="Nome" value={selected.name} />
                    <InfoCard label="E-mail" value={selected.email} />
                    <InfoCard label="Telefone" value={selected.phone} />
                    <InfoCard label="Documento" value={selected.document ?? "Documento válido"} />
                    <InfoCard label="Tag" value={selected.tag} />
                    <InfoCard label="Status" value={selected.status} />
                    <InfoCard label="Destino atual" value={selected.destination} />
                    <InfoCard label="Acompanhantes" value={selected.companions} />
                    <InfoCard label="Observações" value={selected.notes} />
                  </TabsContent>
                  <TabsContent value="viagens" className="space-y-3">
                    {["Cancún • confirmada • 15 mai - 22 mai", "Gramado • finalizada • jul 2025", "Orlando • planejada • nov 2026"].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
                    ))}
                  </TabsContent>
                  <TabsContent value="financeiro" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard label="Último pagamento" value="R$ 4.200 • pago" />
                    <InfoCard label="Próxima parcela" value="R$ 2.800 • 22 mai 2026" />
                    <InfoCard label="Situação" value="Saudável" />
                    <InfoCard label="Total do histórico" value="R$ 18.900" />
                    <InfoCard label="Comissão vinculada" value="R$ 1.280" />
                    <InfoCard label="Preferência" value="Pagamento via cartão" />
                  </TabsContent>
                  <TabsContent value="documentos" className="space-y-3">
                    {documentRecords.filter((doc) => doc.client === selected.name).map((doc) => (
                      <div key={doc.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <StatusPill label={doc.status} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{doc.preview}</p>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="mensagens">
                    <InternalMessages
                      initialMessages={[
                        { id: "mc-1", sender: "client", text: "Consigo confirmar o passeio de catamarã amanhã?", time: "09:12" },
                        { id: "mc-2", sender: "agency", text: "Sim, já deixamos essa confirmação pronta no roteiro.", time: "09:18", status: "Enviado" },
                      ]}
                    />
                  </TabsContent>
                  <TabsContent value="perfil" className="grid gap-4 md:grid-cols-2">
                    <InfoCard label="Perfil de viagem" value={selected.profile} />
                    <InfoCard label="Preferências" value={selected.preferences} />
                    <InfoCard label="Acompanhantes" value={selected.companions} />
                    <InfoCard label="Observações internas" value={selected.notes} />
                  </TabsContent>
                  <TabsContent value="ia" className="space-y-3">
                    {selected.recommendations.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-sm font-medium text-foreground">{item}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Destino sugerido com base no histórico, preferências e padrão de compra do cliente.</p>
                      </div>
                    ))}
                  </TabsContent>
                </div>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyTripsPage() {
  const [records, setRecords] = useState<TripRecord[]>([])
  const [selected, setSelected] = useState<TripRecord | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true
    requestJson<TripRow[]>("/api/trips")
      .then((data) => {
        if (!active) return
        setRecords(data.map(mapTripRowToRecord))
      })
      .catch(() => {
        if (!active) return
        setRecords([])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <PageShell>
      <SectionHeader
        title="Viagens"
        description="Controle da jornada completa com visão operacional, timeline, checklist e mensagens."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/app/viagens/nova">Nova viagem</Link>
          </Button>
        }
      />
      <DashboardCard title="Viagens da operação" description="Abra cada viagem para ver roteiro ao vivo, pendências, documentos e financeiro.">
        <div className="space-y-3">
          {records.map((trip) => (
            <div key={trip.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={() => setSelected(trip)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{trip.client} • {trip.destination}</p>
                  <StatusPill label={trip.stage} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{trip.dates}</p>
                <p className="mt-2 text-xs text-muted-foreground">{trip.documents} • {trip.finance} • {trip.itinerary}</p>
              </button>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => setSelected(trip) },
                  {
                    label: "Editar",
                    icon: FilePenLine,
                    onClick: async () => {
                      try {
                        const updated = await requestJson<TripRow>(`/api/trips/${trip.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: trip.stage }),
                        })
                        setRecords((current) => current.map((item, index) => (item.id === trip.id ? mapTripRowToRecord(updated, index) : item)))
                        fire("Viagem atualizada", `${trip.destination} foi sincronizada com o Supabase.`)
                      } catch (error) {
                        fire("Falha ao atualizar", error instanceof Error ? error.message : "Não foi possível atualizar a viagem.")
                      }
                    },
                  },
                  { label: "Notificar cliente", icon: BellRing, onClick: () => fire("Cliente notificado", `${trip.client} recebeu uma atualização da viagem.`) },
                  { label: "Ver roteiro", icon: Route, onClick: () => fire("Roteiro aberto", `O roteiro de ${trip.destination} foi preparado.`) },
                  { label: "Ver documento", icon: FileText, onClick: () => fire("Documentos abertos", `Os documentos de ${trip.client} foram preparados.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir viagem",
                        description: `Deseja confirmar a exclusão mockada da viagem de ${trip.client} para ${trip.destination}?`,
                        confirmLabel: "Excluir viagem",
                        onConfirm: async () => {
                          try {
                            await requestJson(`/api/trips/${trip.id}`, { method: "DELETE" })
                            setRecords((current) => current.filter((item) => item.id !== trip.id))
                            fire("Viagem excluída", `A viagem de ${trip.client} foi removida do Supabase.`)
                          } catch (error) {
                            fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir a viagem.")
                          }
                        },
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova viagem"
        description="Crie uma nova viagem com cliente, destino e status inicial."
        fields={[
          { label: "Cliente", value: "Carla Dias" },
          { label: "Destino", value: "Paris" },
          { label: "Período", value: "12 jun • 20 jun" },
          { label: "Status inicial", value: "Planejamento" },
        ]}
        confirmLabel="Salvar viagem"
        onConfirm={async () => {
          try {
            const created = await requestJson<TripRow>("/api/trips", {
              method: "POST",
              body: JSON.stringify({
                destination: "Paris",
                status: "Planejamento",
                starts_at: "2026-06-12T00:00:00.000Z",
                ends_at: "2026-06-20T00:00:00.000Z",
              }),
            })
            setRecords((current) => [mapTripRowToRecord(created, current.length), ...current])
            fire("Viagem criada", "A nova viagem foi salva no Supabase.")
          } catch (error) {
            fire("Falha ao criar", error instanceof Error ? error.message : "Não foi possível criar a viagem.")
          }
        }}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.client} • {selected.destination}</DialogTitle>
                <DialogDescription>Visão geral, roteiro ao vivo, pendências, documentos, financeiro, mensagens e histórico.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-white/8 px-4 py-4">
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-3xl bg-transparent p-0">
                    {["overview", "roteiro", "pendencias", "documentos", "financeiro", "mensagens", "historico"].map((tab) => (
                      <TabsTrigger key={tab} value={tab} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 capitalize data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">
                        {tab === "overview" ? "Visão geral" : tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                  <TabsContent value="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard label="Status" value={selected.stage} />
                    <InfoCard label="Datas" value={selected.dates} />
                    <InfoCard label="Financeiro" value={selected.finance} />
                    <InfoCard label="Documentos" value={selected.documents} />
                    <InfoCard label="Roteiro" value={selected.itinerary} />
                    <InfoCard label="Progresso da viagem" value={`${selected.dayProgress}%`} />
                  </TabsContent>
                  <TabsContent value="roteiro" className="space-y-4">
                    {selected.stage === "Em andamento" ? (
                      <>
                        <div className="rounded-[28px] border border-primary/15 bg-primary/[0.06] p-4">
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                            <p className="text-sm font-medium text-foreground">Roteiro ao vivo • Dia atual em andamento</p>
                          </div>
                          <Progress value={selected.dayProgress} className="mt-4 h-2.5" />
                        </div>
                        <div className="space-y-3">
                          {selected.timeline.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                              <div className="flex items-center gap-3">
                                <span className={`h-3 w-3 rounded-full ${item.current ? "animate-pulse bg-primary" : "bg-white/20"}`} />
                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : selected.stage === "Confirmada" ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {selected.checklist.map((item) => (
                          <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                            <div className={item.done ? "rounded-full border border-green-400/20 bg-green-400/10 p-1.5 text-green-300" : "rounded-full border border-amber-400/20 bg-amber-400/10 p-1.5 text-amber-300"}>
                              {item.done ? <CheckCheck className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                            </div>
                            <span className="text-sm text-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {["Lead recebido", "Cotação", "Aprovação", "Contrato", "Pagamento", "Confirmação"].map((item, index) => (
                          <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-foreground">{item}</p>
                              <StatusPill label={index < 2 ? "Concluída" : index === 2 ? "Atual" : "Próxima"} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="pendencias" className="space-y-3">
                    {["Seguro ainda aguardando confirmação", "Passagem em emissão final", "Cliente pediu ajuste de jantar especial"].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
                    ))}
                  </TabsContent>
                  <TabsContent value="documentos" className="space-y-3">
                    {documentRecords.filter((doc) => doc.trip === selected.destination).map((doc) => (
                      <div key={doc.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <StatusPill label={doc.status} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{doc.preview}</p>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="financeiro" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard label="Valor total" value="R$ 18.400" />
                    <InfoCard label="Recebido" value="R$ 12.800" />
                    <InfoCard label="A receber" value="R$ 5.600" />
                    <InfoCard label="Comissão" value="R$ 1.980" />
                    <InfoCard label="Margem estimada" value="31%" />
                    <InfoCard label="Status" value={selected.finance} />
                  </TabsContent>
                  <TabsContent value="mensagens">
                    <InternalMessages
                      initialMessages={[
                        { id: "tv-1", sender: "client", text: "Conseguimos confirmar o transfer do hotel?", time: "10:02" },
                        { id: "tv-2", sender: "agency", text: "Sim, já está tudo confirmado e o voucher está na área de documentos.", time: "10:09", status: "Enviado" },
                      ]}
                    />
                  </TabsContent>
                  <TabsContent value="historico" className="space-y-3">
                    {["Viagem criada após aprovação da cotação", "Contrato assinado digitalmente", "Roteiro premium salvo", "Cliente notificado sobre pagamento"].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
                    ))}
                  </TabsContent>
                </div>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

function DocumentHub({ title, description, records, createLabel }: { title: string; description: string; records: DocumentRecord[]; createLabel: string }) {
  const [documentList, setDocumentList] = useState<DocumentRecord[]>([])
  const [selected, setSelected] = useState<DocumentRecord | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (titleText: string, body: string) => toast({ title: titleText, description: body })
  const filterType =
    title === "Contratos"
      ? "Contrato"
      : title === "Vouchers"
        ? "Voucher"
        : title === "Recibos"
          ? "Recibo"
          : title === "Passagens"
            ? "Passagem"
            : null

  useEffect(() => {
    let active = true
    requestJson<DocumentRow[]>("/api/documents")
      .then((data) => {
        if (!active) return
        const mapped = data.map(mapDocumentRowToRecord)
        setDocumentList(filterType ? mapped.filter((item) => item.type === filterType) : mapped)
      })
      .catch(() => {
        if (!active) return
        setDocumentList(filterType ? records.filter((item) => item.type === filterType) : [])
      })
    return () => {
      active = false
    }
  }, [filterType, records])

  return (
    <PageShell>
      <SectionHeader
        title={title}
        description={description}
        actions={
          <Button asChild className="rounded-full">
            <Link href="/app/documentos/novo">{createLabel}</Link>
          </Button>
        }
      />
      <DashboardCard title="Documentos da operação" description="Visualize, edite, baixe e envie documentos sem poluir a tela.">
        <div className="space-y-3">
          {documentList.map((doc) => (
            <div key={doc.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={() => setSelected(doc)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <StatusPill label={doc.status} />
                  <StatusPill label={doc.type} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{doc.client} • {doc.trip}</p>
              </button>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => setSelected(doc) },
                  {
                    label: "Editar",
                    icon: FilePenLine,
                    onClick: async () => {
                      try {
                        const updated = await requestJson<DocumentRow>(`/api/documents/${doc.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: doc.status }),
                        })
                        setDocumentList((current) => current.map((item, index) => (item.id === doc.id ? mapDocumentRowToRecord(updated, index) : item)))
                        fire("Documento atualizado", `${doc.name} foi sincronizado com o Supabase.`)
                      } catch (error) {
                        fire("Falha ao atualizar", error instanceof Error ? error.message : "Não foi possível atualizar o documento.")
                      }
                    },
                  },
                  { label: "Baixar", icon: Download, onClick: () => fire("Download preparado", `O download de ${doc.name} foi iniciado em modo mockado.`) },
                  { label: "Enviar ao cliente", icon: Send, onClick: () => fire("Envio preparado", `${doc.name} foi preparado para envio ao cliente.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir documento",
                        description: `Deseja confirmar a exclusão mockada de ${doc.name}?`,
                        confirmLabel: "Excluir documento",
                        onConfirm: async () => {
                          try {
                            await requestJson(`/api/documents/${doc.id}`, { method: "DELETE" })
                            setDocumentList((current) => current.filter((item) => item.id !== doc.id))
                            fire("Documento excluído", `${doc.name} foi removido do Supabase.`)
                          } catch (error) {
                            fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir o documento.")
                          }
                        },
                      }),
                    danger: true,
                  },
                ]}
              />
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
                <DialogDescription>Visualização mockada do documento com contexto da viagem e do cliente.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Cliente" value={selected.client} />
                <InfoCard label="Viagem" value={selected.trip} />
                <InfoCard label="Tipo" value={selected.type} />
                <InfoCard label="Status" value={selected.status} />
              </div>
              <div className="px-6 pb-6">
                <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-foreground">Preview do documento</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.preview}</p>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyRoteirosPage() {
  const roteiroTemplates = templates.filter((item) => item.type === "Roteiro")
  const [selected, setSelected] = useState<(typeof roteiroTemplates)[number] | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Roteiros"
        description="Roteiros por dia com ações de edição, salvamento, PDF e envio ao cliente."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/app/viagens/roteiros/novo">Novo roteiro</Link>
          </Button>
        }
      />
      <DashboardCard title="Biblioteca de roteiros" description="Cada roteiro pode ser visualizado e preparado para compartilhar.">
        <div className="space-y-3">
          {roteiroTemplates.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={() => setSelected(item)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <StatusPill label={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
              </button>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => setSelected(item) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Roteiro em edição", `${item.name} foi aberto para edição mockada.`) },
                  { label: "Salvar", icon: Save, onClick: () => fire("Roteiro salvo", `${item.name} foi salvo em modo mockado.`) },
                  { label: "Baixar PDF", icon: Download, onClick: () => fire("PDF preparado", `O PDF de ${item.name} foi preparado.`) },
                  { label: "Enviar para cliente", icon: Send, onClick: () => fire("Envio preparado", `${item.name} ficou pronto para envio ao cliente.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir roteiro",
                        description: `Deseja confirmar a exclusão mockada de ${item.name}?`,
                        confirmLabel: "Excluir roteiro",
                        onConfirm: () => fire("Roteiro excluído", `${item.name} foi removido em modo mockado.`),
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo roteiro"
        description="Monte um novo roteiro com cliente, destino e ritmo inicial."
        fields={[
          { label: "Cliente", value: "Ana Martins" },
          { label: "Destino", value: "Cancún" },
          { label: "Modelo", value: "Premium família" },
          { label: "Dias", value: "7 dias" },
        ]}
        confirmLabel="Salvar roteiro"
        onConfirm={() => fire("Roteiro criado", "O novo roteiro foi preparado em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Roteiro organizado por dia, com atividades, horários, observações e status.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-3">
                {[
                  { day: "Dia 1", activity: "Check-in e noite livre", time: "14:00", note: "Transfer incluído" },
                  { day: "Dia 2", activity: "Passeio principal", time: "09:00", note: "Levar documento" },
                  { day: "Dia 3", activity: "Experiência gastronômica", time: "20:00", note: "Reserva confirmada" },
                ].map((item) => (
                  <div key={item.day} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{item.day}</p>
                    <p className="mt-3 text-sm font-medium text-foreground">{item.activity}</p>
                    <p className="mt-2 text-sm text-primary">{item.time}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{item.note}</p>
                  </div>
                ))}
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Roteiro em edição", `${selected.name} foi aberto para edição mockada.`)}>Editar</Button>
                <Button className="rounded-full" onClick={() => fire("Roteiro salvo", `${selected.name} foi salvo em modo mockado.`)}>Salvar</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyCotacoesPage() {
  const [selected, setSelected] = useState<QuoteRecord | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Cotações"
        description="Propostas com detalhe comercial, histórico e conversão em viagem."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/app/viagens/cotacoes/nova">Nova cotação</Link>
          </Button>
        }
      />
      <DashboardCard title="Pipeline de cotações" description="Ações rápidas para visualizar, salvar, enviar e converter.">
        <div className="space-y-3">
          {quoteRecords.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={() => setSelected(item)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.client} • {item.destination}</p>
                  <StatusPill label={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.value} • {item.includes}</p>
              </button>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => setSelected(item) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Cotação em edição", `${item.client} • ${item.destination} foi aberta para edição mockada.`) },
                  { label: "Salvar", icon: Save, onClick: () => fire("Cotação salva", `A cotação de ${item.client} foi salva em modo mockado.`) },
                  { label: "Enviar", icon: Send, onClick: () => fire("Cotação enviada", `A cotação de ${item.client} foi enviada em modo mockado.`) },
                  { label: "Baixar PDF", icon: Download, onClick: () => fire("PDF preparado", `O PDF da cotação de ${item.client} foi preparado.`) },
                  { label: "Converter em viagem", icon: ArrowRightLeft, onClick: () => fire("Conversão preparada", `A cotação de ${item.client} foi preparada para virar viagem.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir cotação",
                        description: `Deseja confirmar a exclusão mockada da cotação de ${item.client}?`,
                        confirmLabel: "Excluir cotação",
                        onConfirm: () => fire("Cotação excluída", `A cotação de ${item.client} foi removida em modo mockado.`),
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova cotação"
        description="Crie uma cotação com cliente, destino, valor base e observações."
        fields={[
          { label: "Cliente", value: "Fabio Mello" },
          { label: "Destino", value: "Gramado" },
          { label: "Valor inicial", value: "R$ 9.200" },
          { label: "Observações", value: "Família com duas crianças" },
        ]}
        confirmLabel="Salvar cotação"
        onConfirm={() => fire("Cotação criada", "A nova cotação foi preparada em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.client} • {selected.destination}</DialogTitle>
                <DialogDescription>Detalhe da cotação com valores, inclusos, status e histórico comercial.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard label="Cliente" value={selected.client} />
                <InfoCard label="Destino" value={selected.destination} />
                <InfoCard label="Valor" value={selected.value} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Itens inclusos" value={selected.includes} />
                <InfoCard label="Observações" value={selected.notes} />
              </div>
              <div className="space-y-3 px-6 pb-5">
                {["Cotação criada após lead quente", "Ajuste de hotel aplicado", "Cliente pediu revisão de datas"].map((item) => (
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

export function AgencyTasksPage() {
  const [taskList, setTaskList] = useState(tasks)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  const concludeTask = (id: string) => setTaskList((current) => current.map((task) => (task.id === id ? { ...task, status: "Concluído" } : task)))
  const postponeTask = (id: string) => setTaskList((current) => current.map((task) => (task.id === id ? { ...task, due: "Amanhã, 10:00" } : task)))

  return (
    <PageShell>
      <SectionHeader
        title="Tarefas"
        description="Fila operacional com ações rápidas para concluir, adiar, editar e criar novas tarefas."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/central-operacional/tarefas/nova">Nova tarefa</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Rota rápida preparada", "O atalho operacional foi preparado em modo mockado.")}>
              Adicionar rota rápida
            </Button>
          </div>
        }
      />
      <DashboardCard title="Backlog operacional" description="Acompanhe e ajuste rapidamente as tarefas da central.">
        <div className="space-y-3">
          {taskList.map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <StatusPill label={task.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{task.owner}</p>
                <p className="mt-2 text-xs text-muted-foreground">{task.due}</p>
              </div>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Tarefa aberta", `${task.title} foi aberta em modo mockado.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Tarefa em edição", `${task.title} foi aberta para edição mockada.`) },
                  { label: "Concluir", icon: CheckCheck, onClick: () => concludeTask(task.id) },
                  { label: "Adiar", icon: Clock3, onClick: () => postponeTask(task.id) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir tarefa",
                        description: `Deseja confirmar a exclusão mockada da tarefa ${task.title}?`,
                        confirmLabel: "Excluir tarefa",
                        onConfirm: () => fire("Tarefa excluída", `${task.title} foi removida em modo mockado.`),
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <DialogHeader className="border-b border-white/8 px-6 py-5">
            <DialogTitle>Nova tarefa</DialogTitle>
            <DialogDescription>Crie uma tarefa com responsável, prazo e prioridade.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-5">
            <InfoCard label="Tarefa" value="Confirmar voucher do hotel" />
            <InfoCard label="Responsável" value="Operacional" />
            <InfoCard label="Prazo" value="Hoje, 17:00" />
          </div>
          <DialogFooter className="border-t border-white/8 px-6 py-5">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setCreateOpen(false)}>
              Fechar
            </Button>
            <Button className="rounded-full" onClick={() => { setCreateOpen(false); fire("Tarefa criada", "A nova tarefa foi adicionada em modo mockado.") }}>
              Salvar tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyReportsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const fire = (title: string, description: string) => toast({ title, description })
  const recentReports = [
    { id: "r-1", title: "Financeiro mensal", meta: "Gerado hoje • mês • pronto para exportar", status: "Pronto" },
    { id: "r-2", title: "TravelPro Go", meta: "Atualizado há 12 min • operação", status: "Atualizado" },
    { id: "r-3", title: "Clientes em risco", meta: "Últimos 30 dias • atenção", status: "Em revisão" },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="Relatórios"
        description="Central mais limpa para gerar, acompanhar e exportar relatórios da operação."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/central-operacional/relatorios/novo">Gerar relatório</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("PDF preparado", "A exportação em PDF foi preparada.")}>Exportar PDF</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("CSV preparado", "A exportação em CSV foi preparada.")}>Exportar CSV</Button>
          </div>
        }
      />

      <DashboardCard title="Filtros" description="Recorte o relatório antes de gerar ou exportar.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <InfoCard label="Período" value="Últimos 30 dias" />
          <InfoCard label="Módulo" value="Todos os módulos" />
          <InfoCard label="Cliente" value="Todos os clientes" />
          <InfoCard label="Status" value="Ativos e pendentes" />
          <InfoCard label="Tipo" value="Resumo executivo" />
        </div>
        <div className="mt-4">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setFiltersOpen(true)}>
            Editar filtros
          </Button>
        </div>
      </DashboardCard>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Relatórios disponíveis" description="Escolha o foco principal e gere um relatório contextualizado.">
          <div className="grid gap-3 md:grid-cols-2">
            {reportCards.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => fire("Relatório selecionado", item + " foi definido como foco do relatório.")}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/15 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">Filtros prontos para geração, exportação e leitura rápida.</p>
              </button>
            ))}
          </div>
        </DashboardCard>

        <div className="space-y-5">
          <DashboardCard title="Recentes" description="Últimas saídas geradas pela operação.">
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

          <DashboardCard title="Preview do relatório" description="Resumo do relatório atualmente selecionado.">
            <div className="space-y-3">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-foreground">Financeiro mensal</p>
                <p className="mt-2 text-sm text-muted-foreground">Receitas em alta, margem saudável e despesas sob controle no período.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <InfoCard label="Receitas" value="R$ 84.200" />
                <InfoCard label="Despesas" value="R$ 18.400" />
                <InfoCard label="Lucro" value="R$ 55.960" />
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <MockFormDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Editar filtros"
        description="Ajuste o recorte do relatório antes de gerar ou exportar."
        fields={[
          { label: "Período", value: "Últimos 30 dias" },
          { label: "Módulo", value: "Todos os módulos" },
          { label: "Cliente", value: "Todos os clientes" },
          { label: "Tipo", value: "Resumo executivo" },
        ]}
        confirmLabel="Salvar filtros"
        onConfirm={() => fire("Filtros salvos", "Os filtros do relatório foram atualizados em modo mockado.")}
      />
    </PageShell>
  )
}

export function AgencyFinancePage() {
  const periods = Object.keys(financeSeriesByPeriod) as Array<keyof typeof financeSeriesByPeriod>
  const [period, setPeriod] = useState<(typeof periods)[number]>("Mês")
  const [modal, setModal] = useState<"receita" | "despesa" | null>(null)
  const [records, setRecords] = useState<FinancialRecordRow[]>([])
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true
    requestJson<FinancialRecordRow[]>("/api/finance")
      .then((data) => {
        if (!active) return
        setRecords(data)
      })
      .catch(() => {
        if (!active) return
        setRecords([])
      })
    return () => {
      active = false
    }
  }, [])

  const totalRevenue = records.filter((item) => item.type.toLowerCase().includes("receita")).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpenses = records.filter((item) => item.type.toLowerCase().includes("despesa")).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalCommissions = records.filter((item) => (item.category || "").toLowerCase().includes("comiss")).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const profit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0

  return (
    <PageShell>
      <SectionHeader
        title="Financeiro"
        description="Receitas, despesas, comissões, lucro, margem e exportações com leitura por período."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/financeiro/lancamentos/novo">Novo lançamento</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/financeiro/lancamentos/novo">Analisar com IA</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Exportação preparada", `O relatório financeiro em ${period} foi preparado.`)}>Exportar relatório</Button>
          </div>
        }
      />

      <FilterTabs items={periods} activeItem={period} onChange={(item) => setPeriod(item as typeof period)} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Receitas" value={formatMoney(totalRevenue || 84200)} change={`Período: ${period}`} tone="success" icon={Wallet} />
        <MetricCard label="Despesas" value={formatMoney(totalExpenses || 18400)} change="Hotelaria + mídia" tone="warning" icon={Receipt} />
        <MetricCard label="Comissões" value={formatMoney(totalCommissions || 9840)} change="Equipe comercial" tone="info" icon={Users} />
        <MetricCard label="Lucro" value={formatMoney(profit || 55960)} change={`Margem ${margin || 66}%`} tone="success" icon={TrendingUp} />
        <MetricCard label="Margem" value={`${margin || 66}%`} change="Saudável" tone="success" icon={Percent} />
        <MetricCard label="Saldo do mês" value={formatMoney((profit || 55960) + 9840)} change="Caixa operacional" tone="info" icon={HandCoins} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MockChart title="Receitas, despesas, lucro e margem" description={`Gráfico interativo mockado para o período ${period}.`} span="full" filters={periods} series={financeSeriesByPeriod[period]} />
        <DashboardCard title="Resumo do período" description="Leitura rápida do caixa com contexto operacional.">
          <div className="space-y-3">
            {[
              `Período selecionado: ${period}`,
              "Nova receita preparada para entradas de pacote e upsell.",
              "Nova despesa pronta para mídia, hotelaria e suporte.",
              "Exportação vinculada ao filtro atual para PDF ou CSV.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <Dialog open={modal !== null} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-w-xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <DialogHeader className="border-b border-white/8 px-6 py-5">
            <DialogTitle>{modal === "receita" ? "Nova receita" : "Nova despesa"}</DialogTitle>
            <DialogDescription>{modal === "receita" ? "Lance uma nova entrada com contexto da venda." : "Registre uma nova saída com categoria e impacto."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-5">
            <InfoCard label="Descrição" value={modal === "receita" ? "Entrada pacote Maldivas" : "Campanha de inverno"} />
            <InfoCard label="Valor" value={modal === "receita" ? "R$ 8.900" : "R$ 2.400"} />
            <InfoCard label="Categoria" value={modal === "receita" ? "Viagem premium" : "Marketing"} />
          </div>
          <DialogFooter className="border-t border-white/8 px-6 py-5">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setModal(null)}>
              Fechar
            </Button>
            <Button
              className="rounded-full"
              onClick={async () => {
                const current = modal
                try {
                  const created = await requestJson<FinancialRecordRow>("/api/finance", {
                    method: "POST",
                    body: JSON.stringify({
                      type: current === "receita" ? "Receita" : "Despesa",
                      amount: current === "receita" ? 8900 : 2400,
                      status: "Ativo",
                      description: current === "receita" ? "Entrada pacote Maldivas" : "Campanha de inverno",
                      category: current === "receita" ? "Vendas" : "Marketing",
                    }),
                  })
                  setRecords((prev) => [created, ...prev])
                  setModal(null)
                  fire(current === "receita" ? "Receita salva" : "Despesa salva", "O lançamento foi salvo no Supabase.")
                } catch (error) {
                  fire("Falha ao salvar", error instanceof Error ? error.message : "Não foi possível salvar o lançamento.")
                }
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyTeamPage() {
  const [records, setRecords] = useState<TeamRecord[]>([])
  const [selected, setSelected] = useState<TeamRecord | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true
    requestJson<TeamMemberRow[]>("/api/team")
      .then((data) => {
        if (!active) return
        setRecords(data.map(mapTeamRowToRecord))
      })
      .catch(() => {
        if (!active) return
        setRecords([])
      })
    return () => {
      active = false
    }
  }, [])

  const toggleStatus = async (id: string) => {
    const currentRecord = records.find((item) => item.id === id)
    if (!currentRecord) return
    try {
      const updated = await requestJson<TeamMemberRow>(`/api/team/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: currentRecord.status === "Ativo" ? "Inativo" : "Ativo" }),
      })
      setRecords((current) => current.map((item, index) => (item.id === id ? mapTeamRowToRecord(updated, index) : item)))
    } catch (error) {
      fire("Falha ao atualizar", error instanceof Error ? error.message : "Não foi possível atualizar o membro.")
    }
  }

  return (
    <PageShell>
      <SectionHeader
        title="Equipe"
        description="Funcionários, módulos acessíveis, permissões e histórico de acesso."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/app/equipe/novo">Adicionar</Link>
          </Button>
        }
      />
      <DashboardCard title="Pessoas da agência" description="Ações rápidas para visualizar, editar e controlar status.">
        <div className="space-y-3">
          {records.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={() => setSelected(item)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <StatusPill label={item.status} />
                  <StatusPill label={item.role} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.scope}</p>
                <p className="mt-2 text-xs text-muted-foreground">Último acesso: {item.lastAccess}</p>
              </button>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => setSelected(item) },
                  {
                    label: "Editar",
                    icon: FilePenLine,
                    onClick: async () => {
                      try {
                        const updated = await requestJson<TeamMemberRow>(`/api/team/${item.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ scope: item.scope }),
                        })
                        setRecords((current) => current.map((entry, index) => (entry.id === item.id ? mapTeamRowToRecord(updated, index) : entry)))
                        fire("Membro atualizado", `${item.name} foi sincronizado com o Supabase.`)
                      } catch (error) {
                        fire("Falha ao atualizar", error instanceof Error ? error.message : "Não foi possível atualizar o membro.")
                      }
                    },
                  },
                  { label: item.status === "Ativo" ? "Inativar" : "Ativar", icon: ArrowRightLeft, onClick: () => toggleStatus(item.id) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir membro",
                        description: `Deseja confirmar a exclusão mockada de ${item.name}?`,
                        confirmLabel: "Excluir membro",
                        onConfirm: async () => {
                          try {
                            await requestJson(`/api/team/${item.id}`, { method: "DELETE" })
                            setRecords((current) => current.filter((entry) => entry.id !== item.id))
                            fire("Membro excluído", `${item.name} foi removido do Supabase.`)
                          } catch (error) {
                            fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir o membro.")
                          }
                        },
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Adicionar membro"
        description="Convide um novo colaborador com papel e escopo definidos."
        fields={[
          { label: "Nome", value: "Livia Martins" },
          { label: "E-mail", value: "livia@agencia.com" },
          { label: "Cargo", value: "AGENCY_SALES" },
          { label: "Escopo", value: "Leads e cotações" },
        ]}
        confirmLabel="Salvar membro"
        onConfirm={async () => {
          try {
            const created = await requestJson<TeamMemberRow>("/api/team", {
              method: "POST",
              body: JSON.stringify({
                name: "Livia Martins",
                role: "AGENCY_SALES",
                scope: "Leads e cotações",
                modules: "Leads, cotações, Agent",
                status: "Ativo",
              }),
            })
            setRecords((current) => [mapTeamRowToRecord(created, current.length), ...current])
            fire("Membro adicionado", "O novo membro foi salvo no Supabase.")
          } catch (error) {
            fire("Falha ao criar", error instanceof Error ? error.message : "Não foi possível adicionar o membro.")
          }
        }}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Dados, cargo, permissões, módulos acessíveis, histórico e último acesso.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Cargo" value={selected.role} />
                <InfoCard label="Escopo" value={selected.scope} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Último acesso" value={selected.lastAccess} />
                <InfoCard label="Módulos acessíveis" value={selected.modules} />
                <InfoCard label="Permissões" value="Conforme papel e política da agência" />
              </div>
              <div className="space-y-3 px-6 pb-5">
                {["Acessou central operacional", "Editou uma cotação", "Recebeu novo papel de acesso", "Concluiu tarefa crítica"].map((entry) => (
                  <div key={entry} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{entry}</div>
                ))}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyDocumentsPage() {
  return (
    <DocumentHub
      title="Documentos"
      description="Hub documental da agência com visualização, download, envio e ações por item."
      createLabel="Novo documento"
      records={documentRecords}
    />
  )
}

export function AgencyContractsPage() {
  return (
    <DocumentHub
      title="Contratos"
      description="Contratos com branding, status e ações rápidas para compartilhar ou revisar."
      createLabel="Criar contrato"
      records={documentRecords.filter((doc) => doc.type === "Contrato")}
    />
  )
}

export function AgencyVouchersPage() {
  return (
    <DocumentHub
      title="Vouchers"
      description="Vouchers de hotel, transfer e serviços com visualização rápida."
      createLabel="Novo voucher"
      records={documentRecords.filter((doc) => doc.type === "Voucher")}
    />
  )
}

export function AgencyReceiptsPage() {
  return (
    <DocumentHub
      title="Recibos"
      description="Comprovantes financeiros organizados por cliente e viagem."
      createLabel="Novo recibo"
      records={documentRecords.filter((doc) => doc.type === "Recibo")}
    />
  )
}

export function AgencyTicketsPage() {
  return (
    <DocumentHub
      title="Passagens"
      description="Trechos e emissões organizados com ações de visualização, envio e download."
      createLabel="Nova passagem"
      records={documentRecords.filter((doc) => doc.type === "Passagem")}
    />
  )
}

export function AgencyTemplatesPage() {
  const templateRecords = templates.filter((item) => item.type === "Contrato" || item.type === "Voucher" || item.type === "Roteiro")
  const availableTemplates = templateRecords.map((item, index) => ({
    ...item,
    badge: ["Premium", "Free", "Premium"][index] ?? "Free",
    recommendation: ["Mais usado para contratos de alta conversão", "Recomendado para operação ágil", "Ideal para jornadas aspiracionais"][index] ?? "Pronto para uso",
    version: ["v3.4", "v2.8", "v3.1"][index] ?? "v1.0",
    compatibility: [["IA", "Go"], ["Go", "Atlas"], ["IA", "Go", "Agent"]][index] ?? ["IA"],
    summary: [
      "Estrutura comercial e jurídica pronta para receber branding da agência e assinatura institucional.",
      "Modelo oficial para emissão premium de vouchers com leitura clara para operação e cliente final.",
      "Template narrativo com blocos elegantes para experiências, agenda e diferenciais da viagem.",
    ][index] ?? "Modelo oficial TravelPro.",
  }))
  const [selected, setSelected] = useState<(typeof availableTemplates)[number] | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState("#FF6A1A")
  const [signature, setSignature] = useState("Equipe TravelPro Atlântico Premium")
  const [whatsapp, setWhatsapp] = useState("+55 11 99876-4321")
  const [instagram, setInstagram] = useState("@atlantico.premium")
  const [site, setSite] = useState("www.atlanticopremium.com.br")
  const [slogan, setSlogan] = useState("Viagens com curadoria, contexto e operação impecável.")
  const [footer, setFooter] = useState("Material emitido pela agência com apoio da infraestrutura TravelPro.")
  const fire = (title: string, description: string) => toast({ title, description })
  const handlePreviewFile = (
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    file: File | null,
  ) => {
    if (!file) return
    setter(URL.createObjectURL(file))
  }

  return (
    <PageShell>
      <SectionHeader
        title="Templates ativos da agência"
        description="Escolha modelos oficiais do TravelPro e personalize a experiência da sua marca."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="#templates-disponiveis">Explorar templates</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/documentos/templates/personalizar">Configurar identidade</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="#ia-ready-templates">Ver compatibilidade IA</Link>
            </Button>
          </div>
        }
      />
      <OperationalWorkspaceLayout
        sidebar={
          <>
            <LivePreviewPanel
              title="Preview institucional"
              description="Como os modelos ativos podem aparecer com a identidade da agência."
              footer={
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() => fire("Preview institucional", "A leitura premium da agência foi aberta em modo mockado.")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir preview
                </Button>
              }
            >
              <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/25">
                <div
                  className="border-b border-white/8 px-5 py-6"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}40 0%, rgba(255,255,255,0.03) 62%, rgba(0,0,0,0.2) 100%)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo da agência" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">TP</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">Templates ativos</p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground">Atlântico Premium</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{slogan}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-foreground">Assinatura padrão</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{signature}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-foreground">Canais oficiais</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>{whatsapp}</p>
                      <p>{instagram}</p>
                      <p>{site}</p>
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-primary/15 bg-primary/10 p-4">
                    <p className="text-sm font-medium text-foreground">Compatível com TravelPro Go</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Esse template poderá ser utilizado automaticamente pela IA para contratos, roteiros,
                      vouchers, propostas e documentos operacionais.
                    </p>
                  </div>
                </div>
              </div>
            </LivePreviewPanel>

            <WorkspaceSidebarInfo
              title="Status da identidade"
              description="Leitura rápida do que já está pronto para reutilização pela agência."
              items={[
                { label: "Cor principal", value: primaryColor.toUpperCase() },
                { label: "Modelos ativos", value: `${availableTemplates.length} oficiais` },
                { label: "Uso futuro", value: "IA • Go • Agent • Atlas" },
              ]}
            />

            <SetupStatusCard
              title="Pronto para distribuição"
              description="A base da agência fica preparada para catálogos, documentos e automações futuras."
              badges={["Branding ativo", "IA Ready", "Go compatível", "Operação premium"]}
            />
          </>
        }
      >
        <DashboardCard title="Identidade da marca" description="A agência ativa modelos oficiais e aplica apenas a sua assinatura institucional.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <MediaUploadCard
                title="Logo da agência"
                description="Aplicado em contratos, roteiros, vouchers e materiais enviados ao cliente."
                preview={logoPreview}
                orientation="landscape"
                onSelect={(file) => handlePreviewFile(setLogoPreview, file)}
                onRemove={() => setLogoPreview(null)}
              />
            </div>
            <MediaUploadCard
              title="Favicon"
              description="Assinatura compacta para links públicos e experiências web."
              preview={faviconPreview}
              orientation="square"
              onSelect={(file) => handlePreviewFile(setFaviconPreview, file)}
              onRemove={() => setFaviconPreview(null)}
            />
            <label className="space-y-2 rounded-[26px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12)]">
              <span className="text-sm font-medium text-foreground">Cor principal</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                />
                <input
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                />
              </div>
              <div className="grid gap-3 pt-1 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-primary/75">WhatsApp</span>
                  <input
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Instagram</span>
                  <input
                    value={instagram}
                    onChange={(event) => setInstagram(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
                  />
                </label>
              </div>
            </label>
            <label className="space-y-2 rounded-[26px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12)]">
              <span className="text-sm font-medium text-foreground">Assinatura e canais</span>
              <div className="space-y-3 pt-1">
                <input
                  value={signature}
                  onChange={(event) => setSignature(event.target.value)}
                  placeholder="Assinatura padrão"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
                />
                <input
                  value={site}
                  onChange={(event) => setSite(event.target.value)}
                  placeholder="Site"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
                />
                <input
                  value={slogan}
                  onChange={(event) => setSlogan(event.target.value)}
                  placeholder="Slogan"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
                />
              </div>
            </label>
            <label className="space-y-2 rounded-[26px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12)] md:col-span-2">
              <span className="text-sm font-medium text-foreground">Rodapé institucional</span>
              <textarea
                rows={4}
                value={footer}
                onChange={(event) => setFooter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </label>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Templates disponíveis"
          description="Modelos oficiais do TravelPro prontos para ativação, padrão e personalização."
        >
          <div id="templates-disponiveis" className="space-y-3">
            {availableTemplates.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[30px] border border-white/8 bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-transparent p-5 shadow-[0_18px_40px_rgba(0,0,0,0.14)] xl:flex-row xl:items-center xl:justify-between"
              >
                <button type="button" onClick={() => setSelected(item)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{item.name}</p>
                    <StatusPill label={item.status} />
                    <StatusPill label={item.badge} />
                    <StatusPill label={item.version} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.type} • {item.category} • {item.recommendation}
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.compatibility.map((compatibility) => (
                      <span
                        key={`${item.id}-${compatibility}`}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground"
                      >
                        {compatibility}
                      </span>
                    ))}
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] text-primary">
                      Recomendado
                    </span>
                  </div>
                </button>
                <div className="flex flex-wrap items-center gap-2 xl:w-[320px] xl:justify-end">
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/[0.03]"
                    onClick={() => fire("Template ativado", `${item.name} foi ativado em modo mockado.`)}
                  >
                    Ativar
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/[0.03]"
                    onClick={() => setSelected(item)}
                  >
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/[0.03]"
                    onClick={() => fire("Template padrão", `${item.name} foi definido como padrão em modo mockado.`)}
                  >
                    Definir padrão
                  </Button>
                  <Button asChild className="rounded-full">
                    <Link href={`/app/documentos/templates/personalizar?template=${encodeURIComponent(item.name)}`}>
                      Personalizar
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <div id="ia-ready-templates" className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <FeatureExplanationCard
            title="Compatível com TravelPro Go"
            description="Os modelos oficiais da agência já ficam preparados para uso futuro dentro do ecossistema inteligente."
            items={[
              {
                title: "Go operacional",
                body: "Esse template poderá ser utilizado automaticamente pelo Go ao gerar contratos, roteiros, vouchers e documentos via WhatsApp.",
              },
              {
                title: "Agent e follow-up",
                body: "Modelos ativos também poderão ser reutilizados pelo Agent em comunicações contextuais com leads e clientes.",
              },
              {
                title: "Atlas e Marketing IA",
                body: "A mesma identidade ajuda Atlas Advisor e Marketing IA a manter coerência operacional e comercial.",
              },
            ]}
          />
          <SetupStatusCard
            title="IA Ready"
            description="Bloco visual para sinalizar quais modelos já estão prontos para o futuro ecossistema inteligente."
            badges={["TravelPro Go", "Agent", "Atlas", "Marketing IA"]}
          />
        </div>
      </OperationalWorkspaceLayout>
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Preview do modelo oficial com branding, compatibilidade e leitura de uso pela agência.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard label="Tipo" value={selected.type} />
                <InfoCard label="Categoria" value={selected.category} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Versão" value={selected.version} />
                <InfoCard label="Compatibilidade" value={selected.compatibility.join(", ")} />
                <InfoCard label="Badge" value={selected.badge} />
              </div>
              <div className="px-6 pb-6">
                <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-6 text-muted-foreground">
                  {selected.summary}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyTasksOperationalPage() {
  return <AgencyTasksPage />
}

export function AgencyReportsOperationalPage() {
  return <AgencyReportsPage />
}

export function AgencyLeadsPage() {
  const [records, setRecords] = useState<Array<ReturnType<typeof mapLeadRowToCard>>>([])
  const [selected, setSelected] = useState<Array<ReturnType<typeof mapLeadRowToCard>>[number] | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true
    requestJson<LeadRow[]>("/api/leads")
      .then((data) => {
        if (!active) return
        setRecords(data.map(mapLeadRowToCard))
      })
      .catch(() => {
        if (!active) return
        setRecords([])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <PageShell>
      <SectionHeader
        title="Leads"
        description="Acompanhe intenção, origem, temperatura e próximos passos de cada oportunidade."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/leads/qualificar">Qualificar com IA</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/app/leads/novo">Novo lead</Link>
            </Button>
          </div>
        }
      />
      <DashboardCard title="Oportunidades ativas" description="Clique em um lead para abrir detalhes e ações rápidas.">
        <div className="space-y-3">
          {records.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => setSelected(lead)}
              className="flex w-full flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/15 hover:bg-white/[0.05] lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <StatusPill label={lead.temperature} />
                  <StatusPill label={lead.stage} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{lead.origin} • {lead.destination}</p>
              </div>
              <span className="text-xs text-muted-foreground">Abrir detalhes</span>
            </button>
          ))}
        </div>
      </DashboardCard>

      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo lead"
        description="Cadastre uma nova oportunidade com origem, destino e intenção inicial."
        fields={[
          { label: "Nome", value: "Isabela Monteiro" },
          { label: "Origem", value: "Instagram" },
          { label: "Destino", value: "Tailândia" },
          { label: "Intenção", value: "Lua de mel premium" },
        ]}
        confirmLabel="Salvar lead"
        onConfirm={async () => {
          try {
            const created = await requestJson<LeadRow>("/api/leads", {
              method: "POST",
              body: JSON.stringify({
                name: "Isabela Monteiro",
                origin: "Instagram",
                destination: "Tailândia",
                status: "Novo lead",
                temperature: "Quente",
              }),
            })
            setRecords((current) => [mapLeadRowToCard(created), ...current])
            fire("Lead criado", "O novo lead foi salvo no Supabase.")
          } catch (error) {
            fire("Falha ao criar", error instanceof Error ? error.message : "Não foi possível criar o lead.")
          }
        }}
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Dados, origem, status, intenção, próximos passos e ações rápidas do lead.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard label="Origem" value={selected.origin} />
                <InfoCard label="Destino" value={selected.destination} />
                <InfoCard label="Status" value={selected.stage} />
                <InfoCard label="Temperatura" value={selected.temperature} />
                <InfoCard label="Intenção" value="Pacote premium com acompanhamento próximo" />
                <InfoCard label="Próximo passo" value="Retomar contato e enviar proposta inicial" />
              </div>
              <div className="flex flex-wrap gap-2 px-6 pb-5">
                <Button className="rounded-full" onClick={() => fire("Lead notificado", `${selected.name} recebeu uma resposta inicial mockada.`)}>Notificar</Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={async () => {
                    try {
                      const updated = await requestJson<LeadRow>(`/api/leads/${selected.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "Cotação enviada" }),
                      })
                      const mapped = mapLeadRowToCard(updated)
                      setRecords((current) => current.map((item) => (item.id === selected.id ? mapped : item)))
                      setSelected(mapped)
                      fire("Status atualizado", `O lead de ${selected.name} foi movido para cotação enviada.`)
                    } catch (error) {
                      fire("Falha ao atualizar", error instanceof Error ? error.message : "Não foi possível atualizar o status do lead.")
                    }
                  }}
                >
                  Criar cotação
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={async () => {
                    try {
                      const updated = await requestJson<LeadRow>(`/api/leads/${selected.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "Aguardando retorno" }),
                      })
                      const mapped = mapLeadRowToCard(updated)
                      setRecords((current) => current.map((item) => (item.id === selected.id ? mapped : item)))
                      setSelected(mapped)
                      fire("Próximo passo atualizado", `O follow-up de ${selected.name} foi registrado no Supabase.`)
                    } catch (error) {
                      fire("Falha ao atualizar", error instanceof Error ? error.message : "Não foi possível atualizar o lead.")
                    }
                  }}
                >
                  Agendar próximo passo
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyTravelProGoPage() {
  const fire = (title: string, description: string) => toast({ title, description })
  const entries = [
    { id: "go-1", title: "Criar roteiro para João em Gramado", response: "Roteiro criado e salvo no sistema.", href: "/app/viagens/roteiros" },
    { id: "go-2", title: "Gerar contrato da viagem da Ana", response: "Contrato criado com a identidade da agência.", href: "/app/documentos/contratos" },
    { id: "go-3", title: "Criar pacote para Cancún", response: "Pacote publicado e pronto para compartilhar.", href: "/app/catalogo" },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="TravelPro Go"
        description="WhatsApp operacional com governança, histórico e ações rápidas da rotina."
        actions={
          <div className="flex flex-wrap gap-2">
            <SmartActionButton label="Configurar com IA" description="A IA poderá sugerir regras, permissões e comandos úteis para o TravelPro Go." />
            <Button className="rounded-full" onClick={() => fire("TravelPro Go atualizado", "O número foi ativado ou pausado em modo mockado.")}>Ativar / pausar</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem aberta", "O histórico completo do TravelPro Go foi preparado.")}>Abrir origem</Button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <FeatureExplanationCard
          title="Como o TravelPro Go funciona"
          description="É o assessor interno da agência via WhatsApp, conectado à operação."
          items={[
            { title: "Assessor operacional", body: "Recebe comandos internos para criar clientes, cotações, roteiros, documentos e notificações." },
            { title: "Governança do sistema", body: "Opera com permissões definidas e serve como extensão do time no dia a dia." },
          ]}
        />
        <SetupStatusCard
          title="Configuração atual"
          description="Leitura rápida da maturidade do módulo."
          badges={["Número oficial ativo", "Criação de clientes pronta", "Consultas operacionais liberadas", "Distribuição interna ativa"]}
        />
      </div>
      <DashboardCard title="Execuções recentes" description="Comandos recentes com origem e detalhe operacional.">
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{entry.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{entry.response}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem aberta", `A origem de ${entry.title} foi aberta em modo mockado.`)}>Abrir origem</Button>
                <Button className="rounded-full" onClick={() => fire("Detalhes abertos", `Os detalhes de ${entry.title} foram preparados.`)}>Abrir detalhes</Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageShell>
  )
}

export function AgencyAgentPage() {
  const [styleOpen, setStyleOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })
  const items = leads.map((lead) => ({ ...lead, style: "Consultivo premium" }))

  return (
    <PageShell>
      <SectionHeader
        title="TravelPro Agent"
        description="Leads atendidos, qualificação, follow-ups e estilo de atendimento com ações por item."
        actions={
          <div className="flex flex-wrap gap-2">
            <SmartActionButton label="Configurar com IA" description="A IA poderá sugerir estilo de atendimento, regras e escalonamento para o Agent." />
            <Button className="rounded-full" onClick={() => fire("Agent atualizado", "O Agent foi ativado ou pausado em modo mockado.")}>Pausar / ativar</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setStyleOpen(true)}>Editar estilo de atendimento</Button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <FeatureExplanationCard
          title="Como o TravelPro Agent funciona"
          description="É o atendente externo da agência para leads e clientes em qualificação."
          items={[
            { title: "Atendente comercial", body: "Qualifica leads, faz follow-up, cria oportunidades e notifica a agência quando precisa de humano." },
            { title: "Escalonamento inteligente", body: "Quando a conversa exige contexto maior, o Agent prepara a transferência para o time." },
          ]}
        />
        <SetupStatusCard
          title="Estado atual do Agent"
          description="Leitura rápida do módulo externo de atendimento."
          badges={["Follow-up ativo", "Qualificação assistida", "Escalonamento configurado", "Estilo consultivo premium"]}
        />
      </div>
      <DashboardCard title="Conversas acompanhadas" description="Ações rápidas por atendimento sem poluir a operação.">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <StatusPill label={item.stage} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.destination} • {item.origin} • {item.style}</p>
              </div>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Atendimento aberto", `${item.name} foi aberto em modo mockado.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Atendimento em edição", `${item.name} foi aberto para edição mockada.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir atendimento",
                        description: `Deseja confirmar a exclusão mockada do atendimento de ${item.name}?`,
                        confirmLabel: "Excluir atendimento",
                        onConfirm: () => fire("Atendimento excluído", `${item.name} foi removido em modo mockado.`),
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={styleOpen}
        onOpenChange={setStyleOpen}
        title="Estilo de atendimento"
        description="Ajuste o tom, autonomia e o comportamento principal do Agent."
        fields={[
          { label: "Tom", value: "Consultivo premium" },
          { label: "Autonomia", value: "Assistida" },
          { label: "Follow-up", value: "7 dias" },
          { label: "Escalonamento", value: "Leads quentes e objeções complexas" },
        ]}
        confirmLabel="Salvar estilo"
        onConfirm={() => fire("Estilo salvo", "O estilo de atendimento foi atualizado em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </PageShell>
  )
}

export function AgencyMarketingPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })
  const campaigns = [
    { id: "mk-1", title: "Inverno em Gramado", status: "Ativa", detail: "Campanha sazonal para famílias." },
    { id: "mk-2", title: "Lua de mel premium", status: "Planejada", detail: "Calendário de posts e anúncios curados." },
    { id: "mk-3", title: "Férias de julho", status: "Em revisão", detail: "Legendas e ideias para alta procura." },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="Marketing"
        description="Campanhas, calendário e ações promocionais com fluxo leve e organizado."
        actions={
          <div className="flex flex-wrap gap-2">
            <SmartActionButton label="Criar campanha com IA" description="A IA poderá gerar campanhas, calendário e CTA com base no pacote e público." />
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Calendário aberto", "O calendário promocional foi preparado em modo mockado.")}>Abrir calendário</Button>
            <Button asChild className="rounded-full">
              <Link href="/app/marketing/campanhas/nova">Nova campanha</Link>
            </Button>
          </div>
        }
      />
      <FeatureExplanationCard
        title="Marketing IA na operação"
        description="O módulo deixa de ser só um calendário e passa a ser base de distribuição comercial."
        items={[
          { title: "Campanhas orientadas por pacote", body: "Relaciona catálogo, público, CTA e canal em um só fluxo." },
          { title: "Base para IA futura", body: "Pronto para gerar criativos, mensagens e versões por segmento." },
        ]}
      />
      <DashboardCard title="Campanhas" description="Acompanhe campanhas ativas e ações de manutenção.">
        <div className="space-y-3">
          {campaigns.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <StatusPill label={item.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Campanha aberta", `${item.title} foi aberta em modo mockado.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Campanha em edição", `${item.title} foi aberta para edição mockada.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir campanha",
                        description: `Deseja confirmar a exclusão mockada da campanha ${item.title}?`,
                        confirmLabel: "Excluir campanha",
                        onConfirm: () => fire("Campanha excluída", `${item.title} foi removida em modo mockado.`),
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova campanha"
        description="Crie uma campanha com foco, período e canal principal."
        fields={[
          { label: "Campanha", value: "Verão em Cancún" },
          { label: "Canal", value: "Instagram + WhatsApp" },
          { label: "Período", value: "01 jul • 31 jul" },
          { label: "Objetivo", value: "Gerar leads qualificados" },
        ]}
        confirmLabel="Salvar campanha"
        onConfirm={() => fire("Campanha criada", "A nova campanha foi preparada em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </PageShell>
  )
}

export function AgencyAtlasAdvisorPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const fire = (title: string, description: string) => toast({ title, description })
  const consults = [
    { id: "at-1", title: "Script para lead frio", detail: "Atlas sugeriu abordagem consultiva para retomada.", status: "Hoje" },
    { id: "at-2", title: "Situação delicada de hotel", detail: "Recomendação para condução de crise com cliente em viagem.", status: "Ontem" },
    { id: "at-3", title: "Escala da equipe comercial", detail: "Sugestão para distribuir follow-ups e priorizar quentes.", status: "Esta semana" },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="Atlas Advisor"
        description="Consultoria operacional inteligente para comercial, crises e escala da agência."
        actions={
          <div className="flex flex-wrap gap-2">
            <SmartActionButton label="Configurar com IA" description="A IA poderá sugerir roteiros de objeção, suporte e ações de escala para a equipe." />
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico aberto", "O histórico completo do Atlas Advisor foi preparado.")}>Ver histórico</Button>
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>Nova consulta</Button>
          </div>
        }
      />
      <FeatureExplanationCard
        title="Para que serve o Atlas Advisor"
        description="Consultoria operacional para momentos em que o time precisa de apoio contextual."
        items={[
          { title: "Comercial", body: "Sugere scripts, respostas e próximos passos para leads e clientes." },
          { title: "Operação", body: "Ajuda em crise, objeções, replanejamento e escala da agência." },
        ]}
      />
      <DashboardCard title="Consultas recentes" description="Abra contexto, origem e detalhes da orientação recebida.">
        <div className="space-y-3">
          {consults.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <StatusPill label={item.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem aberta", `A origem de ${item.title} foi preparada.`)}>Abrir origem</Button>
                <Button className="rounded-full" onClick={() => fire("Detalhes abertos", `Os detalhes de ${item.title} foram preparados.`)}>Abrir detalhes</Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova consulta"
        description="Abra uma nova consulta com contexto e objetivo principal."
        fields={[
          { label: "Assunto", value: "Reverter lead em silêncio" },
          { label: "Módulo", value: "Comercial" },
          { label: "Contexto", value: "Lead quente sem resposta há 3 dias" },
          { label: "Objetivo", value: "Retomar conversa com script premium" },
        ]}
        confirmLabel="Enviar consulta"
        onConfirm={() => fire("Consulta criada", "A nova consulta foi preparada em modo mockado.")}
      />
    </PageShell>
  )
}

export function AgencyAutomationsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })
  const flows = [
    { id: "au-1", title: "Follow-up pós-cotação", status: "Ativa", detail: "Lembrete 24h e 72h após envio." },
    { id: "au-2", title: "Reativação de leads frios", status: "Pausada", detail: "Fluxo com script premium e prioridade comercial." },
    { id: "au-3", title: "Checklist pré-embarque", status: "Ativa", detail: "Mensagens e tarefas automáticas antes da viagem." },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="Automações"
        description="Fluxos, follow-ups, alertas e tarefas automáticas com histórico de execução."
        actions={
          <div className="flex flex-wrap gap-2">
            <SmartActionButton label="Configurar com IA" description="A IA poderá sugerir fluxos, regras e gatilhos para automações premium." />
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico aberto", "O histórico das automações foi preparado em modo mockado.")}>Ver histórico</Button>
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>Novo fluxo</Button>
          </div>
        }
      />
      <SetupStatusCard
        title="Automações em operação"
        description="A visão agora é de módulo configurável, não só uma lista de fluxos."
        badges={["Follow-up ativo", "Checklist pré-embarque", "Reativação pronta", "Tarefas automáticas configuradas"]}
      />
      <DashboardCard title="Fluxos ativos" description="Acompanhe, ajuste e remova automações sem perder contexto.">
        <div className="space-y-3">
          {flows.map((flow) => (
            <div key={flow.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{flow.title}</p>
                  <StatusPill label={flow.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{flow.detail}</p>
              </div>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Fluxo aberto", `${flow.title} foi aberto em modo mockado.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Fluxo em edição", `${flow.title} foi aberto para edição mockada.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir automação",
                        description: `Deseja confirmar a exclusão mockada da automação ${flow.title}?`,
                        confirmLabel: "Excluir automação",
                        onConfirm: () => fire("Automação excluída", `${flow.title} foi removida em modo mockado.`),
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo fluxo"
        description="Crie uma automação com gatilho, canal e objetivo principal."
        fields={[
          { label: "Nome do fluxo", value: "Follow-up premium de lead quente" },
          { label: "Gatilho", value: "Cotação enviada" },
          { label: "Canal", value: "WhatsApp" },
          { label: "Objetivo", value: "Retomar conversa e avançar etapa" },
        ]}
        confirmLabel="Salvar fluxo"
        onConfirm={() => fire("Fluxo criado", "A nova automação foi preparada em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </PageShell>
  )
}

export function AgencyOperationalOverviewPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Central Operacional"
        description="Prioridades do dia, rotas rápidas e ações por item para mover a operação."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>Nova tarefa</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Rota rápida criada", "A nova rota rápida foi preparada em modo mockado.")}>Adicionar rota rápida</Button>
          </div>
        }
      />
      <DashboardCard title="Itens operacionais" description="Abra origem, visualize e edite cada item da central.">
        <div className="space-y-3">
          {tasks.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <StatusPill label={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.owner} • {item.due}</p>
              </div>
              <ActionMenu
                items={[
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Item aberto", `${item.title} foi aberto em modo mockado.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Item em edição", `${item.title} foi aberto para edição mockada.`) },
                  { label: "Abrir origem", icon: ExternalLink, onClick: () => fire("Origem aberta", `A origem de ${item.title} foi preparada.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir item",
                        description: `Deseja confirmar a exclusão mockada de ${item.title}?`,
                        confirmLabel: "Excluir item",
                        onConfirm: () => fire("Item excluído", `${item.title} foi removido em modo mockado.`),
                      }),
                    danger: true,
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </DashboardCard>
      <MockFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova tarefa operacional"
        description="Crie uma nova tarefa com responsável, prazo e impacto esperado."
        fields={[
          { label: "Tarefa", value: "Validar voucher do hotel" },
          { label: "Responsável", value: "Operacional" },
          { label: "Prazo", value: "Hoje, 18:00" },
          { label: "Impacto", value: "Pré-embarque" },
        ]}
        confirmLabel="Salvar tarefa"
        onConfirm={() => fire("Tarefa criada", "A nova tarefa operacional foi preparada em modo mockado.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </PageShell>
  )
}

export function AgencyInsightsPage() {
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Insights"
        description="Leituras inteligentes com foco em próximos passos e exportação organizada."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Insights abertos", "A visão aprofundada dos insights foi preparada.")}>Ver insights</Button>
            <Button className="rounded-full" onClick={() => fire("Relatórios preparados", "A exportação dos relatórios foi preparada em modo mockado.")}>Exportar relatórios</Button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardCard title="Sinais da semana" description="Resumo visual do que merece leitura mais profunda.">
          <div className="space-y-3">
            {["Margem acima da média nas viagens premium", "Clientes premium respondem melhor no início da noite", "TravelPro Go acelerou tarefas repetitivas em 42%", "Match trouxe leads mais quentes para pacotes com destaque"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard title="Ações sugeridas" description="Próximos movimentos recomendados para a agência.">
          <div className="space-y-3">
            {["Reforçar follow-up nos leads de alto ticket", "Publicar novo pacote de inverno no catálogo", "Aumentar créditos para janela comercial da semana", "Abrir Atlas Advisor para scripts de objeção"].map((item) => (
              <button key={item} type="button" onClick={() => fire("Insight acionado", item)} className="w-full rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left text-sm text-muted-foreground transition-all hover:border-primary/15 hover:bg-white/[0.05]">{item}</button>
            ))}
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}

export function AgencyCreditsPage() {
  const fire = (title: string, description: string) => toast({ title, description })
  const rows = [
    { id: "cr-1", origin: "Roteiros premium", usage: "640 créditos", time: "Hoje, 09:20" },
    { id: "cr-2", origin: "TravelPro Go", usage: "420 créditos", time: "Hoje, 11:05" },
    { id: "cr-3", origin: "Agent", usage: "980 créditos", time: "Ontem, 18:12" },
  ]

  return (
    <PageShell>
      <SectionHeader title="Créditos e consumo" description="Consumo por feature, histórico e ações rápidas de compra e rastreio." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Créditos disponíveis" value="2.520" change="Ciclo atual" tone="success" icon={CreditCard} />
        <MetricCard label="Créditos usados" value="3.480" change="58% do plano" tone="warning" icon={Sparkles} />
        <MetricCard label="Maior origem" value="Agent" change="980 créditos" tone="info" icon={Bot} />
      </div>
      <DashboardCard title="Histórico de uso" description="Abra a origem do consumo, revise o histórico e compre novos créditos.">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico aberto", "O histórico completo de créditos foi preparado.")}>Ver histórico</Button>
          <Button className="rounded-full" onClick={() => fire("Compra preparada", "O fluxo de compra de créditos foi preparado em modo mockado.")}>Comprar créditos</Button>
        </div>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{row.origin}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.usage} • {row.time}</p>
              </div>
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem aberta", `A origem de ${row.origin} foi preparada.`)}>
                Abrir origem
              </Button>
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageShell>
  )
}


