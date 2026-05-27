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

type TemplatesTab =
  | "overview"
  | "library"
  | "mine"
  | "favorites"
  | "documents"
  | "itineraries"
  | "quotes"
  | "contracts"
  | "messages"
  | "history"

type TemplateCategory =
  | "Contrato"
  | "Voucher"
  | "Roteiro"
  | "Cotacao"
  | "Proposta"
  | "Recibo"
  | "Mensagem WhatsApp"
  | "Checklist"
  | "E-mail"
  | "Outro"

type TemplateOrigin = "Master" | "Agencia"
type TemplateStatus = "Ativo" | "Favorito" | "Personalizado" | "Arquivado"
type TemplateApplyTarget = "Documento" | "Roteiro" | "Cotacao" | "Contrato" | "Mensagem"

type TemplateRecord = {
  id: string
  name: string
  category: TemplateCategory
  origin: TemplateOrigin
  primaryUse: TemplateApplyTarget
  status: TemplateStatus
  lastUsed: string
  createdBy: string
  favorite: boolean
  archived: boolean
  variables: string[]
  preview: string
  notes: string
  usageHistory: string[]
  generatedItems: string[]
}

type TemplateFormState = {
  templateId: string
  applyTo: TemplateApplyTarget
  client: string
  trip: string
  title: string
  owner: string
  notes: string
}

type CustomizeState = {
  baseTemplateId: string
  name: string
  category: TemplateCategory
  editableFields: string
  status: TemplateStatus
  tags: string
  notes: string
}

const categories: TemplateCategory[] = [
  "Contrato",
  "Voucher",
  "Roteiro",
  "Cotacao",
  "Proposta",
  "Recibo",
  "Mensagem WhatsApp",
  "Checklist",
  "E-mail",
  "Outro",
]

const applyTargets: TemplateApplyTarget[] = ["Documento", "Roteiro", "Cotacao", "Contrato", "Mensagem"]

const templateSeed: TemplateRecord[] = [
  {
    id: "tpl-1",
    name: "Contrato premium internacional",
    category: "Contrato",
    origin: "Master",
    primaryUse: "Contrato",
    status: "Ativo",
    lastUsed: "Hoje, 09:20",
    createdBy: "TravelPro Master",
    favorite: true,
    archived: false,
    variables: ["{{cliente_nome}}", "{{destino}}", "{{periodo}}", "{{valor}}", "{{agencia_nome}}", "{{consultor_nome}}"],
    preview: "Contrato premium com clausulas de viagem internacional, pagamentos e cancelamento.",
    notes: "Base oficial do ecossistema TravelPro.",
    usageHistory: ["Usado em Contrato Italia Signature", "Aplicado em viagem corporativa Chile"],
    generatedItems: ["Contrato Italia Signature", "Contrato Aurora Tech"],
  },
  {
    id: "tpl-2",
    name: "Roteiro autoral 7 dias",
    category: "Roteiro",
    origin: "Master",
    primaryUse: "Roteiro",
    status: "Favorito",
    lastUsed: "Ontem, 18:10",
    createdBy: "TravelPro Master",
    favorite: true,
    archived: false,
    variables: ["{{cliente_nome}}", "{{destino}}", "{{periodo}}", "{{consultor_nome}}"],
    preview: "Estrutura limpa de roteiro premium com dias, atividades e notas especiais.",
    notes: "Base mais usada para viagens autorais.",
    usageHistory: ["Duplicado para Grecia Honeymoon", "Aplicado em Italia Signature"],
    generatedItems: ["Italia Signature 8D", "Grecia Honeymoon"],
  },
  {
    id: "tpl-3",
    name: "Mensagem de boas-vindas VIP",
    category: "Mensagem WhatsApp",
    origin: "Agencia",
    primaryUse: "Mensagem",
    status: "Personalizado",
    lastUsed: "2 dias",
    createdBy: "Marina Alves",
    favorite: false,
    archived: false,
    variables: ["{{cliente_nome}}", "{{destino}}", "{{agencia_nome}}", "{{consultor_nome}}"],
    preview: "Mensagem curta e elegante para iniciar a experiencia premium do cliente.",
    notes: "Adaptada pela agencia para publico VIP.",
    usageHistory: ["Favoritado pela equipe", "Usado em onboarding de cliente premium"],
    generatedItems: ["Mensagem Marina Alves", "Mensagem concierge Grecia"],
  },
]

function emptyUseTemplateState(): TemplateFormState {
  return {
    templateId: templateSeed[0]?.id ?? "",
    applyTo: "Documento",
    client: "Marina Alves",
    trip: "Italia Signature",
    title: "",
    owner: "Marina Alves",
    notes: "",
  }
}

