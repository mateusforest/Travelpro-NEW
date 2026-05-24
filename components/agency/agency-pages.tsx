"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRightLeft,
  ChevronRight,
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
  Grip,
  HandCoins,
  MoreHorizontal,
  PlaneTakeoff,
  Receipt,
  Route,
  Save,
  Send,
  Sparkles,
  Target,
  Trash2,
  Users,
  Waypoints,
  type LucideIcon,
} from "lucide-react"
import { trips } from "@/mock/trips"
import { documents } from "@/mock/documents"
import { leads } from "@/mock/leads"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { DashboardCard } from "@/components/system/dashboard-card"
import { SearchInput } from "@/components/system/search-input"
import { FilterTabs } from "@/components/system/filter-tabs"
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
import { cn } from "@/lib/utils"
import type { ClientRow, DocumentRow, FinancialRecordRow, LeadRow, ReportRow, TaskRow, TeamMemberRow, TripRow } from "@/types/database"
import type { ClientInput, ClientTravelerProfile } from "@/types/client"
import type { AgencyDashboardData } from "@/types/dashboard"
import type { CentralOperationalData } from "@/types/operational-center"
import type { CreditsOverviewData } from "@/types/credits-overview"
import type { ReportsOverviewData } from "@/types/reports-overview"
import type { TripShareLinkSummary } from "@/types/trip-share"
import type { CatalogAgencyProfile, CatalogItemResponse } from "@/types/catalog"

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

type MessageRecord = {
  id: string
  sender: "agency" | "client"
  text: string
  time: string
  status?: string
}

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

function WorkspaceSectionHeader({
  eyebrow,
  title,
  description,
  summary,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  summary?: string
  actions?: ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-5 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.24em] text-primary/68">{eyebrow}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
            {summary ? <span className="text-sm text-muted-foreground">{summary}</span> : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

function WorkspaceMetricStrip({
  items,
}: {
  items: { label: string; value: string; hint: string; tone?: "default" | "success" | "warning" | "danger" }[]
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const toneClasses =
          item.tone === "success"
            ? "border-emerald-400/15 bg-emerald-400/[0.07]"
            : item.tone === "warning"
              ? "border-amber-400/15 bg-amber-400/[0.07]"
              : item.tone === "danger"
                ? "border-rose-400/15 bg-rose-400/[0.07]"
                : "border-white/8 bg-white/[0.03]"

        return (
          <div key={item.label} className={cn("rounded-[24px] border px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl", toneClasses)}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{item.label}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{item.value}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p>
          </div>
        )
      })}
    </div>
  )
}

function WorkspaceToolbar({
  search,
  filters,
}: {
  search: ReactNode
  filters?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="xl:max-w-md xl:flex-1">{search}</div>
      {filters ? <div className="flex flex-wrap gap-3">{filters}</div> : null}
    </div>
  )
}

