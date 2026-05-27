"use client"

import { useMemo, useState } from "react"
import {
  Crown,
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

type ClientsTab =
  | "overview"
  | "clients"
  | "active"
  | "returns"
  | "vip"
  | "history"
  | "trips"
  | "quotes"

type ClientStatus = "Novo" | "Ativo" | "VIP" | "Inativo" | "Retorno pendente"
type ClientSource = "Indicacao" | "Instagram" | "WhatsApp" | "Site" | "Trafego pago" | "Recorrente" | "Outro"
type ReturnPriority = "Alta" | "Media" | "Baixa"

type ClientHistoryItem = {
  id: string
  date: string
  title: string
  note: string
}

type ClientReturn = {
  id: string
  date: string
  priority: ReturnPriority
  reason: string
  owner: string
  resolved: boolean
}

type ClientRecord = {
  id: string
  name: string
  email: string
  phone: string
  documentId: string
  birthDate: string
  city: string
  state: string
  source: ClientSource
  status: ClientStatus
  owner: string
  notes: string
  tags: string[]
  lastInteraction: string
  trips: number
  quotes: number
  activeTrip: boolean
  openQuote: boolean
  vip: boolean
  preferences: string[]
  nextSteps: string[]
  history: ClientHistoryItem[]
  returns: ClientReturn[]
}

type ClientFormState = {
  name: string
  email: string
  phone: string
  documentId: string
  birthDate: string
  city: string
  state: string
  source: ClientSource
  status: ClientStatus
  owner: string
  notes: string
  tags: string
}

const sources: ClientSource[] = ["Indicacao", "Instagram", "WhatsApp", "Site", "Trafego pago", "Recorrente", "Outro"]
const statuses: ClientStatus[] = ["Novo", "Ativo", "VIP", "Inativo", "Retorno pendente"]

const clientSeed: ClientRecord[] = [
  {
    id: "client-1",
    name: "Marina Alves",
    email: "marina@cliente.com",
    phone: "+55 54 99999-0001",
    documentId: "AB1234567",
    birthDate: "1990-08-18",
    city: "Porto Alegre",
    state: "RS",
    source: "Indicacao",
    status: "VIP",
    owner: "Marina Alves",
    notes: "Cliente premium com preferencia por experiencias exclusivas e concierge.",
    tags: ["vip", "europa"],
    lastInteraction: "Hoje, 10:20",
    trips: 4,
    quotes: 2,
    activeTrip: true,
    openQuote: true,
    vip: true,
    preferences: ["Hoteis boutique", "Experiencias privadas", "Voos premium"],
    nextSteps: ["Enviar roteiro final", "Confirmar transfer in", "Agendar pos-venda"],
    history: [
      { id: "h-1", date: "2026-05-26", title: "Retorno realizado", note: "Cliente aprovou ajuste fino do roteiro." },
      { id: "h-2", date: "2026-05-20", title: "Documento gerado", note: "Contrato enviado para revisao." },
      { id: "h-3", date: "2026-05-14", title: "Viagem confirmada", note: "Italia Signature entrou em producao." },
    ],
    returns: [{ id: "r-1", date: "2026-05-27", priority: "Alta", reason: "Confirmar preferencias do hotel", owner: "Marina Alves", resolved: false }],
  },
  {
    id: "client-2",
    name: "Giulia e Dante",
    email: "giulia@cliente.com",
    phone: "+55 11 98888-1200",
    documentId: "123.456.789-10",
    birthDate: "1992-02-10",
    city: "Sao Paulo",
    state: "SP",
    source: "Instagram",
    status: "Ativo",
    owner: "Time Comercial",
    notes: "Casal em lua de mel com foco em ilhas e experiencias romanticas.",
    tags: ["lua de mel", "ilhas"],
    lastInteraction: "Ontem, 18:12",
    trips: 1,
    quotes: 1,
    activeTrip: false,
    openQuote: true,
    vip: false,
    preferences: ["Praias exclusivas", "Jantares reservados"],
    nextSteps: ["Aprovar proposta Grecia", "Definir seguro viagem"],
    history: [
      { id: "h-4", date: "2026-05-22", title: "Cotacao enviada", note: "Proposta premium enviada por WhatsApp." },
      { id: "h-5", date: "2026-05-17", title: "Cliente criado", note: "Origem Instagram com resposta em 15 min." },
    ],
    returns: [{ id: "r-2", date: "2026-05-28", priority: "Media", reason: "Cobrar aprovacao da cotacao", owner: "Time Comercial", resolved: false }],
  },
  {
    id: "client-3",
    name: "Grupo Aurora Tech",
    email: "ops@auroratech.com",
    phone: "+55 51 97777-4500",
    documentId: "12.345.678/0001-22",
    birthDate: "2017-03-01",
    city: "Curitiba",
    state: "PR",
    source: "Recorrente",
    status: "Ativo",
    owner: "Operacao Premium",
    notes: "Conta corporativa com janela constante para eventos e feiras.",
    tags: ["corporativo"],
    lastInteraction: "2 dias",
    trips: 6,
    quotes: 0,
    activeTrip: true,
    openQuote: false,
    vip: false,
    preferences: ["Voos diretos", "Operacao enxuta", "Faturamento consolidado"],
    nextSteps: ["Reabrir agenda de Q3", "Enviar consolidado de viagens"],
    history: [
      { id: "h-6", date: "2026-05-19", title: "Observacao adicionada", note: "Cliente quer reduzir conexoes nos proximos trechos." },
      { id: "h-7", date: "2026-05-08", title: "Viagem confirmada", note: "Buenos Aires Week aprovada." },
    ],
    returns: [],
  },
]

function emptyClientForm(): ClientFormState {
  return {
    name: "",
    email: "",
    phone: "",
    documentId: "",
    birthDate: "1990-01-01",
    city: "",
    state: "",
    source: "Indicacao",
    status: "Novo",
    owner: "Marina Alves",
    notes: "",
    tags: "",
  }
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `+${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 11) return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9, 13)}`
}

function statusTone(status: ClientStatus) {
  if (status === "VIP") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (status === "Ativo") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Retorno pendente") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Novo") return "border-white/12 bg-white/[0.04] text-zinc-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

function priorityTone(priority: ReturnPriority) {
  if (priority === "Alta") return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
  if (priority === "Media") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildClientsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<ClientsTab>("overview")
  const [clients, setClients] = useState<ClientRecord[]>(clientSeed)
  const [profileClientId, setProfileClientId] = useState<string | null>(null)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [clientForm, setClientForm] = useState<ClientFormState>(emptyClientForm())
  const [filters, setFilters] = useState({
    status: "all",
    source: "all",
    owner: "all",
    interaction: "all",
    activeTrip: "all",
    openQuote: "all",
    vip: "all",
  })

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === profileClientId) ?? null,
    [clients, profileClientId],
  )

  const owners = useMemo(() => Array.from(new Set(clients.map((client) => client.owner))), [clients])

  const filteredClients = useMemo(
    () =>
      clients.filter((client) => {
        if (filters.status !== "all" && client.status !== filters.status) return false
        if (filters.source !== "all" && client.source !== filters.source) return false
        if (filters.owner !== "all" && client.owner !== filters.owner) return false
        if (filters.activeTrip === "yes" && !client.activeTrip) return false
        if (filters.activeTrip === "no" && client.activeTrip) return false
        if (filters.openQuote === "yes" && !client.openQuote) return false
        if (filters.openQuote === "no" && client.openQuote) return false
        if (filters.vip === "yes" && !client.vip) return false
        if (filters.vip === "no" && client.vip) return false
        return true
      }),
    [clients, filters],
  )

  const totalClients = clients.length
  const activeClients = clients.filter((client) => client.status === "Ativo" || client.status === "VIP").length
  const pendingReturns = clients.flatMap((client) => client.returns.filter((item) => !item.resolved)).length
  const vipClients = clients.filter((client) => client.vip).length
  const activeTrips = clients.filter((client) => client.activeTrip).length
  const openQuotes = clients.filter((client) => client.openQuote).length

  const relationshipFocus = useMemo(
    () => [
      `${pendingReturns} retornos pedem resposta ainda hoje.`,
      `${clients.filter((client) => client.history[0]?.title.includes("Cotacao")).length} oportunidades estao em janela comercial.`,
      `${activeTrips} clientes seguem em jornada ativa agora.`,
      `${openQuotes} cotacoes continuam abertas neste recorte.`,
    ],
    [activeTrips, clients, openQuotes, pendingReturns],
  )

  const timeline = useMemo(
    () =>
      clients
        .flatMap((client) =>
          client.history.map((item) => ({
            ...item,
            client: client.name,
          })),
        )
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 10),
    [clients],
  )

  const openNewClient = () => {
    setEditingClientId(null)
    setClientForm(emptyClientForm())
    setClientModalOpen(true)
  }

  const openEditClient = (client: ClientRecord) => {
    setEditingClientId(client.id)
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      documentId: client.documentId,
      birthDate: client.birthDate,
      city: client.city,
      state: client.state,
      source: client.source,
      status: client.status,
      owner: client.owner,
      notes: client.notes,
      tags: client.tags.join(", "),
    })
    setClientModalOpen(true)
  }

  const saveClient = () => {
    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      toast({
        title: "Preencha nome e email",
        description: "Esses campos ajudam a manter o relacionamento vivo na V3.",
      })
      return
    }

    const payload: ClientRecord = {
      id: editingClientId ?? `client-${Date.now()}`,
      name: clientForm.name.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone.trim(),
      documentId: clientForm.documentId.trim(),
      birthDate: clientForm.birthDate,
      city: clientForm.city.trim(),
      state: clientForm.state.trim(),
      source: clientForm.source,
      status: clientForm.status,
      owner: clientForm.owner.trim(),
      notes: clientForm.notes.trim(),
      tags: clientForm.tags.split(",").map((item) => item.trim()).filter(Boolean),
      lastInteraction: "Agora",
      trips: editingClientId ? clients.find((client) => client.id === editingClientId)?.trips ?? 0 : 0,
      quotes: editingClientId ? clients.find((client) => client.id === editingClientId)?.quotes ?? 0 : 0,
      activeTrip: editingClientId ? clients.find((client) => client.id === editingClientId)?.activeTrip ?? false : false,
      openQuote: editingClientId ? clients.find((client) => client.id === editingClientId)?.openQuote ?? false : false,
      vip: clientForm.status === "VIP",
      preferences: editingClientId ? clients.find((client) => client.id === editingClientId)?.preferences ?? [] : [],
      nextSteps: editingClientId ? clients.find((client) => client.id === editingClientId)?.nextSteps ?? ["Registrar primeiro retorno"] : ["Registrar primeiro retorno"],
      history: editingClientId
        ? clients.find((client) => client.id === editingClientId)?.history ?? []
        : [{ id: `history-${Date.now()}`, date: "2026-05-26", title: "Cliente criado", note: "Cadastro iniciado no workspace da V3." }],
      returns: editingClientId ? clients.find((client) => client.id === editingClientId)?.returns ?? [] : [],
    }

    setClients((current) =>
      editingClientId ? current.map((client) => (client.id === editingClientId ? payload : client)) : [payload, ...current],
    )

    setClientModalOpen(false)
    setEditingClientId(null)
    toast({
      title: editingClientId ? "Cliente atualizado" : "Cliente criado",
      description: "O relacionamento foi ajustado localmente no preview da V3.",
    })
  }

  const deleteClient = (clientId: string) => {
    setClients((current) => current.filter((client) => client.id !== clientId))
    if (profileClientId === clientId) setProfileClientId(null)
    toast({
      title: "Cliente removido",
      description: "A lista local foi atualizada sem tocar no backend real.",
    })
  }

  const createTripForClient = (clientName: string) => {
    toast({
      title: "Nova viagem preparada",
      description: `O fluxo de viagens para ${clientName} sera conectado na proxima etapa da V3.`,
    })
  }

  const createQuoteForClient = (clientName: string) => {
    toast({
      title: "Cotacao preparada",
      description: `A central de cotacoes para ${clientName} esta em preparacao dentro da V3.`,
    })
  }

  const createDocumentForClient = (clientName: string) => {
    toast({
      title: "Documento sinalizado",
      description: `A central documental para ${clientName} sera conectada logo em seguida.`,
    })
  }

  const resolveReturn = (clientId: string, returnId: string) => {
    setClients((current) =>
      current.map((client) =>
        client.id === clientId
          ? {
              ...client,
              returns: client.returns.map((item) => (item.id === returnId ? { ...item, resolved: true } : item)),
              lastInteraction: "Agora",
            }
          : client,
      ),
    )
    toast({
      title: "Retorno resolvido",
      description: "O follow-up foi marcado como concluido localmente.",
    })
  }

  const rescheduleReturn = (clientId: string, returnId: string) => {
    setClients((current) =>
      current.map((client) =>
        client.id === clientId
          ? {
              ...client,
              returns: client.returns.map((item) => (item.id === returnId ? { ...item, date: "2026-05-30" } : item)),
            }
          : client,
      ),
    )
    toast({
      title: "Retorno reagendado",
      description: "A proxima abordagem foi movida localmente para 30/05.",
    })
  }

  const startService = (clientName: string) => {
    toast({
      title: "Atendimento iniciado",
      description: `${clientName} entrou na fila viva do relacionamento da V3.`,
    })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Clientes"
        description="Relacionamento, historico, viagens, cotacoes e proximos contatos."
        contentClassName="sm:max-w-[1380px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total de clientes", value: totalClients.toString() },
                  { label: "Clientes ativos", value: activeClients.toString() },
                  { label: "Retornos pendentes", value: pendingReturns.toString() },
                  { label: "Clientes VIP", value: vipClients.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 xl:max-w-[460px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Novo cliente" className="rounded-full" onAction={openNewClient} />
                <AgencyRebuildActionButton actionType="future" label="Importar lista" className="rounded-full" futureMessage="Importacao inteligente em preparacao para a V3." />
                <AgencyRebuildActionButton actionType="future" label="Criar viagem" className="rounded-full" futureMessage="O atalho global de viagens sera ligado depois ao workspace real." />
                <AgencyRebuildActionButton actionType="future" label="Gerar cotacao" className="rounded-full" futureMessage="A conexao com cotacoes da V3 sera ativada na proxima etapa." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as ClientsTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="clients">Clientes</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="returns">Retornos</TabsTrigger>
                <TabsTrigger value="vip">VIP</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
                <TabsTrigger value="trips">Viagens</TabsTrigger>
                <TabsTrigger value="quotes">Cotacoes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Clientes totais", value: totalClients.toString(), note: "Base completa em leitura viva." },
                    { label: "Ativos", value: activeClients.toString(), note: "Relacionamentos em movimento." },
                    { label: "Retornos hoje", value: pendingReturns.toString(), note: "Pontos que pedem resposta." },
                    { label: "Proximos contatos", value: "5", note: "Aniversarios e janelas abertas." },
                    { label: "Viagem em andamento", value: activeTrips.toString(), note: "Clientes com jornada ativa." },
                    { label: "Cotacao aberta", value: openQuotes.toString(), note: "Oportunidades para converter." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} title={item.value} description={item.note} eyebrow={item.label} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <BaseCardV3
                    eyebrow="Relacionamento em foco"
                    title="Sinais que merecem proximidade"
                    description="Follow-ups, oportunidades e historico recente em uma mesa so."
                    className="rounded-[28px]"
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      {relationshipFocus.map((item) => (
                        <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>

                  <BaseCardV3
                    eyebrow="Historico recente"
                    title="Ultimos movimentos"
                    description="Interacoes recentes para orientar a proxima resposta."
                    className="rounded-[28px]"
                  >
                    <div className="space-y-2">
                      {timeline.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.client} • {item.date}</div>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>
                </div>
              </TabsContent>

              <TabsContent value="clients" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.source} onValueChange={(value) => setFilters((current) => ({ ...current, source: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Origem" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      {sources.map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.owner} onValueChange={(value) => setFilters((current) => ({ ...current, owner: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Responsavel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os responsaveis</SelectItem>
                      {owners.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.vip} onValueChange={(value) => setFilters((current) => ({ ...current, vip: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="VIP" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="yes">So VIP</SelectItem>
                      <SelectItem value="no">Sem VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.9fr_1fr]">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-zinc-100">{client.name}</div>
                            <div className="text-xs text-muted-foreground">{client.email}</div>
                            <div className="text-xs text-muted-foreground">{client.phone}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Status</div>
                            <Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${statusTone(client.status)}`} variant="outline">{client.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Ultima interacao</div>
                            <div className="mt-1 text-zinc-100">{client.lastInteraction}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Viagens</div>
                            <div className="mt-1 text-zinc-100">{client.trips}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Cotacoes</div>
                            <div className="mt-1 text-zinc-100">{client.quotes}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Responsavel</div>
                            <div className="mt-1 text-zinc-100">{client.owner}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <AgencyRebuildActionButton actionType="modal" label="Perfil" className="h-8 rounded-full px-3 text-xs" onAction={() => setProfileClientId(client.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Editar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => openEditClient(client)} />
                          <AgencyRebuildActionButton actionType="api" label="Atender" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => startService(client.name)} />
                          <AgencyRebuildActionButton actionType="api" label="Viagem" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => createTripForClient(client.name)} />
                          <AgencyRebuildActionButton actionType="api" label="Cotacao" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => createQuoteForClient(client.name)} />
                          <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="h-8 rounded-full border-rose-400/20 bg-rose-400/[0.06] px-3 text-xs text-rose-100" onAction={() => deleteClient(client.id)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="active" className="space-y-3">
                {clients.filter((client) => client.status === "Ativo" || client.status === "VIP").map((client) => (
                  <BaseCardV3 key={client.id} eyebrow={client.status} title={client.name} description={`${client.trips} viagens • ${client.quotes} cotacoes`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="returns" className="space-y-3">
                {clients.flatMap((client) =>
                  client.returns.filter((item) => !item.resolved).map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-zinc-100">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{item.reason} • {item.date} • {item.owner}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${priorityTone(item.priority)}`} variant="outline">{item.priority}</Badge>
                          <AgencyRebuildActionButton actionType="api" label="Resolver" className="h-8 rounded-full px-3 text-xs" onAction={() => resolveReturn(client.id, item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Reagendar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => rescheduleReturn(client.id, item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Atender" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => startService(client.name)} />
                        </div>
                      </div>
                    </div>
                  )),
                )}
              </TabsContent>

              <TabsContent value="vip" className="space-y-3">
                {clients.filter((client) => client.vip).map((client) => (
                  <BaseCardV3
                    key={client.id}
                    eyebrow="VIP"
                    title={client.name}
                    description={client.notes}
                    className="rounded-[24px]"
                    actions={<Crown className="h-4 w-4 text-amber-200" />}
                  />
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {timeline.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.client} • {item.date}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{item.note}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="trips" className="space-y-3">
                {clients.filter((client) => client.trips > 0).map((client) => (
                  <div key={client.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.trips} viagens vinculadas • {client.activeTrip ? "jornada ativa" : "sem viagem ativa"}</div>
                      </div>
                      <AgencyRebuildActionButton actionType="api" label="Criar viagem" className="h-8 rounded-full px-3 text-xs" onAction={() => createTripForClient(client.name)} />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="quotes" className="space-y-3">
                {clients.filter((client) => client.openQuote || client.quotes > 0).map((client) => (
                  <div key={client.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.quotes} cotacoes • {client.openQuote ? "aberta" : "encerrada"}</div>
                      </div>
                      <AgencyRebuildActionButton actionType="api" label="Gerar cotacao" className="h-8 rounded-full px-3 text-xs" onAction={() => createQuoteForClient(client.name)} />
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        title={editingClientId ? "Editar cliente" : "Novo cliente"}
        description="Capture dados, origem, contexto e proximo passo sem sair do dashboard."
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setClientModalOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label={editingClientId ? "Salvar cliente" : "Criar cliente"} className="rounded-full" onAction={saveClient} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={clientForm.name} onChange={(event) => setClientForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do cliente" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={clientForm.email} onChange={(event) => setClientForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={clientForm.phone} onChange={(event) => setClientForm((current) => ({ ...current, phone: maskPhone(event.target.value) }))} placeholder="Telefone / WhatsApp" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={clientForm.documentId} onChange={(event) => setClientForm((current) => ({ ...current, documentId: event.target.value }))} placeholder="CPF / passaporte (opcional)" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={clientForm.birthDate} onChange={(event) => setClientForm((current) => ({ ...current, birthDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input value={clientForm.city} onChange={(event) => setClientForm((current) => ({ ...current, city: event.target.value }))} placeholder="Cidade" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
            <Input value={clientForm.state} onChange={(event) => setClientForm((current) => ({ ...current, state: event.target.value }))} placeholder="Estado" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
          <Select value={clientForm.source} onValueChange={(value) => setClientForm((current) => ({ ...current, source: value as ClientSource }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Origem do cliente" /></SelectTrigger>
            <SelectContent>{sources.map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={clientForm.status} onValueChange={(value) => setClientForm((current) => ({ ...current, status: value as ClientStatus }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={clientForm.owner} onChange={(event) => setClientForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsavel interno" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={clientForm.tags} onChange={(event) => setClientForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags separadas por virgula" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={clientForm.notes} onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes, preferencias e contexto operacional." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedClient)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setProfileClientId(null)
        }}
        title={selectedClient?.name ?? "Perfil do cliente"}
        description="Dados principais, historico, viagens, cotacoes e proximos passos."
        contentClassName="sm:max-w-[1180px]"
      >
        {selectedClient ? (
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <BaseCardV3 eyebrow={selectedClient.status} title="Resumo do cliente" description={selectedClient.notes} className="rounded-[26px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    `Email: ${selectedClient.email}`,
                    `WhatsApp: ${selectedClient.phone}`,
                    `Origem: ${selectedClient.source}`,
                    `Ultima interacao: ${selectedClient.lastInteraction}`,
                    `Cidade: ${selectedClient.city}/${selectedClient.state}`,
                    `Documento: ${selectedClient.documentId || "Nao informado"}`,
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Historico" title="Linha do relacionamento" description="Interacoes que explicam a jornada deste cliente." className="rounded-[26px]">
                <div className="space-y-2">
                  {selectedClient.history.map((item) => (
                    <div key={item.id} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-2">
                      <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.date}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{item.note}</div>
                    </div>
                  ))}
                </div>
              </BaseCardV3>
            </div>

            <div className="space-y-4">
              <BaseCardV3 eyebrow="Viagens e cotacoes" title="Vinculos comerciais" description="Tudo o que se conecta a proxima acao." className="rounded-[26px]">
                <div className="space-y-2">
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Viagens vinculadas: {selectedClient.trips}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Cotacoes abertas: {selectedClient.quotes}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Documentos vinculados: {selectedClient.trips + selectedClient.quotes}</div>
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Preferencias" title="Preferencias e proximos passos" description="Indicacoes para manter a experiencia premium." className="rounded-[26px]">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.preferences.map((item) => (
                      <Badge key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground" variant="outline">{item}</Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {selectedClient.nextSteps.map((step) => (
                      <div key={step} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{step}</div>
                    ))}
                  </div>
                </div>
              </BaseCardV3>

              <div className="flex flex-wrap gap-2">
                <AgencyRebuildActionButton actionType="modal" label="Editar cliente" className="rounded-full" onAction={() => openEditClient(selectedClient)} />
                <AgencyRebuildActionButton actionType="api" label="Criar viagem" className="rounded-full" onAction={() => createTripForClient(selectedClient.name)} />
                <AgencyRebuildActionButton actionType="api" label="Gerar cotacao" className="rounded-full" onAction={() => createQuoteForClient(selectedClient.name)} />
                <AgencyRebuildActionButton actionType="api" label="Gerar documento" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => createDocumentForClient(selectedClient.name)} />
                <AgencyRebuildActionButton actionType="api" label="Registrar retorno" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => toast({ title: "Retorno registrado", description: "O cliente entrou na trilha de follow-up local da V3." })} />
                <AgencyRebuildActionButton actionType="future" label="Enviar WhatsApp" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="O atalho WhatsApp sera conectado depois ao modulo real." />
                <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/[0.06] text-rose-100" onAction={() => deleteClient(selectedClient.id)} />
              </div>
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
