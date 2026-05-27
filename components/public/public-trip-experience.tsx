"use client"

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import Image from "next/image"
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  FileBadge2,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type {
  PublicTripExperienceData,
  PublicTripItineraryItem,
} from "@/types/trip-share"

type DetailItem = {
  id: string
  kind: "timeline" | "document" | "agenda" | "message" | "notification" | "history"
  title: string
  subtitle?: string
  description: string
  meta?: string
  actionHref?: string | null
  actionLabel?: string
}

type TimelineEntry = {
  id: string
  title: string
  detail: string
  status: "done" | "attention" | "upcoming"
  meta: string
}

type AgendaEntry = {
  id: string
  title: string
  detail: string
  timeLabel: string
  status: string
}

type MessageEntry = {
  id: string
  title: string
  body: string
  timeLabel: string
}

type NotificationEntry = {
  id: string
  title: string
  body: string
  status: "new" | "resolved" | "attention"
  timeLabel: string
}

type HistoryEntry = {
  id: string
  title: string
  body: string
  timeLabel: string
}

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function formatDateLabel(value?: string | null) {
  if (!value) return "Data em preparacao"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatDateTimeLabel(value?: string | null) {
  if (!value) return "Agora"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function buildWhatsAppHref(phone?: string | null) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  return `https://wa.me/${digits}`
}

function buildEmailHref(email?: string | null) {
  if (!email) return null
  return `mailto:${email}`
}

function statusChipClasses(status?: string | null) {
  const normalized = normalize(status)

  if (normalized.includes("confirm") || normalized.includes("andamento") || normalized.includes("conclu")) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
  }

  if (normalized.includes("prepara") || normalized.includes("pend")) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-200"
  }

  return "border-white/10 bg-white/[0.05] text-zinc-300"
}

function countdownState(startsAt?: string | null) {
  if (!startsAt) {
    return {
      mode: "undefined" as const,
      label: "Data da viagem em preparação",
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    }
  }

  const target = new Date(startsAt)
  if (Number.isNaN(target.getTime())) {
    return {
      mode: "undefined" as const,
      label: "Data da viagem em preparação",
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    }
  }

  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      mode: "started" as const,
      label: "Viagem em andamento",
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    mode: "countdown" as const,
    label: `Faltam ${days} dia${days === 1 ? "" : "s"} para sua viagem`,
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  }
}

function travelPhase(status?: string | null) {
  const normalized = normalize(status)
  if (normalized.includes("conclu")) return "Viagem concluída"
  if (normalized.includes("andamento")) return "Viagem em andamento"
  if (normalized.includes("prepara")) return "Em preparação"
  if (normalized.includes("confirm")) return "Confirmada"
  return status || "Em organização"
}

function documentIconLabel(type: string) {
  const normalized = normalize(type)
  if (normalized.includes("roteiro")) return "Roteiro"
  if (normalized.includes("voucher")) return "Voucher"
  if (normalized.includes("passagem")) return "Passagem"
  if (normalized.includes("seguro")) return "Seguro"
  if (normalized.includes("contrato")) return "Contrato"
  if (normalized.includes("recibo")) return "Recibo"
  return type
}

function buildTimeline(data: PublicTripExperienceData): TimelineEntry[] {
  const trip = data.trip
  const entries: TimelineEntry[] = [
    {
      id: "trip-created",
      title: "Reserva confirmada",
      detail: trip?.summary?.trim() || "A agência organizou esta jornada e liberou um link compartilhável para acompanhar tudo em um só lugar.",
      status: "done",
      meta: formatDateTimeLabel(data.viewed_at) || "Atualizado recentemente",
    },
  ]

  if (data.documents.length > 0) {
    entries.push({
      id: "docs-ready",
      title: "Documentos enviados",
      detail: `${data.documents.length} material(is) foram liberados para a viagem.`,
      status: "done",
      meta: "Documentos centralizados",
    })
  }

  if (data.updates.length > 0) {
    entries.push({
      id: "updates",
      title: "Comunicados da agência",
      detail: data.updates[0].detail,
      status: "attention",
      meta: data.updates[0].time_label,
    })
  }

  if (data.itinerary.length > 0) {
    entries.push({
      id: "itinerary",
      title: "Roteiro disponível",
      detail: `${data.itinerary.length} etapa(s) da agenda já foram organizadas.`,
      status: "done",
      meta: "Agenda ativa",
    })
  }

  if (trip?.starts_at) {
    entries.push({
      id: "boarding",
      title: "Embarque próximo",
      detail: `Saída prevista para ${formatDateLabel(trip.starts_at)} com destino ${trip.destination}.`,
      status: "upcoming",
      meta: trip.period_label,
    })
  }

  entries.push({
    id: "return",
    title: "Retorno e pós-viagem",
    detail: "A agência continua acompanhando documentos, orientações e próximos comunicados desta jornada.",
    status: "upcoming",
    meta: trip?.ends_at ? formatDateLabel(trip.ends_at) : "A confirmar",
  })

  return entries
}

