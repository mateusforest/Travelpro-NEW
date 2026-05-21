"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DedicatedActionWorkspace, type WorkspaceSectionConfig } from "@/components/system/dedicated-action-workspace"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { toast } from "@/components/ui/use-toast"
import type { ClientRow, DocumentRow, TripRow } from "@/types/database"

const EMPTY_CLIENT = "Sem cliente vinculado"
const EMPTY_TRIP = "Sem viagem vinculada"

type DocumentMetadata = {
  template?: string
  variables?: string
  attachments?: string
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

function buildDocumentValues(document?: DocumentRow): Record<string, string> {
  const metadata = document ? parseMetadata(document.metadata) : {}

  return {
    title: document?.title ?? "",
    type: document?.type ?? "Contrato",
    status: document?.status ?? "Rascunho",
    clientId: document?.client_id ? `${document.client_id}` : EMPTY_CLIENT,
    tripId: document?.trip_id ? `${document.trip_id}` : EMPTY_TRIP,
    template: metadata.template ?? "",
    variables: metadata.variables ?? "",
    attachments: metadata.attachments ?? "",
    storageBucket: document?.storage_bucket ?? "",
    storagePath: document?.storage_path ?? "",
  }
}

export function DocumentWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentId = searchParams.get("id")
  const isEditing = Boolean(documentId)
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
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o workspace do documento.")
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
  }, [documentId])

  const clientOptions = useMemo(() => [EMPTY_CLIENT, ...clients.map((client) => `${client.id}::${client.name}`)], [clients])
  const tripOptions = useMemo(() => [EMPTY_TRIP, ...trips.map((trip) => `${trip.id}::${trip.destination}`)], [trips])

  const sections: WorkspaceSectionConfig[] = useMemo(
    () => [
      {
        title: "Base do documento",
        description: "Estruture o documento com os dados reais da agencia, do cliente e da viagem.",
        fields: [
          { key: "title", label: "Titulo do documento" },
          { key: "type", label: "Tipo de documento", type: "select", options: ["Contrato", "Voucher", "Recibo", "Passagem", "Documento geral"] },
          { key: "status", label: "Status", type: "select", options: ["Rascunho", "Em revisao", "Pronto", "Enviado"] },
          { key: "template", label: "Template" },
          { key: "clientId", label: "Cliente", type: "select", options: clientOptions },
          { key: "tripId", label: "Viagem", type: "select", options: tripOptions },
          { key: "storageBucket", label: "Bucket de armazenamento" },
          { key: "storagePath", label: "Caminho do arquivo" },
        ],
      },
      {
        title: "Contexto e vinculacoes",
        description: "Guarde referencias operacionais usando os campos que ja existem.",
        fields: [
          { key: "variables", label: "Dados variaveis", type: "textarea", rows: 4, colSpan: 2 },
          { key: "attachments", label: "Anexos e observacoes", type: "textarea", rows: 4, colSpan: 2 },
        ],
      },
    ],
    [clientOptions, tripOptions],
  )

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando documento" description="Sincronizando clientes, viagens e dados reais do documento.">
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
        <DashboardCard title="Nao foi possivel abrir o documento" description={loadError}>
          <Button className="rounded-full" onClick={() => router.replace("/app/documentos")}>
            Voltar para documentos
          </Button>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <DedicatedActionWorkspace
      title={isEditing ? "Editar documento" : "Novo documento"}
      description="Monte um documento com dados reais, vinculos operacionais e preview pronto para revisao."
      backHref="/app/documentos"
      backLabel="Voltar para documentos"
      aiActionLabel="Gerar com IA"
      aiActionDescription="A geracao automatica com IA ainda esta em planejamento para este modulo. Use o workspace para salvar o documento real."
      primaryActionLabel={isEditing ? "Salvar documento" : "Criar documento agora"}
      draftActionDescription="Salvar rascunho tambem persiste no Supabase com status Rascunho."
      previewActionDescription="O preview avancado com renderizacao do arquivo ainda sera conectado em uma proxima etapa."
      initialValues={buildDocumentValues(document ?? undefined)}
      sections={sections}
      previewTitle="Preview do documento"
      previewDescription="Leitura rapida dos dados reais antes de salvar."
      renderPreview={(values) => {
        const selectedClient = clients.find((client) => `${client.id}::${client.name}` === values.clientId)
        const selectedTrip = trips.find((trip) => `${trip.id}::${trip.destination}` === values.tripId)

        return (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.type || "Documento"}</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{values.title || "Documento sem titulo"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {(selectedClient?.name ?? "Sem cliente vinculado")} • {(selectedTrip?.destination ?? "Sem viagem vinculada")}
            </p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              {values.template ? `Template: ${values.template}` : "Nenhum template definido ainda."}
            </div>
          </div>
        )
      }}
      sidebarInfo={{
        title: "Leitura de geracao",
        description: "O documento fica salvo na base real da agencia sem alterar o schema.",
        items: [
          { label: "Status", value: (values) => values.status || "Rascunho" },
          { label: "Cliente", value: (values) => clients.find((client) => `${client.id}::${client.name}` === values.clientId)?.name || "Sem vinculo" },
          { label: "Viagem", value: (values) => trips.find((trip) => `${trip.id}::${trip.destination}` === values.tripId)?.destination || "Sem vinculo" },
        ],
      }}
      extraSidebar={
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onClick={() => toast({ title: "Templates em breve", description: "O catalogo de templates deste modulo ainda sera conectado ao fluxo oficial." })}
          >
            Usar template
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onClick={() => toast({ title: "Envio em breve", description: "O envio automatizado de documentos ainda sera conectado a este modulo." })}
          >
            Enviar documento
          </Button>
        </div>
      }
      onPrimaryAction={async (values) => {
        const selectedClientId = values.clientId && values.clientId !== EMPTY_CLIENT ? values.clientId.split("::")[0] : null
        const selectedTripId = values.tripId && values.tripId !== EMPTY_TRIP ? values.tripId.split("::")[0] : null

        if (!values.title.trim() || values.title.trim().length < 2) {
          throw new Error("Informe um titulo valido para o documento antes de salvar.")
        }

        await fetchJson<DocumentRow>(isEditing ? `/api/documents/${documentId}` : "/api/documents", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            title: values.title.trim(),
            type: values.type || "Documento geral",
            status: values.status || "Rascunho",
            client_id: selectedClientId,
            trip_id: selectedTripId,
            storage_bucket: values.storageBucket.trim() || null,
            storage_path: values.storagePath.trim() || null,
            metadata: {
              template: values.template.trim(),
              variables: values.variables.trim(),
              attachments: values.attachments.trim(),
            },
          }),
        })

        toast({
          title: isEditing ? "Documento atualizado" : "Documento criado",
          description: isEditing ? "O documento foi atualizado no Supabase." : "O documento foi salvo no Supabase e ja aparece na listagem.",
        })

        router.replace("/app/documentos")
        router.refresh()
      }}
      onDraftAction={async (values) => {
        const selectedClientId = values.clientId && values.clientId !== EMPTY_CLIENT ? values.clientId.split("::")[0] : null
        const selectedTripId = values.tripId && values.tripId !== EMPTY_TRIP ? values.tripId.split("::")[0] : null

        if (!values.title.trim() || values.title.trim().length < 2) {
          throw new Error("Defina ao menos um titulo valido para salvar o rascunho.")
        }

        await fetchJson<DocumentRow>(isEditing ? `/api/documents/${documentId}` : "/api/documents", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            title: values.title.trim(),
            type: values.type || "Documento geral",
            status: "Rascunho",
            client_id: selectedClientId,
            trip_id: selectedTripId,
            storage_bucket: values.storageBucket.trim() || null,
            storage_path: values.storagePath.trim() || null,
            metadata: {
              template: values.template.trim(),
              variables: values.variables.trim(),
              attachments: values.attachments.trim(),
            },
          }),
        })

        toast({
          title: "Rascunho salvo",
          description: "O documento foi salvo como rascunho no Supabase.",
        })

        router.replace("/app/documentos")
        router.refresh()
      }}
    />
  )
}
