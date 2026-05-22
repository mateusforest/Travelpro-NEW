"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  MoreHorizontal,
  PlaneTakeoff,
  Percent,
  Receipt,
  Route,
  Save,
  Send,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRoundPlus,
  Users,
  Wallet,
  Waypoints,
} from "lucide-react"
import { trips } from "@/mock/trips"
import { documents } from "@/mock/documents"
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
import { matchesDocumentSection, normalizeDocumentType } from "@/lib/documents/document-kind"
import {
  buildFinanceChartSeries,
  FINANCE_FILTERS,
  FINANCE_PERIODS,
  isFinancialRecordInRange,
  matchesFinanceFilter,
  normalizeFinanceStatus,
  normalizeFinanceType,
  resolveFinanceDateRange,
} from "@/lib/finance/agency-finance"
import type { ClientRow, DocumentRow, FinancialRecordRow, LeadRow, ReportRow, TaskRow, TeamMemberRow, TripRow } from "@/types/database"
import type { ClientInput, ClientTravelerProfile } from "@/types/client"
import type { AgencyDashboardData } from "@/types/dashboard"
import type { CentralOperationalData } from "@/types/operational-center"
import type { CreditsOverviewData } from "@/types/credits-overview"
import type { ReportsOverviewData } from "@/types/reports-overview"
import type { TripShareLinkSummary } from "@/types/trip-share"

type ClientRecord = {
  id: string
  name: string
  tag: string
  status: string
  destination: string
  email: string
  phone: string
  profile_id: string | null
  document_number: string | null
  traveler_profile: ClientTravelerProfile
  document?: string
  preferences: string
  profile: string
  recommendations: string[]
  companions: string
  notes: string
  origin: string
  nextStep: string
  createdAt: string
  updatedAt: string
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

function parseTravelerProfile(value: ClientRow["traveler_profile"]): ClientTravelerProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const source = value as Record<string, unknown>

  return {
    tag: typeof source.tag === "string" ? source.tag : undefined,
    destination: typeof source.destination === "string" ? source.destination : undefined,
    origin: typeof source.origin === "string" ? source.origin : undefined,
    preferences: typeof source.preferences === "string" ? source.preferences : undefined,
    travelerProfile: typeof source.travelerProfile === "string" ? source.travelerProfile : undefined,
    nextStep: typeof source.nextStep === "string" ? source.nextStep : undefined,
    companions: typeof source.companions === "string" ? source.companions : undefined,
    notes: typeof source.notes === "string" ? source.notes : undefined,
    recommendations: Array.isArray(source.recommendations) ? source.recommendations.filter((item): item is string => typeof item === "string") : undefined,
  }
}

function defaultTagFromStatus(status: string) {
  if (status === "Em viagem") return "Em viagem"
  if (status === "Pendente") return "Pendente"
  return "Premium"
}