function buildAgenda(itinerary: PublicTripItineraryItem[], trip: PublicTripExperienceData["trip"]): AgendaEntry[] {
  const items = itinerary.map((item) => ({
    id: item.key,
    title: item.title,
    detail: item.note,
    timeLabel: item.time_label || item.day_label,
    status: item.status,
  }))

  if (trip?.starts_at) {
    items.unshift({
      id: "departure-flight",
      title: "Janela de embarque",
      detail: `Organize check-in, documentos e suporte antes da saída para ${trip.destination}.`,
      timeLabel: formatDateLabel(trip.starts_at),
      status: "Em preparação",
    })
  }

  if (trip?.ends_at) {
    items.push({
      id: "return-window",
      title: "Retorno previsto",
      detail: "Último dia da jornada com orientação de retorno e suporte da agência.",
      timeLabel: formatDateLabel(trip.ends_at),
      status: "Programado",
    })
  }

  return items.slice(0, 10)
}

function buildMessages(data: PublicTripExperienceData): MessageEntry[] {
  const base = data.updates.map((item) => ({
    id: item.key,
    title: item.title,
    body: item.detail,
    timeLabel: item.time_label,
  }))

  if (!base.length) {
    return [
      {
        id: "welcome-message",
        title: "Mensagem da agência",
        body: "Sua viagem está sendo acompanhada pela agência. Este link vai concentrar documentos, agenda e avisos importantes.",
        timeLabel: "Agora",
      },
    ]
  }

  return base
}

function buildNotifications(data: PublicTripExperienceData): NotificationEntry[] {
  const notifications: NotificationEntry[] = []

  if (data.documents.length > 0) {
    notifications.push({
      id: "docs-notification",
      title: "Documento novo disponível",
      body: `${data.documents[0].title} já pode ser consultado por este link.`,
      status: "new",
      timeLabel: "Agora",
    })
  }

  if (data.itinerary.length > 0) {
    notifications.push({
      id: "itinerary-notification",
      title: "Roteiro atualizado",
      body: "A agenda da viagem recebeu novos detalhes e está pronta para consulta.",
      status: "resolved",
      timeLabel: "Hoje",
    })
  }

  notifications.push({
    id: "support-notification",
    title: "Suporte da agência disponível",
    body: "O canal de atendimento segue pronto para dúvidas e ajustes da jornada.",
    status: "attention",
    timeLabel: "Ativo",
  })

  return notifications
}

