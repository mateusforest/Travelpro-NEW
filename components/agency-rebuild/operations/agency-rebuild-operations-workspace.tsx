"use client"

import { useMemo, useState } from "react"
import { CalendarClock, Flag, Siren, Users2 } from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type OperationsTab =
  | "overview"
  | "operations"
  | "tasks"
  | "priorities"
  | "alerts"
  | "agenda"
  | "team"
  | "timeline"
  | "pending"

type PriorityLevel = "Baixa" | "Media" | "Alta" | "Critica"
type OperationStatus = "Aberto" | "Em andamento" | "Aguardando" | "Concluido" | "Atrasado"
type OperationModule = "Viagens" | "Financeiro" | "Documentos" | "Leads" | "Clientes" | "Equipe" | "Operacional"

type OperationRecord = {
  id: string
  title: string
  module: OperationModule
  owner: string
  priority: PriorityLevel
  status: OperationStatus
  dueDate: string
  description: string
  tags: string[]
  notes: string
}

type TaskRecord = {
  id: string
  title: string
  owner: string
  priority: PriorityLevel
  dueDate: string
  module: OperationModule
  status: OperationStatus
}

type AlertRecord = {
  id: string
  title: string
  area: string
  body: string
  status: "Novo" | "Lido" | "Arquivado"
}

type OperationFormState = {
  title: string
  module: OperationModule
  priority: PriorityLevel
  owner: string
  dueDate: string
  description: string
  tags: string
  status: OperationStatus
  notes: string
}

const operationSeed: OperationRecord[] = [
  {
    id: "op-1",
    title: "Revisar embarque Roma",
    module: "Viagens",
    owner: "Marina Alves",
    priority: "Critica",
    status: "Em andamento",
    dueDate: "2026-05-26",
    description: "Conferir documentos, link compartilhavel e horario de embarque.",
    tags: ["embarque", "vip"],
    notes: "Cliente entra em janela curta hoje as 14h.",
  },
  {
    id: "op-2",
    title: "Regularizar recibo pendente",
    module: "Financeiro",
    owner: "Operacao Premium",
    priority: "Alta",
    status: "Aguardando",
    dueDate: "2026-05-27",
    description: "Fechar pendencia de comprovante e marcar recebimento.",
    tags: ["financeiro"],
    notes: "Recebimento sensivel no fim do dia.",
  },
  {
    id: "op-3",
    title: "Retorno casal Grecia",
    module: "Leads",
    owner: "Time Comercial",
    priority: "Alta",
    status: "Aberto",
    dueDate: "2026-05-26",
    description: "Lead quente aguarda proximo contato e nova proposta.",
    tags: ["follow-up"],
    notes: "Sinal de conversao alto.",
  },
]

const taskSeed: TaskRecord[] = [
  { id: "task-1", title: "Enviar voucher final", owner: "Operacao Premium", priority: "Alta", dueDate: "2026-05-26", module: "Documentos", status: "Aberto" },
  { id: "task-2", title: "Atualizar status da viagem", owner: "Marina Alves", priority: "Media", dueDate: "2026-05-27", module: "Viagens", status: "Em andamento" },
  { id: "task-3", title: "Ligar para cliente VIP", owner: "Time Comercial", priority: "Critica", dueDate: "2026-05-26", module: "Clientes", status: "Atrasado" },
]

const alertSeed: AlertRecord[] = [
  { id: "alt-1", title: "Financeiro pendente", area: "Financeiro", body: "Um recebimento sensivel ainda nao foi conciliado.", status: "Novo" },
  { id: "alt-2", title: "Viagem proxima", area: "Viagens", body: "O embarque Roma entra em janela critica nas proximas horas.", status: "Novo" },
  { id: "alt-3", title: "Lead quente sem retorno", area: "Leads", body: "Uma oportunidade premium segue sem contato desde ontem.", status: "Lido" },
]

function emptyOperationForm(): OperationFormState {
  return {
    title: "",
    module: "Operacional",
    priority: "Media",
    owner: "Marina Alves",
    dueDate: "2026-05-27",
    description: "",
    tags: "",
    status: "Aberto",
    notes: "",
  }
}