function mapClientRowToRecord(row: ClientRow): ClientRecord {
  const travelerProfile = parseTravelerProfile(row.traveler_profile)

  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "E-mail não informado",
    phone: row.phone ?? "Telefone não informado",
    profile_id: row.profile_id,
    document_number: row.document_number,
    traveler_profile: travelerProfile,
    status: row.status || "Ativo",
    tag: travelerProfile.tag || defaultTagFromStatus(row.status || "Ativo"),
    destination: travelerProfile.destination || "Destino em definição",
    document: row.document_number || (row.profile_id ? `Perfil ${row.profile_id.slice(0, 8)}` : "Documento não informado"),
    preferences: travelerProfile.preferences || "Preferências ainda não registradas.",
    profile: travelerProfile.travelerProfile || "Perfil do viajante ainda não descrito.",
    recommendations: travelerProfile.recommendations?.length ? travelerProfile.recommendations : ["Recomendações serão sugeridas conforme histórico e operação."],
    companions: travelerProfile.companions || "Não informado",
    notes: travelerProfile.notes || "Sem observações internas registradas.",
    origin: travelerProfile.origin || "Origem não informada",
    nextStep: travelerProfile.nextStep || "Definir próximo passo operacional",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTripRowToRecord(row: TripRow, index: number): TripRecord {
  const status = row.status || "Planejamento"

  return {
    ...row,
    client: "Cliente vinculado",
    dates: row.starts_at && row.ends_at ? `${row.starts_at.slice(0, 10)} • ${row.ends_at.slice(0, 10)}` : "Datas em definição",
    documents: `${2 + (index % 4)} arquivos`,
    finance: index % 2 === 0 ? "Saldo ok" : "A receber",
    itinerary: row.summary || (index % 2 === 0 ? "Roteiro final" : "Roteiro premium"),
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

function parseDocumentMetadata(value: DocumentRow["metadata"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function formatDateLabel(value?: string | null) {
  if (!value) return "Nao informado"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed)
}

function formatDateTimeLabel(value?: string | null) {
  if (!value) return "Nao informado"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(parsed)
}

function parseReportFilters(value: ReportRow["filters"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function mapDocumentRowToRecord(
  row: DocumentRow,
  index: number,
  related?: {
    clientsById?: Map<string, ClientRow>
    tripsById?: Map<string, TripRow>
  },
): DocumentRecord {
  const metadata = parseDocumentMetadata(row.metadata)
  const linkedClient = row.client_id ? related?.clientsById?.get(row.client_id) : null
  const linkedTrip = row.trip_id ? related?.tripsById?.get(row.trip_id) : null
  const previewFromMetadata = typeof metadata.variables === "string" && metadata.variables.trim()
    ? metadata.variables.trim()
    : typeof metadata.attachments === "string" && metadata.attachments.trim()
      ? metadata.attachments.trim()
      : null

  return {
    ...row,
    name: row.title,
    type: normalizeDocumentType(row.type),
    client: linkedClient?.name ?? (row.client_id ? `Cliente ${row.client_id.slice(0, 8)}` : "Sem cliente vinculado"),
    trip: linkedTrip?.destination ?? (row.trip_id ? `Viagem ${row.trip_id.slice(0, 8)}` : "Sem viagem vinculada"),
    preview: previewFromMetadata || row.storage_path || `Documento ${normalizeDocumentType(row.type).toLowerCase()} salvo em ${formatDateLabel(row.updated_at)}.`,
  }
}

function mapLeadRowToCard(row: LeadRow) {
  return {
    ...row,
    stage: row.status || "Novo lead",
    temperature: row.temperature || "Morno",
    destination: row.destination || "Destino em definição",
    origin: row.origin || "Origem não informada",
    email: row.email || "E-mail não informado",
    phone: row.phone || "Telefone não informado",
    notes: row.notes || "Sem observações registradas.",
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
    toast({ title: "Mensagem registrada", description: "A mensagem foi registrada nesta sessão enquanto o fluxo completo de conversas chega em uma próxima etapa." })
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

type ClientFormValues = {
  name: string
  email: string
  phone: string
  status: string
  documentNumber: string
  destination: string
  tag: string
  origin: string
  preferences: string
  travelerProfile: string
  recommendations: string
  companions: string
  nextStep: string
  notes: string
}

function buildClientFormValues(record?: ClientRecord | null): ClientFormValues {
  return {
    name: record?.name ?? "",
    email: record?.email === "E-mail não informado" ? "" : record?.email ?? "",
    phone: record?.phone === "Telefone não informado" ? "" : record?.phone ?? "",
    status: record?.status ?? "Ativo",
    documentNumber: record?.document_number ?? "",
    destination: record?.destination === "Destino em definição" ? "" : record?.destination ?? "",
    tag: record?.tag ?? "Premium",
    origin: record?.origin === "Origem não informada" ? "" : record?.origin ?? "",
    preferences: record?.preferences === "Preferências ainda não registradas." ? "" : record?.preferences ?? "",
    travelerProfile: record?.profile === "Perfil do viajante ainda não descrito." ? "" : record?.profile ?? "",
    recommendations: record?.recommendations?.[0] === "Recomendações serão sugeridas conforme histórico e operação." ? "" : record?.recommendations.join(", "),
    companions: record?.companions === "Não informado" ? "" : record?.companions ?? "",
    nextStep: record?.nextStep === "Definir próximo passo operacional" ? "" : record?.nextStep ?? "",
    notes: record?.notes === "Sem observações internas registradas." ? "" : record?.notes ?? "",
  }
}

function buildClientPayload(values: ClientFormValues): ClientInput {
  return {
    name: values.name.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    document_number: values.documentNumber.trim() || null,
    status: values.status,
    traveler_profile: {
      destination: values.destination.trim(),
      tag: values.tag.trim(),
      origin: values.origin.trim(),
      preferences: values.preferences.trim(),
      travelerProfile: values.travelerProfile.trim(),
      recommendations: values.recommendations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      companions: values.companions.trim(),
      nextStep: values.nextStep.trim(),
      notes: values.notes.trim(),
    },
  }
}

function ClientEditorDialog({
  open,
  onOpenChange,
  mode,
  values,
  onChange,
  onConfirm,
  saving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  values: ClientFormValues
  onChange: (field: keyof ClientFormValues, value: string) => void
  onConfirm: () => void
  saving: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{mode === "create" ? "Novo cliente" : "Editar cliente"}</DialogTitle>
          <DialogDescription>
            Cadastre ou atualize dados reais do cliente, preservando preferências, contexto e próximos passos da operação.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[62vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          {[
            ["name", "Nome"],
            ["email", "E-mail"],
            ["phone", "Telefone"],
            ["status", "Status"],
            ["documentNumber", "Documento"],
            ["destination", "Destino em foco"],
            ["tag", "Segmento"],
            ["origin", "Origem"],
            ["companions", "Acompanhantes"],
            ["nextStep", "Próximo passo"],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
              <input
                value={values[field as keyof ClientFormValues]}
                onChange={(event) => onChange(field as keyof ClientFormValues, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </label>
          ))}
          {[
            ["preferences", "Preferências de viagem"],
            ["travelerProfile", "Perfil do viajante"],
            ["recommendations", "Recomendações"],
            ["notes", "Observações internas"],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
              <textarea
                rows={4}
                value={values[field as keyof ClientFormValues]}
                onChange={(event) => onChange(field as keyof ClientFormValues, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </label>
          ))}
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="rounded-full" onClick={onConfirm} disabled={saving}>
            {saving ? "Salvando..." : mode === "create" ? "Salvar cliente" : "Atualizar cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type LeadFormValues = {
  name: string
  email: string
  phone: string
  origin: string
  destination: string
  status: string
  temperature: string
  notes: string
}

function buildLeadFormValues(record?: ReturnType<typeof mapLeadRowToCard>): LeadFormValues {
  return {
    name: record?.name ?? "",
    email: record?.email && record.email !== "E-mail não informado" ? record.email : "",
    phone: record?.phone && record.phone !== "Telefone não informado" ? record.phone : "",
    origin: record?.origin && record.origin !== "Origem não informada" ? record.origin : "",
    destination: record?.destination && record.destination !== "Destino em definição" ? record.destination : "",
    status: record?.stage ?? "Novo lead",
    temperature: record?.temperature ?? "Morno",
    notes: record?.notes && record.notes !== "Sem observações registradas." ? record.notes : "",
  }
}

function LeadEditorDialog({
  open,
  onOpenChange,
  values,
  onChange,
  onConfirm,
  saving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: LeadFormValues
  onChange: (field: keyof LeadFormValues, value: string) => void
  onConfirm: () => void
  saving: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>Editar lead</DialogTitle>
          <DialogDescription>Atualize os dados reais da oportunidade sem sair da operação.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[62vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          {[
            ["name", "Nome"],
            ["email", "E-mail"],
            ["phone", "Telefone"],
            ["origin", "Origem"],
            ["destination", "Destino"],
            ["status", "Status"],
            ["temperature", "Temperatura"],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
              <input
                value={values[field as keyof LeadFormValues]}
                onChange={(event) => onChange(field as keyof LeadFormValues, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </label>
          ))}
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Observações</span>
            <textarea
              rows={4}
              value={values.notes}
              onChange={(event) => onChange("notes", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            />
          </label>
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="rounded-full" onClick={onConfirm} disabled={saving}>
            {saving ? "Salvando..." : "Salvar lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type TripFormValues = {
  destination: string
  origin: string
  status: string
  startsAt: string
  endsAt: string
  summary: string
}

function buildTripFormValues(record?: TripRecord): TripFormValues {
  return {
    destination: record?.destination ?? "",
    origin: record?.origin ?? "",
    status: record?.stage ?? "Planejamento",
    startsAt: record?.starts_at ? record.starts_at.slice(0, 10) : "",
    endsAt: record?.ends_at ? record.ends_at.slice(0, 10) : "",
    summary: record?.summary ?? "",
  }
}

function TripEditorDialog({
  open,
  onOpenChange,
  values,
  onChange,
  onConfirm,
  saving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: TripFormValues
  onChange: (field: keyof TripFormValues, value: string) => void
  onConfirm: () => void
  saving: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>Editar viagem</DialogTitle>
          <DialogDescription>Atualize destino, datas, status e resumo da viagem com dados reais.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[62vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          {[
            ["destination", "Destino"],
            ["origin", "Origem"],
            ["status", "Status"],
            ["startsAt", "Data de início"],
            ["endsAt", "Data de fim"],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
              <input
                value={values[field as keyof TripFormValues]}
                onChange={(event) => onChange(field as keyof TripFormValues, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </label>
          ))}
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Resumo operacional</span>
            <textarea
              rows={4}
              value={values.summary}
              onChange={(event) => onChange("summary", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            />
          </label>
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="rounded-full" onClick={onConfirm} disabled={saving}>
            {saving ? "Salvando..." : "Salvar viagem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AgencyDashboardPage() {
  const [dashboard, setDashboard] = useState<AgencyDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await requestJson<AgencyDashboardData>("/api/dashboard/agency")
        if (!active) return
        setDashboard(data)
      } catch (error) {
        if (!active) return
        if (process.env.NODE_ENV !== "production") {
          console.error("[AgencyDashboardPage] failed to load dashboard", error)
        }
        setDashboard(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o dashboard da agencia.")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const metricIconMap = [Users, Waypoints, PlaneTakeoff, FileText, Wallet, CalendarClock]

  const feedIconForHref = (href: string) => {
    if (href.includes("/clientes")) return UserRoundPlus
    if (href.includes("/leads")) return Waypoints
    if (href.includes("/viagens")) return PlaneTakeoff
    if (href.includes("/documentos")) return FilePenLine
    return HandCoins
  }

  const quickActions = [
    { title: "Novo cliente", href: "/app/clientes/novo", icon: UserRoundPlus, description: "Cadastrar contato e abrir relacionamento." },
    { title: "Novo lead", href: "/app/leads/novo", icon: Waypoints, description: "Adicionar lead novo ao funil comercial." },
    { title: "Nova viagem", href: "/app/viagens/nova", icon: PlaneTakeoff, description: "Abrir jornada operacional com dados reais." },
    { title: "Novo documento", href: "/app/documentos/novo", icon: FilePenLine, description: "Criar documento real vinculado a cliente ou viagem." },
    { title: "Novo lançamento", href: "/app/financeiro/novo", icon: HandCoins, description: "Registrar receita ou despesa no financeiro real." },
    { title: "Ver clientes", href: "/app/clientes", icon: Users, description: "Abrir a base real de clientes da agência." },
    { title: "Ver leads", href: "/app/leads", icon: Target, description: "Acompanhar o pipeline comercial em tempo real." },
    { title: "Ver viagens", href: "/app/viagens", icon: Route, description: "Consultar viagens ativas e próximos embarques." },
    { title: "Ver documentos", href: "/app/documentos", icon: FileText, description: "Acompanhar contratos, vouchers e pendências." },
    { title: "Ver financeiro", href: "/app/financeiro", icon: Wallet, description: "Consultar saldo, receitas e despesas reais." },
  ]

  return (
    <PageShell>
      <SectionHeader
        title="Operação ativa"
        description="Resumo vivo da agência com prioridade comercial, entrega, caixa e automação trabalhando em segundo plano."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/viagens/nova">Nova viagem</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/central-operacional">Abrir central</Link>
            </Button>
          </div>
        }
      />

      <DashboardCard
        title="Resumo operacional inteligente"
        description="O que o sistema está vendo agora sem transformar seu dia em um cockpit barulhento."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={`dashboard-summary-skeleton-${index}`} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5 animate-pulse">
                  <div className="h-3 w-24 rounded-full bg-white/10" />
                  <div className="mt-3 h-4 w-28 rounded-full bg-white/10" />
                  <div className="mt-2 h-3 w-32 rounded-full bg-white/10" />
                </div>
              ))
            : (dashboard?.summary_cards ?? []).map((item) => (
            <div key={item.label} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary/70">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      {loadError ? (
        <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar o dashboard agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={`dashboard-metric-skeleton-${index}`} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 animate-pulse">
                <div className="h-4 w-28 rounded-full bg-white/10" />
                <div className="mt-4 h-6 w-36 rounded-full bg-white/10" />
                <div className="mt-3 h-4 w-40 rounded-full bg-white/10" />
              </div>
            ))
          : (dashboard?.metrics ?? []).map((metric, index) => {
              const Icon = metricIconMap[index] ?? Sparkles
              return <MetricCard key={metric.label} label={metric.label} value={metric.value} change={metric.change} tone={metric.tone} icon={Icon} />
            })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <DashboardCard title="Financeiro vivo" description="Receitas, despesas, saldo e registros recentes com base real do Supabase.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`dashboard-finance-skeleton-${index}`} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 animate-pulse">
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                  <div className="mt-3 h-4 w-40 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Receitas" value={formatMoney(dashboard?.finance_snapshot.total_revenue ?? 0)} />
                <InfoCard label="Despesas" value={formatMoney(dashboard?.finance_snapshot.total_expenses ?? 0)} />
                <InfoCard label="Saldo" value={formatMoney(dashboard?.finance_snapshot.balance ?? 0)} />
                <InfoCard label="A receber" value={formatMoney(dashboard?.finance_snapshot.pending_revenue ?? 0)} />
              </div>
              <div className="mt-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-foreground">Leitura do momento</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{dashboard?.finance_snapshot.note || "Ainda não há dados financeiros suficientes para leitura."}</p>
              </div>
              <div className="mt-4 space-y-3">
                {(dashboard?.finance_snapshot.recent_records ?? []).length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                    Nenhum lançamento financeiro ainda. Use o CTA de novo lançamento para alimentar o dashboard.
                  </div>
                ) : (
                  (dashboard?.finance_snapshot.recent_records ?? []).map((record) => (
                    <div key={record.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{record.category || record.type}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{record.description || "Sem descrição complementar"} • {formatDateLabel(record.occurred_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{formatMoney(Number(record.amount || 0))}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{record.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </DashboardCard>

        <div className="space-y-6">
          <DashboardCard title="Sistema Vivo TravelPro" description="Pequeno retrato do que está trabalhando por trás da operação.">
            <div className="space-y-3">
              {(dashboard?.system_items ?? []).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.action === "future") {
                      fire("Em breve", item.detail)
                    }
                  }}
                  className="flex w-full items-start gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left"
                >
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full ${item.tone}`} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                  </div>
                </button>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Saúde operacional" description="Indicador discreto baseado em leads, financeiro, follow-up e documentação.">
            <div className={`rounded-[24px] p-4 ${dashboard?.health.tone === "success" ? "border border-emerald-400/15 bg-emerald-400/10" : "border border-amber-400/20 bg-amber-400/10"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.18em] ${dashboard?.health.tone === "success" ? "text-emerald-200/80" : "text-amber-100/80"}`}>{dashboard?.health.label || "Em análise"}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{dashboard?.health.title || "Carregando saúde operacional"}</p>
                </div>
                <div className={`h-3 w-3 animate-pulse rounded-full ${dashboard?.health.tone === "success" ? "bg-emerald-300" : "bg-amber-300"}`} />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {dashboard?.health.description || "Lendo sinais reais da operação."}
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        <DashboardCard title="Atividade operacional" description="Fluxo recente da agência com leitura limpa e contextual.">
          <div className="space-y-3">
            {(dashboard?.operational_feed ?? []).length === 0 && !isLoading ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                Ainda não há eventos reais recentes. Crie clientes, leads, viagens, documentos ou lançamentos para alimentar este feed.
              </div>
            ) : null}
            {(dashboard?.operational_feed ?? []).map((item, index) => {
              const Icon = feedIconForHref(item.href)
              const stableKey = item.id || `${item.href}-${item.time}-${item.title}-${index}`
              return (
              <div key={stableKey} className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <StatusPill label={item.time} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            )})}
          </div>
        </DashboardCard>

        <DashboardCard title="Hoje na operação" description="Prioridades que merecem sua atenção antes do próximo ciclo do dia.">
          <div className="space-y-3">
            {(dashboard?.priorities ?? []).map((item, index) => (
              <Link key={item.id || `${item.href}-${item.label}-${item.value}-${index}`} href={item.href} className="block rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 transition-all hover:border-primary/15 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <span className="text-sm font-semibold text-primary">{item.value}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p>
              </Link>
            ))}
            <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/central-operacional">Abrir central operacional</Link>
            </Button>
          </div>
        </DashboardCard>

        <div className="space-y-6">
          <DashboardCard title="TravelPro Go" description="Presença viva do assessor operacional dentro da rotina da agência.">
            <div className="space-y-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary/70">Status operacional</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
                  <p className="text-sm font-semibold text-foreground">Em breve na leitura real do dashboard</p>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary/70">Ações hoje</p>
                <p className="mt-2 text-sm font-semibold text-foreground">Integração futura com WhatsApp</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">O painel já reserva o espaço, mas ainda não lê execuções reais do GO sem a integração de WhatsApp.</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-full" onClick={() => fire("TravelPro Go em breve", "O GO ainda não está conectado ao dashboard real porque a integração de WhatsApp permanece fora deste escopo.")}>
                  Abrir GO
                </Button>
                <Button variant="outline" className="flex-1 rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico em breve", "O histórico do TravelPro Go será liberado quando a integração de WhatsApp entrar na fase correspondente.")}>
                  Ver histórico
                </Button>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Advisor recomenda" description="Sugestões discretas com maior impacto operacional e comercial.">
            <div className="space-y-3">
            {(dashboard?.advisor_recommendations ?? []).map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Match e Marketing IA" description="Oportunidades detectadas e campanhas prontas para aproveitar a demanda.">
            <div className="space-y-3">
              <button type="button" onClick={() => fire("Match em breve", "O Match ainda não está integrado a dados reais neste dashboard.")} className="w-full rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left">
                <p className="text-sm font-medium text-foreground">Match em alta</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  O conceito visual foi mantido, mas a integração real do Match continua como próxima etapa.
                </p>
              </button>
              <button type="button" onClick={() => fire("Marketing IA em breve", "O Marketing IA ainda não está integrado a dados reais neste dashboard.")} className="w-full rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left">
                <p className="text-sm font-medium text-foreground">Marketing IA</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  O painel já sinaliza o espaço do módulo, mas sem inventar dados enquanto a integração real não existe.
                </p>
              </button>
              <Button className="w-full rounded-full" onClick={() => fire("Campanhas em breve", "A geração de campanhas por Marketing IA ainda será integrada fora deste escopo.")}>Gerar campanha</Button>
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Ações rápidas" description="Atalhos para mover a operação sem perder contexto.">
          <div className="grid gap-3 md:grid-cols-2">
            {quickActions.map((item) => (
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

        <DashboardCard title="Operação resumida" description="Leitura curta e contextual do que mais pesa na agência neste momento.">
          <div className="space-y-3">
            {(dashboard?.operation_notes ?? []).map((item) => (
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
  const [tripRows, setTripRows] = useState<TripRow[]>([])
  const [documentRows, setDocumentRows] = useState<DocumentRow[]>([])
  const [financialRows, setFinancialRows] = useState<FinancialRecordRow[]>([])
  const [selected, setSelected] = useState<ClientRecord | null>(null)
  const [activeFilter, setActiveFilter] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [editorValues, setEditorValues] = useState<ClientFormValues>(buildClientFormValues())
  const [isSavingClient, setIsSavingClient] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadClientModule = async () => {
      setIsLoading(true)
      setLoadError(null)

      const [clientsResult, tripsResult, documentsResult, financeResult] = await Promise.allSettled([
        requestJson<ClientRow[]>("/api/clients"),
        requestJson<TripRow[]>("/api/trips"),
        requestJson<DocumentRow[]>("/api/documents"),
        requestJson<FinancialRecordRow[]>("/api/financial-records"),
      ])

      if (!active) return

      if (clientsResult.status === "fulfilled") {
        setRecords(clientsResult.value.map(mapClientRowToRecord))
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error("[AgencyClientsPage] failed to load clients", clientsResult.reason)
        }
        setRecords([])
        setLoadError(clientsResult.reason instanceof Error ? clientsResult.reason.message : "Não foi possível carregar os clientes da agência.")
      }

      setTripRows(tripsResult.status === "fulfilled" ? tripsResult.value : [])
      setDocumentRows(documentsResult.status === "fulfilled" ? documentsResult.value : [])
      setFinancialRows(financeResult.status === "fulfilled" ? financeResult.value : [])
      setIsLoading(false)
    }

    void loadClientModule()

    return () => {
      active = false
    }
  }, [])

  const linkedTripsByClient = useMemo(() => {
    const map = new Map<string, TripRow[]>()
    tripRows.forEach((trip) => {
      if (!trip.client_id) return
      const current = map.get(trip.client_id) ?? []
      current.push(trip)
      map.set(trip.client_id, current)
    })
    return map
  }, [tripRows])

  const linkedDocumentsByClient = useMemo(() => {
    const map = new Map<string, DocumentRow[]>()
    documentRows.forEach((document) => {
      if (!document.client_id) return
      const current = map.get(document.client_id) ?? []
      current.push(document)
      map.set(document.client_id, current)
    })
    return map
  }, [documentRows])

  const linkedFinanceByClient = useMemo(() => {
    const map = new Map<string, FinancialRecordRow[]>()
    financialRows.forEach((record) => {
      if (!record.client_id) return
      const current = map.get(record.client_id) ?? []
      current.push(record)
      map.set(record.client_id, current)
    })
    return map
  }, [financialRows])

  const visibleClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return records.filter((client) => {
      const matchesFilter =
        activeFilter === "Todos"
          ? true
          : activeFilter === "Em viagem"
            ? client.status === "Em viagem" || (linkedTripsByClient.get(client.id)?.length ?? 0) > 0
            : client.tag === activeFilter

      if (!matchesFilter) return false
      if (!query) return true

      return [
        client.name,
        client.email,
        client.phone,
        client.destination,
        client.tag,
        client.document_number ?? "",
        client.origin,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [activeFilter, linkedTripsByClient, records, searchTerm])

  const metrics = useMemo(() => {
    const activeClients = records.length
    const travellingClients = records.filter((client) => client.status === "Em viagem" || (linkedTripsByClient.get(client.id)?.length ?? 0) > 0).length
    const withDocuments = records.filter((client) => (linkedDocumentsByClient.get(client.id)?.length ?? 0) > 0).length

    return [
      {
        label: "Clientes ativos",
        value: activeClients.toString().padStart(2, "0"),
        change: `${records.filter((client) => client.status === "Ativo").length} em acompanhamento contínuo`,
        icon: Users,
      },
      {
        label: "Em viagem",
        value: travellingClients.toString().padStart(2, "0"),
        change: `${tripRows.length} jornadas vinculadas à operação`,
        icon: PlaneTakeoff,
      },
      {
        label: "Documentação",
        value: withDocuments.toString().padStart(2, "0"),
        change: `${documentRows.length} documentos conectados ao módulo`,
        icon: FileBadge,
      },
    ]
  }, [documentRows.length, linkedDocumentsByClient, linkedTripsByClient, records, tripRows.length])

  const selectedTrips = selected ? linkedTripsByClient.get(selected.id) ?? [] : []
  const selectedDocuments = selected ? linkedDocumentsByClient.get(selected.id) ?? [] : []
  const selectedFinance = selected ? linkedFinanceByClient.get(selected.id) ?? [] : []

  const openClientEditor = (record: ClientRecord) => {
    setEditingClientId(record.id)
    setEditorValues(buildClientFormValues(record))
  }

  const handleSaveClient = async () => {
    try {
      setIsSavingClient(true)
      const payload = buildClientPayload(editorValues)
      if (!payload.name.trim()) {
        fire("Nome obrigatório", "Informe o nome do cliente antes de salvar.")
        return
      }

      if (editingClientId && editingClientId !== "new") {
        const updated = await requestJson<ClientRow>(`/api/clients/${editingClientId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        const mapped = mapClientRowToRecord(updated)
        setRecords((current) => current.map((item) => (item.id === editingClientId ? mapped : item)))
        setSelected((current) => (current?.id === editingClientId ? mapped : current))
        fire("Cliente atualizado", `${mapped.name} foi atualizado com dados reais do Supabase.`)
      } else {
        const created = await requestJson<ClientRow>("/api/clients", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        const mapped = mapClientRowToRecord(created)
        setRecords((current) => [mapped, ...current])
        fire("Cliente criado", `${mapped.name} foi salvo com sucesso.`)
      }
      setEditingClientId(null)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyClientsPage] failed to save client", error)
      }
      fire("Falha ao salvar", error instanceof Error ? error.message : "Não foi possível salvar o cliente.")
    } finally {
      setIsSavingClient(false)
    }
  }

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
      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar cliente, destino ou origem" value={searchTerm} onChange={setSearchTerm} />
        </div>
        <FilterTabs items={["Todos", "Premium", "Em viagem", "Família", "Lua de mel"]} activeItem={activeFilter} onChange={setActiveFilter} />
      </div>

      <DashboardCard title="Clientes da agência" description="Cada cliente abre um detalhe completo com histórico, financeiro e mensagens internas.">
        <div className="space-y-3">
          {loadError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Não foi possível sincronizar os clientes agora.</p>
                <p className="mt-1 text-amber-100/80">{loadError}</p>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`client-skeleton-${index}`} className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="h-4 w-40 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-60 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-36 rounded-full bg-white/10" />
              </div>
            ))
          ) : visibleClients.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum cliente encontrado.</p>
              <p className="mt-2 text-sm text-muted-foreground">Ajuste a busca, revise os filtros ou cadastre o primeiro cliente real da agência.</p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/app/clientes/novo">Criar cliente agora</Link>
              </Button>
            </div>
          ) : (
            visibleClients.map((client) => (
              <div key={client.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <button type="button" onClick={() => setSelected(client)} className="min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{client.name}</p>
                    <StatusPill label={client.status} />
                    <StatusPill label={client.tag} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{client.email} • {client.phone}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Destino em foco: {client.destination} • Próximo passo: {client.nextStep}
                  </p>
                </button>
                <ActionMenu
                  items={[
                    { label: "Visualizar", icon: Eye, onClick: () => setSelected(client) },
                    { label: "Editar", icon: FilePenLine, onClick: () => openClientEditor(client) },
                    {
                      label: "Notificar",
                      icon: BellRing,
                      onClick: () =>
                        fire("Notificações em preparação", `As notificações para ${client.name} serão ativadas com TravelPro Go e WhatsApp operacional.`),
                    },
                    {
                      label: "Excluir",
                      icon: Trash2,
                      onClick: () =>
                        setConfirmAction({
                          title: "Excluir cliente",
                          description: `Deseja confirmar a exclusão de ${client.name}? Esta ação remove o registro real da sua base.`,
                          confirmLabel: "Excluir cliente",
                          onConfirm: async () => {
                            try {
                              await requestJson(`/api/clients/${client.id}`, { method: "DELETE" })
                              setRecords((current) => current.filter((item) => item.id !== client.id))
                              setSelected((current) => (current?.id === client.id ? null : current))
                              fire("Cliente excluído", `${client.name} foi removido com sucesso.`)
                            } catch (error) {
                              if (process.env.NODE_ENV !== "production") {
                                console.error("[AgencyClientsPage] failed to delete client", error)
                              }
                              fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir o cliente.")
                            }
                          },
                        }),
                      danger: true,
                    },
                  ]}
                />
              </div>
            ))
          )}
        </div>
      </DashboardCard>

      <ClientEditorDialog
        open={Boolean(editingClientId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingClientId(null)
            setEditorValues(buildClientFormValues())
          }
        }}
        mode="edit"
        values={editorValues}
        onChange={(field, value) => setEditorValues((current) => ({ ...current, [field]: value }))}
        onConfirm={handleSaveClient}
        saving={isSavingClient}
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
                    <InfoCard label="Documento" value={selected.document_number ?? "Documento não informado"} />
                    <InfoCard label="Tag" value={selected.tag} />
                    <InfoCard label="Status" value={selected.status} />
                    <InfoCard label="Destino atual" value={selected.destination} />
                    <InfoCard label="Origem" value={selected.origin} />
                    <InfoCard label="Próximo passo" value={selected.nextStep} />
                    <InfoCard label="Acompanhantes" value={selected.companions} />
                    <InfoCard label="Observações" value={selected.notes} />
                  </TabsContent>
                  <TabsContent value="viagens" className="space-y-3">
                    {selectedTrips.length ? (
                      selectedTrips.map((trip) => (
                        <div key={trip.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                          {trip.title} • {trip.status} • {trip.starts_at?.slice(0, 10) ?? "Data a definir"} {trip.ends_at ? `- ${trip.ends_at.slice(0, 10)}` : ""}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
                        Nenhuma viagem vinculada a este cliente até o momento.
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="financeiro" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard
                      label="Último lançamento"
                      value={
                        selectedFinance[0]
                          ? `${formatMoney(selectedFinance[0].amount)} • ${selectedFinance[0].status}`
                          : "Sem lançamentos"
                      }
                    />
                    <InfoCard
                      label="Situação"
                      value={selectedFinance.some((item) => item.status.toLowerCase().includes("pend")) ? "Atenção" : "Saudável"}
                    />
                    <InfoCard label="Total do histórico" value={formatMoney(selectedFinance.reduce((sum, item) => sum + item.amount, 0))} />
                    <InfoCard label="Receitas" value={selectedFinance.filter((item) => item.type === "Receita").length.toString()} />
                    <InfoCard label="Despesas" value={selectedFinance.filter((item) => item.type === "Despesa").length.toString()} />
                    <InfoCard label="Categorias" value={selectedFinance.map((item) => item.category).filter(Boolean).slice(0, 2).join(", ") || "Não informado"} />
                  </TabsContent>
                  <TabsContent value="documentos" className="space-y-3">
                    {selectedDocuments.length ? (
                      selectedDocuments.map((doc, index) => {
                        const mapped = mapDocumentRowToRecord(doc, index)
                        return (
                          <div key={mapped.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-foreground">{mapped.name}</p>
                              <StatusPill label={mapped.status} />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{mapped.preview}</p>
                          </div>
                        )
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
                        Ainda não há documentos vinculados a este cliente.
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="mensagens">
                    <InternalMessages
                      initialMessages={[
                        {
                          id: "mc-1",
                          sender: "client",
                          text: `${selected.name.split(" ")[0]} pediu atualização sobre ${selected.destination.toLowerCase()}.`,
                          time: "09:12",
                        },
                        {
                          id: "mc-2",
                          sender: "agency",
                          text: `Próximo passo registrado: ${selected.nextStep}. Já deixamos o contexto salvo no perfil do cliente.`,
                          time: "09:18",
                          status: "Enviado",
                        },
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
                        <p className="mt-2 text-sm text-muted-foreground">Sugestão gerada a partir do histórico salvo, preferências declaradas e estágio atual da operação.</p>
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
  const [clients, setClients] = useState<ClientRow[]>([])
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [editingTripId, setEditingTripId] = useState<string | null>(null)
  const [tripFormValues, setTripFormValues] = useState<TripFormValues>(buildTripFormValues())
  const [shareLinks, setShareLinks] = useState<Record<string, TripShareLinkSummary>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingTrip, setIsSavingTrip] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadTripsModule = async () => {
      setIsLoading(true)
      setLoadError(null)

      const [tripsResult, clientsResult] = await Promise.allSettled([
        requestJson<TripRow[]>("/api/trips"),
        requestJson<ClientRow[]>("/api/clients"),
      ])

      if (!active) return

      if (clientsResult.status === "fulfilled") {
        setClients(clientsResult.value)
      } else {
        setClients([])
      }

      if (tripsResult.status === "fulfilled") {
        const clientMap = new Map((clientsResult.status === "fulfilled" ? clientsResult.value : []).map((client) => [client.id, client.name]))
        setRecords(tripsResult.value.map((trip, index) => ({ ...mapTripRowToRecord(trip, index), client: trip.client_id ? clientMap.get(trip.client_id) ?? "Cliente vinculado" : "Sem cliente vinculado" })))
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error("[AgencyTripsPage] failed to load trips", tripsResult.reason)
        }
        setRecords([])
        setLoadError(tripsResult.reason instanceof Error ? tripsResult.reason.message : "Não foi possível carregar as viagens da agência.")
      }

      setIsLoading(false)
    }

    void loadTripsModule()

    return () => {
      active = false
    }
  }, [])

  const visibleTrips = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return records.filter((trip) => {
      if (!query) return true
      return [trip.client, trip.destination, trip.stage, trip.origin ?? "", trip.summary ?? ""].join(" ").toLowerCase().includes(query)
    })
  }, [records, searchTerm])

  const tripMetrics = useMemo(
    () => [
      { label: "Viagens ativas", value: records.length.toString().padStart(2, "0"), change: `${records.filter((trip) => trip.stage === "Em andamento").length} em andamento agora`, icon: PlaneTakeoff },
      { label: "Com cliente", value: records.filter((trip) => trip.client_id).length.toString().padStart(2, "0"), change: `${records.filter((trip) => trip.client_id).length} com vínculo real em clientes`, icon: Users },
      { label: "Planejamento", value: records.filter((trip) => trip.stage === "Planejamento").length.toString().padStart(2, "0"), change: `${records.filter((trip) => trip.stage === "Confirmada").length} já confirmadas`, icon: Route },
    ],
    [records],
  )

  const openTripEditor = (trip: TripRecord) => {
    setEditingTripId(trip.id)
    setTripFormValues(buildTripFormValues(trip))
  }

  const buildAbsoluteShareUrl = (publicUrl: string) => {
    if (typeof window === "undefined") return publicUrl
    if (/^https?:\/\//i.test(publicUrl)) return publicUrl
    return new URL(publicUrl, window.location.origin).toString()
  }

  const requestTripShareLink = async (tripId: string) => {
    const link = await requestJson<TripShareLinkSummary>(`/api/trips/${tripId}/share-link`, { method: "POST" })
    setShareLinks((current) => ({ ...current, [tripId]: link }))
    return link
  }

  const copyTripShareLink = async (trip: TripRecord) => {
    try {
      const link = shareLinks[trip.id] && shareLinks[trip.id].is_active ? shareLinks[trip.id] : await requestTripShareLink(trip.id)
      const targetUrl = buildAbsoluteShareUrl(link.public_url)
      await navigator.clipboard.writeText(targetUrl)
      fire("Link copiado", `O link compartilhável de ${trip.destination} foi copiado com sucesso.`)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyTripsPage] failed to copy share link", error)
      }
      fire("Falha ao copiar", error instanceof Error ? error.message : "Não foi possível copiar o link compartilhável.")
    }
  }

  const openTripShareLink = async (trip: TripRecord) => {
    try {
      const link = shareLinks[trip.id] && shareLinks[trip.id].is_active ? shareLinks[trip.id] : await requestTripShareLink(trip.id)
      window.open(buildAbsoluteShareUrl(link.public_url), "_blank", "noopener,noreferrer")
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyTripsPage] failed to open share link", error)
      }
      fire("Falha ao abrir", error instanceof Error ? error.message : "Não foi possível abrir a experiência compartilhável.")
    }
  }

  const deactivateTripShareLink = async (trip: TripRecord) => {
    try {
      const currentLink = shareLinks[trip.id] ?? (await requestJson<TripShareLinkSummary>(`/api/trips/${trip.id}/share-link`))
      if (!currentLink?.is_active) {
        fire("Link já inativo", `A viagem para ${trip.destination} já está com o compartilhamento desativado.`)
        return
      }

      const updated = await requestJson<TripShareLinkSummary>(`/api/trips/${trip.id}/share-link`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: false }),
      })
      setShareLinks((current) => ({ ...current, [trip.id]: updated }))
      fire("Compartilhamento desativado", `O link público de ${trip.destination} foi desativado com segurança.`)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyTripsPage] failed to deactivate share link", error)
      }
      fire("Falha ao desativar", error instanceof Error ? error.message : "Não foi possível desativar o link compartilhável.")
    }
  }

  const handleSaveTrip = async () => {
    if (!editingTripId) return
    try {
      setIsSavingTrip(true)
      const updated = await requestJson<TripRow>(`/api/trips/${editingTripId}`, {
        method: "PATCH",
        body: JSON.stringify({
          destination: tripFormValues.destination,
          origin: tripFormValues.origin || null,
          status: tripFormValues.status,
          starts_at: tripFormValues.startsAt ? new Date(tripFormValues.startsAt).toISOString() : null,
          ends_at: tripFormValues.endsAt ? new Date(tripFormValues.endsAt).toISOString() : null,
          summary: tripFormValues.summary || null,
        }),
      })
      const clientMap = new Map(clients.map((client) => [client.id, client.name]))
      const mapped = { ...mapTripRowToRecord(updated, records.findIndex((item) => item.id === editingTripId)), client: updated.client_id ? clientMap.get(updated.client_id) ?? "Cliente vinculado" : "Sem cliente vinculado" }
      setRecords((current) => current.map((item) => (item.id === editingTripId ? mapped : item)))
      setSelected((current) => (current?.id === editingTripId ? mapped : current))
      fire("Viagem atualizada", `${mapped.destination} foi atualizada com dados reais.`)
      setEditingTripId(null)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyTripsPage] failed to save trip", error)
      }
      fire("Falha ao salvar", error instanceof Error ? error.message : "Não foi possível salvar a viagem.")
    } finally {
      setIsSavingTrip(false)
    }
  }

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
      <div className="grid gap-3 md:grid-cols-3">
        {tripMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="xl:max-w-md xl:flex-1">
        <SearchInput placeholder="Buscar cliente, destino ou status" value={searchTerm} onChange={setSearchTerm} />
      </div>
      <DashboardCard title="Viagens da operação" description="Abra cada viagem para ver roteiro ao vivo, pendências, documentos e financeiro.">
        <div className="space-y-3">
          {loadError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Não foi possível sincronizar as viagens agora.</p>
                <p className="mt-1 text-amber-100/80">{loadError}</p>
              </div>
            </div>
          ) : null}
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`trip-skeleton-${index}`} className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="h-4 w-44 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-60 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-40 rounded-full bg-white/10" />
              </div>
            ))
          ) : visibleTrips.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhuma viagem encontrada.</p>
              <p className="mt-2 text-sm text-muted-foreground">Crie a primeira viagem real da agência para iniciar roteiros, documentos e operação.</p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/app/viagens/nova">Criar viagem agora</Link>
              </Button>
            </div>
          ) : (
            visibleTrips.map((trip) => (
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
                    { label: "Editar", icon: FilePenLine, onClick: () => openTripEditor(trip) },
                    {
                      label: "Compartilhar viagem",
                      icon: ExternalLink,
                      onClick: async () => {
                        try {
                          const link = await requestTripShareLink(trip.id)
                          fire("Link gerado", `A experiência compartilhável de ${trip.destination} já está pronta em ${buildAbsoluteShareUrl(link.public_url)}.`)
                        } catch (error) {
                          if (process.env.NODE_ENV !== "production") {
                            console.error("[AgencyTripsPage] failed to create share link", error)
                          }
                          fire("Falha ao compartilhar", error instanceof Error ? error.message : "Não foi possível gerar o link compartilhável.")
                        }
                      },
                    },
                    { label: "Copiar link", icon: Copy, onClick: () => void copyTripShareLink(trip) },
                    { label: "Abrir link", icon: ExternalLink, onClick: () => void openTripShareLink(trip) },
                    { label: "Desativar link", icon: BellRing, onClick: () => void deactivateTripShareLink(trip) },
                    { label: "Notificar cliente", icon: BellRing, onClick: () => fire("Notificações em preparação", `As notificações da viagem de ${trip.client} serão ativadas com TravelPro Go e WhatsApp operacional.`) },
                    {
                      label: "Abrir cliente vinculado",
                      icon: Users,
                      onClick: () =>
                        trip.client_id ? fire("Cliente vinculado", `${trip.client} já está conectado ao módulo real de clientes.`) : fire("Sem cliente vinculado", "Esta viagem ainda não possui um cliente vinculado."),
                    },
                    { label: "Ver roteiro", icon: Route, onClick: () => fire("Roteiros em preparação", `O fluxo de roteiros reais desta viagem será conectado à próxima etapa do módulo.`) },
                    { label: "Ver documento", icon: FileText, onClick: () => fire("Documentos em preparação", `Os documentos reais da viagem de ${trip.client} serão exibidos quando o vínculo documental estiver completo.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir viagem",
                        description: `Deseja confirmar a exclusão da viagem de ${trip.client} para ${trip.destination}?`,
                        confirmLabel: "Excluir viagem",
                        onConfirm: async () => {
                          try {
                            await requestJson(`/api/trips/${trip.id}`, { method: "DELETE" })
                            setRecords((current) => current.filter((item) => item.id !== trip.id))
                            setSelected((current) => (current?.id === trip.id ? null : current))
                            fire("Viagem excluída", `A viagem de ${trip.client} foi removida do Supabase.`)
                          } catch (error) {
                            if (process.env.NODE_ENV !== "production") {
                              console.error("[AgencyTripsPage] failed to delete trip", error)
                            }
                            fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir a viagem.")
                          }
                        },
                      }),
                    danger: true,
                  },
                ]}
                />
              </div>
            ))
          )}
        </div>
      </DashboardCard>

      <TripEditorDialog
        open={Boolean(editingTripId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTripId(null)
            setTripFormValues(buildTripFormValues())
          }
        }}
        values={tripFormValues}
        onChange={(field, value) => setTripFormValues((current) => ({ ...current, [field]: value }))}
        onConfirm={handleSaveTrip}
        saving={isSavingTrip}
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

function DocumentHub({
  title,
  description,
  createLabel,
  typeFilter,
  createHref = "/app/documentos/novo",
  editHref,
  mode = "document",
}: {
  title: string
  description: string
  createLabel: string
  typeFilter?: string | null
  createHref?: string
  editHref?: (record: DocumentRecord) => string
  mode?: "document" | "roteiro" | "cotacao" | "template"
}) {
  const router = useRouter()
  const [documentRows, setDocumentRows] = useState<DocumentRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [trips, setTrips] = useState<TripRow[]>([])
  const [selected, setSelected] = useState<DocumentRecord | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("Todos")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fire = (titleText: string, body: string) => toast({ title: titleText, description: body })
  const filterType =
    typeFilter ??
    (title === "Contratos"
      ? "Contrato"
      : title === "Vouchers"
        ? "Voucher"
        : title === "Recibos"
          ? "Recibo"
          : title === "Passagens"
            ? "Passagem"
            : null)

  const downloadSummary = (record: DocumentRecord) => {
    const metadata = parseDocumentMetadata(record.metadata)
    const lines = [
      `${record.type}: ${record.name}`,
      `Status: ${record.status}`,
      `Cliente: ${record.client}`,
      `Viagem: ${record.trip}`,
      "",
      typeof metadata.variables === "string" && metadata.variables.trim() ? metadata.variables.trim() : record.preview,
      "",
      typeof metadata.attachments === "string" && metadata.attachments.trim() ? metadata.attachments.trim() : "Sem observacoes adicionais.",
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = href
    anchor.download = `${record.name.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "registro"}.txt`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  useEffect(() => {
    let active = true

    const loadDocumentsModule = async () => {
      setIsLoading(true)
      setLoadError(null)

      const [documentsResult, clientsResult, tripsResult] = await Promise.allSettled([
        requestJson<DocumentRow[]>("/api/documents"),
        requestJson<ClientRow[]>("/api/clients"),
        requestJson<TripRow[]>("/api/trips"),
      ])

      if (!active) return

      if (documentsResult.status === "fulfilled") {
        setDocumentRows(documentsResult.value)
      } else {
        setDocumentRows([])
        setLoadError(documentsResult.reason instanceof Error ? documentsResult.reason.message : "Nao foi possivel carregar os documentos da agencia.")
      }

      setClients(clientsResult.status === "fulfilled" ? clientsResult.value : [])
      setTrips(tripsResult.status === "fulfilled" ? tripsResult.value : [])
      setIsLoading(false)
    }

    void loadDocumentsModule()

    return () => {
      active = false
    }
  }, [])

  const clientsById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients])
  const tripsById = useMemo(() => new Map(trips.map((trip) => [trip.id, trip])), [trips])

  const mappedDocuments = useMemo(() => {
    return documentRows.map((row, index) => mapDocumentRowToRecord(row, index, { clientsById, tripsById }))
  }, [clientsById, documentRows, tripsById])

  const scopedDocuments = useMemo(() => {
    return mappedDocuments.filter((item) => matchesDocumentSection(item.type, mode, filterType))
  }, [filterType, mappedDocuments, mode])

  const availableFilters = useMemo(() => {
    const base = filterType ? ["Todos", filterType] : ["Todos"]
    const dynamic = Array.from(new Set(scopedDocuments.map((item) => item.type))).sort()
    return Array.from(new Set([...base, ...dynamic]))
  }, [filterType, scopedDocuments])

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return scopedDocuments.filter((document) => {
      if (filterType && document.type !== normalizeDocumentType(filterType)) return false
      if (activeFilter !== "Todos" && document.type !== activeFilter) return false

      if (!normalizedSearch) return true

      return [
        document.name,
        document.client,
        document.trip,
        document.type,
        document.status,
        document.preview,
        document.storage_path ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [activeFilter, filterType, scopedDocuments, searchTerm])

  const metrics = useMemo(() => {
    const readyCount = scopedDocuments.filter((item) => item.status.toLowerCase().includes("pronto") || item.status.toLowerCase().includes("enviado")).length
    const draftCount = scopedDocuments.filter((item) => item.status.toLowerCase().includes("rascunho")).length
    const linkedCount = scopedDocuments.filter((item) => item.client_id || item.trip_id).length

    return [
      { label: "Total", value: `${scopedDocuments.length}`, change: "Registros reais no Supabase", tone: "info" as const, icon: FileText },
      { label: "Prontos", value: `${readyCount}`, change: "Itens prontos ou enviados", tone: "success" as const, icon: CheckCheck },
      { label: "Rascunhos", value: `${draftCount}`, change: "Em elaboração", tone: "warning" as const, icon: Save },
      { label: "Vinculados", value: `${linkedCount}`, change: "Com cliente ou viagem", tone: "success" as const, icon: Route },
    ]
  }, [scopedDocuments])

  return (
    <PageShell>
      <SectionHeader
        title={title}
        description={description}
        actions={
          <Button asChild className="rounded-full">
            <Link href={createHref}>{createLabel}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar documento, cliente, viagem ou status" value={searchTerm} onChange={setSearchTerm} />
        </div>
        <FilterTabs items={availableFilters} activeItem={activeFilter} onChange={setActiveFilter} />
      </div>

      <DashboardCard title="Documentos da operacao" description="Visualize, edite, exclua e acompanhe documentos reais da agencia.">
        <div className="space-y-3">
          {loadError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Nao foi possivel sincronizar os documentos agora.</p>
                <p className="mt-1 text-amber-100/80">{loadError}</p>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`document-skeleton-${index}`} className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="h-4 w-44 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-64 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-40 rounded-full bg-white/10" />
              </div>
            ))
          ) : filteredDocuments.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum documento encontrado.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "roteiro"
                  ? "Crie o primeiro roteiro real da agência para começar a operação manual."
                  : mode === "cotacao"
                    ? "Crie a primeira cotação real da agência para acompanhar proposta, status e histórico."
                    : mode === "template"
                      ? "Crie o primeiro template operacional da agência para reutilizar em documentos e roteiros."
                      : "Crie o primeiro documento real da agencia ou ajuste a busca e os filtros atuais."}
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href={createHref}>{createLabel}</Link>
              </Button>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <button type="button" onClick={() => setSelected(doc)} className="min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <StatusPill label={doc.status} />
                    <StatusPill label={doc.type} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{doc.client} • {doc.trip}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Atualizado em {formatDateLabel(doc.updated_at)} • {doc.storage_path || "Sem arquivo vinculado"}</p>
                </button>
                <ActionMenu
                  items={[
                    { label: "Visualizar", icon: Eye, onClick: () => setSelected(doc) },
                    { label: "Editar", icon: FilePenLine, onClick: () => router.push(editHref ? editHref(doc) : `/app/documentos/novo?id=${doc.id}`) },
                    ...(mode === "template"
                      ? [
                          {
                            label: doc.status === "Ativo" ? "Desativar" : "Ativar",
                            icon: ArrowRightLeft,
                            onClick: async () => {
                              try {
                                const updated = await requestJson<DocumentRow>(`/api/documents/${doc.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ status: doc.status === "Ativo" ? "Inativo" : "Ativo" }),
                                })
                                setDocumentRows((current) => current.map((item) => (item.id === doc.id ? updated : item)))
                                fire("Template atualizado", `${doc.name} foi ${doc.status === "Ativo" ? "desativado" : "ativado"} com sucesso.`)
                              } catch (error) {
                                fire("Falha ao atualizar", error instanceof Error ? error.message : "Nao foi possivel atualizar o template.")
                              }
                            },
                          },
                          {
                            label: "Usar como base",
                            icon: Copy,
                            onClick: () => router.push(`/app/documentos/novo?template=${encodeURIComponent(doc.name)}`),
                          },
                        ]
                      : mode === "roteiro"
                        ? [
                            { label: "Baixar resumo", icon: Download, onClick: () => downloadSummary(doc) },
                            { label: "Enviar para cliente", icon: Send, onClick: () => fire("Envio em breve", "O envio automatizado do roteiro será conectado em uma próxima etapa.") },
                          ]
                        : mode === "cotacao"
                          ? [
                              { label: "Baixar proposta simples", icon: Download, onClick: () => downloadSummary(doc) },
                              { label: "Registrar follow-up", icon: BellRing, onClick: () => fire("Follow-up registrado", `A cotação ${doc.name} já pode seguir para a rotina comercial da agência.`) },
                            ]
                          : [
                              { label: "Gerar com IA", icon: Sparkles, onClick: () => fire("IA em breve", "A geracao automatica com IA ainda sera conectada ao modulo de documentos.") },
                              { label: "Usar template", icon: Copy, onClick: () => fire("Templates em breve", "O uso guiado de templates ainda sera conectado ao modulo de documentos.") },
                              { label: "Enviar documento", icon: Send, onClick: () => fire("Envio em breve", "O envio automatizado de documentos ainda sera conectado a este modulo.") },
                            ]),
                    {
                      label: "Excluir",
                      icon: Trash2,
                      onClick: () =>
                        setConfirmAction({
                          title: mode === "roteiro" ? "Excluir roteiro" : mode === "cotacao" ? "Excluir cotação" : mode === "template" ? "Excluir template" : "Excluir documento",
                          description: `Deseja confirmar a exclusao de ${doc.name}? Esta acao remove o registro real do Supabase.`,
                          confirmLabel: mode === "roteiro" ? "Excluir roteiro" : mode === "cotacao" ? "Excluir cotação" : mode === "template" ? "Excluir template" : "Excluir documento",
                          onConfirm: async () => {
                            try {
                              await requestJson(`/api/documents/${doc.id}`, { method: "DELETE" })
                              setDocumentRows((current) => current.filter((item) => item.id !== doc.id))
                              setSelected((current) => (current?.id === doc.id ? null : current))
                              fire(
                                mode === "roteiro" ? "Roteiro excluido" : mode === "cotacao" ? "Cotação excluída" : mode === "template" ? "Template excluído" : "Documento excluido",
                                `${doc.name} foi removido do Supabase.`,
                              )
                            } catch (error) {
                              fire("Falha ao excluir", error instanceof Error ? error.message : "Nao foi possivel excluir o registro.")
                            }
                          },
                        }),
                      danger: true,
                    },
                  ]}
                />
              </div>
            ))
          )}
        </div>
      </DashboardCard>
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Detalhe real do documento com vinculos, status e caminho salvo.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Cliente" value={selected.client} />
                <InfoCard label="Viagem" value={selected.trip} />
                <InfoCard label="Tipo" value={selected.type} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Criado em" value={formatDateLabel(selected.created_at)} />
                <InfoCard label="Atualizado em" value={formatDateLabel(selected.updated_at)} />
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-foreground">Resumo do documento</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.preview}</p>
                </div>
                <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-foreground">Arquivo vinculado</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.storage_path || "Nenhum arquivo vinculado no momento."}</p>
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
  return (
    <DocumentHub
      title="Roteiros"
      description="Roteiros manuais reais com vínculo a cliente, viagem, status e conteúdo operacional."
      createLabel="Novo roteiro"
      typeFilter="Roteiro"
      createHref="/app/viagens/roteiros/novo"
      editHref={(record) => `/app/viagens/roteiros/novo?id=${record.id}`}
      mode="roteiro"
    />
  )
}

export function AgencyCotacoesPage() {
  return (
    <DocumentHub
      title="Cotações"
      description="Propostas comerciais reais com vínculo a cliente, viagem, status e histórico interno."
      createLabel="Nova cotação"
      typeFilter="Cotação"
      createHref="/app/viagens/cotacoes/nova"
      editHref={(record) => `/app/viagens/cotacoes/nova?id=${record.id}`}
      mode="cotacao"
    />
  )
}

export function AgencyTasksPage() {
  const [taskList, setTaskList] = useState<TaskRow[]>([])
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const router = useRouter()
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadTasks = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<TaskRow[]>("/api/tasks")
        if (!active) return
        setTaskList(data)
      } catch (error) {
        if (!active) return
        setTaskList([])
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar as tarefas.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadTasks()
    return () => {
      active = false
    }
  }, [])

  const concludeTask = async (task: TaskRow) => {
    try {
      const updated = await requestJson<TaskRow>(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Concluída" }),
      })
      setTaskList((current) => current.map((item) => (item.id === task.id ? updated : item)))
      fire("Tarefa concluída", `${task.title} foi marcada como concluída.`)
    } catch (error) {
      fire("Falha ao concluir", error instanceof Error ? error.message : "Nao foi possivel concluir a tarefa.")
    }
  }

  const postponeTask = async (task: TaskRow) => {
    try {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const updated = await requestJson<TaskRow>(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ due_at: tomorrow.toISOString(), status: "Hoje" }),
      })
      setTaskList((current) => current.map((item) => (item.id === task.id ? updated : item)))
      fire("Tarefa adiada", `${task.title} foi reagendada para amanhã.`)
    } catch (error) {
      fire("Falha ao adiar", error instanceof Error ? error.message : "Nao foi possivel adiar a tarefa.")
    }
  }

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
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Rota rápida em breve", "As rotas rápidas configuráveis ainda serão conectadas a este módulo.")}>
              Adicionar rota rápida
            </Button>
          </div>
        }
      />
      <DashboardCard title="Backlog operacional" description="Acompanhe e ajuste rapidamente as tarefas da central.">
        <div className="space-y-3">
          {loadError ? (
            <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <p className="font-medium">Nao foi possivel sincronizar as tarefas agora.</p>
              <p className="mt-1 text-amber-100/80">{loadError}</p>
            </div>
          ) : null}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`task-skeleton-${index}`} className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="h-4 w-40 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-52 rounded-full bg-white/10" />
              </div>
            ))
          ) : taskList.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhuma tarefa encontrada.</p>
              <p className="mt-2 text-sm text-muted-foreground">Crie a primeira tarefa real da central operacional para começar a organizar a execução.</p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/app/central-operacional/tarefas/nova">Criar tarefa agora</Link>
              </Button>
            </div>
          ) : (
            taskList.map((task) => (
              <div key={task.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <StatusPill label={task.status} />
                    <StatusPill label={task.priority} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{task.description || "Sem descrição operacional complementar."}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Prazo: {formatDateTimeLabel(task.due_at)} • Atualizado em {formatDateTimeLabel(task.updated_at)}</p>
                </div>
                <ActionMenu
                  items={[
                    { label: "Visualizar", icon: Eye, onClick: () => fire("Tarefa real", `${task.title} está salva na central operacional.`) },
                    { label: "Editar", icon: FilePenLine, onClick: () => router.push(`/app/central-operacional/tarefas/nova?id=${task.id}`) },
                    { label: "Concluir", icon: CheckCheck, onClick: () => void concludeTask(task) },
                    { label: "Adiar", icon: Clock3, onClick: () => void postponeTask(task) },
                    {
                      label: "Excluir",
                      icon: Trash2,
                      onClick: () =>
                        setConfirmAction({
                          title: "Excluir tarefa",
                          description: `Deseja confirmar a exclusão de ${task.title}?`,
                          confirmLabel: "Excluir tarefa",
                          onConfirm: async () => {
                            try {
                              await requestJson(`/api/tasks/${task.id}`, { method: "DELETE" })
                              setTaskList((current) => current.filter((item) => item.id !== task.id))
                              fire("Tarefa excluída", `${task.title} foi removida da central.`)
                            } catch (error) {
                              fire("Falha ao excluir", error instanceof Error ? error.message : "Nao foi possivel excluir a tarefa.")
                            }
                          },
                        }),
                      danger: true,
                    },
                  ]}
                />
              </div>
            ))
          )}
        </div>
      </DashboardCard>
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </PageShell>
  )
}

