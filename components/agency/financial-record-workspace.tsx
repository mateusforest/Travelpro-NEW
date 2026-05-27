"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AgencyActionButton } from "@/components/system/agency-action-button"
import {
  DedicatedActionWorkspace,
  type WorkspaceSectionConfig,
  type WorkspaceSelectOption,
} from "@/components/system/dedicated-action-workspace"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { toast } from "@/components/ui/use-toast"
import {
  FINANCE_PLAN_OPTIONS,
  FINANCE_STATUS_OPTIONS,
  FINANCE_TYPE_OPTIONS,
  getFinanceCategoryOptions,
  normalizeFinanceStatus,
  normalizeFinanceType,
  type FinancePlanMode,
} from "@/lib/finance/agency-finance"
import type { ClientRow, FinancialRecordRow, TripRow } from "@/types/database"

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

function buildFinancialValues(record?: FinancialRecordRow): Record<string, string> {
  const nextType = normalizeFinanceType(record?.type)

  return {
    type: nextType,
    status: normalizeFinanceStatus(record?.status),
    clientId: record?.client_id ?? EMPTY_CLIENT,
    tripId: record?.trip_id ?? EMPTY_TRIP,
    category: record?.category ?? getFinanceCategoryOptions(nextType)[0],
    amount: record?.amount != null ? String(record.amount) : "",
    occurredAt: toDateInput(record?.occurred_at),
    description: record?.description ?? "",
    planMode: "Unico",
    installments: "3",
    recurrenceCount: "12",
  }
}

