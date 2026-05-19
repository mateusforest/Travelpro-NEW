"use client"

import { useMemo, useState } from "react"
import { Download, Eye, MoreHorizontal, Share2, Sparkles, TriangleAlert } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { DashboardCard } from "@/components/system/dashboard-card"
import { FilterTabs } from "@/components/system/filter-tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

type ItineraryTrip = {
  id: string
  trip: string
  destination: string
  summary: string
  days: {
    day: string
    title: string
    time: string
    note: string
  }[]
}

const itineraries: ItineraryTrip[] = [
  {
    id: "trip-cancun",
    trip: "Cancún",
    destination: "Cancún",
    summary: "Roteiro premium com transfer, experiências à beira-mar e jantar especial.",
    days: [
      { day: "Dia 1", title: "Chegada e check-in no resort", time: "14:00", note: "Transfer privativo confirmado e recepção premium no lobby." },
      { day: "Dia 2", title: "Passeio de catamarã", time: "09:00", note: "Levar documento, roupa leve e protetor solar." },
      { day: "Dia 3", title: "Jantar especial frente mar", time: "20:00", note: "Mesa reservada e menu alinhado com suas preferências." },
    ],
  },
  {
    id: "trip-orlando",
    trip: "Orlando",
    destination: "Orlando",
    summary: "Viagem em família com parques, compras e janelas livres para descanso.",
    days: [
      { day: "Dia 1", title: "Check-in e organização do dia", time: "15:30", note: "Chegada ao hotel com welcome kit entregue pela agência." },
      { day: "Dia 2", title: "Parque temático", time: "08:00", note: "Ingressos e transporte já vinculados à viagem." },
    ],
  },
  {
    id: "trip-maldivas",
    trip: "Maldivas",
    destination: "Maldivas",
    summary: "Experiência romântica com agenda leve e atividades exclusivas.",
    days: [
      { day: "Dia 1", title: "Traslado aquático", time: "11:20", note: "Equipe do resort aguardando no desembarque." },
      { day: "Dia 2", title: "Spa e sunset cruise", time: "17:10", note: "Reservas confirmadas e pagas." },
    ],
  },
]

const itineraryFilters = ["Todos os roteiros", "Cancún", "Orlando", "Maldivas"]

function DayCard({ day, title, time, note }: { day: string; title: string; time: string; note: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{day}</p>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-primary">{time}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  )
}

export function ClientItinerary() {
  const [activeFilter, setActiveFilter] = useState(itineraryFilters[0])
  const [selectedTrip, setSelectedTrip] = useState<ItineraryTrip | null>(null)

  const visibleTrips = useMemo(() => {
    if (activeFilter === "Todos os roteiros") return itineraries
    return itineraries.filter((item) => item.trip === activeFilter)
  }, [activeFilter])

  const fireMock = (title: string, description: string) => toast({ title, description })

  const activeTrip = visibleTrips[0] ?? null

  return (
    <PageShell>
      <SectionHeader
        title="Roteiro da viagem"
        description="Veja o plano dia a dia com horários, observações e ações rápidas."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <FilterTabs items={itineraryFilters} activeItem={activeFilter} onChange={setActiveFilter} />
            <Button
              className="rounded-full"
              onClick={() => fireMock("Roteiro baixado", "O PDF do roteiro será conectado depois.")}
            >
              <Download className="h-4 w-4" />
              Baixar roteiro
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <DashboardCard title="Roteiros disponíveis" description="Escolha a viagem para abrir o roteiro correspondente.">
          <div className="space-y-3">
            {visibleTrips.map((trip) => (
              <button
                key={trip.id}
                type="button"
                onClick={() => setSelectedTrip(trip)}
                className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                  activeTrip?.id === trip.id
                    ? "border-primary/20 bg-primary/10 shadow-[0_0_28px_rgba(255,122,0,0.06)]"
                    : "border-white/8 bg-white/[0.03] hover:border-white/12"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{trip.destination}</p>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{trip.summary}</h3>
                <p className="mt-3 text-xs text-muted-foreground">{trip.days.length} etapas planejadas</p>
              </button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title={activeTrip ? `Roteiro • ${activeTrip.destination}` : "Roteiro"}
          description="Acompanhe o roteiro completo, compartilhe e sinalize ajustes quando precisar."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                onClick={() => fireMock("Roteiro completo aberto", "A visualização completa do roteiro foi aberta em modo mockado.")}
              >
                <Eye className="h-4 w-4" />
                Abrir roteiro completo
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-52 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl"
                >
                  <DropdownMenuItem
                    className="rounded-2xl px-3 py-2.5"
                    onSelect={() => fireMock("Compartilhamento preparado", "O compartilhamento do roteiro será conectado depois.")}
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-2xl px-3 py-2.5"
                    onSelect={() => fireMock("Ajuste solicitado", "A agência recebeu seu pedido de ajuste em modo mockado.")}
                  >
                    <TriangleAlert className="h-4 w-4" />
                    Reportar ajuste
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => activeTrip && setSelectedTrip(activeTrip)}>
                    <Sparkles className="h-4 w-4" />
                    Ver detalhes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        >
          {activeTrip ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {activeTrip.days.map((item) => (
                <button key={`${activeTrip.id}-${item.day}`} type="button" onClick={() => setSelectedTrip(activeTrip)} className="text-left">
                  <DayCard day={item.day} title={item.title} time={item.time} note={item.note} />
                </button>
              ))}
            </div>
          ) : null}
        </DashboardCard>
      </div>

      <Dialog open={Boolean(selectedTrip)} onOpenChange={(open) => !open && setSelectedTrip(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedTrip ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>Roteiro completo • {selectedTrip.destination}</DialogTitle>
                <DialogDescription>Veja as etapas da viagem, compartilhe o plano e sinalize ajustes em um só painel.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">Resumo</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{selectedTrip.summary}</p>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {selectedTrip.days.map((item) => (
                    <DayCard key={`${selectedTrip.id}-modal-${item.day}`} day={item.day} title={item.title} time={item.time} note={item.note} />
                  ))}
                </div>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() => fireMock("Compartilhamento preparado", "O compartilhamento do roteiro será conectado depois.")}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() => fireMock("Ajuste solicitado", "A agência recebeu seu pedido de ajuste em modo mockado.")}
                >
                  Reportar ajuste
                </Button>
                <Button className="rounded-full" onClick={() => fireMock("Roteiro baixado", "O PDF do roteiro será conectado depois.")}>
                  Baixar roteiro
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