export function AgencyReportsPage() {
  const [overview, setOverview] = useState<ReportsOverviewData | null>(null)
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null)
  const [showAllRecentReports, setShowAllRecentReports] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null)
  const [isRegeneratingId, setIsRegeneratingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const router = useRouter()
  const fire = (title: string, description: string) => toast({ title, description })
  const openPdfExport = (reportId: string) => window.open(`/app/relatorios/${reportId}?export=pdf`, "_blank", "noopener,noreferrer")

  useEffect(() => {
    let active = true

    const loadReportsOverview = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<ReportsOverviewData>("/api/reports/overview")
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar os relatórios.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadReportsOverview()
    return () => {
      active = false
    }
  }, [])

  const reloadOverview = async () => {
    try {
      const data = await requestJson<ReportsOverviewData>("/api/reports/overview")
      setOverview(data)
    } catch (error) {
      fire("Falha ao atualizar", error instanceof Error ? error.message : "Nao foi possivel recarregar os relatórios.")
    }
  }

  const downloadReport = async (report: ReportRow) => {
    setIsDownloadingId(report.id)
    try {
      await requestJson("/api/credit-transactions", {
        method: "POST",
        body: JSON.stringify({
          type: "consumo",
          amount: 3,
          feature: "Relatórios operacionais",
          source: "Download HTML",
        }),
      })
      window.location.href = `/api/reports/${report.id}/download`
    } catch (error) {
      fire("Falha no download", error instanceof Error ? error.message : "Nao foi possivel baixar o relatório.")
    } finally {
      setIsDownloadingId(null)
    }
  }

  const regenerateReport = async (report: ReportRow) => {
    setIsRegeneratingId(report.id)
    try {
      await requestJson(`/api/reports/${report.id}/regenerate`, { method: "POST" })
      await requestJson("/api/credit-transactions", {
        method: "POST",
        body: JSON.stringify({
          type: "consumo",
          amount: 6,
          feature: "Relatórios operacionais",
          source: "Regeneração de relatório",
        }),
      })
      await reloadOverview()
      fire("Relatório regenerado", `${report.name} foi atualizado com os dados reais mais recentes.`)
    } catch (error) {
      fire("Falha ao regenerar", error instanceof Error ? error.message : "Nao foi possivel regenerar o relatório.")
    } finally {
      setIsRegeneratingId(null)
    }
  }

  const previewLines = selectedReport
    ? (parseReportFilters(selectedReport.filters).preview as { lines?: string[] } | undefined)?.lines ?? []
    : overview?.preview.lines ?? []
  const recentReports = overview?.recent_reports ?? []
  const visibleRecentReports = showAllRecentReports ? recentReports : recentReports.slice(0, 4)

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
            {overview?.recent_reports?.[0] ? (
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/app/relatorios/${overview.recent_reports[0].id}`)}>
                Abrir último relatório
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Relatórios disponíveis" description="Escolha o foco principal e gere um relatório contextualizado.">
          {loadError && !overview ? (
            <div className="mb-4 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <p className="font-medium">Nao foi possivel carregar os modelos agora.</p>
              <p className="mt-1 text-amber-100/80">{loadError}</p>
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`report-template-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                  <div className="mt-3 h-3 w-44 rounded-full bg-white/10" />
                </div>
              ))
            ) : (
              <>
                {(overview?.templates ?? []).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`/app/central-operacional/relatorios/novo?template=${encodeURIComponent(item.title)}`)}
                    className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/15 hover:bg-white/[0.05]"
                  >
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-primary/70">{item.metric}</p>
                  </button>
                ))}
                {(overview?.templates ?? []).length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground md:col-span-2">
                    Nenhum modelo operacional disponível ainda. Gere o primeiro relatório real da agência.
                  </div>
                ) : null}
              </>
            )}
          </div>
        </DashboardCard>

        <div className="space-y-5">
          <DashboardCard title="Recentes" description="Últimas saídas geradas pela operação.">
            <div className="space-y-3">
              {loadError ? (
                <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  <p className="font-medium">Nao foi possivel carregar os relatórios agora.</p>
                  <p className="mt-1 text-amber-100/80">{loadError}</p>
                </div>
              ) : null}
              {recentReports.length === 0 && !isLoading ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                  Nenhum relatório salvo ainda. Gere o primeiro relatório operacional real da agência.
                </div>
              ) : null}
              {visibleRecentReports.map((report) => (
                <div key={report.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <button type="button" onClick={() => setSelectedReport(report)} className="text-left">
                        <p className="text-sm font-medium text-foreground">{report.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{report.type} • {formatDateTimeLabel(report.created_at)}</p>
                      </button>
                    </div>
                    <StatusPill label={report.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/app/relatorios/${report.id}`)}>
                      Abrir relatório
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void downloadReport(report)} disabled={isDownloadingId === report.id}>
                      {isDownloadingId === report.id ? "Baixando..." : "Baixar HTML"}
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openPdfExport(report.id)}>
                      Exportar PDF
                    </Button>
                    <Button className="rounded-full" onClick={() => void regenerateReport(report)} disabled={isRegeneratingId === report.id}>
                      {isRegeneratingId === report.id ? "Regenerando..." : "Gerar novamente"}
                    </Button>
                  </div>
                </div>
              ))}
              {recentReports.length > 4 ? (
                <Button
                  variant="outline"
                  className="w-full rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() => setShowAllRecentReports((current) => !current)}
                >
                  {showAllRecentReports ? "Recolher histórico" : `Ver mais ${recentReports.length - 4} relatórios`}
                </Button>
              ) : null}
            </div>
          </DashboardCard>

          <DashboardCard title="Preview do relatório" description="Resumo do relatório atualmente selecionado.">
            <div className="space-y-3">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-foreground">{selectedReport?.name || overview?.preview.title || "Resumo operacional"}</p>
                <div className="mt-2 space-y-2">
                  {previewLines.map((line) => (
                    <p key={line} className="text-sm text-muted-foreground">{line}</p>
                  ))}
                  {previewLines.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum resumo salvo para exibir ainda.</p> : null}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedReport ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedReport.name}</DialogTitle>
                <DialogDescription>Relatório real salvo na base operacional da agência.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Tipo" value={selectedReport.type} />
                <InfoCard label="Status" value={selectedReport.status} />
                <InfoCard label="Criado em" value={formatDateTimeLabel(selectedReport.created_at)} />
                <InfoCard label="Atualizado em" value={formatDateTimeLabel(selectedReport.updated_at)} />
              </div>
              <div className="px-6 pb-6">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-foreground">Snapshot salvo</p>
                  <div className="mt-3 space-y-2">
                    {(parseReportFilters(selectedReport.filters).preview as { lines?: string[] } | undefined)?.lines?.map((line) => (
                      <p key={line} className="text-sm text-muted-foreground">{line}</p>
                    )) || <p className="text-sm text-muted-foreground">Nenhum snapshot adicional foi salvo para este relatório.</p>}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={() => router.push(`/app/relatorios/${selectedReport.id}`)}>
                    Abrir relatório
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openPdfExport(selectedReport.id)}>
                    Exportar PDF
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void downloadReport(selectedReport)} disabled={isDownloadingId === selectedReport.id}>
                    {isDownloadingId === selectedReport.id ? "Baixando..." : "Baixar HTML"}
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void regenerateReport(selectedReport)} disabled={isRegeneratingId === selectedReport.id}>
                    {isRegeneratingId === selectedReport.id ? "Regenerando..." : "Gerar novamente"}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyFinancePage() {
  const periods = [...FINANCE_PERIODS]
  const [period, setPeriod] = useState<(typeof periods)[number]>("Mês")
  const [records, setRecords] = useState<FinancialRecordRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [trips, setTrips] = useState<TripRow[]>([])
  const [selected, setSelected] = useState<FinancialRecordRow | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<(typeof FINANCE_FILTERS)[number]>("Todos")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [appliedStartDate, setAppliedStartDate] = useState("")
  const [appliedEndDate, setAppliedEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const router = useRouter()
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadFinanceModule = async () => {
      setIsLoading(true)
      setLoadError(null)

      const [recordsResult, clientsResult, tripsResult] = await Promise.allSettled([
        requestJson<FinancialRecordRow[]>("/api/financial-records"),
        requestJson<ClientRow[]>("/api/clients"),
        requestJson<TripRow[]>("/api/trips"),
      ])

      if (!active) return

      if (recordsResult.status === "fulfilled") {
        setRecords(recordsResult.value)
      } else {
        setRecords([])
        setLoadError(recordsResult.reason instanceof Error ? recordsResult.reason.message : "Nao foi possivel carregar os lancamentos da agencia.")
      }

      setClients(clientsResult.status === "fulfilled" ? clientsResult.value : [])
      setTrips(tripsResult.status === "fulfilled" ? tripsResult.value : [])
      setIsLoading(false)
    }

    void loadFinanceModule()

    return () => {
      active = false
    }
  }, [])

  const clientsById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients])
  const tripsById = useMemo(() => new Map(trips.map((trip) => [trip.id, trip])), [trips])
  const dateRange = useMemo(
    () => resolveFinanceDateRange(period, { startDate: appliedStartDate, endDate: appliedEndDate }),
    [appliedEndDate, appliedStartDate, period],
  )

  const periodRecords = useMemo(
    () => records.filter((record) => isFinancialRecordInRange(record, dateRange)),
    [dateRange, records],
  )

  const filteredRecordsByView = useMemo(
    () => periodRecords.filter((record) => matchesFinanceFilter(record, activeFilter)),
    [activeFilter, periodRecords],
  )

  const openFinancialReport = (record?: FinancialRecordRow, exportMode?: "PDF" | "HTML" | "PDF + HTML") => {
    const params = new URLSearchParams({
      type: "Financeiro",
      period,
      financeFilter: activeFilter,
    })

    if (exportMode) params.set("export", exportMode)
    if (period === "Personalizado") {
      if (appliedStartDate) params.set("startDate", appliedStartDate)
      if (appliedEndDate) params.set("endDate", appliedEndDate)
    }

    if (record) {
      const note = [
        `Registro de origem: ${record.category || record.type}.`,
        record.client_id ? `Cliente vinculado: ${clientsById.get(record.client_id)?.name ?? record.client_id}.` : null,
        record.trip_id ? `Viagem vinculada: ${tripsById.get(record.trip_id)?.destination ?? record.trip_id}.` : null,
      ]
        .filter(Boolean)
        .join(" ")

      if (note) params.set("notes", note)
    }

    router.push(`/app/central-operacional/relatorios/novo?${params.toString()}`)
  }

  const visibleRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return filteredRecordsByView.filter((record) => {
      if (!normalizedSearch) return true

      const linkedClient = record.client_id ? clientsById.get(record.client_id)?.name ?? "" : ""
      const linkedTrip = record.trip_id ? tripsById.get(record.trip_id)?.destination ?? "" : ""

      return [
        record.type,
        record.status,
        record.category ?? "",
        record.description ?? "",
        linkedClient,
        linkedTrip,
        record.amount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [clientsById, filteredRecordsByView, searchTerm, tripsById])

  const totalRevenue = filteredRecordsByView.filter((item) => normalizeFinanceType(item.type) === "Receita").reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpenses = filteredRecordsByView.filter((item) => normalizeFinanceType(item.type) === "Despesa").reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalCommissions = filteredRecordsByView.filter((item) => (item.category || "").toLowerCase().includes("comiss")).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const profit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0
  const financeSeries = useMemo(() => buildFinanceChartSeries(filteredRecordsByView, period, dateRange), [dateRange, filteredRecordsByView, period])

  const applyFinanceFilters = () => {
    if (period === "Personalizado" && !customStartDate && !customEndDate) {
      fire("Defina um recorte", "Escolha ao menos uma data para aplicar o período personalizado.")
      return
    }

    setAppliedStartDate(customStartDate)
    setAppliedEndDate(customEndDate)
    fire("Filtros aplicados", period === "Personalizado" ? "O recorte personalizado já está refletido no financeiro." : `O período ${period} já está ativo na leitura financeira.`)
  }

  const clearFinanceFilters = () => {
    setSearchTerm("")
    setActiveFilter("Todos")
    setPeriod("Mês")
    setCustomStartDate("")
    setCustomEndDate("")
    setAppliedStartDate("")
    setAppliedEndDate("")
    fire("Filtros limpos", "O financeiro voltou ao recorte padrão do mês atual.")
  }

  return (
    <PageShell>
      <SectionHeader
        title="Financeiro"
        description="Receitas, despesas, vinculos e status com leitura real do Supabase por agencia."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/financeiro/novo">Novo lançamento</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("IA em breve", "A analise automatica com IA ainda sera conectada ao modulo financeiro.")}>
              Analisar com IA
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Stripe em breve", "A conexao automatica com Stripe ainda sera integrada a este modulo.")}>Conectar Stripe</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openFinancialReport()}>Gerar relatório</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openFinancialReport(undefined, "HTML")}>Exportar</Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-md xl:flex-1">
          <SearchInput placeholder="Buscar categoria, cliente, viagem ou status" value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="flex flex-wrap gap-4">
          <FilterTabs items={[...FINANCE_FILTERS]} activeItem={activeFilter} onChange={(item) => setActiveFilter(item as (typeof FINANCE_FILTERS)[number])} />
          <FilterTabs items={periods} activeItem={period} onChange={(item) => setPeriod(item as typeof period)} />
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap gap-3">
          {period === "Personalizado" ? (
            <>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Data inicial</span>
                <input value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} placeholder="AAAA-MM-DD" className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70" />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Data final</span>
                <input value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} placeholder="AAAA-MM-DD" className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70" />
              </label>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={applyFinanceFilters}>Aplicar filtros</Button>
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={clearFinanceFilters}>Limpar filtros</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Receitas" value={formatMoney(totalRevenue)} change={`Periodo: ${period}`} tone="success" icon={Wallet} />
        <MetricCard label="Despesas" value={formatMoney(totalExpenses)} change="Saidas registradas" tone="warning" icon={Receipt} />
        <MetricCard label="Comissoes" value={formatMoney(totalCommissions)} change="Categorias com comissao" tone="info" icon={Users} />
        <MetricCard label="Lucro" value={formatMoney(profit)} change={`Margem ${margin}%`} tone={profit >= 0 ? "success" : "danger"} icon={TrendingUp} />
        <MetricCard label="Margem" value={`${margin}%`} change="Base real do periodo" tone="success" icon={Percent} />
        <MetricCard label="Lancamentos" value={`${filteredRecordsByView.length}`} change="Receitas e despesas reais" tone="info" icon={HandCoins} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {financeSeries.length ? (
          <MockChart title="Receitas, despesas, saldo e margem" description={`Serie real do periodo ${period}${period === "Personalizado" && (appliedStartDate || appliedEndDate) ? ` (${appliedStartDate || "inicio aberto"} ate ${appliedEndDate || "fim aberto"})` : ""}.`} series={financeSeries} />
        ) : (
          <DashboardCard title="Receitas, despesas, saldo e margem" description={`O grafico usa apenas financial_records reais do periodo ${period}.`}>
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Sem dados para este recorte.</p>
              <p className="mt-2 text-sm text-muted-foreground">Crie lançamentos com competência dentro do período selecionado para alimentar o gráfico real.</p>
            </div>
          </DashboardCard>
        )}
        <DashboardCard title="Resumo do periodo" description="Leitura rapida do caixa com contexto operacional e vinculos reais.">
          <div className="space-y-3">
            {[
              `Periodo selecionado: ${period}`,
              `${filteredRecordsByView.filter((item) => normalizeFinanceStatus(item.status) === "Pago").length} lançamentos pagos no recorte atual.`,
              `${filteredRecordsByView.filter((item) => item.client_id || item.trip_id).length} lançamentos vinculados a cliente ou viagem.`,
              activeFilter !== "Todos" ? `Filtro operacional ativo: ${activeFilter}.` : "Use os filtros para isolar receitas, despesas e pendências sem perder contexto.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Lancamentos da operacao" description="Visualize, edite, exclua e acompanhe registros reais do financeiro.">
        <div className="space-y-3">
          {loadError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Nao foi possivel sincronizar o financeiro agora.</p>
                <p className="mt-1 text-amber-100/80">{loadError}</p>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`finance-skeleton-${index}`} className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="h-4 w-44 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-64 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-40 rounded-full bg-white/10" />
              </div>
            ))
          ) : visibleRecords.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum lancamento encontrado.</p>
              <p className="mt-2 text-sm text-muted-foreground">Crie o primeiro lancamento real da agencia ou ajuste a busca e os filtros atuais.</p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/app/financeiro/novo">Criar lancamento agora</Link>
              </Button>
            </div>
          ) : (
            visibleRecords.map((record) => {
              const linkedClient = record.client_id ? clientsById.get(record.client_id)?.name ?? `Cliente ${record.client_id.slice(0, 8)}` : "Sem cliente vinculado"
              const linkedTrip = record.trip_id ? tripsById.get(record.trip_id)?.destination ?? `Viagem ${record.trip_id.slice(0, 8)}` : "Sem viagem vinculada"

              return (
                <div key={record.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <button type="button" onClick={() => setSelected(record)} className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{record.category || record.type}</p>
                      <StatusPill label={record.type} />
                      <StatusPill label={record.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{linkedClient} • {linkedTrip}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatMoney(Number(record.amount || 0))} • {formatDateLabel(record.occurred_at)} • {record.description || "Sem descricao complementar"}</p>
                  </button>
                  <ActionMenu
                    items={[
                      { label: "Visualizar", icon: Eye, onClick: () => setSelected(record) },
                      { label: "Editar", icon: FilePenLine, onClick: () => router.push(`/app/financeiro/novo?id=${record.id}`) },
                      {
                        label: "Registrar pagamento",
                        icon: CreditCard,
                        onClick: async () => {
                          try {
                            const updated = await requestJson<FinancialRecordRow>(`/api/financial-records/${record.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ status: "Pago" }),
                            })
                            setRecords((current) => current.map((item) => (item.id === record.id ? updated : item)))
                            setSelected((current) => (current?.id === record.id ? updated : current))
                            fire("Pagamento registrado", "O lançamento foi atualizado com status Pago.")
                          } catch (error) {
                            fire("Falha ao atualizar", error instanceof Error ? error.message : "Nao foi possivel registrar o pagamento.")
                          }
                        },
                      },
                      { label: "Conectar Stripe", icon: ArrowRightLeft, onClick: () => fire("Stripe em breve", "A conexao automatica com Stripe ainda sera integrada a este modulo.") },
                      { label: "Gerar relatorio", icon: Download, onClick: () => openFinancialReport(record) },
                      { label: "Exportar", icon: ExternalLink, onClick: () => openFinancialReport(record, "HTML") },
                      {
                        label: "Excluir",
                        icon: Trash2,
                        onClick: () =>
                          setConfirmAction({
                            title: "Excluir lancamento",
                            description: `Deseja confirmar a exclusao de ${record.category || record.type}? Esta acao remove o registro real do Supabase.`,
                            confirmLabel: "Excluir lancamento",
                            onConfirm: async () => {
                              try {
                                await requestJson(`/api/financial-records/${record.id}`, { method: "DELETE" })
                                setRecords((current) => current.filter((item) => item.id !== record.id))
                                setSelected((current) => (current?.id === record.id ? null : current))
                                fire("Lancamento excluido", "O registro foi removido do Supabase.")
                              } catch (error) {
                                fire("Falha ao excluir", error instanceof Error ? error.message : "Nao foi possivel excluir o lancamento.")
                              }
                            },
                          }),
                        danger: true,
                      },
                    ]}
                  />
                </div>
              )
            })
          )}
        </div>
      </DashboardCard>

      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selected ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selected.category || selected.type}</DialogTitle>
                <DialogDescription>Detalhe real do lancamento com valor, vinculos e status atual.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Tipo" value={selected.type} />
                <InfoCard label="Status" value={selected.status} />
                <InfoCard label="Valor" value={formatMoney(Number(selected.amount || 0))} />
                <InfoCard label="Data" value={formatDateLabel(selected.occurred_at)} />
                <InfoCard label="Cliente" value={selected.client_id ? clientsById.get(selected.client_id)?.name ?? `Cliente ${selected.client_id.slice(0, 8)}` : "Sem cliente vinculado"} />
                <InfoCard label="Viagem" value={selected.trip_id ? tripsById.get(selected.trip_id)?.destination ?? `Viagem ${selected.trip_id.slice(0, 8)}` : "Sem viagem vinculada"} />
              </div>
              <div className="px-6 pb-6">
                <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-foreground">Descricao</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.description || "Nenhuma descricao complementar foi registrada."}</p>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export function AgencyTeamPage() {
  const [records, setRecords] = useState<TeamRecord[]>([])
  const [selected, setSelected] = useState<TeamRecord | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const router = useRouter()
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setLoadError(null)
    requestJson<TeamMemberRow[]>("/api/team")
      .then((data) => {
        if (!active) return
        setRecords(data.map(mapTeamRowToRecord))
      })
      .catch((error) => {
        if (!active) return
        setRecords([])
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar a equipe.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
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
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/equipe/novo">Adicionar</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Convite em breve", "O convite real por e-mail será conectado quando o fluxo avançado de auth da equipe for liberado.")}>
              Convidar
            </Button>
          </div>
        }
      />
      <DashboardCard title="Pessoas da agência" description="Ações rápidas para visualizar, editar e controlar status.">
        <div className="space-y-3">
          {loadError ? (
            <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <p className="font-medium">Nao foi possivel carregar a equipe agora.</p>
              <p className="mt-1 text-amber-100/80">{loadError}</p>
            </div>
          ) : null}
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`team-skeleton-${index}`} className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="h-4 w-40 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-48 rounded-full bg-white/10" />
              </div>
            ))
          ) : records.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum membro cadastrado ainda.</p>
              <p className="mt-2 text-sm text-muted-foreground">Crie o primeiro membro real da equipe para organizar acesso, escopo e status da operação.</p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/app/equipe/novo">Criar membro agora</Link>
              </Button>
            </div>
          ) : records.map((item) => (
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
                    onClick: () => router.push(`/app/equipe/novo?id=${item.id}`),
                  },
                  { label: item.status === "Ativo" ? "Inativar" : "Ativar", icon: ArrowRightLeft, onClick: () => toggleStatus(item.id) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir membro",
                        description: `Deseja remover ${item.name} desta lista de preparação?`,
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
      createHref="/app/documentos/novo?type=Documento%20geral"
    />
  )
}

