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

type CatalogTab = "overview" | "packages" | "published" | "drafts" | "destinations" | "categories" | "showcase" | "history"
type PackageStatus = "Rascunho" | "Publicado" | "Pausado" | "Arquivado"
type PackageType = "Nacional" | "Internacional" | "Cruzeiro" | "Familia" | "Lua de mel" | "Corporativo" | "Grupo" | "Outro"

type PackageRecord = {
  id: string
  name: string
  destination: string
  category: string
  type: PackageType
  price: number
  currency: string
  availablePeriod: string
  startDate: string
  endDate: string
  duration: string
  includes: string[]
  excludes: string[]
  shortDescription: string
  fullDescription: string
  status: PackageStatus
  published: boolean
  featured: boolean
  updatedAt: string
  views: number
  clicks: number
  tags: string[]
}

type PackageFormState = {
  name: string
  destination: string
  category: string
  type: PackageType
  price: string
  currency: string
  availablePeriod: string
  startDate: string
  endDate: string
  duration: string
  includes: string
  excludes: string
  shortDescription: string
  fullDescription: string
  status: PackageStatus
  featured: boolean
  tags: string
}

type DestinationRecord = {
  id: string
  name: string
  packageCount: number
  status: "Ativo" | "Arquivado"
  featured: boolean
}

const packageSeed: PackageRecord[] = [
  {
    id: "pkg-1",
    name: "Italia Signature",
    destination: "Italia",
    category: "Premium",
    type: "Internacional",
    price: 18400,
    currency: "BRL",
    availablePeriod: "Junho a Setembro",
    startDate: "2026-06-14",
    endDate: "2026-09-20",
    duration: "8 dias",
    includes: ["Hospedagem boutique", "Experiencias privadas", "Transfer premium"],
    excludes: ["Seguro viagem", "Despesas pessoais"],
    shortDescription: "Jornada premium pela Italia com curadoria autoral.",
    fullDescription: "Pacote completo com foco em arte, gastronomia e concierge.",
    status: "Publicado",
    published: true,
    featured: true,
    updatedAt: "2026-05-26",
    views: 284,
    clicks: 32,
    tags: ["vip", "europa"],
  },
  {
    id: "pkg-2",
    name: "Grecia Honeymoon",
    destination: "Grecia",
    category: "Lua de mel",
    type: "Lua de mel",
    price: 22900,
    currency: "BRL",
    availablePeriod: "Julho a Outubro",
    startDate: "2026-07-08",
    endDate: "2026-10-20",
    duration: "10 dias",
    includes: ["Hotel premium", "Passeio de barco", "Transfers"],
    excludes: ["Taxas locais"],
    shortDescription: "Ilhas e experiencias romanticas para lua de mel.",
    fullDescription: "Pacote premium com foco em ilhas, por do sol e hotelaria especial.",
    status: "Rascunho",
    published: false,
    featured: false,
    updatedAt: "2026-05-25",
    views: 121,
    clicks: 14,
    tags: ["ilha", "romantico"],
  },
  {
    id: "pkg-3",
    name: "Buenos Aires Week",
    destination: "Buenos Aires",
    category: "Corporativo",
    type: "Corporativo",
    price: 11200,
    currency: "BRL",
    availablePeriod: "Ano todo",
    startDate: "2026-06-01",
    endDate: "2026-12-20",
    duration: "5 dias",
    includes: ["Voos", "Hotel", "Transfer"],
    excludes: ["Refeicoes extras"],
    shortDescription: "Pacote corporativo com execucao enxuta.",
    fullDescription: "Fluxo corporativo ideal para feiras, reunioes e grupos executivos.",
    status: "Publicado",
    published: true,
    featured: false,
    updatedAt: "2026-05-23",
    views: 98,
    clicks: 11,
    tags: ["corporativo"],
  },
]

