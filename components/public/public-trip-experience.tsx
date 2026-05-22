"use client"

import { useMemo, useState } from "react"
import type { CSSProperties } from "react"
import {
  CheckCheck,
  ChevronDown,
  Copy,
  Download,
  FileBadge,
  Mail,
  MessageCircle,
  Phone,
  PlaneTakeoff,
  Share2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PublicTripDocument, PublicTripExperienceData } from "@/types/trip-share"

type DocumentGroup = {
  key: string
  label: string
  items: PublicTripDocument[]
}

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function statusClasses(label: string) {
  const normalized = normalize(label)

  if (normalized.includes("confirm") || normalized.includes("ativo") || normalized.includes("andamento")) {
    return "border-green-400/20 bg-green-400/10 text-green-300"
  }

  if (normalized.includes("planej") || normalized.includes("pend")) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300"
  }

  return "border-white/10 bg-white/[0.06] text-muted-foreground"
}

function formatDateTimeLabel(value?: string | null) {
  if (!value) return "Ainda não visualizado"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function buildCountdownLabel(value?: string | null) {
  if (!value) return "Data em definição"
  const start = new Date(value)
  if (Number.isNaN(start.getTime())) return "Data em definição"

  const now = new Date()
  const diff = start.getTime() - now.getTime()
  const day = 24 * 60 * 60 * 1000
  const days = Math.ceil(diff / day)

  if (days > 1) return `Faltam ${days} dias`
  if (days === 1) return "Falta 1 dia"
  if (days === 0) return "Começa hoje"
  return "Viagem em andamento ou concluída"
}

function buildWhatsAppHref(phone?: string | null) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  return `https://wa.me/${digits}`
}

function documentGroupKey(type: string) {
  const normalized = normalize(type)
  if (normalized.includes("voucher")) return "voucher"
  if (normalized.includes("roteiro")) return "roteiro"
  if (normalized.includes("contrato")) return "contrato"
  if (normalized.includes("passagem")) return "passagem"
  return "anexo"
}

function documentGroupLabel(group: string) {
  if (group === "voucher") return "Vouchers"
  if (group === "roteiro") return "Roteiros"
  if (group === "contrato") return "Contratos e propostas"
  if (group === "passagem") return "Passagens"
  return "Anexos"
}

function buildTimeline(data: PublicTripExperienceData) {
  const items: Array<{ key: string; eyebrow: string; title: string; detail: string }> = []

  if (data.trip?.starts_at) {
    items.push({
      key: "departure",
      eyebrow: "Ida",
      title: data.trip.origin || "Saída organizada",
      detail: `Sua jornada começa em ${data.trip.period_label}.`,
    })
  }

  if (data.documents.some((item) => normalize(item.type).includes("voucher"))) {
    items.push({
      key: "stay",
      eyebrow: "Hospedagem",
      title: "Voucher e hospedagem liberados",
      detail: "Os materiais principais da estadia já estão centralizados neste link.",
    })
  }

  if (data.itinerary.length > 0) {
    items.push(
      ...data.itinerary.slice(0, 3).map((item) => ({
        key: item.key,
        eyebrow: item.day_label,
        title: item.title,
        detail: item.note,
      })),
    )
  }

  if (data.documents.some((item) => normalize(item.type).includes("passagem"))) {
    items.push({
      key: "return",
      eyebrow: "Retorno",
      title: "Passagens disponíveis",
      detail: "Os trechos e materiais liberados pela agência ficam acessíveis aqui.",
    })
  }

  return items.slice(0, 6)
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,#060606_0%,#0a0a0a_100%)] px-4 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[36px] border border-white/10 bg-black/55 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-8">
          <div className="rounded-[28px] border border-primary/15 bg-primary/[0.06] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/80">TravelPro Concierge</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Link indisponível</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="Status" value="Experiência protegida" />
            <InfoCard label="Próximo passo" value="Solicite à sua agência um novo link compartilhável da viagem." />
          </div>
        </div>
      </div>
    </main>
  )
}