export function AgencyContractsPage() {
  return (
    <DocumentHub
      title="Contratos"
      description="Contratos com branding, status e ações rápidas para compartilhar ou revisar."
      createLabel="Criar contrato"
      createHref="/app/documentos/novo?type=Contrato"
      editHref={(record) => `/app/documentos/novo?type=Contrato&id=${record.id}`}
    />
  )
}

export function AgencyVouchersPage() {
  return (
    <DocumentHub
      title="Vouchers"
      description="Vouchers de hotel, transfer e serviços com visualização rápida."
      createLabel="Novo voucher"
      createHref="/app/documentos/novo?type=Voucher"
      editHref={(record) => `/app/documentos/novo?type=Voucher&id=${record.id}`}
    />
  )
}

export function AgencyReceiptsPage() {
  return (
    <DocumentHub
      title="Recibos"
      description="Comprovantes financeiros organizados por cliente e viagem."
      createLabel="Novo recibo"
      createHref="/app/documentos/novo?type=Recibo"
      editHref={(record) => `/app/documentos/novo?type=Recibo&id=${record.id}`}
    />
  )
}

export function AgencyTicketsPage() {
  return (
    <DocumentHub
      title="Passagens"
      description="Trechos e emissões organizados com ações de visualização, envio e download."
      createLabel="Nova passagem"
      createHref="/app/documentos/novo?type=Passagem"
      editHref={(record) => `/app/documentos/novo?type=Passagem&id=${record.id}`}
    />
  )
}