const destinationSeed: DestinationRecord[] = [
  { id: "dest-1", name: "Italia", packageCount: 3, status: "Ativo", featured: true },
  { id: "dest-2", name: "Grecia", packageCount: 2, status: "Ativo", featured: true },
  { id: "dest-3", name: "Buenos Aires", packageCount: 4, status: "Ativo", featured: false },
]

function emptyPackageForm(): PackageFormState {
  return {
    name: "",
    destination: "",
    category: "Premium",
    type: "Internacional",
    price: "",
    currency: "BRL",
    availablePeriod: "",
    startDate: "2026-06-20",
    endDate: "2026-06-28",
    duration: "",
    includes: "",
    excludes: "",
    shortDescription: "",
    fullDescription: "",
    status: "Rascunho",
    featured: false,
    tags: "",
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)
}

function parseMoney(value: string) {
  const numeric = value.replace(/[^\d,-.]/g, "").replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(numeric)
  return Number.isFinite(parsed) ? parsed : 0
}

function statusTone(status: PackageStatus) {
  if (status === "Publicado") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Pausado") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (status === "Rascunho") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildCatalogWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<CatalogTab>("overview")
  const [packages, setPackages] = useState<PackageRecord[]>(packageSeed)
  const [destinations, setDestinations] = useState<DestinationRecord[]>(destinationSeed)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [packageOpen, setPackageOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PackageFormState>(emptyPackageForm())
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    destination: "all",
    published: "all",
    featured: "all",
    type: "all",
  })

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === detailId) ?? null,
    [detailId, packages],
  )

  const filteredPackages = useMemo(
    () =>
      packages.filter((item) => {
        if (filters.status !== "all" && item.status !== filters.status) return false
        if (filters.category !== "all" && item.category !== filters.category) return false
        if (filters.destination !== "all" && item.destination !== filters.destination) return false
        if (filters.published === "yes" && !item.published) return false
        if (filters.published === "no" && item.published) return false
        if (filters.featured === "yes" && !item.featured) return false
        if (filters.featured === "no" && item.featured) return false
        if (filters.type !== "all" && item.type !== filters.type) return false
        return true
      }),
    [filters, packages],
  )

  const totals = useMemo(
    () => ({
      active: packages.filter((item) => item.status !== "Arquivado").length,
      published: packages.filter((item) => item.published).length,
      drafts: packages.filter((item) => item.status === "Rascunho").length,
      views: packages.reduce((sum, item) => sum + item.views, 0),
      clicks: packages.reduce((sum, item) => sum + item.clicks, 0),
      featured: packages.filter((item) => item.featured).length,
    }),
    [packages],
  )

  const history = useMemo(
    () => [
      "Pacote Italia Signature foi destacado",
      "Pacote Grecia Honeymoon entrou em rascunho",
      "Buenos Aires Week foi publicado",
      "Categoria Premium recebeu novo pacote",
    ],
    [],
  )

  const openNewPackage = () => {
    setEditingId(null)
    setForm(emptyPackageForm())
    setPackageOpen(true)
  }

  const openEditPackage = (item: PackageRecord) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      destination: item.destination,
      category: item.category,
      type: item.type,
      price: String(item.price),
      currency: item.currency,
      availablePeriod: item.availablePeriod,
      startDate: item.startDate,
      endDate: item.endDate,
      duration: item.duration,
      includes: item.includes.join(", "),
      excludes: item.excludes.join(", "),
      shortDescription: item.shortDescription,
      fullDescription: item.fullDescription,
      status: item.status,
      featured: item.featured,
      tags: item.tags.join(", "),
    })
    setPackageOpen(true)
  }

  const savePackage = () => {
    if (!form.name.trim() || !form.destination.trim()) {
      toast({
        title: "Preencha nome e destino",
        description: "Esses dois campos ajudam o pacote a nascer com contexto claro.",
      })
      return
    }

    const current = editingId ? packages.find((item) => item.id === editingId) : null
    const payload: PackageRecord = {
      id: editingId ?? `pkg-${Date.now()}`,
      name: form.name.trim(),
      destination: form.destination.trim(),
      category: form.category,
      type: form.type,
      price: parseMoney(form.price),
      currency: form.currency,
      availablePeriod: form.availablePeriod.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      duration: form.duration.trim(),
      includes: form.includes.split(",").map((item) => item.trim()).filter(Boolean),
      excludes: form.excludes.split(",").map((item) => item.trim()).filter(Boolean),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      status: form.status,
      published: current?.published ?? false,
      featured: form.featured,
      updatedAt: "2026-05-26",
      views: current?.views ?? 0,
      clicks: current?.clicks ?? 0,
      tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
    }

    setPackages((items) => (editingId ? items.map((item) => (item.id === editingId ? payload : item)) : [payload, ...items]))
    setPackageOpen(false)
    toast({
      title: editingId ? "Pacote atualizado" : "Pacote criado",
      description: "A vitrine local da V3 foi atualizada com sucesso.",
    })
  }

  const duplicatePackage = (id: string) => {
    const current = packages.find((item) => item.id === id)
    if (!current) return
    const duplicated: PackageRecord = {
      ...current,
      id: `pkg-${Date.now()}`,
      name: `${current.name} • Copia`,
      status: "Rascunho",
      published: false,
      updatedAt: "2026-05-26",
    }
    setPackages((items) => [duplicated, ...items])
    toast({ title: "Pacote duplicado", description: "A copia local entrou como rascunho na V3." })
  }

  const togglePublish = (id: string, force?: boolean) => {
    setPackages((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              published: force ?? !item.published,
              status: (force ?? !item.published) ? "Publicado" : "Pausado",
              updatedAt: "2026-05-26",
            }
          : item,
      ),
    )
    toast({
      title: "Publicacao atualizada",
      description: "O estado do pacote foi alterado localmente na V3.",
    })
  }

  const toggleFeatured = (id: string) => {
    setPackages((items) => items.map((item) => (item.id === id ? { ...item, featured: !item.featured, updatedAt: "2026-05-26" } : item)))
  }

  const removePackage = (id: string) => {
    setPackages((items) => items.filter((item) => item.id !== id))
    if (detailId === id) setDetailId(null)
    toast({ title: "Pacote removido", description: "A lista local do catalogo foi atualizada." })
  }

  const createDestination = () => {
    setDestinations((items) => [
      { id: `dest-${Date.now()}`, name: "Novo destino local", packageCount: 0, status: "Ativo", featured: false },
      ...items,
    ])
    toast({ title: "Destino criado", description: "O destino foi adicionado localmente na V3." })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Catalogo"
        description="Pacotes, vitrines, destinos e ofertas publicadas da agencia."
        contentClassName="sm:max-w-[1380px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Pacotes ativos", value: String(totals.active) },
                  { label: "Pacotes publicados", value: String(totals.published) },
                  { label: "Rascunhos", value: String(totals.drafts) },
                  { label: "Visualizacoes", value: String(totals.views) },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Novo pacote" className="rounded-full" onAction={openNewPackage} />
                <AgencyRebuildActionButton actionType="modal" label="Publicar pacote" className="rounded-full" onAction={() => setPublishOpen(true)} />
                <AgencyRebuildActionButton actionType="api" label="Duplicar pacote" className="rounded-full" onAction={() => duplicatePackage(packages[0]?.id ?? "")} />
                <AgencyRebuildActionButton actionType="future" label="Ver vitrine" className="rounded-full" futureMessage="A vitrine publica real sera conectada depois ao preview da V3." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as CatalogTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="packages">Pacotes</TabsTrigger>
                <TabsTrigger value="published">Publicados</TabsTrigger>
                <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
                <TabsTrigger value="destinations">Destinos</TabsTrigger>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
                <TabsTrigger value="showcase">Vitrine publica</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Pacotes ativos", value: String(totals.active), note: "Base pronta para vender e ajustar." },
                    { label: "Publicados", value: String(totals.published), note: "Ja estao na vitrine local." },
                    { label: "Rascunhos", value: String(totals.drafts), note: "Precisam de lapidacao final." },
                    { label: "Visualizacoes", value: String(totals.views), note: "Interesse local sobre a vitrine." },
                    { label: "Cliques no WhatsApp", value: String(totals.clicks), note: "Sinal comercial da vitrine." },
                    { label: "Pacotes em destaque", value: String(totals.featured), note: "Itens empurrados para o topo." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <BaseCardV3 eyebrow="Vitrine em foco" title="O que merece atencao agora" description="Pacotes vistos, sem imagem, pendentes e destinos quentes." className="rounded-[28px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        `${packages[0]?.name ?? "Pacote"} segue como o mais visto da semana.`,
                        `${packages.filter((item) => item.status === "Rascunho").length} pacotes ainda pedem publicacao.`,
                        "2 pacotes premium ainda esperam capa definitiva.",
                        `${destinations.filter((item) => item.featured).map((item) => item.name).join(" e ")} puxam interesse agora.`,
                      ].map((item) => (
                        <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>

                  <BaseCardV3 eyebrow="Destaques" title="Pacotes mais fortes" description="Top vitrine local e sinais comerciais rapidos." className="rounded-[28px]">
                    <div className="space-y-2">
                      {packages.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.destination} • {item.views} views</div>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>
                </div>
              </TabsContent>

              <TabsContent value="packages" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="Rascunho">Rascunho</SelectItem>
                      <SelectItem value="Publicado">Publicado</SelectItem>
                      <SelectItem value="Pausado">Pausado</SelectItem>
                      <SelectItem value="Arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.category} onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {Array.from(new Set(packages.map((item) => item.category))).map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.destination} onValueChange={(value) => setFilters((current) => ({ ...current, destination: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Destino" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os destinos</SelectItem>
                      {Array.from(new Set(packages.map((item) => item.destination))).map((destination) => <SelectItem key={destination} value={destination}>{destination}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.type} onValueChange={(value) => setFilters((current) => ({ ...current, type: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {Array.from(new Set(packages.map((item) => item.type))).map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredPackages.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.45fr_0.9fr_0.9fr_0.8fr_0.8fr_0.8fr_1fr]">
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.destination} • {item.category}</div>
                          </div>
                          <div className="text-sm text-muted-foreground"><div>Categoria</div><div className="mt-1 text-zinc-100">{item.category}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Preco</div><div className="mt-1 text-zinc-100">{formatCurrency(item.price)}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Status</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                          <div className="text-sm text-muted-foreground"><div>Publicado</div><div className="mt-1 text-zinc-100">{item.published ? "Sim" : "Nao"}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Destaque</div><div className="mt-1 text-zinc-100">{item.featured ? "Sim" : "Nao"}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Atualizado</div><div className="mt-1 text-zinc-100">{item.updatedAt}</div></div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <AgencyRebuildActionButton actionType="modal" label="Abrir" className="h-8 rounded-full px-3 text-xs" onAction={() => setDetailId(item.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Editar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => openEditPackage(item)} />
                          <AgencyRebuildActionButton actionType="api" label="Duplicar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => duplicatePackage(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label={item.published ? "Despublicar" : "Publicar"} variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => togglePublish(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label={item.featured ? "Remover destaque" : "Destacar"} variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => toggleFeatured(item.id)} />
                          <AgencyRebuildActionButton actionType="future" label="Copiar link" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="O link publico real sera conectado depois ao catalogo da V3." />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="published" className="space-y-3">
                {packages.filter((item) => item.published).map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Publicado" title={item.name} description={`${item.destination} • ${formatCurrency(item.price)}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="drafts" className="space-y-3">
                {packages.filter((item) => item.status === "Rascunho").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Rascunho" title={item.name} description={item.shortDescription} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="destinations" className="space-y-3">
                <div className="flex justify-end">
                  <AgencyRebuildActionButton actionType="api" label="Criar destino" className="rounded-full" onAction={createDestination} />
                </div>
                {destinations.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.packageCount} pacotes • {item.status}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="api" label="Editar" className="h-8 rounded-full px-3 text-xs" onAction={() => toast({ title: "Destino editado", description: "Ajuste local aplicado ao destino." })} />
                        <AgencyRebuildActionButton actionType="api" label={item.featured ? "Tirar destaque" : "Destacar"} variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => setDestinations((items) => items.map((dest) => dest.id === item.id ? { ...dest, featured: !dest.featured } : dest))} />
                        <AgencyRebuildActionButton actionType="api" label="Arquivar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => setDestinations((items) => items.map((dest) => dest.id === item.id ? { ...dest, status: "Arquivado" } : dest))} />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="categories" className="space-y-3">
                {["Nacional", "Internacional", "Cruzeiros", "Familia", "Lua de mel", "Grupos", "Corporativo", "Premium"].map((category) => (
                  <div key={category} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{category}</div>
                        <div className="text-xs text-muted-foreground">Acoes locais de vitrine e curadoria.</div>
                      </div>
                      <AgencyRebuildActionButton actionType="api" label="Ajustar" className="h-8 rounded-full px-3 text-xs" onAction={() => toast({ title: "Categoria ajustada", description: "A categoria foi atualizada localmente." })} />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="showcase" className="space-y-4">
                <BaseCardV3 eyebrow="Vitrine publica" title="Preview da vitrine local" description="Status, slug e pacotes publicados sem conectar a rota real agora." className="rounded-[28px]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-sm font-medium text-zinc-100">Status da vitrine</div>
                      <div className="mt-2 text-sm text-muted-foreground">Ativa no preview local</div>
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-sm font-medium text-zinc-100">Slug da agencia</div>
                      <div className="mt-2 text-sm text-muted-foreground">horizonte-premium</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AgencyRebuildActionButton actionType="future" label="Copiar link" className="rounded-full" futureMessage="O link real da vitrine sera ligado depois." />
                    <AgencyRebuildActionButton actionType="future" label="Abrir preview" className="rounded-full" futureMessage="A visualizacao publica sera conectada a rota real em seguida." />
                    <AgencyRebuildActionButton actionType="future" label="Branding" className="rounded-full" futureMessage="Os ajustes de branding entram na proxima etapa da V3." />
                  </div>
                </BaseCardV3>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {history.map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={packageOpen}
        onOpenChange={setPackageOpen}
        title={editingId ? "Editar pacote" : "Novo pacote"}
        description="Monte o pacote com destino, periodo, preco, inclusoes e posicao na vitrine."
        contentClassName="sm:max-w-5xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setPackageOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label={editingId ? "Salvar pacote" : "Criar pacote"} className="rounded-full" onAction={savePackage} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do pacote" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))} placeholder="Destino" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Categoria" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value as PackageType }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              {["Nacional", "Internacional", "Cruzeiro", "Familia", "Lua de mel", "Corporativo", "Grupo", "Outro"].map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Preco inicial em R$" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} placeholder="Moeda" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.availablePeriod} onChange={(event) => setForm((current) => ({ ...current, availablePeriod: event.target.value }))} placeholder="Periodo disponivel" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} placeholder="Duracao" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.includes} onChange={(event) => setForm((current) => ({ ...current, includes: event.target.value }))} placeholder="Inclui (separado por virgula)" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={form.excludes} onChange={(event) => setForm((current) => ({ ...current, excludes: event.target.value }))} placeholder="Nao inclui (separado por virgula)" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} placeholder="Descricao curta" className="min-h-[100px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
          <div className="md:col-span-2">
            <Textarea value={form.fullDescription} onChange={(event) => setForm((current) => ({ ...current, fullDescription: event.target.value }))} placeholder="Descricao completa" className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
          <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as PackageStatus }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Rascunho">Rascunho</SelectItem>
              <SelectItem value="Publicado">Publicado</SelectItem>
              <SelectItem value="Pausado">Pausado</SelectItem>
              <SelectItem value="Arquivado">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags separadas por virgula" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <label className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
            Destacar na vitrine
          </label>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title="Publicar pacote"
        description="Revise os dados principais e confirme a publicacao local do pacote."
        contentClassName="sm:max-w-3xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setPublishOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Confirmar publicacao" className="rounded-full" onAction={() => {
              if (packages[0]) togglePublish(packages[0].id, true)
              setPublishOpen(false)
            }} />
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-sm font-medium text-zinc-100">{packages[0]?.name ?? "Nenhum pacote selecionado"}</div>
            <div className="mt-2 text-sm text-muted-foreground">{packages[0]?.destination} • {packages[0] ? formatCurrency(packages[0].price) : "-"}</div>
          </div>
          <label className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
            <input type="checkbox" defaultChecked />
            Marcar como destaque
          </label>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedPackage)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailId(null)
        }}
        title={selectedPackage?.name ?? "Detalhes do pacote"}
        description="Resumo, preco, status, visualizacoes, historico e previa visual do pacote."
        contentClassName="sm:max-w-[1180px]"
      >
        {selectedPackage ? (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <BaseCardV3 eyebrow={selectedPackage.category} title="Resumo do pacote" description={selectedPackage.shortDescription} className="rounded-[26px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    `Destino: ${selectedPackage.destination}`,
                    `Preco: ${formatCurrency(selectedPackage.price)}`,
                    `Status: ${selectedPackage.status}`,
                    `Visualizacoes: ${selectedPackage.views}`,
                    `Cliques: ${selectedPackage.clicks}`,
                    `Periodo: ${selectedPackage.availablePeriod}`,
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Conteudo" title="Inclusoes e escopo" description={selectedPackage.fullDescription} className="rounded-[26px]">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-100">Inclui</div>
                    {selectedPackage.includes.map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-100">Nao inclui</div>
                    {selectedPackage.excludes.map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                    ))}
                  </div>
                </div>
              </BaseCardV3>
            </div>

            <div className="space-y-4">
              <BaseCardV3 eyebrow="Previa visual" title="Vitrine local" description="Leitura premium de como o pacote se organiza no ecossistema." className="rounded-[26px]">
                <div className="rounded-[22px] border border-white/8 bg-[linear-gradient(160deg,rgba(249,115,22,0.12),rgba(255,255,255,0.02))] p-5">
                  <div className="text-lg font-semibold text-zinc-50">{selectedPackage.name}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{selectedPackage.destination} • {selectedPackage.duration}</div>
                  <div className="mt-4 text-2xl font-semibold text-zinc-50">{formatCurrency(selectedPackage.price)}</div>
                </div>
              </BaseCardV3>

              <div className="flex flex-wrap gap-2">
                <AgencyRebuildActionButton actionType="modal" label="Editar" className="rounded-full" onAction={() => openEditPackage(selectedPackage)} />
                <AgencyRebuildActionButton actionType="api" label="Duplicar" className="rounded-full" onAction={() => duplicatePackage(selectedPackage.id)} />
                <AgencyRebuildActionButton actionType="api" label={selectedPackage.published ? "Despublicar" : "Publicar"} variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => togglePublish(selectedPackage.id)} />
                <AgencyRebuildActionButton actionType="api" label={selectedPackage.featured ? "Remover destaque" : "Destacar"} variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => toggleFeatured(selectedPackage.id)} />
                <AgencyRebuildActionButton actionType="future" label="Copiar link" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="O link publico do pacote sera conectado depois." />
                <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/[0.06] text-rose-100" onAction={() => removePackage(selectedPackage.id)} />
              </div>
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
