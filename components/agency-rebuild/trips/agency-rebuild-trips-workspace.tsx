"use client"

import { useMemo, useState } from "react"
import {
  BriefcaseBusiness,
  FileText,
  Map,
  PlaneTakeoff,
  Share2,
  Users,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type TripsTab =
  | "overview"
  | "trips"
  | "upcoming"
  | "active"
  | "completed"
  | "itineraries"
  | "documents"
  | "links"
  | "checklist"

type TripStatus =
  | "Rascunho"
  | "Cotacao"
  | "Confirmada"
  | "Em andamento"
  | "Concluida"
  | "Cancelada"

type TripKind =
  | "Lazer"
  | "Corporativa"
  | "Grupo"
  | "Lua de mel"
  | "Familia"
  | "Intercambio"
  | "Outro"

type ItineraryStatus = "Rascunho" | "Enviado" | "Aprovado"
type DocumentStatus = "Pendente" | "Gerado" | "Enviado" | "Assinado"

type TripClient = {
  id: string
  name: string
  email: string
  phone: string
}

type TripDocument = {
  id: string
  type: string
  status: DocumentStatus
  tripId: string
}

type TripItinerary = {
  id: string
  title: string
  status: ItineraryStatus
  tripId: string
}

type ShareLink = {
  id: string
  tripId: string
  url: string
  createdAt: string
  lastAccess: string
  status: "Ativo" | "Desativado"
}

type ChecklistItem = {
  id: string
  label: string
  done: boolean
  note: string
}

type TripRecord = {
  id: string
  clientId: string
  destination: string
  origin: string
  departureDate: string
  returnDate: string
  travelers: number
  type: TripKind
  status: TripStatus
  estimatedValue: number
  owner: string
  notes: string
  tags: string[]
  timeline: string[]
  checklist: ChecklistItem[]
}

type TripFormState = {
  clientId: string
  destination: string
  origin: string
  departureDate: string
  returnDate: string
  travelers: string
  type: TripKind
  status: TripStatus
  estimatedValue: string
  owner: string
  notes: string
  tags: string
}

const clientSeed: TripClient[] = [
  { id: "marina", name: "Marina Alves", email: "marina@horizonteviagens.com", phone: "+55 54 99999-0001" },
  { id: "giulia", name: "Giulia e Dante", email: "giulia@cliente.com", phone: "+55 11 98888-1200" },
  { id: "corporate", name: "Grupo Corporativo", email: "ops@empresa.com", phone: "+55 51 97777-4500" },
]

const baseChecklist = (): ChecklistItem[] => [
  { id: "docs", label: "Documentos do cliente", done: true, note: "Passaportes conferidos." },
  { id: "tickets", label: "Passagens", done: false, note: "Aguardando emissao." },
  { id: "hotel", label: "Hotel", done: true, note: "Reserva confirmada." },
  { id: "insurance", label: "Seguro viagem", done: false, note: "Cotacao preparada." },
  { id: "payment", label: "Pagamento", done: true, note: "Entrada recebida." },
  { id: "itinerary", label: "Roteiro", done: true, note: "Versao enviada ao cliente." },
  { id: "voucher", label: "Voucher", done: false, note: "Gerar apos pagamento total." },
  { id: "support", label: "Suporte", done: false, note: "Definir ponto de contato." },
  { id: "aftercare", label: "Pos-venda", done: false, note: "Agendar retorno." },
]

const tripSeed: TripRecord[] = [
  {
    id: "trip-1",
    clientId: "marina",
    destination: "Italia Signature",
    origin: "Porto Alegre",
    departureDate: "2026-06-14",
    returnDate: "2026-06-22",
    travelers: 2,
    type: "Lazer",
    status: "Em andamento",
    estimatedValue: 18400,
    owner: "Marina Alves",
    notes: "Cliente premium com roteiro autoral e concierge.",
    tags: ["vip", "europa"],
    timeline: [
      "Reserva criada e briefing aprovado.",
      "Documento pendente de assinatura.",
      "Roteiro enviado ao cliente.",
      "Pagamento vinculado ao Financeiro.",
      "Embarque entra em janela curta.",
    ],
    checklist: baseChecklist(),
  },
  {
    id: "trip-2",
    clientId: "giulia",
    destination: "Lua de mel Grecia",
    origin: "Sao Paulo",
    departureDate: "2026-07-08",
    returnDate: "2026-07-18",
    travelers: 2,
    type: "Lua de mel",
    status: "Confirmada",
    estimatedValue: 24900,
    owner: "Time Comercial",
    notes: "Cliente deseja experiencia premium com ilhas e barco.",
    tags: ["lua de mel", "ilha"],
    timeline: [
      "Cotacao aprovada.",
      "Entrada recebida.",
      "Checklist de passagens aberto.",
    ],
    checklist: baseChecklist(),
  },
  {
    id: "trip-3",
    clientId: "corporate",
    destination: "Buenos Aires Week",
    origin: "Curitiba",
    departureDate: "2026-07-04",
    returnDate: "2026-07-09",
    travelers: 6,
    type: "Corporativa",
    status: "Concluida",
    estimatedValue: 11200,
    owner: "Operacao Premium",
    notes: "Grupo corporativo com agenda enxuta.",
    tags: ["corporativo"],
    timeline: [
      "Viagem concluida com retorno positivo.",
      "Voucher final entregue.",
      "Pos-venda aguardando agendamento.",
    ],
    checklist: baseChecklist().map((item) => ({ ...item, done: true })),
  },
]

const itinerarySeed: TripItinerary[] = [
  { id: "it-1", title: "Italia Signature 8D", status: "Enviado", tripId: "trip-1" },
  { id: "it-2", title: "Grecia Honeymoon", status: "Rascunho", tripId: "trip-2" },
  { id: "it-3", title: "Buenos Aires Week", status: "Aprovado", tripId: "trip-3" },
]

const documentSeed: TripDocument[] = [
  { id: "doc-1", type: "Contrato", status: "Pendente", tripId: "trip-1" },
  { id: "doc-2", type: "Voucher", status: "Gerado", tripId: "trip-1" },
  { id: "doc-3", type: "Seguro", status: "Enviado", tripId: "trip-2" },
  { id: "doc-4", type: "Passagens", status: "Assinado", tripId: "trip-3" },
]

const linkSeed: ShareLink[] = [
  { id: "link-1", tripId: "trip-1", url: "https://preview.travelpro.local/v/italia-signature", createdAt: "2026-05-12", lastAccess: "Hoje, 09:40", status: "Ativo" },
  { id: "link-2", tripId: "trip-2", url: "https://preview.travelpro.local/v/grecia-honeymoon", createdAt: "2026-05-20", lastAccess: "Ontem, 18:12", status: "Ativo" },
  { id: "link-3", tripId: "trip-3", url: "https://preview.travelpro.local/v/buenos-aires-week", createdAt: "2026-04-02", lastAccess: "2 dias", status: "Desativado" },
]

const travelTypes: TripKind[] = ["Lazer", "Corporativa", "Grupo", "Lua de mel", "Familia", "Intercambio", "Outro"]
const travelStatuses: TripStatus[] = ["Rascunho", "Cotacao", "Confirmada", "Em andamento", "Concluida", "Cancelada"]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value)
}

