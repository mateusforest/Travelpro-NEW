"use client"

import { useMemo, useState } from "react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type LeadsTab =
  | "overview"
  | "pipeline"
  | "new"
  | "hot"
  | "returns"
  | "converted"
  | "lost"
  | "origins"
  | "history"

type LeadStage = "Novo" | "Em contato" | "Qualificado" | "Cotacao enviada" | "Negociacao" | "Convertido" | "Perdido"
type LeadPriority = "Baixa" | "Media" | "Alta" | "Quente"
type LeadOrigin = "WhatsApp" | "Instagram" | "Site" | "Indicacao" | "Trafego pago" | "Evento" | "Outro"
type LeadInterest = "Pacote" | "Passagem" | "Hotel" | "Roteiro" | "Viagem completa" | "Corporativo" | "Grupo" | "Outro"

type LeadHistoryItem = {
  id: string
  date: string
  title: string
  note: string
}

type LeadRecord = {
  id: string
  name: string
  phone: string
  email: string
  origin: LeadOrigin
  interest: LeadInterest
  destination: string
  periodStart: string
  periodEnd: string
  travelers: number
  estimatedBudget: number
  priority: LeadPriority
  stage: LeadStage
  owner: string
  notes: string
  tags: string[]
  lastContact: string
  nextStep: string
  conversionProbability: number
  objections: string
  travelerProfile: string
  linkedQuote?: string
  linkedTrip?: string
  history: LeadHistoryItem[]
}

type LeadFormState = {
  name: string
  phone: string
  email: string
  origin: LeadOrigin
  interest: LeadInterest
  destination: string
  periodStart: string
  periodEnd: string
  travelers: string
  estimatedBudget: string
  priority: LeadPriority
  stage: LeadStage
  owner: string
  notes: string
  tags: string
}

type QualificationState = {
  travelerProfile: string
  destination: string
  period: string
  budget: string
  urgency: string
  objections: string
  nextStep: string
  conversionProbability: string
  notes: string
}

const leadOrigins: LeadOrigin[] = ["WhatsApp", "Instagram", "Site", "Indicacao", "Trafego pago", "Evento", "Outro"]
const leadInterests: LeadInterest[] = ["Pacote", "Passagem", "Hotel", "Roteiro", "Viagem completa", "Corporativo", "Grupo", "Outro"]
const leadPriorities: LeadPriority[] = ["Baixa", "Media", "Alta", "Quente"]
const leadStages: LeadStage[] = ["Novo", "Em contato", "Qualificado", "Cotacao enviada", "Negociacao", "Convertido", "Perdido"]

const leadSeed: LeadRecord[] = [
  {
    id: "lead-1",
    name: "Juliana Costa",
    phone: "+55 11 99999-7755",
    email: "juliana@lead.com",
    origin: "Instagram",
    interest: "Viagem completa",
    destination: "Grecia",
    periodStart: "2026-07-10",
    periodEnd: "2026-07-18",
    travelers: 2,
    estimatedBudget: 18000,
    priority: "Quente",
    stage: "Qualificado",
    owner: "Time Comercial",
    notes: "Busca experiencia premium para aniversario de casamento.",
    tags: ["ilha", "premium"],
    lastContact: "Hoje, 09:10",
    nextStep: "Enviar proposta refinada",
    conversionProbability: 82,
    objections: "Ajustar hotel principal",
    travelerProfile: "Casal premium com foco em ilhas e gastronomia",
    linkedQuote: "Cotacao Grecia Premium",
    history: [
      { id: "lh-1", date: "2026-05-26", title: "Lead qualificado", note: "Budget e janela definidos." },
      { id: "lh-2", date: "2026-05-25", title: "Primeiro contato", note: "Resposta em menos de 20 minutos." },
    ],
  },
  {
    id: "lead-2",
    name: "Roberto Nunes",
    phone: "+55 54 98888-2010",
    email: "roberto@empresa.com",
    origin: "Indicacao",
    interest: "Corporativo",
    destination: "Chile",
    periodStart: "2026-06-18",
    periodEnd: "2026-06-22",
    travelers: 4,
    estimatedBudget: 24000,
    priority: "Alta",
    stage: "Em contato",
    owner: "Marina Alves",
    notes: "Evento corporativo com agenda apertada.",
    tags: ["corporativo"],
    lastContact: "Ontem, 17:30",
    nextStep: "Validar agenda e voos",
    conversionProbability: 58,
    objections: "Precisa aprovar budget internamente",
    travelerProfile: "Empresa com foco em deslocamento rapido",
    history: [
      { id: "lh-3", date: "2026-05-25", title: "Lead criado", note: "Indicacao de cliente recorrente." },
    ],
  },
  {
    id: "lead-3",
    name: "Camila Freire",
    phone: "+55 21 97777-0091",
    email: "camila@lead.com",
    origin: "WhatsApp",
    interest: "Roteiro",
    destination: "Italia",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-12",
    travelers: 1,
    estimatedBudget: 12500,
    priority: "Media",
    stage: "Novo",
    owner: "Operacao Premium",
    notes: "Quer ajuda para montar uma viagem solo segura.",
    tags: ["solo", "italia"],
    lastContact: "Hoje, 11:40",
    nextStep: "Realizar primeiro contato",
    conversionProbability: 38,
    objections: "Ainda avaliando periodo ideal",
    travelerProfile: "Solo traveler focada em cultura e gastronomia",
    history: [
      { id: "lh-4", date: "2026-05-26", title: "Lead recebido", note: "Entrada via WhatsApp." },
    ],
  },
]

