"use client"

import { useMemo, useState } from "react"
import { CalendarRange, Layers3, TrendingUp, UserRoundPlus, Users2 } from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type TeamTab =
  | "overview"
  | "team"
  | "operations"
  | "responsibilities"
  | "permissions"
  | "agenda"
  | "productivity"
  | "history"

type MemberStatus = "Online" | "Ausente" | "Ocupado" | "Offline"
type AccessLevel = "Master" | "Administrador" | "Gestor" | "Operacional" | "Financeiro" | "Consultor" | "Suporte" | "Personalizado"
type TeamSector = "Comercial" | "Operacao" | "Financeiro" | "Relacionamento" | "Suporte" | "Diretoria"

type MemberRecord = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  function: string
  sector: TeamSector
  accessLevel: AccessLevel
  permissions: string[]
  status: MemberStatus
  openTasks: number
  activeOperations: number
  lastAccess: string
  tags: string[]
  notes: string
  online: boolean
  productivity: {
    completedTasks: number
    completedOperations: number
    averageResponse: string
  }
}

type TeamOperation = {
  id: string
  title: string
  ownerId: string
  priority: "Baixa" | "Media" | "Alta" | "Critica"
  dueDate: string
  status: "Aberto" | "Em andamento" | "Aguardando" | "Concluido" | "Arquivado"
  module: string
}

type MemberFormState = {
  name: string
  email: string
  phone: string
  role: string
  function: string
  sector: TeamSector
  accessLevel: AccessLevel
  permissions: string[]
  status: MemberStatus
  notes: string
  tags: string
}

const permissionOptions = [
  "Financeiro",
  "Creditos",
  "Documentos",
  "Relatorios",
  "Catalogo",
  "Equipe",
  "Expansoes",
  "Operacoes",
]

const teamSeed: MemberRecord[] = [
  {
    id: "member-1",
    name: "Marina Alves",
    email: "marina@travelpro.com",
    phone: "+55 54 99999-1001",
    role: "Fundadora",
    function: "Direcao operacional",
    sector: "Diretoria",
    accessLevel: "Administrador",
    permissions: ["Financeiro", "Documentos", "Relatorios", "Catalogo", "Equipe", "Expansoes", "Operacoes", "Creditos"],
    status: "Online",
    openTasks: 4,
    activeOperations: 2,
    lastAccess: "Agora",
    tags: ["lideranca", "premium"],
    notes: "Coordena operacao premium e estrategia comercial.",
    online: true,
    productivity: { completedTasks: 28, completedOperations: 11, averageResponse: "18 min" },
  },
  {
    id: "member-2",
    name: "Time Comercial",
    email: "comercial@travelpro.com",
    phone: "+55 11 97777-2233",
    role: "Equipe comercial",
    function: "Leads e conversao",
    sector: "Comercial",
    accessLevel: "Consultor",
    permissions: ["Documentos", "Catalogo", "Operacoes"],
    status: "Ocupado",
    openTasks: 6,
    activeOperations: 3,
    lastAccess: "Ha 12 min",
    tags: ["follow-up"],
    notes: "Foco em leads quentes e cotacoes.",
    online: true,
    productivity: { completedTasks: 21, completedOperations: 7, averageResponse: "26 min" },
  },
  {
    id: "member-3",
    name: "Operacao Premium",
    email: "operacao@travelpro.com",
    phone: "+55 51 98888-3344",
    role: "Especialista",
    function: "Viagens e documentos",
    sector: "Operacao",
    accessLevel: "Operacional",
    permissions: ["Documentos", "Operacoes", "Relatorios"],
    status: "Online",
    openTasks: 5,
    activeOperations: 4,
    lastAccess: "Agora",
    tags: ["embarques", "documentos"],
    notes: "Cuida de roteiros, vouchers e embarques.",
    online: true,
    productivity: { completedTasks: 34, completedOperations: 15, averageResponse: "14 min" },
  },
  {
    id: "member-4",
    name: "Financeiro Base",
    email: "financeiro@travelpro.com",
    phone: "+55 54 96666-4455",
    role: "Analista",
    function: "Recebimentos e conciliacao",
    sector: "Financeiro",
    accessLevel: "Financeiro",
    permissions: ["Financeiro", "Creditos", "Relatorios", "Operacoes"],
    status: "Ausente",
    openTasks: 2,
    activeOperations: 1,
    lastAccess: "Ha 1h",
    tags: ["caixa"],
    notes: "Leitura de pagamentos e comprovantes.",
    online: false,
    productivity: { completedTasks: 19, completedOperations: 8, averageResponse: "32 min" },
  },
]