export function PublicTripExperience({ data }: { data: PublicTripExperienceData }) {
  const [copied, setCopied] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    voucher: true,
    roteiro: true,
  })

  const trip = data.trip
  const agency = data.agency
  const client = data.client
  const accentColor = agency?.primary_color || "#f97316"
  const whatsappHref = buildWhatsAppHref(agency?.phone)
  const countdownLabel = buildCountdownLabel(trip?.starts_at)

  const documentGroups = useMemo<DocumentGroup[]>(() => {
    const groups = new Map<string, PublicTripDocument[]>()

    data.documents.forEach((item) => {
      const key = documentGroupKey(item.type)
      groups.set(key, [...(groups.get(key) ?? []), item])
    })

    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: documentGroupLabel(key),
      items,
    }))
  }, [data.documents])

  const timelineItems = useMemo(() => buildTimeline(data), [data])

  if (!trip || !agency) {
    return <PublicTripUnavailable status={data.status} />
  }

  const handleCopy = async () => {
    const target = typeof window !== "undefined" ? new URL(data.share_url, window.location.origin).toString() : data.share_url
    await navigator.clipboard.writeText(target)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const target = typeof window !== "undefined" ? new URL(data.share_url, window.location.origin).toString() : data.share_url

    if (navigator.share) {
      await navigator.share({
        title: `Viagem para ${trip.destination}`,
        text: `Acompanhe sua viagem para ${trip.destination} neste link.`,
        url: target,
      })
      return
    }

    await handleCopy()
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,#060606_0%,#0a0a0a_100%)] px-4 pb-28 pt-5 text-foreground md:px-6 md:pb-10 md:pt-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section
          className="overflow-hidden rounded-[36px] border border-white/10 bg-black/60 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          style={
            agency.primary_color || agency.banner_url
              ? ({
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.88) 100%), radial-gradient(circle at top, ${accentColor}22, transparent 35%), url(${agency.banner_url || ""})`,
                  backgroundSize: agency.banner_url ? "cover" : undefined,
                  backgroundPosition: agency.banner_url ? "center" : undefined,
                } as CSSProperties)
              : undefined
          }
        >
          <div className="p-5 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  Concierge digital da viagem
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] ${statusClasses(trip.status)}`}>
                  {trip.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
                  {countdownLabel}
                </span>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3">
                    {agency.logo_url ? (
                      <img src={agency.logo_url} alt={agency.name} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-primary/10 text-primary">
                        <PlaneTakeoff className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-primary/70">{agency.name}</p>
                      <h1 className="mt-1 text-3xl font-semibold text-foreground md:text-5xl">{trip.destination}</h1>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-8 text-muted-foreground">
                    {client?.name ? `${client.name}, ` : ""}acompanhe sua viagem em um só lugar, com roteiro, documentos e atualizações da agência.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:max-w-sm lg:grid-cols-1">
                  <InfoCard label="Período" value={trip.period_label} />
                  <InfoCard label="Origem" value={trip.origin || "Origem em definição"} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Viajante" value={client?.name || "Nome não informado"} />
                <InfoCard label="Roteiro" value={data.itinerary.length > 0 ? `${data.itinerary.length} etapas organizadas` : "Em preparação"} />
                <InfoCard label="Documentos" value={data.documents.length > 0 ? `${data.documents.length} materiais liberados` : "Sem documentos públicos"} />
                <InfoCard label="Acessos" value={`${data.view_count} visualizações`} />
              </div>

              <div className="flex flex-wrap gap-2">
                {whatsappHref ? (
                  <Button asChild className="rounded-full">
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Falar com a agência
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void handleShare()}>
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void handleCopy()}>
                  <Copy className="h-4 w-4" />
                  {copied ? "Link copiado" : "Copiar link"}
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Baixar resumo
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Resumo da viagem</p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">Sua experiência organizada</h2>
                </div>
              </div>
              <div className="mt-4 rounded-[24px] border border-primary/15 bg-primary/[0.06] p-4 text-sm leading-7 text-muted-foreground">
                {trip.summary?.trim() || "A agência ainda está preparando mais contexto para esta viagem. Este link já está pronto para concentrar roteiro, documentos e atualizações."}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Timeline da viagem</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Etapas mais importantes</h2>
              <div className="mt-4 space-y-3">
                {timelineItems.length > 0 ? (
                  timelineItems.map((item, index) => (
                    <div key={item.key} className="relative overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent" />
                      <div className="relative pl-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{item.eyebrow}</p>
                        <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                        <p className="mt-3 text-xs text-muted-foreground">{index === 0 ? "Próxima etapa" : "Momento da jornada"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                    A timeline detalhada ainda está sendo organizada pela agência para esta viagem.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Documentos</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Materiais organizados por tipo</h2>
              <div className="mt-4 space-y-3">
                {documentGroups.length > 0 ? (
                  documentGroups.map((group) => {
                    const open = expandedGroups[group.key] ?? false

                    return (
                      <div key={group.key} className="rounded-[24px] border border-white/8 bg-white/[0.03]">
                        <button
                          type="button"
                          onClick={() => setExpandedGroups((current) => ({ ...current, [group.key]: !open }))}
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{group.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{group.items.length} item(ns) disponíveis</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        {open ? (
                          <div className="space-y-3 border-t border-white/8 px-4 py-4">
                            {group.items.map((item) => (
                              <div key={item.key} className="flex flex-col gap-4 rounded-[20px] border border-white/8 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="rounded-2xl border border-white/10 bg-primary/10 p-3 text-primary">
                                    <FileBadge className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] ${statusClasses(item.status)}`}>
                                        {item.status}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/70">{item.type}</p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                                  </div>
                                </div>
                                {item.href ? (
                                  <Button asChild className="rounded-full">
                                    <a href={item.href} target="_blank" rel="noreferrer">
                                      Abrir
                                    </a>
                                  </Button>
                                ) : (
                                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
                                    Disponível com a agência
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                    Nenhum documento público foi liberado ainda para esta viagem.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Checklist da viagem</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Tudo o que já está pronto</h2>
              <div className="mt-4 grid gap-3">
                {data.checklist.map((item) => (
                  <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className={item.done ? "rounded-full border border-green-400/20 bg-green-400/15 p-1.5 text-green-300" : "rounded-full border border-amber-400/20 bg-amber-400/15 p-1.5 text-amber-300"}>
                      {item.done ? <CheckCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.done ? "Disponível" : "Em preparação"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Atualizações</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Últimos movimentos da viagem</h2>
              <div className="mt-4 space-y-3">
                {data.updates.map((item) => (
                  <div key={item.key} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary/70">{item.time_label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Agência e suporte</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Canal direto para dúvidas</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-foreground">{agency.name}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {agency.owner_name ? `${agency.owner_name} acompanha esta jornada pela agência.` : "A agência está usando o TravelPro para organizar sua experiência."}
                  </p>
                </div>
                {whatsappHref ? (
                  <Button asChild className="w-full rounded-full">
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Suporte da viagem no WhatsApp
                    </a>
                  </Button>
                ) : null}
                {agency.phone ? (
                  <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]">
                    <a href={`tel:${agency.phone}`}>
                      <Phone className="h-4 w-4" />
                      Ligar para a agência
                    </a>
                  </Button>
                ) : null}
                {agency.email ? (
                  <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/[0.03]">
                    <a href={`mailto:${agency.email}`}>
                      <Mail className="h-4 w-4" />
                      Enviar e-mail
                    </a>
                  </Button>
                ) : null}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Link compartilhável</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Acompanhamento leve</h2>
              <div className="mt-4 grid gap-3">
                <InfoCard label="Status do link" value="Ativo" />
                <InfoCard label="Visualizações" value={`${data.view_count}`} />
                <InfoCard label="Última visualização" value={formatDateTimeLabel(data.viewed_at)} />
              </div>
            </section>
          </div>
        </div>
      </div>

      {whatsappHref ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/80 p-4 backdrop-blur-xl md:hidden">
          <Button asChild className="w-full rounded-full">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" />
              Falar com a agência
            </a>
          </Button>
        </div>
      ) : null}
    </main>
  )
}
