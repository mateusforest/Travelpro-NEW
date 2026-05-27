"use client"

import { useMemo, useState } from "react"
import { GripVertical } from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type ItinerariesTab =
  | "overview"
  | "itineraries"
  | "drafts"
  | "sent"
  | "approved"
  | "templates"
  | "library"
  | "history"

type ItineraryStatus = "Rascunho" | "Em revisao" | "Pronto" | "Enviado" | "Aprovado" | "Arquivado"
type ItineraryType = "Lazer" | "Corporativo" | "Familia" | "Lua de mel" | "Grupo" | "Premium" | "Outro"
type ItineraryStyle = "Economico" | "Intermediario" | "Premium" | "Personalizado"
type ActivityCategory = "Passeio" | "Refeicao" | "Transporte" | "Hotel" | "Livre" | "Outro"

type ItineraryActivity = {
  id: string
  time: string
  title: string
  location: string
  note: string
  estimatedCost: number
  category: ActivityCategory
}

type ItineraryDay = {
  id: string
  title: string
  date: string
  activities: ItineraryActivity[]
}

type ItineraryRecord = {
  id: string
  title: string
  client: string
  trip: string
  destination: string
  startDate: string
  endDate: string
  type: ItineraryType
  style: ItineraryStyle
  templateBase: string
  owner: string
  status: ItineraryStatus
  notes: string
  tags: string[]
  linkedDocuments: string[]
  checklist: { id: string; label: string; done: boolean }[]
  history: string[]
  days: ItineraryDay[]
  createdAt: string
  updatedAt: string
}

type ItineraryFormState = {
  title: string
  client: string
  trip: string
  destination: string
  startDate: string
  endDate: string
  type: ItineraryType
  style: ItineraryStyle
  templateBase: string
  owner: string
  status: ItineraryStatus
  notes: string
  tags: string
}

const itineraryTypes: ItineraryType[] = ["Lazer", "Corporativo", "Familia", "Lua de mel", "Grupo", "Premium", "Outro"]
const itineraryStyles: ItineraryStyle[] = ["Economico", "Intermediario", "Premium", "Personalizado"]
const itineraryStatuses: ItineraryStatus[] = ["Rascunho", "Em revisao", "Pronto", "Enviado", "Aprovado", "Arquivado"]

const itineraryTemplates = [
  { id: "tpl-premium", name: "Premium Europa 8D", destination: "Europa", active: true, usage: 12 },
  { id: "tpl-honeymoon", name: "Lua de mel Ilhas", destination: "Grecia", active: true, usage: 8 },
  { id: "tpl-corp", name: "Executivo corporativo", destination: "America do Sul", active: false, usage: 4 },
]

function createDay(id: string, title: string, date: string, activities: ItineraryActivity[]): ItineraryDay {
  return { id, title, date, activities }
}

function createActivity(
  id: string,
  time: string,
  title: string,
  location: string,
  note: string,
  estimatedCost: number,
  category: ActivityCategory,
): ItineraryActivity {
  return { id, time, title, location, note, estimatedCost, category }
}

