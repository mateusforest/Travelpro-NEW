"use client"

import { useEffect, useMemo, useState } from "react"
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
import type { ClientRow, DocumentRow, TripRow } from "@/types/database"

const EMPTY_CLIENT = ""
const EMPTY_TRIP = ""

type DocumentWorkspaceMode = "document" | "roteiro" | "cotacao" | "template"

type DocumentMetadata = {
  template?: string
  variables?: string
  attachments?: string
}

type DocumentWorkspaceProps = {
  mode?: DocumentWorkspaceMode
}

const modeConfig: Record<
  DocumentWorkspaceMode,
  {
    title: string
    description: string
    backHref: string
    backLabel: string
    primaryActionLabel: string
    aiLabel: string
    aiDescription: string
    fixedType: string
    statusOptions: string[]
    templateLabel: string
    variablesLabel: string
    attachmentsLabel: string
    templateDescription?: string
    variablesDescription?: string
    attachmentsDescription?: string
  }
> = {
  document: {
    title: "Novo documento",
    description: "Monte um documento com dados reais, vÃ­nculos operacionais e preview pronto para revisÃ£o.",
    backHref: "/app/documentos",
    backLabel: "Voltar para documentos",
    primaryActionLabel: "Criar documento agora",
    aiLabel: "Gerar com IA",
    aiDescription: "A geraÃ§Ã£o automÃ¡tica com IA ainda estÃ¡ em planejamento para este mÃ³dulo. Use o workspace para salvar o documento real.",
    fixedType: "Documento geral",
    statusOptions: ["Rascunho", "Em revisao", "Pronto", "Enviado"],
    templateLabel: "Template",
    variablesLabel: "Dados variÃ¡veis",
    attachmentsLabel: "Anexos e observaÃ§Ãµes",
  },
  roteiro: {
    title: "Novo roteiro",
    description: "Monte um roteiro manual real com vÃ­nculo de cliente, viagem e estrutura pronta para compartilhar.",
    backHref: "/app/viagens/roteiros",
    backLabel: "Voltar para roteiros",
    primaryActionLabel: "Salvar roteiro",
    aiLabel: "Gerar roteiro com IA",
    aiDescription: "A IA futura poderÃ¡ montar dias, experiÃªncias e narrativa. Nesta fase, o roteiro manual jÃ¡ fica salvo na base real.",
    fixedType: "Roteiro",
    statusOptions: ["Rascunho", "Em elaboracao", "Pronto", "Enviado"],
    templateLabel: "Estilo ou template",
    variablesLabel: "Estrutura do roteiro",
    attachmentsLabel: "ObservaÃ§Ãµes internas",
    variablesDescription: "Descreva os dias, blocos ou experiÃªncias principais do roteiro.",
    attachmentsDescription: "Use para anotaÃ§Ãµes operacionais, links ou detalhes de exportaÃ§Ã£o futura.",
  },
  cotacao: {
    title: "Nova cotaÃ§Ã£o",
    description: "Crie uma proposta comercial real com cliente, viagem, status e histÃ³rico interno.",
    backHref: "/app/viagens/cotacoes",
    backLabel: "Voltar para cotaÃ§Ãµes",
    primaryActionLabel: "Salvar cotaÃ§Ã£o",
    aiLabel: "Gerar cotaÃ§Ã£o com IA",
    aiDescription: "A geraÃ§Ã£o assistida com IA ficarÃ¡ para a prÃ³xima fase. Agora a proposta jÃ¡ fica registrada com dados reais.",
    fixedType: "CotaÃ§Ã£o",
    statusOptions: ["Rascunho", "Enviada", "Pendente", "Aprovada", "Rejeitada"],
    templateLabel: "Modelo de proposta",
    variablesLabel: "Inclusos, proposta e valor",
    attachmentsLabel: "ExclusÃµes, validade e histÃ³rico",
    variablesDescription: "Resumo comercial, valor, inclusos e diferenciais da proposta.",
    attachmentsDescription: "Validade, ajustes pedidos pelo cliente e histÃ³rico da negociaÃ§Ã£o.",
  },
  template: {
    title: "Novo template",
    description: "Monte uma base operacional reutilizÃ¡vel para documentos, roteiros ou relatÃ³rios.",
    backHref: "/app/documentos/templates",
    backLabel: "Voltar para templates",
    primaryActionLabel: "Salvar template",
    aiLabel: "Montar com IA",
    aiDescription: "A criaÃ§Ã£o inteligente de templates continua futura. Este fluxo salva a biblioteca operacional real.",
    fixedType: "Template",
    statusOptions: ["Ativo", "Inativo", "Rascunho"],
    templateLabel: "Categoria do template",
    variablesLabel: "Estrutura base",
    attachmentsLabel: "MÃ³dulos e observaÃ§Ãµes",
    variablesDescription: "Defina blocos, campos e estrutura que servirÃ£o como base reutilizÃ¡vel.",
    attachmentsDescription: "Indique mÃ³dulos compatÃ­veis e observaÃ§Ãµes operacionais.",
  },
}

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

