"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DedicatedActionWorkspace, type WorkspaceSectionConfig } from "@/components/system/dedicated-action-workspace"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { toast } from "@/components/ui/use-toast"
import type { ClientRow, FinancialRecordRow, TripRow } from "@/types/database"

const EMPTY_CLIENT = "Sem cliente vinculado"
const EMPTY_TRIP = "Sem viagem vinculada"

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

function buildFinancialValues(record?: FinancialRecordRow): Record<string, string> {
  return {
    type: record?.type ?? "Receita",
    status: record?.status ?? "Pendente",
    clientId: record?.client_id ? `${record.client_id}` : EMPTY_CLIENT,
    tripId: record?.trip_id ? `${record.trip_id}` : EMPTY_TRIP,
    category: record?.category ?? "",
    amount: record?.amount != null ? String(record.amount) : "",
    occurredAt: toDateInput(record?.occurred_at),
    description: record?.description ?? "",
  }
}

function parseAmount(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) {
    throw new Error("Informe um valor numerico valido para o lancamento.")
  }
  return parsed
}

function toIsoOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = new Date(`${value.trim()}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Informe uma data valida para o lancamento.")
  }
  return parsed.toISOString()
}

export function FinancialRecordWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get("id")
  const isEditing = Boolean(recordId)
  const [clients, setClients] = useState<ClientRow[]>([])
  const [trips, setTrips] = useState<TripRow[]>([])
  const [record, setRecord] = useState<FinancialRecordRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadWorkspace = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        const [clientsData, tripsData, recordData] = await Promise.all([
          fetchJson<ClientRow[]>("/api/clients"),
          fetchJson<TripRow[]>("/api/trips"),
          recordId ? fetchJson<FinancialRecordRow>(`/api/financial-records/${recordId}`) : Promise.resolve(null),
        ])

        if (!active) return
        setClients(clientsData)
        setTrips(tripsData)
        setRecord(recordData)
      } catch (error) {
        if (!active) return
        if (process.env.NODE_ENV !== "production") {
          console.error("[FinancialRecordWorkspace] failed to load workspace", error)
        }
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o workspace financeiro.")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadWorkspace()

    return () => {
      active = false
    }
  }, [recordId])

  const clientOptions = useMemo(() => [EMPTY_CLIENT, ...clients.map((client) => `${client.id}::${client.name}`)], [clients])
  const tripOptions = useMemo(() => [EMPTY_TRIP, ...trips.map((trip) => `${trip.id}::${trip.destination}`)], [trips])

  const sections: WorkspaceSectionConfig[] = useMemo(
    () => [
      {
        title: "Dados do lancamento",
        description: "Base real do financeiro conectada a cliente, viagem e periodo.",
        fields: [
          { key: "type", label: "Tipo", type: "select", options: ["Receita", "Despesa"] },
          { key: "status", label: "Status", type: "select", options: ["Pendente", "Pago", "A receber", "Cancelado"] },
          { key: "clientId", label: "Cliente", type: "select", options: clientOptions },
          { key: "tripId", label: "Viagem", type: "select", options: tripOptions },
          { key: "category", label: "Categoria" },
          { key: "amount", label: "Valor" },
          { key: "occurredAt", label: "Data do lancamento" },
          { key: "description", label: "Descricao", type: "textarea", rows: 5, colSpan: 2 },
        ],
      },
    ],
    [clientOptions, tripOptions],
  )

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando financeiro" description="Sincronizando clientes, viagens e dados reais do lancamento.">
          <div className="space-y-3">
            <div className="h-4 w-48 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
            <div className="h-24 animate-pulse rounded-[24px] bg-white/[0.03]" />
          </div>
        </DashboardCard>
      </PageShell>
    )
  }

  if (loadError) {
    return (
      <PageShell>
        <DashboardCard title="Nao foi possivel abrir o lancamento" description={loadError}>
          <Button className="rounded-full" onClick={() => router.replace("/app/financeiro")}>
            Voltar para financeiro
          </Button>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <DedicatedActionWorkspace
      title={isEditing ? "Editar lancamento" : "Novo lancamento"}
      description="Registre receitas e despesas com dados reais, contexto operacional e leitura pronta para o modulo."
      backHref="/app/financeiro"
      backLabel="Voltar para financeiro"
      aiActionLabel="Analisar com IA"
      aiActionDescription="A categorizacao automatica com IA ainda esta em planejamento para este modulo."
      primaryActionLabel={isEditing ? "Salvar lancamento" : "Criar lancamento agora"}
      hideDraftAction
      previewActionDescription="O preview contabil detalhado ainda sera expandido em uma proxima etapa."
      initialValues={buildFinancialValues(record ?? undefined)}
      sections={sections}
      previewTitle="Resumo financeiro"
      previewDescription="Leitura rapida do lancamento antes de salvar."
      renderPreview={(values) => {
        const selectedClient = clients.find((client) => `${client.id}::${client.name}` === values.clientId)
        const selectedTrip = trips.find((trip) => `${trip.id}::${trip.destination}` === values.tripId)

        return (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.type || "Lancamento"}</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{values.amount ? `R$ ${values.amount}` : "Valor nao informado"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {(selectedClient?.name ?? "Sem cliente vinculado")} • {(selectedTrip?.destination ?? "Sem viagem vinculada")}
            </p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              {values.category ? `${values.category} • ${values.status || "Pendente"}` : values.description || "Descricao ainda nao preenchida."}
            </div>
          </div>
        )
      }}
      sidebarInfo={{
        title: "Leitura contabil",
        description: "O lancamento fica persistido no Supabase e respeita o isolamento por agencia.",
        items: [
          { label: "Status", value: (values) => values.status || "Pendente" },
          { label: "Categoria", value: (values) => values.category || "Nao definida" },
          { label: "Data", value: (values) => values.occurredAt || "Nao informada" },
        ],
      }}
      extraSidebar={
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onClick={() => toast({ title: "Stripe em breve", description: "A conexao automatica com Stripe ainda sera integrada a este modulo." })}
          >
            Conectar Stripe
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onClick={() => toast({ title: "Relatorios em breve", description: "A geracao automatica de relatorios ainda sera conectada ao financeiro." })}
          >
            Gerar relatorio
          </Button>
        </div>
      }
      onPrimaryAction={async (values) => {
        const selectedClientId = values.clientId && values.clientId !== EMPTY_CLIENT ? values.clientId.split("::")[0] : null
        const selectedTripId = values.tripId && values.tripId !== EMPTY_TRIP ? values.tripId.split("::")[0] : null

        await fetchJson<FinancialRecordRow>(isEditing ? `/api/financial-records/${recordId}` : "/api/financial-records", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            type: values.type || "Receita",
            amount: parseAmount(values.amount),
            status: values.status || "Pendente",
            client_id: selectedClientId,
            trip_id: selectedTripId,
            category: values.category.trim() || null,
            description: values.description.trim() || null,
            occurred_at: toIsoOrNull(values.occurredAt),
          }),
        })

        toast({
          title: isEditing ? "Lancamento atualizado" : "Lancamento criado",
          description: isEditing ? "O lancamento foi atualizado no Supabase." : "O lancamento foi salvo no Supabase e ja aparece na listagem.",
        })

        router.replace("/app/financeiro")
        router.refresh()
      }}
    />
  )
}