const itinerarySeed: ItineraryRecord[] = [
  {
    id: "itinerary-1",
    title: "Italia Signature 8D",
    client: "Marina Alves",
    trip: "Italia Signature",
    destination: "Italia",
    startDate: "2026-06-14",
    endDate: "2026-06-22",
    type: "Premium",
    style: "Personalizado",
    templateBase: "Premium Europa 8D",
    owner: "Marina Alves",
    status: "Enviado",
    notes: "Roteiro autoral com foco em gastronomia, arte e concierge.",
    tags: ["vip", "europa"],
    linkedDocuments: ["Contrato Italia Signature", "Voucher concierge"],
    checklist: [
      { id: "c1", label: "Cliente aprovou estrutura", done: true },
      { id: "c2", label: "Confirmar transfers", done: false },
      { id: "c3", label: "Publicar versao final", done: false },
    ],
    history: ["Roteiro criado", "Template premium aplicado", "Versao enviada ao cliente"],
    createdAt: "2026-05-18",
    updatedAt: "2026-05-26",
    days: [
      createDay("day-1", "Dia 1 • Chegada em Roma", "2026-06-14", [
        createActivity("act-1", "09:00", "Check-in no hotel", "Roma Centro", "Concierge ja sinalizado.", 0, "Hotel"),
        createActivity("act-2", "13:30", "Almoco de boas-vindas", "Trastevere", "Mesa com vista reservada.", 320, "Refeicao"),
      ]),
      createDay("day-2", "Dia 2 • Roma historica", "2026-06-15", [
        createActivity("act-3", "10:00", "Tour Coliseu privado", "Coliseu", "Ingresso skip-the-line.", 860, "Passeio"),
      ]),
    ],
  },
  {
    id: "itinerary-2",
    title: "Grecia Honeymoon",
    client: "Giulia e Dante",
    trip: "Lua de mel Grecia",
    destination: "Grecia",
    startDate: "2026-07-08",
    endDate: "2026-07-18",
    type: "Lua de mel",
    style: "Premium",
    templateBase: "Lua de mel Ilhas",
    owner: "Time Comercial",
    status: "Rascunho",
    notes: "Versao em refinamento com foco em Santorini e Mykonos.",
    tags: ["lua de mel", "ilhas"],
    linkedDocuments: ["Voucher Grecia Honeymoon"],
    checklist: [
      { id: "c4", label: "Definir hotel principal", done: false },
      { id: "c5", label: "Validar passeio de barco", done: true },
    ],
    history: ["Rascunho criado", "Aguardando revisao comercial"],
    createdAt: "2026-05-21",
    updatedAt: "2026-05-25",
    days: [
      createDay("day-3", "Dia 1 • Atenas", "2026-07-08", [
        createActivity("act-4", "14:00", "Transfer aeroporto", "Atenas", "Veiculo executivo.", 280, "Transporte"),
      ]),
    ],
  },
  {
    id: "itinerary-3",
    title: "Buenos Aires Week",
    client: "Grupo Aurora Tech",
    trip: "Buenos Aires Week",
    destination: "Buenos Aires",
    startDate: "2026-07-04",
    endDate: "2026-07-09",
    type: "Corporativo",
    style: "Intermediario",
    templateBase: "Executivo corporativo",
    owner: "Operacao Premium",
    status: "Aprovado",
    notes: "Roteiro enxuto com foco em reunioes e jantares chave.",
    tags: ["corporativo"],
    linkedDocuments: ["Passagens Buenos Aires Week"],
    checklist: [
      { id: "c6", label: "Validar agenda final", done: true },
      { id: "c7", label: "Entregar versao da equipe", done: true },
    ],
    history: ["Roteiro criado", "Aprovado pela empresa"],
    createdAt: "2026-05-08",
    updatedAt: "2026-05-18",
    days: [
      createDay("day-4", "Dia 1 • Reunioes centrais", "2026-07-04", [
        createActivity("act-5", "08:30", "Deslocamento hotel > evento", "Puerto Madero", "Equipe completa.", 120, "Transporte"),
      ]),
    ],
  },
]