function emptyLeadForm(): LeadFormState {
  return {
    name: "",
    phone: "",
    email: "",
    origin: "WhatsApp",
    interest: "Viagem completa",
    destination: "",
    periodStart: "2026-06-20",
    periodEnd: "2026-06-28",
    travelers: "2",
    estimatedBudget: "",
    priority: "Media",
    stage: "Novo",
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function parseCurrencyInput(value: string) {
  const numeric = value.replace(/[^\d,-.]/g, "").replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(numeric)
  return Number.isFinite(parsed) ? parsed : 0
}

function stageTone(stage: LeadStage) {
  if (stage === "Convertido") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (stage === "Qualificado" || stage === "Cotacao enviada" || stage === "Negociacao") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (stage === "Novo" || stage === "Em contato") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
}

function priorityTone(priority: LeadPriority) {
  if (priority === "Quente") return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
  if (priority === "Alta") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (priority === "Media") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildLeadsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<LeadsTab>("overview")
  const [leads, setLeads] = useState<LeadRecord[]>(leadSeed)
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)
  const [qualifyLeadId, setQualifyLeadId] = useState<string | null>(null)
  const [convertLeadId, setConvertLeadId] = useState<string | null>(null)
  const [form, setForm] = useState<LeadFormState>(emptyLeadForm())
  const [qualification, setQualification] = useState<QualificationState>({
    travelerProfile: "",
    destination: "",
    period: "",
    budget: "",
    urgency: "",
    objections: "",
    nextStep: "",
    conversionProbability: "55",
    notes: "",
  })
  const [convertOptions, setConvertOptions] = useState({ createTrip: true, createQuote: true })
  const [filters, setFilters] = useState({
    origin: "all",
    stage: "all",
    priority: "all",
    interest: "all",
    destination: "all",
    owner: "all",
    converted: "all",
  })

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === detailLeadId) ?? null, [detailLeadId, leads])
  const leadToQualify = useMemo(() => leads.find((lead) => lead.id === qualifyLeadId) ?? null, [leads, qualifyLeadId])
  const leadToConvert = useMemo(() => leads.find((lead) => lead.id === convertLeadId) ?? null, [convertLeadId, leads])

  const totals = useMemo(
    () => ({
      total: leads.length,
      hot: leads.filter((lead) => lead.priority === "Quente" || lead.priority === "Alta").length,
      returns: leads.filter((lead) => lead.nextStep.toLowerCase().includes("contato") || lead.nextStep.toLowerCase().includes("retorno")).length,
      converted: leads.filter((lead) => lead.stage === "Convertido").length,
      new: leads.filter((lead) => lead.stage === "Novo").length,
    }),
    [leads],
  )

  const conversionRate = leads.length ? Math.round((totals.converted / leads.length) * 100) : 0

  const pipelineColumns = useMemo(
    () =>
      leadStages.map((stage) => ({
        stage,
        items: leads.filter((lead) => lead.stage === stage),
      })),
    [leads],
  )

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        if (filters.origin !== "all" && lead.origin !== filters.origin) return false
        if (filters.stage !== "all" && lead.stage !== filters.stage) return false
        if (filters.priority !== "all" && lead.priority !== filters.priority) return false
        if (filters.interest !== "all" && lead.interest !== filters.interest) return false
        if (filters.destination !== "all" && lead.destination !== filters.destination) return false
        if (filters.owner !== "all" && lead.owner !== filters.owner) return false
        if (filters.converted === "yes" && lead.stage !== "Convertido") return false
        if (filters.converted === "no" && lead.stage === "Convertido") return false
        return true
      }),
    [filters, leads],
  )

  const openNewLead = () => {
    setEditingLeadId(null)
    setForm(emptyLeadForm())
    setLeadModalOpen(true)
  }

  const openEditLead = (lead: LeadRecord) => {
    setEditingLeadId(lead.id)
    setForm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      origin: lead.origin,
      interest: lead.interest,
      destination: lead.destination,
      periodStart: lead.periodStart,
      periodEnd: lead.periodEnd,
      travelers: String(lead.travelers),
      estimatedBudget: String(lead.estimatedBudget),
      priority: lead.priority,
      stage: lead.stage,
      owner: lead.owner,
      notes: lead.notes,
      tags: lead.tags.join(", "),
    })
    setLeadModalOpen(true)
  }

  const saveLead = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({
        title: "Preencha nome e contato",
        description: "Esses campos ajudam a colocar o lead em movimento sem friccao.",
      })
      return
    }

    const current = editingLeadId ? leads.find((lead) => lead.id === editingLeadId) : null
    const payload: LeadRecord = {
      id: editingLeadId ?? `lead-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      origin: form.origin,
      interest: form.interest,
      destination: form.destination.trim(),
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      travelers: Number.parseInt(form.travelers || "1", 10),
      estimatedBudget: parseCurrencyInput(form.estimatedBudget),
      priority: form.priority,
      stage: form.stage,
      owner: form.owner.trim(),
      notes: form.notes.trim(),
      tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
      lastContact: "Agora",
      nextStep: current?.nextStep ?? "Realizar primeiro contato",
      conversionProbability: current?.conversionProbability ?? 35,
      objections: current?.objections ?? "",
      travelerProfile: current?.travelerProfile ?? "",
      linkedQuote: current?.linkedQuote,
      linkedTrip: current?.linkedTrip,
      history: current?.history ?? [{ id: `history-${Date.now()}`, date: "2026-05-26", title: "Lead criado", note: "Entrada local gerada pela V3." }],
    }

    setLeads((items) => (editingLeadId ? items.map((item) => (item.id === editingLeadId ? payload : item)) : [payload, ...items]))
    setLeadModalOpen(false)
    toast({
      title: editingLeadId ? "Lead atualizado" : "Lead criado",
      description: "O pipeline local da V3 foi atualizado com sucesso.",
    })
  }

  const moveLeadStage = (leadId: string, stage: LeadStage) => {
    setLeads((items) =>
      items.map((item) =>
        item.id === leadId ? { ...item, stage, lastContact: "Agora", history: [...item.history, { id: `history-${Date.now()}`, date: "2026-05-26", title: "Etapa atualizada", note: `Lead movido para ${stage}.` }] } : item,
      ),
    )
    toast({
      title: "Etapa atualizada",
      description: `Lead movido para ${stage.toLowerCase()}.`,
    })
  }

  const deleteLead = (leadId: string) => {
    setLeads((items) => items.filter((item) => item.id !== leadId))
    if (detailLeadId === leadId) setDetailLeadId(null)
    toast({
      title: "Lead removido",
      description: "O item foi removido localmente do pipeline da V3.",
    })
  }

  const openQualifyLead = (lead: LeadRecord) => {
    setQualifyLeadId(lead.id)
    setQualification({
      travelerProfile: lead.travelerProfile,
      destination: lead.destination,
      period: `${lead.periodStart} • ${lead.periodEnd}`,
      budget: formatCurrency(lead.estimatedBudget),
      urgency: lead.priority,
      objections: lead.objections,
      nextStep: lead.nextStep,
      conversionProbability: String(lead.conversionProbability),
      notes: lead.notes,
    })
  }

  const saveQualification = () => {
    if (!leadToQualify) return
    setLeads((items) =>
      items.map((item) =>
        item.id === leadToQualify.id
          ? {
              ...item,
              travelerProfile: qualification.travelerProfile,
              destination: qualification.destination,
              notes: qualification.notes,
              objections: qualification.objections,
              nextStep: qualification.nextStep,
              conversionProbability: Number.parseInt(qualification.conversionProbability || "0", 10),
              stage: "Qualificado",
              history: [...item.history, { id: `history-${Date.now()}`, date: "2026-05-26", title: "Lead qualificado", note: "Contexto comercial atualizado dentro da V3." }],
            }
          : item,
      ),
    )
    setQualifyLeadId(null)
    toast({
      title: "Lead qualificado",
      description: "A leitura comercial foi refinada localmente com sucesso.",
    })
  }

  const convertLead = () => {
    if (!leadToConvert) return
    setLeads((items) =>
      items.map((item) =>
        item.id === leadToConvert.id
          ? {
              ...item,
              stage: "Convertido",
              linkedTrip: convertOptions.createTrip ? "Nova viagem preparada" : item.linkedTrip,
              linkedQuote: convertOptions.createQuote ? "Cotacao em preparacao" : item.linkedQuote,
              history: [...item.history, { id: `history-${Date.now()}`, date: "2026-05-26", title: "Lead convertido", note: "Lead movido para cliente dentro do preview da V3." }],
            }
          : item,
      ),
    )
    setConvertLeadId(null)
    toast({
      title: "Lead convertido",
      description: `Cliente criado localmente${convertOptions.createTrip ? ", com viagem preparada" : ""}${convertOptions.createQuote ? " e cotacao sugerida" : ""}.`,
    })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Leads"
        description="Entradas, qualificacao, pipeline e conversao em clientes e viagens."
        contentClassName="sm:max-w-[1400px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Leads recebidos", value: totals.total.toString() },
                  { label: "Leads quentes", value: totals.hot.toString() },
                  { label: "Aguardando retorno", value: totals.returns.toString() },
                  { label: "Convertidos", value: totals.converted.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[500px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Novo lead" className="rounded-full" onAction={openNewLead} />
                <AgencyRebuildActionButton actionType="modal" label="Qualificar lead" className="rounded-full" onAction={() => openQualifyLead(leads[0])} />
                <AgencyRebuildActionButton actionType="modal" label="Converter em cliente" className="rounded-full" onAction={() => setConvertLeadId(leads[0]?.id ?? null)} />
                <AgencyRebuildActionButton actionType="future" label="Criar viagem" className="rounded-full" futureMessage="A conexao direta com Viagens sera ativada na proxima etapa da V3." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as LeadsTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                <TabsTrigger value="new">Novos</TabsTrigger>
                <TabsTrigger value="hot">Quentes</TabsTrigger>
                <TabsTrigger value="returns">Retornos</TabsTrigger>
                <TabsTrigger value="converted">Convertidos</TabsTrigger>
                <TabsTrigger value="lost">Perdidos</TabsTrigger>
                <TabsTrigger value="origins">Origens</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Leads recebidos", value: totals.total.toString(), note: "Entradas vivas neste recorte." },
                    { label: "Novos", value: totals.new.toString(), note: "Aguardando primeiro contato." },
                    { label: "Quentes", value: totals.hot.toString(), note: "Oportunidades proximas de avancar." },
                    { label: "Retornos pendentes", value: totals.returns.toString(), note: "Pontos que pedem resposta." },
                    { label: "Convertidos", value: totals.converted.toString(), note: "Já viraram relacionamento ativo." },
                    { label: "Taxa de conversao", value: `${conversionRate}%`, note: "Leitura local do pipeline." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <BaseCardV3 eyebrow="Pipeline em foco" title="Oportunidades que merecem velocidade" description="Prioridades do pipeline sem cara de CRM pesado." className="rounded-[28px]">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      `${totals.new} leads aguardam o primeiro contato.`,
                      `${leads.filter((lead) => lead.interest !== "Outro").length} leads ja trazem interesse definido.`,
                      `${totals.returns} leads possuem retorno ou proximo passo ainda hoje.`,
                      `${leads.filter((lead) => lead.conversionProbability >= 70).length} oportunidades estao proximas da conversao.`,
                    ].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </BaseCardV3>
              </TabsContent>

              <TabsContent value="pipeline" className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-4 2xl:grid-cols-7">
                  {pipelineColumns.map((column) => (
                    <div key={column.stage} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-zinc-100">{column.stage}</div>
                        <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${stageTone(column.stage)}`} variant="outline">
                          {column.items.length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {column.items.map((lead) => (
                          <div key={lead.id} className="rounded-[18px] border border-white/8 bg-black/14 p-3">
                            <div className="text-sm font-medium text-zinc-100">{lead.name}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{lead.interest} • {lead.origin}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{lead.priority} • {lead.lastContact}</div>
                            <div className="mt-3 flex flex-col gap-2">
                              <Select value={lead.stage} onValueChange={(value) => moveLeadStage(lead.id, value as LeadStage)}>
                                <SelectTrigger className="h-8 rounded-full border-white/10 bg-white/[0.03] text-[11px]"><SelectValue placeholder="Mover etapa" /></SelectTrigger>
                                <SelectContent>{leadStages.map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}</SelectContent>
                              </Select>
                              <AgencyRebuildActionButton actionType="modal" label="Detalhes" className="h-8 rounded-full px-3 text-xs" onAction={() => setDetailLeadId(lead.id)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-3">
                {leads.filter((lead) => lead.stage === "Novo").map((lead) => (
                  <BaseCardV3 key={lead.id} eyebrow="Novo" title={lead.name} description={`${lead.origin} • ${lead.destination}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="hot" className="space-y-3">
                {leads.filter((lead) => lead.priority === "Quente" || lead.priority === "Alta").map((lead) => (
                  <BaseCardV3 key={lead.id} eyebrow={lead.priority} title={lead.name} description={`${lead.interest} • ${lead.destination}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="returns" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Select value={filters.origin} onValueChange={(value) => setFilters((current) => ({ ...current, origin: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Origem" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      {leadOrigins.map((origin) => <SelectItem key={origin} value={origin}>{origin}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.stage} onValueChange={(value) => setFilters((current) => ({ ...current, stage: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {leadStages.map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.priority} onValueChange={(value) => setFilters((current) => ({ ...current, priority: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {leadPriorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.interest} onValueChange={(value) => setFilters((current) => ({ ...current, interest: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Interesse" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os interesses</SelectItem>
                      {leadInterests.map((interest) => <SelectItem key={interest} value={interest}>{interest}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_0.8fr_0.9fr_1fr]">
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{lead.name}</div>
                            <div className="text-xs text-muted-foreground">{lead.phone} • {lead.email || "Sem email"}</div>
                          </div>
                          <div className="text-sm text-muted-foreground"><div>Origem</div><div className="mt-1 text-zinc-100">{lead.origin}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Interesse</div><div className="mt-1 text-zinc-100">{lead.interest}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Status</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${stageTone(lead.stage)}`} variant="outline">{lead.stage}</Badge></div>
                          <div className="text-sm text-muted-foreground"><div>Prioridade</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${priorityTone(lead.priority)}`} variant="outline">{lead.priority}</Badge></div>
                          <div className="text-sm text-muted-foreground"><div>Responsavel</div><div className="mt-1 text-zinc-100">{lead.owner}</div></div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <AgencyRebuildActionButton actionType="modal" label="Detalhes" className="h-8 rounded-full px-3 text-xs" onAction={() => setDetailLeadId(lead.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Qualificar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => openQualifyLead(lead)} />
                          <AgencyRebuildActionButton actionType="modal" label="Converter" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => setConvertLeadId(lead.id)} />
                          <AgencyRebuildActionButton actionType="future" label="Cotacao" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A central de cotacoes da V3 sera conectada depois." />
                          <AgencyRebuildActionButton actionType="future" label="Viagem" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A criacao direta de viagens chega em seguida na V3." />
                          <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="h-8 rounded-full border-rose-400/20 bg-rose-400/[0.06] px-3 text-xs text-rose-100" onAction={() => deleteLead(lead.id)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="converted" className="space-y-3">
                {leads.filter((lead) => lead.stage === "Convertido").map((lead) => (
                  <BaseCardV3 key={lead.id} eyebrow="Convertido" title={lead.name} description={`${lead.linkedTrip ?? "Sem viagem"} • ${lead.linkedQuote ?? "Sem cotacao"}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="lost" className="space-y-3">
                {leads.filter((lead) => lead.stage === "Perdido").map((lead) => (
                  <BaseCardV3 key={lead.id} eyebrow="Perdido" title={lead.name} description={lead.objections || "Sem motivo registrado"} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="origins" className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {leadOrigins.map((origin) => {
                    const originItems = leads.filter((lead) => lead.origin === origin)
                    const originConverted = originItems.filter((lead) => lead.stage === "Convertido").length
                    const rate = originItems.length ? Math.round((originConverted / originItems.length) * 100) : 0
                    return (
                      <BaseCardV3
                        key={origin}
                        eyebrow="Origem"
                        title={origin}
                        description={`${originItems.length} leads • ${rate}% de conversao local`}
                        className="rounded-[24px]"
                      />
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {leads.flatMap((lead) => lead.history.map((item) => ({ ...item, lead: lead.name }))).map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.lead} • {item.date}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{item.note}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        title={editingLeadId ? "Editar lead" : "Novo lead"}
        description="Capture interesse, destino, prioridade e proximo passo sem sair do pipeline."
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setLeadModalOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label={editingLeadId ? "Salvar lead" : "Criar lead"} className="rounded-full" onAction={saveLead} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: maskPhone(event.target.value) }))} placeholder="Telefone / WhatsApp" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.origin} onValueChange={(value) => setForm((current) => ({ ...current, origin: value as LeadOrigin }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Origem" /></SelectTrigger>
            <SelectContent>{leadOrigins.map((origin) => <SelectItem key={origin} value={origin}>{origin}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.interest} onValueChange={(value) => setForm((current) => ({ ...current, interest: value as LeadInterest }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Interesse" /></SelectTrigger>
            <SelectContent>{leadInterests.map((interest) => <SelectItem key={interest} value={interest}>{interest}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))} placeholder="Destino desejado" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={form.periodStart} onChange={(event) => setForm((current) => ({ ...current, periodStart: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={form.periodEnd} onChange={(event) => setForm((current) => ({ ...current, periodEnd: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.travelers} onChange={(event) => setForm((current) => ({ ...current, travelers: event.target.value }))} placeholder="Numero de viajantes" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.estimatedBudget} onChange={(event) => setForm((current) => ({ ...current, estimatedBudget: event.target.value }))} placeholder="Orcamento estimado em R$" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.priority} onValueChange={(value) => setForm((current) => ({ ...current, priority: value as LeadPriority }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>{leadPriorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.stage} onValueChange={(value) => setForm((current) => ({ ...current, stage: value as LeadStage }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{leadStages.map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsavel" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags separadas por virgula" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes, contexto e sinais do lead." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(leadToQualify)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setQualifyLeadId(null)
        }}
        title="Qualificar lead"
        description="Refine perfil, objecoes, proxima etapa e chance de conversao."
        contentClassName="sm:max-w-3xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setQualifyLeadId(null)} />
            <AgencyRebuildActionButton actionType="modal" label="Salvar qualificacao" className="rounded-full" onAction={saveQualification} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={qualification.travelerProfile} onChange={(event) => setQualification((current) => ({ ...current, travelerProfile: event.target.value }))} placeholder="Perfil do viajante" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={qualification.destination} onChange={(event) => setQualification((current) => ({ ...current, destination: event.target.value }))} placeholder="Destino" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={qualification.period} onChange={(event) => setQualification((current) => ({ ...current, period: event.target.value }))} placeholder="Periodo" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={qualification.budget} onChange={(event) => setQualification((current) => ({ ...current, budget: event.target.value }))} placeholder="Orcamento" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={qualification.urgency} onChange={(event) => setQualification((current) => ({ ...current, urgency: event.target.value }))} placeholder="Urgencia" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={qualification.nextStep} onChange={(event) => setQualification((current) => ({ ...current, nextStep: event.target.value }))} placeholder="Proximo passo" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={qualification.conversionProbability} onChange={(event) => setQualification((current) => ({ ...current, conversionProbability: event.target.value }))} placeholder="Probabilidade de conversao" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={qualification.objections} onChange={(event) => setQualification((current) => ({ ...current, objections: event.target.value }))} placeholder="Objecoes" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={qualification.notes} onChange={(event) => setQualification((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes de qualificacao." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(leadToConvert)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setConvertLeadId(null)
        }}
        title="Converter em cliente"
        description="Revise os dados do lead e confirme a criacao local do cliente."
        contentClassName="sm:max-w-3xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setConvertLeadId(null)} />
            <AgencyRebuildActionButton actionType="modal" label="Confirmar conversao" className="rounded-full" onAction={convertLead} />
          </>
        }
      >
        {leadToConvert ? (
          <div className="space-y-4">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-sm font-semibold text-zinc-100">{leadToConvert.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{leadToConvert.interest} • {leadToConvert.destination} • {formatCurrency(leadToConvert.estimatedBudget)}</div>
            </div>
            <label className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
              <input type="checkbox" checked={convertOptions.createTrip} onChange={(event) => setConvertOptions((current) => ({ ...current, createTrip: event.target.checked }))} />
              Criar viagem junto
            </label>
            <label className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
              <input type="checkbox" checked={convertOptions.createQuote} onChange={(event) => setConvertOptions((current) => ({ ...current, createQuote: event.target.checked }))} />
              Gerar cotacao junto
            </label>
          </div>
        ) : null}
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedLead)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailLeadId(null)
        }}
        title={selectedLead?.name ?? "Detalhes do lead"}
        description="Dados principais, origem, historico, proximos passos e possiveis conversoes."
        contentClassName="sm:max-w-[1180px]"
      >
        {selectedLead ? (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <BaseCardV3 eyebrow={selectedLead.stage} title="Resumo do lead" description={selectedLead.notes} className="rounded-[26px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    `Origem: ${selectedLead.origin}`,
                    `Interesse: ${selectedLead.interest}`,
                    `Destino: ${selectedLead.destination}`,
                    `Periodo: ${selectedLead.periodStart} • ${selectedLead.periodEnd}`,
                    `Responsavel: ${selectedLead.owner}`,
                    `Ultimo contato: ${selectedLead.lastContact}`,
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Historico de contatos" title="Linha de relacionamento" description="Anotacoes que explicam o estado atual do lead." className="rounded-[26px]">
                <div className="space-y-2">
                  {selectedLead.history.map((item) => (
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
              <BaseCardV3 eyebrow="Leitura comercial" title="Proximos passos e vinculos" description="Probabilidade, objecoes e saidas operacionais." className="rounded-[26px]">
                <div className="space-y-2">
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Probabilidade de conversao: {selectedLead.conversionProbability}%</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Proximo passo: {selectedLead.nextStep}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Cotacao vinculada: {selectedLead.linkedQuote ?? "Nenhuma"}</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">Viagem vinculada: {selectedLead.linkedTrip ?? "Nenhuma"}</div>
                </div>
              </BaseCardV3>

              <div className="flex flex-wrap gap-2">
                <AgencyRebuildActionButton actionType="modal" label="Editar" className="rounded-full" onAction={() => openEditLead(selectedLead)} />
                <AgencyRebuildActionButton actionType="modal" label="Qualificar" className="rounded-full" onAction={() => openQualifyLead(selectedLead)} />
                <AgencyRebuildActionButton actionType="modal" label="Converter" className="rounded-full" onAction={() => setConvertLeadId(selectedLead.id)} />
                <AgencyRebuildActionButton actionType="future" label="Criar cotacao" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A central de cotacoes da V3 sera ativada depois." />
                <AgencyRebuildActionButton actionType="future" label="Criar viagem" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A passagem direta para Viagens chega em seguida." />
                <AgencyRebuildActionButton actionType="api" label="Marcar perdido" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => moveLeadStage(selectedLead.id, "Perdido")} />
                <AgencyRebuildActionButton actionType="api" label="Agendar retorno" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => toast({ title: "Retorno agendado", description: "O lead entrou na fila de acompanhamento local da V3." })} />
                <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/[0.06] text-rose-100" onAction={() => deleteLead(selectedLead.id)} />
              </div>
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