function WorkspacePanel({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/70">{eyebrow}</p>
          <h3 className="mt-1.5 text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function WorkspaceInlineCard({
  title,
  detail,
  meta,
  status,
  actions,
}: {
  title: string
  detail: string
  meta?: string
  status?: string
  actions?: ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-black/10 px-4 py-3.5 transition-all hover:border-primary/15 hover:bg-white/[0.045]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {status ? <StatusPill label={status} /> : null}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{detail}</p>
          {meta ? <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-primary/65">{meta}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

function WorkspaceFeatureCard({
  title,
  description,
  badge,
  actions,
}: {
  title: string
  description: string
  badge?: string
  actions?: ReactNode
}) {
  return (
    <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {badge ? <StatusPill label={badge} /> : null}
      </div>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

type WorkspaceCardAction = {
  label: string
  href?: string
  onClick?: () => void
  tone?: "default" | "future"
}

type WorkspaceCardQuickActions = {
  title: string
  description: string
  actions: WorkspaceCardAction[]
}

type WorkspaceCardVisualItem = {
  label: string
  value: string
  progress?: number
}

type WorkspaceCardTone = "default" | "attention" | "critical" | "future"

function WorkspaceDashboardCard({
  cardKey,
  title,
  icon: Icon,
  value,
  context,
  href,
  badge,
  tone = "default",
  visualItems,
  primaryAction,
  secondaryAction,
  onOpenQuickActions,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDropTarget,
  dragEnabled,
}: {
  cardKey: string
  title: string
  icon: LucideIcon
  value: string
  context: string
  href?: string
  badge?: string
  tone?: WorkspaceCardTone
  visualItems: WorkspaceCardVisualItem[]
  primaryAction?: WorkspaceCardAction
  secondaryAction?: WorkspaceCardAction
  onOpenQuickActions?: () => void
  onDragStart?: (key: string) => void
  onDragOver?: (key: string) => void
  onDrop?: (key: string) => void
  onDragEnd?: () => void
  isDragging?: boolean
  isDropTarget?: boolean
  dragEnabled?: boolean
}) {
  const toneClasses =
    tone === "critical"
      ? "border-rose-400/18 bg-[linear-gradient(180deg,rgba(244,63,94,0.12),rgba(255,255,255,0.03))] shadow-[0_24px_60px_rgba(159,18,57,0.16)]"
      : tone === "attention"
        ? "border-amber-400/18 bg-[linear-gradient(180deg,rgba(251,191,36,0.10),rgba(255,255,255,0.03))] shadow-[0_24px_60px_rgba(161,98,7,0.14)]"
        : tone === "future"
          ? "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.015))] opacity-90"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_24px_60px_rgba(0,0,0,0.18)]"

  return (
    <div
      className={cn(
        "group flex h-full min-h-[252px] flex-col rounded-[28px] border p-4 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/16 hover:bg-white/[0.05]",
        toneClasses,
        isDragging ? "scale-[0.985] opacity-70" : "",
        isDropTarget ? "ring-1 ring-primary/35 ring-offset-0" : "",
      )}
      onDragOver={(event) => {
        if (!dragEnabled || !onDragOver) return
        event.preventDefault()
        onDragOver(cardKey)
      }}
      onDrop={(event) => {
        if (!dragEnabled || !onDrop) return
        event.preventDefault()
        onDrop(cardKey)
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-[20px] border border-white/10 bg-black/20 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {dragEnabled ? (
            <button
              type="button"
              draggable
              onDragStart={() => onDragStart?.(cardKey)}
              onDragEnd={onDragEnd}
              aria-label={`Reorganizar card ${title}`}
              className="rounded-full border border-white/8 bg-black/15 p-1.5 text-muted-foreground opacity-0 transition-all hover:border-white/12 hover:text-foreground group-hover:opacity-100"
            >
              <Grip className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {badge ? <StatusPill label={badge} /> : null}
        </div>
      </div>

      <p className="mt-2 min-h-[32px] text-xs leading-5 text-muted-foreground">{context}</p>

      <div className="mt-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">Leitura principal</p>
        {href ? (
          <Link href={href} className="mt-1.5 block text-[1.35rem] font-semibold tracking-tight text-foreground transition-colors hover:text-primary">
            {value}
          </Link>
        ) : (
          <p className="mt-1.5 text-[1.35rem] font-semibold tracking-tight text-foreground">{value}</p>
        )}
      </div>

      <div className="mt-3.5 flex-1 space-y-2">
        {visualItems.slice(0, 3).map((item, index) => (
          <div key={`${title}-${item.label}-${index}`} className="rounded-[18px] border border-white/8 bg-black/15 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
            {typeof item.progress === "number" ? (
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r from-primary/75 via-orange-300/75 to-amber-200/80 transition-all",
                    tone === "future" ? "opacity-55" : "",
                  )}
                  style={{ width: `${Math.max(8, Math.min(item.progress, 100))}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {primaryAction || secondaryAction || onOpenQuickActions ? (
        <div className="mt-3.5 flex items-center gap-2">
          {primaryAction ? (
            primaryAction.href ? (
              <Button asChild size="sm" className="rounded-full">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button size="sm" type="button" className="rounded-full" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )
          ) : null}
          {secondaryAction ? (
            secondaryAction.href ? (
              <Button asChild size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                type="button"
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )
          ) : null}
          {onOpenQuickActions ? (
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="ml-auto rounded-full border-white/10 bg-white/[0.03]"
              onClick={onOpenQuickActions}
              aria-label={`Abrir ações rápidas de ${title}`}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
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
  mode = "edit",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: LeadFormValues
  onChange: (field: keyof LeadFormValues, value: string) => void
  onConfirm: () => void
  saving: boolean
  mode?: "create" | "edit"
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{mode === "create" ? "Novo lead" : "Editar lead"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crie uma oportunidade rápida com origem, contato e interesse principal."
              : "Atualize os dados reais da oportunidade sem sair da operação."}
          </DialogDescription>
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
            {saving ? "Salvando..." : mode === "create" ? "Salvar lead" : "Atualizar lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type TripFormValues = {
  clientId: string
  destination: string
  origin: string
  status: string
  startsAt: string
  endsAt: string
  summary: string
}

function buildTripFormValues(record?: TripRecord): TripFormValues {
  return {
    clientId: record?.client_id ?? "",
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
  mode = "edit",
  clientOptions = [],
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: TripFormValues
  onChange: (field: keyof TripFormValues, value: string) => void
  onConfirm: () => void
  saving: boolean
  mode?: "create" | "edit"
  clientOptions?: { value: string; label: string }[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{mode === "create" ? "Nova viagem" : "Editar viagem"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crie uma viagem rápida com cliente, destino, período e status inicial sem sair do workspace."
              : "Atualize destino, datas, status e resumo da viagem com dados reais."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[62vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          {clientOptions.length > 0 ? (
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Cliente vinculado</span>
              <select
                value={values.clientId}
                onChange={(event) => onChange("clientId", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              >
                <option value="">Selecione um cliente</option>
                {clientOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
            {saving ? "Salvando..." : mode === "create" ? "Salvar viagem" : "Atualizar viagem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type QuickDocumentFormValues = {
  title: string
  type: string
  status: string
  clientId: string
  tripId: string
  templateId: string
}

function buildQuickDocumentFormValues(partial?: Partial<QuickDocumentFormValues>): QuickDocumentFormValues {
  return {
    title: partial?.title ?? "",
    type: partial?.type ?? "Documento geral",
    status: partial?.status ?? "Rascunho",
    clientId: partial?.clientId ?? "",
    tripId: partial?.tripId ?? "",
    templateId: partial?.templateId ?? "",
  }
}

function QuickDocumentDialog({
  open,
  onOpenChange,
  values,
  onChange,
  onConfirm,
  saving,
  clientOptions,
  tripOptions,
  templateOptions,
  modeLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: QuickDocumentFormValues
  onChange: (field: keyof QuickDocumentFormValues, value: string) => void
  onConfirm: () => void
  saving: boolean
  clientOptions: { value: string; label: string }[]
  tripOptions: { value: string; label: string }[]
  templateOptions: { value: string; label: string }[]
  modeLabel: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{modeLabel}</DialogTitle>
          <DialogDescription>Crie um documento operacional rápido, com template, vínculos reais e status inicial.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[62vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Título</span>
            <input
              value={values.title}
              onChange={(event) => onChange("title", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Tipo</span>
            <select
              value={values.type}
              onChange={(event) => onChange("type", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              {["Documento geral", "Contrato", "Voucher", "Recibo", "Passagem", "Template", "Roteiro", "Cotação"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Status</span>
            <select
              value={values.status}
              onChange={(event) => onChange("status", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              {["Rascunho", "Aguardando revisão", "Pronto", "Enviado"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Cliente</span>
            <select
              value={values.clientId}
              onChange={(event) => onChange("clientId", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              <option value="">Sem cliente vinculado</option>
              {clientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Viagem</span>
            <select
              value={values.tripId}
              onChange={(event) => onChange("tripId", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              <option value="">Sem viagem vinculada</option>
              {tripOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Usar template como base</span>
            <select
              value={values.templateId}
              onChange={(event) => onChange("templateId", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              <option value="">Nenhum template agora</option>
              {templateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" className="rounded-full" onClick={onConfirm} disabled={saving}>
            {saving ? "Salvando..." : "Salvar documento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type QuickFinanceFormValues = {
  type: string
  amount: string
  status: string
  category: string
  description: string
  occurredAt: string
  clientId: string
  tripId: string
}

function buildQuickFinanceFormValues(partial?: Partial<QuickFinanceFormValues>): QuickFinanceFormValues {
  return {
    type: partial?.type ?? "Receita",
    amount: partial?.amount ?? "",
    status: partial?.status ?? "Pendente",
    category: partial?.category ?? "",
    description: partial?.description ?? "",
    occurredAt: partial?.occurredAt ?? new Date().toISOString().slice(0, 10),
    clientId: partial?.clientId ?? "",
    tripId: partial?.tripId ?? "",
  }
}

function QuickFinanceDialog({
  open,
  onOpenChange,
  values,
  onChange,
  onConfirm,
  saving,
  clientOptions,
  tripOptions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: QuickFinanceFormValues
  onChange: (field: keyof QuickFinanceFormValues, value: string) => void
  onConfirm: () => void
  saving: boolean
  clientOptions: { value: string; label: string }[]
  tripOptions: { value: string; label: string }[]
}) {
  const revenueCategories = ["Pacote vendido", "Comissão", "Serviço avulso", "Taxa de consultoria", "Sinal/entrada", "Parcela recebida", "Outro"]
  const expenseCategories = ["Operadora", "Fornecedor", "Marketing", "Plataforma/SaaS", "Comissão", "Reembolso", "Impostos", "Taxas", "Outro"]
  const categoryOptions = values.type === "Receita" ? revenueCategories : expenseCategories

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>Novo lançamento</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa rápida com competência real e vínculos opcionais.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[62vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Tipo</span>
            <select
              value={values.type}
              onChange={(event) => onChange("type", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              {["Receita", "Despesa"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Valor</span>
            <input
              value={values.amount}
              onChange={(event) => onChange("amount", event.target.value)}
              inputMode="decimal"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Categoria</span>
            <select
              value={values.category}
              onChange={(event) => onChange("category", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              <option value="">Selecione uma categoria</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Status</span>
            <select
              value={values.status}
              onChange={(event) => onChange("status", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              {["Pendente", "Pago", "A receber"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Competência</span>
            <input
              type="date"
              value={values.occurredAt}
              onChange={(event) => onChange("occurredAt", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Cliente</span>
            <select
              value={values.clientId}
              onChange={(event) => onChange("clientId", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              <option value="">Sem cliente vinculado</option>
              {clientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Viagem</span>
            <select
              value={values.tripId}
              onChange={(event) => onChange("tripId", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              <option value="">Sem viagem vinculada</option>
              {tripOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Descrição</span>
            <textarea
              rows={3}
              value={values.description}
              onChange={(event) => onChange("description", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            />
          </label>
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" className="rounded-full" onClick={onConfirm} disabled={saving}>
            {saving ? "Salvando..." : "Salvar lançamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AgencyDashboardPage() {
  const [dashboard, setDashboard] = useState<AgencyDashboardData | null>(null)
  const [operational, setOperational] = useState<CentralOperationalData | null>(null)
  const [credits, setCredits] = useState<CreditsOverviewData | null>(null)
  const [reportsOverview, setReportsOverview] = useState<ReportsOverviewData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([])
  const [clientRows, setClientRows] = useState<ClientRow[]>([])
  const [leadRows, setLeadRows] = useState<LeadRow[]>([])
  const [tripRows, setTripRows] = useState<TripRow[]>([])
  const [documentRows, setDocumentRows] = useState<DocumentRow[]>([])
  const [financialRows, setFinancialRows] = useState<FinancialRecordRow[]>([])
  const [catalogProfile, setCatalogProfile] = useState<CatalogAgencyProfile | null>(null)
  const [catalogPackages, setCatalogPackages] = useState<CatalogItemResponse[]>([])
  const [selectedAttention, setSelectedAttention] = useState<DashboardPriorityItem | null>(null)
  const [activeQuickActions, setActiveQuickActions] = useState<WorkspaceCardQuickActions | null>(null)
  const [activeMicroWorkspace, setActiveMicroWorkspace] = useState<null | "clients" | "trips" | "documents" | "finance" | "leads" | "itineraries" | "quotes" | "atlas" | "operational">(null)
  const [cardOrder, setCardOrder] = useState<string[]>([])
  const [draggingCardKey, setDraggingCardKey] = useState<string | null>(null)
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isClientCreateOpen, setIsClientCreateOpen] = useState(false)
  const [clientCreateValues, setClientCreateValues] = useState<ClientFormValues>(buildClientFormValues())
  const [isLeadCreateOpen, setIsLeadCreateOpen] = useState(false)
  const [leadCreateValues, setLeadCreateValues] = useState<LeadFormValues>(buildLeadFormValues())
  const [isTripCreateOpen, setIsTripCreateOpen] = useState(false)
  const [tripCreateValues, setTripCreateValues] = useState<TripFormValues>(buildTripFormValues())
  const [isDocumentCreateOpen, setIsDocumentCreateOpen] = useState(false)
  const [documentCreateValues, setDocumentCreateValues] = useState<QuickDocumentFormValues>(buildQuickDocumentFormValues())
  const [documentDialogLabel, setDocumentDialogLabel] = useState("Novo documento")
  const [isFinanceCreateOpen, setIsFinanceCreateOpen] = useState(false)
  const [financeCreateValues, setFinanceCreateValues] = useState<QuickFinanceFormValues>(buildQuickFinanceFormValues())
  const [isSavingQuickAction, setIsSavingQuickAction] = useState(false)
  const [shareLinksByTrip, setShareLinksByTrip] = useState<Record<string, TripShareLinkSummary>>({})
  const fire = useCallback((title: string, description: string) => toast({ title, description }), [])
  const router = useRouter()

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const [
        dashboardResult,
        operationalResult,
        creditsResult,
        reportsResult,
        teamResult,
        catalogProfileResult,
        catalogPackagesResult,
        clientsResult,
        leadsResult,
        tripsResult,
        documentsResult,
        financeResult,
      ] = await Promise.allSettled([
        requestJson<AgencyDashboardData>("/api/dashboard/agency"),
        requestJson<CentralOperationalData>("/api/operational-center"),
        requestJson<CreditsOverviewData>("/api/credits/overview"),
        requestJson<ReportsOverviewData>("/api/reports/overview"),
        requestJson<TeamMemberRow[]>("/api/team"),
        requestJson<CatalogAgencyProfile>("/api/catalog/agency"),
        requestJson<CatalogItemResponse[]>("/api/catalog/packages"),
        requestJson<ClientRow[]>("/api/clients"),
        requestJson<LeadRow[]>("/api/leads"),
        requestJson<TripRow[]>("/api/trips"),
        requestJson<DocumentRow[]>("/api/documents"),
        requestJson<FinancialRecordRow[]>("/api/financial-records"),
      ])

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value)
      } else {
        throw dashboardResult.reason
      }

      setOperational(operationalResult.status === "fulfilled" ? operationalResult.value : null)
      setCredits(creditsResult.status === "fulfilled" ? creditsResult.value : null)
      setReportsOverview(reportsResult.status === "fulfilled" ? reportsResult.value : null)
      setTeamMembers(teamResult.status === "fulfilled" ? teamResult.value : [])
      setCatalogProfile(catalogProfileResult.status === "fulfilled" ? catalogProfileResult.value : null)
      setCatalogPackages(catalogPackagesResult.status === "fulfilled" ? catalogPackagesResult.value : [])
      setClientRows(clientsResult.status === "fulfilled" ? clientsResult.value : [])
      setLeadRows(leadsResult.status === "fulfilled" ? leadsResult.value : [])
      setTripRows(tripsResult.status === "fulfilled" ? tripsResult.value : [])
      setDocumentRows(documentsResult.status === "fulfilled" ? documentsResult.value : [])
      setFinancialRows(financeResult.status === "fulfilled" ? financeResult.value : [])
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyDashboardPage] failed to load dashboard", error)
      }
      setDashboard(null)
      setOperational(null)
      setCredits(null)
      setReportsOverview(null)
      setTeamMembers([])
      setCatalogProfile(null)
      setCatalogPackages([])
      setClientRows([])
      setLeadRows([])
      setTripRows([])
      setDocumentRows([])
      setFinancialRows([])
      setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o dashboard da agencia.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (typeof window === "undefined") return
    setDragEnabled(window.matchMedia("(pointer:fine)").matches)
  }, [])

  const attentionItems = dashboard?.priorities.slice(0, 4) ?? []
  const summaryCards = dashboard?.summary_cards.slice(0, 3) ?? []
  const topFeed = dashboard?.operational_feed.slice(0, 3) ?? []
  const recentDocuments = dashboard?.recent_entities.documents ?? []
  const recentTemplateCount = recentDocuments.filter((item) => normalizeDocumentType(item.type) === "Template").length
  const recentQuoteCount = recentDocuments.filter((item) => normalizeDocumentType(item.type) === "Cotação").length
  const recentItineraryCount = recentDocuments.filter((item) => normalizeDocumentType(item.type) === "Roteiro").length
  const teamActiveCount = teamMembers.filter((member) => String(member.status || "").toLowerCase().includes("ativo")).length
  const publishedCatalogCount = catalogPackages.filter((item) => {
    const status = String(item.status || "").toLowerCase()
    return status.includes("public") || status.includes("ativo")
  }).length
  const attentionCount = attentionItems.length
  const healthTone =
    dashboard?.health.tone === "danger" ? "critical" : dashboard?.health.tone === "warning" ? "attention" : "default"
  const condensedSummary = summaryCards[0]?.value || dashboard?.health.title || "Operação online"
  const clientRecords = useMemo(() => clientRows.map(mapClientRowToRecord), [clientRows])
  const leadCards = useMemo(() => leadRows.map(mapLeadRowToCard), [leadRows])
  const clientsById = useMemo(() => new Map(clientRows.map((item) => [item.id, item])), [clientRows])
  const tripsById = useMemo(() => new Map(tripRows.map((item) => [item.id, item])), [tripRows])
  const documentRecordsReal = useMemo(
    () => documentRows.map((item, index) => mapDocumentRowToRecord(item, index, { clientsById, tripsById })),
    [clientsById, documentRows, tripsById],
  )
  const clientOptions = useMemo(() => clientRecords.map((item) => ({ value: item.id, label: item.name })), [clientRecords])
  const tripOptions = useMemo(
    () => tripRows.map((item) => ({ value: item.id, label: `${item.destination}${item.starts_at ? ` • ${formatDateLabel(item.starts_at)}` : ""}` })),
    [tripRows],
  )
  const templateOptions = useMemo(
    () =>
      documentRecordsReal
        .filter((item) => normalizeDocumentType(item.type) === "Template")
        .map((item) => ({ value: item.id, label: item.title })),
    [documentRecordsReal],
  )
  const financialSnapshot = useMemo(() => {
    const pending = financialRows.filter((item) => normalizeFinanceStatus(item.status) !== "Pago")
    const pendingRevenue = pending
      .filter((item) => normalizeFinanceType(item.type) === "Receita")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const pendingExpenses = pending
      .filter((item) => normalizeFinanceType(item.type) === "Despesa")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return { pendingRevenue, pendingExpenses }
  }, [financialRows])
  const atlasSignals = useMemo(
    () => [
      (dashboard?.counts.pending_documents ?? 0) > 0 ? `${dashboard?.counts.pending_documents ?? 0} documentos aguardam revisão.` : null,
      tripRows.some((item) => !item.summary?.trim()) ? "Existe viagem sem resumo operacional completo." : null,
      (dashboard?.counts.leads_by_status.Novo ?? 0) > 0 ? `${dashboard?.counts.leads_by_status.Novo ?? 0} leads ainda não receberam retorno.` : null,
    ].filter(Boolean) as string[],
    [dashboard?.counts.leads_by_status.Novo, dashboard?.counts.pending_documents, tripRows],
  )

  const updateClientCreateValue = (field: keyof ClientFormValues, value: string) => {
    setClientCreateValues((current) => ({ ...current, [field]: value }))
  }

  const updateLeadCreateValue = (field: keyof LeadFormValues, value: string) => {
    setLeadCreateValues((current) => ({ ...current, [field]: value }))
  }

  const updateTripCreateValue = (field: keyof TripFormValues, value: string) => {
    setTripCreateValues((current) => ({ ...current, [field]: value }))
  }

  const updateDocumentCreateValue = (field: keyof QuickDocumentFormValues, value: string) => {
    setDocumentCreateValues((current) => ({ ...current, [field]: value }))
  }

  const updateFinanceCreateValue = (field: keyof QuickFinanceFormValues, value: string) => {
    setFinanceCreateValues((current) => ({ ...current, [field]: value }))
  }

  const openClientCreate = (partial?: Partial<ClientFormValues>) => {
    setActiveMicroWorkspace(null)
    setClientCreateValues({ ...buildClientFormValues(), ...partial })
    setIsClientCreateOpen(true)
  }

  const openLeadCreate = (partial?: Partial<LeadFormValues>) => {
    setActiveMicroWorkspace(null)
    setLeadCreateValues({ ...buildLeadFormValues(), ...partial })
    setIsLeadCreateOpen(true)
  }

  const openTripCreate = (partial?: Partial<TripFormValues>) => {
    setActiveMicroWorkspace(null)
    setTripCreateValues({ ...buildTripFormValues(), ...partial })
    setIsTripCreateOpen(true)
  }

  const openDocumentCreate = (partial?: Partial<QuickDocumentFormValues>, label = "Novo documento") => {
    setActiveMicroWorkspace(null)
    setDocumentCreateValues(buildQuickDocumentFormValues(partial))
    setDocumentDialogLabel(label)
    setIsDocumentCreateOpen(true)
  }

  const openFinanceCreate = (partial?: Partial<QuickFinanceFormValues>) => {
    setActiveMicroWorkspace(null)
    setFinanceCreateValues(buildQuickFinanceFormValues(partial))
    setIsFinanceCreateOpen(true)
  }

  const withQuickActionSaving = async (action: () => Promise<void>) => {
    setIsSavingQuickAction(true)
    try {
      await action()
    } finally {
      setIsSavingQuickAction(false)
    }
  }

  const handleCreateClient = async () => {
    if (!clientCreateValues.name.trim()) {
      fire("Informe o nome", "Preencha o nome do cliente para salvar o cadastro rápido.")
      return
    }

    await withQuickActionSaving(async () => {
      await requestJson<ClientRow>("/api/clients", {
        method: "POST",
        body: JSON.stringify(buildClientPayload(clientCreateValues)),
      })
      setIsClientCreateOpen(false)
      setClientCreateValues(buildClientFormValues())
      await loadDashboard()
      fire("Cliente criado", "O cliente foi salvo e já entrou no workspace operacional.")
    })
  }

  const handleCreateLead = async () => {
    if (!leadCreateValues.name.trim()) {
      fire("Informe o nome", "Preencha o nome do lead para registrar a oportunidade.")
      return
    }

    await withQuickActionSaving(async () => {
      await requestJson<LeadRow>("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          name: leadCreateValues.name.trim(),
          email: leadCreateValues.email.trim() || null,
          phone: leadCreateValues.phone.trim() || null,
          origin: leadCreateValues.origin.trim() || null,
          destination: leadCreateValues.destination.trim() || null,
          status: leadCreateValues.status.trim() || "Novo lead",
          temperature: leadCreateValues.temperature.trim() || null,
          notes: leadCreateValues.notes.trim() || null,
        }),
      })
      setIsLeadCreateOpen(false)
      setLeadCreateValues(buildLeadFormValues())
      await loadDashboard()
      fire("Lead criado", "A oportunidade entrou no pipeline rápido do dashboard.")
    })
  }

  const handleCreateTrip = async () => {
    if (!tripCreateValues.destination.trim()) {
      fire("Informe o destino", "Defina o destino da viagem para concluir a criação rápida.")
      return
    }

    await withQuickActionSaving(async () => {
      await requestJson<TripRow>("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          destination: tripCreateValues.destination.trim(),
          origin: tripCreateValues.origin.trim() || null,
          status: tripCreateValues.status.trim() || "Planejamento",
          starts_at: tripCreateValues.startsAt || null,
          ends_at: tripCreateValues.endsAt || null,
          summary: tripCreateValues.summary.trim() || null,
          client_id: tripCreateValues.clientId || null,
        }),
      })
      setIsTripCreateOpen(false)
      setTripCreateValues(buildTripFormValues())
      await loadDashboard()
      fire("Viagem criada", "A viagem já aparece no fluxo operacional da agência.")
    })
  }

  const handleCreateDocument = async () => {
    if (!documentCreateValues.title.trim()) {
      fire("Informe o título", "Preencha o título para salvar o documento rápido.")
      return
    }

    const selectedTemplate = documentRows.find((item) => item.id === documentCreateValues.templateId)

    await withQuickActionSaving(async () => {
      await requestJson<DocumentRow>("/api/documents", {
        method: "POST",
        body: JSON.stringify({
          title: documentCreateValues.title.trim(),
          type: documentCreateValues.type,
          status: documentCreateValues.status,
          client_id: documentCreateValues.clientId || null,
          trip_id: documentCreateValues.tripId || null,
          metadata: selectedTemplate
            ? {
                source_template_id: selectedTemplate.id,
                source_template_title: selectedTemplate.title,
              }
            : undefined,
        }),
      })
      setIsDocumentCreateOpen(false)
      setDocumentCreateValues(buildQuickDocumentFormValues())
      await loadDashboard()
      fire("Documento criado", "O item foi salvo na central documental com os vínculos definidos.")
    })
  }

  const handleCreateFinance = async () => {
    const amount = Number(String(financeCreateValues.amount).replace(",", "."))
    if (!Number.isFinite(amount) || amount <= 0) {
      fire("Informe um valor válido", "Preencha o valor do lançamento antes de salvar.")
      return
    }

    await withQuickActionSaving(async () => {
      await requestJson<FinancialRecordRow | FinancialRecordRow[]>("/api/financial-records", {
        method: "POST",
        body: JSON.stringify({
          type: financeCreateValues.type,
          amount,
          status: financeCreateValues.status,
          category: financeCreateValues.category || null,
          description: financeCreateValues.description.trim() || null,
          occurred_at: financeCreateValues.occurredAt || null,
          client_id: financeCreateValues.clientId || null,
          trip_id: financeCreateValues.tripId || null,
          plan_mode: "Único",
        }),
      })
      setIsFinanceCreateOpen(false)
      setFinanceCreateValues(buildQuickFinanceFormValues())
      await loadDashboard()
      fire("Lançamento criado", "O financeiro foi atualizado com a competência informada.")
    })
  }

  const handleMarkFinanceAsPaid = async (recordId: string) => {
    await withQuickActionSaving(async () => {
      await requestJson<FinancialRecordRow>(`/api/finance/${recordId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Pago" }),
      })
      await loadDashboard()
      fire("Pagamento registrado", "O lançamento foi atualizado para pago.")
    })
  }

  const handleUpdateDocumentStatus = async (recordId: string, status: string, successMessage: string) => {
    await withQuickActionSaving(async () => {
      await requestJson<DocumentRow>(`/api/documents/${recordId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      await loadDashboard()
      fire("Documento atualizado", successMessage)
    })
  }

  const handleTripStatusUpdate = async (tripId: string, status: string) => {
    await withQuickActionSaving(async () => {
      await requestJson<TripRow>(`/api/trips/${tripId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      await loadDashboard()
      fire("Viagem atualizada", "O status da viagem foi ajustado no workspace.")
    })
  }

  const handleEnsureShareLink = async (tripId: string) => {
    const existing = shareLinksByTrip[tripId]
    if (existing?.token) return existing

    const result = await requestJson<TripShareLinkSummary>(`/api/trips/${tripId}/share-link`, {
      method: "POST",
    })
    setShareLinksByTrip((current) => ({ ...current, [tripId]: result }))
    return result
  }

  const handleCopyTripLink = async (tripId: string) => {
    await withQuickActionSaving(async () => {
      const link = await handleEnsureShareLink(tripId)
      const publicUrl = link.public_url || `${window.location.origin}/v/${link.token}`
      await navigator.clipboard.writeText(publicUrl)
      fire("Link copiado", "O link público da viagem foi copiado para compartilhar com o cliente.")
    })
  }

  const handleOpenTripLink = async (tripId: string) => {
    const popup = window.open("about:blank", "_blank", "noopener,noreferrer")
    await withQuickActionSaving(async () => {
      try {
        const link = await handleEnsureShareLink(tripId)
        if (popup) {
          popup.location.href = link.public_url || `/v/${link.token}`
        } else {
          window.open(link.public_url || `/v/${link.token}`, "_blank", "noopener,noreferrer")
        }
        fire("Link aberto", "A experiência pública da viagem foi aberta em uma nova aba.")
      } catch (error) {
        popup?.close()
        throw error
      }
    })
  }

  const handleDisableTripLink = async (tripId: string) => {
    await withQuickActionSaving(async () => {
      const result = await requestJson<TripShareLinkSummary>(`/api/trips/${tripId}/share-link`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: false }),
      })
      setShareLinksByTrip((current) => ({ ...current, [tripId]: result }))
      fire("Link desativado", "O compartilhamento público desta viagem foi pausado.")
    })
  }

  const openQuickActions = (title: string, description: string, actions: WorkspaceCardAction[]) => {
    setActiveQuickActions({ title, description, actions })
  }

  const workspaceCards = [
    {
      key: "financeiro",
      span: "xl:col-span-3",
      title: "Financeiro",
      icon: HandCoins,
      value: formatMoney(dashboard?.finance_snapshot.balance ?? 0),
      context: dashboard?.finance_snapshot.note || "Receitas, despesas, caixa e pendências reais da agência.",
      href: "/app/financeiro",
      badge: (dashboard?.finance_snapshot.pending_revenue ?? 0) > 0 ? "Atenção" : "Estável",
      tone: (dashboard?.finance_snapshot.pending_revenue ?? 0) > 0 ? "attention" : "default",
      visualItems: [
        { label: "Receitas", value: formatMoney(dashboard?.finance_snapshot.total_revenue ?? 0), progress: 76 },
        { label: "Despesas", value: formatMoney(dashboard?.finance_snapshot.total_expenses ?? 0), progress: 48 },
        { label: "A receber", value: formatMoney(dashboard?.finance_snapshot.pending_revenue ?? 0), progress: 34 },
      ],
      primaryAction: { label: "Novo lançamento", onClick: () => openFinanceCreate() },
      secondaryAction: { label: "Ver pendências", onClick: () => setActiveMicroWorkspace("finance") },
      quickActions: [
        { label: "Novo lançamento", onClick: () => openFinanceCreate() },
        { label: "Ver pendências", onClick: () => setActiveMicroWorkspace("finance") },
        { label: "Abrir financeiro", href: "/app/financeiro" },
      ],
    },
    {
      key: "viagens",
      span: "xl:col-span-3",
      title: "Viagens",
      icon: PlaneTakeoff,
      value: `${dashboard?.counts.active_trips ?? 0} em andamento`,
      context: `${dashboard?.counts.upcoming_trips ?? 0} embarques próximos com operação ativa e compartilhamento pronto.`,
      href: "/app/viagens",
      badge: (dashboard?.counts.upcoming_trips ?? 0) > 0 ? "Hoje" : "Estável",
      tone: (dashboard?.counts.upcoming_trips ?? 0) > 0 ? "attention" : "default",
      visualItems: (dashboard?.recent_entities.trips ?? []).slice(0, 3).map((trip, index) => ({
        label: trip.destination || `Viagem ${index + 1}`,
        value: trip.status || "Planejamento",
        progress: trip.status?.includes("Confirm") ? 84 : trip.status?.includes("andamento") ? 96 : 52,
      })),
      primaryAction: { label: "Nova viagem", onClick: () => openTripCreate() },
      secondaryAction: { label: "Abrir workspace", onClick: () => setActiveMicroWorkspace("trips") },
      quickActions: [
        { label: "Nova viagem", onClick: () => openTripCreate() },
        { label: "Compartilhar viagem", onClick: () => setActiveMicroWorkspace("trips") },
        { label: "Abrir viagens", href: "/app/viagens" },
      ],
    },
    {
      key: "documentos",
      span: "xl:col-span-3",
      title: "Documentos",
      icon: FileText,
      value: `${dashboard?.counts.pending_documents ?? 0} pendentes`,
      context: `${dashboard?.counts.emitted_documents ?? 0} documentos emitidos com leitura real da central documental.`,
      href: "/app/documentos",
      badge: (dashboard?.counts.pending_documents ?? 0) > 0 ? "Revisar" : "Em dia",
      tone: (dashboard?.counts.pending_documents ?? 0) > 0 ? "attention" : "default",
      visualItems: recentDocuments.slice(0, 3).map((document, index) => ({
        label: document.title || `Documento ${index + 1}`,
        value: normalizeDocumentType(document.type),
        progress: document.status?.toLowerCase().includes("rascunho") ? 36 : document.status?.toLowerCase().includes("pend") ? 52 : 88,
      })),
      primaryAction: { label: "Novo documento", onClick: () => openDocumentCreate({}, "Novo documento") },
      secondaryAction: { label: "Abrir central", onClick: () => setActiveMicroWorkspace("documents") },
      quickActions: [
        { label: "Novo documento", onClick: () => openDocumentCreate({}, "Novo documento") },
        { label: "Gerar contrato", onClick: () => openDocumentCreate({ type: "Contrato" }, "Novo contrato") },
        { label: "Abrir central documental", href: "/app/documentos" },
      ],
    },
    {
      key: "clientes",
      span: "xl:col-span-3",
      title: "Clientes",
      icon: Users,
      value: `${dashboard?.counts.clients ?? 0} ativos`,
      context: "Relacionamento, vínculos e base viva da agência.",
      href: "/app/clientes",
      badge: (dashboard?.recent_entities.clients.length ?? 0) > 0 ? "Recentes" : "Base vazia",
      visualItems: (dashboard?.recent_entities.clients ?? []).slice(0, 3).map((client, index) => ({
        label: client.name || `Cliente ${index + 1}`,
        value: client.email || client.phone || "Cadastro recente",
        progress: 70 - index * 12,
      })),
      primaryAction: { label: "Novo cliente", onClick: () => openClientCreate() },
      secondaryAction: { label: "Clientes recentes", onClick: () => setActiveMicroWorkspace("clients") },
      quickActions: [
        { label: "Novo cliente", onClick: () => openClientCreate() },
        { label: "Clientes recentes", onClick: () => setActiveMicroWorkspace("clients") },
        { label: "Abrir CRM", href: "/app/clientes" },
      ],
    },
    {
      key: "leads",
      span: "xl:col-span-3",
      title: "Leads",
      icon: Waypoints,
      value: `${dashboard?.counts.leads ?? 0} no funil`,
      context: "Qualificação comercial e próximos avanços do pipeline.",
      href: "/app/leads",
      badge: Object.keys(dashboard?.counts.leads_by_status ?? {}).length > 0 ? "Pipeline" : "Sem sinais",
      tone: (dashboard?.counts.leads_by_status.Novo ?? 0) > 0 ? "attention" : "default",
      visualItems: Object.entries(dashboard?.counts.leads_by_status ?? {}).slice(0, 3).map(([status, amount], index) => ({
        label: status,
        value: `${amount}`,
        progress: 75 - index * 15,
      })),
      primaryAction: { label: "Novo lead", onClick: () => openLeadCreate() },
      secondaryAction: { label: "Pipeline rápido", onClick: () => setActiveMicroWorkspace("leads") },
      quickActions: [
        { label: "Novo lead", onClick: () => openLeadCreate() },
        { label: "Pendências", onClick: () => setActiveMicroWorkspace("leads") },
        { label: "Abrir pipeline", href: "/app/leads" },
      ],
    },
    {
      key: "roteiros",
      span: "xl:col-span-3",
      title: "Roteiros",
      icon: Route,
      value: recentItineraryCount > 0 ? `${recentItineraryCount} recentes` : "Sem novos roteiros",
      context: "Experiência do cliente, jornada e resumo operacional da viagem.",
      href: "/app/viagens/roteiros",
      badge: recentItineraryCount > 0 ? "Atualizado" : "Biblioteca pronta",
      visualItems: recentDocuments
        .filter((item) => normalizeDocumentType(item.type) === "Roteiro")
        .slice(0, 3)
        .map((item, index) => ({
          label: item.title || `Roteiro ${index + 1}`,
          value: item.status || "Pronto",
          progress: item.status?.toLowerCase().includes("rascunho") ? 42 : 84,
        })),
      primaryAction: { label: "Novo roteiro", onClick: () => openDocumentCreate({ type: "Roteiro" }, "Novo roteiro") },
      secondaryAction: { label: "Workspace", onClick: () => setActiveMicroWorkspace("itineraries") },
      quickActions: [
        { label: "Novo roteiro", onClick: () => openDocumentCreate({ type: "Roteiro" }, "Novo roteiro") },
        { label: "Templates", href: "/app/documentos/templates" },
        { label: "Abrir roteiros", href: "/app/viagens/roteiros" },
      ],
    },
    {
      key: "cotacoes",
      span: "xl:col-span-3",
      title: "Cotações",
      icon: Receipt,
      value: recentQuoteCount > 0 ? `${recentQuoteCount} recentes` : "Sem novas cotações",
      context: "Propostas, follow-up comercial e conversão em viagem real.",
      href: "/app/viagens/cotacoes",
      badge: recentQuoteCount > 0 ? "Em negociação" : "Fluxo pronto",
      visualItems: recentDocuments
        .filter((item) => normalizeDocumentType(item.type) === "Cotação")
        .slice(0, 3)
        .map((item, index) => ({
          label: item.title || `Cotação ${index + 1}`,
          value: item.status || "Rascunho",
          progress: item.status?.toLowerCase().includes("aprov") ? 88 : 48 + index * 10,
        })),
      primaryAction: { label: "Nova cotação", onClick: () => openDocumentCreate({ type: "Cotação" }, "Nova cotação") },
      secondaryAction: { label: "Workspace", onClick: () => setActiveMicroWorkspace("quotes") },
      quickActions: [
        { label: "Nova cotação", onClick: () => openDocumentCreate({ type: "Cotação" }, "Nova cotação") },
        { label: "Pendências", onClick: () => setActiveMicroWorkspace("quotes") },
        { label: "Abrir cotações", href: "/app/viagens/cotacoes" },
      ],
    },
    {
      key: "templates",
      span: "xl:col-span-3",
      title: "Templates",
      icon: FileBadge,
      value: recentTemplateCount > 0 ? `${recentTemplateCount} recentes` : "Biblioteca pronta",
      context: "Blocos reutilizáveis para documentos, relatórios e roteiros.",
      href: "/app/documentos/templates",
      badge: recentTemplateCount > 0 ? "Reutilizável" : "Em preparo",
      visualItems:
        recentTemplateCount > 0
          ? recentDocuments
              .filter((item) => normalizeDocumentType(item.type) === "Template")
              .slice(0, 3)
              .map((item, index) => ({
                label: item.title || `Template ${index + 1}`,
                value: item.status || "Ativo",
                progress: item.status?.toLowerCase().includes("inativo") ? 25 : 80 - index * 10,
              }))
          : [
              { label: "Modelos ativos", value: "Prontos para edição", progress: 72 },
              { label: "Uso como base", value: "Disponível", progress: 66 },
              { label: "Biblioteca visual", value: "Organizada por tipo", progress: 61 },
            ],
      primaryAction: { label: "Novo template", href: "/app/documentos/templates" },
      secondaryAction: { label: "Biblioteca", href: "/app/documentos/templates" },
      quickActions: [
        { label: "Novo template", href: "/app/documentos/templates" },
        { label: "Biblioteca", href: "/app/documentos/templates" },
        { label: "Usar como base", href: "/app/documentos/templates" },
      ],
    },
    {
      key: "equipe",
      span: "xl:col-span-3",
      title: "Equipe",
      icon: Users,
      value: `${teamMembers.length} membros`,
      context: "Permissões visuais, status e ritmo de acesso da operação.",
      href: "/app/equipe",
      badge: teamActiveCount > 0 ? `${teamActiveCount} ativos` : "Sem acessos",
      visualItems: teamMembers.slice(0, 3).map((member, index) => ({
        label: member.name || `Membro ${index + 1}`,
        value: member.status || member.role || "Ativo",
        progress: String(member.status || "").toLowerCase().includes("ativo") ? 82 : 34,
      })),
      primaryAction: { label: "Adicionar", href: "/app/equipe/novo" },
      secondaryAction: { label: "Abrir equipe", href: "/app/equipe" },
      quickActions: [
        { label: "Adicionar membro", href: "/app/equipe/novo" },
        { label: "Abrir equipe", href: "/app/equipe" },
        { label: "Convidar", onClick: () => fire("Em breve", "O convite avançado por e-mail será liberado quando o fluxo de equipe evoluir.") },
      ],
    },
    {
      key: "relatorios",
      span: "xl:col-span-3",
      title: "Relatórios",
      icon: CalendarClock,
      value: `${reportsOverview?.recent_reports.length ?? 0} recentes`,
      context: reportsOverview?.preview.title || "Resumo operacional e exportações rápidas da agência.",
      href: "/app/central-operacional/relatorios",
      badge: reportsOverview?.recent_reports.length ? "Atualizado" : "Sem histórico",
      visualItems:
        reportsOverview?.preview.lines.slice(0, 3).map((line, index) => ({
          label: `Leitura ${index + 1}`,
          value: line,
          progress: 84 - index * 14,
        })) ?? [],
      primaryAction: { label: "Gerar relatório", href: "/app/central-operacional/relatorios/novo" },
      secondaryAction: { label: "Abrir relatórios", href: "/app/central-operacional/relatorios" },
      quickActions: [
        { label: "Gerar relatório", href: "/app/central-operacional/relatorios/novo" },
        { label: "Abrir relatórios", href: "/app/central-operacional/relatorios" },
        { label: "Exportar", onClick: () => fire("Em breve", "A exportação rápida contextual será refinada na próxima etapa do workspace.") },
      ],
    },
    {
      key: "catalogo",
      span: "xl:col-span-3",
      title: "Catálogo",
      icon: Target,
      value: `${catalogPackages.length} pacotes`,
      context: catalogProfile?.public_url || "Vitrine pública da agência, branding e publicação de ofertas.",
      href: "/app/catalogo",
      badge: publishedCatalogCount > 0 ? `${publishedCatalogCount} publicados` : "Sem publicação",
      visualItems: catalogPackages.slice(0, 3).map((item, index) => ({
        label: item.title || `Pacote ${index + 1}`,
        value: item.status || "Rascunho",
        progress: String(item.status || "").toLowerCase().includes("public") ? 82 : 36,
      })),
      primaryAction: { label: "Abrir catálogo", href: "/app/catalogo" },
      secondaryAction: catalogProfile?.slug ? { label: "Ver vitrine", href: `/catalogo/${catalogProfile.slug}` } : { label: "Ver vitrine", href: "/app/catalogo" },
      quickActions: [
        { label: "Abrir catálogo", href: "/app/catalogo" },
        catalogProfile?.slug ? { label: "Ver vitrine", href: `/catalogo/${catalogProfile.slug}` } : { label: "Ver vitrine", href: "/app/catalogo" },
        { label: "Novo pacote", href: "/app/catalogo/pacotes/novo" },
      ],
    },
    {
      key: "creditos",
      span: "xl:col-span-3",
      title: "Créditos",
      icon: CreditCard,
      value: `${credits?.balance ?? 0} disponíveis`,
      context: "Consumo operacional, origem das ações e saldo para expansões futuras.",
      href: "/app/creditos",
      badge: (credits?.balance ?? 0) > 0 ? "Operação ativa" : "Revisar saldo",
      tone: (credits?.balance ?? 0) <= 0 ? "attention" : "default",
      visualItems:
        credits?.by_feature.slice(0, 3).map((item, index) => ({
          label: item.feature,
          value: `${item.amount}`,
          progress: 82 - index * 16,
        })) ?? [],
      primaryAction: { label: "Abrir créditos", href: "/app/creditos" },
      secondaryAction: { label: "Ver histórico", href: "/app/creditos" },
      quickActions: [
        { label: "Abrir créditos", href: "/app/creditos" },
        { label: "Ver histórico", href: "/app/creditos" },
        { label: "Comprar créditos", onClick: () => fire("Em breve", "A compra operacional de créditos será ligada a billing em uma fase futura.") },
      ],
    },
    {
      key: "central",
      span: "xl:col-span-3",
      title: "Central Operacional",
      icon: CheckCheck,
      value: `${operational?.priorities.length ?? 0} prioridades`,
      context: "Tarefas, prioridades reais e sinais vivos da rotina da agência.",
      href: "/app/central-operacional",
      badge: (operational?.priorities.length ?? 0) > 0 ? "Em foco" : "Tudo sob controle",
      tone: (operational?.priorities.length ?? 0) > 2 ? "attention" : "default",
      visualItems:
        operational?.statuses.slice(0, 3).map((item, index) => ({
          label: item.label,
          value: item.value,
          progress: 86 - index * 15,
        })) ?? [],
      primaryAction: { label: "Abrir prioridades", onClick: () => setActiveMicroWorkspace("operational") },
      secondaryAction: { label: "Ver tarefas", href: "/app/central-operacional/tarefas" },
      quickActions: [
        { label: "Abrir prioridades", onClick: () => setActiveMicroWorkspace("operational") },
        { label: "Ver tarefas", href: "/app/central-operacional/tarefas" },
        { label: "Criar tarefa agora", href: "/app/central-operacional/tarefas/nova" },
      ],
    },
    {
      key: "atlas",
      span: "xl:col-span-3",
      title: "Atlas",
      icon: Bot,
      value: atlasSignals.length ? `${atlasSignals.length} sinais` : "Suporte pronto",
      context: "Copiloto operacional para orientar o uso do TravelPro sem virar chatbot genérico.",
      href: "/app/atlas-advisor",
      badge: "Contextual",
      visualItems:
        (atlasSignals.length > 0 ? atlasSignals : dashboard?.advisor_recommendations ?? []).slice(0, 3).map((item, index) => ({
          label: `Sugestão ${index + 1}`,
          value: item,
          progress: 80 - index * 11,
        })) ?? [],
      primaryAction: { label: "Abrir Atlas", onClick: () => setActiveMicroWorkspace("atlas") },
      secondaryAction: { label: "Preciso de ajuda", onClick: () => setActiveMicroWorkspace("atlas") },
      quickActions: [
        { label: "Abrir Atlas", onClick: () => setActiveMicroWorkspace("atlas") },
        { label: "Preciso de ajuda", onClick: () => setActiveMicroWorkspace("atlas") },
        { label: "Guia operacional", href: "/app/atlas-advisor" },
      ],
    },
    {
      key: "expansoes",
      span: "xl:col-span-3",
      title: "Expansões premium",
      icon: Sparkles,
      value: "Disponíveis para ativação",
      context: "TravelPro Go, Agent, Match, WhatsApp IA, Marketing IA, Advisor e automações seguem como módulos preparados.",
      href: "/app/planos",
      badge: "Em breve",
      tone: "future",
      visualItems: [
        { label: "TravelPro Go", value: "Espaço reservado no fluxo", progress: 42 },
        { label: "Match + catálogo", value: "Pronto para próxima fase", progress: 56 },
        { label: "Marketing + automações", value: "Aguardando ativação", progress: 38 },
      ],
      primaryAction: { label: "Ver expansões", href: "/app/planos" },
      secondaryAction: {
        label: "Quero ativar",
        onClick: () => fire("Em breve", "As expansões premium continuam preparadas visualmente e serão ativadas em fases posteriores."),
      },
      quickActions: [
        { label: "Ver expansões", href: "/app/planos" },
        { label: "Quero ativar", onClick: () => fire("Em breve", "As expansões premium continuam preparadas visualmente e serão ativadas em fases posteriores.") },
        { label: "Falar com comercial", onClick: () => fire("Em breve", "O fluxo comercial das expansões será conectado em uma próxima fase.") },
      ],
    },
  ]

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("travelpro:agency-workspace-order:v2")
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as string[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCardOrder(parsed)
      }
    } catch {
      window.localStorage.removeItem("travelpro:agency-workspace-order:v2")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (cardOrder.length === 0) return
    window.localStorage.setItem("travelpro:agency-workspace-order:v2", JSON.stringify(cardOrder))
  }, [cardOrder])

  const orderedWorkspaceCards = (() => {
    if (cardOrder.length === 0) return workspaceCards
    const cardMap = new Map(workspaceCards.map((card) => [card.key, card]))
    const ordered = cardOrder.map((key) => cardMap.get(key)).filter(Boolean)
    const missing = workspaceCards.filter((card) => !cardOrder.includes(card.key))
    return [...ordered, ...missing]
  })()

  const handleDragStart = (key: string) => {
    if (!dragEnabled) return
    setDraggingCardKey(key)
    setDropTargetKey(key)
  }

  const handleDragOver = (key: string) => {
    if (!dragEnabled || !draggingCardKey || draggingCardKey === key) return
    setDropTargetKey(key)
  }

  const handleDrop = (key: string) => {
    if (!dragEnabled || !draggingCardKey || draggingCardKey === key) {
      setDraggingCardKey(null)
      setDropTargetKey(null)
      return
    }

    const sourceOrder = cardOrder.length > 0 ? [...cardOrder] : workspaceCards.map((card) => card.key)
    const fromIndex = sourceOrder.indexOf(draggingCardKey)
    const toIndex = sourceOrder.indexOf(key)

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingCardKey(null)
      setDropTargetKey(null)
      return
    }

    const nextOrder = [...sourceOrder]
    const [moved] = nextOrder.splice(fromIndex, 1)
    nextOrder.splice(toIndex, 0, moved)
    setCardOrder(nextOrder)
    setDraggingCardKey(null)
    setDropTargetKey(null)
  }

  const handleDragEnd = () => {
    setDraggingCardKey(null)
    setDropTargetKey(null)
  }

  const recentClientRecords = clientRecords.slice(0, 4)
  const recentLeadCards = leadCards.slice(0, 4)
  const recentTripRows = [...tripRows]
    .sort((left, right) => new Date(left.starts_at ?? left.created_at).getTime() - new Date(right.starts_at ?? right.created_at).getTime())
    .slice(0, 4)
  const pendingDocumentRecords = documentRecordsReal
    .filter((item) => ["Rascunho", "Aguardando revisão", "Pendente"].some((status) => String(item.status || "").includes(status)))
    .slice(0, 4)
  const itineraryRecords = documentRecordsReal.filter((item) => normalizeDocumentType(item.type) === "Roteiro").slice(0, 4)
  const quoteRecords = documentRecordsReal.filter((item) => normalizeDocumentType(item.type) === "Cotação").slice(0, 4)
  const recentFinanceRows = [...financialRows]
    .sort((left, right) => new Date(right.occurred_at ?? right.created_at).getTime() - new Date(left.occurred_at ?? left.created_at).getTime())
    .slice(0, 4)

  return (
    <PageShell>
      <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-primary/68">Workspace operacional</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-foreground">Sua operação está ativa hoje.</p>
              <span className="text-sm text-muted-foreground">
                {attentionCount > 0 ? `${attentionCount} ponto${attentionCount > 1 ? "s" : ""} pedem atenção.` : condensedSummary}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs", healthTone === "critical" ? "border-rose-400/18 bg-rose-400/10 text-rose-100/85" : healthTone === "attention" ? "border-amber-400/18 bg-amber-400/10 text-amber-100/85" : "border-emerald-400/15 bg-emerald-400/10 text-emerald-100/85")}>
              <span className="font-medium">{dashboard?.health.title || "Operacao ativa"}</span>
            </div>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/app/viagens/nova">Nova viagem</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/central-operacional">Abrir central</Link>
            </Button>
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar o workspace agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4 shadow-[0_20px_64px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/70">Inteligência operacional</p>
            <h3 className="mt-1.5 text-base font-semibold text-foreground">
              {attentionCount > 0
                ? `Você tem ${attentionCount} ponto${attentionCount > 1 ? "s" : ""} de atenção hoje.`
                : "Sua operação está estável agora."}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Clique em um sinal para abrir o contexto certo e resolver sem navegar por telas pesadas.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
            <Link href="/app/central-operacional">Abrir central operacional</Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <div key={`attention-skeleton-${index}`} className="h-28 animate-pulse rounded-[24px] bg-white/[0.05]" />)
            : attentionItems.length > 0
              ? attentionItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => setSelectedAttention(item)}
                    className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 text-left transition-all hover:border-primary/18 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <StatusPill label={item.value} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.hint}</p>
                  </button>
                ))
              : (
                  <div className="lg:col-span-4 rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">
                    Nenhuma prioridade crítica agora. Continue alimentando clientes, viagens, documentos e financeiro para manter o workspace vivo.
                  </div>
                )}
        </div>
      </div>

      <div className="grid auto-rows-fr gap-4 xl:grid-cols-12">
        {isLoading
          ? Array.from({ length: 11 }).map((_, index) => (
              <div key={`workspace-card-skeleton-${index}`} className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 animate-pulse xl:col-span-3">
                <div className="h-4 w-28 rounded-full bg-white/10" />
                <div className="mt-5 h-7 w-32 rounded-full bg-white/10" />
                <div className="mt-6 space-y-2">
                  <div className="h-12 rounded-[20px] bg-white/10" />
                  <div className="h-12 rounded-[20px] bg-white/10" />
                  <div className="h-12 rounded-[20px] bg-white/10" />
                </div>
              </div>
            ))
          : orderedWorkspaceCards.map((card) => {
              const { quickActions, ...cardProps } = card
              return (
              <div key={card.key} className={card.span}>
                <WorkspaceDashboardCard
                  cardKey={card.key}
                  {...cardProps}
                  onOpenQuickActions={() =>
                    openQuickActions(
                      card.title,
                      card.context,
                      quickActions,
                    )
                  }
                  dragEnabled={dragEnabled}
                  isDragging={draggingCardKey === card.key}
                  isDropTarget={dropTargetKey === card.key && draggingCardKey !== card.key}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              </div>
            )})}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/70">Fluxo da operação</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">O que está se movendo agora</h3>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/central-operacional">Ver tudo</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <div key={`feed-skeleton-${index}`} className="h-20 animate-pulse rounded-[24px] bg-white/[0.05]" />)
            ) : topFeed.length > 0 ? (
              topFeed.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-3 rounded-[24px] border border-white/8 bg-black/15 px-4 py-3.5 transition-all hover:border-primary/16 hover:bg-white/[0.04]"
                >
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(249,115,22,0.55)]" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <StatusPill label={item.time} />
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">
                Ainda não há eventos reais suficientes para esse micro feed.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/70">Notas rápidas</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">Leitura curta da agência</h3>
          <div className="mt-5 space-y-3">
            {(dashboard?.operation_notes ?? []).length > 0 ? (
              (dashboard?.operation_notes ?? []).slice(0, 4).map((item) => (
                <div key={item} className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">
                O sistema ainda está coletando sinais suficientes para resumir a operação com mais profundidade.
              </div>
            )}
          </div>
        </div>
      </div>

      <ClientEditorDialog
        open={isClientCreateOpen}
        onOpenChange={setIsClientCreateOpen}
        mode="create"
        values={clientCreateValues}
        onChange={updateClientCreateValue}
        onConfirm={handleCreateClient}
        saving={isSavingQuickAction}
      />

      <LeadEditorDialog
        open={isLeadCreateOpen}
        onOpenChange={setIsLeadCreateOpen}
        mode="create"
        values={leadCreateValues}
        onChange={updateLeadCreateValue}
        onConfirm={handleCreateLead}
        saving={isSavingQuickAction}
      />

      <TripEditorDialog
        open={isTripCreateOpen}
        onOpenChange={setIsTripCreateOpen}
        mode="create"
        values={tripCreateValues}
        onChange={updateTripCreateValue}
        onConfirm={handleCreateTrip}
        saving={isSavingQuickAction}
        clientOptions={clientOptions}
      />

      <QuickDocumentDialog
        open={isDocumentCreateOpen}
        onOpenChange={setIsDocumentCreateOpen}
        values={documentCreateValues}
        onChange={updateDocumentCreateValue}
        onConfirm={handleCreateDocument}
        saving={isSavingQuickAction}
        clientOptions={clientOptions}
        tripOptions={tripOptions}
        templateOptions={templateOptions}
        modeLabel={documentDialogLabel}
      />

      <QuickFinanceDialog
        open={isFinanceCreateOpen}
        onOpenChange={setIsFinanceCreateOpen}
        values={financeCreateValues}
        onChange={updateFinanceCreateValue}
        onConfirm={handleCreateFinance}
        saving={isSavingQuickAction}
        clientOptions={clientOptions}
        tripOptions={tripOptions}
      />

      <Dialog open={Boolean(activeMicroWorkspace)} onOpenChange={(open) => (!open ? setActiveMicroWorkspace(null) : null)}>
        <DialogContent className="max-w-4xl border-white/10 bg-[#0e0b0c]/96 p-0 shadow-[0_34px_120px_rgba(0,0,0,0.58)]">
          {activeMicroWorkspace ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>
                  {{
                    clients: "Clientes em foco",
                    trips: "Viagens em andamento",
                    documents: "Central documental rápida",
                    finance: "Financeiro rápido",
                    leads: "Pipeline rápido",
                    itineraries: "Roteiros recentes",
                    quotes: "Cotações recentes",
                    atlas: "Atlas operacional",
                    operational: "Central operacional viva",
                  }[activeMicroWorkspace]}
                </DialogTitle>
                <DialogDescription>
                  {{
                    clients: "Resolva relacionamento, vínculos e próximos movimentos do cliente sem sair do workspace.",
                    trips: "Acompanhe embarques, compartilhe links e destrave a operação principal em poucos cliques.",
                    documents: "Crie, revise e encaminhe documentos com contexto real da viagem.",
                    finance: "Veja pendências, últimas movimentações e registre pagamentos rapidamente.",
                    leads: "Qualifique oportunidades, responda rápido e empurre o funil sem abrir o CRM completo.",
                    itineraries: "Acesse roteiros recentes, reforce reutilização e acelere a entrega ao cliente.",
                    quotes: "Acompanhe propostas recentes, follow-up e conversão em viagem real.",
                    atlas: "Suporte guiado com contexto do próprio TravelPro e atalhos operacionais claros.",
                    operational: "Prioridades, tarefas e sinais da operação reunidos em uma leitura curta e acionável.",
                  }[activeMicroWorkspace]}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
                {activeMicroWorkspace === "clients" ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" className="rounded-full" onClick={() => openClientCreate()}>
                        Novo cliente
                      </Button>
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/clientes")}>
                        Abrir CRM
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <InfoCard label="Clientes ativos" value={`${dashboard?.counts.clients ?? clientRows.length}`} />
                      <InfoCard label="Recentes" value={`${recentClientRecords.length} na leitura rápida`} />
                    </div>
                    <div className="space-y-3">
                      {recentClientRecords.length > 0 ? recentClientRecords.map((client) => (
                        <div key={client.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{client.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{client.email} • {client.phone}</p>
                            </div>
                            <StatusPill label={client.status} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button type="button" size="sm" className="rounded-full" onClick={() => router.push("/app/clientes")}>Abrir perfil</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Atendimento", "O atendimento guiado do cliente será expandido nas próximas etapas.")}>Iniciar atendimento</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openTripCreate({ clientId: client.id, destination: client.destination === "Destino em definição" ? "" : client.destination })}>Criar viagem</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openDocumentCreate({ type: "Cotação", clientId: client.id, title: `Cotação • ${client.name}` }, "Nova cotação")}>Gerar cotação</Button>
                          </div>
                        </div>
                      )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">Ainda não há clientes recentes para esse micro workspace.</div>}
                    </div>
                  </div>
                ) : null}

                {activeMicroWorkspace === "trips" ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" className="rounded-full" onClick={() => openTripCreate()}>Nova viagem</Button>
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/viagens")}>Abrir viagens</Button>
                    </div>
                    <div className="space-y-3">
                      {recentTripRows.length > 0 ? recentTripRows.map((trip) => {
                        const share = shareLinksByTrip[trip.id]
                        return (
                          <div key={trip.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{trip.destination}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{formatDateLabel(trip.starts_at)} • {trip.status || "Planejamento"}</p>
                              </div>
                              <StatusPill label={share?.is_active === false ? "Link inativo" : share?.token ? "Link ativo" : "Sem link"} />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button type="button" size="sm" className="rounded-full" onClick={() => handleCopyTripLink(trip.id)}>Copiar link</Button>
                              <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => handleOpenTripLink(trip.id)}>Abrir link</Button>
                              <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => handleTripStatusUpdate(trip.id, trip.status === "Confirmada" ? "Em andamento" : "Confirmada")}>Alterar status</Button>
                              <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openDocumentCreate({ type: "Roteiro", tripId: trip.id, clientId: trip.client_id ?? "", title: `Roteiro • ${trip.destination}` }, "Novo roteiro")}>Gerar roteiro</Button>
                              <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openDocumentCreate({ type: "Voucher", tripId: trip.id, clientId: trip.client_id ?? "", title: `Voucher • ${trip.destination}` }, "Novo documento")}>Gerar documento</Button>
                              {share?.token ? <Button type="button" size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground" onClick={() => handleDisableTripLink(trip.id)}>Desativar link</Button> : null}
                            </div>
                          </div>
                        )
                      }) : <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">Ainda não há viagens recentes para agir daqui.</div>}
                    </div>
                  </div>
                ) : null}

                {activeMicroWorkspace === "documents" ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" className="rounded-full" onClick={() => openDocumentCreate({}, "Novo documento")}>Novo documento</Button>
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/documentos")}>Abrir central</Button>
                    </div>
                    <div className="space-y-3">
                      {pendingDocumentRecords.length > 0 ? pendingDocumentRecords.map((item) => (
                        <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{item.type} • {item.client}</p>
                            </div>
                            <StatusPill label={item.status || "Rascunho"} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button type="button" size="sm" className="rounded-full" onClick={() => router.push("/app/documentos")}>Visualizar</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Em breve", "A geração de PDF contextual será refinada em uma próxima etapa.")}>Gerar PDF</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => handleUpdateDocumentStatus(item.id, "Enviado", "O documento foi marcado como enviado.")}>Enviar</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => handleUpdateDocumentStatus(item.id, "Em revisão", "O documento foi enviado para revisão rápida.")}>Revisar</Button>
                          </div>
                        </div>
                      )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">Nenhuma pendência documental crítica agora.</div>}
                    </div>
                  </div>
                ) : null}

                {activeMicroWorkspace === "finance" ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <InfoCard label="A receber" value={formatMoney(financialSnapshot.pendingRevenue)} />
                      <InfoCard label="Pendências" value={formatMoney(financialSnapshot.pendingExpenses)} />
                      <InfoCard label="Últimas movimentações" value={`${recentFinanceRows.length}`} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" className="rounded-full" onClick={() => openFinanceCreate()}>Novo lançamento</Button>
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/financeiro")}>Abrir financeiro</Button>
                    </div>
                    <div className="space-y-3">
                      {recentFinanceRows.length > 0 ? recentFinanceRows.map((record) => (
                        <div key={record.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{record.description || record.category || "Lançamento financeiro"}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{formatDateLabel(record.occurred_at)} • {normalizeFinanceType(record.type)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">{formatMoney(Number(record.amount || 0))}</p>
                              <StatusPill label={normalizeFinanceStatus(record.status)} />
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {normalizeFinanceStatus(record.status) !== "Pago" ? <Button type="button" size="sm" className="rounded-full" onClick={() => handleMarkFinanceAsPaid(record.id)}>Marcar como pago</Button> : null}
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/financeiro")}>Abrir detalhe</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/central-operacional/relatorios/novo?type=Financeiro")}>Gerar relatório</Button>
                          </div>
                        </div>
                      )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">Sem movimentações recentes para leitura rápida.</div>}
                    </div>
                  </div>
                ) : null}

                {activeMicroWorkspace === "leads" ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <InfoCard label="Novos" value={`${dashboard?.counts.leads_by_status.Novo ?? 0}`} />
                      <InfoCard label="Aguardando retorno" value={`${dashboard?.counts.leads_by_status["Aguardando retorno"] ?? 0}`} />
                      <InfoCard label="Qualificados" value={`${dashboard?.counts.leads_by_status.Qualificado ?? 0}`} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" className="rounded-full" onClick={() => openLeadCreate()}>Novo lead</Button>
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/leads")}>Abrir pipeline</Button>
                    </div>
                    <div className="space-y-3">
                      {recentLeadCards.length > 0 ? recentLeadCards.map((lead) => (
                        <div key={lead.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{lead.destination} • {lead.origin}</p>
                            </div>
                            <StatusPill label={lead.stage} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button type="button" size="sm" className="rounded-full" onClick={() => fire("Atendimento", "O atendimento guiado do lead será expandido nas próximas etapas.")}>Iniciar atendimento</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openClientCreate({ name: lead.name, email: lead.email === "E-mail não informado" ? "" : lead.email, phone: lead.phone === "Telefone não informado" ? "" : lead.phone, destination: lead.destination === "Destino em definição" ? "" : lead.destination, origin: lead.origin === "Origem não informada" ? "" : lead.origin, notes: lead.notes === "Sem observações registradas." ? "" : lead.notes })}>Converter cliente</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openDocumentCreate({ type: "Cotação", title: `Cotação • ${lead.name}` }, "Nova cotação")}>Criar cotação</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openTripCreate({ destination: lead.destination === "Destino em definição" ? "" : lead.destination })}>Criar viagem</Button>
                          </div>
                        </div>
                      )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">Sem leads recentes para resolver daqui.</div>}
                    </div>
                  </div>
                ) : null}

                {activeMicroWorkspace === "itineraries" ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" className="rounded-full" onClick={() => openDocumentCreate({ type: "Roteiro" }, "Novo roteiro")}>Novo roteiro</Button>
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/viagens/roteiros")}>Abrir roteiros</Button>
                    </div>
                    <div className="space-y-3">
                      {itineraryRecords.length > 0 ? itineraryRecords.map((item) => (
                        <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{item.client} • {item.trip}</p>
                            </div>
                            <StatusPill label={item.status || "Pronto"} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button type="button" size="sm" className="rounded-full" onClick={() => router.push("/app/viagens/roteiros")}>Editar</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Em breve", "A exportação rápida do roteiro ganhará uma experiência dedicada em uma próxima etapa.")}>Gerar PDF</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Em breve", "O compartilhamento contextual do roteiro será ligado à próxima camada da experiência pública.")}>Compartilhar</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openDocumentCreate({ type: "Roteiro", title: `${item.title} • Cópia`, clientId: item.client_id ?? "", tripId: item.trip_id ?? "" }, "Duplicar roteiro")}>Duplicar</Button>
                          </div>
                        </div>
                      )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">Ainda não há roteiros recentes para operar daqui.</div>}
                    </div>
                  </div>
                ) : null}

                {activeMicroWorkspace === "quotes" ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" className="rounded-full" onClick={() => openDocumentCreate({ type: "Cotação" }, "Nova cotação")}>Nova cotação</Button>
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/viagens/cotacoes")}>Abrir cotações</Button>
                    </div>
                    <div className="space-y-3">
                      {quoteRecords.length > 0 ? quoteRecords.map((item) => (
                        <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{item.client} • {item.trip}</p>
                            </div>
                            <StatusPill label={item.status || "Rascunho"} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button type="button" size="sm" className="rounded-full" onClick={() => router.push("/app/viagens/cotacoes")}>Visualizar</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => handleUpdateDocumentStatus(item.id, "Aguardando retorno", "A cotação foi marcada para follow-up.")}>Follow-up</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openTripCreate({ clientId: item.client_id ?? "", destination: item.trip === "Sem viagem vinculada" ? "" : item.trip })}>Converter em viagem</Button>
                          </div>
                        </div>
                      )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-muted-foreground">Sem cotações recentes para follow-up rápido.</div>}
                    </div>
                  </div>
                ) : null}

                {activeMicroWorkspace === "atlas" ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      {atlasSignals.length > 0 ? atlasSignals.slice(0, 3).map((signal) => <InfoCard key={signal} label="Sinal do Atlas" value={signal} />) : <InfoCard label="Status" value="O Atlas segue pronto para orientar a operação." />}
                    </div>
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-sm font-medium text-foreground">Atalhos sugeridos</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" className="rounded-full" onClick={() => router.push("/app/viagens")}>Como criar uma viagem?</Button>
                        <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/financeiro")}>Como lançar despesa?</Button>
                        <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/central-operacional/relatorios")}>Como gerar relatório?</Button>
                      </div>
                    </div>
                    <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/atlas-advisor")}>Abrir Atlas completo</Button>
                  </div>
                ) : null}

                {activeMicroWorkspace === "operational" ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      {(operational?.statuses ?? []).slice(0, 3).map((item) => <InfoCard key={item.label} label={item.label} value={item.value} />)}
                    </div>
                    <div className="space-y-3">
                      {(operational?.priorities ?? []).slice(0, 4).map((item) => (
                        <div key={item.id ?? item.label} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.label}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
                            </div>
                            <StatusPill label={item.value} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button type="button" size="sm" className="rounded-full" onClick={() => router.push(item.href)}>Abrir prioridade</Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/central-operacional/tarefas/nova")}>Criar tarefa rápida</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedAttention)} onOpenChange={(open) => (!open ? setSelectedAttention(null) : null)}>
        <DialogContent className="border-white/10 bg-[#0e0b0c]/96 p-0 shadow-[0_34px_120px_rgba(0,0,0,0.58)]">
          {selectedAttention ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedAttention.label}</DialogTitle>
                <DialogDescription>
                  {selectedAttention.hint}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 px-6 py-5">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary/70">Leitura atual</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{selectedAttention.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Abra o módulo relacionado para resolver esse ponto no fluxo operacional certo, sem perder contexto.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="rounded-full">
                    <Link href={selectedAttention.href}>Abrir módulo</Link>
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSelectedAttention(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeQuickActions)} onOpenChange={(open) => (!open ? setActiveQuickActions(null) : null)}>
        <DialogContent className="max-w-xl border-white/10 bg-[#0e0b0c]/96 p-0 shadow-[0_34px_120px_rgba(0,0,0,0.58)]">
          {activeQuickActions ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{activeQuickActions.title}</DialogTitle>
                <DialogDescription>{activeQuickActions.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 px-6 py-5">
                {activeQuickActions.actions.map((action, index) =>
                  action.href ? (
                    <Link
                      key={`${activeQuickActions.title}-action-${index}`}
                      href={action.href}
                      onClick={() => setActiveQuickActions(null)}
                      className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-foreground transition-all hover:border-primary/18 hover:bg-white/[0.05]"
                    >
                      <span>{action.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    </Link>
                  ) : (
                    <button
                      key={`${activeQuickActions.title}-action-${index}`}
                      type="button"
                      onClick={() => {
                        action.onClick?.()
                        setActiveQuickActions(null)
                      }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-foreground transition-all hover:border-primary/18 hover:bg-white/[0.05]"
                    >
                      <span>{action.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    </button>
                  ),
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
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
      <WorkspaceSectionHeader
        eyebrow="Workspace de clientes"
        title="Clientes"
        description="Relacionamento ativo, follow-ups e contexto de viagem organizados em uma leitura mais rápida e viva."
        summary={`${visibleClients.length} perfis visíveis agora.`}
        actions={
          <>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Follow-ups", "A fila guiada de follow-ups vai ganhar automações leves na próxima etapa.")}>
              Follow-ups
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/app/clientes/novo">Novo cliente</Link>
            </Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={metrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          hint: metric.change,
          tone: metric.label === "Em viagem" ? "warning" : metric.label === "Documentação" ? "success" : "default",
        }))}
      />
      <WorkspaceToolbar
        search={<SearchInput placeholder="Buscar cliente, destino ou origem" value={searchTerm} onChange={setSearchTerm} />}
        filters={<FilterTabs items={["Todos", "Premium", "Em viagem", "Família", "Lua de mel"]} activeItem={activeFilter} onChange={setActiveFilter} />}
      />

      <WorkspacePanel eyebrow="Base ativa" title="Clientes da agência" description="Cada linha abre um workspace contextual com viagens, documentos, financeiro e histórico do relacionamento.">
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
              <div key={client.id} className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <button type="button" onClick={() => setSelected(client)} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                      <StatusPill label={client.status} />
                      <StatusPill label={client.tag} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{client.email} • {client.phone}</p>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                      <span>Destino em foco: {client.destination}</span>
                      <span>Origem: {client.origin}</span>
                      <span>Próximo passo: {client.nextStep}</span>
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" className="rounded-full" onClick={() => setSelected(client)}>
                      Abrir perfil
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openClientEditor(client)}>
                      Editar
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Atendimento", `O fluxo rápido de atendimento de ${client.name} será expandido nas próximas etapas.`)}>
                      Atender
                    </Button>
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
                </div>
              </div>
            ))
          )}
        </div>
      </WorkspacePanel>

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

  useEffect(() => {
    let active = true

    const loadSelectedShareLink = async () => {
      if (!selected?.id || shareLinks[selected.id]) return

      try {
        const currentLink = await requestJson<TripShareLinkSummary>(`/api/trips/${selected.id}/share-link`)
        if (!active || !currentLink) return
        setShareLinks((current) => ({ ...current, [selected.id]: currentLink }))
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[AgencyTripsPage] failed to load share link state", error)
        }
      }
    }

    void loadSelectedShareLink()

    return () => {
      active = false
    }
  }, [selected?.id, shareLinks])

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
      <WorkspaceSectionHeader
        eyebrow="Workspace de viagens"
        title="Viagens"
        description="Central operacional da jornada, com saúde da viagem, documentos, timeline e experiência compartilhável."
        summary={`${visibleTrips.length} viagens no radar.`}
        actions={<Button asChild className="rounded-full"><Link href="/app/viagens/nova">Nova viagem</Link></Button>}
      />
      <WorkspaceMetricStrip
        items={tripMetrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          hint: metric.change,
          tone: metric.label === "Planejamento" ? "warning" : metric.label === "Viagens ativas" ? "default" : "success",
        }))}
      />
      <WorkspaceToolbar search={<SearchInput placeholder="Buscar cliente, destino ou status" value={searchTerm} onChange={setSearchTerm} />} />
      <WorkspacePanel eyebrow="Operação viva" title="Viagens da operação" description="Cada linha mostra cliente, período, saúde operacional, compartilhamento e ações rápidas inline.">
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
            visibleTrips.map((trip) => {
              const shareLink = shareLinks[trip.id]

              return (
                <div key={trip.id} className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <button type="button" onClick={() => setSelected(trip)} className="min-w-0 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{trip.client} • {trip.destination}</p>
                        <StatusPill label={trip.stage} />
                        {shareLink ? <StatusPill label={shareLink.is_active ? "Link ativo" : "Link inativo"} /> : null}
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                        <span>{trip.dates}</span>
                        <span>{trip.documents}</span>
                        <span>{trip.finance}</span>
                        <span>{trip.itinerary}</span>
                      </div>
                      {shareLink ? <p className="mt-2 text-xs text-muted-foreground">Vitrine pública {shareLink.is_active ? "ativa" : "inativa"} • {shareLink.view_count} visualizações</p> : null}
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" size="sm" className="rounded-full" onClick={() => setSelected(trip)}>Abrir viagem</Button>
                      <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void copyTripShareLink(trip)}>Compartilhar</Button>
                      <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openTripEditor(trip)}>Editar</Button>
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
                  </div>
                </div>
              )})
          )}
        </div>
      </WorkspacePanel>

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
                    <InfoCard
                      label="Link compartilhável"
                      value={
                        shareLinks[selected.id]
                          ? `${shareLinks[selected.id].is_active ? "Ativo" : "Inativo"} • ${shareLinks[selected.id].view_count} visualizações`
                          : "Ainda não gerado"
                      }
                    />
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
      <WorkspaceSectionHeader
        eyebrow={mode === "template" ? "Biblioteca viva" : mode === "roteiro" ? "Workspace de roteiros" : mode === "cotacao" ? "Workspace de cotações" : "Central documental"}
        title={title}
        description={description}
        summary={`${filteredDocuments.length} itens no recorte atual.`}
        actions={<Button asChild className="rounded-full"><Link href={createHref}>{createLabel}</Link></Button>}
      />

      <WorkspaceMetricStrip
        items={metrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          hint: metric.change,
          tone: metric.label === "Prontos" || metric.label === "Vinculados" ? "success" : metric.label === "Rascunhos" ? "warning" : "default",
        }))}
      />

      <WorkspaceToolbar
        search={<SearchInput placeholder="Buscar documento, cliente, viagem ou status" value={searchTerm} onChange={setSearchTerm} />}
        filters={<FilterTabs items={availableFilters} activeItem={activeFilter} onChange={setActiveFilter} />}
      />

      <WorkspacePanel eyebrow="Leitura operacional" title={`${title} da operação`} description="Listas compactas, status delicados e ações inline para reduzir a dependência das telas longas da V1.">
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
              <div key={doc.id} className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <button type="button" onClick={() => setSelected(doc)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <StatusPill label={doc.status} />
                    <StatusPill label={doc.type} />
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                    <span>{doc.client}</span>
                    <span>{doc.trip}</span>
                    <span>Atualizado em {formatDateLabel(doc.updated_at)}</span>
                    <span>{doc.storage_path || "Sem arquivo vinculado"}</span>
                  </div>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" className="rounded-full" onClick={() => setSelected(doc)}>
                    Visualizar
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(editHref ? editHref(doc) : `/app/documentos/novo?id=${doc.id}`)}>
                    Editar
                  </Button>
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
                </div>
              </div>
            ))
          )}
        </div>
      </WorkspacePanel>
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
      <WorkspaceSectionHeader
        eyebrow="Workspace financeiro"
        title="Financeiro"
        description="Caixa, pendências, alertas e fluxo real da agência com foco mais operacional e menos ERP."
        summary={`${filteredRecordsByView.length} lançamentos no recorte atual.`}
        actions={
          <>
            <Button asChild className="rounded-full">
              <Link href="/app/financeiro/novo">Novo lançamento</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openFinancialReport()}>Gerar relatório</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openFinancialReport(undefined, "HTML")}>Exportar</Button>
          </>
        }
      />

      <WorkspaceToolbar
        search={<SearchInput placeholder="Buscar categoria, cliente, viagem ou status" value={searchTerm} onChange={setSearchTerm} />}
        filters={
          <>
            <FilterTabs items={[...FINANCE_FILTERS]} activeItem={activeFilter} onChange={(item) => setActiveFilter(item as (typeof FINANCE_FILTERS)[number])} />
            <FilterTabs items={periods} activeItem={period} onChange={(item) => setPeriod(item as typeof period)} />
          </>
        }
      />

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

      <WorkspaceMetricStrip
        items={[
          { label: "Receitas", value: formatMoney(totalRevenue), hint: `Período: ${period}`, tone: "success" },
          { label: "Despesas", value: formatMoney(totalExpenses), hint: "Saídas registradas", tone: "warning" },
          { label: "Lucro", value: formatMoney(profit), hint: `Margem ${margin}%`, tone: profit >= 0 ? "success" : "danger" },
          { label: "Lançamentos", value: `${filteredRecordsByView.length}`, hint: "Receitas e despesas reais", tone: "default" },
        ]}
      />

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

      <WorkspacePanel eyebrow="Fluxo financeiro" title="Lançamentos da operação" description="Linhas compactas com valor, competência, vínculos e ações rápidas de pagamento, relatório e edição.">
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
                <div key={record.id} className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <button type="button" onClick={() => setSelected(record)} className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{record.category || record.type}</p>
                      <StatusPill label={record.type} />
                      <StatusPill label={record.status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                      <span>{linkedClient}</span>
                      <span>{linkedTrip}</span>
                      <span>{formatDateLabel(record.occurred_at)}</span>
                      <span>{record.description || "Sem descrição complementar"}</span>
                    </div>
                  </button>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-[110px] text-right text-sm font-semibold text-foreground">{formatMoney(Number(record.amount || 0))}</p>
                      {normalizeFinanceStatus(record.status) !== "Pago" ? (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full"
                          onClick={async () => {
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
                          }}
                        >
                          Marcar pago
                        </Button>
                      ) : null}
                      <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/app/financeiro/novo?id=${record.id}`)}>
                        Editar
                      </Button>
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
                  </div>
                </div>
              )
            })
          )}
        </div>
      </WorkspacePanel>

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
      <WorkspaceSectionHeader
        eyebrow="Pipeline operacional"
        title="Leads"
        description="Origem, prioridade, qualificação e próximos movimentos do funil em um fluxo mais enxuto."
        summary={`${visibleLeads.length} oportunidades ativas.`}
        actions={
          <>
            <Button variant="outline" asChild className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/app/leads/qualificar">Qualificar com IA</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/app/leads/novo">Novo lead</Link>
            </Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={leadMetrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          hint: metric.change,
          tone: metric.label === "Alta prioridade" ? "warning" : "default",
        }))}
      />
      <WorkspaceToolbar search={<SearchInput placeholder="Buscar lead, origem, destino ou status" value={searchTerm} onChange={setSearchTerm} />} />
      <WorkspacePanel eyebrow="Funil vivo" title="Oportunidades ativas" description="Abertura rápida para responder, qualificar, converter ou iniciar a próxima etapa comercial.">
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
              <div key={lead.id} className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <button
                  type="button"
                  onClick={() => setSelected(lead)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <StatusPill label={lead.temperature} />
                    <StatusPill label={lead.stage} />
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                    <span>Origem: {lead.origin}</span>
                    <span>Interesse: {lead.destination}</span>
                    <span>Contato: {lead.phone}</span>
                    <span>Status: {lead.stage}</span>
                  </div>
                </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" className="rounded-full" onClick={() => setSelected(lead)}>
                      Responder
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => openLeadEditor(lead)}>
                      Editar
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Conversão em preparação", `A conversão segura de ${lead.name} em cliente real será ativada na próxima etapa.`)}>
                      Converter
                    </Button>
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
                </div>
              </div>
            ))
          )}
        </div>
      </WorkspacePanel>
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
      <WorkspaceSectionHeader
        eyebrow="Expansão operacional"
        title="TravelPro Go"
        description="Camada futura de operação conversacional da agência, preparada para governança, histórico e comandos rápidos."
        summary="Em breve"
        actions={
          <>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Configuração em breve", "A configuração operacional do TravelPro Go será liberada quando a integração oficial for ativada.")}>Configurar módulo</Button>
            <Button className="rounded-full" onClick={() => fire("TravelPro Go em breve", "O controle operacional do número será liberado quando a integração real de WhatsApp entrar na próxima fase.")}>Quero ativar</Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={[
          { label: "Cobertura futura", value: "WhatsApp interno", hint: "Canal operacional assistido para time e agência." },
          { label: "Estado atual", value: "Preparação ativa", hint: "Sem integração oficial liberada nesta etapa.", tone: "warning" },
          { label: "Fluxos previstos", value: "3 comandos-chave", hint: "Clientes, documentos e catálogo no radar." },
          { label: "Governança", value: "Controlada", hint: "Permissões e histórico continuarão auditáveis." },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <WorkspacePanel
          eyebrow="Operação conversacional"
          title="Como este módulo entra na rotina"
          description="O Go será a extensão operacional da agência para executar comandos rápidos e distribuir contexto sem sair do ecossistema TravelPro."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <WorkspaceFeatureCard title="Comandos internos" description="Criar roteiro, gerar contrato, abrir catálogo e acionar a operação a partir de uma conversa assistida." />
            <WorkspaceFeatureCard title="Histórico e rastreio" description="Cada ação continuará com trilha clara, sem botões mudos nem automações invisíveis." />
          </div>
        </WorkspacePanel>
        <WorkspacePanel
          eyebrow="Sinais preparados"
          title="Execuções previstas"
          description="Exemplos operacionais que mostram como o módulo será usado quando a camada oficial estiver ativa."
        >
          <div className="space-y-3">
            {entries.map((entry) => (
              <WorkspaceInlineCard
                key={entry.id}
                title={entry.title}
                detail={entry.response}
                meta="Fluxo preparado"
                status="Em breve"
                actions={
                  <>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem em breve", `A trilha completa de ${entry.title} será exibida quando o histórico real do Go estiver disponível.`)}>
                      Abrir origem
                    </Button>
                    <Button className="rounded-full" onClick={() => fire("Detalhes preparados", `O cenário de ${entry.title} já está mapeado para a próxima fase.`)}>
                      Ver cenário
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        </WorkspacePanel>
      </div>
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
      <WorkspaceSectionHeader
        eyebrow="Expansão comercial"
        title="TravelPro Agent"
        description="Camada futura de atendimento assistido para leads e clientes, preparada para operar com contexto e escalonamento."
        summary={`${items.length} conversas mapeadas.`}
        actions={
          <>
            <Button className="rounded-full" onClick={() => fire("Agent em breve", "O controle fino do Agent será liberado quando a operação conversacional entrar na próxima fase.")}>Pausar / ativar</Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setStyleOpen(true)}>Editar estilo de atendimento</Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={[
          { label: "Estado atual", value: "Preparação ativa", hint: "Sem backend conversacional novo nesta etapa.", tone: "warning" },
          { label: "Follow-up", value: "Assistido", hint: "Modelo futuro para retomar leads e jornadas quentes." },
          { label: "Escalonamento", value: "Mapeado", hint: "Transferência premium para o humano no momento certo." },
          { label: "Tom", value: "Consultivo", hint: "Estilo atual preparado para a agência." },
        ]}
      />
      <WorkspacePanel eyebrow="Fila preparada" title="Conversas acompanhadas" description="Ações rápidas por atendimento sem poluir a operação.">
        <div className="space-y-3">
          {items.map((item) => (
            <WorkspaceInlineCard
              key={item.id}
              title={item.name}
              detail={`${item.destination} • ${item.origin} • ${item.style}`}
              meta="Atendimento preparado"
              status={item.stage}
              actions={
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
              }
            />
          ))}
        </div>
      </WorkspacePanel>
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
      <WorkspaceSectionHeader
        eyebrow="Expansão de campanhas"
        title="Marketing"
        description="Base de campanhas e calendário promocional na mesma linguagem operacional da V2."
        summary={`${campaigns.length} campanhas em leitura.`}
        actions={
          <>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Calendário em breve", "O calendário promocional completo será conectado quando o módulo de campanhas sair da fase preparatória.")}>Abrir calendário</Button>
            <Button asChild className="rounded-full">
              <Link href="/app/marketing/campanhas/nova">Nova campanha</Link>
            </Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={[
          { label: "Estado atual", value: "Preparação ativa", hint: "Campanhas reais entram na próxima etapa do módulo.", tone: "warning" },
          { label: "Campanhas", value: campaigns.length.toString().padStart(2, "0"), hint: "Leituras de exemplo para operação e distribuição." },
          { label: "Calendário", value: "Planejado", hint: "Abertura visual já preparada para evolução futura." },
          { label: "Direção", value: "Catálogo + público", hint: "O módulo seguirá conectado à operação comercial." },
        ]}
      />
      <WorkspacePanel eyebrow="Campanhas preparadas" title="Fluxos promocionais" description="Acompanhe campanhas e mantenha a visão comercial organizada, sem cair numa tabela pesada.">
        <div className="space-y-3">
          {campaigns.map((item) => (
            <WorkspaceInlineCard
              key={item.id}
              title={item.title}
              detail={item.detail}
              meta="Campanha preparada"
              status={item.status}
              actions={
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
              }
            />
          ))}
        </div>
      </WorkspacePanel>
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
      <WorkspaceSectionHeader
        eyebrow="Copiloto operacional"
        title="Atlas Advisor"
        description="Suporte guiado para decisões operacionais, dúvidas do time e próximos passos mais sensíveis da agência."
        summary={`${consults.length} consultas recentes.`}
        actions={
          <>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico aberto", "O histórico completo do Atlas Advisor foi preparado.")}>Ver histórico</Button>
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>Nova consulta</Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={[
          { label: "Consultas úteis", value: consults.length.toString().padStart(2, "0"), hint: "Pontos recentes em comercial, crise e escala.", tone: "default" },
          { label: "Modo atual", value: "Guiado", hint: "Determinístico e honesto, sem automação inventada.", tone: "success" },
          { label: "Contextos ativos", value: "Leads e operação", hint: "Ajuda rápida para o que já acontece no sistema." },
          { label: "Próximo passo", value: "Escala contextual", hint: "O Atlas continuará explicando módulos e fluxos reais." },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <WorkspacePanel
          eyebrow="Como faço para...?"
          title="Atalhos de orientação"
          description="Respostas curtas, contexto por módulo e apoio para destravar a equipe sem virar chatbot genérico."
        >
          <div className="grid gap-3">
            {[
              "Como criar uma viagem?",
              "Como compartilhar o link do cliente?",
              "Como gerar um contrato?",
              "Como registrar um recebimento?",
              "Como configurar minha agência?",
            ].map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => fire("Atlas preparado", `A orientação contextual para “${question}” segue pronta no assistente Atlas.`)}
                className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/15 hover:bg-white/[0.05]"
              >
                {question}
              </button>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel
          eyebrow="Consultas recentes"
          title="Orientações já utilizadas"
          description="Abra a origem ou reveja o contexto da decisão sem sair da linguagem V2."
        >
          <div className="space-y-3">
            {consults.map((item) => (
              <WorkspaceInlineCard
                key={item.id}
                title={item.title}
                detail={item.detail}
                meta="Consulta orientada pelo Atlas"
                status={item.status}
                actions={
                  <>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem aberta", `A origem de ${item.title} foi preparada.`)}>
                      Abrir origem
                    </Button>
                    <Button className="rounded-full" onClick={() => fire("Detalhes abertos", `Os detalhes de ${item.title} foram preparados.`)}>
                      Ver orientação
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        </WorkspacePanel>
      </div>
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
      <WorkspaceSectionHeader
        eyebrow="Expansão operacional"
        title="Automações"
        description="Fluxos, follow-ups e tarefas automáticas preparados para assumir rotinas repetitivas da agência."
        summary={`${flows.length} fluxos em preparação.`}
        actions={
          <>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Histórico em breve", "O histórico real das automações será liberado quando os fluxos saírem da fase preparatória.")}>Ver histórico</Button>
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>Novo fluxo</Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={[
          { label: "Estado atual", value: "Preparação ativa", hint: "Sem automação real nova liberada nesta fase.", tone: "warning" },
          { label: "Fluxos", value: flows.length.toString().padStart(2, "0"), hint: "Follow-up, pré-embarque e reativação no radar." },
          { label: "Cobertura", value: "Comercial + operação", hint: "A evolução seguirá conectada aos módulos reais." },
          { label: "Ação futura", value: "Gatilhos premium", hint: "Prontos para a próxima camada de automação." },
        ]}
      />
      <WorkspacePanel eyebrow="Fluxos preparados" title="Automações mapeadas" description="Acompanhe, ajuste e remova automações sem perder contexto.">
        <div className="space-y-3">
          {flows.map((flow) => (
            <WorkspaceInlineCard
              key={flow.id}
              title={flow.title}
              detail={flow.detail}
              meta="Fluxo preparado"
              status={flow.status}
              actions={
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
              }
            />
          ))}
        </div>
      </WorkspacePanel>
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

  return (
    <PageShell>
      <WorkspaceSectionHeader
        eyebrow="Hub vivo da operação"
        title="Central Operacional"
        description="Prioridades do dia, pendências reais e atalhos para mover a agência sem cair no fluxo antigo."
        summary={`${data?.priorities.length ?? 0} pontos em foco.`}
        actions={
          <>
            <Button asChild className="rounded-full">
              <Link href="/app/central-operacional/tarefas/nova">Nova tarefa</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Rotas rápidas em breve", "As rotas rápidas configuráveis serão liberadas em uma próxima etapa da central.")}>Adicionar rota rápida</Button>
          </>
        }
      />
      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar a central agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <WorkspaceMetricStrip
        items={(data?.statuses ?? []).slice(0, 4).map((item) => ({
          label: item.label,
          value: item.value,
          hint: item.detail,
          tone: item.tone === "info" ? "default" : item.tone,
        }))}
      />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <WorkspacePanel eyebrow="Fila do dia" title="Prioridades reais" description="Itens derivados da operação para abrir o módulo certo sem botões mortos.">
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
                    <WorkspaceInlineCard
                      key={item.id}
                      title={item.label}
                      detail={item.hint}
                      meta="Prioridade operacional"
                      status={item.value}
                      actions={
                        <Button className="rounded-full" onClick={() => router.push(item.href)}>
                          Abrir prioridade
                        </Button>
                      }
                    />
                  ))}
                  {(data?.priorities ?? []).length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                      Nenhuma prioridade crítica agora. A central vai ganhar corpo conforme a agência registrar operações reais.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-5">
          <WorkspacePanel eyebrow="Feed vivo" title="Eventos recentes" description="Eventos agregados sem tabela nova, priorizando o que acabou de acontecer.">
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
                    <WorkspaceInlineCard
                      key={item.id}
                      title={item.title}
                      detail={item.detail}
                      meta={item.origin}
                      status={item.time}
                      actions={
                        <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(item.href)}>
                          Abrir módulo
                        </Button>
                      }
                    />
                  ))}
                  {(data?.feed ?? []).length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                      Sem eventos recentes ainda. Assim que clientes, leads, viagens, documentos e lançamentos forem criados, o feed aparece aqui.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </WorkspacePanel>

          <WorkspacePanel eyebrow="Resolver agora" title="Ações rápidas" description="Atalhos vivos para tarefas, notificações e relatórios que já existem.">
            <div className="space-y-3">
              {(data?.tasks ?? []).slice(0, 3).map((item) => (
                <WorkspaceInlineCard
                  key={item.id}
                  title={item.title}
                  detail={item.description || "Sem descrição complementar."}
                  meta="Tarefa operacional"
                  actions={
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(`/app/central-operacional/tarefas/nova?id=${item.id}`)}>
                      Concluir tarefa
                    </Button>
                  }
                />
              ))}
              {(data?.notifications ?? []).slice(0, 2).map((item) => (
                <WorkspaceInlineCard
                  key={item.id}
                  title={item.title}
                  detail={item.body || item.type}
                  meta="Notificação inteligente"
                  actions={
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push(item.action_url || "/app/central-operacional")}>
                      Abrir origem
                    </Button>
                  }
                />
              ))}
              {(data?.reports ?? []).slice(0, 1).map((item) => (
                <WorkspaceInlineCard
                  key={item.id}
                  title={item.name}
                  detail={`${item.type} • ${formatDateTimeLabel(item.created_at)}`}
                  meta="Relatório recente"
                  actions={
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/app/relatorios")}>
                      Gerar relatório
                    </Button>
                  }
                />
              ))}
              {!isLoading && (data?.tasks?.length ?? 0) === 0 && (data?.notifications?.length ?? 0) === 0 && (data?.reports?.length ?? 0) === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                  Nenhuma ação operacional recente por aqui ainda.
                </div>
              ) : null}
            </div>
          </WorkspacePanel>
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
      <WorkspaceSectionHeader
        eyebrow="Consumo operacional"
        title="Créditos"
        description="Saldo, histórico e entendimento de consumo por módulo em uma leitura mais executiva."
        summary={`${overview?.balance ?? 0} disponíveis.`}
        actions={
          <>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Consumo mapeado", "O histórico operacional abaixo já reflete os movimentos reais de créditos.")}>
              Ver histórico
            </Button>
            <Button className="rounded-full" onClick={() => fire("Compra em breve", "A compra de créditos continua fora deste escopo e será integrada depois, sem Stripe por enquanto.")}>
              Comprar créditos
            </Button>
          </>
        }
      />
      <WorkspaceMetricStrip
        items={[
          { label: "Saldo atual", value: isLoading ? "--" : String(overview?.balance ?? 0), hint: "Créditos disponíveis para uso operacional.", tone: Number(overview?.balance ?? 0) > 0 ? "success" : "warning" },
          { label: "Consumidos", value: isLoading ? "--" : String(overview?.consumed ?? 0), hint: `${overview?.history.length ?? 0} movimentos registrados no histórico.`, tone: "warning" },
          { label: "Maior origem", value: isLoading ? "--" : overview?.top_feature || "Sem consumo", hint: isLoading ? "Carregando..." : `${overview?.top_feature_amount ?? 0} créditos`, tone: "default" },
          { label: "Entradas", value: isLoading ? "--" : String(overview?.added ?? 0), hint: "Créditos adicionados até agora.", tone: "default" },
        ]}
      />
      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Nao foi possivel carregar os creditos agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <WorkspacePanel eyebrow="Origem do uso" title="Leitura de consumo" description="Entenda rapidamente de onde os créditos saem e quando vale agir antes do saldo apertar.">
          <div className="space-y-3">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-foreground">Saldo e entradas</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{isLoading ? "--" : `${overview?.balance ?? 0} créditos`}</p>
              <p className="mt-2 text-sm text-muted-foreground">{isLoading ? "Carregando histórico..." : `${overview?.added ?? 0} créditos adicionados até agora.`}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-foreground">Consumo por módulo</p>
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
        </WorkspacePanel>
        <WorkspacePanel eyebrow="Movimentos recentes" title="Historico real de creditos" description="Acompanhe o consumo recente, entenda a origem e mantenha a operação sob controle.">
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
                  <WorkspaceInlineCard
                    key={row.id}
                    title={row.feature || row.source || "Operação geral"}
                    detail={`${row.amount} créditos • ${formatDateTimeLabel(row.created_at)}`}
                    meta="Movimento registrado"
                    status={row.type}
                    actions={
                      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Origem do consumo", row.source || row.feature || "Movimento operacional sem origem detalhada.")}>
                        Entender consumo
                      </Button>
                    }
                  />
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
        </WorkspacePanel>
      </div>
    </PageShell>
  )
}