function emptyCustomizeState(): CustomizeState {
  return {
    baseTemplateId: templateSeed[0]?.id ?? "",
    name: "",
    category: "Contrato",
    editableFields: "{{cliente_nome}}\n{{destino}}\n{{periodo}}",
    status: "Personalizado",
    tags: "",
    notes: "",
  }
}

function statusTone(status: TemplateStatus) {
  if (status === "Favorito") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (status === "Personalizado") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Ativo") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildTemplatesWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<TemplatesTab>("overview")
  const [templates, setTemplates] = useState<TemplateRecord[]>(templateSeed)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [useTemplateOpen, setUseTemplateOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [useTemplateState, setUseTemplateState] = useState<TemplateFormState>(emptyUseTemplateState())
  const [customizeState, setCustomizeState] = useState<CustomizeState>(emptyCustomizeState())
  const [filters, setFilters] = useState({
    category: "all",
    origin: "all",
    status: "all",
    favorite: "all",
    usage: "all",
    createdBy: "all",
  })

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === detailId) ?? null,
    [detailId, templates],
  )

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        if (filters.category !== "all" && template.category !== filters.category) return false
        if (filters.origin !== "all" && template.origin !== filters.origin) return false
        if (filters.status !== "all" && template.status !== filters.status) return false
        if (filters.favorite === "yes" && !template.favorite) return false
        if (filters.favorite === "no" && template.favorite) return false
        if (filters.createdBy !== "all" && template.createdBy !== filters.createdBy) return false
        return true
      }),
    [filters, templates],
  )

  const totals = useMemo(
    () => ({
      available: templates.filter((item) => !item.archived).length,
      used: templates.reduce((sum, item) => sum + item.usageHistory.length, 0),
      personalized: templates.filter((item) => item.origin === "Agencia").length,
      favorites: templates.filter((item) => item.favorite).length,
      master: templates.filter((item) => item.origin === "Master").length,
      agency: templates.filter((item) => item.origin === "Agencia").length,
    }),
    [templates],
  )

  const timeline = useMemo(
    () =>
      templates.flatMap((template) =>
        template.usageHistory.map((item, index) => ({
          id: `${template.id}-${index}`,
          title: item,
          template: template.name,
        })),
      ),
    [templates],
  )

  const openUseTemplate = (templateId?: string) => {
    setUseTemplateState((current) => ({ ...current, templateId: templateId ?? current.templateId }))
    setUseTemplateOpen(true)
  }

  const openCustomize = (template?: TemplateRecord) => {
    if (template) {
      setCustomizeState({
        baseTemplateId: template.id,
        name: `${template.name} • Copia`,
        category: template.category,
        editableFields: template.variables.join("\n"),
        status: "Personalizado",
        tags: "",
        notes: template.notes,
      })
    } else {
      setCustomizeState(emptyCustomizeState())
    }
    setCustomizeOpen(true)
  }

  const useTemplate = () => {
    const template = templates.find((item) => item.id === useTemplateState.templateId)
    if (!template || !useTemplateState.title.trim()) {
      toast({
        title: "Defina template e titulo",
        description: "Isso ajuda a gerar um item local coerente dentro da V3.",
      })
      return
    }

    setTemplates((items) =>
      items.map((item) =>
        item.id === template.id
          ? {
              ...item,
              lastUsed: "Agora",
              usageHistory: [`Template usado para ${useTemplateState.title}`, ...item.usageHistory],
              generatedItems: [useTemplateState.title, ...item.generatedItems],
            }
          : item,
      ),
    )
    setUseTemplateOpen(false)
    toast({
      title: "Template aplicado",
      description: `${template.name} foi usado para gerar um novo item local em ${useTemplateState.applyTo.toLowerCase()}.`,
    })
  }

  const createCustomizedCopy = () => {
    const base = templates.find((item) => item.id === customizeState.baseTemplateId)
    if (!base || !customizeState.name.trim()) {
      toast({
        title: "Defina base e nome",
        description: "A copia personalizada precisa desses dois pontos para nascer bem estruturada.",
      })
      return
    }

    const newTemplate: TemplateRecord = {
      id: `tpl-${Date.now()}`,
      name: customizeState.name.trim(),
      category: customizeState.category,
      origin: "Agencia",
      primaryUse: base.primaryUse,
      status: customizeState.status,
      lastUsed: "Agora",
      createdBy: "Marina Alves",
      favorite: false,
      archived: false,
      variables: customizeState.editableFields.split("\n").map((line) => line.trim()).filter(Boolean),
      preview: `Copia personalizada a partir de ${base.name}.`,
      notes: customizeState.notes,
      usageHistory: ["Copia personalizada criada"],
      generatedItems: [],
    }

    setTemplates((items) => [newTemplate, ...items])
    setCustomizeOpen(false)
    toast({
      title: "Copia personalizada criada",
      description: "O template da agencia foi salvo localmente no preview da V3.",
    })
  }

  const duplicateTemplate = (templateId: string) => {
    const current = templates.find((item) => item.id === templateId)
    if (!current) return
    const duplicated: TemplateRecord = {
      ...current,
      id: `tpl-${Date.now()}`,
      name: `${current.name} • Copia`,
      origin: "Agencia",
      status: "Personalizado",
      createdBy: "Marina Alves",
      favorite: false,
      usageHistory: ["Template duplicado localmente"],
    }
    setTemplates((items) => [duplicated, ...items])
    toast({
      title: "Template duplicado",
      description: "A copia local da agencia ja apareceu na biblioteca.",
    })
  }

  const toggleFavorite = (templateId: string) => {
    setTemplates((items) =>
      items.map((item) =>
        item.id === templateId
          ? {
              ...item,
              favorite: !item.favorite,
              status: !item.favorite ? "Favorito" : item.origin === "Agencia" ? "Personalizado" : "Ativo",
              usageHistory: [!item.favorite ? "Template favoritado" : "Template removido dos favoritos", ...item.usageHistory],
            }
          : item,
      ),
    )
  }

  const archiveTemplate = (templateId: string) => {
    setTemplates((items) =>
      items.map((item) =>
        item.id === templateId ? { ...item, archived: true, status: "Arquivado", usageHistory: ["Template arquivado", ...item.usageHistory] } : item,
      ),
    )
    toast({
      title: "Template arquivado",
      description: "O item foi movido localmente para o estado arquivado.",
    })
  }

  const deleteAgencyTemplate = (templateId: string) => {
    const current = templates.find((item) => item.id === templateId)
    if (!current) return
    if (current.origin === "Master") {
      toast({
        title: "Template protegido",
        description: "Templates do Master nao podem ser excluidos pela agencia nesta etapa.",
      })
      return
    }
    setTemplates((items) => items.filter((item) => item.id !== templateId))
    if (detailId === templateId) setDetailId(null)
    toast({
      title: "Template removido",
      description: "A copia da agencia foi excluida localmente da biblioteca.",
    })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Templates"
        description="Modelos reutilizaveis para documentos, roteiros, contratos, cotacoes e comunicacao."
        contentClassName="sm:max-w-[1380px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Templates disponiveis", value: totals.available.toString() },
                  { label: "Templates usados", value: totals.used.toString() },
                  { label: "Personalizados", value: totals.personalized.toString() },
                  { label: "Favoritos", value: totals.favorites.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Usar template" className="rounded-full" onAction={() => openUseTemplate()} />
                <AgencyRebuildActionButton actionType="modal" label="Personalizar copia" className="rounded-full" onAction={() => openCustomize()} />
                <AgencyRebuildActionButton actionType="api" label="Duplicar" className="rounded-full" onAction={() => duplicateTemplate(templates[0]?.id ?? "")} />
                <AgencyRebuildActionButton actionType="modal" label="Criar template proprio" className="rounded-full" onAction={() => openCustomize()} />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as TemplatesTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="library">Biblioteca</TabsTrigger>
                <TabsTrigger value="mine">Meus templates</TabsTrigger>
                <TabsTrigger value="favorites">Favoritos</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="itineraries">Roteiros</TabsTrigger>
                <TabsTrigger value="quotes">Cotacoes</TabsTrigger>
                <TabsTrigger value="contracts">Contratos</TabsTrigger>
                <TabsTrigger value="messages">Mensagens</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Disponiveis", value: totals.available.toString(), note: "Biblioteca viva para toda a operacao." },
                    { label: "Usados", value: totals.used.toString(), note: "Aplicacoes recentes em fluxos da agencia." },
                    { label: "Personalizados", value: totals.personalized.toString(), note: "Copias adaptadas pela equipe." },
                    { label: "Favoritos", value: totals.favorites.toString(), note: "Bases preferidas do time." },
                    { label: "Templates do Master", value: totals.master.toString(), note: "Bases oficiais e protegidas." },
                    { label: "Templates da agencia", value: totals.agency.toString(), note: "Copias locais e flexiveis." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <BaseCardV3 eyebrow="Uso em foco" title="Templates que movimentam a operacao" description="Sugestoes, recentes, revisoes e uso mais intenso." className="rounded-[28px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        `${templates[0]?.name ?? "Template"} segue como o mais usado hoje.`,
                        `${templates.filter((item) => item.favorite).length} templates estao em favoritos da agencia.`,
                        `${templates.filter((item) => item.origin === "Agencia").length} copias personalizadas precisam revisao leve.`,
                        `${templates[1]?.name ?? "Base"} aparece como sugestao viva para proximas jornadas.`,
                      ].map((item) => (
                        <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>

                  <BaseCardV3 eyebrow="Recentes" title="Movimentos da biblioteca" description="Aplicacoes e atualizacoes mais frescas no ecossistema." className="rounded-[28px]">
                    <div className="space-y-2">
                      {templates.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.lastUsed} • {item.origin}</div>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>
                </div>
              </TabsContent>

              <TabsContent value="library" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Select value={filters.category} onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.origin} onValueChange={(value) => setFilters((current) => ({ ...current, origin: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Origem" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Agencia">Agencia</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Favorito">Favorito</SelectItem>
                      <SelectItem value="Personalizado">Personalizado</SelectItem>
                      <SelectItem value="Arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.favorite} onValueChange={(value) => setFilters((current) => ({ ...current, favorite: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Favorito" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="yes">So favoritos</SelectItem>
                      <SelectItem value="no">Sem favoritos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredTemplates.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_1fr_1fr]">
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.primaryUse} • {item.lastUsed}</div>
                          </div>
                          <div className="text-sm text-muted-foreground"><div>Categoria</div><div className="mt-1 text-zinc-100">{item.category}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Origem</div><div className="mt-1 text-zinc-100">{item.origin}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Status</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                          <div className="text-sm text-muted-foreground"><div>Uso principal</div><div className="mt-1 text-zinc-100">{item.primaryUse}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Criado por</div><div className="mt-1 text-zinc-100">{item.createdBy}</div></div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <AgencyRebuildActionButton actionType="modal" label="Visualizar" className="h-8 rounded-full px-3 text-xs" onAction={() => setDetailId(item.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Usar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => openUseTemplate(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Duplicar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => duplicateTemplate(item.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Personalizar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => openCustomize(item)} />
                          <AgencyRebuildActionButton actionType="api" label={item.favorite ? "Desfavoritar" : "Favoritar"} variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => toggleFavorite(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Arquivar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => archiveTemplate(item.id)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="mine" className="space-y-3">
                {templates.filter((item) => item.origin === "Agencia").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow={item.category} title={item.name} description={`${item.primaryUse} • ${item.status}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="favorites" className="space-y-3">
                {templates.filter((item) => item.favorite).map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Favorito" title={item.name} description={`${item.category} • ${item.origin}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="documents" className="space-y-3">
                {templates.filter((item) => item.primaryUse === "Documento").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Documento" title={item.name} description={item.preview} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="itineraries" className="space-y-3">
                {templates.filter((item) => item.primaryUse === "Roteiro").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Roteiro" title={item.name} description={item.preview} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="quotes" className="space-y-3">
                {templates.filter((item) => item.primaryUse === "Cotacao").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Cotacao" title={item.name} description={item.preview} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="contracts" className="space-y-3">
                {templates.filter((item) => item.primaryUse === "Contrato").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Contrato" title={item.name} description={item.preview} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="messages" className="space-y-3">
                {templates.filter((item) => item.primaryUse === "Mensagem").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Mensagem" title={item.name} description={item.preview} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {timeline.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.template}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={useTemplateOpen}
        onOpenChange={setUseTemplateOpen}
        title="Usar template"
        description="Aplique um template em documento, roteiro, cotacao, contrato ou mensagem."
        contentClassName="sm:max-w-3xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setUseTemplateOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Aplicar template" className="rounded-full" onAction={useTemplate} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={useTemplateState.templateId} onValueChange={(value) => setUseTemplateState((current) => ({ ...current, templateId: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Template selecionado" /></SelectTrigger>
            <SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={useTemplateState.applyTo} onValueChange={(value) => setUseTemplateState((current) => ({ ...current, applyTo: value as TemplateApplyTarget }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Aplicar em" /></SelectTrigger>
            <SelectContent>{applyTargets.map((target) => <SelectItem key={target} value={target}>{target}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={useTemplateState.client} onChange={(event) => setUseTemplateState((current) => ({ ...current, client: event.target.value }))} placeholder="Cliente" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={useTemplateState.trip} onChange={(event) => setUseTemplateState((current) => ({ ...current, trip: event.target.value }))} placeholder="Viagem vinculada" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={useTemplateState.title} onChange={(event) => setUseTemplateState((current) => ({ ...current, title: event.target.value }))} placeholder="Titulo do novo item" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={useTemplateState.owner} onChange={(event) => setUseTemplateState((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsavel" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={useTemplateState.notes} onChange={(event) => setUseTemplateState((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes do uso local deste template." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        title="Personalizar copia"
        description="Crie uma copia local da agencia com variaveis, campos e observacoes."
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setCustomizeOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Salvar copia" className="rounded-full" onAction={createCustomizedCopy} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={customizeState.baseTemplateId} onValueChange={(value) => setCustomizeState((current) => ({ ...current, baseTemplateId: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Template base" /></SelectTrigger>
            <SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={customizeState.name} onChange={(event) => setCustomizeState((current) => ({ ...current, name: event.target.value }))} placeholder="Novo nome" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={customizeState.category} onValueChange={(value) => setCustomizeState((current) => ({ ...current, category: value as TemplateCategory }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={customizeState.status} onValueChange={(value) => setCustomizeState((current) => ({ ...current, status: value as TemplateStatus }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Personalizado">Personalizado</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Favorito">Favorito</SelectItem>
              <SelectItem value="Arquivado">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <div className="md:col-span-2">
            <Textarea value={customizeState.editableFields} onChange={(event) => setCustomizeState((current) => ({ ...current, editableFields: event.target.value }))} placeholder="Variaveis e campos editaveis, um por linha." className="min-h-[150px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
          <Input value={customizeState.tags} onChange={(event) => setCustomizeState((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags separadas por virgula" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={customizeState.notes} onChange={(event) => setCustomizeState((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes e regras desta copia." className="min-h-[120px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedTemplate)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailId(null)
        }}
        title={selectedTemplate?.name ?? "Detalhes do template"}
        description="Preview, origem, variaveis, historico de uso e itens gerados a partir deste modelo."
        contentClassName="sm:max-w-[1160px]"
      >
        {selectedTemplate ? (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <BaseCardV3 eyebrow={selectedTemplate.origin} title="Preview do template" description={selectedTemplate.preview} className="rounded-[26px]">
                <div className="space-y-2">
                  <div className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">{selectedTemplate.notes}</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((variable) => (
                      <Badge key={variable} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground" variant="outline">{variable}</Badge>
                    ))}
                  </div>
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Historico de uso" title="Itens gerados a partir da base" description="Leitura local da trilha operacional deste template." className="rounded-[26px]">
                <div className="space-y-2">
                  {selectedTemplate.generatedItems.map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>
            </div>

            <div className="space-y-4">
              <BaseCardV3 eyebrow="Permissoes visuais" title="Contexto do template" description="Origem, categoria, uso e protecao deste modelo." className="rounded-[26px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    `Categoria: ${selectedTemplate.category}`,
                    `Uso principal: ${selectedTemplate.primaryUse}`,
                    `Origem: ${selectedTemplate.origin}`,
                    `Status: ${selectedTemplate.status}`,
                    `Criado por: ${selectedTemplate.createdBy}`,
                    `Ultima utilizacao: ${selectedTemplate.lastUsed}`,
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>

              <div className="flex flex-wrap gap-2">
                <AgencyRebuildActionButton actionType="modal" label="Usar template" className="rounded-full" onAction={() => openUseTemplate(selectedTemplate.id)} />
                <AgencyRebuildActionButton actionType="api" label="Duplicar" className="rounded-full" onAction={() => duplicateTemplate(selectedTemplate.id)} />
                <AgencyRebuildActionButton actionType="modal" label="Personalizar" className="rounded-full" onAction={() => openCustomize(selectedTemplate)} />
                <AgencyRebuildActionButton actionType="api" label={selectedTemplate.favorite ? "Desfavoritar" : "Favoritar"} variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => toggleFavorite(selectedTemplate.id)} />
                <AgencyRebuildActionButton actionType="api" label="Arquivar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => archiveTemplate(selectedTemplate.id)} />
                <AgencyRebuildActionButton
                  actionType={selectedTemplate.origin === "Master" ? "future" : "api"}
                  label="Excluir"
                  variant="outline"
                  className="rounded-full border-rose-400/20 bg-rose-400/[0.06] text-rose-100"
                  futureMessage="Templates do Master seguem protegidos nesta etapa."
                  onAction={selectedTemplate.origin === "Agencia" ? () => deleteAgencyTemplate(selectedTemplate.id) : undefined}
                />
              </div>
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