function buildHistory(data: PublicTripExperienceData): HistoryEntry[] {
  const history: HistoryEntry[] = [
    {
      id: "history-trip",
      title: "Viagem criada",
      body: "A jornada foi preparada e compartilhada em uma experiência pública segura.",
      timeLabel: data.trip?.period_label || "Recente",
    },
  ]

  data.documents.slice(0, 3).forEach((item) => {
    history.push({
      id: `history-doc-${item.key}`,
      title: `${documentIconLabel(item.type)} adicionado`,
      body: item.title,
      timeLabel: item.status,
    })
  })

  data.updates.slice(0, 3).forEach((item) => {
    history.push({
      id: `history-update-${item.key}`,
      title: item.title,
      body: item.detail,
      timeLabel: item.time_label,
    })
  })

  return history
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">{eyebrow}</p>
        <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function PremiumBlock({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5 ${className}`}>
      {children}
    </section>
  )
}

function DetailModal({
  item,
  open,
  onOpenChange,
}: {
  item: DetailItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[28px] border border-white/10 bg-[#0b0b0d]/96 p-0 text-white shadow-2xl shadow-black/50">
        <div className="p-5">
          <DialogHeader>
            <DialogTitle className="text-left text-xl font-semibold">{item?.title}</DialogTitle>
            {item?.subtitle ? <DialogDescription className="text-left text-sm text-zinc-400">{item.subtitle}</DialogDescription> : null}
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-300">
              {item?.description}
            </div>
            {item?.meta ? <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{item.meta}</p> : null}
            <div className="flex flex-wrap gap-2">
              {item?.actionHref ? (
                <Button asChild className="rounded-full">
                  <a href={item.actionHref} target="_blank" rel="noreferrer">
                    {item.actionLabel || "Abrir"}
                  </a>
                </Button>
              ) : null}
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PublicNav() {
  const items = [
    ["#resumo", "Resumo"],
    ["#documentos", "Documentos"],
    ["#agenda", "Agenda"],
    ["#mensagens", "Mensagens"],
    ["#suporte", "Suporte"],
  ]

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {items.map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-white/14 hover:bg-white/[0.07]"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}

export function PublicTripUnavailable({ status }: { status: PublicTripExperienceData["status"] }) {
  const description =
    status === "inactive"
      ? "A agência desativou este link compartilhável. Se precisar, peça um novo acesso seguro."
      : status === "expired"
        ? "Este link expirou. Solicite um novo compartilhamento para continuar acompanhando a viagem."
        : "Não encontramos uma experiência pública ativa para este token."

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_35%),linear-gradient(180deg,#050506_0%,#0b0b0d_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <PremiumBlock className="p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">TravelPro Shared Trip</p>
          <h1 className="mt-3 text-3xl font-semibold">Link indisponível</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">Status</p>
              <p className="mt-2 text-sm text-white">Acesso público controlado</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">Próximo passo</p>
              <p className="mt-2 text-sm text-white">Solicite à agência um novo link compartilhável.</p>
            </div>
          </div>
        </PremiumBlock>
      </div>
    </main>
  )
}

export function PublicTripExperience({ data }: { data: PublicTripExperienceData }) {
  const [copied, setCopied] = useState(false)
  const [detailItem, setDetailItem] = useState<DetailItem | null>(null)
  const [readNotifications, setReadNotifications] = useState<Record<string, boolean>>({})
  const [countdown, setCountdown] = useState(countdownState(data.trip?.starts_at))

  const trip = data.trip
  const agency = data.agency
  const client = data.client
  const accentColor = agency?.primary_color || "#f97316"
  const whatsappHref = buildWhatsAppHref(agency?.phone)
  const emailHref = buildEmailHref(agency?.email)

  useEffect(() => {
    const update = () => setCountdown(countdownState(trip?.starts_at))
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [trip?.starts_at])

  const timeline = useMemo(() => buildTimeline(data), [data])
  const agenda = useMemo(() => buildAgenda(data.itinerary, trip), [data.itinerary, trip])
  const messages = useMemo(() => buildMessages(data), [data])
  const notifications = useMemo(() => buildNotifications(data), [data])
  const history = useMemo(() => buildHistory(data), [data])

  if (!trip || !agency) {
    return <PublicTripUnavailable status={data.status} />
  }

  const heroStyle =
    agency.primary_color || agency.banner_url
      ? ({
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.82) 100%), radial-gradient(circle at top left, ${accentColor}40, transparent 35%), url(${agency.banner_url || ""})`,
          backgroundSize: agency.banner_url ? "cover" : undefined,
          backgroundPosition: agency.banner_url ? "center" : undefined,
        } as CSSProperties)
      : undefined

  const handleCopy = async () => {
    const target = typeof window !== "undefined" ? new URL(data.share_url, window.location.origin).toString() : data.share_url
    await navigator.clipboard.writeText(target)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const markNotificationRead = (id: string) => {
    setReadNotifications((current) => ({ ...current, [id]: true }))
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.1),transparent_30%),linear-gradient(180deg,#060607_0%,#0b0b0d_100%)] px-3 pb-24 pt-3 text-white sm:px-4 sm:pt-4">
      {/* TODO: adicionar expiração/revogação configurável do link público. */}
      {/* TODO: limitar ainda mais dados sensíveis quando a camada pública estiver conectada ao controle de privacidade real. */}
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
        <PremiumBlock className="overflow-hidden p-0">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {agency.logo_url ? (
                  <Image src={agency.logo_url} alt={agency.name} width={42} height={42} className="h-10 w-10 rounded-2xl border border-white/10 object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-primary/10 text-primary">
                    <PlaneTakeoff className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{agency.name}</p>
                  <p className="truncate text-xs text-zinc-400">{client?.name ? `Viagem de ${client.name} para ${trip.destination}` : `Viagem para ${trip.destination}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {whatsappHref ? (
                  <Button asChild size="sm" className="rounded-full px-3">
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Suporte</span>
                    </a>
                  </Button>
                ) : null}
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] ${statusChipClasses(trip.status)}`}>
                  {travelPhase(trip.status)}
                </span>
              </div>
            </div>
          </div>
        </PremiumBlock>

        <PremiumBlock className="overflow-hidden p-0">
          <div className="p-4 sm:p-5" style={heroStyle}>
            <div className="rounded-[24px] bg-black/28 p-4 backdrop-blur-[2px] sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">{agency.name}</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{trip.destination}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
                {client?.name ? `${client.name}, ` : ""}sua viagem está organizada em uma experiência leve, clicável e pronta para acompanhar roteiro, documentos e comunicados.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] ${statusChipClasses(trip.status)}`}>{travelPhase(trip.status)}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] tracking-[0.18em] text-zinc-300">{trip.period_label}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] tracking-[0.18em] text-zinc-300">{agency.owner_name || "Consultor dedicado"}</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Dias", value: countdown.days },
                  { label: "Horas", value: countdown.hours },
                  { label: "Min", value: countdown.minutes },
                  { label: "Seg", value: countdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-center">
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-primary/75">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-300">{countdown.label}</p>
            </div>
          </div>
        </PremiumBlock>

        <PublicNav />

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <PremiumBlock id="resumo">
              <SectionTitle
                eyebrow="Resumo rápido"
                title="Tudo o que importa para sua viagem"
                subtitle="Leitura simples e direta para acompanhar destino, datas, viajantes, documentos e contato da agência."
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Destino", value: trip.destination, icon: <MapPin className="h-4 w-4" /> },
                  { label: "Datas", value: trip.period_label, icon: <CalendarClock className="h-4 w-4" /> },
                  { label: "Viajantes", value: client?.name || "Viajante confirmado", icon: <UserRound className="h-4 w-4" /> },
                  { label: "Hotel", value: data.documents.some((doc) => normalize(doc.type).includes("voucher")) ? "Voucher disponível" : "Em preparação", icon: <ShieldCheck className="h-4 w-4" /> },
                  { label: "Voos", value: data.documents.some((doc) => normalize(doc.type).includes("passagem")) ? "Passagens liberadas" : "Informação compartilhada pela agência", icon: <PlaneTakeoff className="h-4 w-4" /> },
                  { label: "Consultor", value: agency.owner_name || "Equipe da agência", icon: <Headphones className="h-4 w-4" /> },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      setDetailItem({
                        id: item.label,
                        kind: "timeline",
                        title: item.label,
                        description: item.value,
                        meta: "Resumo da viagem",
                      })
                    }
                    className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/14 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-2 text-primary">{item.icon}<span className="text-[11px] uppercase tracking-[0.18em]">{item.label}</span></div>
                    <p className="mt-3 text-sm leading-6 text-white">{item.value}</p>
                  </button>
                ))}
              </div>
            </PremiumBlock>

            <PremiumBlock>
              <SectionTitle
                eyebrow="Linha do tempo"
                title="Etapas da viagem"
                subtitle="Uma visão didática do que já aconteceu e do que vem a seguir."
              />
              <div className="mt-4 space-y-3">
                {timeline.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setDetailItem({
                        id: item.id,
                        kind: "timeline",
                        title: item.title,
                        subtitle: item.meta,
                        description: item.detail,
                        meta: "Linha do tempo da viagem",
                      })
                    }
                    className="flex w-full items-start gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/14 hover:bg-white/[0.05]"
                  >
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.status === "done" ? "bg-emerald-300" : item.status === "attention" ? "bg-amber-300" : "bg-primary"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <span className="text-xs text-zinc-500">{item.meta}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{item.detail}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                  </button>
                ))}
              </div>
            </PremiumBlock>

            <PremiumBlock id="documentos">
              <SectionTitle
                eyebrow="Documentos"
                title="Materiais da viagem"
                subtitle="Roteiro, voucher, passagem, seguro e outros materiais organizados em uma lista simples."
              />
              <div className="mt-4 space-y-3">
                {data.documents.length ? (
                  data.documents.map((item) => (
                    <div key={item.key} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="rounded-2xl border border-white/10 bg-primary/10 p-2 text-primary">
                              <FileBadge2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.title}</p>
                              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{documentIconLabel(item.type)}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-zinc-400">{item.note}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] ${statusChipClasses(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.href ? (
                          <Button asChild size="sm" className="rounded-full">
                            <a href={item.href} target="_blank" rel="noreferrer">Visualizar</a>
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-white/10 bg-white/[0.03]"
                          onClick={() =>
                            setDetailItem({
                              id: item.key,
                              kind: "document",
                              title: item.title,
                              subtitle: documentIconLabel(item.type),
                              description: item.note,
                              meta: item.status,
                              actionHref: item.href,
                              actionLabel: item.href ? "Abrir documento" : undefined,
                            })
                          }
                        >
                          Abrir detalhe
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-white/10 bg-white/[0.03]"
                          onClick={() =>
                            setDetailItem({
                              id: `${item.key}-download`,
                              kind: "document",
                              title: "Download em preparação",
                              description: "O download direto será conectado ao armazenamento público da viagem em uma próxima etapa.",
                              meta: "Estado honesto",
                            })
                          }
                        >
                          Baixar
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-zinc-400">
                    Os documentos públicos ainda estão sendo organizados pela agência.
                  </div>
                )}
              </div>
            </PremiumBlock>

            <PremiumBlock id="agenda">
              <SectionTitle
                eyebrow="Agenda"
                title="Agenda da viagem"
                subtitle="Atividades, voos, check-ins e lembretes organizados em formato simples para o celular."
              />
              <div className="mt-4 space-y-3">
                {agenda.length ? (
                  agenda.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setDetailItem({
                          id: item.id,
                          kind: "agenda",
                          title: item.title,
                          subtitle: item.timeLabel,
                          description: item.detail,
                          meta: item.status,
                        })
                      }
                      className="flex w-full items-start gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/14 hover:bg-white/[0.05]"
                    >
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-primary">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <span className="text-xs text-zinc-500">{item.timeLabel}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{item.detail}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-zinc-400">
                    A agenda detalhada ainda será liberada pela agência.
                  </div>
                )}
              </div>
            </PremiumBlock>
          </div>

          <div className="space-y-4">
            <PremiumBlock id="mensagens">
              <SectionTitle
                eyebrow="Mensagens"
                title="Comunicados da agência"
                subtitle="Avisos, lembretes e instruções importantes da viagem."
              />
              <div className="mt-4 space-y-3">
                {messages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setDetailItem({
                        id: item.id,
                        kind: "message",
                        title: item.title,
                        subtitle: item.timeLabel,
                        description: item.body,
                        meta: "Comunicado da agência",
                      })
                    }
                    className="w-full rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/14 hover:bg-white/[0.05]"
                  >
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-primary/75">{item.timeLabel}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-[22px] border border-white/8 bg-black/18 p-4 text-sm text-zinc-400">
                Envio de mensagens será conectado depois.
              </div>
            </PremiumBlock>

            <PremiumBlock>
              <SectionTitle
                eyebrow="Notificações"
                title="Alertas da viagem"
                subtitle="Documentos novos, atualizações, embarque próximo e avisos importantes."
              />
              <div className="mt-4 space-y-3">
                {notifications.map((item) => {
                  const isRead = readNotifications[item.id]

                  return (
                    <div key={item.id} className={`rounded-[24px] border p-4 transition ${isRead ? "border-white/8 bg-white/[0.02]" : "border-primary/14 bg-primary/[0.05]"}`}>
                      <button
                        type="button"
                        onClick={() =>
                          setDetailItem({
                            id: item.id,
                            kind: "notification",
                            title: item.title,
                            subtitle: item.timeLabel,
                            description: item.body,
                            meta: isRead ? "Lido" : "Novo alerta",
                          })
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-primary">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-white">{item.title}</p>
                              <span className="text-xs text-zinc-500">{item.timeLabel}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
                          </div>
                        </div>
                      </button>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => markNotificationRead(item.id)}>
                          {isRead ? "Lida" : "Marcar como lida"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </PremiumBlock>

            <PremiumBlock>
              <SectionTitle
                eyebrow="Histórico"
                title="Movimentos recentes"
                subtitle="Registro simples das principais mudanças dessa viagem compartilhável."
              />
              <div className="mt-4 space-y-3">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setDetailItem({
                        id: item.id,
                        kind: "history",
                        title: item.title,
                        subtitle: item.timeLabel,
                        description: item.body,
                        meta: "Histórico da viagem",
                      })
                    }
                    className="flex w-full items-start gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/14 hover:bg-white/[0.05]"
                  >
                    <div className="rounded-full border border-primary/18 bg-primary/[0.08] p-1.5 text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">{item.body}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/75">{item.timeLabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </PremiumBlock>

            <PremiumBlock id="suporte">
              <SectionTitle
                eyebrow="Suporte"
                title="Falar com a agência"
                subtitle="Contato rápido com a agência, consultor e canais principais da viagem."
              />
              <div className="mt-4 space-y-3">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{agency.name}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{agency.owner_name ? `${agency.owner_name} acompanha esta jornada.` : "Equipe da agência pronta para suporte."}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-primary/75">Horário de atendimento compartilhado pela agência</p>
                </div>
                <div className="grid gap-2">
                  {whatsappHref ? (
                    <Button asChild className="h-11 rounded-full">
                      <a href={whatsappHref} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        Falar com a agência
                      </a>
                    </Button>
                  ) : null}
                  {agency.phone ? (
                    <Button asChild variant="outline" className="h-11 rounded-full border-white/10 bg-white/[0.03]">
                      <a href={`tel:${agency.phone}`}>
                        <Phone className="h-4 w-4" />
                        Ligar para a agência
                      </a>
                    </Button>
                  ) : null}
                  {emailHref ? (
                    <Button asChild variant="outline" className="h-11 rounded-full border-white/10 bg-white/[0.03]">
                      <a href={emailHref}>
                        <Mail className="h-4 w-4" />
                        Enviar e-mail
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    className="h-11 rounded-full border-white/10 bg-white/[0.03]"
                    onClick={() =>
                      setDetailItem({
                        id: "support-detail",
                        kind: "message",
                        title: "Atendimento da viagem",
                        description: "A agência segue como canal principal de suporte desta jornada. O envio de mensagens diretas por esta interface será conectado depois.",
                        meta: "Estado honesto",
                      })
                    }
                  >
                    <Sparkles className="h-4 w-4" />
                    Ver instruções de suporte
                  </Button>
                </div>
              </div>
            </PremiumBlock>
          </div>
        </div>
      </div>

      <DetailModal item={detailItem} open={Boolean(detailItem)} onOpenChange={(next) => !next && setDetailItem(null)} />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/80 p-3 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            {copied ? "Copiado" : "Link"}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onClick={() =>
              setDetailItem({
                id: "messages-footer",
                kind: "message",
                title: "Mensagens",
                description: "Envio de mensagens será conectado depois.",
                meta: "Estado honesto",
              })
            }
          >
            <Mail className="h-4 w-4" />
            Avisos
          </Button>
          {whatsappHref ? (
            <Button asChild className="rounded-full">
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Suporte
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Baixar
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
