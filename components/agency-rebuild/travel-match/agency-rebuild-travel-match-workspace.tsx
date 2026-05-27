"use client"

import { useMemo, useState } from "react"
import { Search, Store } from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type TravelMatchTab =
  | "overview"
  | "packages"
  | "search"
  | "leads"
  | "categories"
  | "agency"
  | "highlights"
  | "preview"
  | "history"

type MatchPackage = {
  id: string
  name: string
  destination: string
  category: string
  price: number
  status: "Publicado" | "Pausado" | "Rascunho"
  match: number
  views: number
  leads: number
  featured: boolean
  agency: string
  reason: string
}

type MatchLead = {
  id: string
  name: string
  interest: string
  packageName: string
  source: string
  match: number
  status: "Novo" | "Em contato" | "Cotacao criada" | "Descartado"
  date: string
}

type MatchCategory = {
  id: string
  name: string
  active: boolean
  featured: boolean
}

const packageSeed: MatchPackage[] = [
  {
    id: "match-1",
    name: "Nevada Signature",
    destination: "Bariloche",
    category: "Premium",
    price: 14900,
    status: "Publicado",
    match: 92,
    views: 482,
    leads: 16,
    featured: true,
    agency: "Horizonte Viagens",
    reason: "Alinha inverno premium, casal e faixa de investimento.",
  },
  {
    id: "match-2",
    name: "Disney Family Flow",
    destination: "Orlando",
    category: "Disney",
    price: 18900,
    status: "Publicado",
    match: 88,
    views: 630,
    leads: 22,
    featured: false,
    agency: "Horizonte Viagens",
    reason: "Conecta familia, parques e estrutura para duas criancas.",
  },
  {
    id: "match-3",
    name: "Caribe Honeymoon Club",
    destination: "Punta Cana",
    category: "Lua de mel",
    price: 19800,
    status: "Pausado",
    match: 84,
    views: 214,
    leads: 9,
    featured: false,
    agency: "Horizonte Viagens",
    reason: "Entrega resort, clima romantico e budget premium.",
  },
]

const leadSeed: MatchLead[] = [
  {
    id: "lead-match-1",
    name: "Ana e Caio",
    interest: "Lua de mel no Caribe ate R$ 20 mil",
    packageName: "Caribe Honeymoon Club",
    source: "Buscador inteligente",
    match: 91,
    status: "Novo",
    date: "Hoje, 10:42",
  },
  {
    id: "lead-match-2",
    name: "Familia Martins",
    interest: "Disney com duas criancas em janeiro",
    packageName: "Disney Family Flow",
    source: "Categoria Disney",
    match: 87,
    status: "Em contato",
    date: "Ontem, 17:10",
  },
]

const categorySeed: MatchCategory[] = [
  { id: "disney", name: "Disney", active: true, featured: true },
  { id: "nacional", name: "Nacional", active: true, featured: false },
  { id: "internacional", name: "Internacional", active: true, featured: true },
  { id: "honeymoon", name: "Lua de mel", active: true, featured: true },
  { id: "family", name: "Familia", active: true, featured: false },
  { id: "cruise", name: "Cruzeiros", active: false, featured: false },
  { id: "premium", name: "Premium", active: true, featured: true },
  { id: "promotions", name: "Promocoes", active: true, featured: false },
]

const historyItems = [
  "Pacote Nevada Signature publicado no Match com destaque de inverno.",
  "Busca compativel gerou lead para Disney Family Flow.",
  "Perfil publico da agencia atualizado com especialidade em premium e familia.",
  "Solicitacao de destaque enviada para a campanha de inverno.",
]

export function AgencyRebuildTravelMatchWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<TravelMatchTab>("overview")
  const [packages, setPackages] = useState(packageSeed)
  const [leads, setLeads] = useState(leadSeed)
  const [categories, setCategories] = useState(categorySeed)
  const [query, setQuery] = useState("Quero uma viagem para neve em julho para casal ate R$ 15 mil")
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(packageSeed[0].id)
  const [agencyProfile, setAgencyProfile] = useState({
    publicName: "Horizonte Viagens",
    city: "Bento Goncalves / RS",
    specialties: "Lua de mel, premium, familia e neve",
    shortDescription: "Agencia curada para jornadas premium, familia e experiencias com alto potencial de match.",
    whatsapp: "+55 54 99999-1001",
    approval: "Em analise premium",
    verification: "Selo em preparacao",
    participation: "Plano Scale + destaque sazonal",
  })

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) ?? packages[0],
    [packages, selectedPackageId],
  )

  const searchResults = useMemo(() => {
    const normalized = query.toLowerCase()

    return packages
      .map((item) => {
        let score = item.match
        if (normalized.includes("lua de mel") && item.category === "Lua de mel") score += 6
        if (normalized.includes("disney") && item.category === "Disney") score += 6
        if (normalized.includes("neve") && item.destination === "Bariloche") score += 8
        if (normalized.includes("familia") && item.category === "Disney") score += 4
        return { ...item, matchScore: Math.min(99, score) }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [packages, query])

  const toggleCategory = (id: string) => {
    setCategories((current) => current.map((item) => (item.id === id ? { ...item, active: !item.active } : item)))
    toast({
      title: "Categoria atualizada",
      description: "A mudanca foi aplicada localmente na central do Travel Match.",
    })
  }

  const toggleFeaturedCategory = (id: string) => {
    setCategories((current) => current.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)))
    toast({
      title: "Categoria destacada",
      description: "O destaque foi ajustado localmente no preview da V3.",
    })
  }

  const togglePackageState = (id: string, mode: "publish" | "pause" | "feature") => {
    setPackages((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        if (mode === "publish") {
          return {
            ...item,
            status: item.status === "Publicado" ? "Pausado" : "Publicado",
          }
        }
        if (mode === "pause") {
          return {
            ...item,
            status: "Pausado",
          }
        }
        return {
          ...item,
          featured: !item.featured,
        }
      }),
    )

    toast({
      title: "Travel Match atualizado",
      description: "A publicacao foi ajustada localmente na central de marketplace.",
    })
  }

  const simulateSearch = () => {
    const bestMatch = searchResults[0]

    if (bestMatch) {
      const newLead: MatchLead = {
        id: `lead-match-${Date.now()}`,
        name: "Lead de simulacao",
        interest: query,
        packageName: bestMatch.name,
        source: "Simulador interno",
        match: bestMatch.matchScore,
        status: "Novo",
        date: "Agora",
      }

      setLeads((current) => [newLead, ...current])
    }

    toast({
      title: "Busca simulada",
      description: "Resultados e lead potencial foram atualizados localmente no workspace.",
    })
  }

  const handleLeadAction = (id: string, nextStatus: MatchLead["status"]) => {
    setLeads((current) => current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)))
    toast({
      title: "Lead atualizado",
      description: "A acao foi registrada localmente no Travel Match.",
    })
  }

  return (
    <BaseModalV3
      open={open}
      onOpenChange={onOpenChange}
      title="Travel Match"
      description="Marketplace inteligente para divulgar pacotes e conectar viajantes as agencias certas."
      size="xl"
    >
      {/* TODO: conectar com o marketplace publico real do Travel Match. */}
      {/* TODO: conectar pacotes reais da agencia, leads gerados e status de aprovacao. */}
      <Tabs value={tab} onValueChange={(value) => setTab(value as TravelMatchTab)} className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <BaseCardV3
            eyebrow="Marketplace inteligente"
            title="Travel Match"
            description="Central para publicar pacotes, acompanhar match e transformar busca publica em oportunidade real."
            className="rounded-[30px]"
            footer={
              <>
                <AgencyRebuildActionButton actionType="modal" label="Publicar pacote" className="h-9 rounded-full px-4 text-xs" onAction={() => toast({ title: "Publicacao preparada", description: "Fluxo local pronto para conectar os pacotes reais depois." })} />
                <AgencyRebuildActionButton actionType="future" label="Ver marketplace" variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs" futureMessage="A vitrine publica real sera conectada na proxima etapa do Travel Match." />
                <AgencyRebuildActionButton actionType="modal" label="Simular busca" variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs" onAction={simulateSearch} />
                <AgencyRebuildActionButton actionType="modal" label="Configurar vitrine" variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs" onAction={() => setTab("agency")} />
                <AgencyRebuildActionButton actionType="future" label="Solicitar destaque" variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs" futureMessage="Impulsionamento e destaque real serao conectados ao marketplace depois." />
              </>
            }
          >
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {[
                { label: "Pacotes publicados", value: `${packages.filter((item) => item.status === "Publicado").length}` },
                { label: "Leads gerados", value: `${leads.length}` },
                { label: "Visualizacoes", value: `${packages.reduce((sum, item) => sum + item.views, 0)}` },
                { label: "Taxa de match", value: `${Math.round(packages.reduce((sum, item) => sum + item.match, 0) / packages.length)}%` },
                { label: "Agencias / destinos", value: `1 / ${new Set(packages.map((item) => item.destination)).size}` },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </BaseCardV3>

          <BaseCardV3
            eyebrow="Oportunidades reais"
            title="Leitura viva do Match"
            description="Buscas recentes, categorias em alta e pacotes com maior aderencia para gerar conversa."
            className="rounded-[30px]"
          >
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">Buscas recentes mostram neve, Disney e lua de mel como trilhas mais aquecidas.</div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">Nevada Signature e Disney Family Flow lideram match medio e geracao de leads.</div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">Categorias Premium e Internacional seguem com melhor taxa de clique para WhatsApp.</div>
            </div>
          </BaseCardV3>
        </div>

        <TabsList className="h-auto w-full justify-start gap-2 rounded-[24px] border border-white/8 bg-black/18 p-1.5">
          <TabsTrigger value="overview" className="rounded-full px-4 py-2 text-xs">Visão geral</TabsTrigger>
          <TabsTrigger value="packages" className="rounded-full px-4 py-2 text-xs">Pacotes publicados</TabsTrigger>
          <TabsTrigger value="search" className="rounded-full px-4 py-2 text-xs">Buscador inteligente</TabsTrigger>
          <TabsTrigger value="leads" className="rounded-full px-4 py-2 text-xs">Leads gerados</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-full px-4 py-2 text-xs">Categorias</TabsTrigger>
          <TabsTrigger value="agency" className="rounded-full px-4 py-2 text-xs">Agencia no Match</TabsTrigger>
          <TabsTrigger value="highlights" className="rounded-full px-4 py-2 text-xs">Destaques</TabsTrigger>
          <TabsTrigger value="preview" className="rounded-full px-4 py-2 text-xs">Previa publica</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full px-4 py-2 text-xs">Historico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { title: "Pacotes no Match", value: `${packages.length}`, note: "Pacotes elegiveis para a vitrine." },
              { title: "Pacotes publicados", value: `${packages.filter((item) => item.status === "Publicado").length}`, note: "Ja visiveis na camada publica." },
              { title: "Leads recebidos", value: `${leads.length}`, note: "Entradas vindas do buscador e categorias." },
              { title: "Buscas compativeis", value: "42", note: "Intencoes proximas do seu portfolio." },
              { title: "Taxa media de match", value: "88%", note: "Aderencia dos pacotes ao desejo descrito." },
              { title: "Cliques no WhatsApp", value: "61", note: "Sinais reais de interesse." },
            ].map((item) => (
              <BaseCardV3 key={item.title} eyebrow="Resumo" title={item.title} className="rounded-[28px]">
                <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
              </BaseCardV3>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-3">
              {packages.map((item) => (
                <BaseCardV3
                  key={item.id}
                  eyebrow={item.category}
                  title={item.name}
                  description={`${item.destination} • ${item.agency}`}
                  className="rounded-[28px]"
                  actions={<Badge className="rounded-full border border-primary/18 bg-primary/[0.08] px-2 py-0.5 text-[10px]" variant="outline">{item.match}% match</Badge>}
                  footer={
                    <>
                      <AgencyRebuildActionButton actionType="modal" label="Abrir pacote" className="h-8 rounded-full px-3 text-xs" onAction={() => setSelectedPackageId(item.id)} />
                      <AgencyRebuildActionButton actionType="modal" label="Editar publicacao" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => toast({ title: "Publicacao pronta para ajuste", description: "Editor real sera conectado aos pacotes da agencia depois." })} />
                      <AgencyRebuildActionButton actionType="modal" label={item.status === "Publicado" ? "Pausar" : "Publicar"} variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => togglePackageState(item.id, "publish")} />
                      <AgencyRebuildActionButton actionType="modal" label={item.featured ? "Tirar destaque" : "Destacar"} variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => togglePackageState(item.id, "feature")} />
                    </>
                  }
                >
                  <div className="grid gap-3 md:grid-cols-4 text-sm text-muted-foreground">
                    <div><span className="text-foreground">Preco:</span> R$ {item.price.toLocaleString("pt-BR")}</div>
                    <div><span className="text-foreground">Status:</span> {item.status}</div>
                    <div><span className="text-foreground">Views:</span> {item.views}</div>
                    <div><span className="text-foreground">Leads:</span> {item.leads}</div>
                  </div>
                </BaseCardV3>
              ))}
            </div>

            <BaseCardV3 eyebrow="Detalhe do pacote" title={selectedPackage.name} description={selectedPackage.reason} className="rounded-[30px]">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">Destino: {selectedPackage.destination}</div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">Preco: R$ {selectedPackage.price.toLocaleString("pt-BR")}</div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">Visualizacoes: {selectedPackage.views} • Leads: {selectedPackage.leads}</div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">Status no Match: {selectedPackage.status} • Destaque: {selectedPackage.featured ? "Ativo" : "Desligado"}</div>
              </div>
            </BaseCardV3>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <BaseCardV3 eyebrow="Buscador inteligente" title="Descreva a viagem que o cliente procura" description="Simule a experiencia publica do marketplace e veja como os pacotes se conectam ao desejo informado." className="rounded-[30px]">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <div className="rounded-[24px] border border-primary/12 bg-primary/[0.06] p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Search className="h-4 w-4" />
                    <p className="text-sm font-medium">Descreva a viagem que o cliente procura</p>
                  </div>
                  <Textarea value={query} onChange={(event) => setQuery(event.target.value)} className="mt-3 min-h-[110px] rounded-[22px] border-white/10 bg-black/18" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Disney", "Nacional", "Internacional", "Lua de mel", "Familia", "Cruzeiros", "Premium", "Promocoes"].map((chip) => (
                      <Badge key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px]" variant="outline">
                        {chip}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AgencyRebuildActionButton actionType="modal" label="Simular busca" className="h-9 rounded-full px-4 text-xs" onAction={simulateSearch} />
                  <AgencyRebuildActionButton actionType="future" label="Ver como cliente" variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs" futureMessage="A experiencia publica real do Travel Match sera conectada na proxima etapa." />
                </div>
              </div>

              <div className="space-y-3">
                {searchResults.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.destination} • {item.category}</p>
                      </div>
                      <Badge className="rounded-full border border-primary/18 bg-primary/[0.08] px-2 py-0.5 text-[10px]" variant="outline">
                        {item.matchScore}% match
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.agency}</span>
                      <span>R$ {item.price.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BaseCardV3>
        </TabsContent>

        <TabsContent value="leads" className="space-y-3">
          {leads.map((item) => (
            <BaseCardV3
              key={item.id}
              eyebrow={item.packageName}
              title={item.name}
              description={`${item.interest} • ${item.source}`}
              className="rounded-[28px]"
              actions={<Badge className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px]" variant="outline">{item.match}% match</Badge>}
              footer={
                <>
                  <AgencyRebuildActionButton actionType="future" label="Abrir lead" className="h-8 rounded-full px-3 text-xs" futureMessage="A conexao com o lead real sera ativada depois." />
                  <AgencyRebuildActionButton actionType="modal" label="Converter em cliente" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => handleLeadAction(item.id, "Cotacao criada")} />
                  <AgencyRebuildActionButton actionType="modal" label="Marcar retorno" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => handleLeadAction(item.id, "Em contato")} />
                  <AgencyRebuildActionButton actionType="modal" label="Descartar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => handleLeadAction(item.id, "Descartado")} />
                </>
              }
            >
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-4">
                <div>Status: {item.status}</div>
                <div>Origem: {item.source}</div>
                <div>Data: {item.date}</div>
                <div>Acao: cotacao / retorno</div>
              </div>
            </BaseCardV3>
          ))}
        </TabsContent>

        <TabsContent value="categories" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((item) => (
            <BaseCardV3 key={item.id} eyebrow="Categoria" title={item.name} className="rounded-[28px]">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Status: {item.active ? "Ativa" : "Inativa"} • Destaque: {item.featured ? "Ligado" : "Desligado"}</div>
                <div className="flex flex-wrap gap-2">
                  <AgencyRebuildActionButton actionType="modal" label={item.active ? "Desativar" : "Ativar"} className="h-8 rounded-full px-3 text-xs" onAction={() => toggleCategory(item.id)} />
                  <AgencyRebuildActionButton actionType="modal" label={item.featured ? "Tirar destaque" : "Destacar"} variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => toggleFeaturedCategory(item.id)} />
                  <AgencyRebuildActionButton actionType="future" label="Ver pacotes" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A grade publica por categoria sera conectada depois." />
                </div>
              </div>
            </BaseCardV3>
          ))}
        </TabsContent>

        <TabsContent value="agency" className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <BaseCardV3 eyebrow="Agencia no Match" title={agencyProfile.publicName} description="Configuracao publica para aparecer no marketplace." className="rounded-[30px]">
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={agencyProfile.publicName} onChange={(event) => setAgencyProfile((current) => ({ ...current, publicName: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
              <Input value={agencyProfile.city} onChange={(event) => setAgencyProfile((current) => ({ ...current, city: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
              <Input value={agencyProfile.specialties} onChange={(event) => setAgencyProfile((current) => ({ ...current, specialties: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03] md:col-span-2" />
              <Textarea value={agencyProfile.shortDescription} onChange={(event) => setAgencyProfile((current) => ({ ...current, shortDescription: event.target.value }))} className="min-h-[120px] rounded-[22px] border-white/10 bg-white/[0.03] md:col-span-2" />
              <Input value={agencyProfile.whatsapp} onChange={(event) => setAgencyProfile((current) => ({ ...current, whatsapp: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
              <Input value={agencyProfile.participation} onChange={(event) => setAgencyProfile((current) => ({ ...current, participation: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <AgencyRebuildActionButton actionType="modal" label="Editar perfil publico" className="h-9 rounded-full px-4 text-xs" onAction={() => toast({ title: "Perfil publico salvo", description: "A configuracao foi ajustada localmente no preview do Match." })} />
              <AgencyRebuildActionButton actionType="future" label="Solicitar verificacao" variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs" futureMessage="A verificacao real da agencia sera conectada ao marketplace depois." />
              <AgencyRebuildActionButton actionType="future" label="Visualizar agencia" variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs" futureMessage="A pagina publica da agencia sera conectada ao Travel Match real depois." />
            </div>
          </BaseCardV3>

          <BaseCardV3 eyebrow="Status da participacao" title="Selo e aprovacao" className="rounded-[30px]">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">Aprovacao: {agencyProfile.approval}</div>
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">Verificacao: {agencyProfile.verification}</div>
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">Plano: {agencyProfile.participation}</div>
            </div>
          </BaseCardV3>
        </TabsContent>

        <TabsContent value="highlights" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Pacotes em destaque", note: "Nevada Signature e Disney Family Flow lideram atencao." },
            { title: "Categorias em destaque", note: "Premium, Internacional e Lua de mel puxam interesse." },
            { title: "Campanhas em destaque", note: "Inverno e Disney conectam melhor com as buscas recentes." },
            { title: "Selo premium", note: "Impulsionamento futuro sera conectado ao billing e aprovacao." },
          ].map((item) => (
            <BaseCardV3 key={item.title} eyebrow="Destaques" title={item.title} className="rounded-[28px]">
              <p className="text-sm text-muted-foreground">{item.note}</p>
            </BaseCardV3>
          ))}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <BaseCardV3 eyebrow="Previa publica" title="Hero e busca por intencao" description="Uma leitura interna de como a agencia aparecera no marketplace publico." className="rounded-[30px]">
            <div className="rounded-[30px] border border-primary/12 bg-[radial-gradient(circle_at_top_left,rgba(255,140,68,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-primary/72">Marketplace Travel Match</p>
                  <h3 className="mt-3 text-2xl font-semibold text-foreground">Descreva a viagem que voce procura.</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Busca por desejo, categorias e pacotes compativeis para conectar viajantes as agencias certas.</p>
                  <div className="mt-4 rounded-[22px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-muted-foreground">
                    {query}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categories.filter((item) => item.active).slice(0, 6).map((item) => (
                      <Badge key={item.id} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px]" variant="outline">
                        {item.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 xl:w-[340px]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-[18px] border border-primary/18 bg-primary/[0.1] p-2 text-primary">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{agencyProfile.publicName}</p>
                      <p className="text-xs text-muted-foreground">{agencyProfile.city}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{agencyProfile.shortDescription}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {searchResults.slice(0, 3).map((item) => (
                <BaseCardV3 key={item.id} eyebrow={item.category} title={item.name} description={item.destination} className="rounded-[28px]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">R$ {item.price.toLocaleString("pt-BR")}</span>
                    <Badge className="rounded-full border border-primary/18 bg-primary/[0.08] px-2 py-0.5 text-[10px]" variant="outline">
                      {item.matchScore}% match
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>
                </BaseCardV3>
              ))}
            </div>
          </BaseCardV3>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {historyItems.map((item, index) => (
            <div key={item} className="flex gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-primary/18 bg-primary/[0.08] text-[11px] text-primary">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{item}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </BaseModalV3>
  )
}