function emptyItineraryForm(): ItineraryFormState {
  return {
    title: "",
    client: "Marina Alves",
    trip: "Italia Signature",
    destination: "",
    startDate: "2026-06-20",
    endDate: "2026-06-28",
    type: "Lazer",
    style: "Personalizado",
    templateBase: "Premium Europa 8D",
    owner: "Marina Alves",
    status: "Rascunho",
    notes: "",
    tags: "",
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function statusTone(status: ItineraryStatus) {
  if (status === "Aprovado") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Enviado" || status === "Pronto") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Rascunho" || status === "Em revisao") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildItinerariesWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<ItinerariesTab>("overview")
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>(itinerarySeed)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ItineraryFormState>(emptyItineraryForm())
  const [filters, setFilters] = useState({
    status: "all",
    client: "all",
    trip: "all",
    destination: "all",
    owner: "all",
    type: "all",
    style: "all",
    template: "all",
  })

  const selectedItinerary = useMemo(
    () => itineraries.find((item) => item.id === detailId) ?? null,
    [detailId, itineraries],
  )

  const totals = useMemo(
    () => ({
      total: itineraries.length,
      drafts: itineraries.filter((item) => item.status === "Rascunho" || item.status === "Em revisao").length,
      sent: itineraries.filter((item) => item.status === "Enviado").length,
      approved: itineraries.filter((item) => item.status === "Aprovado").length,
      linked: itineraries.filter((item) => item.trip).length,
    }),
    [itineraries],
  )

  const filteredItineraries = useMemo(
    () =>
      itineraries.filter((item) => {
        if (filters.status !== "all" && item.status !== filters.status) return false
        if (filters.client !== "all" && item.client !== filters.client) return false
        if (filters.trip !== "all" && item.trip !== filters.trip) return false
        if (filters.destination !== "all" && item.destination !== filters.destination) return false
        if (filters.owner !== "all" && item.owner !== filters.owner) return false
        if (filters.type !== "all" && item.type !== filters.type) return false
        if (filters.style !== "all" && item.style !== filters.style) return false
        if (filters.template === "yes" && !item.templateBase) return false
        if (filters.template === "no" && item.templateBase) return false
        return true
      }),
    [filters, itineraries],
  )

  const historyItems = useMemo(
    () =>
      itineraries.flatMap((item) =>
        item.history.map((entry, index) => ({
          id: `${item.id}-${index}`,
          itinerary: item.title,
          date: item.updatedAt,
          entry,
        })),
      ),
    [itineraries],
  )

  const openNewItinerary = () => {
    setEditingId(null)
    setForm(emptyItineraryForm())
    setItineraryModalOpen(true)
  }

  const openEditItinerary = (item: ItineraryRecord) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      client: item.client,
      trip: item.trip,
      destination: item.destination,
      startDate: item.startDate,
      endDate: item.endDate,
      type: item.type,
      style: item.style,
      templateBase: item.templateBase,
      owner: item.owner,
      status: item.status,
      notes: item.notes,
      tags: item.tags.join(", "),
    })
    setItineraryModalOpen(true)
  }

  const saveItinerary = () => {
    if (!form.title.trim() || !form.destination.trim()) {
      toast({
        title: "Preencha titulo e destino",
        description: "Esses dois campos ajudam a estruturar o roteiro sem ruído.",
      })
      return
    }

    const current = editingId ? itineraries.find((item) => item.id === editingId) : null
    const payload: ItineraryRecord = {
      id: editingId ?? `itinerary-${Date.now()}`,
      title: form.title.trim(),
      client: form.client,
      trip: form.trip,
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      type: form.type,
      style: form.style,
      templateBase: form.templateBase,
      owner: form.owner.trim(),
      status: form.status,
      notes: form.notes.trim(),
      tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
      linkedDocuments: current?.linkedDocuments ?? [],
      checklist: current?.checklist ?? [{ id: `check-${Date.now()}`, label: "Revisar primeira versao", done: false }],
      history: current?.history ?? ["Roteiro criado na V3"],
      days:
        current?.days ??
        [
          createDay(`day-${Date.now()}`, "Dia 1 • Estrutura inicial", form.startDate, [
            createActivity(`act-${Date.now()}`, "09:00", "Atividade inicial", form.destination, "Estrutura base criada no preview.", 0, "Outro"),
          ]),
        ],
      createdAt: current?.createdAt ?? "2026-05-26",
      updatedAt: "2026-05-26",
    }

    setItineraries((items) => (editingId ? items.map((item) => (item.id === editingId ? payload : item)) : [payload, ...items]))
    setItineraryModalOpen(false)
    toast({
      title: editingId ? "Roteiro atualizado" : "Roteiro criado",
      description: "A biblioteca viva de roteiros foi atualizada localmente.",
    })
  }

  const duplicateItinerary = (itineraryId: string) => {
    const current = itineraries.find((item) => item.id === itineraryId)
    if (!current) return
    const duplicated: ItineraryRecord = {
      ...current,
      id: `itinerary-${Date.now()}`,
      title: `${current.title} • Copia`,
      status: "Rascunho",
      createdAt: "2026-05-26",
      updatedAt: "2026-05-26",
      history: [...current.history, "Roteiro duplicado localmente"],
    }
    setItineraries((items) => [duplicated, ...items])
    toast({
      title: "Roteiro duplicado",
      description: "A nova copia ja apareceu na biblioteca da V3.",
    })
  }

  const deleteItinerary = (itineraryId: string) => {
    setItineraries((items) => items.filter((item) => item.id !== itineraryId))
    if (detailId === itineraryId) setDetailId(null)
    toast({
      title: "Roteiro removido",
      description: "A exclusao afetou apenas o estado local do preview.",
    })
  }

  const updateItineraryStatus = (itineraryId: string, status: ItineraryStatus) => {
    setItineraries((items) =>
      items.map((item) =>
        item.id === itineraryId
          ? { ...item, status, updatedAt: "2026-05-26", history: [...item.history, `Status alterado para ${status}`] }
          : item,
      ),
    )
    toast({
      title: "Status atualizado",
      description: `Roteiro marcado como ${status.toLowerCase()}.`,
    })
  }

  const addDay = () => {
    if (!selectedItinerary) return
    const newDay = createDay(`day-${Date.now()}`, `Dia ${selectedItinerary.days.length + 1}`, selectedItinerary.endDate, [])
    setItineraries((items) =>
      items.map((item) => (item.id === selectedItinerary.id ? { ...item, days: [...item.days, newDay], updatedAt: "2026-05-26" } : item)),
    )
    toast({
      title: "Dia adicionado",
      description: "A estrutura do roteiro ganhou um novo dia localmente.",
    })
  }

  const duplicateDay = (dayId: string) => {
    if (!selectedItinerary) return
    setItineraries((items) =>
      items.map((item) => {
        if (item.id !== selectedItinerary.id) return item
        const currentDay = item.days.find((day) => day.id === dayId)
        if (!currentDay) return item
        return {
          ...item,
          days: [
            ...item.days,
            {
              ...currentDay,
              id: `day-${Date.now()}`,
              title: `${currentDay.title} • Copia`,
              activities: currentDay.activities.map((activity) => ({ ...activity, id: `act-${Date.now()}-${activity.id}` })),
            },
          ],
        }
      }),
    )
    toast({
      title: "Dia duplicado",
      description: "Uma nova variação foi adicionada ao roteiro.",
    })
  }

  const moveDay = (dayId: string, direction: "up" | "down") => {
    if (!selectedItinerary) return
    setItineraries((items) =>
      items.map((item) => {
        if (item.id !== selectedItinerary.id) return item
        const index = item.days.findIndex((day) => day.id === dayId)
        if (index < 0) return item
        const nextIndex = direction === "up" ? index - 1 : index + 1
        if (nextIndex < 0 || nextIndex >= item.days.length) return item
        const nextDays = [...item.days]
        ;[nextDays[index], nextDays[nextIndex]] = [nextDays[nextIndex], nextDays[index]]
        return { ...item, days: nextDays, updatedAt: "2026-05-26" }
      }),
    )
  }

  const addActivity = (dayId: string) => {
    if (!selectedItinerary) return
    const newActivity = createActivity(`act-${Date.now()}`, "12:00", "Nova atividade", selectedItinerary.destination, "Ajuste local dentro da V3.", 0, "Outro")
    setItineraries((items) =>
      items.map((item) =>
        item.id === selectedItinerary.id
          ? {
              ...item,
              days: item.days.map((day) => (day.id === dayId ? { ...day, activities: [...day.activities, newActivity] } : day)),
              updatedAt: "2026-05-26",
            }
          : item,
      ),
    )
    toast({
      title: "Atividade adicionada",
      description: "O dia recebeu uma nova atividade localmente.",
    })
  }

  const removeActivity = (dayId: string, activityId: string) => {
    if (!selectedItinerary) return
    setItineraries((items) =>
      items.map((item) =>
        item.id === selectedItinerary.id
          ? {
              ...item,
              days: item.days.map((day) =>
                day.id === dayId ? { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) } : day,
              ),
              updatedAt: "2026-05-26",
            }
          : item,
      ),
    )
  }

  const toggleChecklist = (checkId: string) => {
    if (!selectedItinerary) return
    setItineraries((items) =>
      items.map((item) =>
        item.id === selectedItinerary.id
          ? {
              ...item,
              checklist: item.checklist.map((check) => (check.id === checkId ? { ...check, done: !check.done } : check)),
              updatedAt: "2026-05-26",
            }
          : item,
      ),
    )
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Roteiros"
        description="Criacao, organizacao, revisao e entrega de roteiros personalizados."
        contentClassName="sm:max-w-[1380px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Roteiros gerados", value: totals.total.toString() },
                  { label: "Rascunhos", value: totals.drafts.toString() },
                  { label: "Enviados", value: totals.sent.toString() },
                  { label: "Aprovados", value: totals.approved.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[500px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Novo roteiro" className="rounded-full" onAction={openNewItinerary} />
                <AgencyRebuildActionButton
                  actionType="modal"
                  label="Usar template"
                  className="rounded-full"
                  onAction={() => {
                    setForm((current) => ({ ...current, templateBase: itineraryTemplates[0]?.name ?? current.templateBase }))
                    setItineraryModalOpen(true)
                  }}
                />
                <AgencyRebuildActionButton
                  actionType="api"
                  label="Duplicar roteiro"
                  className="rounded-full"
                  onAction={() => duplicateItinerary(itineraries[0]?.id ?? "")}
                />
                <AgencyRebuildActionButton actionType="future" label="Exportar PDF" className="rounded-full" futureMessage="A exportacao premium em PDF sera ativada depois na V3." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as ItinerariesTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="itineraries">Roteiros</TabsTrigger>
                <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
                <TabsTrigger value="sent">Enviados</TabsTrigger>
                <TabsTrigger value="approved">Aprovados</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="library">Biblioteca</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Roteiros gerados", value: totals.total.toString(), note: "Biblioteca viva da operacao." },
                    { label: "Rascunhos ativos", value: totals.drafts.toString(), note: "Itens aguardando refinamento." },
                    { label: "Enviados ao cliente", value: totals.sent.toString(), note: "Versoes ja em contato." },
                    { label: "Aprovados", value: totals.approved.toString(), note: "Prontos para seguir a jornada." },
                    { label: "Vinculados a viagens", value: totals.linked.toString(), note: "Conectados a uma jornada real." },
                    { label: "Template mais usado", value: itineraryTemplates[0]?.name ?? "-", note: "Base preferida da equipe." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <BaseCardV3 eyebrow="Entrega em foco" title="Itens que pedem lapidacao" description="Revisao, envio, vinculo e novos materiais na mesma mesa." className="rounded-[28px]">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      `${totals.drafts} roteiros aguardam revisao fina.`,
                      `${totals.sent} roteiros ja podem receber feedback.`,
                      `${itineraries.filter((item) => !item.trip).length} roteiros ainda nao foram vinculados a uma viagem.`,
                      `${itineraries.slice(0, 2).map((item) => item.title).join(" e ")} estao recentes na biblioteca.`,
                    ].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </BaseCardV3>
              </TabsContent>

              <TabsContent value="itineraries" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {itineraryStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.client} onValueChange={(value) => setFilters((current) => ({ ...current, client: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cliente" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {Array.from(new Set(itineraries.map((item) => item.client))).map((client) => <SelectItem key={client} value={client}>{client}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.destination} onValueChange={(value) => setFilters((current) => ({ ...current, destination: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Destino" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os destinos</SelectItem>
                      {Array.from(new Set(itineraries.map((item) => item.destination))).map((destination) => <SelectItem key={destination} value={destination}>{destination}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.style} onValueChange={(value) => setFilters((current) => ({ ...current, style: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Estilo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estilos</SelectItem>
                      {itineraryStyles.map((style) => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredItineraries.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_0.9fr_0.8fr_0.8fr_1fr]">
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.client} • {item.trip || "Sem viagem vinculada"}</div>
                          </div>
                          <div className="text-sm text-muted-foreground"><div>Destino</div><div className="mt-1 text-zinc-100">{item.destination}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Periodo</div><div className="mt-1 text-zinc-100">{item.startDate} • {item.endDate}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Status</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                          <div className="text-sm text-muted-foreground"><div>Atualizado</div><div className="mt-1 text-zinc-100">{item.updatedAt}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Responsavel</div><div className="mt-1 text-zinc-100">{item.owner}</div></div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <AgencyRebuildActionButton actionType="modal" label="Abrir" className="h-8 rounded-full px-3 text-xs" onAction={() => setDetailId(item.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Editar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => openEditItinerary(item)} />
                          <AgencyRebuildActionButton actionType="api" label="Duplicar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => duplicateItinerary(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Enviado" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => updateItineraryStatus(item.id, "Enviado")} />
                          <AgencyRebuildActionButton actionType="api" label="Aprovado" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => updateItineraryStatus(item.id, "Aprovado")} />
                          <AgencyRebuildActionButton actionType="future" label="PDF" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A exportacao PDF premium sera conectada depois." />
                          <AgencyRebuildActionButton actionType="future" label="Compartilhar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="O compartilhamento publico do roteiro sera ligado depois." />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="drafts" className="space-y-3">
                {itineraries.filter((item) => item.status === "Rascunho" || item.status === "Em revisao").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow={item.status} title={item.title} description={`${item.client} • ${item.destination}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="sent" className="space-y-3">
                {itineraries.filter((item) => item.status === "Enviado").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Enviado" title={item.title} description={`${item.client} • ${item.updatedAt}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="approved" className="space-y-3">
                {itineraries.filter((item) => item.status === "Aprovado").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Aprovado" title={item.title} description={`${item.client} • ${item.destination}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="templates" className="space-y-3">
                {itineraryTemplates.map((template) => (
                  <div key={template.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.destination} • {template.usage} usos • {template.active ? "Ativo" : "Inativo"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="modal" label="Usar template" className="h-8 rounded-full px-3 text-xs" onAction={() => {
                          setForm((current) => ({ ...current, templateBase: template.name }))
                          setItineraryModalOpen(true)
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Duplicar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => toast({ title: "Template duplicado", description: "A copia local do template foi preparada na V3." })} />
                        <AgencyRebuildActionButton actionType="future" label="Visualizar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A visualizacao imersiva de template sera ligada depois." />
                        <AgencyRebuildActionButton actionType="future" label="Personalizar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A personalizacao local avancada chega na proxima etapa da V3." />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="library" className="space-y-3">
                {itineraries.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.destination} • {item.type} • {item.style}</div>
                      </div>
                      <AgencyRebuildActionButton actionType="api" label="Duplicar" className="h-8 rounded-full px-3 text-xs" onAction={() => duplicateItinerary(item.id)} />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {historyItems.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm font-medium text-zinc-100">{item.entry}</div>
                    <div className="text-xs text-muted-foreground">{item.itinerary} • {item.date}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={itineraryModalOpen}
        onOpenChange={setItineraryModalOpen}
        title={editingId ? "Editar roteiro" : "Novo roteiro"}
        description="Monte a estrutura, estilo, viagem e contexto do roteiro sem sair do dashboard."
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setItineraryModalOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label={editingId ? "Salvar roteiro" : "Criar roteiro"} className="rounded-full" onAction={saveItinerary} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titulo do roteiro" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.client} onValueChange={(value) => setForm((current) => ({ ...current, client: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cliente" /></SelectTrigger>
            <SelectContent>{Array.from(new Set(itinerarySeed.map((item) => item.client))).map((client) => <SelectItem key={client} value={client}>{client}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.trip} onValueChange={(value) => setForm((current) => ({ ...current, trip: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Viagem vinculada" /></SelectTrigger>
            <SelectContent>{Array.from(new Set(itinerarySeed.map((item) => item.trip))).map((trip) => <SelectItem key={trip} value={trip}>{trip}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))} placeholder="Destino" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value as ItineraryType }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo de roteiro" /></SelectTrigger>
            <SelectContent>{itineraryTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.style} onValueChange={(value) => setForm((current) => ({ ...current, style: value as ItineraryStyle }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Estilo" /></SelectTrigger>
            <SelectContent>{itineraryStyles.map((style) => <SelectItem key={style} value={style}>{style}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.templateBase} onValueChange={(value) => setForm((current) => ({ ...current, templateBase: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Template base" /></SelectTrigger>
            <SelectContent>{itineraryTemplates.map((template) => <SelectItem key={template.id} value={template.name}>{template.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsavel" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as ItineraryStatus }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{itineraryStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags separadas por virgula" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes, contexto do cliente e ajustes finos." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedItinerary)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailId(null)
        }}
        title={selectedItinerary?.title ?? "Detalhes do roteiro"}
        description="Resumo, dias, atividades, documentos e checklist do roteiro."
        contentClassName="sm:max-w-[1260px]"
      >
        {selectedItinerary ? (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <BaseCardV3 eyebrow={selectedItinerary.status} title="Resumo do roteiro" description={selectedItinerary.notes} className="rounded-[26px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    `Cliente: ${selectedItinerary.client}`,
                    `Viagem: ${selectedItinerary.trip || "Sem vinculo"}`,
                    `Destino: ${selectedItinerary.destination}`,
                    `Periodo: ${selectedItinerary.startDate} • ${selectedItinerary.endDate}`,
                    `Estilo: ${selectedItinerary.style}`,
                    `Responsavel: ${selectedItinerary.owner}`,
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Checklist e vinculacoes" title="Documentos e entregas" description="Contexto rapido do que sustenta a versao atual." className="rounded-[26px]">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedItinerary.linkedDocuments.map((doc) => (
                      <Badge key={doc} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground" variant="outline">{doc}</Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {selectedItinerary.checklist.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleChecklist(item.id)}
                        className="flex w-full items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-white/15"
                      >
                        <span>{item.label}</span>
                        <span className={item.done ? "text-emerald-200" : "text-amber-100"}>{item.done ? "Concluido" : "Pendente"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </BaseCardV3>
            </div>

            <BaseCardV3 eyebrow="Editor visual" title="Dias do roteiro" description="Adicione atividades, reorganize dias e lapide a entrega dentro do modal." className="rounded-[28px]">
              <div className="space-y-4">
                {selectedItinerary.days.map((day, index) => (
                  <div key={day.id} className="rounded-[22px] border border-white/8 bg-black/14 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground/70" />
                        <div>
                          <div className="text-sm font-semibold text-zinc-100">{day.title}</div>
                          <div className="text-xs text-muted-foreground">{day.date}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="api" label="Atividade" className="h-8 rounded-full px-3 text-xs" onAction={() => addActivity(day.id)} />
                        <AgencyRebuildActionButton actionType="api" label="Duplicar dia" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => duplicateDay(day.id)} />
                        <AgencyRebuildActionButton actionType="api" label="Subir" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => moveDay(day.id, "up")} disabledReason={index === 0 ? "Primeiro dia do roteiro." : undefined} />
                        <AgencyRebuildActionButton actionType="api" label="Descer" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => moveDay(day.id, "down")} disabledReason={index === selectedItinerary.days.length - 1 ? "Ultimo dia do roteiro." : undefined} />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {day.activities.map((activity) => (
                        <div key={activity.id} className="grid gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 md:grid-cols-[0.7fr_1fr_1fr_0.8fr_auto]">
                          <div className="text-sm text-muted-foreground">{activity.time}</div>
                          <div>
                            <div className="text-sm font-medium text-zinc-100">{activity.title}</div>
                            <div className="text-xs text-muted-foreground">{activity.category}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">{activity.location}</div>
                          <div className="text-sm text-muted-foreground">{formatCurrency(activity.estimatedCost)}</div>
                          <AgencyRebuildActionButton actionType="api" label="Remover" variant="outline" className="h-8 rounded-full border-rose-400/20 bg-rose-400/[0.06] px-3 text-xs text-rose-100" onAction={() => removeActivity(day.id, activity.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BaseCardV3>

            <div className="flex flex-wrap gap-2">
              <AgencyRebuildActionButton actionType="modal" label="Editar" className="rounded-full" onAction={() => openEditItinerary(selectedItinerary)} />
              <AgencyRebuildActionButton actionType="api" label="Adicionar dia" className="rounded-full" onAction={addDay} />
              <AgencyRebuildActionButton actionType="api" label="Marcar pronto" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => updateItineraryStatus(selectedItinerary.id, "Pronto")} />
              <AgencyRebuildActionButton actionType="future" label="Enviar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="O envio integrado do roteiro sera ativado em seguida." />
              <AgencyRebuildActionButton actionType="future" label="Gerar PDF" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A exportacao premium em PDF sera conectada depois." />
              <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/[0.06] text-rose-100" onAction={() => deleteItinerary(selectedItinerary.id)} />
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