const teamOperationSeed: TeamOperation[] = [
  { id: "team-op-1", title: "Resolver embarque Roma", ownerId: "member-3", priority: "Critica", dueDate: "2026-05-26", status: "Em andamento", module: "Viagens" },
  { id: "team-op-2", title: "Revisar follow-up VIP", ownerId: "member-2", priority: "Alta", dueDate: "2026-05-26", status: "Aberto", module: "Clientes" },
  { id: "team-op-3", title: "Conferir comprovante financeiro", ownerId: "member-4", priority: "Media", dueDate: "2026-05-27", status: "Aguardando", module: "Financeiro" },
]

function emptyMemberForm(): MemberFormState {
  return {
    name: "",
    email: "",
    phone: "",
    role: "",
    function: "",
    sector: "Operacao",
    accessLevel: "Operacional",
    permissions: ["Documentos", "Operacoes"],
    status: "Online",
    notes: "",
    tags: "",
  }
}

function statusTone(status: MemberStatus | TeamOperation["status"]) {
  if (status === "Online" || status === "Concluido") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Ocupado" || status === "Em andamento") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Ausente" || status === "Aguardando") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (status === "Offline" || status === "Arquivado") return "border-white/10 bg-white/[0.03] text-muted-foreground"
  return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
}

function priorityTone(priority: TeamOperation["priority"]) {
  if (priority === "Critica") return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
  if (priority === "Alta") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (priority === "Media") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildTeamWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<TeamTab>("overview")
  const [members, setMembers] = useState<MemberRecord[]>(teamSeed)
  const [operations, setOperations] = useState<TeamOperation[]>(teamOperationSeed)
  const [memberOpen, setMemberOpen] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [form, setForm] = useState<MemberFormState>(emptyMemberForm())
  const [filters, setFilters] = useState({
    role: "all",
    sector: "all",
    status: "all",
    permission: "all",
    online: "all",
    productivity: "all",
    responsible: "all",
    period: "today",
  })

  const selectedMember = useMemo(() => members.find((member) => member.id === memberId) ?? null, [memberId, members])
  const memberLookup = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member])), [members])

  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        if (filters.role !== "all" && member.role !== filters.role) return false
        if (filters.sector !== "all" && member.sector !== filters.sector) return false
        if (filters.status !== "all" && member.status !== filters.status) return false
        if (filters.permission !== "all" && !member.permissions.includes(filters.permission)) return false
        if (filters.online === "yes" && !member.online) return false
        if (filters.online === "no" && member.online) return false
        if (filters.productivity === "high" && member.productivity.completedTasks < 25) return false
        return true
      }),
    [filters, members],
  )

  const activeMembers = members.length
  const onlineNow = members.filter((member) => member.online).length
  const openTasks = members.reduce((sum, member) => sum + member.openTasks, 0)
  const activeOperations = members.reduce((sum, member) => sum + member.activeOperations, 0)

  const saveMember = () => {
    if (!form.name || !form.email || !form.role) {
      toast({ title: "Complete os dados do membro", description: "Nome, email e cargo precisam estar preenchidos." })
      return
    }

    setMembers((current) => [
      {
        id: `member-${Date.now()}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        function: form.function,
        sector: form.sector,
        accessLevel: form.accessLevel,
        permissions: form.permissions,
        status: form.status,
        openTasks: 0,
        activeOperations: 0,
        lastAccess: "Agora",
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
        notes: form.notes,
        online: form.status === "Online" || form.status === "Ocupado",
        productivity: { completedTasks: 0, completedOperations: 0, averageResponse: "Sem base" },
      },
      ...current,
    ])
    setForm(emptyMemberForm())
    setMemberOpen(false)
    toast({ title: "Membro adicionado", description: "O novo colaborador foi incluído localmente na V3." })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Equipe"
        description="Colaboradores, responsabilidades, produtividade e operacao da agencia."
        contentClassName="sm:max-w-[1360px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Membros ativos", value: String(activeMembers) },
                  { label: "Online agora", value: String(onlineNow) },
                  { label: "Tarefas abertas", value: String(openTasks) },
                  { label: "Operacoes em andamento", value: String(activeOperations) },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Adicionar membro" className="rounded-full" onAction={() => setMemberOpen(true)} />
                <AgencyRebuildActionButton actionType="future" label="Criar equipe" className="rounded-full" futureMessage="A criação de equipes estruturadas será conectada depois." />
                <AgencyRebuildActionButton actionType="modal" label="Definir permissoes" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setTab("permissions")} />
                <AgencyRebuildActionButton actionType="future" label="Convidar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="O convite real por email será ativado depois." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as TeamTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="team">Equipe</TabsTrigger>
                <TabsTrigger value="operations">Operacoes</TabsTrigger>
                <TabsTrigger value="responsibilities">Responsabilidades</TabsTrigger>
                <TabsTrigger value="permissions">Permissoes</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="productivity">Produtividade</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Membros ativos", value: String(activeMembers), note: "Time vivo acompanhando operacao e clientes." },
                    { label: "Online agora", value: String(onlineNow), note: "Disponibilidade real do momento." },
                    { label: "Tarefas abertas", value: String(openTasks), note: "Fila operacional do time." },
                    { label: "Operacoes em andamento", value: String(activeOperations), note: "Frentes vivas distribuidas pela equipe." },
                    { label: "Lideres / equipes", value: "3", note: "Direcao, comercial e operacao premium." },
                    { label: "Pendencias do time", value: "5", note: "Pontos que pedem alinhamento hoje." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <BaseCardV3 eyebrow="Movimento da equipe" title="Quem está puxando a operação agora" description="Uma leitura viva de pessoas, filas e sinais operacionais." className="rounded-[28px]">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {[
                      "Operacao Premium concentra embarques e documentos sensiveis.",
                      "Time Comercial tem follow-ups quentes em janela curta.",
                      "Financeiro aguarda comprovacao em dois recebimentos.",
                      "Viagens proximas estao distribuídas entre operacao e lideranca.",
                      "Alertas internos pedem redistribuicao leve de foco.",
                      "Clientes VIP seguem com proximos passos definidos hoje.",
                    ].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </BaseCardV3>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-8">
                  <Select value={filters.role} onValueChange={(value) => setFilters((current) => ({ ...current, role: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cargo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cargo</SelectItem>
                      {Array.from(new Set(members.map((member) => member.role))).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.sector} onValueChange={(value) => setFilters((current) => ({ ...current, sector: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Equipe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Equipe</SelectItem>
                      {["Comercial", "Operacao", "Financeiro", "Relacionamento", "Suporte", "Diretoria"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Status</SelectItem>
                      {["Online", "Ausente", "Ocupado", "Offline"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.permission} onValueChange={(value) => setFilters((current) => ({ ...current, permission: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Permissoes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Permissoes</SelectItem>
                      {permissionOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.online} onValueChange={(value) => setFilters((current) => ({ ...current, online: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Online" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Online?</SelectItem>
                      <SelectItem value="yes">Online</SelectItem>
                      <SelectItem value="no">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.productivity} onValueChange={(value) => setFilters((current) => ({ ...current, productivity: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Produtividade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Produtividade</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.responsible} onValueChange={(value) => setFilters((current) => ({ ...current, responsible: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Responsavel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Responsavel</SelectItem>
                      {members.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.period} onValueChange={(value) => setFilters((current) => ({ ...current, period: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Periodo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="7d">7 dias</SelectItem>
                      <SelectItem value="30d">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredMembers.map((member) => (
                  <div key={member.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[0.8fr_1fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_1fr]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold text-zinc-100">
                            {member.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-100">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{member.function}</div>
                        <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(member.status)}`} variant="outline">{member.status}</Badge></div>
                        <div className="text-sm text-muted-foreground">{member.openTasks} tarefas</div>
                        <div className="text-sm text-muted-foreground">{member.activeOperations} operacoes</div>
                        <div className="text-sm text-muted-foreground">{member.lastAccess}</div>
                        <div className="text-sm text-muted-foreground">{member.accessLevel}</div>
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.slice(0, 2).map((item) => (
                            <Badge key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px]" variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="modal" label="Perfil" className="h-8 rounded-full px-3 text-xs" onAction={() => setMemberId(member.id)} />
                        <AgencyRebuildActionButton actionType="api" label="Permissoes" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setMembers((current) => current.map((entry) => (entry.id === member.id ? { ...entry, permissions: entry.permissions.includes("Expansoes") ? entry.permissions.filter((item) => item !== "Expansoes") : [...entry.permissions, "Expansoes"] } : entry)))
                          toast({ title: "Permissoes atualizadas", description: "A camada de acesso foi ajustada localmente." })
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Atribuir operacao" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setOperations((current) => [
                            {
                              id: `team-op-${Date.now()}`,
                              title: `Nova frente para ${member.name}`,
                              ownerId: member.id,
                              priority: "Media",
                              dueDate: "2026-05-27",
                              status: "Aberto",
                              module: "Operacional",
                            },
                            ...current,
                          ])
                          toast({ title: "Operacao atribuida", description: "A nova frente entrou localmente na fila da equipe." })
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Desativar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setMembers((current) => current.map((entry) => (entry.id === member.id ? { ...entry, status: "Offline", online: false } : entry)))
                          toast({ title: "Membro desativado", description: "O status do membro foi movido localmente para offline." })
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Remover" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setMembers((current) => current.filter((entry) => entry.id !== member.id))
                          toast({ title: "Membro removido", description: "O membro saiu da lista localmente." })
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="operations" className="space-y-3">
                {operations.map((item) => {
                  const owner = memberLookup[item.ownerId]
                  return (
                    <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr]">
                          <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{owner?.name ?? "Nao atribuido"}</div>
                          <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${priorityTone(item.priority)}`} variant="outline">{item.priority}</Badge></div>
                          <div className="text-sm text-muted-foreground">{item.dueDate}</div>
                          <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                          <div className="text-sm text-muted-foreground">{item.module}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <AgencyRebuildActionButton actionType="api" label="Concluir" className="h-8 rounded-full px-3 text-xs" onAction={() => {
                            setOperations((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "Concluido" } : entry)))
                            toast({ title: "Operacao concluida", description: "A operacao da equipe foi concluida localmente." })
                          }} />
                          <AgencyRebuildActionButton actionType="api" label="Reatribuir" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                            const nextOwner = members.find((member) => member.id !== item.ownerId)
                            if (!nextOwner) return
                            setOperations((current) => current.map((entry) => (entry.id === item.id ? { ...entry, ownerId: nextOwner.id } : entry)))
                            toast({ title: "Operacao reatribuida", description: `A operacao agora esta com ${nextOwner.name}.` })
                          }} />
                          <AgencyRebuildActionButton actionType="future" label="Editar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A edicao detalhada da operacao sera liberada depois." />
                          <AgencyRebuildActionButton actionType="api" label="Arquivar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                            setOperations((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "Arquivado" } : entry)))
                            toast({ title: "Operacao arquivada", description: "A operacao foi arquivada localmente." })
                          }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>

              <TabsContent value="responsibilities" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Leads", "Time Comercial"],
                    ["Financeiro", "Financeiro Base"],
                    ["Viagens", "Operacao Premium"],
                    ["Documentos", "Operacao Premium"],
                    ["Roteiros", "Operacao Premium"],
                    ["Suporte", "Marina Alves"],
                    ["Operacao", "Marina Alves"],
                    ["Atendimento", "Time Comercial"],
                  ].map(([area, owner]) => (
                    <BaseCardV3 key={area} eyebrow="Responsabilidade" title={area} description={owner} className="rounded-[26px]" actions={<Layers3 className="h-4 w-4 text-primary" />}>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px]" variant="outline">
                          Operacao viva
                        </Badge>
                      </div>
                    </BaseCardV3>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  {members.map((member) => (
                    <BaseCardV3 key={member.id} eyebrow={member.accessLevel} title={member.name} description={`${member.role} • ${member.function}`} className="rounded-[26px]">
                      <div className="flex flex-wrap gap-2">
                        {permissionOptions.map((permission) => {
                          const enabled = member.permissions.includes(permission)
                          return (
                            <button
                              key={permission}
                              type="button"
                              onClick={() => {
                                setMembers((current) =>
                                  current.map((entry) =>
                                    entry.id === member.id
                                      ? {
                                          ...entry,
                                          permissions: enabled ? entry.permissions.filter((item) => item !== permission) : [...entry.permissions, permission],
                                        }
                                      : entry,
                                  ),
                                )
                              }}
                              className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                                enabled
                                  ? "border-primary/20 bg-primary/[0.12] text-primary-foreground"
                                  : "border-white/10 bg-white/[0.03] text-muted-foreground"
                              }`}
                            >
                              {permission}
                            </button>
                          )
                        })}
                      </div>
                    </BaseCardV3>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="agenda" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {[
                    ["Tarefas do dia", "8 blocos"],
                    ["Reunioes", "2 conversas internas"],
                    ["Follow-ups", "4 retornos"],
                    ["Viagens", "3 partidas proximas"],
                    ["Entregas", "5 documentos e roteiros"],
                  ].map(([title, note]) => (
                    <BaseCardV3 key={title} eyebrow="Agenda" title={title} description={note} className="rounded-[26px]" actions={<CalendarRange className="h-4 w-4 text-primary" />} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="productivity" className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-3">
                  {members.map((member) => (
                    <BaseCardV3 key={member.id} eyebrow="Produtividade" title={member.name} description={`${member.productivity.completedTasks} tarefas concluidas • ${member.productivity.completedOperations} operacoes finalizadas`} className="rounded-[26px]" actions={<TrendingUp className="h-4 w-4 text-primary" />}>
                      <div className="text-xs text-muted-foreground">Tempo medio visual: {member.productivity.averageResponse}</div>
                    </BaseCardV3>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {[
                  "Marina Alves teve permissao de Expansoes revisada.",
                  "Operacao Premium recebeu uma nova frente de embarque.",
                  "Time Comercial concluiu um follow-up critico.",
                  "Financeiro Base mudou de ausente para offline.",
                  "Novo membro local foi criado no preview da V3.",
                ].map((item) => (
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
        open={memberOpen}
        onOpenChange={setMemberOpen}
        title="Adicionar membro"
        description="Fluxo local da V3 para montar o time da agencia com responsabilidades e acesso inicial."
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setMemberOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Salvar localmente" className="rounded-full" onAction={saveMember} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Nome" />
          <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Email" />
          <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Telefone / WhatsApp" />
          <Input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Cargo" />
          <Input value={form.function} onChange={(event) => setForm((current) => ({ ...current, function: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Funcao operacional" />
          <Select value={form.sector} onValueChange={(value) => setForm((current) => ({ ...current, sector: value as TeamSector }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Equipe / setor" /></SelectTrigger>
            <SelectContent>
              {["Comercial", "Operacao", "Financeiro", "Relacionamento", "Suporte", "Diretoria"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.accessLevel} onValueChange={(value) => setForm((current) => ({ ...current, accessLevel: value as AccessLevel }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Nivel de acesso" /></SelectTrigger>
            <SelectContent>
              {["Master", "Administrador", "Gestor", "Operacional", "Financeiro", "Consultor", "Suporte", "Personalizado"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as MemberStatus }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {["Online", "Ausente", "Ocupado", "Offline"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="md:col-span-2">
            <div className="rounded-[20px] border border-white/8 bg-black/14 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Permissoes iniciais</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {permissionOptions.map((permission) => {
                  const enabled = form.permissions.includes(permission)
                  return (
                    <button
                      key={permission}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          permissions: enabled ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission],
                        }))
                      }
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                        enabled
                          ? "border-primary/20 bg-primary/[0.12] text-primary-foreground"
                          : "border-white/10 bg-white/[0.03] text-muted-foreground"
                      }`}
                    >
                      {permission}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Tags separadas por virgula" />
          </div>
          <div className="md:col-span-2">
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[120px] rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Observacoes e contexto do membro." />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedMember)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setMemberId(null)
        }}
        title={selectedMember?.name ?? "Perfil do membro"}
        description="Dados principais, permissoes, tarefas, operacoes, produtividade e historico."
        contentClassName="sm:max-w-5xl"
        footer={
          selectedMember ? (
            <>
              <AgencyRebuildActionButton actionType="future" label="Redefinir acesso" className="rounded-full" futureMessage="A redefinicao real de acesso sera conectada depois." />
              <AgencyRebuildActionButton actionType="api" label="Desativar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => {
                setMembers((current) => current.map((entry) => (entry.id === selectedMember.id ? { ...entry, status: "Offline", online: false } : entry)))
                toast({ title: "Membro desativado", description: "O perfil foi movido localmente para offline." })
              }} />
              <AgencyRebuildActionButton actionType="api" label="Remover" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => {
                setMembers((current) => current.filter((entry) => entry.id !== selectedMember.id))
                setMemberId(null)
                toast({ title: "Membro removido", description: "O perfil saiu da equipe localmente." })
              }} />
            </>
          ) : null
        }
      >
        {selectedMember ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <BaseCardV3 eyebrow="Cargo" title={selectedMember.role} description={selectedMember.function} className="rounded-[24px] p-4" actions={<Users2 className="h-4 w-4 text-primary" />} />
              <BaseCardV3 eyebrow="Equipe" title={selectedMember.sector} description={`Status: ${selectedMember.status}`} className="rounded-[24px] p-4" actions={<UserRoundPlus className="h-4 w-4 text-primary" />} />
              <BaseCardV3 eyebrow="Produtividade" title={`${selectedMember.productivity.completedTasks} tarefas`} description={`${selectedMember.productivity.completedOperations} operacoes • ${selectedMember.productivity.averageResponse}`} className="rounded-[24px] p-4" actions={<TrendingUp className="h-4 w-4 text-primary" />} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <BaseCardV3 eyebrow="Permissoes" title={selectedMember.accessLevel} description="Acessos visuais da V3 para este perfil." className="rounded-[26px]">
                <div className="flex flex-wrap gap-2">
                  {permissionOptions.map((permission) => {
                    const enabled = selectedMember.permissions.includes(permission)
                    return (
                      <button
                        key={permission}
                        type="button"
                        onClick={() => {
                          setMembers((current) =>
                            current.map((entry) =>
                              entry.id === selectedMember.id
                                ? {
                                    ...entry,
                                    permissions: enabled ? entry.permissions.filter((item) => item !== permission) : [...entry.permissions, permission],
                                  }
                                : entry,
                            ),
                          )
                        }}
                        className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                          enabled
                            ? "border-primary/20 bg-primary/[0.12] text-primary-foreground"
                            : "border-white/10 bg-white/[0.03] text-muted-foreground"
                        }`}
                      >
                        {permission}
                      </button>
                    )
                  })}
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Observacoes" title="Contexto do membro" description={selectedMember.notes || "Sem observacoes adicionais."} className="rounded-[26px]">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Email: {selectedMember.email}</div>
                  <div>Telefone: {selectedMember.phone}</div>
                  <div>Ultimo acesso: {selectedMember.lastAccess}</div>
                  <div>Tags: {selectedMember.tags.join(", ") || "Sem tags"}</div>
                </div>
              </BaseCardV3>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <BaseCardV3 eyebrow="Operacoes vinculadas" title="Fila atual" description="Frentes atribuidas a este membro." className="rounded-[26px]">
                <div className="space-y-2">
                  {operations.filter((operation) => operation.ownerId === selectedMember.id).map((operation) => (
                    <div key={operation.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
                      {operation.title} • {operation.module} • {operation.status}
                    </div>
                  ))}
                </div>
              </BaseCardV3>
              <BaseCardV3 eyebrow="Historico" title="Ultimos movimentos" description="Linha local de eventos e mudancas no perfil." className="rounded-[26px]">
                <div className="space-y-2">
                  {[
                    "Permissao de operacoes revisada.",
                    "Nova frente atribuida para hoje.",
                    "Status alterado no painel da equipe.",
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </BaseCardV3>
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