export function AgencyTemplatesPage() {
  return (
    <DocumentHub
      title="Templates"
      description="Biblioteca operacional real para documentos, roteiros e relatórios futuros da agência."
      createLabel="Novo template"
      typeFilter="Template"
      createHref="/app/documentos/novo?mode=template"
      editHref={(record) => `/app/documentos/novo?mode=template&id=${record.id}`}
      mode="template"
    />
  )
}

export function AgencyTasksOperationalPage() {
  return <AgencyTasksPage />
}

export function AgencyReportsOperationalPage() {
  return <AgencyReportsPage />
}

export function AgencyCreditsOperationalPage() {
  return <AgencyCreditsPage />
}

export function AgencyLeadsPage() {
  const [records, setRecords] = useState<Array<ReturnType<typeof mapLeadRowToCard>>>([])
  const [selected, setSelected] = useState<Array<ReturnType<typeof mapLeadRowToCard>>[number] | null>(null)
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)
  const [leadFormValues, setLeadFormValues] = useState<LeadFormValues>(buildLeadFormValues())
  const [isSavingLead, setIsSavingLead] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadLeads = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await requestJson<LeadRow[]>("/api/leads")
        if (!active) return
        setRecords(data.map(mapLeadRowToCard))
      } catch (error) {
        if (!active) return
        if (process.env.NODE_ENV !== "production") {
          console.error("[AgencyLeadsPage] failed to load leads", error)
        }
        setRecords([])
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar os leads da agência.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadLeads()
    return () => {
      active = false
    }
  }, [])

  const visibleLeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return records.filter((lead) => {
      if (!query) return true
      return [lead.name, lead.origin, lead.destination, lead.stage, lead.temperature, lead.email, lead.phone, lead.notes].join(" ").toLowerCase().includes(query)
    })
  }, [records, searchTerm])

  const leadMetrics = useMemo(
    () => [
      { label: "Leads ativos", value: records.length.toString().padStart(2, "0"), change: `${records.filter((lead) => lead.temperature === "Quente").length} quentes agora`, icon: Waypoints },
      { label: "Em qualificação", value: records.filter((lead) => lead.stage.toLowerCase().includes("qual")).length.toString().padStart(2, "0"), change: `${records.filter((lead) => lead.stage === "Novo lead").length} novos leads`, icon: Target },
      { label: "Alta prioridade", value: records.filter((lead) => lead.temperature === "Quente").length.toString().padStart(2, "0"), change: `${records.filter((lead) => lead.destination !== "Destino em definição").length} com destino definido`, icon: Sparkles },
    ],
    [records],
  )

  const openLeadEditor = (lead: Array<ReturnType<typeof mapLeadRowToCard>>[number]) => {
    setEditingLeadId(lead.id)
    setLeadFormValues(buildLeadFormValues(lead))
  }

  const handleSaveLead = async () => {
    if (!editingLeadId) return
    try {
      setIsSavingLead(true)
      const updated = await requestJson<LeadRow>(`/api/leads/${editingLeadId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: leadFormValues.name,
          email: leadFormValues.email || null,
          phone: leadFormValues.phone || null,
          origin: leadFormValues.origin || null,
          destination: leadFormValues.destination || null,
          status: leadFormValues.status,
          temperature: leadFormValues.temperature || null,
          notes: leadFormValues.notes || null,
        }),
      })
      const mapped = mapLeadRowToCard(updated)
      setRecords((current) => current.map((item) => (item.id === editingLeadId ? mapped : item)))
      setSelected((current) => (current?.id === editingLeadId ? mapped : current))
      fire("Lead atualizado", `${mapped.name} foi atualizado com dados reais.`)
      setEditingLeadId(null)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyLeadsPage] failed to save lead", error)
      }
      fire("Falha ao salvar", error instanceof Error ? error.message : "Não foi possível salvar o lead.")
    } finally {
      setIsSavingLead(false)
    }
  }

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
      <div className="grid gap-3 md:grid-cols-3">
        {leadMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="xl:max-w-md xl:flex-1">
        <SearchInput placeholder="Buscar lead, origem, destino ou status" value={searchTerm} onChange={setSearchTerm} />
      </div>
      <DashboardCard title="Oportunidades ativas" description="Clique em um lead para abrir detalhes e ações rápidas.">
        <div className="space-y-3">
          {loadError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Não foi possível sincronizar os leads agora.</p>
                <p className="mt-1 text-amber-100/80">{loadError}</p>
              </div>
            </div>
          ) : null}
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`lead-skeleton-${index}`} className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="h-4 w-40 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-60 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-32 rounded-full bg-white/10" />
              </div>
            ))
          ) : visibleLeads.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum lead encontrado.</p>
              <p className="mt-2 text-sm text-muted-foreground">Cadastre a primeira oportunidade real da agência para iniciar qualificação e follow-up.</p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/app/leads/novo">Criar lead agora</Link>
              </Button>
            </div>
          ) : (
            visibleLeads.map((lead) => (
              <div key={lead.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <button
                  type="button"
                  onClick={() => setSelected(lead)}
                  className="min-w-0 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <StatusPill label={lead.temperature} />
                    <StatusPill label={lead.stage} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{lead.origin} • {lead.destination}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{lead.email} • {lead.phone}</p>
                </button>
                <ActionMenu
                  items={[
                    { label: "Visualizar", icon: Eye, onClick: () => setSelected(lead) },
                    { label: "Editar", icon: FilePenLine, onClick: () => openLeadEditor(lead) },
                    { label: "Notificar", icon: BellRing, onClick: () => fire("Notificações em preparação", `As notificações para ${lead.name} serão ativadas com TravelPro Agent e WhatsApp operacional.`) },
                    { label: "Abrir origem", icon: ExternalLink, onClick: () => fire("Origem em preparação", `A abertura direta da origem de ${lead.name} será conectada quando os canais externos estiverem disponíveis.`) },
                    { label: "Converter em cliente", icon: ArrowRightLeft, onClick: () => fire("Conversão em preparação", `A conversão segura de ${lead.name} em cliente real será ativada na próxima etapa.`) },
                    {
                      label: "Excluir",
                      icon: Trash2,
                      onClick: () =>
                        setConfirmAction({
                          title: "Excluir lead",
                          description: `Deseja confirmar a exclusão do lead ${lead.name}?`,
                          confirmLabel: "Excluir lead",
                          onConfirm: async () => {
                            try {
                              await requestJson(`/api/leads/${lead.id}`, { method: "DELETE" })
                              setRecords((current) => current.filter((item) => item.id !== lead.id))
                              setSelected((current) => (current?.id === lead.id ? null : current))
                              fire("Lead excluído", `${lead.name} foi removido com sucesso.`)
                            } catch (error) {
                              if (process.env.NODE_ENV !== "production") {
                                console.error("[AgencyLeadsPage] failed to delete lead", error)
                              }
                              fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir o lead.")
                            }
                          },
                        }),
                      danger: true,
                    },
                  ]}
                />
              </div>
            ))
          )}
        </div>
      </DashboardCard>
      <LeadEditorDialog
        open={Boolean(editingLeadId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLeadId(null)
            setLeadFormValues(buildLeadFormValues())
          }
        }}
        values={leadFormValues}
        onChange={(field, value) => setLeadFormValues((current) => ({ ...current, [field]: value }))}
        onConfirm={handleSaveLead}
        saving={isSavingLead}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />

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
                <InfoCard label="E-mail" value={selected.email} />
                <InfoCard label="Telefone" value={selected.phone} />
                <InfoCard label="Observações" value={selected.notes} />
              </div>
              <div className="flex flex-wrap gap-2 px-6 pb-5">
                <Button className="rounded-full" onClick={() => fire("Notificações em preparação", `As notificações para ${selected.name} serão ativadas com TravelPro Agent e WhatsApp operacional.`)}>Notificar</Button>
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
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Conversão em preparação", `A conversão segura de ${selected.name} em cliente real será ativada na próxima etapa.`)}>
                  Converter em cliente
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
            <Button className="rounded-full" onClick={() => fire("TravelPro Go em breve", "O controle operacional do número será liberado quando a integração real de WhatsApp entrar na próxima fase.")}>Ativar / pausar</Button>
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
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem em breve", `A trilha completa de ${entry.title} será exibida quando o histórico real do Go estiver disponível.`)}>Abrir origem</Button>
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
            <Button className="rounded-full" onClick={() => fire("Agent em breve", "O controle fino do Agent será liberado quando a operação conversacional entrar na próxima fase.")}>Pausar / ativar</Button>
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
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Atendimento em breve", `${item.name} entra na leitura real quando o módulo conversacional for conectado.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Edição em breve", `A edição segura do atendimento de ${item.name} será liberada na próxima etapa do Agent.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir atendimento",
                        description: `Deseja remover ${item.name} desta fila de preparação do Agent?`,
                        confirmLabel: "Excluir atendimento",
                        onConfirm: () => fire("Atendimento removido", `${item.name} saiu desta visão de preparação do Agent.`),
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
        onConfirm={() => fire("Estilo salvo", "O estilo de atendimento foi registrado nesta interface e será conectado à operação real do Agent em uma próxima etapa.")}
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
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Calendário em breve", "O calendário promocional completo será conectado quando o módulo de campanhas sair da fase preparatória.")}>Abrir calendário</Button>
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
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Campanha em breve", `${item.title} entra na leitura real quando o módulo de campanhas for conectado.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Edição em breve", `A edição segura de ${item.title} será liberada na próxima etapa do Marketing IA.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir campanha",
                        description: `Deseja remover ${item.title} desta lista de preparação?`,
                        confirmLabel: "Excluir campanha",
                        onConfirm: () => fire("Campanha removida", `${item.title} saiu desta visão preparatória do Marketing IA.`),
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
        onConfirm={() => fire("Campanha preparada", "A campanha ficou registrada nesta interface enquanto a execução real de campanhas entra em uma próxima fase.")}
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
        onConfirm={() => fire("Consulta preparada", "A consulta ficou registrada nesta interface enquanto o Atlas Advisor avança para a próxima fase operacional.")}
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
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico em breve", "O histórico real das automações será liberado quando os fluxos saírem da fase preparatória.")}>Ver histórico</Button>
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
                  { label: "Visualizar", icon: Eye, onClick: () => fire("Fluxo em breve", `${flow.title} entra na leitura real quando a camada operacional de automações for conectada.`) },
                  { label: "Editar", icon: FilePenLine, onClick: () => fire("Edição em breve", `A edição segura de ${flow.title} será liberada quando o módulo sair da fase preparatória.`) },
                  {
                    label: "Excluir",
                    icon: Trash2,
                    onClick: () =>
                      setConfirmAction({
                        title: "Excluir automação",
                        description: `Deseja remover ${flow.title} desta visão de preparação?`,
                        confirmLabel: "Excluir automação",
                        onConfirm: () => fire("Automação removida", `${flow.title} saiu desta visão preparatória.`),
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
        onConfirm={() => fire("Fluxo preparado", "O fluxo ficou registrado nesta interface enquanto a automação real entra em uma próxima etapa.")}
      />
      <ConfirmationDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </PageShell>
  )
}

export function AgencyOperationalOverviewPage() {
  const [data, setData] = useState<CentralOperationalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const router = useRouter()
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadOperationalCenter = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const response = await requestJson<CentralOperationalData>("/api/operational-center")
        if (!active) return
        setData(response)
      } catch (error) {
        if (!active) return
        setData(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar a central operacional.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadOperationalCenter()
    return () => {
      active = false
    }
  }, [])

  const toneClassMap: Record<CentralOperationalData["priorities"][number]["tone"], string> = {
    success: "border-green-400/20 bg-green-400/10 text-green-100",
    info: "border-sky-400/20 bg-sky-400/10 text-sky-100",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    danger: "border-red-400/20 bg-red-400/10 text-red-100",
    default: "border-white/10 bg-white/[0.03] text-muted-foreground",
  }

  return (
    <PageShell>
      <SectionHeader
        title="Central Operacional"
        description="Prioridades do dia, rotas rápidas e ações por item para mover a operação."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/app/central-operacional/tarefas/nova">Nova tarefa</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Rotas rápidas em breve", "As rotas rápidas configuráveis serão liberadas em uma próxima etapa da central.")}>Adicionar rota rápida</Button>
          </div>
        }
      />
      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar a central agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <DashboardCard title="Status operacional" description="Leitura viva da central com base em tarefas, notificações, relatórios e créditos.">
            <div className="grid gap-4 md:grid-cols-2">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={`operational-status-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="h-4 w-28 rounded-full bg-white/10" />
                    <div className="mt-3 h-7 w-24 rounded-full bg-white/10" />
                    <div className="mt-3 h-3 w-44 rounded-full bg-white/10" />
                  </div>
                ))
              ) : (
                <>
                  {(data?.statuses ?? []).map((item) => (
                    <div key={item.label} className={`rounded-[24px] border p-4 ${toneClassMap[item.tone]}`}>
                      <p className="text-xs uppercase tracking-[0.16em]">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-foreground">{item.value}</p>
                      <p className="mt-2 text-sm">{item.detail}</p>
                    </div>
                  ))}
                  {(data?.statuses ?? []).length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground md:col-span-2">
                      Ainda não há sinais operacionais suficientes para montar um painel vivo desta agência.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </DashboardCard>

          <DashboardCard title="Prioridades reais" description="Itens derivados da operação para abrir o módulo certo sem botões mortos.">
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={`operational-priority-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="h-4 w-36 rounded-full bg-white/10" />
                    <div className="mt-3 h-7 w-20 rounded-full bg-white/10" />
                    <div className="mt-3 h-3 w-52 rounded-full bg-white/10" />
                  </div>
                ))
              ) : (
                <>
                  {(data?.priorities ?? []).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => router.push(item.href)}
                      className="w-full rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/15 hover:bg-white/[0.05]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
                        </div>
                        <StatusPill label={item.value} />
                      </div>
                    </button>
                  ))}
                  {(data?.priorities ?? []).length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                      Nenhuma prioridade crítica agora. A central vai ganhar corpo conforme a agência registrar operações reais.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-5">
          <DashboardCard title="Feed operacional" description="Eventos agregados sem tabela nova, priorizando o que acabou de acontecer.">
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={`operational-feed-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="h-4 w-40 rounded-full bg-white/10" />
                    <div className="mt-3 h-3 w-56 rounded-full bg-white/10" />
                    <div className="mt-3 h-3 w-24 rounded-full bg-white/10" />
                  </div>
                ))
              ) : (
                <>
                  {(data?.feed ?? []).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => router.push(item.href)}
                      className="w-full rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/15 hover:bg-white/[0.05]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                        </div>
                        <StatusPill label={item.time} />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-primary/70">{item.origin}</p>
                    </button>
                  ))}
                  {(data?.feed ?? []).length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                      Sem eventos recentes ainda. Assim que clientes, leads, viagens, documentos e lançamentos forem criados, o feed aparece aqui.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </DashboardCard>

          <DashboardCard title="Ações recentes" description="Atalhos vivos para tarefas, notificações e relatórios que já existem.">
            <div className="space-y-3">
              {(data?.tasks ?? []).slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description || "Sem descrição complementar."}</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/app/central-operacional/tarefas/nova?id=${item.id}`)}>
                      Abrir prioridade
                    </Button>
                  </div>
                </div>
              ))}
              {(data?.notifications ?? []).slice(0, 2).map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.body || item.type}</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(item.action_url || "/app/central-operacional")}>
                      Abrir origem
                    </Button>
                  </div>
                </div>
              ))}
              {(data?.reports ?? []).slice(0, 1).map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.type} • {formatDateTimeLabel(item.created_at)}</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/relatorios")}>
                      Abrir relatório
                    </Button>
                  </div>
                </div>
              ))}
              {!isLoading && (data?.tasks?.length ?? 0) === 0 && (data?.notifications?.length ?? 0) === 0 && (data?.reports?.length ?? 0) === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                  Nenhuma ação operacional recente por aqui ainda.
                </div>
              ) : null}
            </div>
          </DashboardCard>
        </div>
      </div>
    </PageShell>
  )
}

export function AgencyInsightsPage() {
  const [dashboard, setDashboard] = useState<AgencyDashboardData | null>(null)
  const [credits, setCredits] = useState<CreditsOverviewData | null>(null)
  const [operational, setOperational] = useState<CentralOperationalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const router = useRouter()
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadInsights = async () => {
      setIsLoading(true)
      setLoadError(null)

      const [dashboardResult, creditsResult, operationalResult] = await Promise.allSettled([
        requestJson<AgencyDashboardData>("/api/dashboard/agency"),
        requestJson<CreditsOverviewData>("/api/credits/overview"),
        requestJson<CentralOperationalData>("/api/operational-center"),
      ])

      if (!active) return

      if (dashboardResult.status === "fulfilled") setDashboard(dashboardResult.value)
      if (creditsResult.status === "fulfilled") setCredits(creditsResult.value)
      if (operationalResult.status === "fulfilled") setOperational(operationalResult.value)

      if (dashboardResult.status === "rejected") {
        setLoadError(dashboardResult.reason instanceof Error ? dashboardResult.reason.message : "Nao foi possivel carregar os insights da agencia.")
      }

      setIsLoading(false)
    }

    void loadInsights()
    return () => {
      active = false
    }
  }, [])

  const signals = useMemo(() => {
    if (!dashboard) return []

    return [
      `Clientes ativos na base: ${dashboard.counts.clients}.`,
      `Leads totais monitorados: ${dashboard.counts.leads}.`,
      `Documentos pendentes ou em rascunho: ${dashboard.counts.pending_documents}.`,
      `Saldo financeiro atual: ${formatMoney(dashboard.counts.balance)}.`,
      `Próximos embarques mapeados: ${dashboard.counts.upcoming_trips}.`,
      `Créditos disponíveis: ${credits?.balance ?? 0}.`,
    ]
  }, [credits?.balance, dashboard])

  const suggestions = useMemo(() => {
    const items: Array<{ label: string; href: string }> = []

    if ((dashboard?.counts.leads ?? 0) > 0) items.push({ label: "Priorizar leads abertos e qualificação comercial.", href: "/app/leads" })
    if ((dashboard?.counts.pending_documents ?? 0) > 0) items.push({ label: "Fechar pendências documentais da operação.", href: "/app/documentos" })
    if ((dashboard?.counts.upcoming_trips ?? 0) > 0) items.push({ label: "Revisar viagens com embarque próximo.", href: "/app/viagens" })
    if ((credits?.balance ?? 0) <= 0) items.push({ label: "Revisar o saldo de créditos operacionais.", href: "/app/creditos" })
    if ((operational?.priorities.length ?? 0) > 0) items.push({ label: "Abrir prioridades reais da central operacional.", href: "/app/central-operacional" })

    return items.slice(0, 4)
  }, [credits?.balance, dashboard?.counts.leads, dashboard?.counts.pending_documents, dashboard?.counts.upcoming_trips, operational?.priorities.length])

  return (
    <PageShell>
      <SectionHeader
        title="Insights"
        description="Leituras operacionais reais com base em clientes, leads, viagens, documentos, financeiro e créditos."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onClick={() => router.push("/app/central-operacional/relatorios/novo?type=Operacao%20geral")}
            >
              Gerar relatório
            </Button>
            <Button className="rounded-full" onClick={() => fire("Em breve", "A distribuição inteligente desses insights será conectada a IA, WhatsApp e Advisor em uma próxima etapa.")}>Distribuir insights</Button>
          </div>
        }
      />
      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar os insights agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardCard title="Sinais da operação" description="Resumo simples e real do que merece atenção agora.">
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={`insight-signal-${index}`} className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />)
            ) : signals.length > 0 ? (
              signals.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">{item}</div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
                Ainda não há dados suficientes para leituras operacionais mais profundas.
              </div>
            )}
          </div>
        </DashboardCard>
        <DashboardCard title="Ações sugeridas" description="Próximos movimentos úteis a partir do que já está acontecendo na agência.">
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <div key={`insight-action-${index}`} className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />)
            ) : suggestions.length > 0 ? (
              suggestions.map((item) => (
                <button key={item.label} type="button" onClick={() => router.push(item.href)} className="w-full rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left text-sm text-muted-foreground transition-all hover:border-primary/15 hover:bg-white/[0.05]">
                  {item.label}
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
                Nenhuma sugestão crítica agora. Continue registrando a operação para enriquecer essa leitura.
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}

export function AgencyCreditsPage() {
  const [overview, setOverview] = useState<CreditsOverviewData | null>(null)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadCredits = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const response = await requestJson<CreditsOverviewData>("/api/credits/overview")
        if (!active) return
        setOverview(response)
      } catch (error) {
        if (!active) return
        setOverview(null)
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar os creditos.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadCredits()
    return () => {
      active = false
    }
  }, [])

  const history = overview?.history ?? []
  const visibleHistory = showAllHistory ? history : history.slice(0, 6)

  return (
    <PageShell>
      <SectionHeader title="Créditos e consumo" description="Consumo por feature, histórico e ações rápidas de compra e rastreio." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Créditos disponíveis" value={isLoading ? "--" : String(overview?.balance ?? 0)} change="Saldo operacional atual" tone={Number(overview?.balance ?? 0) > 0 ? "success" : "warning"} icon={CreditCard} />
        <MetricCard label="Créditos usados" value={isLoading ? "--" : String(overview?.consumed ?? 0)} change={`${overview?.history.length ?? 0} movimentos no histórico`} tone="warning" icon={Sparkles} />
        <MetricCard label="Maior origem" value={isLoading ? "--" : overview?.top_feature || "Sem consumo"} change={isLoading ? "Carregando" : `${overview?.top_feature_amount ?? 0} créditos`} tone="info" icon={Bot} />
      </div>
      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar os créditos agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}
      <DashboardCard title="Histórico de uso" description="Abra a origem do consumo, revise o histórico e compre novos créditos.">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico em foco", "O histórico operacional abaixo já reflete os movimentos reais de créditos.")}>Ver histórico</Button>
          <Button className="rounded-full" onClick={() => fire("Compra em breve", "A compra de créditos continua fora deste escopo e será integrada depois, sem Stripe por enquanto.")}>Comprar créditos</Button>
        </div>
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-foreground">Saldo e entradas</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{isLoading ? "--" : `${overview?.balance ?? 0} créditos`}</p>
              <p className="mt-2 text-sm text-muted-foreground">{isLoading ? "Carregando histórico..." : `${overview?.added ?? 0} créditos adicionados até agora.`}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-foreground">Origens operacionais</p>
              <div className="mt-3 space-y-2">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => <div key={`credit-feature-skeleton-${index}`} className="h-10 animate-pulse rounded-2xl bg-white/10" />)
                ) : (
                  <>
                    {(overview?.by_feature ?? []).map((item) => (
                      <div key={item.feature} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{item.feature}</span>
                        <span className="font-medium text-foreground">{item.amount}</span>
                      </div>
                    ))}
                    {(overview?.by_feature ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma origem registrada ainda.</p> : null}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={`credit-history-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="h-4 w-40 rounded-full bg-white/10" />
                  <div className="mt-3 h-3 w-56 rounded-full bg-white/10" />
                </div>
              ))
            ) : (
              <>
                {visibleHistory.map((row) => (
                  <div key={row.id} className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{row.feature || row.source || "Operação geral"}</p>
                        <StatusPill label={row.type} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{row.amount} créditos • {formatDateTimeLabel(row.created_at)}</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem do consumo", row.source || row.feature || "Movimento operacional sem origem detalhada.")}>
                      Abrir origem
                    </Button>
                  </div>
                ))}
                {history.length > 6 ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-white/10 bg-white/[0.03]"
                    onClick={() => setShowAllHistory((current) => !current)}
                  >
                    {showAllHistory ? "Recolher histórico" : `Ver mais ${history.length - 6} movimentos`}
                  </Button>
                ) : null}
                {history.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                    Ainda não há consumo de créditos registrado. Quando relatórios e ações futuras gerarem consumo operacional, o histórico aparece aqui.
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </DashboardCard>
    </PageShell>
  )
}


