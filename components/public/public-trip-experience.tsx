import type { CSSProperties } from "react"
import { CalendarClock, CheckCheck, FileBadge, Mail, MapPinned, MessageCircle, Phone, PlaneTakeoff, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PublicTripExperienceData } from "@/types/trip-share"

function statusClasses(label: string) {
  const normalized = label.toLowerCase()

  if (normalized.includes("confirm") || normalized.includes("ativo") || normalized.includes("andamento")) {
    return "border-green-400/20 bg-green-400/10 text-green-300"
  }

  if (normalized.includes("planej") || normalized.includes("pend")) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300"
  }

  return "border-white/10 bg-white/[0.06] text-muted-foreground"
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  )
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
  const trip = data.trip
  const agency = data.agency
  const client = data.client
  const accentColor = agency?.primary_color || "#f97316"
  const whatsappHref = buildWhatsAppHref(agency?.phone)
  const countdownLabel = buildCountdownLabel(trip?.starts_at)

  if (!trip || !agency) {
    return <PublicTripUnavailable status={data.status} />
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,#060606_0%,#0a0a0a_100%)] px-4 py-6 text-foreground md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <section
          className="overflow-hidden rounded-[36px] border border-white/10 bg-black/60 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          style={
            agency.primary_color || agency.banner_url
              ? ({
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.88) 100%), radial-gradient(circle at top, ${accentColor}22, transparent 35%), url(${agency.banner_url || ""})`,
                  backgroundSize: agency.banner_url ? "cover" : undefined,
                  backgroundPosition: agency.banner_url ? "center" : undefined,
                } as CSSProperties)
              : undefined
          }
        >
          <div className="p-5 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary/80">
                    Experiência compartilhável
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] ${statusClasses(trip.status)}`}>
                    {trip.status}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
                    {countdownLabel}
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  {agency.logo_url ? (
                    <img src={agency.logo_url} alt={agency.name} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-primary/10 text-primary">
                      <PlaneTakeoff className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-primary/70">{agency.name}</p>
                    <h1 className="mt-1 text-3xl font-semibold text-foreground md:text-4xl">{trip.destination}</h1>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {client?.name ? `${client.name}, ` : ""}acompanhe sua viagem em um único link, com roteiro, documentos e atualizações preparadas pela agência.
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-sm lg:grid-cols-1">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5 text-primary">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Período</p>
                      <p className="text-xs text-muted-foreground">{trip.period_label}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5 text-primary">
                      <MapPinned className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Origem</p>
                      <p className="text-xs text-muted-foreground">{trip.origin || "Origem em definição"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Viajante" value={client?.name || "Nome não informado"} />
              <InfoCard label="Status da viagem" value={trip.status} />
              <InfoCard label="Roteiro" value={data.itinerary.length > 0 ? `${data.itinerary.length} etapas organizadas` : "Roteiro em preparação"} />
              <InfoCard label="Documentos" value={data.documents.length > 0 ? `${data.documents.length} itens disponíveis` : "Sem documentos públicos ainda"} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Resumo da viagem</p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">Tudo o que importa em um só lugar</h2>
                </div>
              </div>
              <div className="mt-4 rounded-[24px] border border-primary/15 bg-primary/[0.06] p-4 text-sm leading-7 text-muted-foreground">
                {trip.summary?.trim() || "A agência ainda está preparando mais contexto para esta viagem. O link já está ativo para concentrar roteiro, documentos e atualizações."}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
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
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Roteiro público</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Sua jornada etapa por etapa</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {data.itinerary.length > 0 ? (
                  data.itinerary.map((item) => (
                    <div key={item.key} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{item.day_label}</p>
                      <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-primary">{item.time_label || "Horário em definição"}</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground md:col-span-2">
                    O roteiro detalhado ainda não foi publicado pela agência, mas este link já está pronto para receber as próximas etapas.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Documentos e vouchers</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Materiais públicos liberados</h2>
              <div className="mt-4 space-y-3">
                {data.documents.length > 0 ? (
                  data.documents.map((item) => (
                    <div key={item.key} className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
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
                            Abrir documento
                          </a>
                        </Button>
                      ) : (
                        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
                          Disponível com a agência
                        </div>
                      )}
                    </div>
                  ))
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
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Atualizações da viagem</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">O que mudou recentemente</h2>
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
              <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Sua agência</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Atendimento e contato</h2>
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
                      Falar no WhatsApp
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
                {!agency.phone && !agency.email ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
                    O contato direto da agência ainda não foi publicado neste link.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