function parseAmount(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Informe um valor numerico valido para o lancamento.")
  }
  return parsed
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
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
        title: "Dados do lancamento",
        description: "Base real do financeiro conectada a cliente, viagem e competencia do registro.",
        fields: [
          { key: "type", label: "Tipo", type: "select", options: [...FINANCE_TYPE_OPTIONS] },
          {
            key: "category",
            label: "Categoria",
            type: "select",
            options: (values) => getFinanceCategoryOptions(values.type || record?.type || "Receita"),
          },
          { key: "amount", label: "Valor" },
          { key: "occurredAt", label: "Data do lancamento/competencia", placeholder: "AAAA-MM-DD" },
          { key: "status", label: "Status", type: "select", options: [...FINANCE_STATUS_OPTIONS] },
          { key: "clientId", label: "Cliente vinculado", type: "select", options: clientOptions },
          { key: "tripId", label: "Viagem vinculada", type: "select", options: tripOptions },
          { key: "description", label: "Descricao", type: "textarea", rows: 5, colSpan: 2 },
        ],
      },
      {
        title: "Planejamento financeiro",
        description: "Escolha se o lancamento e unico, parcelado ou recorrente. Os registros futuros sao criados automaticamente.",
        fields: [
          { key: "planMode", label: "Modo de lancamento", type: "select", options: [...FINANCE_PLAN_OPTIONS], readOnly: isEditing },
          {
            key: "installments",
            label: "Parcelas",
            placeholder: "Ex.: 6",
            hidden: (values) => values.planMode !== "Parcelado" || isEditing,
            description: "O valor total sera dividido em lancamentos mensais com datas futuras.",
          },
          {
            key: "recurrenceCount",
            label: "Repeticoes mensais",
            placeholder: "Ex.: 12",
            hidden: (values) => values.planMode !== "Recorrente mensal" || isEditing,
            description: "Cada repeticao cria um novo lancamento mensal com o mesmo valor.",
          },
        ],
      },
    ],
    [clientOptions, isEditing, record?.type, tripOptions],
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
          <AgencyActionButton actionType="navigate" href="/app/financeiro" className="rounded-full">
            Voltar para financeiro
          </AgencyActionButton>
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
      transformValues={(nextValues, changedKey) => {
        const next = { ...nextValues }

        if (changedKey === "type") {
          const normalizedType = normalizeFinanceType(next.type)
          next.type = normalizedType
          if (!getFinanceCategoryOptions(normalizedType).includes(next.category as never)) {
            next.category = getFinanceCategoryOptions(normalizedType)[0]
          }
          if (normalizedType === "Receita" && next.status === "Pago") {
            next.status = "A receber"
          }
        }

        if (changedKey === "planMode" && next.planMode === "Unico") {
          next.installments = "3"
          next.recurrenceCount = "12"
        }

        return next
      }}
      renderPreview={(values) => {
        const selectedClient = clients.find((client) => client.id === values.clientId)
        const selectedTrip = trips.find((trip) => trip.id === values.tripId)

        return (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.type || "Lancamento"}</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{values.amount ? `R$ ${values.amount}` : "Valor nao informado"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {(selectedClient?.name ?? "Sem cliente vinculado")} - {(selectedTrip?.destination ?? "Sem viagem vinculada")}
            </p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              {values.category ? `${values.category} - ${values.status || "Pendente"}` : values.description || "Descricao ainda nao preenchida."}
            </div>
            {!isEditing && values.planMode !== "Unico" ? (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary/80">
                {values.planMode === "Parcelado"
                  ? `Parcelamento em ${values.installments || "1"}x`
                  : `Recorrencia mensal por ${values.recurrenceCount || "1"} meses`}
              </p>
            ) : null}
          </div>
        )
      }}
      sidebarInfo={{
        title: "Leitura contabil",
        description: "O lancamento fica persistido no Supabase e respeita o isolamento por agencia.",
        items: [
          { label: "Status", value: (values) => values.status || "Pendente" },
          { label: "Categoria", value: (values) => values.category || "Nao definida" },
          { label: "Competencia", value: (values) => values.occurredAt || "Nao informada" },
        ],
      }}
      extraSidebar={
        <div className="grid gap-3">
          <AgencyActionButton
            actionType="future"
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            futureMessage="A conexao automatica com Stripe ainda sera integrada a este modulo."
          >
            Conectar Stripe
          </AgencyActionButton>
          <AgencyActionButton
            actionType="future"
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            futureMessage="Salve o lancamento e use o CTA do modulo financeiro para gerar o relatorio com o recorte atual."
          >
            Gerar relatorio
          </AgencyActionButton>
        </div>
      }
      onPrimaryAction={async (values) => {
        const selectedClientId = values.clientId || null
        const selectedTripId = values.tripId || null
        let occurredAt: string | null = null
        let amount = 0

        if (!values.category.trim()) {
          toast({
            title: "Categoria obrigatoria",
            description: "Selecione uma categoria para o lancamento antes de salvar.",
          })
          return
        }

        if (!values.description.trim()) {
          toast({
            title: "Descricao obrigatoria",
            description: "Descreva o contexto do lancamento antes de salvar.",
          })
          return
        }

        try {
          occurredAt = toIsoOrNull(values.occurredAt)
        } catch (error) {
          toast({
            title: "Data invalida",
            description: error instanceof Error ? error.message : "Informe uma data valida para o lancamento.",
          })
          return
        }

        if (!occurredAt) {
          toast({
            title: "Data obrigatoria",
            description: "Informe a data do lancamento/competencia.",
          })
          return
        }

        try {
          amount = parseAmount(values.amount)
        } catch (error) {
          toast({
            title: "Valor invalido",
            description: error instanceof Error ? error.message : "Informe um valor numerico valido para o lancamento.",
          })
          return
        }

        await fetchJson<FinancialRecordRow | FinancialRecordRow[]>(isEditing ? `/api/financial-records/${recordId}` : "/api/financial-records", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            type: normalizeFinanceType(values.type || "Receita"),
            amount,
            status: normalizeFinanceStatus(values.status || "Pendente"),
            client_id: selectedClientId,
            trip_id: selectedTripId,
            category: values.category.trim(),
            description: values.description.trim(),
            occurred_at: occurredAt,
            ...(isEditing
              ? {}
              : {
                  plan_mode: values.planMode as FinancePlanMode,
                  installments: values.planMode === "Parcelado" ? parsePositiveInt(values.installments, 1) : undefined,
                  recurrence_count: values.planMode === "Recorrente mensal" ? parsePositiveInt(values.recurrenceCount, 1) : undefined,
                }),
          }),
        })

        const successDescription = isEditing
          ? "O lancamento foi atualizado no Supabase."
          : values.planMode === "Parcelado"
            ? `O lancamento foi dividido em ${parsePositiveInt(values.installments, 1)} parcelas futuras.`
            : values.planMode === "Recorrente mensal"
              ? `A recorrencia mensal foi criada para ${parsePositiveInt(values.recurrenceCount, 1)} competencias.`
              : "O lancamento foi salvo no Supabase e ja aparece na listagem."

        toast({
          title: isEditing ? "Lancamento atualizado" : "Lancamento criado",
          description: successDescription,
        })

        router.replace("/app/financeiro")
        router.refresh()
      }}
    />
  )
}