function statusTone(status: OperationStatus | AlertRecord["status"]) {
  if (status === "Concluido" || status === "Lido") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Atrasado" || status === "Novo") return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
  if (status === "Em andamento") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Aguardando") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

function priorityTone(priority: PriorityLevel) {
  if (priority === "Critica") return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
  if (priority === "Alta") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (priority === "Media") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildOperationsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<OperationsTab>("overview")
  const [operations, setOperations] = useState(operationSeed)
  const [tasks, setTasks] = useState(taskSeed)
  const [alerts, setAlerts] = useState(alertSeed)
  const [operationOpen, setOperationOpen] = useState(false)
  const [form, setForm] = useState<OperationFormState>(emptyOperationForm())
  const [filters, setFilters] = useState({
    priority: "all",
    owner: "all",
    status: "all",
    module: "all",
    period: "today",
    pending: "all",
    critical: "all",
  })

  const filteredOperations = useMemo(
    () =>
      operations.filter((item) => {
        if (filters.priority !== "all" && item.priority !== filters.priority) return false
        if (filters.owner !== "all" && item.owner !== filters.owner) return false
        if (filters.status !== "all" && item.status !== filters.status) return false
        if (filters.module !== "all" && item.module !== filters.module) return false
        if (filters.pending === "yes" && item.status === "Concluido") return false
        if (filters.critical === "yes" && item.priority !== "Critica") return false
        return true
      }),
    [filters, operations],
  )

  const prioritiesCount = operations.filter((item) => ["Alta", "Critica"].includes(item.priority)).length
  const pendingCount = [...operations, ...tasks].filter((item) => item.status !== "Concluido").length
  const activeCount = operations.filter((item) => item.status === "Em andamento").length

  const saveOperation = () => {
    if (!form.title || !form.description) {
      toast({ title: "Complete a operacao", description: "Titulo e descricao precisam estar preenchidos antes de salvar." })
      return
    }

    setOperations((current) => [
      {
        id: `op-${Date.now()}`,
        title: form.title,
        module: form.module,
        owner: form.owner,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate,
        description: form.description,
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
        notes: form.notes,
      },
      ...current,
    ])
    setForm(emptyOperationForm())
    setOperationOpen(false)
    toast({ title: "Operacao criada", description: "A nova operacao foi adicionada localmente ao preview da V3." })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Central Operacional"
        description="Prioridades, tarefas, alertas, operacoes e acompanhamento da agencia."
        contentClassName="sm:max-w-[1360px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Tarefas abertas", value: String(tasks.filter((item) => item.status !== "Concluido").length) },
                  { label: "Prioridades", value: String(prioritiesCount) },
                  { label: "Pendencias", value: String(pendingCount) },
                  { label: "Operacoes em andamento", value: String(activeCount) },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Nova tarefa" className="rounded-full" onAction={() => setTab("tasks")} />
                <AgencyRebuildActionButton actionType="modal" label="Nova operacao" className="rounded-full" onAction={() => setOperationOpen(true)} />
                <AgencyRebuildActionButton
                  actionType="api"
                  label="Criar alerta"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onAction={() => {
                    setAlerts((current) => [
                      {
                        id: `alt-${Date.now()}`,
                        title: "Alerta operacional local",
                        area: "Operacional",
                        body: "O alerta foi criado localmente na central viva da V3.",
                        status: "Novo",
                      },
                      ...current,
                    ])
                    toast({ title: "Alerta criado", description: "O novo alerta operacional foi adicionado localmente." })
                  }}
                />
                <AgencyRebuildActionButton
                  actionType="future"
                  label="Abrir agenda"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  futureMessage="A agenda operacional real sera conectada depois."
                />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as OperationsTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="operations">Operacoes</TabsTrigger>
                <TabsTrigger value="tasks">Tarefas</TabsTrigger>
                <TabsTrigger value="priorities">Prioridades</TabsTrigger>
                <TabsTrigger value="alerts">Alertas</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="team">Equipe</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="pending">Pendencias</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Tarefas abertas", value: String(tasks.filter((item) => item.status !== "Concluido").length), note: "Acoes em fila viva para hoje." },
                    { label: "Prioridades altas", value: String(prioritiesCount), note: "Frentes que pedem atencao imediata." },
                    { label: "Operacoes em andamento", value: String(activeCount), note: "Movimentos acontecendo agora." },
                    { label: "Viagens criticas", value: "3", note: "Embarques e documentos sensiveis." },
                    { label: "Financeiro pendente", value: "2", note: "Recebimentos e comprovantes em aberto." },
                    { label: "Leads aguardando retorno", value: "4", note: "Oportunidades em janela curta." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <BaseCardV3 eyebrow="O que exige atencao agora" title="Frentes vivas da agencia" description="Mais comando operacional e menos dashboard generico." className="rounded-[28px]">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {[
                      "Follow-ups vencidos pedem contato nas proximas horas.",
                      "Documentos pendentes seguram um embarque premium.",
                      "Viagens proximas concentram validacoes finais.",
                      "Pagamentos pendentes afetam checklist e envio de voucher.",
                      "Leads quentes estao prontos para conversao.",
                      "Operacoes atrasadas precisam redistribuicao de foco.",
                    ].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </BaseCardV3>
              </TabsContent>

              <TabsContent value="operations" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                  <Select value={filters.priority} onValueChange={(value) => setFilters((current) => ({ ...current, priority: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Prioridade</SelectItem>
                      {["Baixa", "Media", "Alta", "Critica"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.owner} onValueChange={(value) => setFilters((current) => ({ ...current, owner: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Responsavel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Responsavel</SelectItem>
                      {["Marina Alves", "Operacao Premium", "Time Comercial"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Status</SelectItem>
                      {["Aberto", "Em andamento", "Aguardando", "Concluido", "Atrasado"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.module} onValueChange={(value) => setFilters((current) => ({ ...current, module: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Modulo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Modulo</SelectItem>
                      {["Viagens", "Financeiro", "Documentos", "Leads", "Clientes", "Equipe", "Operacional"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
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
                  <Select value={filters.pending} onValueChange={(value) => setFilters((current) => ({ ...current, pending: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Pendente" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Pendentes?</SelectItem>
                      <SelectItem value="yes">Somente abertas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.critical} onValueChange={(value) => setFilters((current) => ({ ...current, critical: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Critico" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Criticos?</SelectItem>
                      <SelectItem value="yes">Somente criticos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredOperations.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr]">
                        <div className="text-sm font-medium text-zinc-100">{item.title}<div className="mt-1 text-xs text-muted-foreground">{item.description}</div></div>
                        <div className="text-sm text-muted-foreground">{item.module}</div>
                        <div className="text-sm text-muted-foreground">{item.owner}</div>
                        <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${priorityTone(item.priority)}`} variant="outline">{item.priority}</Badge></div>
                        <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                        <div className="text-sm text-muted-foreground">{item.dueDate}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="future" label="Abrir operacao" className="h-8 rounded-full px-3 text-xs" futureMessage="O detalhe operacional profundo sera conectado depois." />
                        <AgencyRebuildActionButton actionType="api" label="Concluir" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setOperations((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "Concluido" } : entry)))
                          toast({ title: "Operacao concluida", description: "A operacao foi encerrada localmente." })
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Reagendar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setOperations((current) => current.map((entry) => (entry.id === item.id ? { ...entry, dueDate: "2026-05-28", status: "Aguardando" } : entry)))
                          toast({ title: "Operacao reagendada", description: "O prazo foi movido localmente para a proxima janela." })
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Arquivar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setOperations((current) => current.filter((entry) => entry.id !== item.id))
                          toast({ title: "Operacao arquivada", description: "A operacao saiu da lista localmente." })
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-3">
                {tasks.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr]">
                        <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.owner}</div>
                        <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${priorityTone(item.priority)}`} variant="outline">{item.priority}</Badge></div>
                        <div className="text-sm text-muted-foreground">{item.dueDate}</div>
                        <div className="text-sm text-muted-foreground">{item.module}</div>
                        <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="api" label="Concluir" className="h-8 rounded-full px-3 text-xs" onAction={() => {
                          setTasks((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "Concluido" } : entry)))
                          toast({ title: "Tarefa concluida", description: "A tarefa foi fechada localmente." })
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Mover prioridade" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setTasks((current) => current.map((entry) => (entry.id === item.id ? { ...entry, priority: entry.priority === "Alta" ? "Media" : "Alta" } : entry)))
                          toast({ title: "Prioridade ajustada", description: "A leitura de prioridade foi atualizada localmente." })
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setTasks((current) => current.filter((entry) => entry.id !== item.id))
                          toast({ title: "Tarefa removida", description: "A tarefa saiu da fila localmente." })
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="priorities" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Alta prioridade", "4 itens vivos agora"],
                    ["Atencao imediata", "2 bloqueios em janela curta"],
                    ["Vencendo hoje", "3 acoes pedem resolucao"],
                    ["Aguardando cliente", "2 retornos e 1 aprovacao"],
                    ["Aguardando pagamento", "2 recebimentos ligados a entrega"],
                    ["Aguardando documento", "1 contrato e 1 voucher"],
                  ].map(([title, note]) => (
                    <BaseCardV3 key={title} eyebrow="Prioridade" title={title} description={note} className="rounded-[26px]" actions={<Flag className="h-4 w-4 text-primary" />} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-3">
                {alerts.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge>
                        <AgencyRebuildActionButton actionType="api" label="Marcar lido" className="h-8 rounded-full px-3 text-xs" onAction={() => {
                          setAlerts((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "Lido" } : entry)))
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Arquivar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setAlerts((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "Arquivado" } : entry)))
                        }} />
                        <AgencyRebuildActionButton actionType="api" label="Resolver" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setAlerts((current) => current.filter((entry) => entry.id !== item.id))
                          toast({ title: "Alerta resolvido", description: "O alerta saiu da fila localmente." })
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="agenda" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Tarefas do dia", "5 blocos"],
                    ["Embarques", "3 janelas"],
                    ["Pagamentos", "2 recebimentos"],
                    ["Retornos", "4 contatos"],
                  ].map(([title, note]) => (
                    <BaseCardV3 key={title} eyebrow="Agenda" title={title} description={note} className="rounded-[26px]" actions={<CalendarClock className="h-4 w-4 text-primary" />} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Marina Alves", "4 tarefas abertas • 2 operacoes"],
                    ["Operacao Premium", "3 tarefas abertas • 1 atraso"],
                    ["Time Comercial", "5 retornos • 2 leads quentes"],
                  ].map(([title, note]) => (
                    <BaseCardV3 key={title} eyebrow="Equipe" title={title} description={note} className="rounded-[26px]" actions={<Users2 className="h-4 w-4 text-primary" />} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-3">
                {[
                  "Lead criado para lua de mel Grecia.",
                  "Viagem confirmada e pagamento vinculado.",
                  "Documento gerado para embarque Roma.",
                  "Tarefa concluida pela operacao premium.",
                  "Alerta financeiro criado na central.",
                ].map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Itens vencidos", "2 pendencias vencidas hoje"],
                    ["Itens criticos", "3 sinais exigem resolucao"],
                    ["Retornos atrasados", "2 clientes aguardam contato"],
                    ["Pagamentos pendentes", "2 recebimentos sensiveis"],
                    ["Checklist incompleto", "1 embarque sem voucher final"],
                    ["Aguardando documento", "2 documentos em revisao"],
                  ].map(([title, note]) => (
                    <BaseCardV3 key={title} eyebrow="Pendencias" title={title} description={note} className="rounded-[26px]" actions={<Siren className="h-4 w-4 text-primary" />} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={operationOpen}
        onOpenChange={setOperationOpen}
        title="Nova operacao"
        description="Fluxo local da V3 para adicionar uma nova frente operacional viva."
        contentClassName="sm:max-w-3xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setOperationOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Salvar localmente" className="rounded-full" onAction={saveOperation} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Titulo da operacao" />
          <Select value={form.module} onValueChange={(value) => setForm((current) => ({ ...current, module: value as OperationModule }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Modulo relacionado" /></SelectTrigger>
            <SelectContent>
              {["Viagens", "Financeiro", "Documentos", "Leads", "Clientes", "Equipe", "Operacional"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.priority} onValueChange={(value) => setForm((current) => ({ ...current, priority: value as PriorityLevel }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              {["Baixa", "Media", "Alta", "Critica"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Responsavel" />
          <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as OperationStatus }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {["Aberto", "Em andamento", "Aguardando", "Concluido", "Atrasado"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="md:col-span-2">
            <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Tags separadas por virgula" />
          </div>
          <div className="md:col-span-2">
            <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-[120px] rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Descricao operacional da frente." />
          </div>
          <div className="md:col-span-2">
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[100px] rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Observacoes adicionais e contexto local." />
          </div>
        </div>
      </BaseModalV3>
    </>
  )
}