function parseMetadata(value: DocumentRow["metadata"]): DocumentMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const source = value as Record<string, unknown>

  return {
    template: typeof source.template === "string" ? source.template : "",
    variables: typeof source.variables === "string" ? source.variables : "",
    attachments: typeof source.attachments === "string" ? source.attachments : "",
  }
}

function resolveMode(searchParams: URLSearchParams, forcedMode?: DocumentWorkspaceMode): DocumentWorkspaceMode {
  if (forcedMode) return forcedMode
  const candidate = searchParams.get("mode")
  if (candidate === "roteiro" || candidate === "cotacao" || candidate === "template") return candidate
  return "document"
}

function buildDocumentValues(document: DocumentRow | undefined, mode: DocumentWorkspaceMode, searchParams: URLSearchParams): Record<string, string> {
  const metadata = document ? parseMetadata(document.metadata) : {}
  const config = modeConfig[mode]

  return {
    title: document?.title ?? "",
    type: document?.type ?? config.fixedType,
    status: document?.status ?? config.statusOptions[0],
    clientId: document?.client_id ?? EMPTY_CLIENT,
    tripId: document?.trip_id ?? EMPTY_TRIP,
    template: metadata.template ?? searchParams.get("template") ?? "",
    variables: metadata.variables ?? "",
    attachments: metadata.attachments ?? "",
    storageBucket: document?.storage_bucket ?? "",
    storagePath: document?.storage_path ?? "",
  }
}