function parseCurrencyInput(value: string) {
  const numeric = value.replace(/[^\d,-.]/g, "").replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(numeric)
  return Number.isFinite(parsed) ? parsed : 0
}

function statusTone(status: TripStatus | ItineraryStatus | DocumentStatus | ShareLink["status"]) {
  if (status === "Em andamento" || status === "Enviado" || status === "Ativo") {
    return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  }
  if (status === "Confirmada" || status === "Aprovado" || status === "Gerado" || status === "Assinado" || status === "Concluida") {
    return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  }
  if (status === "Pendente" || status === "Cotacao" || status === "Rascunho") {
    return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  }
  return "border-white/10 bg-white/[0.04] text-muted-foreground"
}

function emptyTripForm(): TripFormState {
  return {
    clientId: clientSeed[0]?.id ?? "",
    destination: "",
    origin: "",
    departureDate: "2026-06-20",
    returnDate: "2026-06-28",
    travelers: "2",
    type: "Lazer",
    status: "Rascunho",
    estimatedValue: "",
    owner: "Marina Alves",
    notes: "",
    tags: "",
  }
}

export function AgencyRebuildTripsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<TripsTab>("overview")
  const [trips, setTrips] = useState<TripRecord[]>(tripSeed)
  const [clients, setClients] = useState<TripClient[]>(clientSeed)
  const [itineraries, setItineraries] = useState<TripItinerary[]>(itinerarySeed)
  const [documents, setDocuments] = useState<TripDocument[]>(documentSeed)
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(linkSeed)
  const [tripModalOpen, setTripModalOpen] = useState(false)
  const [editingTripId, setEditingTripId] = useState<string | null>(null)
  const [tripForm, setTripForm] = useState<TripFormState>(emptyTripForm())
  const [detailsTripId, setDetailsTripId] = useState<string | null>(null)
  const [clientQuickOpen, setClientQuickOpen] = useState(false)
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" })
  const [checklistTripId, setChecklistTripId] = useState<string | null>(tripSeed[0]?.id ?? null)
  const [checklistNoteTarget, setChecklistNoteTarget] = useState<{ tripId: string; itemId: string } | null>(null)
  const [checklistNote, setChecklistNote] = useState("")
  const [filters, setFilters] = useState({
    period: "30d",
    destination: "all",
    clientId: "all",
    status: "all",
    owner: "all",
    type: "all",
    docsPending: "all",
    itineraryReady: "all",
  })

  const clientLookup = useMemo(() => Object.fromEntries(clients.map((client) => [client.id, client])), [clients])
  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === detailsTripId) ?? null, [detailsTripId, trips])
  const checklistTrip = useMemo(
    () => trips.find((trip) => trip.id === checklistTripId) ?? trips[0] ?? null,
    [checklistTripId, trips],
  )

  const totalTrips = trips.length
  const upcomingTrips = trips.filter((trip) => trip.status === "Confirmada").length
  const activeTrips = trips.filter((trip) => trip.status === "Em andamento").length
  const completedTrips = trips.filter((trip) => trip.status === "Concluida").length
  const activeLinks = shareLinks.filter((link) => link.status === "Ativo").length
  const pendingDocs = documents.filter((doc) => doc.status === "Pendente").length
  const generatedItineraries = itineraries.length

  const timelineEvents = useMemo(
    () =>
      trips.flatMap((trip) =>
        trip.timeline.map((event, index) => ({
          id: `${trip.id}-${index}`,
          title: event,
          trip: trip.destination,
          client: clientLookup[trip.clientId]?.name ?? "Cliente",
        })),
      ).slice(0, 6),
    [clientLookup, trips],
  )

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        if (filters.destination !== "all" && trip.destination !== filters.destination) return false
        if (filters.clientId !== "all" && trip.clientId !== filters.clientId) return false
        if (filters.status !== "all" && trip.status !== filters.status) return false
        if (filters.owner !== "all" && trip.owner !== filters.owner) return false
        if (filters.type !== "all" && trip.type !== filters.type) return false
        if (filters.docsPending === "yes" && !documents.some((doc) => doc.tripId === trip.id && doc.status === "Pendente")) return false
        if (filters.docsPending === "no" && documents.some((doc) => doc.tripId === trip.id && doc.status === "Pendente")) return false
        if (filters.itineraryReady === "yes" && !itineraries.some((item) => item.tripId === trip.id)) return false
        if (filters.itineraryReady === "no" && itineraries.some((item) => item.tripId === trip.id)) return false
        return true
      }),
    [documents, filters, itineraries, trips],
  )

  const openTripModal = (trip?: TripRecord) => {
    if (trip) {
      setEditingTripId(trip.id)
      setTripForm({
        clientId: trip.clientId,
        destination: trip.destination,
        origin: trip.origin,
        departureDate: trip.departureDate,
        returnDate: trip.returnDate,
        travelers: String(trip.travelers),
        type: trip.type,
        status: trip.status,
        estimatedValue: formatCurrency(trip.estimatedValue),
        owner: trip.owner,
        notes: trip.notes,
        tags: trip.tags.join(", "),
      })
    } else {
      setEditingTripId(null)
      setTripForm(emptyTripForm())
    }
    setTripModalOpen(true)
  }

  const saveTrip = () => {
    if (!tripForm.clientId || !tripForm.destination || !tripForm.departureDate || !tripForm.returnDate) {
      toast({
        title: "Complete a viagem",
        description: "Cliente, destino e periodo precisam estar preenchidos antes de salvar.",
      })
      return
    }

    const payload: TripRecord = {
      id: editingTripId ?? `trip-${Date.now()}`,
      clientId: tripForm.clientId,
      destination: tripForm.destination,
      origin: tripForm.origin,
      departureDate: tripForm.departureDate,
      returnDate: tripForm.returnDate,
      travelers: Number.parseInt(tripForm.travelers || "1", 10),
      type: tripForm.type,
      status: tripForm.status,
      estimatedValue: parseCurrencyInput(tripForm.estimatedValue),
      owner: tripForm.owner,
      notes: tripForm.notes,
      tags: tripForm.tags.split(",").map((item) => item.trim()).filter(Boolean),
      timeline: [
        "Reserva criada localmente na V3.",
        "Aguardando documentos e roteiro.",
      ],
      checklist: baseChecklist(),
    }

    setTrips((current) => {
      const filtered = editingTripId ? current.filter((trip) => trip.id !== editingTripId) : current
      return [payload, ...filtered]
    })

    toast({
      title: editingTripId ? "Viagem atualizada" : "Viagem criada",
      description: "A jornada foi adicionada localmente ao preview da V3.",
    })

    setTripModalOpen(false)
    setEditingTripId(null)
  }

  const removeTrip = (tripId: string) => {
    setTrips((current) => current.filter((trip) => trip.id !== tripId))
    setDocuments((current) => current.filter((doc) => doc.tripId !== tripId))
    setItineraries((current) => current.filter((item) => item.tripId !== tripId))
    setShareLinks((current) => current.filter((link) => link.tripId !== tripId))
    if (detailsTripId === tripId) setDetailsTripId(null)
  }

  const copyShareLink = async (tripId: string) => {
    const link = shareLinks.find((item) => item.tripId === tripId)
    if (!link) {
      toast({
        title: "Link local indisponivel",
        description: "A conexao com links publicos reais sera ativada depois.",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(link.url)
      toast({
        title: "Link copiado",
        description: "O link compartilhavel local foi copiado com sucesso.",
      })
    } catch {
      toast({
        title: "Nao foi possivel copiar",
        description: "Copie o link manualmente na proxima etapa da V3.",
      })
    }
  }

  const createDocument = (tripId: string, type = "Contrato") => {
    setDocuments((current) => [
      {
        id: `doc-${Date.now()}`,
        type,
        status: "Gerado",
        tripId,
      },
      ...current,
    ])
    toast({
      title: "Documento preparado",
      description: `${type} gerado localmente para a viagem selecionada.`,
    })
  }

  const createItinerary = (tripId: string) => {
    setItineraries((current) => [
      {
        id: `it-${Date.now()}`,
        title: `Roteiro ${trips.find((trip) => trip.id === tripId)?.destination ?? "novo"}`,
        status: "Rascunho",
        tripId,
      },
      ...current,
    ])
    toast({
      title: "Roteiro criado",
      description: "Um roteiro local foi preparado dentro da V3.",
    })
  }

  const quickCreateClient = () => {
    if (!newClient.name) {
      toast({
        title: "Informe o nome do cliente",
        description: "O cadastro rapido precisa de pelo menos um nome para continuar.",
      })
      return
    }

    const client: TripClient = {
      id: `client-${Date.now()}`,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
    }

    setClients((current) => [client, ...current])
    setTripForm((current) => ({ ...current, clientId: client.id }))
    setNewClient({ name: "", email: "", phone: "" })
    setClientQuickOpen(false)
  }

  const openChecklistNote = (tripId: string, itemId: string, note: string) => {
    setChecklistNoteTarget({ tripId, itemId })
    setChecklistNote(note)
  }

  const saveChecklistNote = () => {
    if (!checklistNoteTarget) return

    setTrips((current) =>
      current.map((trip) =>
        trip.id !== checklistNoteTarget.tripId
          ? trip
          : {
              ...trip,
              checklist: trip.checklist.map((item) =>
                item.id === checklistNoteTarget.itemId ? { ...item, note: checklistNote } : item,
              ),
            },
      ),
    )
    setChecklistNoteTarget(null)
  }

  const visibleTrips =
    tab === "upcoming"
      ? filteredTrips.filter((trip) => trip.status === "Confirmada")
      : tab === "active"
        ? filteredTrips.filter((trip) => trip.status === "Em andamento")
        : tab === "completed"
          ? filteredTrips.filter((trip) => trip.status === "Concluida")
          : filteredTrips

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Viagens"
        description="Jornadas, clientes, documentos, roteiros e links compartilhaveis"
        contentClassName="sm:max-w-[min(1320px,96vw)]"
        bodyClassName="pb-6"
        footer={
          <AgencyRebuildActionButton
            actionType="modal"
            label="Fechar"
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onAction={() => onOpenChange(false)}
          />
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] p-4 xl:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Jornadas</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px]" variant="outline">
                  {totalTrips} viagens
                </Badge>
                <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px]" variant="outline">
                  {upcomingTrips} proximas
                </Badge>
                <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px]" variant="outline">
                  {activeTrips} em andamento
                </Badge>
                <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px]" variant="outline">
                  {completedTrips} concluidas
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Jornadas, clientes, documentos, roteiros e links compartilhaveis
              </p>
            </div>

            <div className="flex flex-wrap items-start justify-end gap-2">
              <AgencyRebuildActionButton
                actionType="modal"
                label="Nova viagem"
                className="rounded-full"
                onAction={() => openTripModal()}
              />
              <AgencyRebuildActionButton
                actionType="modal"
                label="Criar roteiro"
                className="rounded-full bg-sky-500/20 text-sky-100 hover:bg-sky-500/25"
                onAction={() => {
                  const target = trips[0]
                  if (target) createItinerary(target.id)
                  setTab("itineraries")
                }}
              />
              <AgencyRebuildActionButton
                actionType="modal"
                label="Compartilhar link"
                className="rounded-full bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/25"
                onAction={() => {
                  const target = trips[0]
                  if (target) void copyShareLink(target.id)
                  setTab("links")
                }}
              />
              <AgencyRebuildActionButton
                actionType="modal"
                label="Gerar documento"
                className="rounded-full bg-amber-500/20 text-amber-100 hover:bg-amber-500/25"
                onAction={() => {
                  const target = trips[0]
                  if (target) createDocument(target.id)
                  setTab("documents")
                }}
              />
              <AgencyRebuildActionButton
                actionType="future"
                label="Exportar"
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                futureMessage="Exportacao premium de viagens entra na proxima etapa da V3."
              />
            </div>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as TripsTab)} className="gap-4">
            <TabsList className="flex w-full flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/18 p-1">
              <TabsTrigger value="overview">Visao geral</TabsTrigger>
              <TabsTrigger value="trips">Viagens</TabsTrigger>
              <TabsTrigger value="upcoming">Proximas</TabsTrigger>
              <TabsTrigger value="active">Em andamento</TabsTrigger>
              <TabsTrigger value="completed">Concluidas</TabsTrigger>
              <TabsTrigger value="itineraries">Roteiros</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="links">Links compartilhaveis</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <BaseCardV3 title={`${totalTrips}`} description="Viagens totais" className="rounded-[24px] p-3.5" actions={<BriefcaseBusiness className="h-4 w-4 text-primary" />} />
                  <BaseCardV3 title={`${upcomingTrips}`} description="Embarques proximos" className="rounded-[24px] p-3.5" actions={<PlaneTakeoff className="h-4 w-4 text-primary" />} />
                  <BaseCardV3 title={`${pendingDocs}`} description="Documentos pendentes" className="rounded-[24px] p-3.5" actions={<FileText className="h-4 w-4 text-primary" />} />
                  <BaseCardV3 title={`${generatedItineraries}`} description="Roteiros gerados" className="rounded-[24px] p-3.5" actions={<Map className="h-4 w-4 text-primary" />} />
                  <BaseCardV3 title={`${activeLinks}`} description="Links ativos" className="rounded-[24px] p-3.5" actions={<Share2 className="h-4 w-4 text-primary" />} />
                  <BaseCardV3 title={`${new Set(trips.map((trip) => trip.clientId)).size}`} description="Clientes viajando" className="rounded-[24px] p-3.5" actions={<Users className="h-4 w-4 text-primary" />} />
                </div>

                <BaseCardV3
                  eyebrow="Linha do tempo operacional"
                  title="Eventos recentes"
                  description="Reservas, documentos, roteiros, pagamentos e embarques em uma fila curta."
                  className="rounded-[28px]"
                >
                  <div className="space-y-2">
                    {timelineEvents.map((event) => (
                      <div key={event.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <p className="text-[12px] text-muted-foreground">{event.trip} • {event.client}</p>
                      </div>
                    ))}
                  </div>
                </BaseCardV3>
              </div>
            </TabsContent>

            <TabsContent value="trips">
              <div className="space-y-4">
                <div className="grid gap-3 xl:grid-cols-8">
                  <Select value={filters.period} onValueChange={(value) => setFilters((current) => ({ ...current, period: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Periodo" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="7d">7 dias</SelectItem>
                      <SelectItem value="30d">30 dias</SelectItem>
                      <SelectItem value="90d">90 dias</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.destination} onValueChange={(value) => setFilters((current) => ({ ...current, destination: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Destino" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os destinos</SelectItem>
                      {trips.map((trip) => <SelectItem key={trip.id} value={trip.destination}>{trip.destination}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.clientId} onValueChange={(value) => setFilters((current) => ({ ...current, clientId: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cliente" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os status</SelectItem>
                      {travelStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.owner} onValueChange={(value) => setFilters((current) => ({ ...current, owner: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Responsavel" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os responsaveis</SelectItem>
                      {Array.from(new Set(trips.map((trip) => trip.owner))).map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.type} onValueChange={(value) => setFilters((current) => ({ ...current, type: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {travelTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.docsPending} onValueChange={(value) => setFilters((current) => ({ ...current, docsPending: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Docs pendentes" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Qualquer estado</SelectItem>
                      <SelectItem value="yes">Com pendencias</SelectItem>
                      <SelectItem value="no">Sem pendencias</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.itineraryReady} onValueChange={(value) => setFilters((current) => ({ ...current, itineraryReady: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Roteiro gerado" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Qualquer estado</SelectItem>
                      <SelectItem value="yes">Com roteiro</SelectItem>
                      <SelectItem value="no">Sem roteiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {visibleTrips.map((trip) => {
                    const tripDocs = documents.filter((doc) => doc.tripId === trip.id).length
                    const tripItinerary = itineraries.find((item) => item.tripId === trip.id)
                    const tripLink = shareLinks.find((link) => link.tripId === trip.id)

                    return (
                      <BaseCardV3
                        key={trip.id}
                        title={`${clientLookup[trip.clientId]?.name ?? "Cliente"} • ${trip.destination}`}
                        description={`${trip.departureDate} a ${trip.returnDate} • ${trip.type} • ${trip.owner}`}
                        className="rounded-[24px] p-3"
                        actions={
                          <Badge className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${statusTone(trip.status)}`} variant="outline">
                            {trip.status}
                          </Badge>
                        }
                        footer={
                          <>
                            <AgencyRebuildActionButton actionType="modal" label="Detalhes" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => setDetailsTripId(trip.id)} />
                            <AgencyRebuildActionButton actionType="modal" label="Editar" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => openTripModal(trip)} />
                            <AgencyRebuildActionButton actionType="modal" label="Compartilhar" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => void copyShareLink(trip.id)} />
                            <AgencyRebuildActionButton actionType="modal" label="Roteiro" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => createItinerary(trip.id)} />
                            <AgencyRebuildActionButton actionType="modal" label="Documento" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => createDocument(trip.id)} />
                            <AgencyRebuildActionButton actionType="modal" label="Excluir" variant="outline" className="h-7 rounded-full border-white/10 bg-black/20 px-2.5 text-[11px]" onAction={() => removeTrip(trip.id)} />
                          </>
                        }
                      >
                        <div className="grid gap-2 rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground md:grid-cols-8">
                          <span>{clientLookup[trip.clientId]?.name ?? "--"}</span>
                          <span>{trip.destination}</span>
                          <span>{trip.departureDate}</span>
                          <span>{trip.status}</span>
                          <span className="font-medium text-foreground">{formatCurrency(trip.estimatedValue)}</span>
                          <span>{tripDocs} docs</span>
                          <span>{tripItinerary ? tripItinerary.status : "Sem roteiro"}</span>
                          <span>{tripLink?.status ?? "Sem link"}</span>
                        </div>
                      </BaseCardV3>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="space-y-3">
                {trips.filter((trip) => trip.status === "Confirmada").map((trip) => (
                  <BaseCardV3 key={trip.id} title={trip.destination} description={`${clientLookup[trip.clientId]?.name ?? "Cliente"} • Embarque em ${trip.departureDate}`} className="rounded-[24px] p-3" footer={<AgencyRebuildActionButton actionType="modal" label="Abrir detalhes" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => setDetailsTripId(trip.id)} />}>
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Cliente, documentos e financeiro aguardando acompanhamento curto.</div>
                  </BaseCardV3>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="space-y-3">
                {trips.filter((trip) => trip.status === "Em andamento").map((trip) => (
                  <BaseCardV3 key={trip.id} title={trip.destination} description={`${clientLookup[trip.clientId]?.name ?? "Cliente"} • Jornada em andamento`} className="rounded-[24px] p-3" footer={<AgencyRebuildActionButton actionType="modal" label="Alterar status" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => setTrips((current) => current.map((item) => item.id === trip.id ? { ...item, status: "Concluida" } : item))} />}>
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Timeline viva, checklist e suporte prontos para acompanhamento.</div>
                  </BaseCardV3>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-3">
                {trips.filter((trip) => trip.status === "Concluida").map((trip) => (
                  <BaseCardV3 key={trip.id} title={trip.destination} description={`${clientLookup[trip.clientId]?.name ?? "Cliente"} • Viagem concluida`} className="rounded-[24px] p-3" footer={<AgencyRebuildActionButton actionType="future" label="Pos-venda" className="h-7 rounded-full px-2.5 text-[11px]" futureMessage="Pos-venda assistido entra na proxima etapa da V3." />}>
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Use este recorte para rever aprendizados e preparar retornos futuros.</div>
                  </BaseCardV3>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="itineraries">
              <div className="space-y-3">
                {itineraries.map((item) => (
                  <BaseCardV3
                    key={item.id}
                    title={item.title}
                    description={`${trips.find((trip) => trip.id === item.tripId)?.destination ?? "Viagem"} • ${clientLookup[trips.find((trip) => trip.id === item.tripId)?.clientId ?? ""]?.name ?? "Cliente"}`}
                    className="rounded-[24px] p-3"
                    actions={<Badge className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge>}
                    footer={
                      <>
                        <AgencyRebuildActionButton actionType="modal" label="Visualizar" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => setDetailsTripId(item.tripId)} />
                        <AgencyRebuildActionButton actionType="modal" label="Duplicar" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => setItineraries((current) => [{ ...item, id: `it-${Date.now()}`, title: `${item.title} copia`, status: "Rascunho" }, ...current])} />
                        <AgencyRebuildActionButton actionType="future" label="Enviar" variant="outline" className="h-7 rounded-full border-white/10 bg-black/20 px-2.5 text-[11px]" futureMessage="Envio real de roteiro sera conectado depois." />
                      </>
                    }
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <BaseCardV3
                    key={doc.id}
                    title={doc.type}
                    description={`${trips.find((trip) => trip.id === doc.tripId)?.destination ?? "Viagem"} • ${clientLookup[trips.find((trip) => trip.id === doc.tripId)?.clientId ?? ""]?.name ?? "Cliente"}`}
                    className="rounded-[24px] p-3"
                    actions={<Badge className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${statusTone(doc.status)}`} variant="outline">{doc.status}</Badge>}
                    footer={
                      <>
                        <AgencyRebuildActionButton actionType="modal" label="Visualizar" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => toast({ title: "Visual local", description: "A visualizacao detalhada entra na proxima camada da V3." })} />
                        <AgencyRebuildActionButton actionType="modal" label="Marcar enviado" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => setDocuments((current) => current.map((item) => item.id === doc.id ? { ...item, status: "Enviado" } : item))} />
                      </>
                    }
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="links">
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <BaseCardV3
                    key={link.id}
                    title={trips.find((trip) => trip.id === link.tripId)?.destination ?? "Viagem"}
                    description={`${clientLookup[trips.find((trip) => trip.id === link.tripId)?.clientId ?? ""]?.name ?? "Cliente"} • ${link.createdAt}`}
                    className="rounded-[24px] p-3"
                    actions={<Badge className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${statusTone(link.status)}`} variant="outline">{link.status}</Badge>}
                    footer={
                      <>
                        <AgencyRebuildActionButton actionType="modal" label="Copiar link" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => void copyShareLink(link.tripId)} />
                        <AgencyRebuildActionButton actionType="future" label="Abrir preview" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" futureMessage="Preview publico real sera conectado depois." />
                        <AgencyRebuildActionButton actionType="modal" label="Desativar" variant="outline" className="h-7 rounded-full border-white/10 bg-black/20 px-2.5 text-[11px]" onAction={() => setShareLinks((current) => current.map((item) => item.id === link.id ? { ...item, status: item.status === "Ativo" ? "Desativado" : "Ativo" } : item))} />
                      </>
                    }
                  >
                    <div className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground">
                      Ultimo acesso: {link.lastAccess}
                    </div>
                  </BaseCardV3>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="checklist">
              <div className="space-y-4">
                <Select value={checklistTrip?.id ?? ""} onValueChange={setChecklistTripId}>
                  <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Selecione a viagem" /></SelectTrigger>
                  <SelectContent className="rounded-[20px]">
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>{trip.destination}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {checklistTrip ? (
                  <div className="space-y-3">
                    {checklistTrip.checklist.map((item) => (
                      <BaseCardV3
                        key={item.id}
                        title={item.label}
                        description={item.note || "Sem observacao local."}
                        className="rounded-[24px] p-3"
                        actions={<Badge className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${item.done ? "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100" : "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"}`} variant="outline">{item.done ? "Concluido" : "Pendente"}</Badge>}
                        footer={
                          <>
                            <AgencyRebuildActionButton actionType="modal" label={item.done ? "Desmarcar" : "Marcar"} className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => setTrips((current) => current.map((trip) => trip.id !== checklistTrip.id ? trip : { ...trip, checklist: trip.checklist.map((check) => check.id === item.id ? { ...check, done: !check.done } : check) }))} />
                            <AgencyRebuildActionButton actionType="modal" label="Observacao" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => openChecklistNote(checklistTrip.id, item.id, item.note)} />
                          </>
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={tripModalOpen}
        onOpenChange={setTripModalOpen}
        title={editingTripId ? "Editar viagem" : "Nova viagem"}
        description="Campos locais da V3 para montar jornada, cliente, periodo, status e contexto."
        contentClassName="sm:max-w-5xl"
        bodyClassName="pb-6"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setTripModalOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label={editingTripId ? "Salvar alteracoes" : "Salvar viagem"} className="rounded-full" onAction={saveTrip} />
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Cliente</label>
              <Select value={tripForm.clientId} onValueChange={(value) => setTripForm((current) => ({ ...current, clientId: value }))}>
                <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]">
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent className="rounded-[20px]">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} • {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <AgencyRebuildActionButton
                actionType="modal"
                label="Criar cliente rapido"
                variant="outline"
                className="h-11 rounded-[18px] border-white/10 bg-white/[0.03] px-4"
                onAction={() => setClientQuickOpen(true)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Destino</label>
              <Input value={tripForm.destination} onChange={(event) => setTripForm((current) => ({ ...current, destination: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino principal" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Origem</label>
              <Input value={tripForm.origin} onChange={(event) => setTripForm((current) => ({ ...current, origin: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Cidade de origem" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Data de ida</label>
              <Input type="date" value={tripForm.departureDate} onChange={(event) => setTripForm((current) => ({ ...current, departureDate: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Data de volta</label>
              <Input type="date" value={tripForm.returnDate} onChange={(event) => setTripForm((current) => ({ ...current, returnDate: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Viajantes</label>
              <Input value={tripForm.travelers} onChange={(event) => setTripForm((current) => ({ ...current, travelers: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Tipo da viagem</label>
              <Select value={tripForm.type} onValueChange={(value) => setTripForm((current) => ({ ...current, type: value as TripKind }))}>
                <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent className="rounded-[20px]">
                  {travelTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Status</label>
              <Select value={tripForm.status} onValueChange={(value) => setTripForm((current) => ({ ...current, status: value as TripStatus }))}>
                <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="rounded-[20px]">
                  {travelStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Valor estimado em R$</label>
              <Input value={tripForm.estimatedValue} onChange={(event) => setTripForm((current) => ({ ...current, estimatedValue: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="0,00" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Responsavel interno</label>
              <Input value={tripForm.owner} onChange={(event) => setTripForm((current) => ({ ...current, owner: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Responsavel pela jornada" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Tags</label>
              <Input value={tripForm.tags} onChange={(event) => setTripForm((current) => ({ ...current, tags: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="vip, europa, julho" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Observacoes</label>
            <Textarea value={tripForm.notes} onChange={(event) => setTripForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[120px] rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Contexto da viagem, briefing do cliente e observacoes internas." />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={clientQuickOpen}
        onOpenChange={setClientQuickOpen}
        title="Criar cliente rapido"
        description="Atalho local da V3 para abrir uma nova viagem sem sair do fluxo."
        contentClassName="sm:max-w-2xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setClientQuickOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Salvar cliente" className="rounded-full" onAction={quickCreateClient} />
          </>
        }
      >
        <div className="grid gap-4">
          <Input value={newClient.name} onChange={(event) => setNewClient((current) => ({ ...current, name: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome do cliente" />
          <Input value={newClient.email} onChange={(event) => setNewClient((current) => ({ ...current, email: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Email" />
          <Input value={newClient.phone} onChange={(event) => setNewClient((current) => ({ ...current, phone: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="WhatsApp" />
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedTrip)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailsTripId(null)
        }}
        title={selectedTrip ? selectedTrip.destination : "Detalhes da viagem"}
        description="Resumo, timeline, documentos, roteiro, checklist, financeiro e link compartilhavel."
        contentClassName="sm:max-w-5xl"
        footer={
          selectedTrip ? (
            <>
              <AgencyRebuildActionButton actionType="modal" label="Editar viagem" className="rounded-full" onAction={() => openTripModal(selectedTrip)} />
              <AgencyRebuildActionButton actionType="modal" label="Alterar status" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setTrips((current) => current.map((trip) => trip.id === selectedTrip.id ? { ...trip, status: trip.status === "Em andamento" ? "Concluida" : "Em andamento" } : trip))} />
              <AgencyRebuildActionButton actionType="modal" label="Gerar roteiro" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => createItinerary(selectedTrip.id)} />
              <AgencyRebuildActionButton actionType="modal" label="Criar documento" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => createDocument(selectedTrip.id)} />
              <AgencyRebuildActionButton actionType="modal" label="Copiar link" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => void copyShareLink(selectedTrip.id)} />
              <AgencyRebuildActionButton actionType="future" label="Enviar para WhatsApp" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="Envio por WhatsApp real sera conectado depois." />
              <AgencyRebuildActionButton actionType="modal" label="Excluir" variant="outline" className="rounded-full border-white/10 bg-black/20" onAction={() => removeTrip(selectedTrip.id)} />
            </>
          ) : null
        }
      >
        {selectedTrip ? (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <BaseCardV3
                eyebrow="Resumo da viagem"
                title={`${clientLookup[selectedTrip.clientId]?.name ?? "Cliente"} • ${selectedTrip.destination}`}
                description={`${selectedTrip.departureDate} a ${selectedTrip.returnDate} • ${selectedTrip.type}`}
                className="rounded-[26px]"
                actions={<Badge className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${statusTone(selectedTrip.status)}`} variant="outline">{selectedTrip.status}</Badge>}
              >
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Valor estimado: {formatCurrency(selectedTrip.estimatedValue)}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Responsavel: {selectedTrip.owner}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Cliente: {clientLookup[selectedTrip.clientId]?.email}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Link publico: {shareLinks.find((link) => link.tripId === selectedTrip.id)?.status ?? "Sem link"}</div>
                </div>
              </BaseCardV3>

              <BaseCardV3
                eyebrow="Timeline"
                title="Linha do tempo"
                description="Eventos chave da jornada, documentos, roteiro e financeiro."
                className="rounded-[26px]"
              >
                <div className="space-y-2">
                  {selectedTrip.timeline.map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>
            </div>

            <div className="space-y-4">
              <BaseCardV3
                eyebrow="Documentos e roteiro"
                title="Vinculos da jornada"
                description="Materiais ativos, roteiro e checklist em um painel compacto."
                className="rounded-[26px]"
              >
                <div className="space-y-2">
                  {documents.filter((doc) => doc.tripId === selectedTrip.id).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{doc.type}</span>
                      <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(doc.status)}`} variant="outline">{doc.status}</Badge>
                    </div>
                  ))}
                  {itineraries.filter((item) => item.tripId === selectedTrip.id).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{item.title}</span>
                      <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </BaseCardV3>

              <BaseCardV3
                eyebrow="Financeiro vinculado"
                title="Contexto financeiro"
                description="Leitura local do impacto da viagem no caixa e nas cobrancas."
                className="rounded-[26px]"
              >
                <div className="space-y-2">
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Entrada vinculada: {formatCurrency(selectedTrip.estimatedValue * 0.3)}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Saldo estimado: {formatCurrency(selectedTrip.estimatedValue * 0.7)}</div>
                </div>
              </BaseCardV3>
            </div>
          </div>
        ) : null}
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(checklistNoteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setChecklistNoteTarget(null)
        }}
        title="Observacao do checklist"
        description="Anote o contexto operacional local desta etapa da viagem."
        contentClassName="sm:max-w-2xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setChecklistNoteTarget(null)} />
            <AgencyRebuildActionButton actionType="modal" label="Salvar observacao" className="rounded-full" onAction={saveChecklistNote} />
          </>
        }
      >
        <Textarea value={checklistNote} onChange={(event) => setChecklistNote(event.target.value)} className="min-h-[150px] rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Detalhe o que ainda falta ou como a etapa foi resolvida." />
      </BaseModalV3>
    </>
  )
}
