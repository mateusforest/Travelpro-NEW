"use client"

import { useMemo, useState } from "react"
import { Eye, MoreHorizontal, Share2, TriangleAlert } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { DashboardCard } from "@/components/system/dashboard-card"
import { FilterTabs } from "@/components/system/filter-tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

type ClientTrip = {
  id: string
  destination: string
  status: "Futura" | "Em andamento" | "Passada"
  dates: string
  travelers: string
  summary: string
  agency: string
  nextStep: string
}

const tripFilters = ["Todas as viagens", "Viagens futuras", "Viagens passadas"]

const clientTrips: ClientTrip[] = [
  {
    id: "trip-01",
    destination: "Cancún",
    status: "Futura",
    dates: "02 jun • 09 jun",
    travelers: "Ana Martins e família",
    summary: "Viagem confirmada com hotel all inclusive, transfer e passeio marítimo.",
    agency: "JT Viagens",
    nextStep: "Voucher do hotel será liberado em 48h.",
  },
  {
    id: "trip-02",
    destination: "Orlando",
    status: "Em andamento",
    dates: "15 mai • 25 mai",
    travelers: "João Ribeiro",
    summary: "Viagem em andamento com parques, compras e roteiro flexível.",
    agency: "JT Viagens",
    nextStep: "Hoje você tem ingressos confirmados para o parque às 08:00.",
  },
  {
    id: "trip-03",
    destination: "Lisboa",
    status: "Passada",
    dates: "10 fev • 17 fev",
    travelers: "Marina Costa",
    summary: "Roteiro cultural concluído com hotel boutique e city tours privativos.",
    agency: "JT Viagens",
    nextStep: "Viagem concluída e disponível para relembrar documentos e recibos.",
  },
]

const statusClasses: Record<ClientTrip["status"], string> = {
  Futura: "border-primary/15 bg-primary/10 text-primary",
  "Em andamento": "border-amber-400/15 bg-amber-400/10 text-amber-300",
  Passada: "border-white/10 bg-white/[0.06] text-muted-foreground",
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  )
}

export function ClientTripPage() {
  const [activeFilter, setActiveFilter] = useState(tripFilters[0])
  const [selectedTrip, setSelectedTrip] = useState<ClientTrip | null>(null)

  const visibleTrips = useMemo(() => {
    if (activeFilter === "Todas as viagens") return clientTrips
    if (activeFilter === "Viagens futuras") return clientTrips.filter((trip) => trip.status !== "Passada")
    return clientTrips.filter((trip) => trip.status === "Passada")
  }, [activeFilter])

  const fireMock = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="Viagens"
        description="Veja suas viagens, acompanhe o momento atual e abra detalhes sempre que precisar."
        actions={<FilterTabs items={tripFilters} activeItem={activeFilter} onChange={setActiveFilter} />}
      />

      <DashboardCard title="Minhas viagens" description="Acompanhe histórico, próximas etapas e ações rápidas da viagem.">
        <div className="space-y-3">
          {visibleTrips.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <button type="button" onClick={() => setSelectedTrip(trip)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{trip.destination}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] ${statusClasses[trip.status]}`}>
                    {trip.status}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/70">{trip.dates}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{trip.summary}</p>
                <p className="mt-3 text-xs text-muted-foreground">{trip.travelers}</p>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <Button className="rounded-full" onClick={() => setSelectedTrip(trip)}>
                  <Eye className="h-4 w-4" />
                  Abrir viagem
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
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelectedTrip(trip)}>
                      <Eye className="h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-2xl px-3 py-2.5"
                      onSelect={() => fireMock("Link preparado", `O compartilhamento da viagem para ${trip.destination} será conectado depois.`)}
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-2xl px-3 py-2.5"
                      onSelect={() => fireMock("Problema reportado", `A agência recebeu um alerta sobre a viagem para ${trip.destination}.`)}
                    >
                      <TriangleAlert className="h-4 w-4" />
                      Reportar problema
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <Dialog open={Boolean(selectedTrip)} onOpenChange={(open) => !open && setSelectedTrip(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedTrip ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedTrip.destination}</DialogTitle>
                <DialogDescription>Abra a visão completa da viagem e acompanhe tudo com mais clareza.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBlock label="Status" value={selectedTrip.status} />
                  <InfoBlock label="Período" value={selectedTrip.dates} />
                  <InfoBlock label="Viajantes" value={selectedTrip.travelers} />
                  <InfoBlock label="Agência responsável" value={selectedTrip.agency} />
                  <InfoBlock label="Resumo" value={selectedTrip.summary} />
                  <InfoBlock label="Próximo passo" value={selectedTrip.nextStep} />
                </div>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() => fireMock("Link preparado", `O compartilhamento da viagem para ${selectedTrip.destination} será conectado depois.`)}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() => fireMock("Problema reportado", `A agência recebeu um alerta sobre a viagem para ${selectedTrip.destination}.`)}
                >
                  Reportar problema
                </Button>
                <Button className="rounded-full" onClick={() => setSelectedTrip(selectedTrip)}>
                  Ver detalhes
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
