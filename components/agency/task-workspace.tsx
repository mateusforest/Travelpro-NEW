"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DedicatedActionWorkspace,
  type WorkspaceSectionConfig,
  type WorkspaceSelectOption,
} from "@/components/system/dedicated-action-workspace"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { toast } from "@/components/ui/use-toast"
import type { ClientRow, TaskRow, TripRow } from "@/types/database"

const EMPTY_CLIENT = ""
const EMPTY_TRIP = ""

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => null)) as { error?: string } | T | null
  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Nao foi possivel concluir a operacao.")
  }
  return payload as T
}

function toDateInput(value?: string | null) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

function toIsoOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = new Date(`${value.trim()}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Informe uma data vÃ¡lida para a tarefa.")
  }
  return parsed.toISOString()
}

function buildTaskValues(task?: TaskRow): Record<string, string> {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "Alta",
    status: task?.status ?? "Aberta",
    dueAt: toDateInput(task?.due_at),
    clientId: task?.client_id ?? EMPTY_CLIENT,
    tripId: task?.trip_id ?? EMPTY_TRIP,
  }
}

function TaskWorkspaceInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get("id")
  const isEditing = Boolean(taskId)
  const [task, setTask] = useState<TaskRow | null>(null)
  const [clients, setClients] = useState<ClientRow[]>([])
  const [trips, setTrips] = useState<TripRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const [clientsData, tripsData, taskData] = await Promise.all([
          fetchJson<ClientRow[]>("/api/clients"),
          fetchJson<TripRow[]>("/api/trips"),
          taskId ? fetchJson<TaskRow>(`/api/tasks/${taskId}`) : Promise.resolve(null),
        ])
        if (!active) return
        setClients(clientsData)
        setTrips(tripsData)
        setTask(taskData)
      } catch (error) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar a tarefa.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [taskId])

  const clientOptions = useMemo<WorkspaceSelectOption[]>(
    () => [
      { label: "Sem cliente vinculado", value: EMPTY_CLIENT },
      ...clients.map((client) => ({ label: client.name, value: client.id })),
    ],
    [clients],
  )
  const tripOptions = useMemo<WorkspaceSelectOption[]>(
    () => [
      { label: "Sem viagem vinculada", value: EMPTY_TRIP },
      ...trips.map((trip) => ({ label: trip.destination, value: trip.id })),
    ],
    [trips],
  )

  const sections: WorkspaceSectionConfig[] = useMemo(
    () => [
      {
        title: "ConfiguraÃ§Ã£o da tarefa",
        description: "Base real da tarefa operacional conectada a cliente, viagem e prioridade.",
        fields: [
          { key: "title", label: "TÃ­tulo da tarefa" },
          { key: "priority", label: "Prioridade", type: "select", options: ["Baixa", "MÃ©dia", "Alta"] },
          { key: "status", label: "Status", type: "select", options: ["Aberta", "Hoje", "Urgente", "Follow-up", "ConcluÃ­da"] },
          { key: "dueAt", label: "Prazo" },
          { key: "clientId", label: "Cliente", type: "select", options: clientOptions },
          { key: "tripId", label: "Viagem", type: "select", options: tripOptions },
          { key: "description", label: "Contexto operacional", type: "textarea", rows: 5, colSpan: 2 },
        ],
      },
    ],
    [clientOptions, tripOptions],
  )

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando tarefa" description="Sincronizando clientes, viagens e dados reais da tarefa.">
          <div className="space-y-3">
            <div className="h-4 w-48 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
          </div>
        </DashboardCard>
      </PageShell>
    )
  }

  if (loadError) {
    return (
      <PageShell>
        <DashboardCard title="Nao foi possivel abrir a tarefa" description={loadError}>
          <Button className="rounded-full" onClick={() => router.replace("/app/central-operacional/tarefas")}>
            Voltar para tarefas
          </Button>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <DedicatedActionWorkspace
      title={isEditing ? "Editar tarefa operacional" : "Nova tarefa operacional"}
      description="Lance uma tarefa real com responsÃ¡vel contextual, prazo e prioridade conectados Ã  operaÃ§Ã£o."
      backHref="/app/central-operacional/tarefas"
      backLabel="Voltar para tarefas"
      aiActionLabel="LanÃ§ar com IA"
      aiActionDescription="A priorizaÃ§Ã£o automÃ¡tica com IA ainda serÃ¡ integrada a este mÃ³dulo."
      primaryActionLabel={isEditing ? "Salvar tarefa" : "Criar tarefa agora"}
      hideDraftAction
      previewTitle="Resumo da tarefa"
      previewDescription="Leitura rÃ¡pida antes de salvar na central operacional."
      initialValues={buildTaskValues(task ?? undefined)}
      sections={sections}
      renderPreview={(values) => {
        const selectedClient = clients.find((client) => client.id === values.clientId)
        const selectedTrip = trips.find((trip) => trip.id === values.tripId)
        return (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <h2 className="text-xl font-semibold text-foreground">{values.title || "Tarefa sem tÃ­tulo"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{selectedClient?.name || "Sem cliente"} â€¢ {selectedTrip?.destination || "Sem viagem"}</p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              {values.dueAt || "Sem prazo"} â€¢ {values.priority || "Alta"} â€¢ {values.status || "Aberta"}
            </div>
          </div>
        )
      }}
      sidebarInfo={{
        title: "Leitura operacional",
        description: "A tarefa fica salva na base real da agÃªncia.",
        items: [
          { label: "Prioridade", value: (values) => values.priority || "Alta" },
          { label: "Status", value: (values) => values.status || "Aberta" },
          { label: "Prazo", value: (values) => values.dueAt || "NÃ£o informado" },
        ],
      }}
      onPrimaryAction={async (values) => {
        if (!values.title.trim() || values.title.trim().length < 2) {
          throw new Error("Informe um tÃ­tulo vÃ¡lido para a tarefa.")
        }

        const clientId = values.clientId || null
        const tripId = values.tripId || null

        await fetchJson<TaskRow>(isEditing ? `/api/tasks/${taskId}` : "/api/tasks", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            title: values.title.trim(),
            description: values.description.trim() || null,
            priority: values.priority || "Alta",
            status: values.status || "Aberta",
            due_at: toIsoOrNull(values.dueAt),
            client_id: clientId,
            trip_id: tripId,
          }),
        })

        toast({
          title: isEditing ? "Tarefa atualizada" : "Tarefa criada",
          description: isEditing ? "A tarefa foi atualizada na central operacional." : "A tarefa foi criada e jÃ¡ aparece na central.",
        })

        router.replace("/app/central-operacional/tarefas")
        router.refresh()
      }}
    />
  )
}

export function TaskWorkspace() {
  return (
    <Suspense fallback={null}>
      <TaskWorkspaceInner />
    </Suspense>
  )
}