export function DocumentWorkspace({ mode: forcedMode }: DocumentWorkspaceProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentId = searchParams.get("id")
  const isEditing = Boolean(documentId)
  const mode = resolveMode(searchParams, forcedMode)
  const config = modeConfig[mode]

  const [clients, setClients] = useState<ClientRow[]>([])
  const [trips, setTrips] = useState<TripRow[]>([])
  const [document, setDocument] = useState<DocumentRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadWorkspace = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        const [clientsData, tripsData, documentData] = await Promise.all([
          fetchJson<ClientRow[]>("/api/clients"),
          fetchJson<TripRow[]>("/api/trips"),
          documentId ? fetchJson<DocumentRow>(`/api/documents/${documentId}`) : Promise.resolve(null),
        ])

        if (!active) return
        setClients(clientsData)
        setTrips(tripsData)
        setDocument(documentData)
      } catch (error) {
        if (!active) return
        if (process.env.NODE_ENV !== "production") {
          console.error("[DocumentWorkspace] failed to load workspace", error)
        }
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o workspace.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadWorkspace()
    return () => {
      active = false
    }
  }, [documentId])

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
        title: mode === "document" ? "Base do documento" : mode === "roteiro" ? "Base do roteiro" : mode === "cotacao" ? "Base da proposta" : "Base do template",
        description: "Estruture o registro com dados reais da agÃªncia, do cliente e da viagem.",
        fields: [
          { key: "title", label: mode === "template" ? "Nome do template" : mode === "roteiro" ? "Nome do roteiro" : mode === "cotacao" ? "Nome da cotaÃ§Ã£o" : "TÃ­tulo do documento" },
          ...(mode === "document"
            ? [{ key: "type", label: "Tipo de documento", type: "select" as const, options: ["Contrato", "Voucher", "Recibo", "Passagem", "Documento geral"] }]
            : []),
          { key: "status", label: "Status", type: "select", options: config.statusOptions },
          { key: "template", label: config.templateLabel, description: config.templateDescription },
          { key: "clientId", label: "Cliente", type: "select", options: clientOptions, hidden: () => mode === "template" },
          { key: "tripId", label: "Viagem", type: "select", options: tripOptions, hidden: () => mode === "template" },
          { key: "storageBucket", label: "Bucket de armazenamento", hidden: () => mode === "template" },
          { key: "storagePath", label: mode === "cotacao" ? "Arquivo ou proposta vinculada" : "Caminho do arquivo", hidden: () => mode === "template" },
        ],
      },
      {
        title: mode === "template" ? "Estrutura reutilizÃ¡vel" : "Contexto e conteÃºdo",
        description: "Guarde estrutura, observaÃ§Ãµes e referÃªncias usando os campos que jÃ¡ existem.",
        fields: [
          { key: "variables", label: config.variablesLabel, type: "textarea", rows: 5, colSpan: 2, description: config.variablesDescription },
          { key: "attachments", label: config.attachmentsLabel, type: "textarea", rows: 4, colSpan: 2, description: config.attachmentsDescription },
        ],
      },
    ],
    [clientOptions, config.attachmentsDescription, config.attachmentsLabel, config.statusOptions, config.templateDescription, config.templateLabel, config.variablesDescription, config.variablesLabel, mode, tripOptions],
  )

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando workspace" description="Sincronizando clientes, viagens e dados reais do registro.">
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
        <DashboardCard title="Nao foi possivel abrir o workspace" description={loadError}>
          <Button className="rounded-full" onClick={() => router.replace(config.backHref)}>
            {config.backLabel}
          </Button>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <DedicatedActionWorkspace
      title={isEditing ? config.title.replace("Novo", "Editar").replace("Nova", "Editar") : config.title}
      description={config.description}
      backHref={config.backHref}
      backLabel={config.backLabel}
      aiActionLabel={config.aiLabel}
      aiActionDescription={config.aiDescription}
      primaryActionLabel={isEditing ? config.primaryActionLabel.replace("Criar", "Salvar").replace("Salvar", "Salvar") : config.primaryActionLabel}
      draftActionDescription="Salvar rascunho tambÃ©m persiste no Supabase com status inicial."
      previewActionDescription="O preview avanÃ§ado deste conteÃºdo serÃ¡ expandido em uma prÃ³xima etapa."
      initialValues={buildDocumentValues(document ?? undefined, mode, searchParams)}
      sections={sections}
      previewTitle={mode === "template" ? "Preview do template" : mode === "roteiro" ? "Preview do roteiro" : mode === "cotacao" ? "Preview da cotaÃ§Ã£o" : "Preview do documento"}
      previewDescription="Leitura rÃ¡pida dos dados reais antes de salvar."
      renderPreview={(values) => {
        const selectedClient = clients.find((client) => client.id === values.clientId)
        const selectedTrip = trips.find((trip) => trip.id === values.tripId)

        return (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.type || config.fixedType}</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{values.title || "Registro sem tÃ­tulo"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "template"
                ? values.status || "Rascunho"
                : `${selectedClient?.name ?? "Sem cliente vinculado"} â€¢ ${selectedTrip?.destination ?? "Sem viagem vinculada"}`}
            </p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              {values.variables || values.template || "Estrutura ainda nÃ£o preenchida."}
            </div>
          </div>
        )
      }}
      sidebarInfo={{
        title: "Leitura operacional",
        description: "O conteÃºdo fica salvo na base real da agÃªncia sem alterar o schema.",
        items: [
          { label: "Status", value: (values) => values.status || config.statusOptions[0] },
          { label: mode === "template" ? "Categoria" : "Cliente", value: (values) => mode === "template" ? values.template || "Sem categoria" : clients.find((client) => client.id === values.clientId)?.name || "Sem vÃ­nculo" },
          { label: mode === "template" ? "Tipo" : "Viagem", value: (values) => mode === "template" ? values.type || config.fixedType : trips.find((trip) => trip.id === values.tripId)?.destination || "Sem vÃ­nculo" },
        ],
      }}
      extraSidebar={
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onClick={() =>
              toast({
                title: mode === "template" ? "Biblioteca em foco" : "Template em breve",
                description:
                  mode === "template"
                    ? "A biblioteca oficial jÃ¡ estÃ¡ sendo consolidada com esta base operacional."
                    : "O uso guiado de templates serÃ¡ expandido a partir desta base real em uma prÃ³xima etapa.",
              })
            }
          >
            {mode === "template" ? "Ver biblioteca" : "Usar template"}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onClick={() =>
              toast({
                title: "ExportaÃ§Ã£o em breve",
                description:
                  mode === "cotacao"
                    ? "A proposta avanÃ§ada com layout premium serÃ¡ evoluÃ­da sobre esta cotaÃ§Ã£o real."
                    : mode === "roteiro"
                      ? "A exportaÃ§Ã£o premium do roteiro serÃ¡ conectada a partir deste registro real."
                      : "O envio automatizado deste conteÃºdo serÃ¡ conectado a uma prÃ³xima etapa.",
              })
            }
          >
            {mode === "cotacao" ? "Gerar proposta" : mode === "roteiro" ? "Baixar roteiro" : "Enviar conteÃºdo"}
          </Button>
        </div>
      }
      onPrimaryAction={async (values) => {
        const selectedClientId = values.clientId || null
        const selectedTripId = values.tripId || null

        if (!values.title.trim() || values.title.trim().length < 2) {
          throw new Error("Informe um tÃ­tulo vÃ¡lido antes de salvar.")
        }

        await fetchJson<DocumentRow>(isEditing ? `/api/documents/${documentId}` : "/api/documents", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            title: values.title.trim(),
            type: mode === "document" ? values.type || config.fixedType : config.fixedType,
            status: values.status || config.statusOptions[0],
            client_id: mode === "template" ? null : selectedClientId,
            trip_id: mode === "template" ? null : selectedTripId,
            storage_bucket: mode === "template" ? null : values.storageBucket.trim() || null,
            storage_path: mode === "template" ? null : values.storagePath.trim() || null,
            metadata: {
              template: values.template.trim(),
              variables: values.variables.trim(),
              attachments: values.attachments.trim(),
            },
          }),
        })

        toast({
          title: isEditing ? "Registro atualizado" : "Registro criado",
          description: `${mode === "roteiro" ? "O roteiro" : mode === "cotacao" ? "A cotaÃ§Ã£o" : mode === "template" ? "O template" : "O documento"} foi salvo no Supabase.`,
        })

        router.replace(config.backHref)
        router.refresh()
      }}
      onDraftAction={async (values) => {
        const selectedClientId = values.clientId || null
        const selectedTripId = values.tripId || null

        if (!values.title.trim() || values.title.trim().length < 2) {
          throw new Error("Defina ao menos um tÃ­tulo vÃ¡lido para salvar o rascunho.")
        }

        await fetchJson<DocumentRow>(isEditing ? `/api/documents/${documentId}` : "/api/documents", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            title: values.title.trim(),
            type: mode === "document" ? values.type || config.fixedType : config.fixedType,
            status: "Rascunho",
            client_id: mode === "template" ? null : selectedClientId,
            trip_id: mode === "template" ? null : selectedTripId,
            storage_bucket: mode === "template" ? null : values.storageBucket.trim() || null,
            storage_path: mode === "template" ? null : values.storagePath.trim() || null,
            metadata: {
              template: values.template.trim(),
              variables: values.variables.trim(),
              attachments: values.attachments.trim(),
            },
          }),
        })

        toast({
          title: "Rascunho salvo",
          description: "O registro foi salvo como rascunho no Supabase.",
        })

        router.replace(config.backHref)
        router.refresh()
      }}
    />
  )
}
